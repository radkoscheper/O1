import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import TravelSlider from "@/components/ui/travel-slider";

export default function ModernHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Fetch data
  const { data: destinations = [] } = useQuery({
    queryKey: ["/api/destinations/homepage"],
  });
  
  const { data: guides = [] } = useQuery({
    queryKey: ["/api/guides/homepage"],
  });

  const { data: siteSettings } = useQuery({
    queryKey: ["/api/site-settings"],
  });

  const { data: motivation } = useQuery({
    queryKey: ["/api/motivation"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Modern Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background with overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/backgrounds/header.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            {siteSettings?.siteName || "Ontdek Polen"}
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light leading-relaxed">
            {motivation?.title || "Laat je verrassen door het mooie Polen"}
          </p>
          
          {/* Modern Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Zoek bestemmingen, activiteiten, gidsen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg rounded-full bg-white/90 backdrop-blur border-0 shadow-xl"
              />
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full px-6"
                onClick={() => setShowSearchResults(true)}
              >
                Zoeken
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
              <MapPin className="w-8 h-8 text-white mb-2 mx-auto" />
              <div className="text-2xl font-bold">{destinations.length}+</div>
              <div className="text-sm opacity-90">Bestemmingen</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
              <Calendar className="w-8 h-8 text-white mb-2 mx-auto" />
              <div className="text-2xl font-bold">{guides.length}+</div>
              <div className="text-sm opacity-90">Reisgidsen</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
              <Users className="w-8 h-8 text-white mb-2 mx-auto" />
              <div className="text-2xl font-bold">10K+</div>
              <div className="text-sm opacity-90">Reizigers</div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Modern Destinations Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Populaire Bestemmingen
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ontdek de meest geliefde plekken in Polen
            </p>
          </div>
          
          {/* Modern Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.slice(0, 6).map((destination: any) => (
              <Link key={destination.id} href={`/${destination.slug}`}>
                <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white rounded-3xl border-0">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={destination.headerImage || `/images/destinations/${destination.slug}.jpg`}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold mb-1">{destination.name}</h3>
                      <p className="text-sm opacity-90">{destination.location}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {destination.description?.substring(0, 120)}...
                    </p>
                    <Button variant="ghost" className="mt-4 text-blue-600 hover:text-blue-700 p-0">
                      Ontdek meer →
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/ontdek-meer">
              <Button size="lg" className="rounded-full px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Alle Bestemmingen Bekijken
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Travel Guides Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Expertgidsen
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professioneel samengestelde reisgidsen voor de perfecte ervaring
            </p>
          </div>
          
          <TravelSlider
            items={guides.map((guide: any) => (
              <Link key={guide.id} href={`/page/${guide.slug}`}>
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 bg-white rounded-2xl border-0 h-full">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={guide.imageUrl || `/images/guides/default-guide.jpg`}
                      alt={guide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                        📖 Gids
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {guide.description?.substring(0, 100)}...
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {guide.category || "Reisgids"}
                      </span>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        Lees meer →
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
            itemsPerView={{
              mobile: 1,
              tablet: 2,
              desktop: 3
            }}
          />
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">Klaar voor je Polen avontuur?</h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Begin vandaag nog met het plannen van je onvergetelijke reis door Polen
          </p>
          <Button size="lg" className="rounded-full px-8 py-4 text-lg bg-white text-gray-900 hover:bg-gray-100">
            Start je reis
          </Button>
        </div>
      </footer>
    </div>
  );
}