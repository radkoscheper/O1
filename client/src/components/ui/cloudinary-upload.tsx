import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card, CardContent } from './card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Upload, X, Crop, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CloudinaryUploadProps {
  folder?: string;
  destinationName?: string;
  onUploadSuccess?: (result: any) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
  showPreview?: boolean;
  showCategorySelector?: boolean;
  transformations?: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
    quality?: string | number;
  };
}

export function CloudinaryUpload({
  folder = 'ontdek-polen',
  destinationName,
  onUploadSuccess,
  onUploadError,
  acceptedTypes = 'image/*',
  maxSizeMB = 10,
  showPreview = true,
  showCategorySelector = true,
  transformations,
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('headers');
  const [customFileName, setCustomFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const categories = [
    { value: 'headers', label: '🖼️ Headers' },
    { value: 'bb', label: '🏠 B&B / Accommodatie' },
    { value: 'activities', label: '🎯 Activiteiten' },
    { value: 'restaurants', label: '🍽️ Restaurants' },
    { value: 'attractions', label: '🏛️ Attracties' },
    { value: 'nature', label: '🌲 Natuur' },
    { value: 'culture', label: '🎭 Cultuur' },
    { value: 'nightlife', label: '🌙 Nachtleven' },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: 'Bestand te groot',
        description: `Maximum grootte is ${maxSizeMB}MB`,
        variant: 'destructive',
      });
      return;
    }

    // Generate smart filename
    const timestamp = new Date().toISOString().split('T')[0];
    const cleanName = file.name.toLowerCase()
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-z0-9-]/g, '-') // Replace special chars
      .replace(/-+/g, '-') // Remove multiple dashes
      .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
    
    setFileName(`${cleanName}-${timestamp}`);

    // Show preview
    if (showPreview && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Build dynamic folder path: ontdek-polen/destinations/wroclaw/headers
      const finalFolder = destinationName 
        ? `${folder}/destinations/${destinationName.toLowerCase()}/${selectedCategory}`
        : folder;
      
      // Use custom filename if provided, otherwise generate clean timestamp-based name
      const cleanCustomName = customFileName.trim().replace(/[^a-z0-9-]/gi, '').toLowerCase();
      const finalFileName = cleanCustomName || 
        `${destinationName?.toLowerCase() || 'image'}-header-${Date.now()}`;
      
      formData.append('folder', finalFolder);
      formData.append('public_id', finalFileName);
      
      if (transformations) {
        formData.append('transformations', JSON.stringify(transformations));
      }

      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      toast({
        title: 'Upload succesvol',
        description: `${file.name} is geüpload naar Cloudinary`,
      });

      onUploadSuccess?.(result);
      
      // Reset form
      setPreview(null);
      setFileName('');
      setCustomFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload mislukt';
      toast({
        title: 'Upload mislukt',
        description: errorMessage,
        variant: 'destructive',
      });
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {showCategorySelector && destinationName && (
            <div>
              <Label htmlFor="category-select">Categorie</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer categorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                📁 Upload naar: ontdek-polen/destinations/{destinationName.toLowerCase()}/{selectedCategory}/
              </p>
            </div>
          )}
          
          <div>
            <Label htmlFor="file-upload">Selecteer bestand</Label>
            <Input
              id="file-upload"
              type="file"
              ref={fileInputRef}
              accept={acceptedTypes}
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum {maxSizeMB}MB, {acceptedTypes}
            </p>
          </div>

          {/* Custom Filename Input */}
          <div className="space-y-2">
            <Label htmlFor="customFileName">
              Vriendelijke bestandsnaam (optioneel)
            </Label>
            <Input
              id="customFileName"
              type="text"
              placeholder="bijv: main-header, mountain-view, winter-landscape"
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase())}
              className="text-sm"
            />
            <p className="text-xs text-gray-500">
              Laat leeg voor automatische naamgeving. Alleen letters, cijfers en koppeltekens toegestaan.
            </p>
          </div>

          {fileName && (
            <div>
              <Label htmlFor="filename">Gegenereerde bestandsnaam</Label>
              <Input
                id="filename"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="bestandsnaam-datum"
                disabled
                className="bg-gray-50"
              />
            </div>
          )}

          {preview && showPreview && (
            <div className="relative">
              <Label>Preview</Label>
              <div className="relative border rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={clearPreview}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {transformations && (
                <p className="text-sm text-gray-500 mt-1">
                  Wordt automatisch geoptimaliseerd: {transformations.width}x{transformations.height}px, kwaliteit: {transformations.quality}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!fileName || isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload naar Cloudinary
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CloudinaryUpload;