import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CloudinaryUpload from '@/components/ui/cloudinary-upload';
import CloudinaryGallery from '@/components/ui/cloudinary-gallery';
import { useToast } from '@/hooks/use-toast';

export default function CloudinaryTest() {
  const { toast } = useToast();

  const handleUploadSuccess = (result: any) => {
    console.log('Upload successful:', result);
    toast({
      title: 'Upload succesvol',
      description: `Afbeelding geüpload: ${result.data.public_id}`,
    });
    
    // Force gallery refresh by reloading the page (simple solution)
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleImageSelect = (image: any) => {
    console.log('Image selected:', image);
    toast({
      title: 'Afbeelding geselecteerd',
      description: `${image.public_id} - ${image.width}x${image.height}`,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Cloudinary Test Page</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upload Test</CardTitle>
            </CardHeader>
            <CardContent>
              <CloudinaryUpload
                folder="ontdek-polen/destinations"
                onUploadSuccess={handleUploadSuccess}
                transformations={{
                  width: 1200,
                  height: 800,
                  crop: 'fill',
                  quality: 'auto:good',
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Gallery Test</CardTitle>
            </CardHeader>
            <CardContent>
              <CloudinaryGallery
                folder="ontdek-polen"
                onImageSelect={handleImageSelect}
                maxItems={10}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Features Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <h3 className="font-medium text-green-800">✅ Upload Features</h3>
                <ul className="mt-2 text-green-700 space-y-1">
                  <li>• Automatische compressie</li>
                  <li>• Smart file naming</li>
                  <li>• Custom transformations</li>
                  <li>• Preview functionaliteit</li>
                </ul>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <h3 className="font-medium text-blue-800">✅ Gallery Features</h3>
                <ul className="mt-2 text-blue-700 space-y-1">
                  <li>• Grid layout</li>
                  <li>• Image selection</li>
                  <li>• URL copying</li>
                  <li>• Delete functionaliteit</li>
                </ul>
              </div>
              
              <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                <h3 className="font-medium text-purple-800">✅ CDN Benefits</h3>
                <ul className="mt-2 text-purple-700 space-y-1">
                  <li>• Wereldwijde CDN</li>
                  <li>• Auto WebP conversie</li>
                  <li>• Responsive images</li>
                  <li>• Snellere laadtijden</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-medium text-yellow-800">📝 Smart Naming Voorbeelden:</h3>
              <ul className="mt-2 text-yellow-700 space-y-1">
                <li>• <code>krakow-29-1-2025.webp</code> (automatisch)</li>
                <li>• <code>markt-krakau-29-1-2025.webp</code> (met custom naam)</li>
                <li>• <code>tatra-mountains-29-1-2025.webp</code> (locatie-specifiek)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}