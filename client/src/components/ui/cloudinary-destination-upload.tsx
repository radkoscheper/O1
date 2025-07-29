import React, { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Crop, Upload, Image as ImageIcon, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CloudinaryUpload from './cloudinary-upload';
import CloudinaryGallery from './cloudinary-gallery';

interface DestinationImageManagerProps {
  destinationName: string;
  currentHeaderImage?: string;
  currentCardImage?: string;
  onHeaderImageUpdate?: (imageUrl: string, publicId: string) => void;
  onCardImageUpdate?: (imageUrl: string, publicId: string) => void;
}

export function DestinationImageManager({
  destinationName,
  currentHeaderImage,
  currentCardImage,
  onHeaderImageUpdate,
  onCardImageUpdate
}: DestinationImageManagerProps) {
  const { toast } = useToast();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Afbeelding Beheer - {destinationName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="header" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="header" className="flex items-center gap-2">
              <Crop className="w-4 h-4" />
              Header Afbeelding
            </TabsTrigger>
            <TabsTrigger value="card" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Card Afbeelding
            </TabsTrigger>
          </TabsList>

          <TabsContent value="header" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CloudinaryUpload
                  folder={`ontdek-polen/destinations/${destinationName.toLowerCase()}/headers`}
                  transformations={{
                    width: 1200,
                    height: 480,
                    crop: 'fill',
                    quality: 'auto:good',
                  }}
                  onUploadSuccess={(result) => {
                    toast({
                      title: 'Header afbeelding geüpload',
                      description: `Automatisch gecropd naar 1200x480px voor ${destinationName}`,
                    });
                    onHeaderImageUpdate?.(result.data.secure_url, result.data.public_id);
                  }}
                />
                <div>
                  <h4 className="font-medium mb-2">Huidige Header</h4>
                  {currentHeaderImage ? (
                    <img 
                      src={currentHeaderImage} 
                      alt={`${destinationName} header`}
                      className="w-full h-32 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center text-gray-500">
                      Geen header afbeelding
                    </div>
                  )}
                </div>
              </div>
              
              <CloudinaryGallery
                folder={`ontdek-polen/destinations/${destinationName.toLowerCase()}/headers`}
                onImageSelect={(image) => {
                  onHeaderImageUpdate?.(image.secure_url, image.public_id);
                  toast({
                    title: 'Header afbeelding geselecteerd',
                    description: `${image.public_id.split('/').pop()} is nu de header voor ${destinationName}`,
                  });
                }}
                maxItems={6}
              />
            </div>
          </TabsContent>

          <TabsContent value="card" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CloudinaryUpload
                  folder={`ontdek-polen/destinations/${destinationName.toLowerCase()}/cards`}
                  transformations={{
                    width: 400,
                    height: 300,
                    crop: 'fill',
                    quality: 'auto:good',
                  }}
                  onUploadSuccess={(result) => {
                    toast({
                      title: 'Card afbeelding geüpload',
                      description: `Automatisch gecropd naar 400x300px voor ${destinationName}`,
                    });
                    onCardImageUpdate?.(result.data.secure_url, result.data.public_id);
                  }}
                />
                <div>
                  <h4 className="font-medium mb-2">Huidige Card</h4>
                  {currentCardImage ? (
                    <img 
                      src={currentCardImage} 
                      alt={`${destinationName} card`}
                      className="w-full h-32 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center text-gray-500">
                      Geen card afbeelding
                    </div>
                  )}
                </div>
              </div>
              
              <CloudinaryGallery
                folder={`ontdek-polen/destinations/${destinationName.toLowerCase()}/cards`}
                onImageSelect={(image) => {
                  onCardImageUpdate?.(image.secure_url, image.public_id);
                  toast({
                    title: 'Card afbeelding geselecteerd',
                    description: `${image.public_id.split('/').pop()} is nu de card voor ${destinationName}`,
                  });
                }}
                maxItems={6}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Cloudinary Voordelen
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-700">
            <div>
              <strong>Automatische Optimalisatie:</strong>
              <ul className="ml-2 space-y-1">
                <li>• Smart cropping naar juiste formaat</li>
                <li>• Compressie zonder kwaliteitsverlies</li>
                <li>• WebP conversie voor snelheid</li>
              </ul>
            </div>
            <div>
              <strong>Smart Features:</strong>
              <ul className="ml-2 space-y-1">
                <li>• Wereldwijde CDN distributie</li>
                <li>• Automatische backup in cloud</li>
                <li>• Responsive image serving</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DestinationImageManager;