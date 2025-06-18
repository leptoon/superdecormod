import React from 'react';
import { Info } from 'lucide-react';
import { DecorItem, DecorCategories } from '../../../types/expansion';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { Alert, AlertDescription } from '../../ui/alert';

interface BasicInfoTabProps {
  item: DecorItem;
  onChange: (field: string, value: any) => void;
}

export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ item, onChange }) => {
  const [internalNameError, setInternalNameError] = React.useState('');

  const validateInternalName = (value: string) => {
    if (!value) {
      setInternalNameError('Internal name is required');
      return false;
    }
    if (!/^[a-z_][a-z0-9_]*$/.test(value)) {
      setInternalNameError('Must be lowercase with underscores (e.g., my_item_name)');
      return false;
    }
    if (value.length > 50) {
      setInternalNameError('Maximum 50 characters');
      return false;
    }
    setInternalNameError('');
    return true;
  };

  const handleInternalNameChange = (value: string) => {
    validateInternalName(value);
    onChange('internalName', value);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="internalName">Internal Name</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Unique identifier used in code. Must be lowercase with underscores.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="internalName"
            value={item.internalName}
            onChange={(e) => handleInternalNameChange(e.target.value)}
            placeholder="crystal_ball"
            className={internalNameError ? "border-red-500" : ""}
          />
          {internalNameError && (
            <p className="text-sm text-red-500">{internalNameError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="itemName">Display Name</Label>
          <Input
            id="itemName"
            value={item.itemName}
            onChange={(e) => onChange('itemName', e.target.value)}
            placeholder="Crystal Ball"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={item.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="A mysterious crystal ball that seems to glow faintly in the dark."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="category">Category</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Categories are for future use. All items currently appear in the Furnitures page.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={item.category} onValueChange={(value) => onChange('category', value)}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DecorCategories).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Categories are for future use.</strong> All items currently appear in the Furnitures page regardless of their assigned category. This will be used when a custom decor UI is implemented.
        </AlertDescription>
      </Alert>
    </div>
  );
};