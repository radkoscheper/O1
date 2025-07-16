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
    
    // Apply site-wide favicon from settings - only if enabled and has a valid path
    const favicon = document.querySelector('link[rel="icon"]');
    if (siteSettings?.faviconEnabled && siteSettings?.favicon && siteSettings.favicon.trim()) {
      if (!favicon) {
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.href = siteSettings.favicon;
        document.head.appendChild(newFavicon);
      } else {
        favicon.setAttribute('href', siteSettings.favicon);
      }
    } else {
      // Remove favicon if disabled or empty
      if (favicon) {
        favicon.remove();
      }
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // TODO: Implement search functionality
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
                placeholder="Zoek bestemming"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-3 px-5 w-80 max-w-full border-none rounded-lg text-base text-gray-900 font-inter"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            </div>
          </form>
          
          <Button
            asChild
            className="mt-2 py-3 px-6 text-base font-inter hover:opacity-90 transition-all duration-200"
            style={{ backgroundColor: "#2f3e46" }}
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar home
            </Link>
          </Button>
        </div>
      </header>

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