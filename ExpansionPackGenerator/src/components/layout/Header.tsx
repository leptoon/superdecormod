import React, { useState } from 'react';
import { Package, FileText, Save, Upload, Download, HelpCircle, Github, Menu } from 'lucide-react';
import { useExpansionPackStore } from '../../store/expansionPackStore';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useToast } from '../ui/use-toast';
import { ExportOptionsModal } from '../features/ExportOptionsModal';

export const Header: React.FC = () => {
  const { pack, isDirty, resetPack, importFromJSON } = useExpansionPackStore();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleExportJSON = () => {
    const json = useExpansionPackStore.getState().exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pack.pluginId}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Project saved",
      description: "Your project has been exported as JSON.",
    });
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importFromJSON(content);
      
      if (success) {
        toast({
          title: "Project loaded",
          description: "Your project has been imported successfully.",
        });
      } else {
        toast({
          title: "Import failed",
          description: "Failed to parse the JSON file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  const handleNew = () => {
    if (isDirty) {
      if (!confirm('You have unsaved changes. Are you sure you want to create a new project?')) {
        return;
      }
    }
    resetPack();
    toast({
      title: "New project created",
      description: "You can now start adding items to your expansion pack.",
    });
  };

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-200 px-3 sm:px-4 flex items-center justify-between">
      {/* Left Section - Logo and Title */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
          <h1 className="text-lg sm:text-xl font-semibold truncate">
            <span className="hidden sm:inline">Super Decor Expansion Pack Generator</span>
            <span className="sm:hidden">Decor Pack Creator</span>
          </h1>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="h-6 w-px bg-gray-300" />
          
          <Button variant="ghost" size="sm" onClick={handleNew}>
            <FileText className="w-4 h-4 mr-2" />
            New
          </Button>
          
          <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Open
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportJSON}>
                <Download className="w-4 h-4 mr-2" />
                Save Project (.json)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="default" size="sm" onClick={() => setShowExportModal(true)}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Mobile Menu */}
        <div className="lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleNew}>
                <FileText className="w-4 h-4 mr-2" />
                New Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Open Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON}>
                <Save className="w-4 h-4 mr-2" />
                Save Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowExportModal(true)}>
                <Download className="w-4 h-4 mr-2" />
                Export Pack
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop Right Menu */}
        <div className="hidden sm:flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.open('https://github.com/leptoon/superdecormod/blob/main/README.md#troubleshooting', '_blank')}
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Help
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.open('https://github.com/leptoon/superdecormod', '_blank')}
          >
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </Button>
        </div>

        {/* Export Button for Mobile */}
        <div className="lg:hidden">
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => setShowExportModal(true)}
            className="text-sm px-3"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>

        {/* Dirty State Indicator */}
        {isDirty && (
          <span className="text-xs text-orange-600 font-medium hidden sm:inline">
            Unsaved changes
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportJSON}
        className="hidden"
      />

      <ExportOptionsModal 
        open={showExportModal} 
        onClose={() => setShowExportModal(false)} 
      />
    </header>
  );
};
