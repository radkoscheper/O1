/**
 * Cloudinary AI Transformaties Demo Pagina
 * Toont voor/na vergelijking van AI-geoptimaliseerde images
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateCloudinaryUrl, getSmartTransform, CLOUDINARY_TRANSFORMS } from '@/lib/cloudinaryUtils';
import { useQuery } from '@tanstack/react-query';

export default function CloudinaryDemo() {
  const [selectedTransform, setSelectedTransform] = useState('card-landscape');
  
  // Haal sample destinations op voor demo
  const { data: destinations } = useQuery({
    queryKey: ['/api/destinations/homepage'],
  });

  const sampleImages = [
    {
      name: 'Krakow Castle',
      originalUrl: 'https://res.cloudinary.com/df3i1avwb/image/upload/v1753801956/ontdek-polen/destinations/krakow-1753801956311.jpg',
      category: 'architecture'
    },
    {
      name: 'Tatra Mountains',
      originalUrl: 'https://res.cloudinary.com/df3i1avwb/image/upload/v1753802000/ontdek-polen/destinations/tatra-1753802000119.jpg',
      category: 'nature'
    },
    {
      name: 'Gdansk Harbor',
      originalUrl: 'https://res.cloudinary.com/df3i1avwb/image/upload/v1753801930/ontdek-polen/destinations/gdansk-1753801929969.jpg',
      category: 'architecture'
    }
  ];

  return (
    <div className="min-h-screen bg-luxury-gradient py-12 px-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-luxury-serif font-bold mb-6 text-navy-dark">
            🤖 Cloudinary AI Demo
          </h1>
          <p className="text-xl md:text-2xl text-navy-medium font-elegant-serif max-w-4xl mx-auto leading-relaxed">
            Ontdek hoe AI-gestuurde transformaties je images automatisch optimaliseren voor betere prestaties en visuele impact.
          </p>
        </div>

        {/* Transform Selector */}
        <div className="mb-12">
          <h2 className="text-2xl font-luxury-serif font-bold mb-6 text-navy-dark text-center">
            Kies een AI-transformatie:
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {CLOUDINARY_TRANSFORMS.map((transform) => (
              <Button
                key={transform.name}
                onClick={() => setSelectedTransform(transform.name)}
                variant={selectedTransform === transform.name ? "default" : "outline"}
                className={`p-4 text-center transition-all duration-300 ${
                  selectedTransform === transform.name 
                    ? "bg-navy-dark text-white border-gold" 
                    : "bg-white text-navy-dark border-navy-light hover:bg-navy-light hover:text-white"
                }`}
              >
                <div>
                  <div className="font-bold text-sm mb-1">{transform.name}</div>
                  <div className="text-xs opacity-80">{transform.useCase}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Current Transform Info */}
        <div className="mb-8">
          <Card className="p-6 bg-white/90 backdrop-blur-md border-gold/20">
            <h3 className="font-luxury-serif font-bold text-navy-dark text-xl mb-2">
              Huidige Transformatie: {selectedTransform}
            </h3>
            <p className="text-navy-medium mb-2">
              {CLOUDINARY_TRANSFORMS.find(t => t.name === selectedTransform)?.description}
            </p>
            <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
              {CLOUDINARY_TRANSFORMS.find(t => t.name === selectedTransform)?.transformation}
            </code>
          </Card>
        </div>

        {/* Image Comparisons */}
        <div className="space-y-12">
          {sampleImages.map((image, index) => {
            const currentTransform = CLOUDINARY_TRANSFORMS.find(t => t.name === selectedTransform);
            const optimizedUrl = generateCloudinaryUrl(image.originalUrl, currentTransform?.transformation || '');
            
            return (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-luxury-serif font-bold mb-6 text-navy-dark text-center">
                  {image.name}
                </h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Original Image */}
                  <div>
                    <h4 className="text-lg font-bold mb-4 text-center text-gray-600">
                      🔶 Origineel (Zonder AI)
                    </h4>
                    <Card className="overflow-hidden">
                      <img
                        src={image.originalUrl}
                        alt={`${image.name} - Original`}
                        className="w-full h-64 object-cover"
                      />
                    </Card>
                    <div className="mt-2 text-sm text-gray-600 text-center">
                      Basis Cloudinary URL
                    </div>
                  </div>

                  {/* AI Optimized Image */}
                  <div>
                    <h4 className="text-lg font-bold mb-4 text-center text-green-600">
                      🤖 AI-Geoptimaliseerd
                    </h4>
                    <Card className="overflow-hidden border-2 border-green-200">
                      <img
                        src={optimizedUrl}
                        alt={`${image.name} - AI Optimized`}
                        className="w-full h-64 object-cover"
                      />
                    </Card>
                    <div className="mt-2 text-sm text-green-600 text-center">
                      Smart cropping + AI optimalisatie
                    </div>
                  </div>
                </div>

                {/* Transform Details */}
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-bold mb-2">AI Verbeteringen:</h5>
                  <ul className="text-sm space-y-1">
                    <li>✅ <strong>Smart Cropping (g_auto)</strong> - AI kiest het beste focuspunt</li>
                    <li>✅ <strong>Automatische Kwaliteit (q_auto:good)</strong> - Optimale balans kwaliteit/bestandsgrootte</li>
                    <li>✅ <strong>Format Optimalisatie (f_auto)</strong> - WebP voor moderne browsers</li>
                    {image.category === 'architecture' && (
                      <li>✅ <strong>Sharpening</strong> - Verhoogt detail in architectuur</li>
                    )}
                    {image.category === 'nature' && (
                      <li>✅ <strong>Kleur Verbetering</strong> - Verzadiging en levendigheid voor natuur</li>
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="mt-16 bg-cream rounded-3xl p-12 shadow-2xl">
          <h2 className="text-3xl font-luxury-serif font-bold mb-8 text-navy-dark text-center">
            🚀 Voordelen van AI-Transformaties
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-bold text-navy-dark mb-2">Snellere Laadtijden</h3>
              <p className="text-navy-medium">Automatische compressie en optimale formaten reduceren bestandsgrootte tot 70%</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="font-bold text-navy-dark mb-2">Smart Cropping</h3>
              <p className="text-navy-medium">AI detecteert het belangrijkste deel van de afbeelding voor perfecte weergave</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="font-bold text-navy-dark mb-2">Wereldwijde CDN</h3>
              <p className="text-navy-medium">Snelle levering vanaf de dichtstbijzijnde server wereldwijd</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="font-bold text-navy-dark mb-2">Responsive Images</h3>
              <p className="text-navy-medium">Automatische aanpassing aan schermgrootte en apparaat capabilities</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="font-bold text-navy-dark mb-2">Zero Maintenance</h3>
              <p className="text-navy-medium">Geen handmatige optimalisatie meer - alles automatisch via URL parameters</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-bold text-navy-dark mb-2">Kostenbesparing</h3>
              <p className="text-navy-medium">Minder bandbreedte gebruik door intelligente optimalisatie</p>
            </div>
          </div>
        </div>

        {/* Implementation Info */}
        <div className="mt-12 bg-white rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-luxury-serif font-bold mb-6 text-navy-dark text-center">
            💻 Implementatie Status
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-green-600 mb-4">✅ Al Geïmplementeerd:</h3>
              <ul className="space-y-2 text-sm">
                <li>✅ Homepage destination cards met smart cropping</li>
                <li>✅ CTA sectie hero image optimalisatie</li>
                <li>✅ Activity thumbnails met AI cropping</li>
                <li>✅ Cloudinary utilities library</li>
                <li>✅ OptimizedImage component</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-blue-600 mb-4">🔄 Nog Te Implementeren:</h3>
              <ul className="space-y-2 text-sm">
                <li>🔄 Destination page headers</li>
                <li>🔄 Guide images optimalisatie</li>
                <li>🔄 Admin panel image previews</li>
                <li>🔄 Responsive image sets</li>
                <li>🔄 Ontdek Meer pagina images</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
          <Button
            onClick={() => window.history.back()}
            className="py-4 px-8 bg-navy-dark hover:bg-navy-medium text-white rounded-full font-luxury-serif text-lg"
          >
            ← Terug naar Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}