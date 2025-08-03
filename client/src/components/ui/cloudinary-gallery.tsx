import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Label } from './label';
import { Trash2, ExternalLink, Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
}

interface CloudinaryGalleryProps {
  folder?: string;
  destinationName?: string;
  category?: string;
  onImageSelect?: (image: CloudinaryImage) => void;
  showSelectButton?: boolean;
  showDeleteButton?: boolean;
  showCategoryFilter?: boolean;
  maxItems?: number;
}

export function CloudinaryGallery({
  folder = 'ontdek-polen',
  destinationName,
  category = 'headers',
  onImageSelect,
  showSelectButton = true,
  showDeleteButton = true,
  showCategoryFilter = false,
  maxItems = 20,
}: CloudinaryGalleryProps) {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(category);
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

  // Fetch images from Cloudinary via our backend
  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchFolder = destinationName 
        ? `${folder}/${destinationName}/${selectedCategory}`
        : `${folder}/${selectedCategory}`;
      
      const response = await fetch(`/api/admin/cloudinary/images?folder=${encodeURIComponent(searchFolder)}&max_results=${maxItems}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.statusText}`);
      }
      
      const data = await response.json();
      setImages(data.resources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching Cloudinary images:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete image from Cloudinary
  const deleteImage = async (publicId: string) => {
    try {
      const response = await fetch('/api/admin/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: publicId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete image: ${response.statusText}`);
      }

      // Remove from local state
      setImages(prev => prev.filter(img => img.public_id !== publicId));
      
      toast({
        title: "Afbeelding verwijderd",
        description: "De afbeelding is succesvol verwijderd van Cloudinary",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete image',
        variant: "destructive",
      });
    }
  };

  // Copy URL to clipboard
  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "URL gekopieerd",
        description: "De afbeelding URL is gekopieerd naar het klembord",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Kon URL niet kopiëren",
        variant: "destructive",
      });
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Fetch images when component mounts or category changes
  useEffect(() => {
    fetchImages();
  }, [selectedCategory, destinationName, folder, maxItems]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cloudinary Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Afbeeldingen laden...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cloudinary Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={fetchImages} variant="outline">
              Opnieuw proberen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cloudinary Gallery</CardTitle>
        {showCategoryFilter && (
          <div className="flex items-center space-x-2">
            <Label htmlFor="category">Categorie:</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecteer categorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Geen afbeeldingen gevonden in {destinationName ? `${destinationName}/${selectedCategory}` : selectedCategory}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.public_id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="relative mb-3">
                  <img
                    src={image.secure_url}
                    alt={image.public_id}
                    className="w-full h-32 object-cover rounded"
                    loading="lazy"
                  />
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="font-medium truncate" title={image.public_id}>
                    {image.public_id.split('/').pop()}
                  </p>
                  <p>{image.width} × {image.height} px</p>
                  <p>{formatFileSize(image.bytes)} • {image.format.toUpperCase()}</p>
                </div>

                <div className="flex gap-2 mt-3">
                  {showSelectButton && onImageSelect && (
                    <Button
                      size="sm"
                      onClick={() => onImageSelect(image)}
                      className="flex-1"
                    >
                      Selecteren
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyUrl(image.secure_url)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(image.secure_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  
                  {showDeleteButton && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteImage(image.public_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Button onClick={fetchImages} variant="outline">
            Vernieuwen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}