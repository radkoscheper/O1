import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Settings, MapPin, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import TravelSlider from "@/components/ui/travel-slider";
import { LoadingScreen, useLoadingContent } from "@/components/ui/loading-screen";
import { generateCloudinaryUrl, getSmartTransform } from "@/lib/cloudinaryUtils";

export default function Home() {
  const [location] = useLocation();
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
  const { data: siteSettings = {}, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/site-settings"],
  });

  const isPageLoading = destinationsLoading || guidesLoading || pagesLoading;
  
  // Loading content for this page
  const loadingContent = useLoadingContent(location, siteSettings);
  
  const showLoading = isPageLoading;

  // Fetch search configuration for homepage context
  const { data: searchConfig = {} } = useQuery({
    queryKey: ["/api/search-config/homepage"],
  });

  // Fetch motivation data for CTA section
  const { data: motivationData = {} } = useQuery({
    queryKey: ["/api/motivation"],
  });

  // Fetch motivation image location name
  const { data: motivationImageLocation = {} } = useQuery({
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
      document.title = (siteSettings as any).siteName || "Ontdek Polen";
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', (siteSettings as any).siteDescription || "Ontdek de mooiste plekken van Polen");
      
      // Update meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', (siteSettings as any).metaKeywords || "Polen, reizen, vakantie, bestemmingen");
      
      // Update favicon - handle enabled/disabled state
      const existingFavicon = document.querySelector('link[rel="icon"]');
      
      if ((siteSettings as any).faviconEnabled === true && (siteSettings as any).favicon) {
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
  
  // Show loading screen instead of simple spinner
  if (showLoading) {
    return (
      <LoadingScreen
        isLoading={true}
        title={loadingContent.title}
        subtitle={loadingContent.subtitle}
      />
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
      const searchScope = (searchConfig as any)?.searchScope || 'destinations';
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
    <div className="min-h-screen" style={{ backgroundColor: "#f8f6f1" }}>
      {/* Hero Section */}
      <header 
        className="relative bg-cover bg-center text-white py-24 px-5 text-center"
        style={{
          backgroundImage: (siteSettings as any)?.backgroundImage 
            ? `url('${(siteSettings as any).backgroundImage}')` 
            : "url('/images/header.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {(siteSettings as any)?.headerOverlayEnabled && (
          <div 
            className="absolute inset-0 bg-black" 
            style={{ opacity: ((siteSettings as any)?.headerOverlayOpacity || 30) / 100 }}
          ></div>
        )}
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-3 font-inter">
            {(siteSettings as any)?.siteName || "Ontdek Polen"}
          </h1>
          <p className="text-xl mb-8 font-inter">
            {(siteSettings as any)?.siteDescription || "Mooie plekken in Polen ontdekken"}
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
                placeholder={(searchConfig as any)?.placeholderText || "Zoek bestemming"}
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
                className="py-3 px-5 w-80 max-w-full border-none rounded-lg text-base text-gray-900 font-inter"
              />
              <Search 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 cursor-pointer" 
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
          

          
          <Button
            onClick={handlePlanTrip}
            className="mt-4 py-3 px-6 text-base font-inter hover:opacity-90 transition-all duration-200"
            style={{ backgroundColor: "#2f3e46" }}
          >
            Plan je reis
          </Button>
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

      {/* Destinations Section - Travel Slider Implementation */}
      {(siteSettings as any)?.showDestinations && (
        <section className="py-8 px-5 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 font-inter text-gray-900">
            Bestemmingen
          </h2>
          <TravelSlider
            visibleItems={{ mobile: 1, tablet: 2, desktop: 4 }}
            showNavigation={true}
            className="mx-auto"
          >
            {publishedDestinations.map((destination: any) => {
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



      {/* CTA Section - Dynamic from Database */}
      {(siteSettings as any)?.showMotivation && motivationData && (motivationData as any).is_published && (
        <section className="py-16 px-5 max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-8 items-center justify-between">
            <div className="flex-1 min-w-80">
              <h2 className="text-3xl font-bold mb-4 font-inter text-gray-900">
                {(motivationData as any).title || "Laat je verrassen door het onbekende Polen"}
              </h2>
              <p className="text-lg mb-6 font-inter text-gray-700">
                {(motivationData as any).description || "Bezoek historische steden, ontdek natuurparken en verborgen parels. Onze reisgidsen helpen je op weg!"}
              </p>
              <Button
                onClick={handleReadGuides}
                className="py-3 px-6 text-base font-inter hover:opacity-90 transition-all duration-200"
                style={{ backgroundColor: "#2f3e46" }}
              >
                {(motivationData as any).button_text || "Lees onze reizen"}
              </Button>
            </div>
            <div className="flex-1 min-w-80 relative">
              <img
                src={(motivationData as any).image || "/images/motivatie/tatra-valley.jpg"}
                alt="Motivatie afbeelding"
                className="w-full rounded-xl shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = "/images/motivatie/tatra-valley.jpg";
                }}
              />
              {/* Location name overlay */}
              {(motivationImageLocation as any)?.locationName && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-sm font-medium shadow-lg z-10">
                  📍 {(motivationImageLocation as any).locationName}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Activities Section - From Database */}
      {siteSettings?.showHighlights && featuredActivities.length > 0 && (
        <section className="py-16 px-5 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 font-inter text-gray-900">
            Hoogtepunten van Polen
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {featuredActivities
              .sort((a, b) => (a.ranking || 0) - (b.ranking || 0)) // Sort by ranking
              .map((activity) => {
                const CardContent = (
                  <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 border-none cursor-pointer text-center">
                    <img
                      src={activity.image || '/images/activities/placeholder.svg'}
                      alt={activity.alt || activity.name}
                      className="w-16 h-16 mx-auto mb-3 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = '/images/activities/placeholder.svg';
                      }}
                    />
                    <h3 className="font-bold font-inter text-gray-900 text-sm">
                      {activity.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {activity.location}
                    </p>
                    {activity.category && (
                      <p className="text-xs text-blue-600 mt-1 capitalize">
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

      {/* Published Pages */}
      {(siteSettings as any)?.showOntdekMeer && publishedPages.length > 0 && (
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

      {/* Travel Guides - Travel Slider Implementation */}
      {(siteSettings as any)?.showGuides && (
        <section className="py-16 px-5 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 font-inter text-gray-900">
            Reizen en Tips
          </h2>
          <TravelSlider
            visibleItems={{ mobile: 1, tablet: 2, desktop: 4 }}
            showNavigation={true}
            className="mx-auto"
          >
            {publishedGuides.map((guide: any) => {
              const CardContent = (
                <Card 
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-none cursor-pointer"
                >
                  <img
                    src={guide.image}
                    alt={guide.alt}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold font-inter text-gray-900 mb-2">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-gray-600 font-inter">
                      {guide.description}
                    </p>
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
