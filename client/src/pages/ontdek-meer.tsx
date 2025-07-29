import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import TravelSlider from "@/components/ui/travel-slider";

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

  // Fetch highlights from database
  const { data: highlights = [], isLoading: highlightsLoading } = useQuery({
    queryKey: ["/api/highlights"],
  });

  // Fetch site settings
  const { data: siteSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/site-settings"],
  });

  // Update document title and meta tags when site settings change - CHANGED FOR ONTDEK MEER
  useEffect(() => {
    // Changed title for Ontdek Meer page
    document.title = "Ontdek Meer - Ontdek Polen";
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', "Ontdek alle bestemmingen, reisgidsen en tips voor je reis naar Polen op één plek");
    
    if (siteSettings) {
      // Update meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', siteSettings.metaKeywords || "Polen, reizen, vakantie, bestemmingen");
      
      // Update favicon - handle enabled/disabled state
      const existingFavicon = document.querySelector('link[rel="icon"]');
      
      if (siteSettings.faviconEnabled === true && siteSettings.favicon) {
        // Favicon enabled and has path - use server route which checks database
        if (existingFavicon) {
          existingFavicon.setAttribute('href', '/favicon.ico?' + Date.now()); // Cache bust
        } else {
          const newFavicon = document.createElement('link');
          newFavicon.setAttribute('rel', 'icon');
          newFavicon.setAttribute('href', '/favicon.ico?' + Date.now()); // Cache bust
          document.head.appendChild(newFavicon);
        }
      } else {
        // Favicon disabled - remove any existing favicon
        if (existingFavicon) {
          existingFavicon.remove();
        }
        // Force browser to not show any favicon by using empty data URL
        const emptyFavicon = document.createElement('link');
        emptyFavicon.setAttribute('rel', 'icon');
        emptyFavicon.setAttribute('href', 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=');
        document.head.appendChild(emptyFavicon);
      }
      
      // Add custom CSS
      if (siteSettings.customCSS) {
        let customStyle = document.querySelector('#custom-site-css');
        if (!customStyle) {
          customStyle = document.createElement('style');
          customStyle.id = 'custom-site-css';
          document.head.appendChild(customStyle);
        }
        customStyle.textContent = siteSettings.customCSS;
      }
      
      // Add custom JavaScript
      if (siteSettings.customJS) {
        let customScript = document.querySelector('#custom-site-js');
        if (!customScript) {
          customScript = document.createElement('script');
          customScript.id = 'custom-site-js';
          document.head.appendChild(customScript);
        }
        customScript.textContent = siteSettings.customJS;
      }
      
      // Add Google Analytics
      if (siteSettings.googleAnalyticsId) {
        let gaScript = document.querySelector('#google-analytics');
        if (!gaScript) {
          gaScript = document.createElement('script');
          gaScript.id = 'google-analytics';
          gaScript.async = true;
          gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${siteSettings.googleAnalyticsId}`;
          document.head.appendChild(gaScript);
          
          const gaConfig = document.createElement('script');
          gaConfig.textContent = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${siteSettings.googleAnalyticsId}');
          `;
          document.head.appendChild(gaConfig);
        }
      }
    }
  }, [siteSettings]);

  // Filter only published destinations
  const publishedDestinations = destinations.filter((destination: any) => destination.published);
  
  // Filter only published guides
  const publishedGuides = guides.filter((guide: any) => guide.published);
  
  // Filter only published pages
  const publishedPages = pages.filter((page: any) => page.published);
  
  // Show loading state
  if (destinationsLoading || guidesLoading || pagesLoading || highlightsLoading || settingsLoading) {
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

  const handlePlanTrip = () => {
    console.log("Planning trip...");
    // TODO: Implement trip planning logic
  };

  const handleReadGuides = () => {
    console.log("Reading guides...");
    // TODO: Implement guide reading functionality
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Modern Hero Section */}
      <header 
        className="relative bg-cover bg-center text-white py-32 px-5 text-center min-h-[80vh] flex items-center justify-center"
        style={{
          backgroundImage: siteSettings?.backgroundImage 
            ? `url('${siteSettings.backgroundImage}')` 
            : "url('/images/backgrounds/header.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {/* CMS Controlled Overlay System */}
        {siteSettings?.headerOverlayEnabled && (
          <div 
            className="absolute inset-0 bg-black" 
            style={{ opacity: (siteSettings?.headerOverlayOpacity || 30) / 100 }}
          ></div>
        )}
        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 font-inter tracking-tight leading-tight">
            Ontdek Meer
          </h1>
          <p className="text-xl md:text-2xl mb-12 font-inter font-light leading-relaxed max-w-3xl mx-auto">
            Alle bestemmingen, reisgidsen en tips voor je reis naar Polen
          </p>
          
          <form onSubmit={handleSearch} className="mt-5 mb-5">
            <div className="relative inline-block">
              <Input
                type="text"
                placeholder="Zoek bestemming"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-4 px-6 w-96 max-w-full border-none rounded-2xl text-lg text-gray-900 font-inter shadow-xl backdrop-blur-sm bg-white/90 hover:bg-white transition-all duration-300"
              />
              <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
            </div>
          </form>
          
          <Link href="/">
            <Button
              className="mt-8 py-4 px-8 text-lg font-inter transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 rounded-2xl"
              style={{ backgroundColor: "#2f3e46" }}
            >
              🏠 Terug naar Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Modern Destination Grid */}
      <section className="py-16 px-5 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-inter text-gray-900">
            Alle Bestemmingen
          </h2>
          <p className="text-xl text-gray-600">
            Ontdek alle prachtige plekken die Polen te bieden heeft
          </p>
        </div>
        <TravelSlider
          visibleItems={{ mobile: 1, tablet: 2, desktop: 4 }}
          showNavigation={true}
          className="mx-auto"
        >
          {publishedDestinations.map((destination: any) => {
            const CardContent = (
              <Card 
                className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 border-none cursor-pointer group"
              >
                <img
                  src={destination.image}
                  alt={destination.alt}
                  className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="p-6 font-bold font-inter text-gray-900 text-lg">
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
        </TravelSlider>
      </section>

      {/* Modern Highlights Section */}
      {highlights.length > 0 && (
        <section className="py-16 px-5 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-inter text-gray-900">
              Hoogtepunten van Polen
            </h2>
            <p className="text-xl text-gray-600">
              De beste bezienswaardigheden en ervaringen
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {highlights.map((highlight) => (
              <div key={highlight.id} className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 border-none cursor-pointer text-center group">
                <img
                  src={highlight.iconPath}
                  alt={highlight.name}
                  className="w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = '/images/highlights/placeholder.svg';
                  }}
                />
                <h3 className="font-bold font-inter text-gray-900 text-base mb-2">
                  {highlight.name}
                </h3>
                {highlight.category !== 'general' && (
                  <p className="text-sm text-gray-500 capitalize">
                    {highlight.category}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section - EXACT SAME AS HOMEPAGE */}
      <section className="py-16 px-5 max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-8 items-center justify-between">
          <div className="flex-1 min-w-80">
            <h2 className="text-3xl font-bold mb-4 font-inter text-gray-900">
              Laat je verrassen door het onbekende Polen
            </h2>
            <p className="text-lg mb-6 font-inter text-gray-700">
              Bezoek historische steden, ontdek natuurparken en verborgen parels. 
              Onze reizen helpen je op weg!
            </p>
            <Button
              onClick={handleReadGuides}
              className="py-3 px-6 text-base font-inter hover:opacity-90 transition-all duration-200"
              style={{ backgroundColor: "#2f3e46" }}
            >
              Lees onze reizen
            </Button>
          </div>
          <div className="flex-1 min-w-80">
            <img
              src="/images/tatra-vallei.jpg"
              alt="Tatra Valley"
              className="w-full rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Published Pages - EXACT SAME AS HOMEPAGE */}
      {publishedPages.length > 0 && (
        <section className="py-16 px-5 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-inter text-gray-900">
              Ontdek Meer
            </h2>
            <Link href="/ontdek-meer">
              <Button
                variant="outline"
                className="text-gray-900 border-gray-300 hover:bg-gray-100"
              >
                Bekijk Alles
              </Button>
            </Link>
          </div>
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

      {/* Travel Guides - EXACT SAME AS HOMEPAGE */}
      <section className="py-16 px-5 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 font-inter text-gray-900">
          Reizen en Tips
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

      {/* Enhanced Modern Call-to-Action */}
      <section className="py-20 px-5 bg-gradient-to-br from-slate-100 via-white to-blue-100">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-inter text-gray-900 tracking-tight">
            Klaar voor je Polen avontuur?
          </h2>
          <p className="text-xl text-gray-600 mb-12 font-inter max-w-3xl mx-auto leading-relaxed">
            Plan je perfecte reis met onze uitgebreide gidsen en tips voor alle bestemmingen in Polen
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              asChild
              className="py-4 px-8 text-lg font-inter transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 rounded-2xl"
              style={{ backgroundColor: "#2f3e46" }}
            >
              <Link href="/">🗺️ Plan je reis</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="py-4 px-8 text-lg font-inter transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 rounded-2xl border-2 border-gray-300 hover:bg-white"
            >
              <Link href="/">✨ Bekijk hoogtepunten</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer 
        className="text-center py-12 px-5 text-white relative"
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
        
        <p className="font-inter text-lg">
          &copy; 2025 {siteSettings?.siteName || "Ontdek Polen"}. Alle rechten voorbehouden.
        </p>
      </footer>
    </div>
  );
}