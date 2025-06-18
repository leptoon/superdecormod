// MeshConverter.tsx - Place in src/components/editor/tabs/
import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, AlertCircle, Check, X } from 'lucide-react';
import { Button } from '../../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';
import { OBJToJsonConverter, MeshDataForJson } from '../../../services/objToJsonConverter';

interface MeshConverterProps {
  onMeshConverted?: (meshName: string, jsonContent: string) => void;
  defaultMeshName?: string;
}

export const MeshConverter: React.FC<MeshConverterProps> = ({ 
  onMeshConverted, 
  defaultMeshName = 'converted_mesh' 
}) => {
  const [isConverting, setIsConverting] = useState(false);
  const [convertedMesh, setConvertedMesh] = useState<MeshDataForJson | null>(null);
  const [meshName, setMeshName] = useState(defaultMeshName);
  const [errors, setErrors] = useState<string[]>([]);
  const [stats, setStats] = useState<{
    vertices: number;
    triangles: number;
    hasNormals: boolean;
    hasUVs: boolean;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsConverting(true);
    setErrors([]);
    setConvertedMesh(null);
    setStats(null);

    try {
      const content = await file.text();
      
      // Use filename without extension as default mesh name
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setMeshName(nameWithoutExt);
      
      // Convert OBJ to JSON
      const meshData = OBJToJsonConverter.convertOBJToJson(content, nameWithoutExt);
      
      // Validate the converted data
      const validation = OBJToJsonConverter.validateMeshData(meshData);
      
      if (validation.isValid) {
        setConvertedMesh(meshData);
        
        // Calculate stats
        setStats({
          vertices: meshData.vertices.length,
          triangles: meshData.triangles.length / 3,
          hasNormals: meshData.normals.length > 0 && 
                     meshData.normals.some(n => n.x !== 0 || n.y !== 0 || n.z !== 0),
          hasUVs: meshData.uv.length > 0 && 
                  meshData.uv.some(uv => uv.x !== 0 || uv.y !== 0)
        });
        
        // Notify parent component if callback provided
        if (onMeshConverted) {
          const jsonString = OBJToJsonConverter.meshDataToJsonString(meshData);
          onMeshConverted(nameWithoutExt, jsonString);
        }
      } else {
        setErrors(validation.errors);
      }
    } catch (error) {
      setErrors([`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setIsConverting(false);
      // Reset input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = () => {
    if (!convertedMesh) return;
    
    const jsonString = OBJToJsonConverter.meshDataToJsonString(convertedMesh);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meshName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async () => {
    if (!convertedMesh) return;
    
    const jsonString = OBJToJsonConverter.meshDataToJsonString(convertedMesh);
    try {
      await navigator.clipboard.writeText(jsonString);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">OBJ to JSON Mesh Converter</h3>
        <p className="text-sm text-gray-600">
          Convert OBJ files to the JSON format required by Super Decor
        </p>
      </div>

      {/* File Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept=".obj"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isConverting}
          variant="outline"
          size="lg"
          className="mx-auto"
        >
          <Upload className="w-5 h-5 mr-2" />
          {isConverting ? 'Converting...' : 'Select OBJ File'}
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          Or drag and drop an OBJ file here
        </p>
      </div>

      {/* Progress indicator */}
      {isConverting && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Converting mesh...</span>
            <span>Processing</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full w-1/2 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Error display */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Conversion Failed</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Success display with stats */}
      {convertedMesh && stats && (
        <div className="space-y-4">
          <Alert>
            <Check className="h-4 w-4" />
            <AlertTitle>Conversion Successful!</AlertTitle>
            <AlertDescription>
              Your OBJ file has been converted to JSON format.
            </AlertDescription>
          </Alert>

          {/* Mesh Statistics */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm mb-2">Mesh Statistics</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Vertices:</span>
                <span className="font-mono">{stats.vertices}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Triangles:</span>
                <span className="font-mono">{stats.triangles}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Normals:</span>
                <span className="font-mono flex items-center gap-1">
                  {stats.hasNormals ? (
                    <><Check className="w-3 h-3 text-green-600" /> Yes</>
                  ) : (
                    <><X className="w-3 h-3 text-red-600" /> Generated</>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">UV Coordinates:</span>
                <span className="font-mono flex items-center gap-1">
                  {stats.hasUVs ? (
                    <><Check className="w-3 h-3 text-green-600" /> Yes</>
                  ) : (
                    <><X className="w-3 h-3 text-yellow-600" /> Default</>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Download options */}
          <div className="flex gap-2">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download JSON
            </Button>
            <Button onClick={handleCopyToClipboard} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Copy to Clipboard
            </Button>
          </div>

          {/* Usage instructions */}
          <Alert>
            <AlertDescription>
              <strong>Next steps:</strong> Save this JSON file as{' '}
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
                {meshName}.json
              </code>{' '}
              in your <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
                Resources/Meshes/
              </code>{' '}
              folder.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};
