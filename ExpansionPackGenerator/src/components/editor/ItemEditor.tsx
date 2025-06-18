import React, { useState } from 'react';
import type { DecorItem } from '../../types/expansion';
import { useSelectedItem, useExpansionPackStore } from '../../store/expansionPackStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BasicInfoTab } from './tabs/BasicInfoTab';
import { EconomicsTab } from './tabs/EconomicsTab';
import { PhysicalTab } from './tabs/PhysicalTab';
import { CollisionTab } from './tabs/CollisionTab';
import { PlacementTab } from './tabs/PlacementTab';
import { InteractionTab } from './tabs/InteractionTab';
import { AssetsTab } from './tabs/AssetsTab';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const tabs = [
  { id: 'basic', label: 'Basic' },
  { id: 'economics', label: 'Economics' },
  { id: 'physical', label: 'Physical' },
  { id: 'collision', label: 'Collision' },
  { id: 'placement', label: 'Placement' },
  { id: 'interaction', label: 'Interaction' },
  { id: 'assets', label: 'Assets' },
];

export const ItemEditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const selectedItem = useSelectedItem();
  const updateItem = useExpansionPackStore(state => state.updateItem);

  if (!selectedItem) {
    return null;
  }

  const handleFieldChange = (field: keyof DecorItem, value: DecorItem[keyof DecorItem]) => {
    updateItem(selectedItem.internalName, { [field]: value });
  };

  const handleNestedFieldChange = (parentField: keyof DecorItem, field: string, value: any) => {
    const parentValue = selectedItem[parentField];
    if (typeof parentValue === 'object' && parentValue !== null) {
      updateItem(selectedItem.internalName, {
        [parentField]: {
          ...parentValue,
          [field]: value
        }
      });
    }
  };

  // Tab navigation
  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
  const canGoPrevious = currentTabIndex > 0;
  const canGoNext = currentTabIndex < tabs.length - 1;

  const goToPreviousTab = () => {
    if (canGoPrevious) {
      setActiveTab(tabs[currentTabIndex - 1].id);
    }
  };

  const goToNextTab = () => {
    if (canGoNext) {
      setActiveTab(tabs[currentTabIndex + 1].id);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        {/* Tab List - Scrollable on mobile */}
        <div className="flex-shrink-0 border-b border-gray-200">
          <TabsList className="h-12 w-full rounded-none border-0 bg-gray-50/50 p-0 overflow-x-auto overflow-y-hidden flex">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="data-[state=active]:bg-white whitespace-nowrap flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab Content - Scrollable with proper sizing */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <TabsContent value="basic" className="m-0 p-4 sm:p-6 h-full">
            <BasicInfoTab 
              item={selectedItem} 
              onChange={handleFieldChange}
            />
          </TabsContent>

          <TabsContent value="economics" className="m-0 p-4 sm:p-6 h-full">
            <EconomicsTab 
              item={selectedItem} 
              onChange={handleFieldChange}
            />
          </TabsContent>

          <TabsContent value="physical" className="m-0 p-4 sm:p-6 h-full">
            <PhysicalTab 
              item={selectedItem} 
              onChange={handleFieldChange}
              onNestedChange={handleNestedFieldChange}
            />
          </TabsContent>

          <TabsContent value="collision" className="m-0 p-4 sm:p-6 h-full">
            <CollisionTab 
              item={selectedItem} 
              onChange={handleFieldChange}
              onNestedChange={handleNestedFieldChange}
            />
          </TabsContent>

          <TabsContent value="placement" className="m-0 p-4 sm:p-6 h-full">
            <PlacementTab 
              item={selectedItem} 
              onChange={handleFieldChange}
            />
          </TabsContent>

          <TabsContent value="interaction" className="m-0 p-4 sm:p-6 h-full">
            <InteractionTab 
              item={selectedItem} 
              onChange={handleFieldChange}
            />
          </TabsContent>

          <TabsContent value="assets" className="m-0 p-4 sm:p-6 h-full">
            <AssetsTab 
              item={selectedItem} 
              onChange={handleFieldChange}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Navigation Footer - Responsive */}
      <div className="p-3 sm:p-4 border-t border-gray-200 flex justify-between flex-shrink-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={goToPreviousTab}
          disabled={!canGoPrevious}
          className="text-xs sm:text-sm"
        >
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="hidden sm:inline">Previous Tab</span>
          <span className="sm:hidden">Prev</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={goToNextTab}
          disabled={!canGoNext}
          className="text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">Next Tab</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
