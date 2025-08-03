import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Star, Users, Camera, ExternalLink, Heart, Share2 } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface Highlight {
  id: number;
  title: string;
  location: string;
  category: string;
  description: string;
  image: string;
  duration?: string;
  rating?: number;
  visitors?: string;
  bestTime?: string;
  difficulty?: 'Makkelijk' | 'Gemiddeld' | 'Moeilijk';
  price?: string;
  tags?: string[];
  features?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface HighlightsDialogsProps {
  highlights: Highlight[];
  title?: string;
  subtitle?: string;
  className?: string;
  maxDisplay?: number;
  showViewAll?: boolean;
}

export function HighlightsDialogs({ 
  highlights, 
  title = "Highlights",
  subtitle = "Ontdek de beste ervaringen",
  className = "",
  maxDisplay = 6,
  showViewAll = true
}: HighlightsDialogsProps) {
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [showAll, setShowAll] = useState(false);

  const displayedHighlights = showAll ? highlights : highlights.slice(0, maxDisplay);

  const HighlightCard = ({ highlight }: { highlight: Highlight }) => (
    <div className="group cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="relative aspect-[4/3] overflow-hidden">
        <OptimizedImage
          src={highlight.image}
          alt={highlight.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-gray-900 backdrop-blur-sm">
            {highlight.category}
          </Badge>
        </div>

        {/* Rating Badge */}
        {highlight.rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-full text-sm">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{highlight.rating}</span>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
            <Heart className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {highlight.title}
          </h3>
          {highlight.price && (
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {highlight.price}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-3">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{highlight.location}</span>
        </div>

        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {highlight.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            {highlight.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{highlight.duration}</span>
              </div>
            )}
            {highlight.visitors && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{highlight.visitors}</span>
              </div>
            )}
          </div>

          {highlight.difficulty && (
            <Badge 
              variant={
                highlight.difficulty === 'Makkelijk' ? 'default' :
                highlight.difficulty === 'Gemiddeld' ? 'secondary' : 'destructive'
              }
              className="text-xs"
            >
              {highlight.difficulty}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  const HighlightDialog = ({ highlight }: { highlight: Highlight }) => (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">{highlight.title}</DialogTitle>
      </DialogHeader>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <OptimizedImage
              src={highlight.image}
              alt={highlight.title}
              className="w-full h-full object-cover"
            />
            
            {highlight.rating && (
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/70 text-white px-3 py-1 rounded-full">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{highlight.rating}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {highlight.tags && highlight.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {highlight.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          {/* Location & Category */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">{highlight.location}</span>
            </div>
            <Badge variant="secondary" className="w-fit">
              {highlight.category}
            </Badge>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold mb-2">Beschrijving</h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {highlight.description}
            </p>
          </div>

          {/* Key Information Grid */}
          <div className="grid grid-cols-2 gap-4">
            {highlight.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="text-xs text-gray-500">Duur</div>
                  <div className="font-medium">{highlight.duration}</div>
                </div>
              </div>
            )}

            {highlight.visitors && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                <div>
                  <div className="text-xs text-gray-500">Bezoekers</div>
                  <div className="font-medium">{highlight.visitors}</div>
                </div>
              </div>
            )}

            {highlight.bestTime && (
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-500" />
                <div>
                  <div className="text-xs text-gray-500">Beste tijd</div>
                  <div className="font-medium">{highlight.bestTime}</div>
                </div>
              </div>
            )}

            {highlight.price && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">€</span>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Prijs</div>
                  <div className="font-medium text-green-600">{highlight.price}</div>
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          {highlight.features && highlight.features.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Kenmerken</h4>
              <ul className="space-y-2">
                {highlight.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button className="flex-1" size="lg">
              <ExternalLink className="w-4 h-4 mr-2" />
              Meer informatie
            </Button>
            <Button variant="outline" size="lg">
              <Heart className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedHighlights.map((highlight) => (
          <Dialog key={highlight.id}>
            <DialogTrigger asChild>
              <div onClick={() => setSelectedHighlight(highlight)}>
                <HighlightCard highlight={highlight} />
              </div>
            </DialogTrigger>
            {selectedHighlight && <HighlightDialog highlight={selectedHighlight} />}
          </Dialog>
        ))}
      </div>

      {/* View All Button */}
      {showViewAll && highlights.length > maxDisplay && !showAll && (
        <div className="text-center pt-6">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => setShowAll(true)}
          >
            Bekijk alle {highlights.length} highlights
          </Button>
        </div>
      )}

      {/* Show Less Button */}
      {showAll && showViewAll && highlights.length > maxDisplay && (
        <div className="text-center pt-6">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => setShowAll(false)}
          >
            Toon minder
          </Button>
        </div>
      )}
    </div>
  );
}

// Mock data for demonstration
export const mockHighlights: Highlight[] = [
  {
    id: 1,
    title: "Wawel Castle",
    location: "Krakow",
    category: "Historisch",
    description: "Een prachtig kasteel dat de geschiedenis van Polen vertelt. Het Wawel-kasteel staat majesteitelijk op een heuvel boven de Wisła en biedt een adembenemend uitzicht over de stad.",
    image: "/images/destinations/krakow-1.jpg",
    duration: "2-3 uur",
    rating: 4.8,
    visitors: "500K+",
    bestTime: "Ochtend",
    difficulty: "Makkelijk",
    price: "€15",
    tags: ["Kasteel", "Geschiedenis", "Architectuur", "Uitzicht"],
    features: [
      "Koninklijke kamers met originele meubels",
      "Kathedraal met koninklijke graven",
      "Schatkarier met kroonjuwelen",
      "Prachtige binnentuinen",
      "Panoramisch uitzicht over Krakow"
    ],
    coordinates: { lat: 50.0544, lng: 19.9355 }
  },
  {
    id: 2,
    title: "Tatra National Park",
    location: "Zakopane",
    category: "Natuur",
    description: "Het hoogste gebergte van Polen met spectaculaire berglandschappen, kristalheldere meren en uitdagende wandelpaden voor alle niveaus.",
    image: "/images/destinations/zakopane-1.jpg",
    duration: "Hele dag",
    rating: 4.9,
    visitors: "1M+",
    bestTime: "Zomer",
    difficulty: "Gemiddeld",
    price: "Gratis",
    tags: ["Bergen", "Wandelen", "Natuur", "Fotografie"],
    features: [
      "Hoogste piek van Polen (Rysy, 2499m)",
      "Morskie Oko - het beroemdste bergmeer",
      "Gemarkeerde wandelpaden",
      "Berghutten voor overnachting",
      "Unieke flora en fauna"
    ],
    coordinates: { lat: 49.2319, lng: 19.9814 }
  },
  {
    id: 3,
    title: "Gdansk Old Town",
    location: "Gdansk",
    category: "Architectuur",
    description: "Een prachtig gereconstrueerde historische binnenstad met kleurrijke gevels, gotische kerken en een rijke Hanze geschiedenis.",
    image: "/images/destinations/gdansk-1.jpg",
    duration: "3-4 uur",
    rating: 4.7,
    visitors: "800K+",
    bestTime: "Voorjaar",
    difficulty: "Makkelijk",
    price: "Gratis",
    tags: ["Historisch", "Architectuur", "Wandelen", "Cultuur"],
    features: [
      "Lange Markt met historische gevels",
      "St. Mary's Basiliek - grootste bakstenen kerk",
      "Neptunusfontein",
      "Artushof museum",
      "Amber Street voor souvenirs"
    ],
    coordinates: { lat: 54.3520, lng: 18.6466 }
  },
  {
    id: 4,
    title: "Bialowieza Forest",
    location: "Bialowieza",
    category: "Natuur",
    description: "Het laatste oerbos van Europa met wilde bizons, eeuwenoude bomen en een uniek ecosysteem dat duizenden jaren oud is.",
    image: "/images/destinations/bialowieza-1.jpg",
    duration: "5-6 uur",
    rating: 4.6,
    visitors: "200K+",
    bestTime: "Herfst",
    difficulty: "Gemiddeld",
    price: "€25",
    tags: ["Oerbos", "Wildlife", "Bizons", "UNESCO"],
    features: [
      "Europese bizons in hun natuurlijke habitat",
      "Geleide tours door het strikte reservaat",
      "600-jarige eikenbomen",
      "UNESCO Werelderfgoed",
      "Unieke flora en fauna"
    ],
    coordinates: { lat: 52.7011, lng: 23.8642 }
  },
  {
    id: 5,
    title: "Malbork Castle",
    location: "Malbork",
    category: "Historisch",
    description: "Het grootste kasteel ter wereld van bakstenen, gebouwd door de Duitse Ridders. Een indrukwekkend voorbeeld van middeleeuws vakmanschap.",
    image: "/images/destinations/malbork-1.jpg",
    duration: "4-5 uur",
    rating: 4.5,
    visitors: "300K+",
    bestTime: "Lente",
    difficulty: "Makkelijk",
    price: "€20",
    tags: ["Kasteel", "Middeleeuws", "UNESCO", "Architectuur"],
    features: [
      "Grootste bakstenen kasteel ter wereld",
      "Middeleeuws museum",
      "Spectaculaire ridderzaal",
      "Defensieve muren en torens",
      "Audio-gids in het Nederlands"
    ],
    coordinates: { lat: 54.0396, lng: 19.0268 }
  },
  {
    id: 6,
    title: "Wieliczka Salt Mine",
    location: "Wieliczka",
    category: "Ondergronds",
    description: "Een ondergrondse wonderwereld van zoutsculturen, kapellen en meren diep onder de grond. Een unieke ervaring in de zoutmijnen.",
    image: "/images/destinations/wieliczka-1.jpg",
    duration: "3 uur",
    rating: 4.8,
    visitors: "1.2M+",
    bestTime: "Het hele jaar",
    difficulty: "Gemiddeld",
    price: "€30",
    tags: ["Ondergronds", "Zout", "UNESCO", "Uniek"],
    features: [
      "St. Kinga kapel volledig uit zout gehouwen",
      "Ondergrondse meren",
      "Zoutsculturen en reliëfs",
      "700 jaar mijnbouwgeschiedenis",
      "Geneeskrachtige eigenschappen"
    ],
    coordinates: { lat: 49.9869, lng: 20.0562 }
  }
];