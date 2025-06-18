import React, { useState } from 'react';
import { Download, FolderDown, FileCode, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { useExpansionPackStore } from '../../store/expansionPackStore';
import { CodeGenerator } from '../../services/codeGenerator';
import { ProjectGenerator } from '../../services/projectGenerator';
import { useToast } from '../ui/use-toast';

interface ExportOptionsModalProps {
  open: boolean;
  onClose: () => void;
}

export const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({ open, onClose }) => {
  const [selectedOption, setSelectedOption] = useState<'code' | 'project'>('project');
  const [isExporting, setIsExporting] = useState(false);
  const pack = useExpansionPackStore(state => state.pack);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (selectedOption === 'code') {
        // Export C# code only
        const generator = new CodeGenerator();
        generator.setCurrentPack(pack);
        const code = generator.generateExpansionPack(pack);
        
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pack.pluginId.replace(/\./g, '_')}.cs`;
        a.click();
        URL.revokeObjectURL(url);

        toast({
          title: "Code exported successfully",
          description: "Your C# file has been downloaded.",
        });
      } else {
        // Export full project
        const projectGenerator = new ProjectGenerator(pack);
        const blob = await projectGenerator.generateProjectZip();
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pack.pluginName.replace(/[^a-zA-Z0-9]/g, '')}_Project.zip`;
        a.click();
        URL.revokeObjectURL(url);

        toast({
          title: "Project exported successfully",
          description: "Your Visual Studio project has been downloaded as a ZIP file.",
        });
      }
      
      onClose();
    } catch {
      // Removed the unused 'error' parameter
      toast({
        title: "Export failed",
        description: "An error occurred while exporting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Options</DialogTitle>
          <DialogDescription>
            Choose how you want to export your expansion pack
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-6">
          {/* Full Project Option */}
          <div
            onClick={() => setSelectedOption('project')}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedOption === 'project'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <FolderDown className="w-6 h-6 text-blue-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold flex items-center gap-2">
                  Full Visual Studio Project
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">RECOMMENDED</span>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Complete project with all necessary files, build scripts, and instructions
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-500">
                  <li className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Ready-to-compile .csproj file
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Build scripts for Windows
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Asset folder structure
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Comprehensive README
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Code Only Option */}
          <div
            onClick={() => setSelectedOption('code')}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedOption === 'code'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <FileCode className="w-6 h-6 text-gray-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold">C# Code Only</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Just the generated C# source code file
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Choose this if you already have a project set up
                </p>
              </div>
            </div>
          </div>
        </div>

        {selectedOption === 'project' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Next Steps:</strong> After downloading, extract the ZIP file, add your assets to the Resources folder, 
              then run build.bat or open in Visual Studio.
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Build Requirements</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• .NET Framework 4.7.2 SDK</li>
            <li>• Visual Studio 2022 (Community Edition is free)</li>
            <li>• BepInEx and Super Decor mod installed</li>
          </ul>
          <a 
            href="https://github.com/leptoon/superdecormod#requirements" 
            className="text-sm text-blue-600 hover:underline inline-flex items-center mt-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            View detailed build guide <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
