# Super Decor Expansion API Documentation
Version 1.2.1

## Table of Contents
- [Overview](#overview)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Data Structures](#data-structures)
- [Asset Management](#asset-management)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Version History](#version-history)

## Overview

The Super Decor Expansion API enables mod developers to create expansion packs that add new decorative items to Supermarket Simulator. These items seamlessly integrate with the game's furniture system and appear in the Furnitures section of the in-game computer for purchase.

### Key Features
- Add unlimited decorative items without modifying the base mod
- Automatic ID assignment (range: 760000-999999)
- Support for custom meshes, materials, and icons
- Flexible placement rules (floor, wall, ceiling)
- Deterministic ID generation to ensure consistency
- Asset loading from embedded resources
- Full integration with the game's furniture system

### Important Notes
- **Categories are not currently used**: While the API supports categorization, all items currently appear in the Furnitures page regardless of their assigned category. Categories are implemented for future use when a custom decor UI might be added.
- The base framework (`com.leptoon.supermarketdecormod1`) must be installed for expansion packs to work
- All expansion pack items are assigned IDs in the range 760000-999999
- Items must reference a valid base furniture ID to inherit default behaviors
- **Automatic pricing**: Delivery fees are calculated automatically based on box size. Sell price is always 50% of the purchase cost.

## Requirements

- BepInEx 5.4.x or later
- Supermarket Simulator (latest version)
- Super Decor Mod 1 (base framework) v1.1.0 or later
- .NET Framework 4.7.2 or later

## Getting Started

### 1. Project Setup

Create a new Class Library project targeting .NET Framework 4.7.2 and add the following NuGet packages:
- BepInEx.Core
- BepInEx.PluginInfoProps
- UnityEngine.Modules

### 2. Basic Plugin Structure

```csharp
using BepInEx;
using SupermarketDecorMod1.API;
using SupermarketDecorMod1.Data;
using UnityEngine;

[BepInPlugin("your.unique.plugin.id", "Your Pack Name", "1.0.0")]
[BepInDependency(DecorExpansionAPI.BASE_MOD_GUID, BepInDependency.DependencyFlags.HardDependency)]
public class YourExpansionPack : BaseUnityPlugin
{
    private void Awake()
    {
        // Check if base mod is ready
        if (!DecorExpansionAPI.IsBaseModReady())
        {
            Logger.LogError("Super Decor Framework is not loaded!");
            return;
        }

        // Register your expansion pack with assembly reference for asset loading
        bool registered = DecorExpansionAPI.RegisterExpansionPackWithAssembly(
            packId: "your.unique.plugin.id",
            packName: "Your Pack Name",
            packVersion: "1.0.0",
            author: "Your Name",
            assembly: System.Reflection.Assembly.GetExecutingAssembly()
        );

        if (registered)
        {
            RegisterYourItems();
        }
    }

    private void RegisterYourItems()
    {
        // Register individual items here
    }
}
```

## API Reference

### Core Methods

#### IsBaseModReady
Checks if the Super Decor framework is loaded and ready.
```csharp
bool IsBaseModReady()
```

#### RegisterExpansionPack
Registers your expansion pack with the framework.
```csharp
bool RegisterExpansionPack(
    string packId,           // Unique identifier (e.g., "com.yourname.packname")
    string packName,         // Display name
    string packVersion,      // Version string
    string author = "",      // Author name (optional)
    string[] dependencies = null  // Other pack dependencies (optional)
)
```

#### RegisterExpansionPackWithAssembly
Registers your expansion pack with assembly reference for asset loading.
```csharp
bool RegisterExpansionPackWithAssembly(
    string packId,
    string packName,
    string packVersion,
    string author,
    System.Reflection.Assembly assembly,
    string[] dependencies = null
)
```

#### RegisterDecorItem
Registers a new decor item. Returns the assigned furniture ID or -1 on failure.
```csharp
int RegisterDecorItem(string packId, DecorItemData itemData)
```

#### Query Methods
```csharp
// Get all registered expansion packs
List<ExpansionPackInfo> GetRegisteredPacks()

// Get all registered decor items
List<DecorItemData> GetAllDecorItems()

// Get decor items by category (Note: categories not currently used in-game)
List<DecorItemData> GetDecorItemsByCategory(string category)

// Get decor item by ID
DecorItemData GetDecorItemById(int furnitureId)

// Get decor item by pack ID and internal name
DecorItemData GetDecorItem(string packId, string internalName)

// Get all items from a specific pack
List<DecorItemData> GetPackItems(string packId)

// Check if an ID is an expansion item
bool IsExpansionItem(int id)

// Check if a pack is registered
bool IsPackRegistered(string packId)

// Get pack info
ExpansionPackInfo GetPackInfo(string packId)
```

#### Management Methods
```csharp
// Unregister an expansion pack and all its items
bool UnregisterExpansionPack(string packId)

// Try to process pending items (called automatically)
void TryProcessPendingItems()
```

#### Logging Methods
```csharp
void LogInfo(string message)
void LogWarning(string message)
void LogError(string message)
```

## Data Structures

### DecorItemData

The main data structure for defining decor items. All properties have sensible defaults.

```csharp
public class DecorItemData
{
    // === Identity ===
    public string InternalName { get; set; }      // Unique ID within your pack (required)
    public string ItemName { get; set; }          // Display name in UI
    public string Description { get; set; }       // Item description
    public string Category { get; set; }          // Category (not currently used)
    public int FurnitureID { get; internal set; } // Auto-assigned by API

    // === Economics ===
    public float BaseCost { get; set; } = 100f;      // Purchase price (sell price is always 50%)

    // === Physical Properties ===
    public BoxSize BoxSize { get; set; } = BoxSize._8x8x8;  // Delivery box size
    public int BaseReferenceID { get; set; } = 2;           // Base furniture to inherit from
    
    // === Collision ===
    public Vector3 CollisionSize { get; set; } = Vector3.one;    // Collision box size
    public Vector3 CollisionCenter { get; set; } = Vector3.zero; // Collision center offset
    public bool IsWalkable { get; set; } = false;                // Can player walk through?

    // === Visual ===
    public Vector3 VisualScale { get; set; } = Vector3.one;  // Visual scale multiplier
    public Mesh CustomMesh { get; set; }                     // Custom mesh (optional)
    public Material CustomMaterial { get; set; }             // Custom material (optional)
    public Texture2D IconTexture { get; set; }               // UI icon (optional)

    // === Placement Rules ===
    public bool CanPlaceOnFloor { get; set; } = true;      // Allow floor placement
    public bool CanPlaceOnWalls { get; set; } = false;     // Allow wall placement
    public bool CanPlaceOnCeiling { get; set; } = false;   // Allow ceiling placement
    public bool RequiresFloorContact { get; set; } = true; // Must touch floor
    public bool AllowFloating { get; set; } = false;       // Can float in air

    // === Interaction ===
    public bool IsInteractable { get; set; } = false;   // Has interaction prompt
    public bool IsMoveable { get; set; } = true;        // Can be moved after placement
    public bool CanRotate { get; set; } = true;         // Can be rotated
    public bool CanScale { get; set; } = false;         // Can be scaled (not implemented)

    // === Rendering ===
    public bool CastShadows { get; set; } = true;       // Cast shadows
    public bool ReceiveShadows { get; set; } = true;    // Receive shadows

    // === Physics ===
    public bool HasPhysics { get; set; } = false;       // Enable physics simulation
    public bool IsKinematic { get; set; } = true;       // Kinematic rigidbody

    // === Unlock Requirements ===
    public int RequiredLevel { get; set; } = 1;         // Min store level required
    public bool IsUnlocked { get; set; } = true;        // Currently unlocked

    // === Asset References ===
    public string AssetBundleName { get; set; }         // Asset bundle name (for future use)
    public string MeshAssetName { get; set; }           // Mesh asset name for loading
    public string MaterialAssetName { get; set; }       // Material asset name
    public string IconAssetName { get; set; }           // Icon asset name
}
```

### ExpansionPackInfo

Information about a registered expansion pack.

```csharp
public class ExpansionPackInfo
{
    public string PackId { get; set; }              // Unique pack identifier
    public string PackName { get; set; }            // Display name
    public string Version { get; set; }             // Version string
    public string Author { get; set; }              // Author name
    public string[] Dependencies { get; set; }      // Required dependencies
    public List<int> RegisteredItems { get; set; }  // IDs of registered items
    public bool IsEnabled { get; set; } = true;     // Pack enabled state
    public Dictionary<string, object> CustomData { get; set; }  // Custom metadata
}
```

### Standard Categories

Use the `DecorCategories` class for standard category strings:

```csharp
public static class DecorCategories
{
    public const string Fixtures = "Fixtures";       // General fixtures and furniture
    public const string WallDecor = "WallDecor";     // Wall-mounted decorations
    public const string FloorDecor = "FloorDecor";   // Floor decorations
    public const string Lighting = "Lighting";       // Lamps and lighting
    public const string Outdoor = "Outdoor";         // Outdoor decorations
    public const string Seasonal = "Seasonal";       // Holiday/seasonal items
}
```

**Important**: Categories are for future use only. All items currently appear in the Furnitures page.

### BoxSize Enum

Must use the game's BoxSize enum values:
- `BoxSize._8x8x8` - Small items
- `BoxSize._15x15x15` - Medium items  
- `BoxSize._25x20x15` - Large items
- Other sizes as defined in the game

### Base Reference IDs

Use these constants from `DecorFurnitureIDs`:
- `BASE_SMALL_FURNITURE` = 2
- `BASE_MEDIUM_FURNITURE` = 3
- `BASE_LARGE_FURNITURE` = 4

## Asset Management

### Asset Loading System

The ExpansionAssetLoader automatically loads assets from your expansion pack's embedded resources. Assets should be organized in your project as follows:

```
YourProject/
├── Resources/
│   ├── Icons/
│   │   ├── lamp_icon.png
│   │   └── table_icon.png
│   ├── Meshes/
│   │   ├── lamp_mesh.json
│   │   └── table_mesh.json
│   └── Textures/
│       ├── lamp_Albedo.png
│       ├── lamp_Normal.png
│       └── table_Albedo.png
```

Set all resource files as **Embedded Resources** in your project.

### Loading Icons

Icons are automatically loaded when you set the `IconAssetName` property:

```csharp
itemData.IconAssetName = "lamp_icon"; // Loads Resources/Icons/lamp_icon.png
```

Or manually load and assign:

```csharp
var iconTexture = LoadTextureFromResource("YourNamespace.Resources.Icons.lamp_icon.png");
itemData.IconTexture = iconTexture;
```

### Loading Meshes

Meshes can be loaded from JSON format:

```csharp
itemData.MeshAssetName = "lamp_mesh"; // Loads Resources/Meshes/lamp_mesh.json
```

### Loading Materials

Materials are automatically created from textures:

```csharp
itemData.MeshAssetName = "lamp"; // Will look for lamp_Albedo.png and lamp_Normal.png
```

### Helper Methods

```csharp
private Texture2D LoadTextureFromResource(string resourcePath)
{
    var assembly = Assembly.GetExecutingAssembly();
    using (var stream = assembly.GetManifestResourceStream(resourcePath))
    {
        if (stream == null) return null;
        
        var buffer = new byte[stream.Length];
        stream.Read(buffer, 0, buffer.Length);
        
        var texture = new Texture2D(2, 2);
        ImageConversion.LoadImage(texture, buffer);
        return texture;
    }
}

private Material CreateCustomMaterial(Texture2D mainTexture)
{
    var shader = Shader.Find("Universal Render Pipeline/Lit") ?? 
                 Shader.Find("Standard");
    
    var material = new Material(shader);
    material.mainTexture = mainTexture;
    material.SetFloat("_Metallic", 0.1f);
    material.SetFloat("_Smoothness", 0.5f);
    return material;
}
```

## Examples

### Simple Lamp Item

```csharp
private void RegisterSimpleLamp()
{
    var lampData = new DecorItemData
    {
        // Identity
        InternalName = "modern_lamp",
        ItemName = "Modern Lamp",
        Description = "A stylish modern lamp for your store",
        Category = DecorCategories.Lighting,

        // Economics
        BaseCost = 150f,

        // Physical
        BoxSize = BoxSize._8x8x8,
        BaseReferenceID = DecorFurnitureIDs.BASE_SMALL_FURNITURE,

        // Collision
        CollisionSize = new Vector3(0.4f, 1.0f, 0.4f),
        CollisionCenter = new Vector3(0f, 0.5f, 0f),

        // Placement
        CanPlaceOnFloor = true,
        CanPlaceOnWalls = false,
        RequiresFloorContact = true,

        // Assets (auto-loaded from embedded resources)
        IconAssetName = "modern_lamp_icon"
    };

    int lampId = DecorExpansionAPI.RegisterDecorItem("your.pack.id", lampData);
    if (lampId > 0)
    {
        Logger.LogInfo($"Registered Modern Lamp with ID: {lampId}");
    }
}
```

### Wall Art with Custom Assets

```csharp
private void RegisterWallArt()
{
    // Load custom icon
    var iconTexture = LoadTextureFromResource(
        "YourNamespace.Resources.Icons.abstract_art_icon.png"
    );

    var artData = new DecorItemData
    {
        InternalName = "abstract_wall_art",
        ItemName = "Abstract Wall Art",
        Description = "Modern art piece for walls",
        Category = DecorCategories.WallDecor,

        // Economics
        BaseCost = 200f,

        // Physical
        BoxSize = BoxSize._8x8x8,
        BaseReferenceID = DecorFurnitureIDs.BASE_SMALL_FURNITURE,

        // Make it thinner for wall mounting
        CollisionSize = new Vector3(1.2f, 0.8f, 0.1f),
        CollisionCenter = new Vector3(0f, 0.4f, 0f),

        // Wall placement only
        CanPlaceOnFloor = false,
        CanPlaceOnWalls = true,
        AllowFloating = true,
        RequiresFloorContact = false,

        // Custom icon
        IconTexture = iconTexture,

        // Visual settings
        CastShadows = false,
        VisualScale = new Vector3(1.2f, 0.8f, 0.1f)
    };

    DecorExpansionAPI.RegisterDecorItem("your.pack.id", artData);
}
```

### Large Floor Plant

```csharp
private void RegisterFloorPlant()
{
    var plantData = new DecorItemData
    {
        InternalName = "tropical_floor_plant",
        ItemName = "Tropical Floor Plant",
        Description = "Large decorative plant",
        Category = DecorCategories.FloorDecor,

        // Higher price for larger item
        BaseCost = 350f,

        // Larger box size
        BoxSize = BoxSize._15x15x15,
        BaseReferenceID = DecorFurnitureIDs.BASE_MEDIUM_FURNITURE,

        // Taller collision
        CollisionSize = new Vector3(0.6f, 1.8f, 0.6f),
        CollisionCenter = new Vector3(0f, 0.9f, 0f),

        // Floor only
        CanPlaceOnFloor = true,
        RequiresFloorContact = true,

        // Assets
        MeshAssetName = "tropical_plant",
        IconAssetName = "tropical_plant_icon"
    };

    DecorExpansionAPI.RegisterDecorItem("your.pack.id", plantData);
}
```

### Complete Expansion Pack Example

```csharp
using BepInEx;
using BepInEx.Configuration;
using SupermarketDecorMod1.API;
using SupermarketDecorMod1.Data;
using System.Reflection;
using UnityEngine;

[BepInPlugin("com.example.modernDecorPack", "Modern Decor Pack", "1.0.0")]
[BepInDependency(DecorExpansionAPI.BASE_MOD_GUID)]
public class ModernDecorPack : BaseUnityPlugin
{
    // Configuration
    private ConfigEntry<float> PriceMultiplier;
    private ConfigEntry<bool> EnablePremiumItems;

    private void Awake()
    {
        // Load configuration
        PriceMultiplier = Config.Bind("General", "PriceMultiplier", 1.0f,
            new ConfigDescription("Multiplier for all item prices", 
                new AcceptableValueRange<float>(0.1f, 10f)));
        
        EnablePremiumItems = Config.Bind("General", "EnablePremiumItems", true,
            "Enable premium tier items");

        // Check base mod
        if (!DecorExpansionAPI.IsBaseModReady())
        {
            Logger.LogError("Super Decor Framework not found!");
            return;
        }

        // Register pack with assembly
        if (!DecorExpansionAPI.RegisterExpansionPackWithAssembly(
            "com.example.modernDecorPack",
            "Modern Decor Pack",
            "1.0.0",
            "Example Author",
            Assembly.GetExecutingAssembly()))
        {
            Logger.LogError("Failed to register pack!");
            return;
        }

        // Register items
        RegisterAllItems();
        
        Logger.LogInfo("Modern Decor Pack loaded successfully!");
    }

    private void RegisterAllItems()
    {
        // Basic items
        RegisterModernLamp();
        RegisterGlassTable();
        RegisterAbstractPainting();
        
        // Premium items
        if (EnablePremiumItems.Value)
        {
            RegisterLuxurySofa();
            RegisterCrystalChandelier();
        }
        
        // Log summary
        var items = DecorExpansionAPI.GetPackItems("com.example.modernDecorPack");
        Logger.LogInfo($"Registered {items.Count} items");
    }

    private void RegisterModernLamp()
    {
        var lamp = new DecorItemData
        {
            InternalName = "modern_floor_lamp",
            ItemName = "Modern Floor Lamp",
            Description = "Sleek LED floor lamp",
            Category = DecorCategories.Lighting,
            
            BaseCost = 180f * PriceMultiplier.Value,
            
            BoxSize = BoxSize._8x8x8,
            BaseReferenceID = DecorFurnitureIDs.BASE_SMALL_FURNITURE,
            
            CollisionSize = new Vector3(0.4f, 1.6f, 0.4f),
            CollisionCenter = new Vector3(0f, 0.8f, 0f),
            
            IconAssetName = "modern_lamp_icon",
            MeshAssetName = "modern_lamp"
        };
        
        DecorExpansionAPI.RegisterDecorItem("com.example.modernDecorPack", lamp);
    }
    
    // ... additional item registration methods
}
```

## Troubleshooting

### Common Issues

#### Items Not Appearing
- Ensure the base mod is loaded first
- Check that `IsMainFurniture` would be true (handled by the API)
- Verify the pack was registered successfully
- Check logs for registration errors

#### Invalid IDs
- IDs are automatically assigned in range 760000-999999
- Ensure `InternalName` is unique within your pack
- Check for ID collision warnings in logs

#### Missing Assets
- Verify resources are set as Embedded Resources
- Check resource paths match exactly (case-sensitive)
- Use debug logging to see which paths are being tried

#### Placement Issues
- Ensure `CollisionSize` is appropriate
- Check `BaseReferenceID` is valid (2, 3, or 4)
- Verify placement flags match intended behavior

### Debug Logging

Enable verbose logging to troubleshoot issues:

```csharp
// In your Awake method
DecorExpansionAPI.LogInfo("Starting registration...");

// After each item
var result = DecorExpansionAPI.RegisterDecorItem(packId, itemData);
if (result > 0)
{
    DecorExpansionAPI.LogInfo($"Success: {itemData.ItemName} = ID {result}");
}
else
{
    DecorExpansionAPI.LogError($"Failed: {itemData.ItemName}");
}
```

## Best Practices

### 1. Unique Identifiers
- Use reverse domain notation for pack IDs: `com.yourname.packname`
- Keep `InternalName` unique and descriptive within your pack
- Never hardcode furniture IDs - let the API assign them

### 2. Asset Organization
```
Resources/
├── Icons/           # 128x128 or 256x256 PNG files
├── Meshes/          # JSON mesh data
└── Textures/        # Diffuse and normal maps
    ├── item_Albedo.png
    └── item_Normal.png
```

### 3. Performance
- Keep mesh complexity reasonable (< 5000 vertices)
- Use texture atlasing for similar items
- Optimize textures (512x512 or 1024x1024 max)
- Reuse materials when possible

### 4. User Experience
- Provide clear, concise item names
- Write helpful descriptions
- Set appropriate prices based on item size/complexity
- Use proper collision sizes for good placement

### 5. Configuration
```csharp
// Allow users to customize your pack
private ConfigEntry<bool> EnableCategory;
private ConfigEntry<float> PriceAdjustment;
private ConfigEntry<int> MaxItemsPerType;
```

### 6. Error Handling
```csharp
try 
{
    var id = DecorExpansionAPI.RegisterDecorItem(packId, itemData);
    if (id < 0)
    {
        Logger.LogWarning($"Could not register {itemData.InternalName}");
    }
}
catch (Exception ex)
{
    Logger.LogError($"Error registering item: {ex.Message}");
}
```

### 7. Compatibility
- Always specify the base mod as a hard dependency
- Check API version for compatibility
- Handle missing optional features gracefully

## Advanced Features

### Direct Asset Assignment

While the API supports automatic asset loading through the `AssetName` properties, you can still manually load and assign assets if needed:

```csharp
// Manual asset loading
itemData.CustomMesh = LoadMeshManually();
itemData.IconTexture = LoadIconManually();

// Or use automatic loading
itemData.MeshAssetName = "item_name";      // Loads from Resources/Meshes/
itemData.IconAssetName = "item_icon";      // Loads from Resources/Icons/
```

## Version History

### v1.2.1 (Current)
- Removed methods that reference non-existent game classes SellPrice and DeliveryCost.

### v1.2.0
- New flexible category system (categories not yet used in-game)
- Improved asset loading system
- Added `RegisterExpansionPackWithAssembly` method
- Better error handling and logging

### v1.1.0
- Initial expansion pack support
- Basic item registration
- Automatic ID assignment

### v1.0.0
- Initial release
- Core functionality

## API Constants

```csharp
// API Version
DecorExpansionAPI.API_VERSION = "1.2.0"

// Base mod GUID
DecorExpansionAPI.BASE_MOD_GUID = "com.leptoon.supermarketdecormod1"

// ID Range
EXPANSION_ID_START = 760000
EXPANSION_ID_END = 999999

// Base furniture references
DecorFurnitureIDs.BASE_SMALL_FURNITURE = 2
DecorFurnitureIDs.BASE_MEDIUM_FURNITURE = 3
DecorFurnitureIDs.BASE_LARGE_FURNITURE = 4
```

## Support

For support, feature requests, or bug reports:
1. Check the troubleshooting section
2. Enable debug logging to gather information
3. Create an issue on the mod's repository
4. Include your BepInEx log file and expansion pack code

Remember that categories are not currently used in the game - all items appear in the Furnitures page regardless of category assignment.
