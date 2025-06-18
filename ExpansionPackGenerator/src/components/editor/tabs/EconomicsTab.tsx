import React from 'react';
import { Info, DollarSign } from 'lucide-react';
import { DecorItem } from '../../../types/expansion';
import { Label } from '../../ui/label';
import { Slider } from '../../ui/slider';
import { Input } from '../../ui/input';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';

interface EconomicsTabProps {
  item: DecorItem;
  onChange: (field: string, value: any) => void;
}

export const EconomicsTab: React.FC<EconomicsTabProps> = ({ item, onChange }) => {
  const handleBaseCostChange = (value: number[]) => {
    onChange('baseCost', value[0]);
  };

  const handleInputChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10000) {
      onChange('baseCost', numValue);
    }
  };

  // Calculate automatic values for display
  const sellPrice = Math.floor(item.baseCost * 0.5);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-4">Economics Settings</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="baseCost" className="text-base mb-2 block">Base Cost</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Slider
                  id="baseCost"
                  min={0}
                  max={1000}
                  step={5}
                  value={[item.baseCost]}
                  onValueChange={handleBaseCostChange}
                  className="flex-1"
                />
                <div className="flex items-center gap-2 w-32">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <Input
                    type="number"
                    value={item.baseCost}
                    onChange={(e) => handleInputChange(e.target.value)}
                    min={0}
                    max={10000}
                    className="text-right"
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>$0</span>
                <span>$1000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">Automatic Pricing Information</AlertTitle>
        <AlertDescription className="text-blue-800 space-y-2 mt-2">
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="font-medium">Delivery Cost:</p>
              <p className="text-sm mt-1">Based on cart size:</p>
              <ul className="text-sm mt-1 space-y-0.5">
                <li>• 1-3 items: $2</li>
                <li>• 4-6 items: $4</li>
                <li>• 7+ items: $8</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">Sell Price:</p>
              <p className="text-2xl font-semibold">${sellPrice}</p>
              <p className="text-sm mt-1">Always 50% of purchase cost</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm">
              These values are calculated automatically by the game and cannot be customized. 
              The delivery cost depends on the total number of items in the shopping cart, 
              while the sell price is always 50% of the base cost.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Price Summary</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Purchase Price:</span>
            <span className="font-medium">${item.baseCost}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery Cost:</span>
            <span>$2-8 (based on cart size)</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Sell Price:</span>
            <span>${sellPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
