// Unified upload utilities to prevent code duplication
import { toast } from "@/hooks/use-toast";

export interface UploadResult {
  success: boolean;
  imagePath?: string;
  faviconPath?: string;
  fileName?: string;
  message?: string;
}

export interface UploadOptions {
  file: File;
  fileName?: string;
  destination?: string;
  type?: 'image' | 'favicon';
  entityId?: string | number;
  entityName?: string;
  locationName?: string;
}

export const uploadFile = async (options: UploadOptions): Promise<UploadResult> => {
  const { file, fileName, destination, type = 'image', entityId, entityName, locationName } = options;
  
  try {
    // Validate file based on type
    if (type === 'favicon') {
      if (!file.name.toLowerCase().endsWith('.ico')) {
        throw new Error('Alleen .ico bestanden zijn toegestaan voor favicons');
      }
      if (file.size > 1024 * 1024) { // 1MB limit
        throw new Error('Favicon moet kleiner zijn dan 1MB');
      }
    } else {
      if (!file.type.startsWith('image/')) {
        throw new Error('Selecteer een geldig afbeelding bestand');
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Afbeelding moet kleiner zijn dan 5MB');
      }
    }

    const formData = new FormData();
    
    if (type === 'favicon') {
      formData.append('favicon', file);
      if (fileName) {
        formData.append('fileName', fileName.replace('.ico', ''));
      }
    } else {
      formData.append('image', file);
      // For motivatie uploads with locationName, don't send fileName
      if (fileName && fileName.trim() && !(destination === 'motivatie' && locationName)) {
        formData.append('fileName', fileName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
      }
      if (destination) {
        formData.append('destination', destination);
      }
      if (entityId) {
        formData.append('entityId', entityId.toString());
      }
      if (entityName) {
        formData.append('entityName', entityName);
      }
      if (locationName) {
        formData.append('locationName', locationName);
      }
    }

    const endpoint = type === 'favicon' ? '/api/upload/favicon' : '/api/upload';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Upload gefaald');
    }

    if (result.success || type === 'favicon') {
      toast({ 
        title: "Succes", 
        description: type === 'favicon' 
          ? "Favicon succesvol geüpload!"
          : `Afbeelding succesvol geüpload als ${result.fileName || file.name}` 
      });
      return result;
    } else {
      throw new Error(result.message || 'Upload gefaald');
    }
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : "Er is een fout opgetreden tijdens uploaden";
    
    toast({ 
      title: "Upload fout", 
      description: errorMessage,
      variant: "destructive" 
    });
    
    throw new Error(errorMessage);
  }
};

export const validateFileType = (file: File, type: 'image' | 'favicon'): boolean => {
  if (type === 'favicon') {
    return file.name.toLowerCase().endsWith('.ico');
  }
  return file.type.startsWith('image/');
};

export const validateFileSize = (file: File, type: 'image' | 'favicon'): boolean => {
  const maxSize = type === 'favicon' ? 1024 * 1024 : 5 * 1024 * 1024;
  return file.size <= maxSize;
};

// Specific function for uploading images to folders (like motivatie, backgrounds, etc.)
export const uploadImageToFolder = async (
  file: File, 
  destination: string, 
  fileName: string = '', 
  entityName: string = '',
  locationName?: string
): Promise<string> => {
  try {
    // For motivatie images with locationName, don't use fileName to allow server to generate from locationName
    const finalFileName = (destination === 'motivatie' && locationName) ? '' : (fileName || '');
    
    const result = await uploadFile({
      file,
      fileName: finalFileName,
      destination,
      type: 'image',
      entityName,
      locationName
    });

    if (result.success && result.imagePath) {
      return result.imagePath;
    } else {
      throw new Error(result.message || 'Upload gefaald');
    }
  } catch (error) {
    console.error('uploadImageToFolder error:', error);
    throw error;
  }
};