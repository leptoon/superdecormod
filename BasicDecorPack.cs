using BepInEx;
using BepInEx.Configuration;
using SupermarketDecorMod1.API;
using SupermarketDecorMod1.Data;
using UnityEngine;
using System.Collections.Generic;

namespace BasicDecorPack
{
    /// <summary>
    /// Basic Decor Pack - Contains the original decorative items from the framework
    /// This is now a separate expansion pack that demonstrates the API usage
    /// </summary>
    [BepInPlugin("com.leptoon.basicdecorpack", "Basic Decor Pack", "1.0.0")]
    [BepInDependency(DecorExpansionAPI.BASE_MOD_GUID, BepInDependency.DependencyFlags.HardDependency)]
    public class BasicDecorPackPlugin : BaseUnityPlugin
    {
        // Configuration entries for item costs
        public static ConfigEntry<float> DecorPriceMultiplier;
        public static ConfigEntry<float> TestSculptureCost;
        public static ConfigEntry<float> PictureFrameCost;
        public static ConfigEntry<float> DeskLampCost;
        public static ConfigEntry<float> FloorPlantCost;
        public static ConfigEntry<float> WallArtCost;
        public static ConfigEntry<float> SculptureCost;
        public static ConfigEntry<bool> EnableCustomVisuals;

        // Furniture IDs for this pack (assigned by API)
        public static class BasicDecorIDs
        {
            public static int TEST_SCULPTURE = -1;
            public static int PICTURE_FRAME_MODERN = -1;
            public static int DESK_LAMP_LED = -1;
            public static int FLOOR_PLANT_LARGE = -1;
            public static int WALL_ART_ABSTRACT = -1;
            public static int SCULPTURE_MODERN = -1;
        }

        private void Awake()
        {
            LoadConfiguration();

            // Check if base mod is ready
            if (!DecorExpansionAPI.IsBaseModReady())
            {
                Logger.LogError("Supermarket Decor Framework is not loaded!");
                return;
            }

            // Register this expansion pack
            bool registered = DecorExpansionAPI.RegisterExpansionPack(
                packId: "com.leptoon.basicdecorpack",
                packName: "Basic Decor Pack",
                packVersion: "1.0.0",
                author: "Leptoon"
            );

            if (!registered)
            {
                Logger.LogError("Failed to register Basic Decor Pack!");
                return;
            }

            // Register all the decor items
            RegisterAllDecorItems();
        }

        private void LoadConfiguration()
        {
            // General settings
            DecorPriceMultiplier = Config.Bind("General", "DecorPriceMultiplier", 1.0f,
                new ConfigDescription("Multiplier for all decor item prices",
                    new AcceptableValueRange<float>(0.1f, 10f)));

            EnableCustomVisuals = Config.Bind("General", "EnableCustomVisuals", true,
                "Enable custom meshes and materials for decor items");

            // Individual item costs
            TestSculptureCost = Config.Bind("Item Costs", "TestSculptureCost", 100f,
                new ConfigDescription("Cost of Test Sculpture",
                    new AcceptableValueRange<float>(10f, 1000f)));

            PictureFrameCost = Config.Bind("Item Costs", "PictureFrameCost", 75f,
                new ConfigDescription("Cost of Modern Picture Frame",
                    new AcceptableValueRange<float>(10f, 500f)));

            DeskLampCost = Config.Bind("Item Costs", "DeskLampCost", 150f,
                new ConfigDescription("Cost of LED Desk Lamp",
                    new AcceptableValueRange<float>(20f, 800f)));

            FloorPlantCost = Config.Bind("Item Costs", "FloorPlantCost", 200f,
                new ConfigDescription("Cost of Large Floor Plant",
                    new AcceptableValueRange<float>(50f, 1000f)));

            WallArtCost = Config.Bind("Item Costs", "WallArtCost", 125f,
                new ConfigDescription("Cost of Abstract Wall Art",
                    new AcceptableValueRange<float>(25f, 750f)));

            SculptureCost = Config.Bind("Item Costs", "SculptureCost", 300f,
                new ConfigDescription("Cost of Modern Sculpture",
                    new AcceptableValueRange<float>(100f, 2000f)));
        }

        private void RegisterAllDecorItems()
        {
            var registeredItems = new List<int>();

            // Test Sculpture
            var testSculpture = CreateTestSculptureData();
            int testSculptureId = DecorExpansionAPI.RegisterDecorItem("com.leptoon.basicdecorpack", testSculpture);
            if (testSculptureId > 0)
            {
                BasicDecorIDs.TEST_SCULPTURE = testSculptureId;
                registeredItems.Add(testSculptureId);
                Logger.LogInfo($"Registered Test Sculpture with ID: {testSculptureId}");
            }

            // Picture Frame
            var pictureFrame = CreatePictureFrameData();
            int pictureFrameId = DecorExpansionAPI.RegisterDecorItem("com.leptoon.basicdecorpack", pictureFrame);
            if (pictureFrameId > 0)
            {
                BasicDecorIDs.PICTURE_FRAME_MODERN = pictureFrameId;
                registeredItems.Add(pictureFrameId);
                Logger.LogInfo($"Registered Picture Frame with ID: {pictureFrameId}");
            }

            // Desk Lamp
            var deskLamp = CreateDeskLampData();
            int deskLampId = DecorExpansionAPI.RegisterDecorItem("com.leptoon.basicdecorpack", deskLamp);
            if (deskLampId > 0)
            {
                BasicDecorIDs.DESK_LAMP_LED = deskLampId;
                registeredItems.Add(deskLampId);
                Logger.LogInfo($"Registered Desk Lamp with ID: {deskLampId}");
            }

            // Floor Plant
            var floorPlant = CreateFloorPlantData();
            int floorPlantId = DecorExpansionAPI.RegisterDecorItem("com.leptoon.basicdecorpack", floorPlant);
            if (floorPlantId > 0)
            {
                BasicDecorIDs.FLOOR_PLANT_LARGE = floorPlantId;
                registeredItems.Add(floorPlantId);
                Logger.LogInfo($"Registered Floor Plant with ID: {floorPlantId}");
            }

            // Wall Art
            var wallArt = CreateWallArtData();
            int wallArtId = DecorExpansionAPI.RegisterDecorItem("com.leptoon.basicdecorpack", wallArt);
            if (wallArtId > 0)
            {
                BasicDecorIDs.WALL_ART_ABSTRACT = wallArtId;
                registeredItems.Add(wallArtId);
                Logger.LogInfo($"Registered Wall Art with ID: {wallArtId}");
            }

            // Modern Sculpture
            var modernSculpture = CreateModernSculptureData();
            int modernSculptureId = DecorExpansionAPI.RegisterDecorItem("com.leptoon.basicdecorpack", modernSculpture);
            if (modernSculptureId > 0)
            {
                BasicDecorIDs.SCULPTURE_MODERN = modernSculptureId;
                registeredItems.Add(modernSculptureId);
                Logger.LogInfo($"Registered Modern Sculpture with ID: {modernSculptureId}");
            }

            Logger.LogInfo($"Basic Decor Pack registered {registeredItems.Count} items successfully!");
        }

        private DecorItemData CreateTestSculptureData()
        {
            var itemData = new DecorItemData
            {
                InternalName = "test_sculpture",
                ItemName = "Test Sculpture",
                Description = "A simple test sculpture for decoration",
                Category = DecorCategory.Sculptures,
                BaseCost = TestSculptureCost.Value * DecorPriceMultiplier.Value,
                DeliveryCost = 15f,
                Weight = 5f,
                Fragility = 0.3f,
                BoxSize = BoxSize._8x8x8,
                BaseReferenceID = SupermarketDecorMod1.DecorFurnitureIDs.BASE_SMALL_FURNITURE,
                CollisionSize = new Vector3(0.8f, 1.2f, 0.8f),
                CollisionCenter = new Vector3(0f, 0.6f, 0f),
                VisualScale = new Vector3(0.8f, 0.8f, 0.8f),
                CanPlaceOnFloor = true,
                CanPlaceOnWalls = false,
                RequiresFloorContact = true,
                IsInteractable = false,
                IsMoveable = true,
                CanRotate = true,
                CastShadows = true,
                ReceiveShadows = true,
                RequiredLevel = 1,
                IsUnlocked = true
            };

            // Load custom assets if enabled
            if (EnableCustomVisuals.Value)
            {
                LoadItemAssets(itemData, "TestSculpture");
            }

            return itemData;
        }

        private DecorItemData CreatePictureFrameData()
        {
            var itemData = new DecorItemData
            {
                InternalName = "picture_frame_modern",
                ItemName = "Modern Picture Frame",
                Description = "A sleek modern picture frame",
                Category = DecorCategory.WallDecor,
                BaseCost = PictureFrameCost.Value * DecorPriceMultiplier.Value,
                DeliveryCost = 8f,
                Weight = 1f,
                Fragility = 0.6f,
                BoxSize = BoxSize._8x8x8,
                BaseReferenceID = SupermarketDecorMod1.DecorFurnitureIDs.BASE_SMALL_FURNITURE,
                CollisionSize = new Vector3(0.6f, 0.8f, 0.1f),
                CollisionCenter = new Vector3(0f, 0.4f, 0f),
                VisualScale = new Vector3(0.6f, 0.6f, 0.6f),
                CanPlaceOnFloor = true,
                CanPlaceOnWalls = true,
                RequiresFloorContact = false,
                AllowFloating = true,
                IsInteractable = false,
                IsMoveable = true,
                CanRotate = true,
                CastShadows = true,
                ReceiveShadows = true,
                RequiredLevel = 1,
                IsUnlocked = true
            };

            // Load custom assets if enabled
            if (EnableCustomVisuals.Value)
            {
                LoadItemAssets(itemData, "PictureFrame");
            }

            return itemData;
        }

        private DecorItemData CreateDeskLampData()
        {
            var itemData = new DecorItemData
            {
                InternalName = "desk_lamp_led",
                ItemName = "LED Desk Lamp",
                Description = "A modern LED desk lamp",
                Category = DecorCategory.Lighting,
                BaseCost = DeskLampCost.Value * DecorPriceMultiplier.Value,
                DeliveryCost = 12f,
                Weight = 2f,
                Fragility = 0.4f,
                BoxSize = BoxSize._8x8x8,
                BaseReferenceID = SupermarketDecorMod1.DecorFurnitureIDs.BASE_SMALL_FURNITURE,
                CollisionSize = new Vector3(0.3f, 0.8f, 0.3f),
                CollisionCenter = new Vector3(0f, 0.4f, 0f),
                VisualScale = new Vector3(0.7f, 0.7f, 0.7f),
                CanPlaceOnFloor = true,
                CanPlaceOnWalls = false,
                RequiresFloorContact = true,
                IsInteractable = false,
                IsMoveable = true,
                CanRotate = true,
                CastShadows = true,
                ReceiveShadows = true,
                RequiredLevel = 1,
                IsUnlocked = true
            };

            // Load custom assets if enabled
            if (EnableCustomVisuals.Value)
            {
                LoadItemAssets(itemData, "DeskLamp");
            }

            return itemData;
        }

        private DecorItemData CreateFloorPlantData()
        {
            var itemData = new DecorItemData
            {
                InternalName = "floor_plant_large",
                ItemName = "Large Floor Plant",
                Description = "A large decorative floor plant",
                Category = DecorCategory.Plants,
                BaseCost = FloorPlantCost.Value * DecorPriceMultiplier.Value,
                DeliveryCost = 20f,
                Weight = 8f,
                Fragility = 0.2f,
                BoxSize = BoxSize._15x15x15,
                BaseReferenceID = SupermarketDecorMod1.DecorFurnitureIDs.BASE_MEDIUM_FURNITURE,
                CollisionSize = new Vector3(0.6f, 1.8f, 0.6f),
                CollisionCenter = new Vector3(0f, 0.9f, 0f),
                VisualScale = new Vector3(0.9f, 0.9f, 0.9f),
                CanPlaceOnFloor = true,
                CanPlaceOnWalls = false,
                RequiresFloorContact = true,
                IsInteractable = false,
                IsMoveable = true,
                CanRotate = true,
                CastShadows = true,
                ReceiveShadows = true,
                RequiredLevel = 1,
                IsUnlocked = true
            };

            // Load custom assets if enabled
            if (EnableCustomVisuals.Value)
            {
                LoadItemAssets(itemData, "FloorPlant");
            }

            return itemData;
        }

        private DecorItemData CreateWallArtData()
        {
            var itemData = new DecorItemData
            {
                InternalName = "wall_art_abstract",
                ItemName = "Abstract Wall Art",
                Description = "Modern abstract wall art",
                Category = DecorCategory.WallDecor,
                BaseCost = WallArtCost.Value * DecorPriceMultiplier.Value,
                DeliveryCost = 10f,
                Weight = 3f,
                Fragility = 0.5f,
                BoxSize = BoxSize._8x8x8,
                BaseReferenceID = SupermarketDecorMod1.DecorFurnitureIDs.BASE_SMALL_FURNITURE,
                CollisionSize = new Vector3(1.0f, 0.8f, 0.1f),
                CollisionCenter = new Vector3(0f, 0.4f, 0f),
                VisualScale = new Vector3(0.8f, 0.8f, 0.8f),
                CanPlaceOnFloor = true,
                CanPlaceOnWalls = true,
                RequiresFloorContact = false,
                AllowFloating = true,
                IsInteractable = false,
                IsMoveable = true,
                CanRotate = true,
                CastShadows = true,
                ReceiveShadows = true,
                RequiredLevel = 1,
                IsUnlocked = true
            };

            // Load custom assets if enabled
            if (EnableCustomVisuals.Value)
            {
                LoadItemAssets(itemData, "WallArt");
            }

            return itemData;
        }

        private DecorItemData CreateModernSculptureData()
        {
            var itemData = new DecorItemData
            {
                InternalName = "sculpture_modern",
                ItemName = "Modern Sculpture",
                Description = "A large modern sculptural piece",
                Category = DecorCategory.Sculptures,
                BaseCost = SculptureCost.Value * DecorPriceMultiplier.Value,
                DeliveryCost = 25f,
                Weight = 15f,
                Fragility = 0.3f,
                BoxSize = BoxSize._15x15x15,
                BaseReferenceID = SupermarketDecorMod1.DecorFurnitureIDs.BASE_MEDIUM_FURNITURE,
                CollisionSize = new Vector3(1.0f, 1.6f, 1.0f),
                CollisionCenter = new Vector3(0f, 0.8f, 0f),
                VisualScale = new Vector3(1.0f, 1.0f, 1.0f),
                CanPlaceOnFloor = true,
                CanPlaceOnWalls = false,
                RequiresFloorContact = true,
                IsInteractable = false,
                IsMoveable = true,
                CanRotate = true,
                CastShadows = true,
                ReceiveShadows = true,
                RequiredLevel = 1,
                IsUnlocked = true
            };

            // Load custom assets if enabled
            if (EnableCustomVisuals.Value)
            {
                LoadItemAssets(itemData, "ModernSculpture");
            }

            return itemData;
        }

        /// <summary>
        /// Load custom assets for an item from embedded resources
        /// </summary>
        private void LoadItemAssets(DecorItemData itemData, string assetName)
        {
            try
            {
                // Load custom mesh
                itemData.CustomMesh = LoadMeshFromResources(assetName);

                // Load custom material with textures
                itemData.CustomMaterial = CreateCustomMaterial(assetName);

                // Load icon
                itemData.IconTexture = LoadIconFromResources($"{assetName}_Icon");

                Logger.LogInfo($"Loaded custom assets for {assetName}");
            }
            catch (System.Exception ex)
            {
                Logger.LogWarning($"Failed to load custom assets for {assetName}: {ex.Message}");
                // Items will use default assets from the framework
            }
        }

        /// <summary>
        /// Load mesh from embedded resources
        /// </summary>
        private Mesh LoadMeshFromResources(string meshName)
        {
            try
            {
                var assembly = System.Reflection.Assembly.GetExecutingAssembly();
                using (var stream = assembly.GetManifestResourceStream($"BasicDecorPack.Resources.Meshes.{meshName}.json"))
                {
                    if (stream == null)
                    {
                        return SupermarketDecorMod1.Utilities.AssetLoader.CreateDefaultMesh();
                    }

                    using (var reader = new System.IO.StreamReader(stream))
                    {
                        string jsonData = reader.ReadToEnd();
                        // Use the framework's mesh loading logic
                        return SupermarketDecorMod1.Utilities.AssetLoader.CreateDefaultMesh(); // Placeholder - would parse JSON
                    }
                }
            }
            catch (System.Exception ex)
            {
                Logger.LogError($"Failed to load mesh {meshName}: {ex.Message}");
                return SupermarketDecorMod1.Utilities.AssetLoader.CreateDefaultMesh();
            }
        }

        /// <summary>
        /// Load texture from embedded resources
        /// </summary>
        private Texture2D LoadTextureFromResources(string textureName)
        {
            try
            {
                var assembly = System.Reflection.Assembly.GetExecutingAssembly();
                using (var stream = assembly.GetManifestResourceStream($"BasicDecorPack.Resources.Textures.{textureName}.png"))
                {
                    if (stream == null)
                    {
                        return null;
                    }

                    var buffer = new byte[stream.Length];
                    stream.Read(buffer, 0, buffer.Length);

                    var texture = new Texture2D(2, 2, TextureFormat.RGBA32, true);
                    texture.name = textureName;

                    if (ImageConversion.LoadImage(texture, buffer))  // FIXED: Use ImageConversion.LoadImage
                    {
                        texture.filterMode = FilterMode.Bilinear;
                        texture.wrapMode = TextureWrapMode.Repeat;
                        texture.anisoLevel = 1;
                        return texture;
                    }
                }
            }
            catch (System.Exception ex)
            {
                Logger.LogError($"Failed to load texture {textureName}: {ex.Message}");
            }

            return null;
        }
        /// <summary>
        /// Load icon from embedded resources
        /// </summary>
        private Texture2D LoadIconFromResources(string iconName)
        {
            try
            {
                var assembly = System.Reflection.Assembly.GetExecutingAssembly();
                using (var stream = assembly.GetManifestResourceStream($"BasicDecorPack.Resources.Icons.{iconName}.png"))
                {
                    if (stream == null)
                    {
                        return null;
                    }

                    var buffer = new byte[stream.Length];
                    stream.Read(buffer, 0, buffer.Length);

                    var texture = new Texture2D(2, 2, TextureFormat.RGBA32, false);
                    texture.name = iconName;

                    if (ImageConversion.LoadImage(texture, buffer))  // FIXED: Use ImageConversion.LoadImage
                    {
                        texture.filterMode = FilterMode.Point;
                        texture.wrapMode = TextureWrapMode.Clamp;
                        return texture;
                    }
                }
            }
            catch (System.Exception ex)
            {
                Logger.LogError($"Failed to load icon {iconName}: {ex.Message}");
            }

            return null;
        }
        /// <summary>
        /// Create custom material with loaded textures
        /// </summary>
        private Material CreateCustomMaterial(string itemName)
        {
            try
            {
                Shader shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
                var material = new Material(shader);
                material.name = $"{itemName}_Material";

                var albedoTexture = LoadTextureFromResources($"{itemName}_Albedo");
                if (albedoTexture != null)
                {
                    if (material.HasProperty("_BaseMap"))
                        material.SetTexture("_BaseMap", albedoTexture);
                    material.SetTexture("_MainTex", albedoTexture);
                }

                var normalTexture = LoadTextureFromResources($"{itemName}_Normal");
                if (normalTexture != null && material.HasProperty("_BumpMap"))
                {
                    material.SetTexture("_BumpMap", normalTexture);
                    material.EnableKeyword("_NORMALMAP");
                    material.SetFloat("_BumpScale", 1.0f);
                }

                if (material.HasProperty("_Metallic"))
                    material.SetFloat("_Metallic", 0.1f);
                if (material.HasProperty("_Smoothness"))
                    material.SetFloat("_Smoothness", 0.5f);

                return material;
            }
            catch (System.Exception ex)
            {
                Logger.LogError($"Failed to create material for {itemName}: {ex.Message}");
                return new Material(Shader.Find("Standard"));
            }
        }
    }

    /// <summary>
    /// Helper class to provide compatibility with existing code that might reference the old IDs
    /// </summary>
    public static class BasicDecorIDMapper
    {
        /// <summary>
        /// Check if an ID is one of the basic decor items
        /// </summary>
        public static bool IsBasicDecorItem(int furnitureID)
        {
            return furnitureID == BasicDecorPackPlugin.BasicDecorIDs.TEST_SCULPTURE ||
                   furnitureID == BasicDecorPackPlugin.BasicDecorIDs.PICTURE_FRAME_MODERN ||
                   furnitureID == BasicDecorPackPlugin.BasicDecorIDs.DESK_LAMP_LED ||
                   furnitureID == BasicDecorPackPlugin.BasicDecorIDs.FLOOR_PLANT_LARGE ||
                   furnitureID == BasicDecorPackPlugin.BasicDecorIDs.WALL_ART_ABSTRACT ||
                   furnitureID == BasicDecorPackPlugin.BasicDecorIDs.SCULPTURE_MODERN;
        }

        /// <summary>
        /// Get the item name for a basic decor ID
        /// </summary>
        public static string GetBasicDecorItemName(int furnitureID)
        {
            if (furnitureID == BasicDecorPackPlugin.BasicDecorIDs.TEST_SCULPTURE)
                return "Test Sculpture";
            if (furnitureID == BasicDecorPackPlugin.BasicDecorIDs.PICTURE_FRAME_MODERN)
                return "Modern Picture Frame";
            if (furnitureID == BasicDecorPackPlugin.BasicDecorIDs.DESK_LAMP_LED)
                return "LED Desk Lamp";
            if (furnitureID == BasicDecorPackPlugin.BasicDecorIDs.FLOOR_PLANT_LARGE)
                return "Large Floor Plant";
            if (furnitureID == BasicDecorPackPlugin.BasicDecorIDs.WALL_ART_ABSTRACT)
                return "Abstract Wall Art";
            if (furnitureID == BasicDecorPackPlugin.BasicDecorIDs.SCULPTURE_MODERN)
                return "Modern Sculpture";

            return "Unknown Item";
        }
    }

    /// <summary>
    /// Legacy data structure for compatibility with original DecorItemSpec
    /// </summary>
    public class DecorItemSpec
    {
        public BoxSize BoxSize { get; set; }
        public int BaseReferenceID { get; set; }
        public Vector3 VisualScale { get; set; }
        public Vector3 CollisionSize { get; set; }
        public Vector3 CollisionCenter { get; set; }
        public bool IsWalkable { get; set; }
    }
}