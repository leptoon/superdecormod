import React from 'react';
import { Vector3 } from '../../../types/expansion';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { cn } from '../../../lib/utils';

interface Vector3InputProps {
  label: string;
  value: Vector3;
  onChange: (value: Vector3) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  className?: string;
}

export const Vector3Input: React.FC<Vector3InputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  error,
  className
}) => {
  const handleChange = (axis: 'x' | 'y' | 'z', newValue: string) => {
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue)) {
      onChange({
        ...value,
        [axis]: numValue
      });
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <div className="grid grid-cols-3 gap-2">
        {(['x', 'y', 'z'] as const).map(axis => (
          <div key={axis}>
            <label className="text-xs text-gray-500 uppercase block mb-1">{axis}</label>
            <Input
              type="number"
              value={value[axis]}
              onChange={(e) => handleChange(axis, e.target.value)}
              min={min}
              max={max}
              step={step}
              className={cn(
                "text-center",
                error && "border-red-500"
              )}
            />
          </div>
        ))}
      </div>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};