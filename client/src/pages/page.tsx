import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Settings, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import TravelSlider from "@/components/ui/travel-slider";

// Activities section component
function ActivitiesSection({ pageTitle, setSelectedActivityId }: { pageTitle?: string, setSelectedActivityId: (id: string | null) => void }) {
  const { data: locationActivities, isLoading } = useQuery({
    queryKey: ['/api/activities/location', pageTitle],
    queryFn: async () => {
      if (!pageTitle) return [];
      const response = await fetch(`/api/activities/location/${encodeURIComponent(pageTitle)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      return response.json();
    },
    enabled: !!pageTitle,
  });

  if (isLoading || !locationActivities?.length) {
    return null;
  }

  return (
    <section className="py-16 px-5 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 font-inter text-gray-900">
        Activiteiten in {pageTitle}
      </h2>
      <TravelSlider
        visibleItems={{ mobile: 1, tablet: 2, desktop: 4 }}
        showNavigation={true}
        className="mx-auto"
      >
        {locationActivities.map((activity: any) => {
          // Handler for activity click to show details in content section
          const handleActivityClick = (e: React.MouseEvent) => {
            e.preventDefault();
            setSelectedActivityId(activity.id.toString());
            
            // Update URL with activity parameter
            const newUrl = `${window.location.pathname}?activity=${activity.id}`;
            window.history.pushState({}, '', newUrl);
            
            // Scroll to content section smoothly
            const contentSection = document.getElementById('content-section');
            if (contentSection) {
              contentSection.scrollIntoView({ behavior: 'smooth' });
            }
          };

          return (
            <Card 
              key={activity.id}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-none cursor-pointer"
              onClick={handleActivityClick}
            >
              {activity.image && (
                <img
                  src={activity.image}
                  alt={activity.alt || activity.name}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/activities/placeholder.svg';
                  }}
                />
              )}
              <div className="p-4">
                <h3 className="font-bold font-inter text-gray-900 mb-2">
                  {activity.name}
                </h3>
                {activity.description && (
                  <p className="text-sm text-gray-600 font-inter line-clamp-2">
                    {activity.description}
                  </p>
                )}
                {activity.category && (
                  <p className="text-xs text-gray-500 mt-2 capitalize">
                    {activity.category}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </TravelSlider>
    </section>
  );
}

export default function Page() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
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

  // Check for activity parameter on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const activityParam = urlParams.get('activity');
    if (activityParam) {
      setSelectedActivityId(activityParam);
    }
  }, [slug]);

  // Separate effect to handle scrolling when selectedActivity data is loaded
  useEffect(() => {
    if (selectedActivity && selectedActivityId) {
      // Wait for content to render completely then scroll
      setTimeout(() => {
        const contentSection = document.getElementById('content-section');
        if (contentSection) {
          console.log('Scrolling to content section for activity:', selectedActivity.name);
          contentSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 300);
    }
  }, [selectedActivity, selectedActivityId]);

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
        return '📖 Reisgidsen';
      case 'page':
        return '📄 Pagina';
      case 'template':
        return '🎨 Template';
      default:
        return type;
    }
  };
  
  // Try destinations first, fallback to pages - OPTIMIZED APPROACH
  const { data: page, isLoading, error } = useQuery({
    queryKey: ['/api/content', slug],
    queryFn: async () => {
      // First try destinations (most likely for Polish travel content)
      try {
        const destResponse = await fetch(`/api/destinations/${slug}`);
        if (destResponse.ok) {
          const destinationData = await destResponse.json();
          console.log('Found destination:', destinationData.title);
          return destinationData;
        }
      } catch (error) {
        console.log('Destination not found, trying pages...');
      }
      
      // Fallback to pages for custom content
      const pageResponse = await fetch(`/api/pages/${slug}`);
      if (!pageResponse.ok) {
        throw new Error('Content not found');
      }
      const pageData = await pageResponse.json();
      console.log('Found page:', pageData.title);
      return pageData;
    },
  });

  // Fetch site settings for consistent styling
  const { data: siteSettings } = useQuery({
    queryKey: ["/api/site-settings"],
  });

  // Fetch search configuration for destination context
  const { data: searchConfig } = useQuery({
    queryKey: ["/api/search-config/destination"],
  });

  // Fetch location-specific featured activities
  const { data: locationFeaturedActivities = [] } = useQuery({
    queryKey: ["/api/admin/activities", page?.title],
    queryFn: async () => {
      if (!page?.title) return [];
      const response = await fetch('/api/admin/activities');
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      const activities = await response.json();
      // Filter for featured, published activities that match the location
      return activities.filter((activity: any) => 
        activity.featured === true && 
        activity.published === true && 
        activity.location === page.title
      );
    },
    enabled: !!page?.title,
  });

  // Fetch selected activity details if activity ID is present
  const { data: selectedActivity } = useQuery({
    queryKey: ['/api/activities', selectedActivityId],
    queryFn: async () => {
      if (!selectedActivityId || !page?.title) return null;
      // Use the public location-specific API instead of admin API
      const response = await fetch(`/api/activities/location/${encodeURIComponent(page.title)}`);
      if (!response.ok) throw new Error('Failed to fetch activities');
      const activities = await response.json();
      return activities.find((a: any) => a.id === parseInt(selectedActivityId));
    },
    enabled: !!selectedActivityId && !!page?.title,
  });

  // Update document title and meta tags
  useEffect(() => {
    if (page) {
      document.title = page.metaTitle || `${page.title} | Ontdek Polen`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', page.metaDescription || '');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = page.metaDescription || '';
        document.head.appendChild(meta);
      }
      
      // Update meta keywords
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', page.metaKeywords || '');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'keywords';
        meta.content = page.metaKeywords || '';
        document.head.appendChild(meta);
      }
    }
    
    // Apply site-wide favicon from settings
    const existingFavicon = document.querySelector('link[rel="icon"]');
    
    if (siteSettings?.faviconEnabled === true && siteSettings?.favicon) {
      // Favicon enabled - use server route which checks database
      if (existingFavicon) {
        existingFavicon.setAttribute('href', '/favicon.ico?' + Date.now()); // Cache bust
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = '/favicon.ico?' + Date.now(); // Cache bust
        document.head.appendChild(link);
      }
    } else {
      // Favicon disabled - remove any existing favicon
      if (existingFavicon) {
        existingFavicon.remove();
      }
      // Force browser to not show any favicon by using empty data URL
      const emptyFavicon = document.createElement('link');
      emptyFavicon.rel = 'icon';
      emptyFavicon.href = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
      document.head.appendChild(emptyFavicon);
    }
  }, [page, siteSettings]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8f6f1" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Laden...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#f8f6f1" }}>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Pagina niet gevonden</h1>
            <p className="text-gray-600 mb-6">
              De pagina die je zoekt bestaat niet of is niet beschikbaar.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Terug naar home
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    console.log('=== DESTINATION PAGE SEARCH DEBUG ===');
    console.log('Starting destination page search for:', searchQuery);
    console.log('Current showSearchResults:', showSearchResults);
    console.log('Current searchResults length:', searchResults.length);
    console.log('Current isSearching:', isSearching);
    console.log('Page title:', page?.title);
    
    // Always perform fresh search - don't cache results
    setIsSearching(true);
    setShowSearchResults(true);
    
    try {
      // Search scope - for destination pages, search activities or use config
      const searchScope = searchConfig?.searchScope || 'activities';
      let url = `/api/search?q=${encodeURIComponent(searchQuery)}&scope=${searchScope}`;
      
      // Add location filter if enabled and we have page location info
      if (searchConfig?.enableLocationFilter && page?.title) {
        url += `&location=${encodeURIComponent(page.title)}`;
      }
      
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
      console.log('=== DESTINATION PAGE SEARCH COMPLETE ===');
    }
  };

  // Get the background image from database or fallback to default
  const getBackgroundImage = () => {
    if (page?.headerImage) {
      return page.headerImage;
    }
    // Fallback to default background images if no header image is set
    const defaultImages = {
      'krakow': '/images/destinations/krakow.jpg',
      'warschau-citytrip': '/images/destinations/tatra.jpg', 
      'tatra-mountains': '/images/destinations/tatra.jpg',
      'gdansk': '/images/destinations/gdansk.jpg',
      'bialowieza': '/images/destinations/bialowieza.jpg'
    };
    return defaultImages[slug as keyof typeof defaultImages] || '/images/backgrounds/header.jpg';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f6f1" }}>
      {/* Hero Section - with dynamic header image */}
      <header 
        className="relative bg-cover bg-center text-white py-24 px-5 text-center"
        style={{
          backgroundImage: `url('${getBackgroundImage()}')`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
        role="banner"
        aria-label={page?.headerImageAlt || `${page?.title} header afbeelding`}
      >
        {siteSettings?.headerOverlayEnabled && (
          <div 
            className="absolute inset-0 bg-black" 
            style={{ opacity: (siteSettings?.headerOverlayOpacity || 30) / 100 }}
          ></div>
        )}
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-3 font-inter">
            Ontdek Polen
          </h1>
          <p className="text-xl mb-8 font-inter">
            Mooie plekken in {page.title} ontdekken
          </p>
          
          <form 
            onSubmit={(e) => {
              console.log('Destination page form submit event triggered');
              handleSearch(e);
            }} 
            className="mt-5 mb-5 relative"
          >
            <div className="relative inline-block">
              <Input
                type="text"
                placeholder={searchConfig?.placeholderText || "Zoek activiteiten..."}
                value={searchQuery}
                onChange={(e) => {
                  console.log('Destination page search input changed:', e.target.value);
                  setSearchQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  console.log('Destination page key pressed:', e.key);
                  if (e.key === 'Enter') {
                    console.log('Enter key detected, form should submit');
                  }
                }}
                className="py-3 px-5 w-80 max-w-full border-none rounded-lg text-base text-gray-900 font-inter"
              />
              <Search 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 cursor-pointer" 
                onClick={() => {
                  console.log('Destination page search icon clicked');
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
            asChild
            className="mt-4 py-3 px-6 text-base font-inter hover:opacity-90 transition-all duration-200"
            style={{ backgroundColor: "#2f3e46" }}
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar home
            </Link>
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
                {searchResults.map((result: any) => {
                  // For activities, create a link with activity parameter instead of external link
                  const handleActivityClick = (e: React.MouseEvent, activityId: number) => {
                    e.preventDefault();
                    setSelectedActivityId(activityId.toString());
                    
                    // Update URL without page reload
                    const newUrl = `${window.location.pathname}?activity=${activityId}`;
                    window.history.pushState({}, '', newUrl);
                    
                    // Close search overlay
                    closeSearch();
                    
                    // Scroll to content section smoothly
                    setTimeout(() => {
                      const contentSection = document.getElementById('content-section');
                      if (contentSection) {
                        contentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  };

                  return (
                    <div key={result.id}>
                      {result.type === 'activity' ? (
                        <div 
                          className="p-4 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200 transition-all duration-200"
                          onClick={(e) => handleActivityClick(e, result.id)}
                        >
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
                      ) : (
                        <Link href={result.link || `/${result.slug}`}>
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
                      )}
                    </div>
                  );
                })}
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

      {/* Activities Section - same style as homepage destinations grid */}
      <ActivitiesSection pageTitle={page?.title} setSelectedActivityId={setSelectedActivityId} />

      {/* Content Section */}
      <section id="content-section" className="py-16 px-5 max-w-6xl mx-auto">
        <Card className="bg-white rounded-xl shadow-lg border-none p-8">
          {selectedActivity ? (
            // Show selected activity content
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900 font-inter">{selectedActivity.name}</h1>
                <button
                  onClick={() => {
                    setSelectedActivityId(null);
                    // Remove activity parameter from URL
                    const newUrl = window.location.pathname;
                    window.history.pushState({}, '', newUrl);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Terug naar {page?.title}
                </button>
              </div>
              
              {selectedActivity.image && (
                <img
                  src={selectedActivity.image}
                  alt={selectedActivity.alt || selectedActivity.name}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                  onError={(e) => {
                    e.currentTarget.src = '/images/activities/placeholder.svg';
                  }}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Locatie</h3>
                  <p className="text-gray-600">{selectedActivity.location}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Categorie</h3>
                  <p className="text-gray-600">{selectedActivity.category}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Type</h3>
                  <p className="text-gray-600">{selectedActivity.activityType}</p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-inter">Beschrijving</h2>
                <p className="text-gray-700 text-lg leading-relaxed font-inter">{selectedActivity.description}</p>
              </div>

              {selectedActivity.content && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-inter">Meer informatie</h2>
                  <div 
                    className="prose prose-lg max-w-none font-inter"
                    dangerouslySetInnerHTML={{
                      __html: selectedActivity.content
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
                    }}
                  />
                </div>
              )}

              {selectedActivity.link && (
                <div className="mt-6">
                  <a
                    href={selectedActivity.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Bezoek website
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          ) : (
            // Show original page content
            <div 
              className="prose prose-lg max-w-none font-inter"
              dangerouslySetInnerHTML={{
                __html: page.content
                  .replace(/\n/g, '<br>')
                  .replace(/# (.*)/g, '<h1 class="text-3xl font-bold mb-6 text-gray-900 font-inter">$1</h1>')
                  .replace(/## (.*)/g, '<h2 class="text-2xl font-semibold mb-4 text-gray-800 font-inter">$1</h2>')
                  .replace(/### (.*)/g, '<h3 class="text-xl font-medium mb-3 text-gray-700 font-inter">$1</h3>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
                  .replace(/- (.*)/g, '<li class="mb-2 text-gray-700">$1</li>')
                  .replace(/(<li.*<\/li>)/gs, '<ul class="list-disc list-inside mb-6 space-y-2 ml-4">$1</ul>')
                  .replace(/---/g, '<hr class="my-8 border-gray-200">')
              }}
            />
          )}
        </Card>
      </section>

      {/* Location-specific Featured Activities Section */}
      {locationFeaturedActivities.length > 0 && (
        <section className="py-16 px-5 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 font-inter text-gray-900">
            Hoogtepunten van {page.title}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {locationFeaturedActivities
              .sort((a: any, b: any) => (a.ranking || 0) - (b.ranking || 0))
              .map((activity: any) => {
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

                // Internal activity click handler
                return (
                  <div 
                    key={activity.id}
                    onClick={() => {
                      setSelectedActivityId(activity.id.toString());
                      const newUrl = `${window.location.pathname}?activity=${activity.id}`;
                      window.history.pushState({}, '', newUrl);
                      const contentSection = document.getElementById('content-section');
                      if (contentSection) {
                        contentSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    {CardContent}
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Footer - exact same as homepage */}
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