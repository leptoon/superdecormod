import React from 'react';
import { MousePointer, Move, RotateCw, Maximize, Eye, Zap } from 'lucide-react';
import { DecorItem } from '../../../types/expansion';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { Input } from '../../ui/input';

interface InteractionTabProps {
  item: DecorItem;
  onChange: (field: string, value: any) => void;
}

export const InteractionTab: React.FC<InteractionTabProps> = ({ item, onChange }) => {
  const interactionOptions = [
    {
      field: 'isInteractable',
      label: 'Is Interactable',
      description: 'Players can interact with this item',
      icon: MousePointer
    },
    {
      field: 'isMoveable',
      label: 'Is Moveable',
      description: 'Item can be picked up and moved',
      icon: Move
    },
    {
      field: 'canRotate',
      label: 'Can Rotate',
      description: 'Item can be rotated when placing',
      icon: RotateCw
    },
    {
      field: 'canScale',
      label: 'Can Scale (Not yet implemented)',
      description: 'Item size can be adjusted',
      icon: Maximize
    }
  ];

  const renderingOptions = [
    {
      field: 'castShadows',
      label: 'Cast Shadows',
      description: 'Item casts shadows in the world',
      icon: Eye
    },
    {
      field: 'receiveShadows',
      label: 'Receive Shadows',
      description: 'Shadows appear on this item',
      icon: Eye
    }
  ];

  const physicsOptions = [
    {
      field: 'hasPhysics',
      label: 'Has Physics',
      description: 'Item is affected by physics',
      icon: Zap
    },
    {
      field: 'isKinematic',
      label: 'Is Kinematic',
      description: 'Physics object that is not affected by forces',
      icon: Zap
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Interaction & Behavior</h3>
      </div>

      <div>
        <h4 className="font-medium mb-3">Interaction Options</h4>
        <div className="space-y-3">
          {interactionOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div key={option.field} className="flex items-start space-x-3">
                <Checkbox
                  id={option.field}
                  checked={item[option.field as keyof DecorItem] as boolean}
                  onCheckedChange={(checked) => onChange(option.field, checked)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor={option.field} className="cursor-pointer flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {option.label}
                  </Label>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Rendering</h4>
        <div className="space-y-3">
          {renderingOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div key={option.field} className="flex items-start space-x-3">
                <Checkbox
                  id={option.field}
                  checked={item[option.field as keyof DecorItem] as boolean}
                  onCheckedChange={(checked) => onChange(option.field, checked)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor={option.field} className="cursor-pointer flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {option.label}
                  </Label>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Physics</h4>
        <div className="space-y-3">
          {physicsOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div key={option.field} className="flex items-start space-x-3">
                <Checkbox
                  id={option.field}
                  checked={item[option.field as keyof DecorItem] as boolean}
                  onCheckedChange={(checked) => onChange(option.field, checked)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor={option.field} className="cursor-pointer flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {option.label}
                  </Label>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Unlock Requirements</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="requiredLevel">Required Level</Label>
            <Input
              id="requiredLevel"
              type="number"
              min={1}
              max={100}
              value={item.requiredLevel}
              onChange={(e) => onChange('requiredLevel', parseInt(e.target.value) || 1)}
              className="w-32"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum player level to unlock this item
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="isUnlocked"
              checked={item.isUnlocked}
              onCheckedChange={(checked) => onChange('isUnlocked', checked)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label htmlFor="isUnlocked" className="cursor-pointer">
                Is Unlocked by Default
              </Label>
              <p className="text-xs text-gray-500">
                Item is available immediately without level requirement
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
