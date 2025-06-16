# Super Decor Expansion Pack API Documentation

## Overview

The Super Decor Expansion Pack API provides a comprehensive framework for developers to create expansion packs that seamlessly integrate with the Super Decor mod for Supermarket Simulator. This API follows a modular architecture similar to The Sims expansion pack system, where the base Super Decor mod must be installed for any expansion packs to function.

## Core Architecture

### API System (`DecorExpansionAPI.cs`)

The Super Decor API serves as the central interface between expansion packs and the base mod. It provides complete functionality for:

- **Expansion Pack Registration**: Secure registration system with dependency management
- **Item Management**: Deterministic ID assignment and item registration
- **Asset Integration**: Full support for custom models, textures, and materials
- **Configuration Management**: Per-expansion configuration with persistent storage
- **Spawning System**: Direct integration with the game's furniture placement system

### Key Technical Features

#### Deterministic ID Generation
The API uses a cryptographic hash-based system to generate furniture IDs, ensuring that:
- Each item receives a unique, persistent ID between 760000-999999
- IDs remain constant across game sessions, mod reinstalls, and load order changes
- Save files remain valid regardless of expansion pack installation order
- Hash collisions are automatically detected and resolved

#### Dependency Management
- Expansion packs can declare dependencies on other expansion packs
- The API validates all dependencies before allowing item registration
- Circular dependencies are prevented through validation checks
- Version compatibility can be enforced through the dependency system

#### Memory-Efficient Asset System
- Assets are loaded on-demand and cached for performance
- Unused assets can be unloaded to conserve memory
- Fallback assets are provided if custom assets fail to load
- Support for Unity AssetBundles enables professional-quality content

## Data Structures

### DecorItemData Class

The `DecorItemData` class defines all properties of a decorative item:

#### Identity Properties
- `InternalName`: Unique identifier within the expansion pack
- `ItemName`: Display name shown to players
- `Description`: Item description for UI tooltips
- `Category`: Classification (Furniture, WallDecor, FloorDecor, Lighting, Plants, Sculptures, Storage, Seasonal, Other)

#### Physical Properties
- `BoxSize`: Shipping box size (matches game's box size system)
- `CollisionSize`: 3D bounding box for collision detection
- `CollisionCenter`: Offset for collision box center
- `Weight`: Item weight affecting physics
- `Fragility`: Damage susceptibility (0.0-1.0)

#### Visual Properties
- `VisualScale`: Display scale multiplier
- `CustomMesh`: Optional custom 3D model
- `CustomMaterial`: Optional custom material/shader
- `IconTexture`: UI icon for menus
- `CustomPrefabName`: Reference to complex prefab in asset bundle

#### Economic Properties
- `BaseCost`: Purchase price
- `DeliveryFee`: Shipping cost
- `DeliveryCost`: Additional delivery charges
- `SellPrice`: Resale value

#### Placement Rules
- `CanPlaceOnFloor`: Floor placement allowed
- `CanPlaceOnWalls`: Wall mounting allowed
- `CanPlaceOnShelves`: Shelf placement allowed
- `IsSinglePlacement`: Restricts to one instance
- `RequiresFloorContact`: Must touch ground
- `AllowFloating`: Can be placed in mid-air

#### Interaction Settings
- `IsInteractable`: Player can interact with item
- `IsMoveable`: Can be relocated after placement
- `CanRotate`: Rotation allowed during placement
- `CanScale`: Dynamic scaling permitted
- `IsWalkable`: Players can walk through item

## API Methods

### Expansion Pack Registration

```csharp
public static bool RegisterExpansionPack(
    string packId,           // Unique identifier
    string packName,         // Display name
    string packVersion,      // Version string
    string author = "",      // Author name
    string[] dependencies = null  // Required packs
)
```

Registers an expansion pack with the Super Decor system. This must be called before registering any items.

### Item Registration

```csharp
public static int RegisterDecorItem(
    string packId,
    DecorItemData itemData
)
```

Registers a single decorative item. Returns the assigned furniture ID (760000+) or -1 on failure.

```csharp
public static List<int> RegisterDecorItems(
    string packId,
    List<DecorItemData> items
)
```

Batch registration for multiple items. Returns list of assigned IDs.

### Asset Management

```csharp
public static bool RegisterAssets(
    string packId,
    string assetBundlePath
)
```

Loads an asset bundle from disk and associates it with the expansion pack.

```csharp
public static void RegisterAssetBundle(
    string packId,
    AssetBundle bundle
)
```

Registers an already-loaded asset bundle.

```csharp
public static T LoadAsset<T>(
    string packId,
    string assetName
) where T : UnityEngine.Object
```

Loads a specific asset from the expansion's asset bundle.

### Item Spawning

```csharp
public static GameObject SpawnDecorItem(
    string internalName,
    Vector3 position,
    Quaternion rotation
)
```

Spawns an item by its internal name at the specified location.

```csharp
public static GameObject SpawnDecorItem(
    int furnitureId,
    Vector3 position,
    Quaternion rotation
)
```

Spawns an item by its furniture ID.

### Configuration Management

```csharp
public static T GetConfig<T>(
    string packId,
    string key,
    T defaultValue
)
```

Retrieves a configuration value for the expansion pack.

```csharp
public static void SetConfig<T>(
    string packId,
    string key,
    T value
)
```

Stores a configuration value persistently.

### Query Methods

```csharp
public static bool IsExpansionPackRegistered(string packId)
```

Checks if an expansion pack is registered.

```csharp
public static List<DecorItemData> GetExpansionPackItems(string packId)
```

Returns all items registered by a specific expansion pack.

```csharp
public static DecorItemData GetDecorItem(string packId, string internalName)
```

Retrieves item data by pack ID and internal name.

```csharp
public static bool IsExpansionItem(int furnitureId)
```

Checks if a furniture ID belongs to expansion content (ID >= 760000).

```csharp
public static Dictionary<string, ExpansionPackInfo> GetRegisteredExpansionPacks()
```

Returns information about all registered expansion packs.

## Asset System Details

### AssetManager Integration

The Super Decor API integrates with an enhanced asset management system that provides:

#### Asset Loading
- **Textures**: Support for all Unity texture formats
- **Meshes**: 3D models in FBX, OBJ, or Unity mesh format
- **Materials**: Custom shaders and material properties
- **Prefabs**: Complete GameObject hierarchies

#### Asset Bundle Creation
1. Create assets in Unity (same version as Supermarket Simulator)
2. Mark assets for inclusion in asset bundles
3. Build bundles for Windows platform
4. Include bundle files with expansion pack

#### Memory Management
- Assets are reference-counted for automatic unloading
- Texture compression reduces memory footprint
- LOD (Level of Detail) support for complex models
- Async loading prevents frame drops

### Fallback System

If custom assets fail to load, the API provides fallbacks:
- Default cube mesh for missing models
- Standard material for missing shaders
- Placeholder icon for missing UI sprites
- Error logging for debugging

## Configuration System

### ConfigurationManager Features

Each expansion pack receives its own configuration file stored in the BepInEx config folder:

#### File Structure
```
BepInEx/config/
├── SupermarketDecor.ExpansionPackId.cfg
├── SupermarketDecor.AnotherPack.cfg
└── ...
```

#### Configuration Sections
- **General**: Pack-wide settings
- **Items**: Per-item enable/disable
- **Visuals**: Graphics quality options
- **Performance**: LOD and optimization settings

#### Automatic Backup
- Configs are backed up before major changes
- Rollback functionality for corrupted configs
- Export/import for sharing configurations

## Integration with Game Systems

### IDManager Integration
The API seamlessly integrates with Supermarket Simulator's IDManager:
- Items are properly registered in the furniture database
- Localization entries are automatically created
- Save/load compatibility is maintained

### FurnitureGenerator Compatibility
Expansion items work with the game's spawning system:
- Box delivery system recognizes expansion items
- Inventory management includes expansion items
- Economic calculations apply to expansion items

### Placement System
Items use the game's standard placement mechanics:
- Grid snapping for floor items
- Wall mounting for decorations
- Rotation with mouse wheel
- Height adjustment support

## Best Practices

### Performance Optimization
1. **Texture Sizes**: Keep textures at reasonable resolutions (512x512 or 1024x1024)
2. **Polygon Counts**: Aim for under 5000 triangles per decorative item
3. **Batch Registration**: Register multiple items at once to reduce overhead
4. **Asset Reuse**: Share materials and textures between similar items

### ID Safety
The deterministic ID system ensures save file compatibility:
- Never manually assign furniture IDs
- Use unique internal names for each item
- Include pack ID in asset names to prevent conflicts

### Error Handling
1. Always check return values from API calls
2. Provide meaningful error messages in logs
3. Implement graceful degradation for missing assets
4. Test with various load orders

### Compatibility
- Target .NET Framework 4.7.2 or compatible
- Use BepInEx 5.4.21 or newer
- Reference the base mod as a hard dependency
- Avoid modifying base game classes directly

## Example Implementation

### Minimal Expansion Pack

```csharp
[BepInPlugin("com.example.simplefurniture", "Simple Furniture Pack", "1.0.0")]
[BepInDependency("com.leptoon.supermarketdecomod1", BepInDependency.DependencyFlags.HardDependency)]
public class SimpleFurniturePack : BaseUnityPlugin
{
    private void Awake()
    {
        // Register the expansion pack
        if (!DecorExpansionAPI.RegisterExpansionPack(
            "simple_furniture",
            "Simple Furniture Pack",
            "1.0.0",
            "Your Name"))
        {
            Logger.LogError("Failed to register expansion pack!");
            return;
        }

        // Create item data
        var chair = new DecorItemData
        {
            InternalName = "modern_chair",
            ItemName = "Modern Chair",
            Description = "A comfortable modern chair",
            Category = DecorCategory.Furniture,
            BaseCost = 50f,
            BoxSize = BoxSize._2x2x2,
            CollisionSize = new Vector3(0.5f, 1f, 0.5f)
        };

        // Register the item
        int chairId = DecorExpansionAPI.RegisterDecorItem("simple_furniture", chair);
        
        if (chairId > 0)
        {
            Logger.LogInfo($"Successfully registered Modern Chair with ID: {chairId}");
        }
    }
}
```

### Advanced Features

For complex expansion packs, the API supports:
- **Custom Behaviors**: Add MonoBehaviour components to items
- **Seasonal Items**: Enable/disable based on date
- **Progressive Unlocking**: Tie items to player level
- **Item Sets**: Group related items with bonuses
- **Dynamic Pricing**: Adjust costs based on market conditions

## Troubleshooting

### Common Issues

1. **Items Not Appearing**: Ensure base mod is loaded first via BepInDependency
2. **ID Conflicts**: Use unique internal names including pack prefix
3. **Missing Textures**: Verify asset bundle paths are correct
4. **Performance Issues**: Check polygon counts and texture sizes
5. **Save Corruption**: Never modify IDs after release

### Debug Tools

The API provides logging methods:
- `DecorExpansionAPI.LogInfo()`: General information
- `DecorExpansionAPI.LogWarning()`: Potential issues
- `DecorExpansionAPI.LogError()`: Critical failures

Enable verbose logging in the base mod config for detailed diagnostics.

## Version Compatibility

### API Version 1.1.0
- Deterministic ID generation system
- Enhanced collision detection
- Improved asset management
- Backward compatible with 1.0.0 data structures

### Future Compatibility
The API is designed for long-term stability:
- Semantic versioning for clear upgrade paths
- Deprecated features maintained for compatibility
- Migration tools for major version changes
- Extensive testing before releases

## Conclusion

The Super Decor Expansion Pack API provides a robust, safe, and feature-rich platform for extending Supermarket Simulator with custom decorative content. By following the guidelines and best practices outlined in this documentation, developers can create high-quality expansion packs that integrate seamlessly with the base game while maintaining save file compatibility and performance standards.
