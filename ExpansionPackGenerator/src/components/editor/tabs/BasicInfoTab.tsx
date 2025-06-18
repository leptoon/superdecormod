import React from 'react';
import { Info } from 'lucide-react';
import { DecorItem, DecorCategories } from '../../../types/expansion';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { Alert, AlertDescription } from '../../ui/alert';
import { useExpansionPackStore } from '../../../store/expansionPackStore';

interface BasicInfoTabProps {
  item: DecorItem;
  onChange: (field: string, value: any) => void;
}

export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ item, onChange }) => {
  // Get access to the store to check for duplicates
  const items = useExpansionPackStore(state => state.pack.items);
  
  // Function to generate internal name from item name
  const generateInternalName = (itemName: string): string => {
    if (!itemName || itemName.trim() === '') {
      // Generate a unique untitled name
      let baseName = 'untitled_item';
      let counter = 1;
      let internalName = baseName;
      
      // Check for duplicates and increment counter if needed
      while (items.some(i => i.internalName === internalName && i.internalName !== item.internalName)) {
        internalName = `${baseName}_${counter}`;
        counter++;
      }
      
      return internalName;
    }
    
    // Generate base internal name from item name
    let baseInternalName = itemName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_') // Replace non-alphanumeric chars with underscores
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .replace(/_+/g, '_') // Replace multiple underscores with single ones
      .substring(0, 50); // Limit to 50 characters
    
    // Check if this internal name already exists
    let finalInternalName = baseInternalName;
    let counter = 1;
    
    while (items.some(i => i.internalName === finalInternalName && i.internalName !== item.internalName)) {
      // Append _1, _2, etc. to make it unique
      finalInternalName = `${baseInternalName}_${counter}`;
      counter++;
    }
    
    return finalInternalName;
  };

  const handleItemNameChange = (value: string) => {
    // Update the item name
    onChange('itemName', value);
    
    // Always generate and update internal name
    const newInternalName = generateInternalName(value);
    onChange('internalName', newInternalName);
  };

  // Initialize internal name if it's empty but item name exists
  React.useEffect(() => {
    if (!item.internalName && item.itemName) {
      const newInternalName = generateInternalName(item.itemName);
      onChange('internalName', newInternalName);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="itemName">Item Name</Label>
          <Input
            id="itemName"
            value={item.itemName}
            onChange={(e) => handleItemNameChange(e.target.value)}
            placeholder="Crystal Ball"
          />
          <p className="text-sm text-gray-500">
            Internal name: <code className="bg-gray-100 px-1 rounded">{item.internalName || 'untitled_item'}</code>
          </p>
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
