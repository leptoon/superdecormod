# Super Decor Expansion API Documentation
Version 1.2.0

## Overview
The Super Decor Expansion API allows mod developers to create expansion packs that add new decorative items to Supermarket Simulator. These items will appear in the Furnitures section of the in-game computer for purchase.

## Important Notes
- **Categories are not currently used**: While the API supports categorization, all items currently appear in the Furnitures page regardless of their assigned category. Categories are implemented for future use when a custom decor UI might be added.
- All expansion pack items are assigned IDs in the range 760000-999999
- The base framework (com.leptoon.supermarketdecomod1) must be installed for expansion packs to work

## Getting Started

### Basic Expansion Pack Structure
```csharp
using BepInEx;
using SupermarketDecorMod1.API;
using SupermarketDecorMod1.Data;

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

        // Register your expansion pack
        bool registered = DecorExpansionAPI.RegisterExpansionPack(
            packId: "your.unique.plugin.id",
            packName: "Your Pack Name",
            packVersion: "1.0.0",
            author: "Your Name"
        );

        if (registered)
        {
            RegisterYourItems();
        }
    }
}
```

## API Reference

### Core Methods

#### RegisterExpansionPack
Registers your expansion pack with the framework.
```csharp
bool RegisterExpansionPack(string packId, string packName, string packVersion, string author = "", string[] dependencies = null)
```

#### RegisterDecorItem
Registers a new decor item. Returns the assigned furniture ID or -1 on failure.
```csharp
int RegisterDecorItem(string packId, DecorItemData itemData)
```

### DecorItemData Structure

```csharp
public class DecorItemData
{
    // Identity
    public string InternalName { get; set; }      // Unique identifier within your pack
    public string ItemName { get; set; }          // Display name
    public string Description { get; set; }       // Item description
    public string Category { get; set; }          // Category (not currently used in-game)

    // Economic
    public float BaseCost { get; set; }           // Purchase price
    public float DeliveryCost { get; set; }       // Delivery cost
    public float SellPrice { get; set; }          // Sell back price

    // Physical
    public BoxSize BoxSize { get; set; }          // Box size (must match game's enum)
    public int BaseReferenceID { get; set; }      // Base furniture to inherit from

    // Collision
    public Vector3 CollisionSize { get; set; }    // Collision box size
    public Vector3 CollisionCenter { get; set; }  // Collision box center offset
    public bool IsWalkable { get; set; }          // Can player walk through?

    // Visual
    public Vector3 VisualScale { get; set; }      // Visual scale multiplier
    public Mesh CustomMesh { get; set; }          // Custom mesh (optional)
    public Material CustomMaterial { get; set; }  // Custom material (optional)
    public Texture2D IconTexture { get; set; }    // Icon for UI (optional)

    // Placement
    public bool CanPlaceOnFloor { get; set; }     // Can place on floor
    public bool CanPlaceOnWalls { get; set; }     // Can place on walls
    public bool RequiresFloorContact { get; set; } // Must touch floor
    public bool AllowFloating { get; set; }       // Can float in air

    // Other properties...
}
```

### Standard Categories

Use the `DecorCategories` class for standard category strings:
```csharp
DecorCategories.Fixtures    // General fixtures and furniture
DecorCategories.WallDecor   // Wall-mounted decorations
DecorCategories.FloorDecor  // Floor decorations (plants, rugs, etc.)
DecorCategories.Lighting    // Lamps and lighting fixtures
DecorCategories.Outdoor     // Outdoor decorations
DecorCategories.Seasonal    // Holiday and seasonal items
```

**Important**: 
- Categories are for future use only. All items currently appear in Furnitures.
- Expansion packs must use one of these standard categories. Invalid categories will default to "Fixtures".
- Custom categories cannot be added by expansion packs.

### BoxSize Values
Must use the game's BoxSize enum values:
- `BoxSize._8x8x8` - Small items
- `BoxSize._15x15x15` - Medium items
- `BoxSize._25x20x15` - Large items
- Other sizes as defined in the game

### Base Reference IDs
Use these constants from DecorFurnitureIDs:
- `BASE_SMALL_FURNITURE` = 2
- `BASE_MEDIUM_FURNITURE` = 3
- `BASE_LARGE_FURNITURE` = 4

## Example: Creating a Simple Item

```csharp
private void RegisterYourItems()
{
    var lampData = new DecorItemData
    {
        // Identity
        InternalName = "modern_lamp",
        ItemName = "Modern Lamp",
        Description = "A stylish modern lamp",
        Category = DecorCategories.Lighting,  // For future use

        // Economics
        BaseCost = 150f,
        DeliveryCost = 15f,
        SellPrice = 105f,

        // Physical properties
        BoxSize = BoxSize._8x8x8,
        BaseReferenceID = DecorFurnitureIDs.BASE_SMALL_FURNITURE,

        // Collision
        CollisionSize = new Vector3(0.4f, 1.0f, 0.4f),
        CollisionCenter = new Vector3(0f, 0.5f, 0f),
        IsWalkable = false,

        // Visual
        VisualScale = new Vector3(0.8f, 0.8f, 0.8f),

        // Placement rules
        CanPlaceOnFloor = true,
        CanPlaceOnWalls = false,
        RequiresFloorContact = true,
        
        // Features
        IsMoveable = true,
        CanRotate = true,
        CastShadows = true
    };

    int lampId = DecorExpansionAPI.RegisterDecorItem("your.unique.plugin.id", lampData);
    if (lampId > 0)
    {
        Logger.LogInfo($"Registered lamp with ID: {lampId}");
    }
}
```

## Custom Assets

### Loading Textures
```csharp
// From embedded resources
var iconTexture = LoadTextureFromResource("YourNamespace.Resources.Icons.lamp_icon.png");
itemData.IconTexture = iconTexture;

// Helper method
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
```

### Creating Custom Materials
```csharp
var material = new Material(Shader.Find("Standard"));
material.mainTexture = yourTexture;
material.SetFloat("_Metallic", 0.1f);
material.SetFloat("_Smoothness", 0.5f);
itemData.CustomMaterial = material;
```

## Best Practices

1. **Unique Internal Names**: Always use unique internal names for your items to avoid conflicts
2. **Null Checks**: Always check if the base mod is ready before registering
3. **Error Handling**: Log errors appropriately using your plugin's logger
4. **Categories**: Assign appropriate categories even though they're not used yet
5. **Collision Sizes**: Test collision sizes in-game to ensure proper placement
6. **Icons**: Provide custom icons for better visual identification

## Debugging

Use the logging methods provided:
```csharp
DecorExpansionAPI.LogInfo("Information message");
DecorExpansionAPI.LogWarning("Warning message");
DecorExpansionAPI.LogError("Error message");
```

## Version History

- **1.2.0**: New flexible category system (categories not yet used in-game)
- **1.1.0**: Added expansion pack support
- **1.0.0**: Initial release
