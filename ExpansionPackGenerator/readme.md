# Super Decor Expansion Pack Generator

Create custom expansion packs for Super Decor without writing any code! This visual tool lets you design decorative items and generates a complete Visual Studio project ready to compile.

🌐 **[Launch the Generator](https://leptoon.github.io/superdecormod/)** 

## What is This?

The Super Decor Expansion Pack Generator is a web-based tool that helps you create custom items for the Super Decor mod in Supermarket Simulator. Instead of manually writing C# code, you can:

- 🎨 Design items visually with an intuitive interface
- 📦 Download a complete Visual Studio project
- 🚀 Build and play with your custom items in minutes

## Quick Start Guide

### 1. Create Your Expansion Pack

1. **Open the Generator**: Visit [https://leptoon.github.io/superdecormod/](https://leptoon.github.io/superdecormod/)
2. **Set Pack Info**: Click "Pack Settings" and configure:
   - Plugin ID: `com.yourname.packname` (use your name!)
   - Plugin Name: Give your pack a friendly name
   - Version: Start with `1.0.0`
   - Author: Your name or username

### 2. Add Items

#### Option A: Use Templates (Recommended for beginners)
1. Click the ✨ sparkle button next to "Add Item"
2. Choose from templates like:
   - 🏺 Small Decoration
   - 🖼️ Wall Art
   - 🪴 Floor Plant
   - 💡 Desk Lamp
   - And more!

#### Option B: Create from Scratch
1. Click "Add Item"
2. Configure properties across tabs:
   - **Basic**: Name and description
   - **Economics**: Set the price
   - **Physical**: Size and appearance
   - **Assets**: Link to your 3D models and textures

### 3. Export Your Project

1. Click the **Export** button
2. Choose "Export Full Project"
3. Save the ZIP file
4. Extract it to a folder

### 4. Add Your Assets

In the extracted folder, add your files to the `Resources` folder:

```
Resources/
├── Icons/        (128x128 PNG images)
├── Meshes/       (JSON 3D models)
└── Textures/     (PNG textures)
```

**Asset Naming Example:**
For an item with internal name `crystal_ball`:
- Icon: `Icons/crystal_ball_icon.png`
- Mesh: `Meshes/crystal_ball.json`
- Texture: `Textures/crystal_ball_Albedo.png`

### 5. Build Your Pack

#### Easy Method:
1. Double-click `build.bat`
2. Find your DLL in `bin/Release/net472/`

#### Visual Studio Method:
1. Open the `.csproj` file
2. Press Ctrl+Shift+B to build
3. Your DLL is ready!

### 6. Install and Play

1. Copy your DLL to: `Supermarket Simulator/BepInEx/plugins/`
2. Launch the game
3. Find your items in the Furnitures menu!

## Features Explained

### 📋 Item Properties

| Property | What it Does |
|----------|--------------|
| **Internal Name** | Unique ID for your item (lowercase_with_underscores) |
| **Display Name** | What players see in-game |
| **Base Cost** | Purchase price (delivery/sell prices are automatic) |
| **Box Size** | Small (8x8x8), Medium (15x15x15), or Large (25x20x15) |
| **Category** | For organization (all items appear in Furnitures currently) |

### 🎯 Tips for Success

1. **Start Simple**: Use templates and modify them
2. **Test Often**: Build and test with one item before adding many
3. **Asset Sizes**: Keep textures at 512x512 or 1024x1024
4. **Unique Names**: Each item needs a unique internal name

### ⚠️ Important Notes

- **Categories**: All items appear in the Furnitures page (categories are for future use)
- **Pricing**: Delivery cost and sell price are calculated automatically
- **Placement Rules**: Some options marked "NOT IMPLEMENTED" are for future updates

## Troubleshooting

### "Build failed"
- Install .NET Framework 4.7.2 SDK
- Check that BepInEx path is correct in the .csproj file

### "Items don't appear"
- Check BepInEx console for errors (F12 in-game)
- Verify your DLL is in the plugins folder
- Ensure Super Decor base mod is installed

### "Missing textures"
- Check file names match exactly (case-sensitive!)
- Ensure files are in the correct Resources subfolder
- Remove `.placeholder` extensions from asset files

## Requirements

To build generated projects, you need:
- ✅ .NET Framework 4.7.2 SDK ([Download](https://dotnet.microsoft.com/download/dotnet-framework/net472))
- ✅ Visual Studio 2022 Community ([Download](https://visualstudio.microsoft.com/vs/community/)) or just the Build Tools
- ✅ Supermarket Simulator with BepInEx and Super Decor installed

## Community

- 💬 **Discord**: [Join our community](https://discord.gg/yourdiscord)
- 🐛 **Issues**: [Report bugs](https://github.com/leptoon/superdecormod/issues)
- 💡 **Ideas**: [Request features](https://github.com/leptoon/superdecormod/discussions)

## Credits

Created by leptoon for the Super Decor modding community.

Special thanks to:
- The Super Decor framework creators
- BepInEx development team
- All the mod creators and players

---

Happy decorating! 🎨✨