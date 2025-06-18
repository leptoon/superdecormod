import { ItemTemplate, BoxSize, DecorCategories } from '../types/expansion';

export const itemTemplates: ItemTemplate[] = [
  {
    id: 'small_decor',
    name: 'Small Decoration',
    description: 'Basic small decorative item like a vase or figurine',
    data: {
      itemName: 'Small Decoration',
      description: 'A small decorative item',
      category: DecorCategories.Fixtures,
      baseCost: 50,
      boxSize: BoxSize._8x8x8,
      baseReferenceId: 2,
      collisionSize: { x: 0.4, y: 0.6, z: 0.4 },
      collisionCenter: { x: 0, y: 0.3, z: 0 },
      visualScale: { x: 0.8, y: 0.8, z: 0.8 },
      canPlaceOnFloor: true,
      canPlaceOnWalls: false,
      canPlaceOnCeiling: false,
      requiresFloorContact: true,
      allowFloating: false
    }
  },
  {
    id: 'wall_art',
    name: 'Wall Art',
    description: 'Picture frame or artwork for walls',
    data: {
      itemName: 'Wall Art',
      description: 'A beautiful piece of wall art',
      category: DecorCategories.WallDecor,
      baseCost: 120,
      boxSize: BoxSize._8x8x8,
      baseReferenceId: 2,
      collisionSize: { x: 0.8, y: 0.8, z: 0.1 },
      collisionCenter: { x: 0, y: 0, z: 0 },
      visualScale: { x: 1, y: 1, z: 0.2 },
      canPlaceOnFloor: false,
      canPlaceOnWalls: true,
      canPlaceOnCeiling: false,
      requiresFloorContact: false,
      allowFloating: true
    }
  },
  {
    id: 'floor_plant',
    name: 'Floor Plant',
    description: 'Large potted plant for floor placement',
    data: {
      itemName: 'Floor Plant',
      description: 'A lush decorative plant',
      category: DecorCategories.FloorDecor,
      baseCost: 200,
      boxSize: BoxSize._15x15x15,
      baseReferenceId: 3,
      collisionSize: { x: 0.6, y: 1.8, z: 0.6 },
      collisionCenter: { x: 0, y: 0.9, z: 0 },
      visualScale: { x: 1, y: 1, z: 1 },
      canPlaceOnFloor: true,
      canPlaceOnWalls: false,
      canPlaceOnCeiling: false,
      requiresFloorContact: true,
      allowFloating: false
    }
  },
  {
    id: 'desk_lamp',
    name: 'Desk Lamp',
    description: 'Modern LED desk lamp',
    data: {
      itemName: 'LED Desk Lamp',
      description: 'Energy-efficient LED lamp',
      category: DecorCategories.Lighting,
      baseCost: 80,
      boxSize: BoxSize._8x8x8,
      baseReferenceId: 2,
      collisionSize: { x: 0.3, y: 0.5, z: 0.3 },
      collisionCenter: { x: 0, y: 0.25, z: 0 },
      visualScale: { x: 0.7, y: 0.7, z: 0.7 },
      canPlaceOnFloor: true,
      canPlaceOnWalls: false,
      canPlaceOnCeiling: false,
      requiresFloorContact: true,
      allowFloating: false,
      isInteractable: true
    }
  },
  {
    id: 'ceiling_light',
    name: 'Ceiling Light',
    description: 'Overhead lighting fixture',
    data: {
      itemName: 'Ceiling Light',
      description: 'Modern ceiling light fixture',
      category: DecorCategories.Lighting,
      baseCost: 150,
      boxSize: BoxSize._15x15x15,
      baseReferenceId: 3,
      collisionSize: { x: 0.8, y: 0.3, z: 0.8 },
      collisionCenter: { x: 0, y: -0.15, z: 0 },
      visualScale: { x: 1, y: 1, z: 1 },
      canPlaceOnFloor: false,
      canPlaceOnWalls: false,
      canPlaceOnCeiling: true,
      requiresFloorContact: false,
      allowFloating: true
    }
  },
  {
    id: 'sculpture',
    name: 'Art Sculpture',
    description: 'Modern art sculpture piece',
    data: {
      itemName: 'Modern Sculpture',
      description: 'An abstract art sculpture',
      category: DecorCategories.Fixtures,
      baseCost: 300,
      boxSize: BoxSize._15x15x15,
      baseReferenceId: 3,
      collisionSize: { x: 1.0, y: 1.6, z: 1.0 },
      collisionCenter: { x: 0, y: 0.8, z: 0 },
      visualScale: { x: 1.2, y: 1.2, z: 1.2 },
      canPlaceOnFloor: true,
      canPlaceOnWalls: false,
      canPlaceOnCeiling: false,
      requiresFloorContact: true,
      allowFloating: false,
      isMoveable: false
    }
  },
  {
    id: 'shelf_item',
    name: 'Shelf Decoration',
    description: 'Small item for shelf placement',
    data: {
      itemName: 'Shelf Decoration',
      description: 'Perfect for shelves and tables',
      category: DecorCategories.Fixtures,
      baseCost: 40,
      boxSize: BoxSize._8x8x8,
      baseReferenceId: 2,
      collisionSize: { x: 0.3, y: 0.3, z: 0.3 },
      collisionCenter: { x: 0, y: 0.15, z: 0 },
      visualScale: { x: 0.6, y: 0.6, z: 0.6 },
      canPlaceOnFloor: true,
      canPlaceOnWalls: false,
      canPlaceOnCeiling: false,
      requiresFloorContact: true,
      allowFloating: true
    }
  },
  {
    id: 'outdoor_decor',
    name: 'Outdoor Decoration',
    description: 'Weather-resistant outdoor item',
    data: {
      itemName: 'Outdoor Decoration',
      description: 'Durable outdoor decorative piece',
      category: DecorCategories.Outdoor,
      baseCost: 180,
      boxSize: BoxSize._15x15x15,
      baseReferenceId: 3,
      collisionSize: { x: 1.2, y: 1.0, z: 1.2 },
      collisionCenter: { x: 0, y: 0.5, z: 0 },
      visualScale: { x: 1, y: 1, z: 1 },
      canPlaceOnFloor: true,
      canPlaceOnWalls: false,
      canPlaceOnCeiling: false,
      requiresFloorContact: true,
      allowFloating: false,
      hasPhysics: true
    }
  },
  {
    id: 'tv_electronics',
    name: 'TV/Electronics',
    description: 'Electronic device like TV or monitor',
    data: {
      itemName: 'Smart TV',
      description: '55-inch smart television',
      category: DecorCategories.Fixtures,
      baseCost: 500,
      boxSize: BoxSize._25x20x15,
      baseReferenceId: 4,
      collisionSize: { x: 1.4, y: 0.8, z: 0.2 },
      collisionCenter: { x: 0, y: 0.4, z: 0 },
      visualScale: { x: 1, y: 1, z: 0.5 },
      canPlaceOnFloor: true,
      canPlaceOnWalls: true,
      canPlaceOnCeiling: false,
      requiresFloorContact: false,
      allowFloating: true,
      isInteractable: true
    }
  },
  {
    id: 'seasonal_decor',
    name: 'Seasonal Decoration',
    description: 'Holiday or seasonal themed item',
    data: {
      itemName: 'Seasonal Decoration',
      description: 'Festive seasonal decor',
      category: DecorCategories.Seasonal,
      baseCost: 60,
      boxSize: BoxSize._8x8x8,
      baseReferenceId: 2,
      collisionSize: { x: 0.5, y: 0.7, z: 0.5 },
      collisionCenter: { x: 0, y: 0.35, z: 0 },
      visualScale: { x: 0.9, y: 0.9, z: 0.9 },
      canPlaceOnFloor: true,
      canPlaceOnWalls: false,
      canPlaceOnCeiling: false,
      requiresFloorContact: true,
      allowFloating: false
    }
  }
];