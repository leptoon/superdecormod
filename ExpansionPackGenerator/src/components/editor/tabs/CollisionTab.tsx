import React from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { DecorItem } from '../../../types/expansion';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { Vector3Input } from '../FormFields/Vector3Input';
import { Alert, AlertDescription } from '../../ui/alert';

interface CollisionTabProps {
  item: DecorItem;
  onChange: (field: keyof DecorItem, value: DecorItem[keyof DecorItem]) => void;
  onNestedChange?: (parentField: keyof DecorItem, field: string, value: any) => void;
}

export const CollisionTab: React.FC<CollisionTabProps> = ({ item, onChange }) => {
  const handleVectorChange = (field: keyof DecorItem) => (value: { x: number; y: number; z: number }) => {
    onChange(field, value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Collision Settings
        </h3>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Collision settings define how players and other objects interact with this item in the game world.
        </AlertDescription>
      </Alert>

      {/* Collision Size */}
      <div>
        <Vector3Input
          label="Collision Size"
          value={item.collisionSize}
          onChange={handleVectorChange('collisionSize')}
          min={0.1}
          max={10}
          step={0.1}
        />
        <p className="text-xs text-gray-500 mt-1">
          The size of the collision box in world units
        </p>
      </div>

      {/* Collision Center */}
      <div>
        <Vector3Input
          label="Collision Center Offset"
          value={item.collisionCenter}
          onChange={handleVectorChange('collisionCenter')}
          min={-5}
          max={5}
          step={0.1}
        />
        <p className="text-xs text-gray-500 mt-1">
          Offset of the collision box center from the object origin
        </p>
      </div>

      {/* Is Walkable */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="isWalkable"
          checked={item.isWalkable}
          onCheckedChange={(checked) => onChange('isWalkable', checked)}
          className="mt-0.5"
        />
        <div className="flex-1">
          <Label htmlFor="isWalkable" className="cursor-pointer">
            Is Walkable
          </Label>
          <p className="text-xs text-gray-500">
            Allow players to walk through this object (e.g., curtains, beaded doors)
          </p>
        </div>
      </div>

      {/* Visual Helper */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Collision Box Visualization</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Size: {item.collisionSize.x} × {item.collisionSize.y} × {item.collisionSize.z}</p>
          <p>Center: ({item.collisionCenter.x}, {item.collisionCenter.y}, {item.collisionCenter.z})</p>
        </div>
      </div>
    </div>
  );
};
