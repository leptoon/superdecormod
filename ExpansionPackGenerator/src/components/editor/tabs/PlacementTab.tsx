import React from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { DecorItem } from '../../../types/expansion';
import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';

interface PlacementTabProps {
  item: DecorItem;
  onChange: (field: string, value: any) => void;
}

export const PlacementTab: React.FC<PlacementTabProps> = ({ item, onChange }) => {
  const placementOptions = [
    {
      field: 'canPlaceOnFloor',
      label: 'Can Place on Floor',
      description: 'Allow placement on floor surfaces',
      default: true
    },
    {
      field: 'canPlaceOnWalls',
      label: 'Can Place on Walls',
      description: 'Allow placement on wall surfaces',
      default: false
    },
    {
      field: 'canPlaceOnCeiling',
      label: 'Can Place on Ceiling',
      description: 'Allow placement on ceiling surfaces',
      default: false
    },
    {
      field: 'requiresFloorContact',
      label: 'Requires Floor Contact',
      description: 'Item must be in contact with the floor',
      default: true
    },
    {
      field: 'allowFloating',
      label: 'Allow Floating',
      description: 'Item can be placed in mid-air',
      default: false
    }
  ];

  return (
    <div className="space-y-6">
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-900">Future Feature Notice</AlertTitle>
        <AlertDescription className="text-yellow-800">
          These placement options are reserved for future updates. Items currently follow the placement 
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
                  checked={item[option.field as keyof DecorItem] as boolean}
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