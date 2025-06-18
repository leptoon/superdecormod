import { ExpansionPack, DecorItem } from '../types/expansion';
import { CodeGenerator } from './codeGenerator';
import JSZip from 'jszip';

export class ProjectGenerator {
  private pack: ExpansionPack;
  private codeGenerator: CodeGenerator;

  constructor(pack: ExpansionPack) {
    this.pack = pack;
    this.codeGenerator = new CodeGenerator();
    this.codeGenerator.setCurrentPack(pack);
  }

  async generateProjectZip(): Promise<Blob> {
    const zip = new JSZip();
    const projectName = this.sanitizeProjectName(this.pack.pluginName);
    const projectFolder = zip.folder(projectName)!;

    // Generate all project files
    this.generateProjectFile(projectFolder);
    this.generateSourceCode(projectFolder);
    this.generateResourcesFolder(projectFolder);
    this.generateBuildScripts(projectFolder);
    this.generateReadme(projectFolder);
    this.generateGitIgnore(projectFolder);
    this.generateAssemblyInfo(projectFolder);

    // Generate the zip file
    const blob = await zip.generateAsync({ type: 'blob' });
    return blob;
  }

  private generateProjectFile(folder: JSZip) {
    const projectContent = `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net472</TargetFramework>
    <AssemblyName>${this.sanitizeProjectName(this.pack.pluginName)}</AssemblyName>
    <Description>${this.pack.pluginName} - Expansion pack for Super Decor</Description>
    <Version>${this.pack.version}</Version>
    <Authors>${this.pack.author}</Authors>
    <LangVersion>latest</LangVersion>
    <AllowUnsafeBlocks>true</AllowUnsafeBlocks>
    <GenerateAssemblyInfo>false</GenerateAssemblyInfo>
  </PropertyGroup>

  <ItemGroup>
    <!-- BepInEx reference -->
    <Reference Include="BepInEx">
      <HintPath>$(BepInExPath)\\core\\BepInEx.dll</HintPath>
      <Private>False</Private>
    </Reference>
    
    <!-- Unity references -->
    <Reference Include="UnityEngine">
      <HintPath>$(UnityPath)\\UnityEngine.dll</HintPath>
      <Private>False</Private>
    </Reference>
    <Reference Include="UnityEngine.CoreModule">
      <HintPath>$(UnityPath)\\UnityEngine.CoreModule.dll</HintPath>
      <Private>False</Private>
    </Reference>
    
    <!-- Super Decor API reference -->
    <Reference Include="SupermarketDecorMod1">
      <HintPath>$(BepInExPath)\\plugins\\SupermarketDecorMod1.dll</HintPath>
      <Private>False</Private>
    </Reference>
  </ItemGroup>

  <ItemGroup>
    <!-- Embedded Resources -->
${this.generateEmbeddedResourcesSection()}
  </ItemGroup>

  <PropertyGroup>
    <!-- Default paths - update these to match your installation -->
    <BepInExPath Condition="'$(BepInExPath)' == ''">C:\\Program Files (x86)\\Steam\\steamapps\\common\\Supermarket Simulator\\BepInEx</BepInExPath>
    <UnityPath Condition="'$(UnityPath)' == ''">C:\\Program Files (x86)\\Steam\\steamapps\\common\\Supermarket Simulator\\Supermarket Simulator_Data\\Managed</UnityPath>
  </PropertyGroup>

  <Target Name="PostBuild" AfterTargets="PostBuildEvent">
    <Copy SourceFiles="$(TargetPath)" DestinationFolder="$(BepInExPath)\\plugins" Condition="Exists('$(BepInExPath)\\plugins')" />
    <Message Text="Copied $(TargetFileName) to BepInEx plugins folder" Importance="high" Condition="Exists('$(BepInExPath)\\plugins')" />
  </Target>

</Project>`;

    folder.file(`${this.sanitizeProjectName(this.pack.pluginName)}.csproj`, projectContent);
  }

  private generateSourceCode(folder: JSZip) {
    const sourceFolder = folder.folder('src')!;
    
    // Generate main plugin file
    const mainCode = this.codeGenerator.generateExpansionPack(this.pack);
    sourceFolder.file(`${this.sanitizeClassName(this.pack.pluginName)}Plugin.cs`, mainCode);

    // Generate DecorItemIDs class for easy reference
    const itemIdsCode = this.generateItemIdsClass();
    sourceFolder.file('DecorItemIDs.cs', itemIdsCode);
  }

  private generateResourcesFolder(folder: JSZip) {
    const resourcesFolder = folder.folder('Resources')!;
    
    // Create folder structure
    const iconsFolder = resourcesFolder.folder('Icons')!;
    const meshesFolder = resourcesFolder.folder('Meshes')!;
    const texturesFolder = resourcesFolder.folder('Textures')!;

    // Generate placeholder files list
    const placeholderReadme = `# Resource Files

This folder should contain all the assets for your expansion pack.

## Required Files:

### Icons (PNG files, 128x128 recommended)
${this.pack.items.map((item: DecorItem) => `- Icons/${item.iconAssetName}.png`).join('\n')}

### Meshes (JSON files exported from Unity)
${this.pack.items.map((item: DecorItem) => `- Meshes/${item.meshAssetName}.json`).join('\n')}

### Textures (PNG files)
${this.pack.items.map((item: DecorItem) => `- Textures/${item.meshAssetName}_Albedo.png
- Textures/${item.meshAssetName}_Normal.png (optional)`).join('\n')}

## Asset Guidelines:

1. **Icons**: Should be 128x128 PNG files with transparency
2. **Meshes**: Export from Unity as JSON using the appropriate exporter
3. **Textures**: 
   - Albedo (color) texture is required
   - Normal map is optional but recommended
   - Use power-of-2 dimensions (512x512, 1024x1024, etc.)
`;

    resourcesFolder.file('README.md', placeholderReadme);
    
    // Create empty placeholder files
    this.pack.items.forEach((item: DecorItem) => {
      iconsFolder.file(`${item.iconAssetName}.png.placeholder`, 'Replace this file with your actual icon');
      meshesFolder.file(`${item.meshAssetName}.json.placeholder`, 'Replace this file with your actual mesh');
      texturesFolder.file(`${item.meshAssetName}_Albedo.png.placeholder`, 'Replace this file with your actual albedo texture');
    });
  }

  private generateBuildScripts(folder: JSZip) {
    // Windows batch file
    const buildBat = `@echo off
echo Building ${this.pack.pluginName}...
echo.

REM Restore NuGet packages
dotnet restore

REM Build the project
dotnet build -c Release

if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Build completed successfully!
echo Output: bin\\Release\\net472\\${this.sanitizeProjectName(this.pack.pluginName)}.dll
echo.
echo To install, copy the DLL to your BepInEx\\plugins folder
pause`;

    folder.file('build.bat', buildBat);

    // PowerShell script with more features
    const buildPs1 = `# ${this.pack.pluginName} Build Script

param(
    [string]$Configuration = "Release",
    [string]$BepInExPath = $env:BEPINEX_PATH,
    [switch]$Install
)

Write-Host "Building ${this.pack.pluginName}..." -ForegroundColor Green

# Build the project
dotnet build -c $Configuration

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Build completed successfully!" -ForegroundColor Green
$outputPath = "bin\\$Configuration\\net472\\${this.sanitizeProjectName(this.pack.pluginName)}.dll"
Write-Host "Output: $outputPath" -ForegroundColor Yellow

# Install to BepInEx if requested
if ($Install -and $BepInExPath) {
    $pluginsPath = Join-Path $BepInExPath "plugins"
    if (Test-Path $pluginsPath) {
        Write-Host "Installing to BepInEx plugins folder..." -ForegroundColor Cyan
        Copy-Item $outputPath $pluginsPath -Force
        Write-Host "Installation complete!" -ForegroundColor Green
    } else {
        Write-Host "BepInEx plugins folder not found at: $pluginsPath" -ForegroundColor Red
    }
}`;

    folder.file('build.ps1', buildPs1);
  }

  private generateReadme(folder: JSZip) {
    const readme = `# ${this.pack.pluginName}

${this.pack.author ? `By ${this.pack.author}` : ''}

Version: ${this.pack.version}

## Description

This is an expansion pack for the Super Decor mod that adds ${this.pack.items.length} new decorative items to Supermarket Simulator.

## Items Included

${this.pack.items.map((item: DecorItem) => `- **${item.itemName}**: ${item.description}`).join('\n')}

## Building the Project

### Prerequisites

1. **.NET Framework 4.7.2 SDK** - Download from Microsoft
2. **Visual Studio 2022** (recommended) or any IDE that supports C# development
3. **Game Installation** with BepInEx and Super Decor mod installed

### Build Instructions

1. **Update Reference Paths**:
   - Open the .csproj file
   - Update the BepInExPath and UnityPath properties to match your game installation
   - Default Steam path: \`C:\\Program Files (x86)\\Steam\\steamapps\\common\\Supermarket Simulator\`

2. **Add Assets**:
   - Replace all .placeholder files in the Resources folder with your actual assets
   - See Resources/README.md for detailed asset requirements

3. **Build**:
   - Using Visual Studio: Open the .csproj file and build (Ctrl+Shift+B)
   - Using Command Line: Run \`build.bat\` or \`dotnet build -c Release\`

4. **Install**:
   - Copy the output DLL from \`bin\\Release\\net472\` to your \`BepInEx\\plugins\` folder
   - Or use the PowerShell script: \`.\\build.ps1 -Install -BepInExPath "C:\\path\\to\\game\\BepInEx"\`

## Asset Creation Guide

### Icons
- Size: 128x128 pixels
- Format: PNG with transparency
- Style: Match the game's UI aesthetic

### Meshes
- Export from Unity as JSON format
- Keep polygon count reasonable for performance
- Ensure proper pivot points for placement

### Textures
- Albedo: Main color texture (required)
- Normal: Surface detail texture (optional)
- Recommended size: 512x512 or 1024x1024
- Format: PNG

## Troubleshooting

### Build Errors

1. **Missing References**: Ensure all DLL paths in the .csproj file are correct
2. **Asset Not Found**: Make sure all placeholder files are replaced with actual assets
3. **Version Conflicts**: Ensure you're using .NET Framework 4.7.2

### Runtime Issues

1. **Items Not Appearing**: Check the BepInEx console for errors
2. **Missing Textures**: Verify all texture files are properly embedded
3. **Crashes**: Check that all dependencies are installed correctly

## License

This expansion pack is provided as-is for the Super Decor modding community.

## Credits

- Super Decor Mod Framework by Leptoon
- The Super Decor Expansion Pack Generator was used to create this project.`;

    folder.file('README.md', readme);
  }

  private generateGitIgnore(folder: JSZip) {
    const gitignore = `## Ignore Visual Studio temporary files, build results, and
## files generated by popular Visual Studio add-ons.

# User-specific files
*.rsuser
*.suo
*.user
*.userosscache
*.sln.docstates

# Build results
[Dd]ebug/
[Dd]ebugPublic/
[Rr]elease/
[Rr]eleases/
x64/
x86/
[Aa][Rr][Mm]/
[Aa][Rr][Mm]64/
bld/
[Bb]in/
[Oo]bj/
[Ll]og/
[Ll]ogs/

# Visual Studio cache/options directory
.vs/

# .NET Core
project.lock.json
project.fragment.lock.json
artifacts/

# Files built by Visual Studio
*_i.c
*_p.c
*_h.h
*.ilk
*.meta
*.obj
*.iobj
*.pch
*.pdb
*.ipdb
*.pgc
*.pgd
*.rsp
*.sbr
*.tlb
*.tli
*.tlh
*.tmp
*.tmp_proj
*_wpftmp.csproj
*.log
*.vspscc
*.vssscc
.builds
*.pidb
*.svclog
*.scc

# NuGet Packages
*.nupkg
# The packages folder can be ignored because of Package Restore
**/[Pp]ackages/*
# except build/, which is used as an MSBuild target.
!**/[Pp]ackages/build/
# Uncomment if necessary however generally it will be regenerated when needed
#!**/[Pp]ackages/repositories.config
# NuGet v3's project.json files produces more ignorable files
*.nuget.props
*.nuget.targets`;

    folder.file('.gitignore', gitignore);
  }

  private generateAssemblyInfo(folder: JSZip) {
    const propertiesFolder = folder.folder('Properties')!;
    
    const assemblyInfo = `using System.Reflection;
using System.Runtime.InteropServices;

[assembly: AssemblyTitle("${this.pack.pluginName}")]
[assembly: AssemblyDescription("${this.pack.pluginName} - Expansion pack for Super Decor")]
[assembly: AssemblyConfiguration("")]
[assembly: AssemblyCompany("${this.pack.author}")]
[assembly: AssemblyProduct("${this.pack.pluginName}")]
[assembly: AssemblyCopyright("Copyright © ${this.pack.author} ${new Date().getFullYear()}")]
[assembly: AssemblyTrademark("")]
[assembly: AssemblyCulture("")]

[assembly: ComVisible(false)]

[assembly: AssemblyVersion("${this.pack.version}")]
[assembly: AssemblyFileVersion("${this.pack.version}")]`;

    propertiesFolder.file('AssemblyInfo.cs', assemblyInfo);
  }

  private generateItemIdsClass(): string {
    return `// Generated by Super Decor Expansion Pack Generator
// This file contains constants for all item IDs for easy reference

namespace ${this.sanitizeNamespace(this.pack.pluginId)}
{
    public static class DecorItemIDs
    {
${this.pack.items.map((item: DecorItem) => {
  const constantName = this.toUpperSnakeCase(item.internalName);
  return `        public const string ${constantName} = "${item.internalName}";`;
}).join('\n')}
    }
}`;
  }

  private generateEmbeddedResourcesSection(): string {
    const resources: string[] = [];
    
    this.pack.items.forEach((item: DecorItem) => {
      if (item.iconAssetName) {
        resources.push(`    <EmbeddedResource Include="Resources\\Icons\\${item.iconAssetName}.png" />`);
      }
      if (item.meshAssetName) {
        resources.push(`    <EmbeddedResource Include="Resources\\Meshes\\${item.meshAssetName}.json" />`);
        resources.push(`    <EmbeddedResource Include="Resources\\Textures\\${item.meshAssetName}_Albedo.png" />`);
        resources.push(`    <EmbeddedResource Include="Resources\\Textures\\${item.meshAssetName}_Normal.png" Condition="Exists('Resources\\Textures\\${item.meshAssetName}_Normal.png')" />`);
      }
    });

    return resources.join('\n');
  }

  // Helper methods
  private sanitizeProjectName(name: string): string {
    return name.replace(/[^a-zA-Z0-9]/g, '');
  }

  private sanitizeClassName(name: string): string {
    return name.replace(/[^a-zA-Z0-9]/g, '');
  }

  private sanitizeNamespace(pluginId: string): string {
    return pluginId.replace(/\./g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  }

  private toUpperSnakeCase(str: string): string {
    return str.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  }
}
