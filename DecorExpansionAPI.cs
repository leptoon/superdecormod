using BepInEx;
using BepInEx.Configuration;
using BepInEx.Logging;
using SupermarketDecorMod1.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using UnityEngine;

namespace SupermarketDecorMod1.API
{
    /// <summary>
    /// Public API for Super Decor expansion packs
    /// </summary>
    public static class DecorExpansionAPI
    {
        // Version of the API
        public const string API_VERSION = "1.2.0"; // Updated for new category system
        public const string BASE_MOD_GUID = "com.leptoon.supermarketdecomod1";

        private static Dictionary<string, ExpansionPackInfo> registeredPacks = new Dictionary<string, ExpansionPackInfo>();
        private static Dictionary<int, DecorItemData> registeredItems = new Dictionary<int, DecorItemData>();
        private static Dictionary<string, List<DecorItemData>> expansionItems = new Dictionary<string, List<DecorItemData>>();
        private static Dictionary<string, List<DecorItemData>> pendingItems = new Dictionary<string, List<DecorItemData>>();
        private static Dictionary<string, int> internalNameToId = new Dictionary<string, int>();
        private static HashSet<int> usedIds = new HashSet<int>();
        private static Dictionary<string, System.Reflection.Assembly> packAssemblies = new Dictionary<string, System.Reflection.Assembly>();

        private static ManualLogSource logger;
        private static bool isInitialized = false;

        // ID range for expansion pack items (760000-999999)
        private const int EXPANSION_ID_START = 760000;
        private const int EXPANSION_ID_END = 999999;

        /// <summary>
        /// Initialize the API (called by main mod)
        /// </summary>
        internal static void Initialize(ManualLogSource modLogger)
        {
            logger = modLogger;
            isInitialized = true;

            logger.LogInfo("DecorExpansionAPI initialized");
        }

        /// <summary>
        /// Check if the base mod is ready
        /// </summary>
        public static bool IsBaseModReady()
        {
            return isInitialized && DecorMod1Plugin.Instance != null;
        }

        /// <summary>
        /// Register an expansion pack
        /// </summary>
        /// <param name="packId">Unique identifier for the pack</param>
        /// <param name="packName">Display name of the pack</param>
        /// <param name="packVersion">Version of the pack</param>
        /// <param name="author">Author of the pack</param>
        /// <param name="dependencies">Optional dependencies on other packs</param>
        /// <returns>True if registration successful</returns>
        public static bool RegisterExpansionPack(string packId, string packName, string packVersion, string author = "", string[] dependencies = null)
        {
            if (!isInitialized)
            {
                LogError("API not initialized! Is Super Decor mod loaded?");
                return false;
            }

            if (string.IsNullOrEmpty(packId))
            {
                LogError("Pack ID cannot be null or empty!");
                return false;
            }

            if (registeredPacks.ContainsKey(packId))
            {
                LogError($"Pack '{packId}' is already registered!");
                return false;
            }

            var packInfo = new ExpansionPackInfo
            {
                PackId = packId,
                PackName = packName,
                Version = packVersion,
                Author = author,
                Dependencies = dependencies ?? new string[0],
                RegisteredItems = new List<int>()
            };

            registeredPacks[packId] = packInfo;
            expansionItems[packId] = new List<DecorItemData>();
            pendingItems[packId] = new List<DecorItemData>();

            LogInfo($"Registered expansion pack: {packName} v{packVersion} by {author}");

            // Try to process any pending items if IDManager is ready
            TryProcessPendingItems();

            return true;
        }

        /// <summary>
        /// Register an expansion pack with assembly reference
        /// </summary>
        public static bool RegisterExpansionPackWithAssembly(string packId, string packName, string packVersion, string author, System.Reflection.Assembly assembly, string[] dependencies = null)
        {
            // First register normally
            bool result = RegisterExpansionPack(packId, packName, packVersion, author, dependencies);

            if (result && assembly != null)
            {
                packAssemblies[packId] = assembly;
                LogInfo($"Registered assembly for pack {packId}");

                // Pass to ExpansionAssetLoader
                Utilities.ExpansionAssetLoader.RegisterPackAssembly(packId, assembly);
            }

            return result;
        }

        /// <summary>
        /// Register a decor item from an expansion pack
        /// </summary>
        /// <param name="packId">ID of the expansion pack</param>
        /// <param name="itemData">Item data to register</param>
        /// <returns>Furniture ID if successful, -1 if failed</returns>
        public static int RegisterDecorItem(string packId, DecorItemData itemData)
        {
            if (!isInitialized)
            {
                LogError("API not initialized! Is Super Decor mod loaded?");
                return -1;
            }

            if (!registeredPacks.ContainsKey(packId))
            {
                LogError($"Pack '{packId}' is not registered!");
                return -1;
            }

            if (itemData == null)
            {
                LogError("Item data cannot be null!");
                return -1;
            }

            if (string.IsNullOrEmpty(itemData.InternalName))
            {
                LogError("Item internal name cannot be null or empty!");
                return -1;
            }

            // Validate or use default category (NOTE: Not currently used in-game)
            if (!string.IsNullOrEmpty(itemData.Category))
            {
                // Validate category is a standard category
                if (!DecorCategories.IsStandardCategory(itemData.Category))
                {
                    LogWarning($"Invalid category '{itemData.Category}' for item '{itemData.InternalName}'. Using default category 'Fixtures'.");
                    itemData.Category = DecorCategories.Fixtures;
                }
            }
            else
            {
                // Default to Fixtures if no category specified
                itemData.Category = DecorCategories.Fixtures;
            }

            // Generate deterministic ID based on pack ID and item internal name
            int furnitureId = GenerateDeterministicId(packId, itemData.InternalName);

            // Check for ID collision
            if (registeredItems.ContainsKey(furnitureId))
            {
                LogError($"ID collision detected for item '{itemData.InternalName}' in pack '{packId}'!");
                // Try alternative IDs
                for (int i = 1; i < 100; i++)
                {
                    int altId = GenerateDeterministicId(packId, itemData.InternalName + "_" + i);
                    if (!registeredItems.ContainsKey(altId))
                    {
                        furnitureId = altId;
                        LogWarning($"Using alternative ID {altId} for item '{itemData.InternalName}'");
                        break;
                    }
                }
            }

            // Set the furniture ID
            itemData.FurnitureID = furnitureId;

            // Validate box size
            if (!Enum.IsDefined(typeof(BoxSize), itemData.BoxSize))
            {
                LogWarning($"Invalid BoxSize for item '{itemData.InternalName}', defaulting to _8x8x8");
                itemData.BoxSize = BoxSize._8x8x8;
            }

            // Register the item
            registeredItems[furnitureId] = itemData;
            expansionItems[packId].Add(itemData);
            registeredPacks[packId].RegisteredItems.Add(furnitureId);

            // Track the internal name
            string itemKey = $"{packId}:{itemData.InternalName}";
            internalNameToId[itemKey] = furnitureId;
            usedIds.Add(furnitureId);

            // Add to pending items if IDManager is not ready
            if (!IsIDManagerReady())
            {
                pendingItems[packId].Add(itemData);
                LogInfo($"Item '{itemData.ItemName}' queued for registration (ID: {furnitureId}, Category: {itemData.Category})");
            }
            else
            {
                // Process immediately if ready
                TryProcessPendingItems();
            }

            LogInfo($"Registered item '{itemData.ItemName}' with ID {furnitureId} from pack '{packId}' in category '{itemData.Category}'");

            return furnitureId;
        }

        /// <summary>
        /// Check if IDManager is ready
        /// </summary>
        private static bool IsIDManagerReady()
        {
            try
            {
                var idManager = MyBox.Singleton<IDManager>.Instance;
                return idManager != null && idManager.Furnitures != null;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Try to process pending items
        /// </summary>
        public static void TryProcessPendingItems()
        {
            if (!IsIDManagerReady())
                return;

            foreach (var packId in pendingItems.Keys.ToList())
            {
                var items = pendingItems[packId].ToList();
                foreach (var item in items)
                {
                    // The DecorPatches will handle the actual integration
                    LogInfo($"Item '{item.ItemName}' ready for IDManager integration");
                }
                pendingItems[packId].Clear();
            }

            // Trigger UI refresh if FurnituresViewer exists
            try
            {
                var furnituresViewer = UnityEngine.Object.FindObjectOfType<FurnituresViewer>();
                if (furnituresViewer != null)
                {
                    // The viewer will be refreshed when opened
                    LogInfo("FurnituresViewer found - items will appear when computer is opened");
                }
            }
            catch (Exception ex)
            {
                LogError($"Error checking for FurnituresViewer: {ex.Message}");
            }
        }

        /// <summary>
        /// Check if an ID is an expansion item
        /// </summary>
        public static bool IsExpansionItem(int id)
        {
            return id >= EXPANSION_ID_START && id <= EXPANSION_ID_END;
        }

        /// <summary>
        /// Generate a deterministic ID for an item
        /// </summary>
        private static int GenerateDeterministicId(string packId, string itemName)
        {
            string combined = $"{packId}:{itemName}";
            using (var sha256 = SHA256.Create())
            {
                byte[] hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(combined));

                // Use first 4 bytes of hash for number generation
                uint hashValue = BitConverter.ToUInt32(hashBytes, 0);

                // Map to our ID range
                int range = EXPANSION_ID_END - EXPANSION_ID_START;
                int id = EXPANSION_ID_START + (int)(hashValue % range);

                return id;
            }
        }

        /// <summary>
        /// Get all registered expansion packs
        /// </summary>
        public static List<ExpansionPackInfo> GetRegisteredPacks()
        {
            return registeredPacks.Values.ToList();
        }

        /// <summary>
        /// Get all registered decor items
        /// </summary>
        public static List<DecorItemData> GetAllDecorItems()
        {
            return registeredItems.Values.ToList();
        }

        /// <summary>
        /// Get decor items by category.
        /// NOTE: Categories are not currently used in the game - all items appear in the Furnitures page.
        /// </summary>
        public static List<DecorItemData> GetDecorItemsByCategory(string category)
        {
            if (string.IsNullOrEmpty(category))
                return new List<DecorItemData>();

            return registeredItems.Values
                .Where(item => string.Equals(item.Category, category, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        /// <summary>
        /// Get decor item by ID
        /// </summary>
        public static DecorItemData GetDecorItemById(int furnitureId)
        {
            return registeredItems.ContainsKey(furnitureId) ? registeredItems[furnitureId] : null;
        }

        /// <summary>
        /// Check if a pack is registered
        /// </summary>
        public static bool IsPackRegistered(string packId)
        {
            return registeredPacks.ContainsKey(packId);
        }

        /// <summary>
        /// Get expansion pack info
        /// </summary>
        public static ExpansionPackInfo GetPackInfo(string packId)
        {
            return registeredPacks.ContainsKey(packId) ? registeredPacks[packId] : null;
        }

        /// <summary>
        /// Get decor item by pack ID and internal name
        /// </summary>
        public static DecorItemData GetDecorItem(string packId, string internalName)
        {
            string itemKey = $"{packId}:{internalName}";
            if (internalNameToId.TryGetValue(itemKey, out int id))
            {
                return GetDecorItemById(id);
            }
            return null;
        }

        /// <summary>
        /// Get all items from a specific expansion pack
        /// </summary>
        public static List<DecorItemData> GetPackItems(string packId)
        {
            if (expansionItems.ContainsKey(packId))
            {
                return new List<DecorItemData>(expansionItems[packId]);
            }
            return new List<DecorItemData>();
        }

        /// <summary>
        /// Unregister an expansion pack and all its items
        /// </summary>
        public static bool UnregisterExpansionPack(string packId)
        {
            if (!registeredPacks.ContainsKey(packId))
            {
                LogWarning($"Pack '{packId}' is not registered!");
                return false;
            }

            // Remove all items from this pack
            if (expansionItems.ContainsKey(packId))
            {
                foreach (var item in expansionItems[packId])
                {
                    registeredItems.Remove(item.FurnitureID);
                    usedIds.Remove(item.FurnitureID);

                    string itemKey = $"{packId}:{item.InternalName}";
                    internalNameToId.Remove(itemKey);
                }
                expansionItems.Remove(packId);
            }

            // Remove pending items
            pendingItems.Remove(packId);

            // Remove pack info
            registeredPacks.Remove(packId);

            // Remove assembly reference
            packAssemblies.Remove(packId);

            LogInfo($"Unregistered expansion pack: {packId}");
            return true;
        }

        /// <summary>
        /// Get assembly for a registered pack
        /// </summary>
        public static System.Reflection.Assembly GetPackAssembly(string packId)
        {
            return packAssemblies.ContainsKey(packId) ? packAssemblies[packId] : null;
        }

        /// <summary>
        /// Clear all cached data (for debugging/testing)
        /// </summary>
        internal static void ClearAllData()
        {
            registeredPacks.Clear();
            registeredItems.Clear();
            expansionItems.Clear();
            pendingItems.Clear();
            internalNameToId.Clear();
            usedIds.Clear();
            packAssemblies.Clear();

            LogInfo("Cleared all expansion API data");
        }

        /// <summary>
        /// Log info message
        /// </summary>
        public static void LogInfo(string message)
        {
            logger?.LogInfo($"[ExpansionAPI] {message}");
        }

        /// <summary>
        /// Log warning message
        /// </summary>
        public static void LogWarning(string message)
        {
            logger?.LogWarning($"[ExpansionAPI] {message}");
        }

        /// <summary>
        /// Log error message
        /// </summary>
        public static void LogError(string message)
        {
            logger?.LogError($"[ExpansionAPI] {message}");
        }
    }

    /// <summary>
    /// Information about a registered expansion pack
    /// </summary>
    public class ExpansionPackInfo
    {
        public string PackId { get; set; }
        public string PackName { get; set; }
        public string Version { get; set; }
        public string Author { get; set; }
        public string[] Dependencies { get; set; }
        public List<int> RegisteredItems { get; set; }
        public bool IsEnabled { get; set; } = true;
        public Dictionary<string, object> CustomData { get; set; } = new Dictionary<string, object>();
    }
}
