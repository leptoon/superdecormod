import React from 'react';
import { Package2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { itemTemplates } from '../../data/itemTemplates';
import { useExpansionPackStore } from '../../store/expansionPackStore';

interface TemplateSelectorProps {
  open: boolean;
  onClose: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ open, onClose }) => {
  const addItem = useExpansionPackStore(state => state.addItem);

  const handleSelectTemplate = (templateId: string) => {
    const template = itemTemplates.find(t => t.id === templateId);
    if (template) {
      addItem(template.data);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose an Item Template</DialogTitle>
          <DialogDescription>
            Start with a pre-configured template to quickly create common item types.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {itemTemplates.map(template => (
            <Button
              key={template.id}
              variant="outline"
              className="h-auto p-4 justify-start text-left hover:bg-gray-50"
              onClick={() => handleSelectTemplate(template.id)}
            >
              <div className="flex items-start gap-3 w-full">
                <Package2 className="w-5 h-5 mt-0.5 text-gray-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-gray-500 mt-1">{template.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t">
          <Button variant="ghost" onClick={onClose} className="w-full">
            Start from Scratch Instead
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
