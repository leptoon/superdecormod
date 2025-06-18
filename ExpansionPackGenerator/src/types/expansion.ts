// Core type definitions for the Super Decor Expansion Pack Generator

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export enum BoxSize {
  _8x8x8 = "_8x8x8",
  _15x15x15 = "_15x15x15",
  _25x20x15 = "_25x20x15"
}

export interface DecorItem {
  // Identity
  internalName: string;
  itemName: string;
  description: string;
  category: string;
  
  // Economics (simplified - delivery and sell prices are automatic)
  baseCost: number;
  
  // Physical
  boxSize: BoxSize;
  baseReferenceId: number;
  
  // Collision
  collisionSize: Vector3;
  collisionCenter: Vector3;
  isWalkable: boolean;
  
  // Visual
  visualScale: Vector3;
  customMesh?: string;
  customMaterial?: string;
  iconTexture?: string;
  
  // Placement (with implementation status notes)
  canPlaceOnFloor: boolean;      // Note: NOT IMPLEMENTED
  canPlaceOnWalls: boolean;      // Note: NOT IMPLEMENTED
  canPlaceOnCeiling: boolean;    // Note: NOT IMPLEMENTED
  requiresFloorContact: boolean; // Note: NOT IMPLEMENTED
  allowFloating: boolean;        // Note: NOT IMPLEMENTED
  
  // Interaction
  isInteractable: boolean;
  isMoveable: boolean;
  canRotate: boolean;
  canScale: boolean;
  
  // Rendering
  castShadows: boolean;
  receiveShadows: boolean;
  
  // Physics
  hasPhysics: boolean;
  isKinematic: boolean;
  
  // Unlock
  requiredLevel: number;
  isUnlocked: boolean;
  
  // Asset References
  assetBundleName: string;
  meshAssetName: string;
  materialAssetName: string;
  iconAssetName: string;
}

// Categories for future use
export const DecorCategories = {
  Fixtures: "Fixtures",
  WallDecor: "WallDecor", 
  FloorDecor: "FloorDecor",
  Lighting: "Lighting",
  Outdoor: "Outdoor",
  Seasonal: "Seasonal"
} as const;

export type DecorCategory = typeof DecorCategories[keyof typeof DecorCategories];

export interface ConfigurationOption {
  name: string;
  type: 'float' | 'int' | 'bool' | 'string';
  defaultValue: any;
  description: string;
  min?: number;
  max?: number;
}

export interface PackConfiguration {
  options: ConfigurationOption[];
}

export interface ExpansionPack {
  pluginId: string;
  pluginName: string;
  version: string;
  author: string;
  dependencies: string[];
  items: DecorItem[];
  configuration: PackConfiguration;
  useAssemblyResources: boolean;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Template types
export interface ItemTemplate {
  id: string;
  name: string;
  description: string;
  data: Partial<DecorItem>;
}

// Asset types
export interface AssetReference {
  type: 'icon' | 'mesh' | 'texture';
  name: string;
  expectedPath: string;
}

export interface AssetChecklist {
  packId: string;
  items: {
    itemName: string;
    assets: AssetReference[];
  }[];
}

// Default values
export const defaultDecorItem: DecorItem = {
  internalName: "new_item",
  itemName: "New Item",
  description: "A new decor item",
  category: DecorCategories.Fixtures,
  baseCost: 100,
  boxSize: BoxSize._8x8x8,
  baseReferenceId: 2,
  collisionSize: { x: 0.8, y: 0.8, z: 0.8 },
  collisionCenter: { x: 0, y: 0.4, z: 0 },
  isWalkable: false,
  visualScale: { x: 1, y: 1, z: 1 },
  canPlaceOnFloor: true,
  canPlaceOnWalls: false,
  canPlaceOnCeiling: false,
  requiresFloorContact: true,
  allowFloating: false,
  isInteractable: false,
  isMoveable: true,
  canRotate: true,
  canScale: false,
  castShadows: true,
  receiveShadows: true,
  hasPhysics: false,
  isKinematic: true,
  requiredLevel: 1,
  isUnlocked: true,
  assetBundleName: "",
  meshAssetName: "",
  materialAssetName: "",
  iconAssetName: ""
};

export const defaultExpansionPack: ExpansionPack = {
  pluginId: "com.yourname.mydecorpack",
  pluginName: "My Decor Pack",
  version: "1.0.0",
  author: "Your Name",
  dependencies: [],
  items: [],
  configuration: { options: [] },
  useAssemblyResources: true
};

// Box size information - delivery costs are handled separately by the game
export const boxSizeInfo = {
  [BoxSize._8x8x8]: {
    name: "Small",
    baseReferenceId: 2,
    description: "8x8x8 - Small decorative items"
  },
  [BoxSize._15x15x15]: {
    name: "Medium",
    baseReferenceId: 3,
    description: "15x15x15 - Medium furniture"
  },
  [BoxSize._25x20x15]: {
    name: "Large",
    baseReferenceId: 4,
    description: "25x20x15 - Large furniture"
  }
};
