import React, { useState } from 'react';
import { Plus, Search, Package2, MoreVertical, Copy, Trash2, ChevronDown, Info, Sparkles } from 'lucide-react';
import { useExpansionPackStore } from '../../store/expansionPackStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { boxSizeInfo } from '../../types/expansion';
import { cn } from '../../lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { TemplateSelector } from './TemplateSelector';

export const ItemList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPackSettings, setShowPackSettings] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  
  const { pack, updatePackInfo, selectedItemId, selectItem, addItem, removeItem, duplicateItem } = useExpansionPackStore();
  
  const filteredItems = pack.items.filter(item => 
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.internalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemClick = (internalName: string) => {
    selectItem(internalName);
  };

  const handleDeleteItem = (internalName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this item?')) {
      removeItem(internalName);
    }
  };

  const handleDuplicateItem = (internalName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateItem(internalName);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Section - Responsive padding */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <h2 className="text-base sm:text-lg font-semibold mb-3">Expansion Pack Items</h2>
        
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
        
        {/* Action Buttons - Responsive layout */}
        <div className="flex gap-2 mb-3">
          <Button onClick={() => addItem()} className="flex-1 text-sm h-9">
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add Item</span>
            <span className="sm:hidden">Add</span>
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => setShowTemplateSelector(true)} variant="outline" className="h-9 px-2 sm:px-3">
                  <Sparkles className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create item from template</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Items List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {searchQuery ? 'No items found' : 'No items yet. Click "Add Item" to create your first item.'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredItems.map((item) => {
              const sizeInfo = boxSizeInfo[item.boxSize];
              return (
                <div
                  key={item.internalName}
                  onClick={() => handleItemClick(item.internalName)}
                  className={cn(
                    "p-2 sm:p-3 rounded-lg cursor-pointer transition-colors",
                    "hover:bg-gray-50 border",
                    selectedItemId === item.internalName
                      ? "bg-blue-50 border-blue-300"
                      : "bg-white border-gray-200"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <Package2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{item.itemName}</h3>
                        <p className="text-xs text-gray-500 truncate">{item.internalName}</p>
                        <div className="flex items-center gap-1 sm:gap-2 mt-1 text-xs">
                          <span className="text-gray-600">${item.baseCost}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600 truncate">{sizeInfo.name}</span>
                          <span className="text-gray-400 hidden sm:inline">•</span>
                          <span className="text-gray-600 truncate hidden sm:inline">{item.category}</span>
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0 flex-shrink-0">
                          <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleDuplicateItem(item.internalName, e)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleDeleteItem(item.internalName, e)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pack Settings - Collapsible */}
      <div className="border-t border-gray-200">
        <button
          onClick={() => setShowPackSettings(!showPackSettings)}
          className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-sm">Pack Settings</span>
          <ChevronDown className={cn("w-4 h-4 transition-transform", showPackSettings && "rotate-180")} />
        </button>
        
        {showPackSettings && (
          <div className="p-3 sm:p-4 border-t border-gray-100 space-y-3">
            <div>
              <Label htmlFor="pluginName" className="text-sm">Plugin Name</Label>
              <Input
                id="pluginName"
                value={pack.pluginName}
                onChange={(e) => updatePackInfo({ pluginName: e.target.value })}
                placeholder="My Decor Pack"
                className="text-sm h-9"
              />
            </div>
            
            <div>
              <Label htmlFor="author" className="text-sm">Author</Label>
              <Input
                id="author"
                value={pack.author}
                onChange={(e) => updatePackInfo({ author: e.target.value })}
                placeholder="Your Name"
                className="text-sm h-9"
              />
            </div>
            
            <div>
              <Label htmlFor="version" className="text-sm">Version</Label>
              <Input
                id="version"
                value={pack.version}
                onChange={(e) => updatePackInfo({ version: e.target.value })}
                placeholder="1.0.0"
                className="text-sm h-9"
              />
            </div>
            
            <div>
              <Label className="text-sm text-gray-600">Generated Plugin ID</Label>
              <div className="text-xs font-mono bg-gray-100 p-2 rounded border text-gray-700 break-all overflow-wrap-anywhere min-h-[2rem] max-h-16 overflow-y-auto">
                {pack.pluginId}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Auto-generated from author and plugin name
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="p-2 sm:p-3 bg-blue-50 border-t border-blue-100">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-blue-700 cursor-help">
                <Info className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="text-xs">All items appear in Furnitures page</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-sm">Categories are for future use. Currently, all items appear in the Furnitures page regardless of their assigned category.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <TemplateSelector 
        open={showTemplateSelector} 
        onClose={() => setShowTemplateSelector(false)} 
      />
    </div>
  );
};
