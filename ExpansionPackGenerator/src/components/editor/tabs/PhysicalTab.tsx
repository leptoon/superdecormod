import React from 'react';
import { Package2 } from 'lucide-react';
import { DecorItem, BoxSize, boxSizeInfo } from '../../../types/expansion';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Vector3Input } from '../FormFields/Vector3Input';
import { Alert, AlertDescription } from '../../ui/alert';

interface PhysicalTabProps {
  item: DecorItem;
  onChange: (field: string, value: any) => void;
  onNestedChange?: (parentField: string, field: string, value: any) => void;
}

export const PhysicalTab: React.FC<PhysicalTabProps> = ({ item, onChange }) => {
  const handleBoxSizeChange = (value: BoxSize) => {
    onChange('boxSize', value);
    // Update base reference ID based on box size
    const referenceId = boxSizeInfo[value].baseReferenceId;
    onChange('baseReferenceId', referenceId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Physical Properties</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="boxSize" className="text-base mb-2 block">Box Size</Label>
          <Select value={item.boxSize} onValueChange={handleBoxSizeChange}>
            <SelectTrigger id="boxSize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(boxSizeInfo).map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <Package2 className="w-4 h-4" />
                    <span>{info.name}</span>
                    <span className="text-gray-500">- {info.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-2">
            Base Reference ID: {item.baseReferenceId}
          </p>
        </div>

        <div>
          <Vector3Input
            label="Visual Scale"
            value={item.visualScale}
            onChange={(value) => onChange('visualScale', value)}
            min={0.1}
            max={3}
            step={0.1}
          />
          <p className="text-xs text-gray-500 mt-1">
            Scales the visual appearance without affecting collision
          </p>
        </div>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Box Size Guide:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• <strong>Small (8x8x8)</strong>: Decorative items, small props</li>
            <li>• <strong>Medium (15x15x15)</strong>: Standard furniture, plants</li>
            <li>• <strong>Large (25x20x15)</strong>: Sofas, large electronics</li>
          </ul>
          <p className="mt-2 text-sm text-gray-600">
            <strong>Note:</strong> Box size does not affect delivery costs.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
};
