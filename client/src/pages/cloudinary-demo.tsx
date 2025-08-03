import React from 'react';
import { CloudinaryGallery } from '@/components/ui/cloudinary-gallery';

export function CloudinaryDemo() {
  const handleImageSelect = (image: any) => {
    console.log('Selected image:', image);
    alert(`Selected: ${image.public_id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Cloudinary Gallery Demo
        </h1>
        
        <div className="grid gap-8">
          {/* Headers Gallery */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Headers Gallery</h2>
            <CloudinaryGallery
              folder="ontdek-polen"
              category="headers"
              onImageSelect={handleImageSelect}
              showCategoryFilter={false}
              maxItems={12}
            />
          </div>

          {/* Destinations Gallery with Category Filter */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Destinations Gallery (with Categories)</h2>
            <CloudinaryGallery
              folder="ontdek-polen"
              destinationName="krakow"
              category="headers"
              onImageSelect={handleImageSelect}
              showCategoryFilter={true}
              maxItems={8}
            />
          </div>

          {/* Activities Gallery */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Activities Gallery (No Selection)</h2>
            <CloudinaryGallery
              folder="ontdek-polen"
              category="activities"
              showSelectButton={false}
              showDeleteButton={false}
              maxItems={6}
            />
          </div>
        </div>
      </div>
    </div>
  );
}