import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function OntdekMeer() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch destinations and guides from API (homepage specific)
  const { data: destinations = [], isLoading: destinationsLoading } = useQuery({
    queryKey: ["/api/destinations/homepage"],
  });
  
  const { data: guides = [], isLoading: guidesLoading } = useQuery({
    queryKey: ["/api/guides/homepage"],
  });

  const { data: pages = [], isLoading: pagesLoading } = useQuery({
    queryKey: ["/api/pages"],
  });

  // Fetch site settings
  const { data: siteSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/site-settings"],
  });

  // Update document title and meta tags
  useEffect(() => {
    document.title = "Ontdek Meer - Ontdek Polen";
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', "Ontdek alle bestemmingen, reisgidsen en tips voor je reis naar Polen op één plek");
    
    // Force refresh to ensure all changes are visible
    console.log("Ontdek Meer pagina geladen met alle highlights");
  }, []);

  // Filter only published destinations
  const publishedDestinations = destinations.filter((destination: any) => destination.published);
  
  // Filter only published guides
  const publishedGuides = guides.filter((guide: any) => guide.published);
  
  // Filter only published pages (exclude current page)
  const publishedPages = pages.filter((page: any) => page.published && page.slug !== 'ontdek-meer');
  
  // Show loading state
  if (destinationsLoading || guidesLoading || pagesLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8f6f1" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Laden...</p>
        </div>
      </div>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // TODO: Implement search functionality
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f6f1" }}>
      {/* Hero Section - Same as homepage */}
      <header 
        className="relative bg-cover bg-center text-white py-24 px-5 text-center"
        style={{
          backgroundImage: siteSettings?.backgroundImage 
            ? `url('${siteSettings.backgroundImage}')` 
            : "url('/images/header.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {siteSettings?.headerOverlayEnabled && (
          <div 
            className="absolute inset-0 bg-black" 
            style={{ opacity: (siteSettings?.headerOverlayOpacity || 30) / 100 }}
          ></div>
        )}
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-3 font-inter">
            Ontdek Meer
          </h1>
          <p className="text-xl mb-8 font-inter">
            Alle bestemmingen, reisgidsen en tips voor je reis naar Polen
          </p>
          
          <form onSubmit={handleSearch} className="mt-5 mb-5">
            <div className="relative inline-block">
              <Input
                type="text"
                placeholder="Zoek bestemming"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-3 px-5 w-80 max-w-full border-none rounded-lg text-base text-gray-900 font-inter"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            </div>
          </form>
          
          <Link href="/">
            <Button
              className="mt-2 py-3 px-6 text-base font-inter hover:opacity-90 transition-all duration-200"
              style={{ backgroundColor: "#2f3e46" }}
            >
              Terug naar Home
            </Button>
          </Link>
        </div>
      </header>

      {/* CTA Section - Same as homepage */}
      <section className="py-16 px-5 max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-8 items-center justify-between">
          <div className="flex-1 min-w-80">
            <h2 className="text-3xl font-bold mb-4 font-inter text-gray-900">
              Laat je verrassen door het onbekende Polen
            </h2>
            <p className="text-lg mb-6 font-inter text-gray-700">
              Bezoek historische steden, ontdek natuurparken en verborgen parels. 
              Onze reisgidsen helpen je op weg!
            </p>
            <Link href="/3-dagen-in-krakau">
              <Button
                className="py-3 px-6 text-base font-inter hover:opacity-90 transition-all duration-200"
                style={{ backgroundColor: "#2f3e46" }}
              >
                Lees onze gidsen
              </Button>
            </Link>
          </div>
          <div className="flex-1 min-w-80">
            <img
              src="/images/guides/tatra-vallei.jpg"
              alt="Tatra Valley"
              className="w-full rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 px-5 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 font-inter text-gray-900">
          Populaire Bezienswaardigheden
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Krakow Highlights */}
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <img src="/images/highlights/wawel-castle.svg" alt="Wawel Castle" className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-sm font-inter text-gray-900">Wawel Kasteel</h3>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <img src="/images/highlights/krakow-market.svg" alt="Krakow Market" className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-sm font-inter text-gray-900">Marktplein</h3>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <img src="/images/highlights/st-marys.svg" alt="St Mary's Basilica" className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-sm font-inter text-gray-900">St. Mary's</h3>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <img src="/images/highlights/kazimierz.svg" alt="Kazimierz District" className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-sm font-inter text-gray-900">Kazimierz</h3>
          </div>
          
          {/* Tatra Mountains Highlights */}
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <img src="/images/highlights/morskie-oko.svg" alt="Morskie Oko Lake" className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-sm font-inter text-gray-900">Morskie Oko</h3>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <img src="/images/highlights/zakopane.svg" alt="Zakopane" className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-sm font-inter text-gray-900">Zakopane</h3>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <img src="/images/highlights/gubalowka.svg" alt="Gubalowka Hill" className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-sm font-inter text-gray-900">Gubalówka</h3>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <img src="/images/highlights/rysy-peak.svg" alt="Rysy Peak" className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-sm font-inter text-gray-900">Rysy Peak</h3>
          </div>

          {/* Gdansk Highlights */}
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <img src="/images/highlights/gdansk-market.svg" alt="Gdansk Long Market" className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-sm font-inter text-gray-900">Długi Targ</h3>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <img src="/images/highlights/artus-court.svg" alt="Artus Court" className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-sm font-inter text-gray-900">Artus Court</h3>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <img src="/images/highlights/gdansk-church.svg" alt="St Mary's Church Gdansk" className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-sm font-inter text-gray-900">St. Mary's</h3>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <img src="/images/highlights/amber-museum.svg" alt="Amber Museum" className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-sm font-inter text-gray-900">Amber Museum</h3>
          </div>

          {/* Bialowieza Highlights */}
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <img src="/images/highlights/europese-wisent.svg" alt="European Bison" className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-sm font-inter text-gray-900">Europese Bizon</h3>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <img src="/images/highlights/forest-paths.svg" alt="Forest Paths" className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-sm font-inter text-gray-900">Bospaden</h3>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <img src="/images/highlights/bird-watching.svg" alt="Bird Watching" className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-sm font-inter text-gray-900">Vogel Spotten</h3>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <img src="/images/highlights/nature-museum.svg" alt="Nature Museum" className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-sm font-inter text-gray-900">Natuurmuseum</h3>
          </div>

          {/* Warsaw Highlights */}
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <img src="/images/highlights/warsaw-oldtown.svg" alt="Warsaw Old Town" className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-sm font-inter text-gray-900">Oude Stad</h3>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <img src="/images/highlights/warsaw-castle.svg" alt="Royal Castle Warsaw" className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-sm font-inter text-gray-900">Koninklijk Kasteel</h3>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <img src="/images/highlights/lazienki.svg" alt="Lazienki Park" className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-sm font-inter text-gray-900">Lazienki Park</h3>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <img src="/images/highlights/wilanow.svg" alt="Wilanow Palace" className="w-12 h-12 mx-auto mb-3" />
            <h3 className="font-bold text-sm font-inter text-gray-900">Wilanów Paleis</h3>
          </div>
        </div>
      </section>

      {/* All Destinations Section */}
      <section className="py-16 px-5 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 font-inter text-gray-900">
          Alle Bestemmingen
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {publishedDestinations.map((destination) => {
            const CardContent = (
              <Card 
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-none cursor-pointer"
              >
                <img
                  src={destination.image}
                  alt={destination.alt}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4 font-bold font-inter text-gray-900">
                  {destination.name}
                </div>
              </Card>
            );

            // If destination has a link, wrap in Link component or external link
            if (destination.link) {
              // Check if it's an external link (starts with http)
              if (destination.link.startsWith('http')) {
                return (
                  <a
                    key={destination.id}
                    href={destination.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {CardContent}
                  </a>
                );
              } else {
                // Internal link
                return (
                  <Link key={destination.id} href={destination.link}>
                    {CardContent}
                  </Link>
                );
              }
            }

            // No link, just return the card
            return <div key={destination.id}>{CardContent}</div>;
          })}
        </div>
      </section>

      {/* All Travel Guides */}
      <section className="py-16 px-5 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 font-inter text-gray-900">
          Alle Reisgidsen en Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {publishedGuides.map((guide) => {
            const CardContent = (
              <Card 
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-none cursor-pointer"
              >
                <img
                  src={guide.image}
                  alt={guide.alt}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4 font-bold font-inter text-gray-900">
                  {guide.title}
                </div>
              </Card>
            );

            // If guide has a link, wrap in Link component or external link
            if (guide.link) {
              // Check if it's an external link (starts with http)
              if (guide.link.startsWith('http')) {
                return (
                  <a
                    key={guide.id}
                    href={guide.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {CardContent}
                  </a>
                );
              } else {
                // Internal link
                return (
                  <Link key={guide.id} href={guide.link}>
                    {CardContent}
                  </Link>
                );
              }
            }

            // No link, just return the card
            return <div key={guide.id}>{CardContent}</div>;
          })}
        </div>
      </section>

      {/* All Pages */}
      {publishedPages.length > 0 && (
        <section className="py-16 px-5 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 font-inter text-gray-900">
            Alle Pagina's
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {publishedPages.map((page) => (
              <Link href={`/${page.slug}`} key={page.id}>
                <Card className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-none cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold font-inter text-gray-900">
                        {page.title}
                      </h3>
                      {page.featured && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Uitgelicht
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 font-inter">
                      {page.metaDescription}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {page.template}
                      </span>
                      <span className="ml-2">
                        {new Date(page.createdAt).toLocaleDateString('nl-NL')}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer - Same as homepage */}
      <footer 
        className="text-center py-10 px-5 text-white relative"
        style={{ backgroundColor: "#2f3e46" }}
      >
        {/* Admin Link */}
        <Link href="/admin">
          <Button 
            variant="outline" 
            size="sm"
            className="absolute top-4 right-4 text-white border-white hover:bg-white hover:text-gray-900"
          >
            <Settings className="h-4 w-4 mr-2" />
            Admin
          </Button>
        </Link>
        
        <p className="font-inter">
          &copy; 2025 {siteSettings?.siteName || "Ontdek Polen"}. Alle rechten voorbehouden.
        </p>
      </footer>
    </div>
  );
}