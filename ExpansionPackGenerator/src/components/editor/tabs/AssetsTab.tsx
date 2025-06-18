import React, { useState } from 'react';
import { FileImage, Package, Palette, FileText, Download, Upload } from 'lucide-react';
import { type DecorItem } from '../../../types/expansion';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';
import { useExpansionPackStore } from '../../../store/expansionPackStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { MeshConverter } from './MeshConverter';
import { useToast } from '../../ui/use-toast';

interface AssetsTabProps {
  item: DecorItem;
  onChange: (field: keyof DecorItem, value: DecorItem[keyof DecorItem]) => void;
}

export const AssetsTab: React.FC<AssetsTabProps> = ({ item, onChange }) => {
  const pack = useExpansionPackStore(state => state.pack);
  const [showMeshConverter, setShowMeshConverter] = useState(false);
  const { toast } = useToast();

  const generateAssetChecklist = () => {
    const checklist = `Asset Checklist for ${item.itemName}
=====================================

Required Files:

Icons/
  └── ${item.iconAssetName}.png (128x128 pixels, PNG with transparency)

Meshes/
  └── ${item.meshAssetName}.json (Exported from Unity)

Textures/
  ├── ${item.meshAssetName}_Albedo.png (Main color texture)
  └── ${item.meshAssetName}_Normal.png (Optional normal map)

Asset Guidelines:
- Icons: 128x128 PNG with transparent background
- Textures: Power of 2 dimensions (512x512, 1024x1024)
- Meshes: Export as JSON from Unity
- File names are case-sensitive!

Place all files in the Resources folder of your project.`;

    const blob = new Blob([checklist], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.internalName}_assets_checklist.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleMeshConverted = (meshName: string, jsonContent: string) => {
    // Update the mesh asset name to match the converted file
    onChange('meshAssetName', meshName);
    
    // Show success toast
    toast({
      title: "Mesh converted successfully",
      description: `Save the JSON file as "${meshName}.json" in your Resources/Meshes folder.`,
    });
    
    // Close the converter dialog
    setShowMeshConverter(false);
    
    // Auto-download the JSON file
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meshName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Asset References</h3>
        <p className="text-sm text-gray-600">
          Configure the asset files that will be embedded in your expansion pack.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="iconAssetName" className="flex items-center gap-2">
            <FileImage className="w-4 h-4" />
            Icon Asset Name
          </Label>
          <Input
            id="iconAssetName"
            value={item.iconAssetName}
            onChange={(e) => onChange('iconAssetName', e.target.value)}
            placeholder="crystal_ball_icon"
          />
          <p className="text-xs text-gray-500 mt-1">
            Expected: Resources/Icons/{item.iconAssetName}.png
          </p>
        </div>

        <div>
          <Label htmlFor="meshAssetName" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Mesh Asset Name
          </Label>
          <div className="flex gap-2">
            <Input
              id="meshAssetName"
              value={item.meshAssetName}
              onChange={(e) => onChange('meshAssetName', e.target.value)}
              placeholder="crystal_ball"
              className="flex-1"
            />
            <Dialog open={showMeshConverter} onOpenChange={setShowMeshConverter}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Convert OBJ
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Convert OBJ to JSON</DialogTitle>
                </DialogHeader>
                <MeshConverter 
                  onMeshConverted={handleMeshConverted}
                  defaultMeshName={item.meshAssetName || item.internalName}
                />
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Expected: Resources/Meshes/{item.meshAssetName}.json
          </p>
        </div>

        <div>
          <Label htmlFor="materialAssetName" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Material Asset Name
          </Label>
          <Input
            id="materialAssetName"
            value={item.materialAssetName}
            onChange={(e) => onChange('materialAssetName', e.target.value)}
            placeholder="crystal_ball_material"
          />
          <p className="text-xs text-gray-500 mt-1">
            Usually the same as mesh name + "_material"
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Asset Bundle Name</h4>
          <p className="text-sm text-gray-600 font-mono bg-white px-2 py-1 rounded">
            {pack.pluginId}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Automatically set based on your plugin ID
          </p>
        </div>
      </div>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertTitle>Texture Naming Convention</AlertTitle>
        <AlertDescription className="space-y-2 mt-2">
          <p>For a mesh named "{item.meshAssetName || 'example'}", textures should be:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li><strong>Albedo:</strong> {item.meshAssetName || 'example'}_Albedo.png</li>
            <li><strong>Normal:</strong> {item.meshAssetName || 'example'}_Normal.png (optional)</li>
          </ul>
          <p className="text-sm mt-2">Place textures in: Resources/Textures/</p>
        </AlertDescription>
      </Alert>

      <Alert className="border-blue-200 bg-blue-50">
        <Upload className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">OBJ to JSON Converter Available</AlertTitle>
        <AlertDescription className="text-blue-800">
          You can now convert OBJ files directly to the JSON format required by Super Decor. 
          Click the "Convert OBJ" button next to the Mesh Asset Name field to convert your 3D models without Unity.
        </AlertDescription>
      </Alert>

      <div className="flex justify-center">
        <Button onClick={generateAssetChecklist} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Generate Asset Checklist
        </Button>
      </div>
    </div>
  );
};
