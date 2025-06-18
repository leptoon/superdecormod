import React from 'react';
import { Box } from 'lucide-react';
import { DecorItem } from '../../../types/expansion';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { Vector3Input } from '../FormFields/Vector3Input';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';

interface CollisionTabProps {
  item: DecorItem;
  onChange: (field: string, value: any) => void;
  onNestedChange?: (parentField: string, field: string, value: any) => void;
}

export const CollisionTab: React.FC<CollisionTabProps> = ({ item, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Collision Settings</h3>
        <p className="text-sm text-gray-600">
          Define the physical boundaries of your item for placement and interaction.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Vector3Input
            label="Collision Size"
            value={item.collisionSize}
            onChange={(value) => onChange('collisionSize', value)}
            min={0.1}
            max={10}
            step={0.1}
          />
          <p className="text-xs text-gray-500 mt-1">
            The physical size of the collision box in game units
          </p>
        </div>

        <div>
          <Vector3Input
            label="Collision Center"
            value={item.collisionCenter}
            onChange={(value) => onChange('collisionCenter', value)}
            min={-5}
            max={5}
            step={0.1}
          />
          <p className="text-xs text-gray-500 mt-1">
            Offset the collision box center from the item's origin
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Checkbox
            id="isWalkable"
            checked={item.isWalkable}
            onCheckedChange={(checked) => onChange('isWalkable', checked)}
          />
          <div>
            <Label htmlFor="isWalkable" className="cursor-pointer">
              Is Walkable
            </Label>
            <p className="text-xs text-gray-500">
              Allow characters to walk through this item
            </p>
          </div>
        </div>
      </div>

      <Alert>
        <Box className="h-4 w-4" />
        <AlertTitle>Collision Tips</AlertTitle>
        <AlertDescription className="space-y-2 mt-2">
          <p>• Collision size should generally match the visual size of your item</p>
          <p>• Use collision center to adjust if your mesh pivot is offset</p>
          <p>• Keep Y center at half the height for floor items</p>
          <p>• Make decorative items walkable to prevent blocking paths</p>
        </AlertDescription>
      </Alert>
    </div>
  );
};
