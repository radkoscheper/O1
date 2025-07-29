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

  const loadImages = async () => {
    try {
      setLoading(true);
      
      // FIXED: Fallback search strategy to handle both old and new folder structures
      let searchFolder = folder;
      let images = [];
      
      if (destinationName) {
        // Try new organized structure first: ontdek-polen/destinations/tatra/headers
        const organizedFolder = `${folder}/destinations/${destinationName.toLowerCase()}/${selectedCategory}`;
        let response = await fetch(`/api/upload/cloudinary/list/${encodeURIComponent(organizedFolder)}`);
        
        if (response.ok) {
          const result = await response.json();
          images = result.data || [];
        }
        
        // If no images found, fallback to flat structure: ontdek-polen/destinations
        if (images.length === 0) {
          const flatFolder = `${folder}/destinations`;
          response = await fetch(`/api/upload/cloudinary/list/${encodeURIComponent(flatFolder)}`);
          
          if (response.ok) {
            const result = await response.json();
            // Filter images that contain destination name in filename
            const allImages = result.data || [];
            images = allImages.filter((img: CloudinaryImage) => 
              img.public_id.toLowerCase().includes(destinationName.toLowerCase())
            );
          }
        }
      } else {
        // No destination specified, search entire folder
        const response = await fetch(`/api/upload/cloudinary/list/${encodeURIComponent(searchFolder)}`);
        if (response.ok) {
          const result = await response.json();
          images = result.data || [];
        }
      }
      
      setImages(images.slice(0, maxItems));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load images';
      setError(errorMessage);
      toast({
        title: 'Laden mislukt',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [folder, destinationName, selectedCategory, maxItems]);

  // Listen for refresh events from upload components
  useEffect(() => {
    const handleRefresh = () => {
      loadImages();
    };
    
    window.addEventListener('cloudinary-gallery-refresh', handleRefresh);
    return () => window.removeEventListener('cloudinary-gallery-refresh', handleRefresh);
  }, []);

  const handleDelete = async (publicId: string) => {
    if (!confirm('Weet je zeker dat je deze afbeelding wilt verwijderen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/upload/cloudinary/${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      toast({
        title: 'Verwijderd',
        description: 'Afbeelding succesvol verwijderd van Cloudinary',
      });

      // Refresh the gallery
      loadImages();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      toast({
        title: 'Verwijderen mislukt',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'URL gekopieerd',
      description: 'Afbeelding URL is gekopieerd naar klembord',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Laden van afbeeldingen...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Fout bij laden: {error}</p>
            <Button onClick={loadImages} className="mt-2" variant="outline">
              Opnieuw proberen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (images.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <p>Geen afbeeldingen gevonden in folder: {folder}</p>
            <Button onClick={loadImages} className="mt-2" variant="outline">
              Vernieuwen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Cloudinary Gallery ({images.length})</span>
          <Button onClick={loadImages} variant="outline" size="sm">
            Vernieuwen
          </Button>
        </CardTitle>
        {showCategoryFilter && destinationName && (
          <div className="mt-4">
            <Label htmlFor="gallery-category">Filter op Categorie</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
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
            <p className="text-xs text-gray-500 mt-1">
              Bekijk afbeeldingen uit: {destinationName.toLowerCase()}/{selectedCategory}/
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          {images.map((image) => (
            <div key={image.public_id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="aspect-[5/2] bg-gray-100 relative">
                <img
                  src={image.secure_url}
                  alt={image.public_id}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              
              <div className="p-4 space-y-3">
                <div className="text-sm">
                  <p className="font-semibold text-gray-800 truncate" title={image.public_id}>
                    {image.public_id.split('/').pop()}
                  </p>
                  <p className="text-gray-600 text-base">
                    {image.width}×{image.height} • {formatFileSize(image.bytes)}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {formatDate(image.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {showSelectButton && onImageSelect && (
                    <Button
                      size="sm"
                      onClick={() => onImageSelect(image)}
                      className="flex-1 text-sm"
                    >
                      Selecteren
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyUrl(image.secure_url)}
                    title="URL kopiëren"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(image.secure_url, '_blank')}
                    title="Openen in nieuwe tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  
                  {showDeleteButton && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(image.public_id)}
                      title="Verwijderen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default CloudinaryGallery;