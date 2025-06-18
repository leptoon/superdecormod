import React from 'react';
import { DecorItem, BoxSize, boxSizeInfo } from '../../../types/expansion';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Vector3Input } from '../FormFields/Vector3Input';

interface PhysicalTabProps {
  item: DecorItem;
  onChange: (field: keyof DecorItem, value: DecorItem[keyof DecorItem]) => void;
  onNestedChange?: (parentField: keyof DecorItem, field: string, value: any) => void;
}

export const PhysicalTab: React.FC<PhysicalTabProps> = ({ item, onChange }) => {
  const handleVectorChange = (field: keyof DecorItem) => (value: { x: number; y: number; z: number }) => {
    onChange(field, value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Physical Properties</h3>
      </div>

      {/* Box Size */}
      <div>
        <Label htmlFor="boxSize">Box Size</Label>
        <Select value={item.boxSize} onValueChange={(value) => onChange('boxSize', value as BoxSize)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(boxSizeInfo).map(([key, info]) => (
              <SelectItem key={key} value={key}>
                <div>
                  <div className="font-medium">{info.name}</div>
                  <div className="text-xs text-gray-500">{info.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          Box size determines the shipping container and influences delivery costs
        </p>
      </div>

      {/* Visual Scale */}
      <div>
        <Vector3Input
          label="Visual Scale"
          value={item.visualScale}
          onChange={handleVectorChange('visualScale')}
          min={0.1}
          max={10}
          step={0.1}
        />
        <p className="text-xs text-gray-500 mt-1">
          Scale of the visual model (1 = original size)
        </p>
      </div>

      {/* Base Reference ID */}
      <div>
        <Label htmlFor="baseReferenceId">Base Reference ID</Label>
        <Input
          id="baseReferenceId"
          type="number"
          value={item.baseReferenceId}
          onChange={(e) => onChange('baseReferenceId', parseInt(e.target.value) || 0)}
          min={0}
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          References the base furniture type for placement rules
        </p>
      </div>
    </div>
  );
};
