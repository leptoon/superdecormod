using BepInEx;
using BepInEx.Configuration;
using SupermarketDecorMod1.API;
using SupermarketDecorMod1.Data;
using UnityEngine;

namespace BasicDecorPack
{
    /// <summary>
    /// Basic Decor Pack - Example expansion pack that registers items with the framework
    /// </summary>
    [BepInPlugin("com.leptoon.basicdecorpack", "Basic Decor Pack", "1.0.0")]
    [BepInDependency("com.leptoon.supermarketdecomod1", BepInDependency.DependencyFlags.HardDependency)]
    public class BasicDecorPackPlugin : BaseUnityPlugin
    {
        // Configuration
        private ConfigEntry<float> PriceMultiplier;

        // Store the IDs assigned by the API
        private int testSculptureId = -1;
        private int pictureFrameId = -1;
        private int deskLampId = -1;
        private int floorPlantId = -1;
        private int wallArtId = -1;
        private int modernSculptureId = -1;

        private void Awake()
        {
            // Load config
            PriceMultiplier = Config.Bind("General", "PriceMultiplier", 1.0f,
                new ConfigDescription("Multiplier for all item prices",
                    new AcceptableValueRange<float>(0.1f, 10f)));

            // Check if the base mod is ready
            if (!DecorExpansionAPI.IsBaseModReady())
            {
                Logger.LogError("Supermarket Decor Framework is not loaded!");
                return;
            }

            // Register this expansion pack WITH assembly reference
            if (!DecorExpansionAPI.RegisterExpansionPackWithAssembly(
                packId: "com.leptoon.basicdecorpack",
                packName: "Basic Decor Pack",
                packVersion: "1.0.0",
                author: "Leptoon",
                assembly: System.Reflection.Assembly.GetExecutingAssembly()))
            {
                Logger.LogError("Failed to register expansion pack!");
                return;
            }

            // Register all items
            RegisterItems();
        }

        private void RegisterItems()
        {
            // Test Sculpture - The framework will load resources based on asset names matching the files
            testSculptureId = RegisterItem(new DecorItemData
            {
                InternalName = "test_sculpture",
                ItemName = "Test Sculpture",
                Description = "A simple test sculpture",
                Category = DecorCategories.Fixtures,
                BaseCost = 100f * PriceMultiplier.Value,
                DeliveryCost = 15f,
                BoxSize = BoxSize._8x8x8,
                BaseReferenceID = 2, // Small furniture base
                CollisionSize = new Vector3(0.8f, 1.2f, 0.8f),
                CollisionCenter = new Vector3(0f, 0.6f, 0f),
                VisualScale = new Vector3(0.8f, 0.8f, 0.8f),
                // Tell the framework where to find assets
                AssetBundleName = "com.leptoon.basicdecorpack",
                IconAssetName = "TestSculpture_Icon",
                MeshAssetName = "TestSculpture",  // This will look for TestSculpture_Albedo.png and TestSculpture_Normal.png
                MaterialAssetName = "TestSculpture_Material"
            });

            // Picture Frame
            pictureFrameId = RegisterItem(new DecorItemData
            {
                InternalName = "picture_frame_modern",
                ItemName = "Modern Picture Frame",
                Description = "A sleek picture frame",
                Category = DecorCategories.WallDecor,
                BaseCost = 75f * PriceMultiplier.Value,
                DeliveryCost = 8f,
                BoxSize = BoxSize._8x8x8,
                BaseReferenceID = 2,
                CollisionSize = new Vector3(0.6f, 0.8f, 0.1f),
                CollisionCenter = new Vector3(0f, 0.4f, 0f),
                VisualScale = new Vector3(0.6f, 0.6f, 0.6f),
                CanPlaceOnWalls = true,
                AllowFloating = true,
                AssetBundleName = "com.leptoon.basicdecorpack",
                IconAssetName = "PictureFrame_Icon",
                MeshAssetName = "PictureFrame",
                MaterialAssetName = "PictureFrame_Material"
            });

            // Desk Lamp
            deskLampId = RegisterItem(new DecorItemData
            {
                InternalName = "desk_lamp_led",
                ItemName = "LED Desk Lamp",
                Description = "Modern LED lamp",
                Category = DecorCategories.Lighting,
                BaseCost = 150f * PriceMultiplier.Value,
                DeliveryCost = 12f,
                BoxSize = BoxSize._8x8x8,
                BaseReferenceID = 2,
                CollisionSize = new Vector3(0.3f, 0.8f, 0.3f),
                CollisionCenter = new Vector3(0f, 0.4f, 0f),
                VisualScale = new Vector3(0.7f, 0.7f, 0.7f),
                AssetBundleName = "com.leptoon.basicdecorpack",
                IconAssetName = "DeskLamp_Icon",
                MeshAssetName = "DeskLamp",
                MaterialAssetName = "DeskLamp_Material"
            });

            // Floor Plant
            floorPlantId = RegisterItem(new DecorItemData
            {
                InternalName = "floor_plant_large",
                ItemName = "Large Floor Plant",
                Description = "Decorative plant",
                Category = DecorCategories.FloorDecor,
                BaseCost = 200f * PriceMultiplier.Value,
                DeliveryCost = 20f,
                BoxSize = BoxSize._15x15x15,
                BaseReferenceID = 3, // Medium furniture base
                CollisionSize = new Vector3(0.6f, 1.8f, 0.6f),
                CollisionCenter = new Vector3(0f, 0.9f, 0f),
                VisualScale = new Vector3(0.9f, 0.9f, 0.9f),
                AssetBundleName = "com.leptoon.basicdecorpack",
                IconAssetName = "FloorPlant_Icon",
                MeshAssetName = "FloorPlant",
                MaterialAssetName = "FloorPlant_Material"
            });

            // Wall Art
            wallArtId = RegisterItem(new DecorItemData
            {
                InternalName = "wall_art_abstract",
                ItemName = "Abstract Wall Art",
                Description = "Modern art piece",
                Category = DecorCategories.WallDecor,
                BaseCost = 125f * PriceMultiplier.Value,
                DeliveryCost = 10f,
                BoxSize = BoxSize._8x8x8,
                BaseReferenceID = 2,
                CollisionSize = new Vector3(1.0f, 0.8f, 0.1f),
                CollisionCenter = new Vector3(0f, 0.4f, 0f),
                VisualScale = new Vector3(0.8f, 0.8f, 0.8f),
                CanPlaceOnWalls = true,
                AllowFloating = true,
                AssetBundleName = "com.leptoon.basicdecorpack",
                IconAssetName = "WallArt_Icon",
                MeshAssetName = "WallArt",
                MaterialAssetName = "WallArt_Material"
            });

            // Modern Sculpture
            modernSculptureId = RegisterItem(new DecorItemData
            {
                InternalName = "sculpture_modern",
                ItemName = "Modern Sculpture",
                Description = "Large sculptural piece",
                Category = DecorCategories.Fixtures,
                BaseCost = 300f * PriceMultiplier.Value,
                DeliveryCost = 25f,
                BoxSize = BoxSize._15x15x15,
                BaseReferenceID = 3,
                CollisionSize = new Vector3(1.0f, 1.6f, 1.0f),
                CollisionCenter = new Vector3(0f, 0.8f, 0f),
                VisualScale = new Vector3(1.0f, 1.0f, 1.0f),
                AssetBundleName = "com.leptoon.basicdecorpack",
                IconAssetName = "ModernSculpture_Icon",
                MeshAssetName = "ModernSculpture",
                MaterialAssetName = "ModernSculpture_Material"
            });

            Logger.LogInfo($"Basic Decor Pack registered {GetRegisteredCount()} items");
        }

        /// <summary>
        /// Register a single item and return its ID
        /// </summary>
        private int RegisterItem(DecorItemData itemData)
        {
            int id = DecorExpansionAPI.RegisterDecorItem("com.leptoon.basicdecorpack", itemData);
            if (id > 0)
            {
                Logger.LogInfo($"Registered {itemData.ItemName} with ID: {id}");
            }
            else
            {
                Logger.LogError($"Failed to register {itemData.ItemName}");
            }
            return id;
        }

        /// <summary>
        /// Get count of successfully registered items
        /// </summary>
        private int GetRegisteredCount()
        {
            int count = 0;
            if (testSculptureId > 0) count++;
            if (pictureFrameId > 0) count++;
            if (deskLampId > 0) count++;
            if (floorPlantId > 0) count++;
            if (wallArtId > 0) count++;
            if (modernSculptureId > 0) count++;
            return count;
        }
    }
}
