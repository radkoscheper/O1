import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { destinations } from "@/data/destinations";
import { guides } from "@/data/guides";
import { Plus, Edit, Eye, Save, LogIn, LogOut, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const { toast } = useToast();

  const [newDestination, setNewDestination] = useState({
    name: '',
    description: '',
    image: '',
    content: '',
    featured: false,
    published: false
  });

  const [newGuide, setNewGuide] = useState({
    title: '',
    description: '',
    image: '',
    content: '',
    featured: false,
    published: false
  });

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
      } else {
        // If API fails, enable simple mode (no database)
        setIsSimpleMode(true);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // If API fails, enable simple mode (no database)
      setIsSimpleMode(true);
      setIsAuthenticated(true);
      toast({
        title: "Eenvoudige modus",
        description: "Database niet beschikbaar. Lokale modus actief.",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setShowLogin(false);
        toast({
          title: "Ingelogd",
          description: "Welkom in het admin panel!",
        });
      } else {
        toast({
          title: "Login gefaald",
          description: "Ongeldige gebruikersnaam of wachtwoord",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login fout",
        description: "Er is een fout opgetreden",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      setIsAuthenticated(false);
      toast({
        title: "Uitgelogd",
        description: "Je bent succesvol uitgelogd",
      });
    } catch (error) {
      // Fallback for simple mode
      setIsAuthenticated(false);
    }
  };

  const handleCreateDestination = () => {
    console.log('Creating destination:', newDestination);
    toast({
      title: "Bestemming aangemaakt",
      description: `${newDestination.name} is toegevoegd aan de lijst.`,
    });
    // Reset form
    setNewDestination({
      name: '',
      description: '',
      image: '',
      content: '',
      featured: false,
      published: false
    });
  };

  const handleCreateGuide = () => {
    console.log('Creating guide:', newGuide);
    toast({
      title: "Reisgids aangemaakt",
      description: `${newGuide.title} is toegevoegd aan de lijst.`,
    });
    // Reset form
    setNewGuide({
      title: '',
      description: '',
      image: '',
      content: '',
      featured: false,
      published: false
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Login
            </CardTitle>
            <CardDescription>
              Log in om toegang te krijgen tot het CMS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Gebruikersnaam</Label>
              <Input
                id="username"
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                placeholder="Voer gebruikersnaam in"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Wachtwoord</Label>
              <Input
                id="password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                placeholder="Voer wachtwoord in"
              />
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full"
              disabled={!loginData.username || !loginData.password}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Inloggen
            </Button>
            
            {!isSimpleMode && (
              <div className="text-center">
                <Button 
                  variant="link" 
                  onClick={() => {setIsSimpleMode(true); setIsAuthenticated(true);}}
                  className="text-sm text-gray-500"
                >
                  Doorgaan zonder database (lokale modus)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CMS Admin Panel</h1>
            <div className="text-gray-600">
              Beheer je content voor Ontdek Polen
              {isSimpleMode && <Badge variant="secondary" className="ml-2">Lokale Modus</Badge>}
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Uitloggen
          </Button>
        </div>

        <Tabs defaultValue="destinations" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="destinations">Bestemmingen</TabsTrigger>
            <TabsTrigger value="guides">Reisgidsen</TabsTrigger>
            <TabsTrigger value="new-destination">Nieuwe Bestemming</TabsTrigger>
            <TabsTrigger value="new-guide">Nieuwe Gids</TabsTrigger>
          </TabsList>

          {/* Bestaande Bestemmingen */}
          <TabsContent value="destinations" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Bestemmingen ({destinations.length})</h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {destinations.map((destination) => (
                <Card key={destination.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{destination.name}</CardTitle>
                      <div className="flex gap-2">
                        {destination.featured && <Badge variant="secondary">Featured</Badge>}
                        <Badge variant={destination.published ? "default" : "outline"}>
                          {destination.published ? "Gepubliceerd" : "Concept"}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{destination.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Bewerken
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Bekijken
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bestaande Reisgidsen */}
          <TabsContent value="guides" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Reisgidsen ({guides.length})</h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => (
                <Card key={guide.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                      <div className="flex gap-2">
                        {guide.featured && <Badge variant="secondary">Featured</Badge>}
                        <Badge variant={guide.published ? "default" : "outline"}>
                          {guide.published ? "Gepubliceerd" : "Concept"}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{guide.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Bewerken
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Bekijken
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Nieuwe Bestemming */}
          <TabsContent value="new-destination" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nieuwe Bestemming Toevoegen</CardTitle>
                <CardDescription>Voeg een nieuwe bestemming toe aan je website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="dest-name">Naam</Label>
                    <Input
                      id="dest-name"
                      placeholder="Bijv. Warsaw"
                      value={newDestination.name}
                      onChange={(e) => setNewDestination({...newDestination, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dest-image">Afbeelding pad</Label>
                    <Input
                      id="dest-image"
                      placeholder="/images/warsaw.jpg"
                      value={newDestination.image}
                      onChange={(e) => setNewDestination({...newDestination, image: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="dest-description">Beschrijving</Label>
                  <Textarea
                    id="dest-description"
                    placeholder="Korte beschrijving van de bestemming..."
                    value={newDestination.description}
                    onChange={(e) => setNewDestination({...newDestination, description: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="dest-content">Content (Markdown)</Label>
                  <Textarea
                    id="dest-content"
                    placeholder="# Titel&#10;&#10;Volledige beschrijving in Markdown formaat..."
                    className="min-h-32"
                    value={newDestination.content}
                    onChange={(e) => setNewDestination({...newDestination, content: e.target.value})}
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="dest-featured"
                      checked={newDestination.featured}
                      onCheckedChange={(checked) => setNewDestination({...newDestination, featured: checked})}
                    />
                    <Label htmlFor="dest-featured">Featured</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="dest-published"
                      checked={newDestination.published}
                      onCheckedChange={(checked) => setNewDestination({...newDestination, published: checked})}
                    />
                    <Label htmlFor="dest-published">Publiceren</Label>
                  </div>
                </div>

                <Button onClick={handleCreateDestination} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Bestemming Aanmaken
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nieuwe Reisgids */}
          <TabsContent value="new-guide" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nieuwe Reisgids Toevoegen</CardTitle>
                <CardDescription>Voeg een nieuwe reisgids toe aan je website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="guide-title">Titel</Label>
                    <Input
                      id="guide-title"
                      placeholder="Bijv. Weekend in Warsaw"
                      value={newGuide.title}
                      onChange={(e) => setNewGuide({...newGuide, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="guide-image">Afbeelding pad</Label>
                    <Input
                      id="guide-image"
                      placeholder="/images/warsaw-guide.jpg"
                      value={newGuide.image}
                      onChange={(e) => setNewGuide({...newGuide, image: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="guide-description">Beschrijving</Label>
                  <Textarea
                    id="guide-description"
                    placeholder="Korte beschrijving van de reisgids..."
                    value={newGuide.description}
                    onChange={(e) => setNewGuide({...newGuide, description: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="guide-content">Content (Markdown)</Label>
                  <Textarea
                    id="guide-content"
                    placeholder="# Titel&#10;&#10;Volledige reisgids in Markdown formaat..."
                    className="min-h-32"
                    value={newGuide.content}
                    onChange={(e) => setNewGuide({...newGuide, content: e.target.value})}
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="guide-featured"
                      checked={newGuide.featured}
                      onCheckedChange={(checked) => setNewGuide({...newGuide, featured: checked})}
                    />
                    <Label htmlFor="guide-featured">Featured</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="guide-published"
                      checked={newGuide.published}
                      onCheckedChange={(checked) => setNewGuide({...newGuide, published: checked})}
                    />
                    <Label htmlFor="guide-published">Publiceren</Label>
                  </div>
                </div>

                <Button onClick={handleCreateGuide} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Reisgids Aanmaken
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}