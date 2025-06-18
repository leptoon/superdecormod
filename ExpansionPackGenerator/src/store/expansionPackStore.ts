import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { type ExpansionPack, type DecorItem, defaultExpansionPack, defaultDecorItem } from '../types/expansion';

interface ExpansionPackStore {
  pack: ExpansionPack;
  selectedItemId: string | null;
  isDirty: boolean;
  
  // Pack actions
  updatePackInfo: (info: Partial<ExpansionPack>) => void;
  loadPack: (pack: ExpansionPack) => void;
  resetPack: () => void;
  
  // Item actions
  addItem: (item?: Partial<DecorItem>) => void;
  updateItem: (internalName: string, updates: Partial<DecorItem>) => void;
  removeItem: (internalName: string) => void;
  selectItem: (internalName: string | null) => void;
  duplicateItem: (internalName: string) => void;
  
  // Configuration actions
  addConfigOption: (option: any) => void;
  removeConfigOption: (index: number) => void;
  updateConfigOption: (index: number, updates: any) => void;
  
  // Export/Import
  exportToJSON: () => string;
  importFromJSON: (json: string) => boolean;
}

// Helper function to generate plugin ID
const generatePluginId = (author: string, pluginName: string): string => {
  const cleanAuthor = author
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric characters
    .trim() || 'author';
  
  const cleanPackName = pluginName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric characters
    .trim() || 'pack';
  
  return `com.${cleanAuthor}.${cleanPackName}`;
};

export const useExpansionPackStore = create<ExpansionPackStore>()(
  immer((set, get) => ({
    pack: defaultExpansionPack,
    selectedItemId: null,
    isDirty: false,
    
    updatePackInfo: (info) => set((state) => {
      // If author or pluginName is being updated, regenerate pluginId
      const shouldUpdatePluginId = info.author !== undefined || info.pluginName !== undefined;
      
      Object.assign(state.pack, info);
      
      if (shouldUpdatePluginId) {
        const newPluginId = generatePluginId(state.pack.author, state.pack.pluginName);
        state.pack.pluginId = newPluginId;
        
        // Update asset bundle name for all items when plugin ID changes
        state.pack.items.forEach(item => {
          item.assetBundleName = newPluginId;
        });
      }
      
      state.isDirty = true;
    }),
    
    loadPack: (pack) => set((state) => {
      state.pack = pack;
      state.selectedItemId = null;
      state.isDirty = false;
    }),
    
    resetPack: () => set((state) => {
      state.pack = { ...defaultExpansionPack };
      state.selectedItemId = null;
      state.isDirty = false;
    }),
    
    addItem: (itemData) => set((state) => {
      const existingNames = state.pack.items.map(i => i.internalName);
      const baseName = itemData?.internalName || "new_item";
      let counter = 1;
      let internalName = baseName;
      
      // Ensure unique internal name
      while (existingNames.includes(internalName)) {
        internalName = `${baseName}_${counter}`;
        counter++;
      }
      
      const newItem: DecorItem = {
        ...defaultDecorItem,
        ...itemData,
        internalName,
        assetBundleName: state.pack.pluginId,
        // Generate default asset names based on internal name
        iconAssetName: itemData?.iconAssetName || `${internalName}_icon`,
        meshAssetName: itemData?.meshAssetName || internalName,
        materialAssetName: itemData?.materialAssetName || `${internalName}_material`
      };
      
      state.pack.items.push(newItem);
      state.selectedItemId = internalName;
      state.isDirty = true;
    }),
    
    updateItem: (internalName, updates) => set((state) => {
      const item = state.pack.items.find(i => i.internalName === internalName);
      if (item) {
        // Handle internal name changes
        if (updates.internalName && updates.internalName !== internalName) {
          // Check for duplicate names
          const isDuplicate = state.pack.items.some(
            i => i.internalName === updates.internalName && i.internalName !== internalName
          );
          if (!isDuplicate) {
            // Update selected item ID if this is the selected item
            if (state.selectedItemId === internalName) {
              state.selectedItemId = updates.internalName;
            }
          } else {
            // Don't allow duplicate internal names
            delete updates.internalName;
          }
        }
        
        Object.assign(item, updates);
        state.isDirty = true;
      }
    }),
    
    removeItem: (internalName) => set((state) => {
      const index = state.pack.items.findIndex(i => i.internalName === internalName);
      if (index !== -1) {
        state.pack.items.splice(index, 1);
        if (state.selectedItemId === internalName) {
          state.selectedItemId = null;
        }
        state.isDirty = true;
      }
    }),
    
    selectItem: (internalName) => set((state) => {
      state.selectedItemId = internalName;
    }),
    
    duplicateItem: (internalName) => set((state) => {
      const item = state.pack.items.find(i => i.internalName === internalName);
      if (item) {
        const newItem = { ...item };
        
        // Generate unique internal name
        const existingNames = state.pack.items.map(i => i.internalName);
        let counter = 1;
        let newInternalName = `${item.internalName}_copy`;
        while (existingNames.includes(newInternalName)) {
          newInternalName = `${item.internalName}_copy_${counter}`;
          counter++;
        }
        
        newItem.internalName = newInternalName;
        newItem.itemName = `${item.itemName} (Copy)`;
        
        state.pack.items.push(newItem);
        state.selectedItemId = newInternalName;
        state.isDirty = true;
      }
    }),
    
    addConfigOption: (option) => set((state) => {
      state.pack.configuration.options.push(option);
      state.isDirty = true;
    }),
    
    removeConfigOption: (index) => set((state) => {
      state.pack.configuration.options.splice(index, 1);
      state.isDirty = true;
    }),
    
    updateConfigOption: (index, updates) => set((state) => {
      if (state.pack.configuration.options[index]) {
        Object.assign(state.pack.configuration.options[index], updates);
        state.isDirty = true;
      }
    }),
    
    exportToJSON: () => {
      const state = get();
      return JSON.stringify(state.pack, null, 2);
    },
    
    importFromJSON: (json) => {
      try {
        const pack = JSON.parse(json) as ExpansionPack;
        get().loadPack(pack);
        return true;
      } catch (error) {
        console.error('Failed to import JSON:', error);
        return false;
      }
    }
  }))
);

// Selector hooks for common queries
export const useSelectedItem = () => {
  const selectedItemId = useExpansionPackStore(state => state.selectedItemId);
  const items = useExpansionPackStore(state => state.pack.items);
  return items.find(item => item.internalName === selectedItemId) || null;
};

export const useItemCount = () => {
  return useExpansionPackStore(state => state.pack.items.length);
};
