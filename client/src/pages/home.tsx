import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
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

  // Fetch search configuration for homepage context
  const { data: searchConfig } = useQuery({
    queryKey: ["/api/search-config/homepage"],
  });

  // Update document title and meta tags when site settings change
  useEffect(() => {
    if (siteSettings) {
      document.title = siteSettings.siteName || "Ontdek Polen";
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', siteSettings.siteDescription || "Ontdek de mooiste plekken van Polen");
      
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setShowSearchResults(true);
    
    try {
      const searchScope = searchConfig?.searchScope || 'destinations';
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&scope=${searchScope}`);
      const data = await response.json();
      
      setSearchResults(data.results || []);
      
      // If search config has redirect pattern and only one result, redirect immediately
      if (searchConfig?.redirectPattern && data.results?.length === 1) {
        const result = data.results[0];
        let redirectUrl = searchConfig.redirectPattern;
        
        // Replace placeholders in redirect pattern
        redirectUrl = redirectUrl.replace('{slug}', result.slug || result.name?.toLowerCase().replace(/\s+/g, '-'));
        redirectUrl = redirectUrl.replace('{query}', encodeURIComponent(searchQuery));
        
        window.location.href = redirectUrl;
        return;
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
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
    <div className="min-h-screen" style={{ backgroundColor: "#f8f6f1" }}>
      {/* Hero Section */}
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
            {siteSettings?.siteName || "Ontdek Polen"}
          </h1>
          <p className="text-xl mb-8 font-inter">
            {siteSettings?.siteDescription || "Mooie plekken in Polen ontdekken"}
          </p>
          
          <form onSubmit={handleSearch} className="mt-5 mb-5">
            <div className="relative inline-block">
              <Input
                type="text"
                placeholder={searchConfig?.placeholderText || "Zoek bestemming"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-3 px-5 w-80 max-w-full border-none rounded-lg text-base text-gray-900 font-inter"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            </div>
          </form>
          
          {/* Search Results */}
          {showSearchResults && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-4 max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Zoekresultaten{searchQuery && ` voor "${searchQuery}"`}
                </h3>
                <button 
                  onClick={() => setShowSearchResults(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              {isSearching ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Zoeken...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((result: any) => (
                    <Link key={result.id} href={result.link || `/${result.slug}`}>
                      <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200">
                        <div className="flex items-center space-x-3">
                          {result.image && (
                            <img 
                              src={result.image} 
                              alt={result.alt || result.name} 
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{result.name || result.title}</h4>
                            <p className="text-sm text-gray-600">{result.description}</p>
                            <span className="text-xs text-blue-600 capitalize">{result.type}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">
                  Geen resultaten gevonden voor "{searchQuery}"
                </p>
              )}
            </div>
          )}
          
          <Button
            onClick={handlePlanTrip}
            className="mt-4 py-3 px-6 text-base font-inter hover:opacity-90 transition-all duration-200"
            style={{ backgroundColor: "#2f3e46" }}
          >
            Plan je reis
          </Button>
        </div>
      </header>

      {/* Destinations Section */}
      <section className="py-16 px-5 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 font-inter text-gray-900">
          Bestemmingen
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

      {/* Highlights Section - From Database */}
      {highlights.length > 0 && (
        <section className="py-16 px-5 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 font-inter text-gray-900">
            Hoogtepunten van Polen
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {highlights.map((highlight) => (
              <div key={highlight.id} className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 border-none cursor-pointer text-center">
                <img
                  src={highlight.iconPath}
                  alt={highlight.name}
                  className="w-16 h-16 mx-auto mb-3"
                  onError={(e) => {
                    e.currentTarget.src = '/images/highlights/placeholder.svg';
                  }}
                />
                <h3 className="font-bold font-inter text-gray-900 text-sm">
                  {highlight.name}
                </h3>
                {highlight.category !== 'general' && (
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    {highlight.category}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
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
            <Button
              onClick={handleReadGuides}
              className="py-3 px-6 text-base font-inter hover:opacity-90 transition-all duration-200"
              style={{ backgroundColor: "#2f3e46" }}
            >
              Lees onze gidsen
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

      {/* Published Pages */}
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

      {/* Travel Guides */}
      <section className="py-16 px-5 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 font-inter text-gray-900">
          Reisgidsen en Tips
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

      {/* Footer */}
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
