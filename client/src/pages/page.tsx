import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Settings, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Page() {
  const { slug } = useParams<{ slug: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const { data: page, isLoading, error } = useQuery({
    queryKey: ['/api/pages', slug],
    queryFn: async () => {
      const response = await fetch(`/api/pages/${slug}`);
      if (!response.ok) {
        throw new Error('Page not found');
      }
      return response.json();
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
      
      const response = await fetch(url);
      const data = await response.json();
      
      setSearchResults(data.results || []);
      
      // Auto-redirect logic if configured
      if (searchConfig?.redirectPattern && data.results?.length === 1) {
        const result = data.results[0];
        let redirectUrl = searchConfig.redirectPattern;
        
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
          
          <form onSubmit={handleSearch} className="mt-5 mb-5">
            <div className="relative inline-block">
              <Input
                type="text"
                placeholder={searchConfig?.placeholderText || "Zoek activiteiten..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-3 px-5 w-80 max-w-full border-none rounded-lg text-base text-gray-900 font-inter"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            </div>
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

      {/* Floating Search Results Overlay */}
      {showSearchResults && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
          onClick={() => setShowSearchResults(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Zoekresultaten{searchQuery && ` voor "${searchQuery}"`}
              </h3>
              <button 
                onClick={() => setShowSearchResults(false)}
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
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded capitalize">
                            {result.type}
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

      {/* Highlight Section - same style as homepage destination grid */}
      {page.highlightSections && (
        <section className="py-16 px-5 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 font-inter text-gray-900">
            Hoogtepunten van {page.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {JSON.parse(page.highlightSections).map((highlight: any, index: number) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-none cursor-pointer">
                <img
                  src={highlight.image}
                  alt={highlight.alt}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    // Fallback to a default image if the specific image doesn't exist
                    e.currentTarget.src = '/images/placeholder.jpg';
                  }}
                />
                <div className="p-4">
                  <h3 className="font-bold font-inter text-gray-900 mb-2">
                    {highlight.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-inter">
                    {highlight.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Content Section */}
      <section className="py-16 px-5 max-w-6xl mx-auto">
        <Card className="bg-white rounded-xl shadow-lg border-none p-8">
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
        </Card>
      </section>

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