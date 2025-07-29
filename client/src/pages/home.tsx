import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Settings, MapPin, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import TravelSlider from "@/components/ui/travel-slider";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Close search handler that preserves ability to re-search
  const closeSearch = () => {
    console.log('Closing search overlay');
    setShowSearchResults(false);
    setIsSearching(false);
    // Keep searchQuery and searchResults so user can re-open same search
  };

  // Helper function to get type-specific styling for search results
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'destination':
        return 'bg-green-100 text-green-700';
      case 'activity':
        return 'bg-orange-100 text-orange-700';
      case 'highlight':
        return 'bg-yellow-100 text-yellow-700';
      case 'guide':
        return 'bg-blue-100 text-blue-700';
      case 'page':
        return 'bg-purple-100 text-purple-700';
      case 'template':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  // Helper function to get user-friendly type labels
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'destination':
        return '🏔️ Bestemmingen';
      case 'activity':
        return '🎯 Activiteiten';
      case 'highlight':
        return '✨ Hoogtepunten';
      case 'guide':
        return '📖 Reizen';
      case 'page':
        return '📄 Pagina';
      case 'template':
        return '🎨 Template';
      default:
        return type;
    }
  };
  
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

  // Fetch featured activities from database (replaces old highlights)
  const { data: featuredActivities = [], isLoading: featuredLoading } = useQuery({
    queryKey: ["/api/admin/activities"],
    queryFn: async () => {
      const response = await fetch('/api/admin/activities');
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      const activities = await response.json();
      // Filter for featured and published activities only
      return activities.filter(activity => activity.featured === true && activity.published === true);
    },
  });

  // Fetch site settings
  const { data: siteSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/site-settings"],
  });

  // Fetch search configuration for homepage context
  const { data: searchConfig } = useQuery({
    queryKey: ["/api/search-config/homepage"],
  });

  // Fetch motivation data for CTA section
  const { data: motivationData } = useQuery({
    queryKey: ["/api/motivation"],
  });

  // Fetch motivation image location name
  const { data: motivationImageLocation } = useQuery({
    queryKey: ["/api/motivation/image-location", motivationData?.image],
    queryFn: async () => {
      if (!motivationData?.image) return null;
      const response = await fetch(`/api/motivation/image-location?imagePath=${encodeURIComponent(motivationData.image)}`);
      if (!response.ok) throw new Error('Failed to fetch location');
      return response.json();
    },
    enabled: !!motivationData?.image,
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
  const publishedDestinations = (destinations as any[]).filter((destination: any) => destination.published);
  
  // Filter only published guides
  const publishedGuides = (guides as any[]).filter((guide: any) => guide.published);
  
  // Filter only published pages
  const publishedPages = (pages as any[]).filter((page: any) => page.published);
  
  // Show loading state
  if (destinationsLoading || guidesLoading || pagesLoading || featuredLoading || settingsLoading) {
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
    
    console.log('=== SEARCH DEBUG ===');
    console.log('Starting search for:', searchQuery);
    console.log('Current showSearchResults:', showSearchResults);
    console.log('Current searchResults length:', searchResults.length);
    console.log('Current isSearching:', isSearching);
    
    // Always perform fresh search - don't cache results
    setIsSearching(true);
    setShowSearchResults(true);
    
    try {
      const searchScope = searchConfig?.searchScope || 'destinations';
      const url = `/api/search?q=${encodeURIComponent(searchQuery)}&scope=${searchScope}`;
      console.log('Fetching URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      console.log('Results count:', data.results?.length || 0);
      
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      console.log('=== SEARCH COMPLETE ===');
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
    <div className="min-h-screen bg-luxury-gradient">
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
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-luxury-serif font-bold mb-8 text-white tracking-wide leading-tight">
            {siteSettings?.siteName || "Ontdek Polen"}
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mb-16 font-elegant-serif font-light leading-relaxed max-w-4xl mx-auto text-white/90">
            {siteSettings?.siteDescription || "Mooie plekken in Polen ontdekken"}
          </p>
          
          <form 
            onSubmit={(e) => {
              console.log('Form submit event triggered');
              handleSearch(e);
            }} 
            className="mt-5 mb-5 relative"
          >
            <div className="relative inline-block">
              <Input
                type="text"
                placeholder={searchConfig?.placeholderText || "Zoek bestemming"}
                value={searchQuery}
                onChange={(e) => {
                  console.log('Search input changed:', e.target.value);
                  setSearchQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  console.log('Key pressed:', e.key);
                  if (e.key === 'Enter') {
                    console.log('Enter key detected, form should submit');
                  }
                }}
                className="py-5 px-8 w-[28rem] max-w-full border-2 border-white/30 rounded-full text-lg text-navy-dark font-inter shadow-2xl backdrop-blur-md bg-white/95 hover:bg-white hover:border-gold transition-all duration-500 focus:border-gold focus:ring-2 focus:ring-gold/50"
              />
              <Search 
                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 cursor-pointer" 
                onClick={() => {
                  console.log('Search icon clicked');
                  if (searchQuery.trim()) {
                    const form = document.querySelector('form');
                    if (form) {
                      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }
                  }
                }}
              />
            </div>
            {/* Debug state indicator */}
            {showSearchResults && (
              <div className="absolute top-16 left-0 bg-red-500 text-white px-2 py-1 text-xs rounded">
                Search Active: {isSearching ? 'Searching...' : `${searchResults.length} results`}
              </div>
            )}
          </form>
          

          
          {/* Luxury CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
            <Button
              onClick={handlePlanTrip}
              className="py-5 px-10 text-lg font-luxury-serif font-medium bg-gold hover:bg-gold/90 text-navy-dark rounded-full shadow-2xl hover:shadow-gold/25 transition-all duration-500 border-2 border-gold hover:scale-105"
            >
              <MapPin className="w-5 h-5 mr-3" />
              Plan je reis
            </Button>
            <Button
              onClick={handleReadGuides}
              className="py-5 px-10 text-lg font-luxury-serif font-medium bg-white/10 backdrop-blur-md hover:bg-white/20 border-2 border-white/40 text-white rounded-full shadow-2xl hover:shadow-white/25 transition-all duration-500 hover:scale-105"
              variant="outline"
            >
              <Calendar className="w-5 h-5 mr-3" />
              Lees onze gidsen
            </Button>
          </div>
        </div>
      </header>

      {/* Search Results Overlay */}
      {showSearchResults && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 z-50"
          onClick={closeSearch}
        >
          <div 
            className="absolute top-80 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto border-2 border-blue-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Zoekresultaten{searchQuery && ` voor "${searchQuery}"`}
              </h3>
              <button 
                onClick={closeSearch}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            {isSearching ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Zoeken...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((result: any) => (
                  <Link key={result.id} href={result.link || `/${result.slug}`}>
                    <div className="p-4 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200 transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        {result.image && (
                          <img 
                            src={result.image} 
                            alt={result.alt || result.name} 
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{result.name || result.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                          <span className={`text-xs px-2 py-1 rounded capitalize ${getTypeStyles(result.type)}`}>
                            {getTypeLabel(result.type)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  Geen resultaten gevonden voor "{searchQuery}"
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Probeer een andere zoekterm
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Destinations Section - Luxury Layout */}
      {siteSettings?.showDestinations && (
        <section className="py-24 px-5 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-luxury-serif font-bold mb-6 text-navy-dark tracking-wide">
              Ontdek Polen
            </h2>
            <p className="text-xl md:text-2xl text-navy-medium font-elegant-serif max-w-3xl mx-auto leading-relaxed">
              Van historische steden tot adembenemende natuurparken
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
                  className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-700 border border-gray-100 cursor-pointer group"
                >
                  <img
                    src={destination.image}
                    alt={destination.alt}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="p-8">
                    <h3 className="font-luxury-serif font-bold text-navy-dark text-xl mb-2">
                      {destination.name}
                    </h3>
                    <div className="w-12 h-0.5 bg-gold"></div>
                  </div>
                </Card>
              );

              // OPTIMIZED: Auto-link all destinations to their optimized routes
              // External links take precedence, then auto-generated destination links
              if (destination.link && destination.link.startsWith('http')) {
                // External link - open in new tab
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
                // Auto-link to destination slug (optimized route)
                // This uses the new destination-first API that tries destinations before pages
                return (
                  <Link key={destination.id} href={`/${destination.slug}`}>
                    {CardContent}
                  </Link>
                );
              }
            })}
          </TravelSlider>
        </section>
      )}



      {/* CTA Section - Luxury Design */}
      {siteSettings?.showMotivation && motivationData && motivationData.is_published && (
        <section className="py-24 px-5 max-w-7xl mx-auto">
          <div className="bg-cream rounded-3xl p-12 lg:p-16 shadow-2xl border border-gold/20">
            <div className="flex flex-wrap gap-12 items-center justify-between">
              <div className="flex-1 min-w-80">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-luxury-serif font-bold mb-6 text-navy-dark tracking-wide leading-tight">
                  {motivationData.title || "Laat je verrassen door het onbekende Polen"}
                </h2>
                <p className="text-xl md:text-2xl mb-8 font-elegant-serif text-navy-medium leading-relaxed">
                  {motivationData.description || "Bezoek historische steden, ontdek natuurparken en verborgen parels. Onze reisgidsen helpen je op weg!"}
                </p>
                <Button
                  onClick={handleReadGuides}
                  className="py-5 px-10 text-lg font-luxury-serif font-medium bg-navy-dark hover:bg-navy-medium text-white hover:scale-105 transition-all duration-500 rounded-full shadow-2xl"
                >
                  {motivationData.button_text || "Lees onze reizen"}
                </Button>
              </div>
              <div className="flex-1 min-w-80 relative">
                <img
                  src={motivationData.image || "/images/motivatie/tatra-valley.jpg"}
                  alt="Motivatie afbeelding"
                  className="w-full rounded-3xl shadow-2xl"
                  onError={(e) => {
                    e.currentTarget.src = "/images/motivatie/tatra-valley.jpg";
                  }}
                />
                {/* Location name overlay */}
                {motivationImageLocation?.locationName && (
                  <div className="absolute bottom-4 right-4 bg-navy-dark/90 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-10 backdrop-blur-sm">
                    📍 {motivationImageLocation.locationName}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Luxury Featured Activities Section */}
      {siteSettings?.showHighlights && featuredActivities.length > 0 && (
        <section className="py-24 px-5 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-luxury-serif font-bold mb-6 text-navy-dark tracking-wide">
              Hoogtepunten van Polen
            </h2>
            <p className="text-xl md:text-2xl text-navy-medium font-elegant-serif leading-relaxed">
              De beste bezienswaardigheden en ervaringen
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {featuredActivities
              .sort((a, b) => (a.ranking || 0) - (b.ranking || 0)) // Sort by ranking
              .map((activity) => {
                const CardContent = (
                  <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-700 border border-gray-100 cursor-pointer text-center group">
                    <img
                      src={activity.image || '/images/activities/placeholder.svg'}
                      alt={activity.alt || activity.name}
                      className="w-24 h-24 mx-auto mb-6 object-cover rounded-full shadow-lg group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = '/images/activities/placeholder.svg';
                      }}
                    />
                    <h3 className="font-luxury-serif font-bold text-navy-dark text-lg mb-3">
                      {activity.name}
                    </h3>
                    <p className="text-sm text-navy-medium mb-2 font-inter">
                      📍 {activity.location}
                    </p>
                    {activity.category && (
                      <p className="text-sm text-gold font-medium capitalize font-inter">
                        {activity.category}
                      </p>
                    )}
                  </div>
                );

                // Handle activity click - navigate to destination page with activity parameter
                const handleActivityClick = () => {
                  // Create slug mapping for all supported destinations
                  const locationToSlug: { [key: string]: string } = {
                    'Krakow': 'krakow',
                    'Tatra': 'tatra', 
                    'Gdansk': 'gdansk',
                    'Warschau': 'warschau',
                    'Wroclaw': 'wroclaw',
                    'Zakopane': 'zakopane',
                    'Poznan': 'poznan',
                    'Bialowieza': 'bialowieza',
                    'Wrocław': 'wroclaw', // Alternative spelling
                    'Poznań': 'poznan', // Alternative spelling  
                    'Białowieża': 'bialowieza', // Alternative spelling
                    'Łódź': 'lodz',
                    'Lublin': 'lublin',
                    'Rzeszow': 'rzeszow',
                    'Katowice': 'katowice',
                    'Bialystok': 'bialystok',
                    'Jelenia Gora': 'jelenia-gora',
                    'Karpacz': 'karpacz',
                    'Szklarska Poreba': 'szklarska-poreba',
                    'Malbork': 'malbork',
                    'Torun': 'torun',
                    'Wieliczka': 'wieliczka',
                    'Zamosc': 'zamosc',
                    'Sopot': 'sopot',
                    'Ustka': 'ustka',
                    'Swinoujscie': 'swinoujscie',
                    'Hel': 'hel',
                    'Zalipie': 'zalipie',
                    'Kazimierz Dolny': 'kazimierz-dolny',
                    'Sandomierz': 'sandomierz'
                  };
                  
                  // Navigate to destination page with activity parameter
                  const destinationSlug = locationToSlug[activity.location] || activity.location.toLowerCase();
                  const activityUrl = `/${destinationSlug}?activity=${activity.id}`;
                  
                  // Use wouter navigation
                  window.location.href = activityUrl;
                };

                // Handle external links
                if (activity.link && activity.link.startsWith('http')) {
                  return (
                    <a
                      key={activity.id}
                      href={activity.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {CardContent}
                    </a>
                  );
                }

                // Make activity clickable - navigate to destination page
                return (
                  <div 
                    key={activity.id} 
                    onClick={handleActivityClick}
                    className="cursor-pointer"
                  >
                    {CardContent}
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Modern Published Pages Section */}
      {siteSettings?.showOntdekMeer && publishedPages.length > 0 && (
        <section className="py-16 px-5 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 font-inter text-gray-900">
                Ontdek Meer
              </h2>
              <p className="text-xl text-gray-600">
                Verdiep je in onze complete collectie reisgidsen
              </p>
            </div>
            <Link href="/ontdek-meer">
              <Button
                variant="outline"
                className="text-gray-900 border-gray-300 hover:bg-gray-100 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Bekijk Alles
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedPages.map((page) => (
              <Link href={`/${page.slug}`} key={page.id}>
                <Card className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 border-none cursor-pointer group">
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

      {/* Luxury Travel Guides Section */}
      {siteSettings?.showGuides && (
        <section className="py-24 px-5 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-luxury-serif font-bold mb-6 text-navy-dark tracking-wide">
              Reizen en Tips
            </h2>
            <p className="text-xl md:text-2xl text-navy-medium font-elegant-serif leading-relaxed">
              Ontdek onze expertgidsen voor de perfecte reis
            </p>
          </div>
          <TravelSlider
            visibleItems={{ mobile: 1, tablet: 2, desktop: 4 }}
            showNavigation={true}
            className="mx-auto"
          >
            {publishedGuides.map((guide: any) => {
              const CardContent = (
                <Card 
                  className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-700 border border-gray-100 cursor-pointer group"
                >
                  <img
                    src={guide.image}
                    alt={guide.alt}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="p-8">
                    <h3 className="font-luxury-serif font-bold text-navy-dark mb-3 text-xl">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-navy-medium font-inter leading-relaxed">
                      {guide.description}
                    </p>
                    <div className="w-12 h-0.5 bg-gold mt-4"></div>
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
          </TravelSlider>
        </section>
      )}

      {/* Luxury Footer */}
      <footer className="bg-navy-dark text-center py-16 px-5 text-white relative">
        {/* Admin Link */}
        <Link href="/admin">
          <Button 
            variant="outline" 
            size="sm"
            className="absolute top-6 right-6 text-white border-white/50 hover:bg-white hover:text-navy-dark font-luxury-serif"
          >
            <Settings className="h-4 w-4 mr-2" />
            Admin
          </Button>
        </Link>
        
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-luxury-serif font-bold mb-6 tracking-wide">
            {siteSettings?.siteName || "Ontdek Polen"}
          </h3>
          <p className="text-xl md:text-2xl text-white/80 font-elegant-serif leading-relaxed mb-8">
            De mooiste plekken in Polen ontdekken begint hier
          </p>
          <div className="w-24 h-0.5 bg-gold mx-auto mb-8"></div>
          <p className="font-inter text-lg text-white/60">
            &copy; 2025 {siteSettings?.siteName || "Ontdek Polen"}. Alle rechten voorbehouden.
          </p>
        </div>
      </footer>
    </div>
  );
}
