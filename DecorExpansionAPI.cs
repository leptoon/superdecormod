using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using BepInEx;
using HarmonyLib;
using MyBox;
using SupermarketDecorMod1.Data;
using SupermarketDecorMod1.Utilities;
using SupermarketDecorMod1.Components;
using SupermarketDecorMod1.Configuration;
using System.Security.Cryptography;
using System.Text;

namespace SupermarketDecorMod1.API
{
    /// <summary>
    /// Public API for expansion packs to interact with the base Decor Mod
    /// This provides a stable interface that expansion packs can rely on
    /// </summary>
    public static class DecorExpansionAPI
    {
        // Version of the API - increment when making breaking changes
        public const string API_VERSION = "1.1.0"; // Updated for deterministic IDs
        public const string BASE_MOD_GUID = "com.leptoon.supermarketdecomod1";

        // Registry for expansion packs
        private static readonly Dictionary<string, ExpansionPackInfo> registeredExpansions = new Dictionary<string, ExpansionPackInfo>();

        // Item registry by expansion pack
        private static readonly Dictionary<string, List<DecorItemData>> expansionItems = new Dictionary<string, List<DecorItemData>>();

        // Internal name to ID mapping - now includes pack ID for uniqueness
        private static readonly Dictionary<string, int> internalNameToId = new Dictionary<string, int>();

        // Track used IDs to handle collisions
        private static readonly HashSet<int> usedIds = new HashSet<int>();

        // Pending items waiting for IDManager initialization
        private static readonly Dictionary<string, List<DecorItemData>> pendingItems = new Dictionary<string, List<DecorItemData>>();

        // Flag to track if we've initialized with IDManager
        private static bool isIDManagerInitialized = false;

        #region Deterministic ID Generation

        /// <summary>
        /// Generate a deterministic ID based on pack ID and item internal name
        /// This ensures the same item always gets the same ID
        /// </summary>
        private static int GenerateDeterministicId(string packId, string itemInternalName)
        {
            // Combine pack ID and item name for unique identifier
            string uniqueIdentifier = $"{packId}:{itemInternalName}";

            using (var md5 = MD5.Create())
            {
                byte[] hashBytes = md5.ComputeHash(Encoding.UTF8.GetBytes(uniqueIdentifier));

                // Convert first 4 bytes to int
                int hash = BitConverter.ToInt32(hashBytes, 0);

                // Map to expansion ID range (760000-999999)
                int rangeSize = 999999 - 760000;
                int baseId = 760000 + Math.Abs(hash % rangeSize);

                // Handle collisions by incrementing
                int finalId = baseId;
                int attempts = 0;
                while (usedIds.Contains(finalId) && attempts < 1000)
                {
                    finalId = 760000 + Math.Abs((hash + attempts) % rangeSize);
                    attempts++;
                }

                if (attempts >= 1000)
                {
                    LogError($"Could not find available ID for {uniqueIdentifier} after 1000 attempts");
                    return -1;
                }

                return finalId;
            }
        }

        #endregion

        #region Expansion Pack Registration

        /// <summary>
        /// Register an expansion pack with the base mod
        /// </summary>
        public static bool RegisterExpansionPack(string packId, string packName, string packVersion, string author = "", string[] dependencies = null)
        {
            try
            {
                if (string.IsNullOrEmpty(packId))
                {
                    LogError("Cannot register expansion pack with empty ID");
                    return false;
                }

                if (registeredExpansions.ContainsKey(packId))
                {
                    LogWarning($"Expansion pack '{packId}' is already registered");
                    return false;
                }

                // Check if base mod is loaded
                if (!IsBaseModReady())
                {
                    LogError($"Base mod not ready - cannot register expansion pack '{packId}'");
                    return false;
                }

                var packInfo = new ExpansionPackInfo
                {
                    PackId = packId,
                    PackName = packName,
                    PackVersion = packVersion,
                    Author = author,
                    Dependencies = dependencies ?? new string[0],
                    IsEnabled = true,
                    RegisteredItems = new List<int>()
                };

                registeredExpansions[packId] = packInfo;
                expansionItems[packId] = new List<DecorItemData>();
                pendingItems[packId] = new List<DecorItemData>();

                // Initialize configuration for this pack
                ConfigurationManager.InitializeExpansionConfig(packId);

                LogInfo($"Expansion pack registered: {packName} [{packId}]");

                // Notify the base mod about the new expansion
                DecorMod1Plugin.Instance?.OnExpansionPackRegistered(packInfo);

                // Try to process any pending items if IDManager is ready
                TryProcessPendingItems();

                return true;
            }
            catch (Exception ex)
            {
                LogError($"Failed to register expansion pack '{packId}': {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Check if an expansion pack is registered
        /// </summary>
        public static bool IsExpansionPackRegistered(string packId)
        {
            return registeredExpansions.ContainsKey(packId);
        }

        /// <summary>
        /// Check if all dependencies are satisfied for an expansion pack
        /// </summary>
        public static bool CheckDependencies(string packId)
        {
            if (!registeredExpansions.TryGetValue(packId, out var packInfo))
                return false;

            foreach (var dependency in packInfo.Dependencies)
            {
                if (!IsExpansionPackRegistered(dependency))
                {
                    LogError($"Missing dependency '{dependency}' for pack '{packId}'");
                    return false;
                }
            }

            return true;
        }

        #endregion

        #region Item Registration

        /// <summary>
        /// Register a decor item from an expansion pack
        /// </summary>
        public static int RegisterDecorItem(string packId, DecorItemData itemData)
        {
            try
            {
                if (!IsExpansionPackRegistered(packId))
                {
                    LogError($"Cannot register item - expansion pack '{packId}' not registered");
                    return -1;
                }

                if (!registeredExpansions[packId].IsEnabled)
                {
                    LogWarning($"Expansion pack '{packId}' is disabled");
                    return -1;
                }

                if (!CheckDependencies(packId))
                {
                    LogError($"Cannot register item - dependencies not satisfied for pack '{packId}'");
                    return -1;
                }

                // Validate item data
                if (itemData == null)
                {
                    LogError("Cannot register null item data");
                    return -1;
                }

                if (string.IsNullOrEmpty(itemData.InternalName))
                {
                    LogError("Item must have an internal name");
                    return -1;
                }

                // Create unique key that includes pack ID
                string itemKey = $"{packId}:{itemData.InternalName}";

                // Check if this exact item was already registered
                if (internalNameToId.ContainsKey(itemKey))
                {
                    LogWarning($"Item '{itemData.InternalName}' from pack '{packId}' is already registered");
                    return internalNameToId[itemKey];
                }

                // Generate deterministic ID
                int assignedId = GenerateDeterministicId(packId, itemData.InternalName);
                if (assignedId == -1)
                {
                    LogError($"Failed to generate ID for item '{itemData.InternalName}'");
                    return -1;
                }

                // Reserve the ID
                usedIds.Add(assignedId);
                itemData.FurnitureID = assignedId;

                // Track the internal name immediately with pack-specific key
                internalNameToId[itemKey] = assignedId;

                // Add to pending items if IDManager is not ready
                if (!IsIDManagerReady())
                {
                    pendingItems[packId].Add(itemData);
                    LogInfo($"Item '{itemData.ItemName}' queued for registration (ID: {assignedId})");
                    return assignedId;
                }

                // Register the item immediately if IDManager is ready
                bool success = RegisterItemInternal(itemData, packId);

                if (success)
                {
                    // Track this item
                    registeredExpansions[packId].RegisteredItems.Add(assignedId);
                    expansionItems[packId].Add(itemData);

                    LogInfo($"Registered item '{itemData.ItemName}' (ID: {assignedId}) from pack '{packId}'");
                    return assignedId;
                }

                // If registration failed, remove the reserved ID
                usedIds.Remove(assignedId);
                internalNameToId.Remove(itemKey);

                return -1;
            }
            catch (Exception ex)
            {
                LogError($"Failed to register decor item: {ex.Message}");
                return -1;
            }
        }

        /// <summary>
        /// Register multiple items at once
        /// </summary>
        public static List<int> RegisterDecorItems(string packId, List<DecorItemData> items)
        {
            var registeredIds = new List<int>();

            foreach (var item in items)
            {
                int id = RegisterDecorItem(packId, item);
                if (id > 0)
                {
                    registeredIds.Add(id);
                }
            }

            return registeredIds;
        }

        /// <summary>
        /// Get an item by internal name (updated to search by pack-specific key)
        /// </summary>
        public static DecorItemData GetDecorItem(string internalName)
        {
            // First try to find by global internal name (backward compatibility)
            foreach (var packId in expansionItems.Keys)
            {
                string itemKey = $"{packId}:{internalName}";
                if (internalNameToId.TryGetValue(itemKey, out int id))
                {
                    var item = expansionItems[packId].FirstOrDefault(i => i.FurnitureID == id);
                    if (item != null)
                        return item;

                    // Check pending items too
                    item = pendingItems[packId].FirstOrDefault(i => i.FurnitureID == id);
                    if (item != null)
                        return item;
                }
            }

            return null;
        }

        /// <summary>
        /// Get an item by pack ID and internal name
        /// </summary>
        public static DecorItemData GetDecorItem(string packId, string internalName)
        {
            string itemKey = $"{packId}:{internalName}";

            if (!internalNameToId.TryGetValue(itemKey, out int id))
                return null;

            if (expansionItems.TryGetValue(packId, out var packItems))
            {
                var item = packItems.FirstOrDefault(i => i.FurnitureID == id);
                if (item != null)
                    return item;
            }

            // Check pending items too
            if (pendingItems.TryGetValue(packId, out var pendingPackItems))
            {
                var item = pendingPackItems.FirstOrDefault(i => i.FurnitureID == id);
                if (item != null)
                    return item;
            }

            return null;
        }

        #endregion

        #region Asset Management

        /// <summary>
        /// Register custom assets for an expansion pack
        /// </summary>
        public static bool RegisterAssets(string packId, string assetBundlePath)
        {
            try
            {
                if (!IsExpansionPackRegistered(packId))
                {
                    LogError($"Cannot register assets - expansion pack '{packId}' not registered");
                    return false;
                }

                // Load the asset bundle
                var assetBundle = AssetBundle.LoadFromFile(assetBundlePath);
                if (assetBundle == null)
                {
                    LogError($"Failed to load asset bundle from: {assetBundlePath}");
                    return false;
                }

                // Store the asset bundle reference
                AssetManager.RegisterExpansionAssets(packId, assetBundle);

                LogInfo($"Registered asset bundle for pack '{packId}'");
                return true;
            }
            catch (Exception ex)
            {
                LogError($"Failed to register assets: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Register an asset bundle directly
        /// </summary>
        public static void RegisterAssetBundle(string packId, AssetBundle bundle)
        {
            if (!registeredExpansions.ContainsKey(packId))
            {
                LogError($"Expansion pack '{packId}' is not registered");
                return;
            }

            AssetManager.RegisterExpansionAssets(packId, bundle);
            LogInfo($"Registered asset bundle for pack '{packId}'");
        }

        /// <summary>
        /// Load a texture asset from an expansion pack
        /// </summary>
        public static Texture2D LoadTexture(string packId, string textureName)
        {
            return AssetManager.LoadExpansionTexture(packId, textureName);
        }

        /// <summary>
        /// Load a mesh asset from an expansion pack
        /// </summary>
        public static Mesh LoadMesh(string packId, string meshName)
        {
            return AssetManager.LoadExpansionMesh(packId, meshName);
        }

        /// <summary>
        /// Load an asset from an expansion pack's bundle
        /// </summary>
        public static T LoadAsset<T>(string packId, string assetName) where T : UnityEngine.Object
        {
            try
            {
                var assetBundle = AssetManager.GetExpansionAssetBundle(packId);
                if (assetBundle == null)
                {
                    LogError($"No asset bundle found for pack: {packId}");
                    return null;
                }

                return assetBundle.LoadAsset<T>(assetName);
            }
            catch (Exception ex)
            {
                LogError($"Failed to load asset '{assetName}' from pack '{packId}': {ex.Message}");
                return null;
            }
        }

        #endregion

        #region Spawning and Placement

        /// <summary>
        /// Spawn a decor item in the world
        /// </summary>
        public static GameObject SpawnDecorItem(string internalName, Vector3 position, Quaternion rotation)
        {
            try
            {
                var itemData = GetDecorItem(internalName);
                if (itemData == null)
                {
                    LogError($"Item '{internalName}' not found");
                    return null;
                }

                return SpawnDecorItem(itemData.FurnitureID, position, rotation);
            }
            catch (Exception ex)
            {
                LogError($"Failed to spawn decor item '{internalName}': {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Spawn a decor item by ID
        /// </summary>
        public static GameObject SpawnDecorItem(int furnitureId, Vector3 position, Quaternion rotation)
        {
            try
            {
                if (!IsIDManagerReady())
                {
                    LogError("Cannot spawn item - IDManager not ready");
                    return null;
                }

                var furnitureGenerator = Singleton<FurnitureGenerator>.Instance;
                if (furnitureGenerator == null)
                {
                    LogError("FurnitureGenerator not found");
                    return null;
                }

                var furniture = furnitureGenerator.SpawnFurniture(furnitureId, position);
                if (furniture != null)
                {
                    furniture.transform.rotation = rotation;
                }

                return furniture;
            }
            catch (Exception ex)
            {
                LogError($"Failed to spawn decor item ID {furnitureId}: {ex.Message}");
                return null;
            }
        }

        #endregion

        #region Configuration

        /// <summary>
        /// Get configuration value for an expansion pack
        /// </summary>
        public static T GetConfig<T>(string packId, string key, T defaultValue)
        {
            return ConfigurationManager.GetExpansionConfig(packId, key, defaultValue);
        }

        /// <summary>
        /// Set configuration value for an expansion pack
        /// </summary>
        public static void SetConfig<T>(string packId, string key, T value)
        {
            ConfigurationManager.SetExpansionConfig(packId, key, value);
        }

        #endregion

        #region Utility Methods

        /// <summary>
        /// Get all registered expansion packs
        /// </summary>
        public static Dictionary<string, ExpansionPackInfo> GetRegisteredExpansionPacks()
        {
            return new Dictionary<string, ExpansionPackInfo>(registeredExpansions);
        }

        /// <summary>
        /// Get items registered by a specific expansion pack
        /// </summary>
        public static List<DecorItemData> GetExpansionPackItems(string packId)
        {
            if (expansionItems.TryGetValue(packId, out var items))
            {
                return new List<DecorItemData>(items);
            }
            return new List<DecorItemData>();
        }

        /// <summary>
        /// Check if the base mod is initialized and ready
        /// </summary>
        public static bool IsBaseModReady()
        {
            return DecorMod1Plugin.Instance != null && DecorMod1Plugin.Instance.IsInitialized;
        }

        /// <summary>
        /// Get the API version
        /// </summary>
        public static string GetAPIVersion()
        {
            return API_VERSION;
        }

        /// <summary>
        /// Check if an item ID belongs to expansion content
        /// </summary>
        public static bool IsExpansionItem(int furnitureId)
        {
            return furnitureId >= 760000 && furnitureId <= 999999;
        }

        /// <summary>
        /// Validate all registered items have unique IDs
        /// </summary>
        public static bool ValidateItemIds()
        {
            var idCheck = new HashSet<int>();

            foreach (var pack in expansionItems)
            {
                foreach (var item in pack.Value)
                {
                    if (idCheck.Contains(item.FurnitureID))
                    {
                        LogError($"Duplicate ID detected: {item.FurnitureID} in pack {pack.Key}");
                        return false;
                    }
                    idCheck.Add(item.FurnitureID);
                }
            }

            return true;
        }

        #endregion

        #region Internal Methods

        /// <summary>
        /// Check if IDManager is ready
        /// </summary>
        private static bool IsIDManagerReady()
        {
            try
            {
                var idManager = Singleton<IDManager>.Instance;
                return idManager != null && idManager.Furnitures != null;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Try to process pending items if IDManager is ready
        /// </summary>
        internal static void TryProcessPendingItems()
        {
            if (!IsIDManagerReady())
                return;

            if (isIDManagerInitialized)
                return;

            isIDManagerInitialized = true;
            LogInfo("IDManager is ready - processing pending items");

            foreach (var packId in pendingItems.Keys.ToList())
            {
                var items = pendingItems[packId].ToList();
                pendingItems[packId].Clear();

                foreach (var item in items)
                {
                    bool success = RegisterItemInternal(item, packId);
                    if (success)
                    {
                        registeredExpansions[packId].RegisteredItems.Add(item.FurnitureID);
                        expansionItems[packId].Add(item);
                        LogInfo($"Successfully registered pending item '{item.ItemName}' (ID: {item.FurnitureID})");
                    }
                    else
                    {
                        LogError($"Failed to register pending item '{item.ItemName}'");
                        // Remove the failed ID reservation
                        usedIds.Remove(item.FurnitureID);
                        string itemKey = $"{packId}:{item.InternalName}";
                        internalNameToId.Remove(itemKey);
                    }
                }
            }

            // Validate all IDs after processing
            ValidateItemIds();
        }

        /// <summary>
        /// Internal method to register item with the game
        /// </summary>
        internal static bool RegisterItemInternal(DecorItemData itemData, string packId)
        {
            try
            {
                var idManager = Singleton<IDManager>.Instance;
                var localizationManager = Singleton<LocalizationManager>.Instance;

                if (idManager == null)
                {
                    LogError("IDManager not available for internal registration");
                    return false;
                }

                // Create the furniture scriptable object
                var furnitureSO = CreateFurnitureSO(itemData, packId);
                if (furnitureSO == null)
                {
                    LogError("Failed to create FurnitureSO");
                    return false;
                }

                // Register with IDManager
                var traverse = Traverse.Create(idManager);
                var furnitureList = traverse.Field("m_Furnitures").GetValue<List<FurnitureSO>>();

                if (furnitureList == null)
                {
                    LogError("Cannot access furniture list");
                    return false;
                }

                furnitureList.Add(furnitureSO);

                // Add localization
                if (localizationManager != null)
                {
                    var localizationTraverse = Traverse.Create(localizationManager);
                    var localizedNames = localizationTraverse.Field("m_LocalizedFurnitureNames").GetValue<Dictionary<int, string>>();
                    if (localizedNames != null)
                    {
                        localizedNames[itemData.FurnitureID] = itemData.ItemName;
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                LogError($"Failed to register item internally: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Create FurnitureSO from item data
        /// </summary>
        private static FurnitureSO CreateFurnitureSO(DecorItemData itemData, string packId)
        {
            try
            {
                // Find a base furniture to copy from
                var idManager = Singleton<IDManager>.Instance;
                var baseFurniture = idManager.FurnitureSO(itemData.BaseReferenceID);

                if (baseFurniture == null)
                {
                    LogError($"Base furniture ID {itemData.BaseReferenceID} not found");
                    return null;
                }

                // Create a copy
                var furnitureSO = UnityEngine.Object.Instantiate(baseFurniture);
                furnitureSO.name = itemData.InternalName;
                furnitureSO.ID = itemData.FurnitureID;
                furnitureSO.Cost = itemData.BaseCost;
                furnitureSO.BoxSize = itemData.BoxSize;

                // Create prefab
                var prefab = CreateDecorPrefab(itemData, baseFurniture.FurniturePrefab, packId);
                if (prefab != null)
                {
                    furnitureSO.FurniturePrefab = prefab;
                }

                // Handle icon
                if (itemData.IconTexture != null)
                {
                    var sprite = Sprite.Create(
                        itemData.IconTexture,
                        new Rect(0, 0, itemData.IconTexture.width, itemData.IconTexture.height),
                        new Vector2(0.5f, 0.5f),
                        100.0f
                    );
                    furnitureSO.FurnitureIcon = sprite;
                }

                return furnitureSO;
            }
            catch (Exception ex)
            {
                LogError($"Failed to create FurnitureSO: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Create decor prefab from item data
        /// </summary>
        private static GameObject CreateDecorPrefab(DecorItemData itemData, GameObject basePrefab, string packId)
        {
            try
            {
                var prefab = UnityEngine.Object.Instantiate(basePrefab);
                prefab.SetActive(false);
                prefab.name = $"{itemData.InternalName}_Prefab";

                // Configure Furniture component
                var furniture = prefab.GetComponent<Furniture>();
                if (furniture == null)
                {
                    furniture = prefab.AddComponent<Furniture>();
                }

                furniture.ID = itemData.FurnitureID;
                if (furniture.Data == null)
                {
                    furniture.Data = new FurnitureData { FurnitureID = itemData.FurnitureID };
                }
                else
                {
                    furniture.Data.FurnitureID = itemData.FurnitureID;
                }

                // Configure PlacingMode
                ConfigureDecorPlacingMode(prefab, itemData, furniture);

                // Configure collision
                ConfigureCollision(prefab, itemData);

                // Configure visuals
                if (itemData.CustomMesh != null || itemData.CustomMaterial != null)
                {
                    ConfigureVisuals(prefab, itemData, packId);
                }

                // Apply scale
                prefab.transform.localScale = itemData.VisualScale;

                // Remove any display components
                RemoveDisplayComponents(prefab);

                return prefab;
            }
            catch (Exception ex)
            {
                LogError($"Failed to create decor prefab: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Configure DecorPlacingMode component
        /// </summary>
        private static void ConfigureDecorPlacingMode(GameObject prefab, DecorItemData itemData, Furniture furniture)
        {
            var placingMode = furniture.PlacingMode;
            GameObject placingModeObject = null;

            if (placingMode == null)
            {
                placingMode = prefab.GetComponentInChildren<FurniturePlacingMode>();
                if (placingMode == null)
                {
                    placingModeObject = new GameObject("PlacingMode");
                    placingModeObject.transform.SetParent(prefab.transform);
                    placingModeObject.transform.localPosition = Vector3.zero;
                    placingModeObject.transform.localRotation = Quaternion.identity;
                    placingModeObject.transform.localScale = Vector3.one;

                    placingMode = placingModeObject.AddComponent<Components.DecorPlacingMode>();
                }
                else
                {
                    placingModeObject = placingMode.gameObject;
                    if (!(placingMode is Components.DecorPlacingMode))
                    {
                        UnityEngine.Object.DestroyImmediate(placingMode);
                        placingMode = placingModeObject.AddComponent<Components.DecorPlacingMode>();
                    }
                }

                furniture.PlacingMode = placingMode;
            }

            // Configure placing collider
            if (placingModeObject != null)
            {
                var placingCollider = placingModeObject.GetComponent<BoxCollider>();
                if (placingCollider == null)
                {
                    placingCollider = placingModeObject.AddComponent<BoxCollider>();
                }

                placingCollider.size = itemData.CollisionSize;
                placingCollider.center = itemData.CollisionCenter;
                placingCollider.isTrigger = true;
            }
        }

        /// <summary>
        /// Configure collision for the prefab
        /// </summary>
        private static void ConfigureCollision(GameObject prefab, DecorItemData itemData)
        {
            // Remove existing colliders (except PlacingMode)
            var colliders = prefab.GetComponentsInChildren<Collider>(true);
            foreach (var collider in colliders)
            {
                if (collider.transform.parent != prefab.transform || collider.name == "PlacingMode")
                    continue;

                UnityEngine.Object.DestroyImmediate(collider);
            }

            // Add main collider
            var mainCollider = prefab.AddComponent<BoxCollider>();
            mainCollider.size = itemData.CollisionSize;
            mainCollider.center = itemData.CollisionCenter;
            mainCollider.isTrigger = itemData.IsWalkable;

            // Add ground detector if walkable
            if (itemData.IsWalkable)
            {
                var groundObj = new GameObject("GroundDetector");
                groundObj.transform.SetParent(prefab.transform);
                groundObj.transform.localPosition = Vector3.zero;
                groundObj.transform.localRotation = Quaternion.identity;

                var groundCollider = groundObj.AddComponent<BoxCollider>();
                groundCollider.size = new Vector3(itemData.CollisionSize.x, 0.001f, itemData.CollisionSize.z);
                groundCollider.center = new Vector3(itemData.CollisionCenter.x, 0.0005f, itemData.CollisionCenter.z);
                groundCollider.isTrigger = false;
            }

            prefab.layer = LayerMask.NameToLayer("Interactable");
        }

        /// <summary>
        /// Configure visuals for the prefab
        /// </summary>
        private static void ConfigureVisuals(GameObject prefab, DecorItemData itemData, string packId)
        {
            var visualsContainer = prefab.transform.Find("Visuals");
            if (visualsContainer == null)
            {
                visualsContainer = new GameObject("Visuals").transform;
                visualsContainer.SetParent(prefab.transform);
                visualsContainer.localPosition = Vector3.zero;
                visualsContainer.localRotation = Quaternion.identity;
            }

            // Hide existing renderers
            var existingRenderers = visualsContainer.GetComponentsInChildren<MeshRenderer>();
            foreach (var renderer in existingRenderers)
            {
                renderer.enabled = false;
            }

            // Create custom visual
            GameObject customMeshObject = new GameObject($"{itemData.InternalName}_Mesh");
            customMeshObject.transform.SetParent(visualsContainer);
            customMeshObject.transform.localPosition = Vector3.zero;
            customMeshObject.transform.localRotation = Quaternion.identity;
            customMeshObject.transform.localScale = itemData.VisualScale;

            var meshRenderer = customMeshObject.AddComponent<MeshRenderer>();
            var meshFilter = customMeshObject.AddComponent<MeshFilter>();

            if (itemData.CustomMesh != null)
            {
                meshFilter.mesh = itemData.CustomMesh;
            }
            else
            {
                meshFilter.mesh = AssetLoader.CreateDefaultMesh();
            }

            if (itemData.CustomMaterial != null)
            {
                meshRenderer.material = itemData.CustomMaterial;
            }
            else
            {
                meshRenderer.material = CreateDefaultMaterial(itemData.InternalName);
            }
        }

        /// <summary>
        /// Remove display-related components
        /// </summary>
        private static void RemoveDisplayComponents(GameObject prefab)
        {
            var displayComponent = prefab.GetComponent<Display>();
            if (displayComponent != null)
            {
                UnityEngine.Object.DestroyImmediate(displayComponent);
            }

            var displaySlots = prefab.GetComponentsInChildren<DisplaySlot>(true);
            foreach (var slot in displaySlots)
            {
                UnityEngine.Object.DestroyImmediate(slot.gameObject);
            }

            var canvases = prefab.GetComponentsInChildren<Canvas>(true);
            foreach (var canvas in canvases)
            {
                if (canvas.name.Contains("Price") || canvas.name.Contains("Tag"))
                {
                    UnityEngine.Object.DestroyImmediate(canvas.gameObject);
                }
            }
        }

        /// <summary>
        /// Create a default material
        /// </summary>
        private static Material CreateDefaultMaterial(string itemName)
        {
            var shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
            var material = new Material(shader);
            material.name = $"{itemName}_DefaultMaterial";
            return material;
        }

        #endregion

        #region Logging

        /// <summary>
        /// Log information message
        /// </summary>
        internal static void LogInfo(string message)
        {
            DecorMod1Plugin.Log?.LogInfo($"[DecorExpansionAPI] {message}");
        }

        /// <summary>
        /// Log warning message
        /// </summary>
        internal static void LogWarning(string message)
        {
            DecorMod1Plugin.Log?.LogWarning($"[DecorExpansionAPI] {message}");
        }

        /// <summary>
        /// Log error message
        /// </summary>
        internal static void LogError(string message)
        {
            DecorMod1Plugin.Log?.LogError($"[DecorExpansionAPI] {message}");
        }

        #endregion
    }

    /// <summary>
    /// Information about a registered expansion pack
    /// </summary>
    public class ExpansionPackInfo
    {
        public string PackId { get; set; }
        public string PackName { get; set; }
        public string PackVersion { get; set; }
        public string Author { get; set; }
        public string[] Dependencies { get; set; }
        public bool IsEnabled { get; set; }
        public List<int> RegisteredItems { get; set; }
        public DateTime RegisteredAt { get; set; } = DateTime.Now;
    }
}