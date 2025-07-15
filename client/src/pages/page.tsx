import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { Link } from "wouter";

export default function Page() {
  const { slug } = useParams<{ slug: string }>();
  
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
  }, [page]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">Pagina niet gevonden</CardTitle>
              <CardDescription>
                De pagina die je zoekt bestaat niet of is niet beschikbaar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Terug naar home
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Terug naar home
              </Link>
            </Button>
            
            <div className="flex items-center gap-2 mb-4">
              {page.featured && (
                <Badge variant="secondary">
                  <Tag className="mr-1 h-3 w-3" />
                  Uitgelicht
                </Badge>
              )}
              <Badge variant="outline">
                <Calendar className="mr-1 h-3 w-3" />
                {new Date(page.createdAt).toLocaleDateString('nl-NL')}
              </Badge>
              {page.template && (
                <Badge variant="outline">
                  Template: {page.template}
                </Badge>
              )}
            </div>
          </div>

          {/* Main content */}
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html: page.content
                    .replace(/\n/g, '<br>')
                    .replace(/# (.*)/g, '<h1 class="text-3xl font-bold mb-4 text-blue-800">$1</h1>')
                    .replace(/## (.*)/g, '<h2 class="text-2xl font-semibold mb-3 text-blue-700">$1</h2>')
                    .replace(/### (.*)/g, '<h3 class="text-xl font-medium mb-2 text-blue-600">$1</h3>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-blue-800">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                    .replace(/- (.*)/g, '<li class="mb-1">$1</li>')
                    .replace(/(<li.*<\/li>)/g, '<ul class="list-disc list-inside mb-4 space-y-1">$1</ul>')
                    .replace(/---/g, '<hr class="my-8 border-gray-200">')
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}