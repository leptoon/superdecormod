import { type ExpansionPack, type DecorItem, type Vector3, type ConfigurationOption } from '../types/expansion';

export class CodeGenerator {
  private indentSize = 4;

  generateExpansionPack(pack: ExpansionPack): string {
    const sections = [
      this.generateHeader(pack),
      this.generateUsings(),
      '',
      this.generateNamespace(pack)
    ];

    return sections.join('\n');
  }

  private generateHeader(pack: ExpansionPack): string {
    return `// Generated by Super Decor Expansion Pack Generator
// Pack: ${pack.pluginName} v${pack.version}
// Author: ${pack.author}
// Generated: ${new Date().toISOString()}`;
  }

  private generateUsings(): string {
    return `using BepInEx;
using BepInEx.Configuration;
using SupermarketDecorMod1.API;
using UnityEngine;
using System.Collections.Generic;`;
  }

  private generateNamespace(pack: ExpansionPack): string {
    const namespaceName = this.sanitizeNamespace(pack.pluginId);
    const className = this.generateClassName(pack.pluginName);

    return `namespace ${namespaceName}
{
    /// <summary>
    /// ${pack.pluginName} - Expansion pack for Super Decor
    /// </summary>
    [BepInPlugin("${pack.pluginId}", "${pack.pluginName}", "${pack.version}")]
    [BepInDependency(DecorExpansionAPI.BASE_MOD_GUID, BepInDependency.DependencyFlags.HardDependency)]
    public class ${className} : BaseUnityPlugin
    {
${this.generateConfiguration(pack.configuration)}
${this.generateItemIdFields(pack.items)}

        private void Awake()
        {
${this.generateAwakeMethod(pack)}
        }

${this.generateRegisterItemsMethod(pack)}
${this.generateRegisterItemMethod()}
${this.generateGetRegisteredCountMethod(pack.items)}
    }
}`;
  }

  private generateConfiguration(config: any): string {
    if (!config.options || config.options.length === 0) {
      return '';
    }

    const indent = this.getIndent(2);
    const configLines: string[] = ['        // Configuration'];

    config.options.forEach((option: ConfigurationOption) => {
      const configType = this.getConfigType(option.type);
      configLines.push(`${indent}private ConfigEntry<${configType}> ${option.name};`);
    });

    return configLines.join('\n');
  }

  private generateItemIdFields(items: DecorItem[]): string {
    if (items.length === 0) return '';

    const indent = this.getIndent(2);
    const lines = ['        // Store the IDs assigned by the API'];

    items.forEach(item => {
      const fieldName = `${this.toCamelCase(item.internalName)  }Id`;
      lines.push(`${indent}private int ${fieldName} = -1;`);
    });

    return lines.join('\n');
  }

  private generateAwakeMethod(pack: ExpansionPack): string {
    const indent = this.getIndent(3);
    const lines: string[] = [];

    // Configuration binding
    if (pack.configuration.options && pack.configuration.options.length > 0) {
      lines.push(`${indent}// Load config`);
      pack.configuration.options.forEach(option => {
        lines.push(this.generateConfigBinding(option, indent));
      });
      lines.push('');
    }

    // Base mod check
    lines.push(`${indent}// Check if base mod is ready`);
    lines.push(`${indent}if (!DecorExpansionAPI.IsBaseModReady())`);
    lines.push(`${indent}{`);
    lines.push(`${indent}    Logger.LogError("Supermarket Decor Framework is not loaded!");`);
    lines.push(`${indent}    return;`);
    lines.push(`${indent}}`);
    lines.push('');

    // Register with assembly
    lines.push(`${indent}// Register with assembly for asset loading`);
    lines.push(`${indent}if (!DecorExpansionAPI.RegisterExpansionPackWithAssembly(`);
    lines.push(`${indent}    packId: "${pack.pluginId}",`);
    lines.push(`${indent}    packName: "${pack.pluginName}",`);
    lines.push(`${indent}    packVersion: "${pack.version}",`);
    lines.push(`${indent}    author: "${pack.author}",`);
    lines.push(`${indent}    assembly: System.Reflection.Assembly.GetExecutingAssembly()))`);
    lines.push(`${indent}{`);
    lines.push(`${indent}    Logger.LogError("Failed to register expansion pack!");`);
    lines.push(`${indent}    return;`);
    lines.push(`${indent}}`);
    lines.push('');

    // Register items
    lines.push(`${indent}// Register items`);
    lines.push(`${indent}RegisterItems();`);

    return lines.join('\n');
  }

  private generateRegisterItemsMethod(pack: ExpansionPack): string {
    const indent = this.getIndent(2);
    const lines: string[] = [
      '',
      `${indent}private void RegisterItems()`,
      `${indent}{`
    ];

    pack.items.forEach((item, index) => {
      if (index > 0) lines.push('');
      
      lines.push(`${indent}    // ${item.itemName}`);
      const fieldName = `${this.toCamelCase(item.internalName)  }Id`;
      lines.push(`${indent}    ${fieldName} = RegisterItem(new DecorItemData`);
      lines.push(`${indent}    {`);
      lines.push(this.generateItemData(item, pack, `${indent  }        `));
      lines.push(`${indent}    });`);
    });

    lines.push('');
    lines.push(`${indent}    Logger.LogInfo($"${pack.pluginName} registered {GetRegisteredCount()} items");`);
    lines.push(`${indent}}`);

    return lines.join('\n');
  }

  private generateItemData(item: DecorItem, pack: ExpansionPack, baseIndent: string): string {
    const lines: string[] = [];
    
    // Basic properties
    lines.push(`${baseIndent}InternalName = "${item.internalName}",`);
    lines.push(`${baseIndent}ItemName = "${this.escapeString(item.itemName)}",`);
    lines.push(`${baseIndent}Description = "${this.escapeString(item.description)}",`);
    lines.push(`${baseIndent}Category = DecorCategories.${item.category},`);
    lines.push(`${baseIndent}BaseCost = ${item.baseCost}f,`);
    lines.push(`${baseIndent}BoxSize = BoxSize.${item.boxSize},`);
    lines.push(`${baseIndent}BaseReferenceID = ${item.baseReferenceId},`);
    lines.push(`${baseIndent}CollisionSize = ${this.formatVector3(item.collisionSize)},`);
    lines.push(`${baseIndent}CollisionCenter = ${this.formatVector3(item.collisionCenter)},`);
    lines.push(`${baseIndent}IsWalkable = ${item.isWalkable ? 'true' : 'false'},`);

    // Visual scale (only include if not default)
    if (!this.isDefaultVector3(item.visualScale)) {
      lines.push(`${baseIndent}VisualScale = ${this.formatVector3(item.visualScale)},`);
    }

    // Placement options
    lines.push(`${baseIndent}CanPlaceOnFloor = ${item.canPlaceOnFloor ? 'true' : 'false'},`);
    lines.push(`${baseIndent}CanPlaceOnWalls = ${item.canPlaceOnWalls ? 'true' : 'false'},`);
    lines.push(`${baseIndent}CanPlaceOnCeiling = ${item.canPlaceOnCeiling ? 'true' : 'false'},`);
    lines.push(`${baseIndent}RequiresFloorContact = ${item.requiresFloorContact ? 'true' : 'false'},`);
    lines.push(`${baseIndent}AllowFloating = ${item.allowFloating ? 'true' : 'false'},`);

    // Interaction options
    lines.push(`${baseIndent}IsInteractable = ${item.isInteractable ? 'true' : 'false'},`);
    lines.push(`${baseIndent}IsMoveable = ${item.isMoveable ? 'true' : 'false'},`);
    lines.push(`${baseIndent}CanRotate = ${item.canRotate ? 'true' : 'false'},`);
    lines.push(`${baseIndent}CanScale = ${item.canScale ? 'true' : 'false'},`);

    // Physics options
    lines.push(`${baseIndent}CastShadows = ${item.castShadows ? 'true' : 'false'},`);
    lines.push(`${baseIndent}ReceiveShadows = ${item.receiveShadows ? 'true' : 'false'},`);
    lines.push(`${baseIndent}HasPhysics = ${item.hasPhysics ? 'true' : 'false'},`);
    lines.push(`${baseIndent}IsKinematic = ${item.isKinematic ? 'true' : 'false'},`);

    // Unlock options
    lines.push(`${baseIndent}RequiredLevel = ${item.requiredLevel},`);
    if (!item.isUnlocked) {
      lines.push(`${baseIndent}IsUnlocked = false,`);
    }

    // Asset references
    lines.push(`${baseIndent}AssetBundleName = "${pack.pluginId}",`);
    if (item.iconAssetName) {
      lines.push(`${baseIndent}IconAssetName = "${item.iconAssetName}",`);
    }
    if (item.meshAssetName) {
      lines.push(`${baseIndent}MeshAssetName = "${item.meshAssetName}",`);
    }
    if (item.materialAssetName) {
      lines.push(`${baseIndent}MaterialAssetName = "${item.materialAssetName}"`);
    }

    // Remove trailing comma from last line
    const lastLine = lines[lines.length - 1];
    if (lastLine.endsWith(',')) {
      lines[lines.length - 1] = lastLine.slice(0, -1);
    }

    return lines.join('\n');
  }

  private generateRegisterItemMethod(): string {
    const indent = this.getIndent(2);
    return `
${indent}/// <summary>
${indent}/// Register a single item and return its ID
${indent}/// </summary>
${indent}private int RegisterItem(DecorItemData itemData)
${indent}{
${indent}    int id = DecorExpansionAPI.RegisterDecorItem("${this.pack?.pluginId || 'PLUGIN_ID'}", itemData);
${indent}    if (id > 0)
${indent}    {
${indent}        Logger.LogInfo($"Registered {itemData.ItemName} with ID: {id}");
${indent}    }
${indent}    else
${indent}    {
${indent}        Logger.LogError($"Failed to register {itemData.ItemName}");
${indent}    }
${indent}    return id;
${indent}}`;
  }

  private generateGetRegisteredCountMethod(items: DecorItem[]): string {
    const indent = this.getIndent(2);
    const lines = [
      '',
      `${indent}/// <summary>`,
      `${indent}/// Get count of successfully registered items`,
      `${indent}/// </summary>`,
      `${indent}private int GetRegisteredCount()`,
      `${indent}{`,
      `${indent}    int count = 0;`
    ];

    items.forEach(item => {
      const fieldName = `${this.toCamelCase(item.internalName)  }Id`;
      lines.push(`${indent}    if (${fieldName} > 0) count++;`);
    });

    lines.push(`${indent}    return count;`);
    lines.push(`${indent}}`);

    return lines.join('\n');
  }

  // Helper methods
  private sanitizeNamespace(pluginId: string): string {
    return pluginId.replace(/\./g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  }

  private generateClassName(pluginName: string): string {
    return `${pluginName.replace(/[^a-zA-Z0-9]/g, '')  }Plugin`;
  }

  private escapeString(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  private formatVector3(v: Vector3): string {
    return `new Vector3(${v.x}f, ${v.y}f, ${v.z}f)`;
  }

  private isDefaultVector3(v: Vector3): boolean {
    return v.x === 1 && v.y === 1 && v.z === 1;
  }

  private toCamelCase(str: string): string {
    return str
      .split('_')
      .map((word, index) => {
        if (index === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join('');
  }

  private getIndent(level: number): string {
    return ' '.repeat(level * this.indentSize);
  }

  private getConfigType(type: string): string {
    switch (type) {
      case 'float': return 'float';
      case 'int': return 'int';
      case 'bool': return 'bool';
      case 'string': return 'string';
      default: return 'string';
    }
  }

  private generateConfigBinding(option: ConfigurationOption, indent: string): string {
    const defaultValue = this.formatConfigValue(option.type, option.defaultValue);
    let binding = `${indent}${option.name} = Config.Bind("General", "${option.name}", ${defaultValue}`;
    
    if (option.description || option.min !== undefined || option.max !== undefined) {
      binding += `,\n${indent}    new ConfigDescription("${option.description || ''}"`;
      
      if (option.min !== undefined && option.max !== undefined) {
        const rangeType = option.type === 'float' ? 'float' : 'int';
        binding += `,\n${indent}        new AcceptableValueRange<${rangeType}>(${option.min}${option.type === 'float' ? 'f' : ''}, ${option.max}${option.type === 'float' ? 'f' : ''})`;
      }
      
      binding += ')';
    }
    
    binding += ');';
    return binding;
  }

  private formatConfigValue(type: string, value: any): string {
    switch (type) {
      case 'float': return `${value}f`;
      case 'int': return `${value}`;
      case 'bool': return value ? 'true' : 'false';
      case 'string': return `"${value}"`;
      default: return `"${value}"`;
    }
  }

  private pack?: ExpansionPack;

  setCurrentPack(pack: ExpansionPack) {
    this.pack = pack;
  }
}
