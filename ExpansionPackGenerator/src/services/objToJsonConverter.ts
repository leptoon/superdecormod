// OBJ to JSON Converter
// Author: Leptoon
// Version: 1.0
// Released: June 17 2025

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface MeshDataForJson {
  name: string;
  vertices: Vector3[];
  triangles: number[];
  normals: Vector3[];
  uv: Vector2[];
}

export class OBJToJsonConverter {
  /**
   * Converts an OBJ file content to the JSON format expected by Super Decor
   * @param objContent The raw text content of the OBJ file
   * @param meshName The name to assign to the mesh
   * @returns The mesh data in JSON format
   */
  static convertOBJToJson(objContent: string, meshName: string): MeshDataForJson {
    const lines = objContent.split('\n');
    
    const vertices: Vector3[] = [];
    const normals: Vector3[] = [];
    const uvs: Vector2[] = [];
    const triangles: number[] = [];
    
    // Maps to handle OBJ's separate indexing for vertices/normals/uvs
    const vertexMap = new Map<string, number>();
    const processedVertices: Vector3[] = [];
    const processedNormals: Vector3[] = [];
    const processedUVs: Vector2[] = [];
    
    // Parse OBJ file line by line
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) continue;
      
      const parts = trimmedLine.split(/\s+/);
      const command = parts[0];
      
      switch (command) {
        case 'v': // Vertex position
          if (parts.length >= 4) {
            vertices.push({
              x: parseFloat(parts[1]),
              y: parseFloat(parts[2]),
              z: parseFloat(parts[3])
            });
          }
          break;
          
        case 'vn': // Vertex normal
          if (parts.length >= 4) {
            normals.push({
              x: parseFloat(parts[1]),
              y: parseFloat(parts[2]),
              z: parseFloat(parts[3])
            });
          }
          break;
          
        case 'vt': // Vertex texture coordinate
          if (parts.length >= 3) {
            uvs.push({
              x: parseFloat(parts[1]),
              y: parseFloat(parts[2])
            });
          }
          break;
          
        case 'f': // Face
          // OBJ faces can have formats: v, v/vt, v/vt/vn, or v//vn
          const faceIndices = parts.slice(1);
          
          // Convert polygon to triangles (fan triangulation)
          for (let i = 1; i < faceIndices.length - 1; i++) {
            // Process triangle: vertex 0, vertex i, vertex i+1
            const indices = [faceIndices[0], faceIndices[i], faceIndices[i + 1]];
            
            for (const indexStr of indices) {
              // Check if we've already processed this combination
              let vertexIndex = vertexMap.get(indexStr);
              
              if (vertexIndex === undefined) {
                // Parse the index string (can be "v", "v/vt", "v/vt/vn", or "v//vn")
                const indexParts = indexStr.split('/');
                const vIdx = parseInt(indexParts[0]) - 1; // OBJ indices are 1-based
                const vtIdx = indexParts.length > 1 && indexParts[1] ? parseInt(indexParts[1]) - 1 : -1;
                const vnIdx = indexParts.length > 2 ? parseInt(indexParts[2]) - 1 : -1;
                
                // Add new vertex
                vertexIndex = processedVertices.length;
                vertexMap.set(indexStr, vertexIndex);
                
                // Add vertex position
                if (vIdx >= 0 && vIdx < vertices.length) {
                  processedVertices.push(vertices[vIdx]);
                } else {
                  processedVertices.push({ x: 0, y: 0, z: 0 });
                }
                
                // Add normal
                if (vnIdx >= 0 && vnIdx < normals.length) {
                  processedNormals.push(normals[vnIdx]);
                } else {
                  // Generate a default normal if not provided
                  processedNormals.push({ x: 0, y: 1, z: 0 });
                }
                
                // Add UV
                if (vtIdx >= 0 && vtIdx < uvs.length) {
                  processedUVs.push(uvs[vtIdx]);
                } else {
                  // Default UV if not provided
                  processedUVs.push({ x: 0, y: 0 });
                }
              }
              
              triangles.push(vertexIndex);
            }
          }
          break;
      }
    }
    
    // If no normals were provided, calculate them
    if (processedNormals.length === 0 && processedVertices.length > 0) {
      processedNormals.length = processedVertices.length;
      for (let i = 0; i < processedVertices.length; i++) {
        processedNormals[i] = { x: 0, y: 0, z: 0 };
      }
      
      // Calculate face normals and average them per vertex
      for (let i = 0; i < triangles.length; i += 3) {
        const i0 = triangles[i];
        const i1 = triangles[i + 1];
        const i2 = triangles[i + 2];
        
        const v0 = processedVertices[i0];
        const v1 = processedVertices[i1];
        const v2 = processedVertices[i2];
        
        // Calculate face normal
        const edge1 = {
          x: v1.x - v0.x,
          y: v1.y - v0.y,
          z: v1.z - v0.z
        };
        const edge2 = {
          x: v2.x - v0.x,
          y: v2.y - v0.y,
          z: v2.z - v0.z
        };
        
        // Cross product
        const normal = {
          x: edge1.y * edge2.z - edge1.z * edge2.y,
          y: edge1.z * edge2.x - edge1.x * edge2.z,
          z: edge1.x * edge2.y - edge1.y * edge2.x
        };
        
        // Add to vertex normals
        processedNormals[i0].x += normal.x;
        processedNormals[i0].y += normal.y;
        processedNormals[i0].z += normal.z;
        
        processedNormals[i1].x += normal.x;
        processedNormals[i1].y += normal.y;
        processedNormals[i1].z += normal.z;
        
        processedNormals[i2].x += normal.x;
        processedNormals[i2].y += normal.y;
        processedNormals[i2].z += normal.z;
      }
      
      // Normalize the normals
      for (const normal of processedNormals) {
        const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
        if (length > 0) {
          normal.x /= length;
          normal.y /= length;
          normal.z /= length;
        }
      }
    }
    
    // Ensure UVs array matches vertices array length
    while (processedUVs.length < processedVertices.length) {
      processedUVs.push({ x: 0, y: 0 });
    }
    
    return {
      name: meshName,
      vertices: processedVertices,
      triangles: triangles,
      normals: processedNormals,
      uv: processedUVs
    };
  }
  
  /**
   * Converts the mesh data to a JSON string matching Unity's format
   * @param meshData The mesh data object
   * @returns JSON string formatted for Unity/Super Decor
   */
  static meshDataToJsonString(meshData: MeshDataForJson): string {
    return JSON.stringify(meshData, null, 2);
  }
  
  /**
   * Validates if the converted mesh data is valid
   * @param meshData The mesh data to validate
   * @returns Object with validation result and any error messages
   */
  static validateMeshData(meshData: MeshDataForJson): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!meshData.vertices || meshData.vertices.length === 0) {
      errors.push('No vertices found in the mesh');
    }
    
    if (!meshData.triangles || meshData.triangles.length === 0) {
      errors.push('No triangles found in the mesh');
    }
    
    if (meshData.triangles.length % 3 !== 0) {
      errors.push('Triangle array length must be a multiple of 3');
    }
    
    // Check if all triangle indices are valid
    const maxIndex = meshData.vertices.length - 1;
    for (const index of meshData.triangles) {
      if (index < 0 || index > maxIndex) {
        errors.push(`Invalid triangle index: ${index} (must be between 0 and ${maxIndex})`);
        break;
      }
    }
    
    if (meshData.normals.length !== meshData.vertices.length) {
      errors.push(`Normal count (${meshData.normals.length}) doesn't match vertex count (${meshData.vertices.length})`);
    }
    
    if (meshData.uv.length !== meshData.vertices.length) {
      errors.push(`UV count (${meshData.uv.length}) doesn't match vertex count (${meshData.vertices.length})`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
