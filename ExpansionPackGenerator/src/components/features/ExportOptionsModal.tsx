import React, { useState, useMemo } from 'react';
import { Download, FolderDown, FileCode, CheckCircle, AlertCircle, ExternalLink, AlertTriangle } from 'lucide-react';
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

export function ExportOptionsModal({ open, onClose }: ExportOptionsModalProps) {
  const [selectedOption, setSelectedOption] = useState<'code' | 'project'>('project');
  const [isExporting, setIsExporting] = useState(false);
  const pack = useExpansionPackStore(state => state.pack);
  const { toast } = useToast();

  // Check for duplicate internal names
  const duplicateItems = useMemo(() => {
    const nameCount = new Map<string, number>();
    const duplicates: string[] = [];
    
    pack.items.forEach(item => {
      const count = nameCount.get(item.internalName) || 0;
      nameCount.set(item.internalName, count + 1);
      
      if (count === 1) {
        duplicates.push(item.internalName);
      }
    });
    
    return duplicates;
  }, [pack.items]);

  const hasDuplicates = duplicateItems.length > 0;

  const handleExport = async () => {
    // Prevent export if there are duplicates
    if (hasDuplicates) {
      toast({
        title: "Cannot export with duplicate items",
        description: "Please rename duplicate items before exporting.",
        variant: "destructive",
      });
      return;
    }

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
        a.download = pack.pluginId.replace(/\./g, '_') + '.cs';
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
        a.download = pack.pluginName.replace(/[^a-zA-Z0-9]/g, '') + '_Project.zip';
        a.click();
        URL.revokeObjectURL(url);

        toast({
          title: "Project exported successfully",
          description: "Your Visual Studio project has been downloaded as a ZIP file.",
        });
      }
      
      onClose();
    } catch {
      toast({
        title: "Export failed",
        description: "An error occurred while exporting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Build className strings separately to avoid nested template literal issues
  const projectOptionClassName = hasDuplicates 
    ? 'p-4 rounded-lg border-2 transition-all opacity-50 cursor-not-allowed border-gray-200' 
    : selectedOption === 'project'
      ? 'p-4 rounded-lg border-2 transition-all cursor-pointer border-blue-500 bg-blue-50'
      : 'p-4 rounded-lg border-2 transition-all cursor-pointer border-gray-200 hover:border-gray-300';

  const codeOptionClassName = hasDuplicates 
    ? 'p-4 rounded-lg border-2 transition-all opacity-50 cursor-not-allowed border-gray-200' 
    : selectedOption === 'code'
      ? 'p-4 rounded-lg border-2 transition-all cursor-pointer border-blue-500 bg-blue-50'
      : 'p-4 rounded-lg border-2 transition-all cursor-pointer border-gray-200 hover:border-gray-300';

  const folderIconClassName = hasDuplicates ? 'w-6 h-6 text-gray-400 mt-1' : 'w-6 h-6 text-blue-600 mt-1';
  const fileIconClassName = hasDuplicates ? 'w-6 h-6 text-gray-400 mt-1' : 'w-6 h-6 text-gray-600 mt-1';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Options</DialogTitle>
          <DialogDescription>
            Choose how you want to export your expansion pack
          </DialogDescription>
        </DialogHeader>

        {/* Duplicate Items Warning */}
        {hasDuplicates && (
          <Alert variant="destructive" className="my-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Duplicate items detected!</strong> The following internal names appear multiple times:
              <ul className="mt-2 list-disc list-inside">
                {duplicateItems.map(name => (
                  <li key={name} className="text-sm font-mono">{name}</li>
                ))}
              </ul>
              <p className="mt-2">Please rename these items before exporting to avoid conflicts.</p>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 my-6">
          {/* Full Project Option */}
          <div
            onClick={() => !hasDuplicates && setSelectedOption('project')}
            className={projectOptionClassName}
          >
            <div className="flex items-start gap-3">
              <FolderDown className={folderIconClassName} />
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
            onClick={() => !hasDuplicates && setSelectedOption('code')}
            className={codeOptionClassName}
          >
            <div className="flex items-start gap-3">
              <FileCode className={fileIconClassName} />
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

        {selectedOption === 'project' && !hasDuplicates && (
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
          <Button 
            onClick={handleExport} 
            disabled={isExporting || hasDuplicates}
            variant={hasDuplicates ? "destructive" : "default"}
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Exporting...
              </>
            ) : hasDuplicates ? (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Fix Duplicates First
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
}