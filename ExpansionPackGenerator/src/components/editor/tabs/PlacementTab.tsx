import React from 'react';
import { Info } from 'lucide-react';
import type { DecorItem } from '../../../types/expansion';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { Alert, AlertDescription } from '../../ui/alert';

interface PlacementTabProps {
  item: DecorItem;
  onChange: (field: keyof DecorItem, value: DecorItem[keyof DecorItem]) => void;
}

export const PlacementTab: React.FC<PlacementTabProps> = ({ item, onChange }) => {
  const placementOptions: Array<{
    field: keyof DecorItem;
    label: string;
    description: string;
  }> = [
    {
      field: 'canPlaceOnFloor',
      label: 'Can Place on Floor',
      description: 'Item can be placed on the floor'
    },
    {
      field: 'canPlaceOnWalls',
      label: 'Can Place on Walls',
      description: 'Item can be mounted on walls'
    },
    {
      field: 'canPlaceOnCeiling',
      label: 'Can Place on Ceiling',
      description: 'Item can be attached to ceilings'
    },
    {
      field: 'requiresFloorContact',
      label: 'Requires Floor Contact',
      description: 'Item must be in contact with the floor'
    },
    {
      field: 'allowFloating',
      label: 'Allow Floating',
      description: 'Item can be placed in mid-air'
    }
  ];

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> These placement settings are planned features. Items currently follow the placement 
          rules of their base furniture type. Your settings will be saved in the generated code with 
          "NOT IMPLEMENTED" comments for when these features are added.
        </AlertDescription>
      </Alert>

      <div>
        <h3 className="text-lg font-medium mb-4">Placement Settings</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure where and how this item can be placed in the game world.
        </p>
      </div>

      <div className="space-y-4 opacity-75">
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Placement Options (Not Yet Implemented)
          </h4>
          
          <div className="space-y-4">
            {placementOptions.map((option) => (
              <div key={option.field} className="flex items-start space-x-3">
                <Checkbox
                  id={option.field}
                  checked={item[option.field] as boolean}
                  onCheckedChange={(checked) => onChange(option.field, checked)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={option.field}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Tip:</strong> These settings will be included in your generated code with comments 
          indicating they are not yet implemented. This ensures your expansion pack will be ready 
          when these features are added to the Super Decor framework.
        </AlertDescription>
      </Alert>
    </div>
  );
};
