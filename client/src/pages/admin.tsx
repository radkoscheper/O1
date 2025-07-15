import { useState, useEffect } from "react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Plus, Edit, Eye, Save, LogIn, LogOut, Shield, Users, UserPlus, Trash2, Key, Upload, X, Image as ImageIcon, RotateCcw, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  // Users query voor admin functionaliteit
  const usersQuery = useQuery({
    queryKey: ['/api/users'],
    enabled: isAuthenticated && currentUser?.canManageUsers,
  });
  
  // Content queries
  const destinationsQuery = useQuery({
    queryKey: ['/api/admin/destinations'],
    enabled: isAuthenticated,
  });
  
  const guidesQuery = useQuery({
    queryKey: ['/api/admin/guides'],
    enabled: isAuthenticated,
  });

  // Recycle bin queries
  const deletedDestinationsQuery = useQuery({
    queryKey: ['/api/admin/destinations/deleted'],
    enabled: isAuthenticated && (currentUser?.canDeleteContent || currentUser?.canEditContent),
  });

  const deletedGuidesQuery = useQuery({
    queryKey: ['/api/admin/guides/deleted'],
    enabled: isAuthenticated && (currentUser?.canDeleteContent || currentUser?.canEditContent),
  });

  // Images trash query
  const trashedImagesQuery = useQuery({
    queryKey: ['/api/admin/images/trash'],
    enabled: isAuthenticated && (currentUser?.canDeleteContent || currentUser?.canEditContent),
  });

  // Site settings query
  const siteSettingsQuery = useQuery({
    queryKey: ['/api/site-settings'],
    enabled: isAuthenticated && currentUser?.role === 'admin',
  });

  // Template queries (admin only)
  const templatesQuery = useQuery({
    queryKey: ['/api/admin/templates'],
    enabled: isAuthenticated && currentUser?.role === 'admin',
  });

  // Pages queries
  const pagesQuery = useQuery({
    queryKey: ['/api/admin/pages'],
    enabled: isAuthenticated && currentUser?.canCreateContent,
  });

  const deletedPagesQuery = useQuery({
    queryKey: ['/api/admin/pages/deleted'],
    enabled: isAuthenticated && (currentUser?.canDeleteContent || currentUser?.canEditContent),
  });
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Content editing states
  const [showEditDestination, setShowEditDestination] = useState(false);
  const [showViewDestination, setShowViewDestination] = useState(false);
  const [showEditGuide, setShowEditGuide] = useState(false);
  const [showViewGuide, setShowViewGuide] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  const [editDestinationData, setEditDestinationData] = useState({
    name: '',
    description: '',
    image: '',
    alt: '',
    content: '',
    featured: false,
    published: false,
    ranking: 0
  });
  const [editGuideData, setEditGuideData] = useState({
    title: '',
    description: '',
    image: '',
    alt: '',
    content: '',
    featured: false,
    published: false,
    ranking: 0
  });

  // Template management state
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showEditTemplate, setShowEditTemplate] = useState(false);
  const [showViewTemplate, setShowViewTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [editTemplateData, setEditTemplateData] = useState<any>({});

  // Page management state
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [showEditPage, setShowEditPage] = useState(false);
  const [showViewPage, setShowViewPage] = useState(false);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [editPageData, setEditPageData] = useState<any>({});

  const { toast } = useToast();

  // Image upload helpers
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Important for session cookies
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload gefaald');
      }

      if (result.success) {
        toast({ 
          title: "Succes", 
          description: `Afbeelding ${file.name} succesvol geüpload` 
        });
        
        // Refresh trash query in case an image was moved to trash
        trashedImagesQuery.refetch();
        
        // Also refresh destination and guide queries to show updated images
        destinationsQuery.refetch();
        guidesQuery.refetch();
        
        return result.imagePath;
      } else {
        throw new Error(result.message || 'Upload gefaald');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({ 
        title: "Upload fout", 
        description: error instanceof Error ? error.message : "Er is een fout opgetreden tijdens uploaden",
        variant: "destructive" 
      });
      throw new Error(error instanceof Error ? error.message : "Upload gefaald");
    }
  };

  const [newDestination, setNewDestination] = useState({
    name: '',
    description: '',
    image: '',
    alt: '',
    content: '',
    featured: false,
    published: false,
    ranking: 0
  });

  const [newGuide, setNewGuide] = useState({
    title: '',
    description: '',
    image: '',
    alt: '',
    content: '',
    featured: false,
    published: false,
    ranking: 0
  });

  // Site settings state
  const [siteSettings, setSiteSettings] = useState({
    siteName: '',
    siteDescription: '',
    metaKeywords: '',
    favicon: '',
    backgroundImage: '',
    backgroundImageAlt: '',
    logoImage: '',
    logoImageAlt: '',
    socialMediaImage: '',
    customCSS: '',
    customJS: '',
    googleAnalyticsId: '',
  });

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentUser?.canManageUsers) {
      loadUsers();
    }
  }, [isAuthenticated, currentUser]);

  // Load site settings when query data changes
  useEffect(() => {
    if (siteSettingsQuery.data) {
      console.log('Loading site settings from query:', siteSettingsQuery.data);
      const newSettings = {
        siteName: siteSettingsQuery.data.siteName || '',
        siteDescription: siteSettingsQuery.data.siteDescription || '',
        metaKeywords: siteSettingsQuery.data.metaKeywords || '',
        favicon: siteSettingsQuery.data.favicon || '',
        backgroundImage: siteSettingsQuery.data.backgroundImage || '',
        backgroundImageAlt: siteSettingsQuery.data.backgroundImageAlt || '',
        logoImage: siteSettingsQuery.data.logoImage || '',
        logoImageAlt: siteSettingsQuery.data.logoImageAlt || '',
        socialMediaImage: siteSettingsQuery.data.socialMediaImage || '',
        customCSS: siteSettingsQuery.data.customCSS || '',
        customJS: siteSettingsQuery.data.customJS || '',
        googleAnalyticsId: siteSettingsQuery.data.googleAnalyticsId || '',
      };
      console.log('Setting new site settings state:', newSettings);
      setSiteSettings(newSettings);
    }
  }, [siteSettingsQuery.data]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
        if (data.user) {
          setCurrentUser(data.user);
        }
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

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Weet je zeker dat je deze gebruiker wilt verwijderen?')) return;
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast({ title: "Gebruiker verwijderd", description: "De gebruiker is succesvol verwijderd." });
        loadUsers();
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  // Handlers voor recycle bin acties
  const handleRestoreDestination = async (id: number) => {
    try {
      const response = await fetch(`/api/destinations/${id}/restore`, {
        method: 'PATCH',
        credentials: 'include',
      });
      
      if (response.ok) {
        toast({ title: "Succes", description: "Bestemming hersteld" });
        deletedDestinationsQuery.refetch();
        destinationsQuery.refetch();
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  const handlePermanentDeleteDestination = async (id: number) => {
    if (!confirm('Weet je zeker dat je deze bestemming permanent wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/destinations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        toast({ title: "Succes", description: "Bestemming permanent verwijderd" });
        deletedDestinationsQuery.refetch();
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  const handleRestoreGuide = async (id: number) => {
    try {
      const response = await fetch(`/api/guides/${id}/restore`, {
        method: 'PATCH',
        credentials: 'include',
      });
      
      if (response.ok) {
        toast({ title: "Succes", description: "Reisgids hersteld" });
        deletedGuidesQuery.refetch();
        guidesQuery.refetch();
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  const handlePermanentDeleteGuide = async (id: number) => {
    if (!confirm('Weet je zeker dat je deze reisgids permanent wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/guides/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        toast({ title: "Succes", description: "Reisgids permanent verwijderd" });
        deletedGuidesQuery.refetch();
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  // Image trash handlers
  const handleRestoreImage = async (trashName: string, originalName: string) => {
    try {
      const response = await fetch('/api/admin/images/restore', {
        method: 'POST',
        body: JSON.stringify({ trashName, originalName }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      if (response.ok) {
        toast({ title: "Succes", description: "Afbeelding succesvol hersteld" });
        trashedImagesQuery.refetch();
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  const handlePermanentDeleteImage = async (trashName: string) => {
    if (!confirm('Weet je zeker dat je deze afbeelding permanent wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/images/trash/${trashName}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        toast({ title: "Succes", description: "Afbeelding permanent verwijderd" });
        trashedImagesQuery.refetch();
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  const handleEmptyImageTrash = async () => {
    if (!trashedImagesQuery.data || trashedImagesQuery.data.length === 0) return;
    
    const confirmDelete = confirm(`Weet je zeker dat je alle ${trashedImagesQuery.data.length} afbeeldingen permanent wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`);
    if (!confirmDelete) return;
    
    try {
      for (const image of trashedImagesQuery.data) {
        await fetch(`/api/admin/images/trash/${image.trashName}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      }
      
      toast({ title: "Succes", description: "Alle afbeeldingen permanent verwijderd" });
      trashedImagesQuery.refetch();
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  // Soft delete handlers
  const handleSoftDeleteDestination = async (id: number) => {
    if (!confirm('Weet je zeker dat je deze bestemming naar de prullenbak wilt verplaatsen?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/destinations/${id}/soft-delete`, {
        method: 'PATCH',
        credentials: 'include',
      });
      
      if (response.ok) {
        toast({ title: "Succes", description: "Bestemming naar prullenbak verplaatst" });
        destinationsQuery.refetch();
        deletedDestinationsQuery.refetch();
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  const handleSoftDeleteGuide = async (id: number) => {
    if (!confirm('Weet je zeker dat je deze reisgids naar de prullenbak wilt verplaatsen?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/guides/${id}/soft-delete`, {
        method: 'PATCH',
        credentials: 'include',
      });
      
      if (response.ok) {
        toast({ title: "Succes", description: "Reisgids naar prullenbak verplaatst" });
        guidesQuery.refetch();
        deletedGuidesQuery.refetch();
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
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

  const handleCreateDestination = async () => {
    // Validate required fields
    if (!newDestination.name.trim()) {
      toast({
        title: "Validatie fout",
        description: "Naam is verplicht",
        variant: "destructive",
      });
      return;
    }
    
    if (!newDestination.description.trim()) {
      toast({
        title: "Validatie fout", 
        description: "Beschrijving is verplicht",
        variant: "destructive",
      });
      return;
    }
    
    if (!newDestination.image.trim()) {
      toast({
        title: "Validatie fout",
        description: "Afbeelding is verplicht",
        variant: "destructive",
      });
      return;
    }
    
    if (!newDestination.alt.trim()) {
      toast({
        title: "Validatie fout",
        description: "Alt-tekst is verplicht",
        variant: "destructive",
      });
      return;
    }
    
    if (!newDestination.content.trim()) {
      toast({
        title: "Validatie fout",
        description: "Content is verplicht",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating destination:', newDestination);
      
      const response = await fetch('/api/destinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newDestination),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Fout bij aanmaken bestemming');
      }

      const result = await response.json();
      
      toast({
        title: "Succes",
        description: `Bestemming "${newDestination.name}" is succesvol aangemaakt!`,
      });
      
      // Reset form
      setNewDestination({
        name: '',
        description: '',
        image: '',
        alt: '',
        content: '',
        featured: false,
        published: false,
        ranking: 0
      });

      // Refresh data
      destinationsQuery.refetch();
      
    } catch (error) {
      console.error('Error creating destination:', error);
      toast({
        title: "Fout",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden bij het aanmaken van de bestemming",
        variant: "destructive",
      });
    }
  };

  const handleCreateGuide = async () => {
    // Validate required fields
    if (!newGuide.title.trim()) {
      toast({
        title: "Validatie fout",
        description: "Titel is verplicht",
        variant: "destructive",
      });
      return;
    }
    
    if (!newGuide.description.trim()) {
      toast({
        title: "Validatie fout",
        description: "Beschrijving is verplicht", 
        variant: "destructive",
      });
      return;
    }
    
    if (!newGuide.image.trim()) {
      toast({
        title: "Validatie fout",
        description: "Afbeelding is verplicht",
        variant: "destructive",
      });
      return;
    }
    
    if (!newGuide.alt.trim()) {
      toast({
        title: "Validatie fout",
        description: "Alt-tekst is verplicht",
        variant: "destructive",
      });
      return;
    }
    
    if (!newGuide.content.trim()) {
      toast({
        title: "Validatie fout",
        description: "Content is verplicht",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating guide:', newGuide);
      
      const response = await fetch('/api/guides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newGuide),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Fout bij aanmaken reisgids');
      }

      const result = await response.json();
      
      toast({
        title: "Succes",
        description: `Reisgids "${newGuide.title}" is succesvol aangemaakt!`,
      });
      
      // Reset form
      setNewGuide({
        title: '',
        description: '',
        image: '',
        alt: '',
        content: '',
        featured: false,
        published: false,
        ranking: 0
      });

      // Refresh data
      guidesQuery.refetch();
      
    } catch (error) {
      console.error('Error creating guide:', error);
      toast({
        title: "Fout",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden bij het aanmaken van de reisgids",
        variant: "destructive",
      });
    }
  };

  const handleSaveSiteSettings = async () => {
    try {
      console.log('Saving site settings:', siteSettings);
      
      const response = await apiRequest('/api/admin/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(siteSettings),
      });

      const result = await response.json();
      console.log('Site settings saved successfully:', result);

      // Update local state immediately with saved values
      const updatedSettings = {
        siteName: result.siteName || '',
        siteDescription: result.siteDescription || '',
        metaKeywords: result.metaKeywords || '',
        favicon: result.favicon || '',
        backgroundImage: result.backgroundImage || '',
        backgroundImageAlt: result.backgroundImageAlt || '',
        logoImage: result.logoImage || '',
        logoImageAlt: result.logoImageAlt || '',
        socialMediaImage: result.socialMediaImage || '',
        customCSS: result.customCSS || '',
        customJS: result.customJS || '',
        googleAnalyticsId: result.googleAnalyticsId || '',
      };
      console.log('Updating local state with:', updatedSettings);
      setSiteSettings(updatedSettings);

      toast({
        title: "Succes",
        description: "Site-instellingen zijn opgeslagen!",
      });

      // Refresh site settings query and invalidate cache
      queryClient.invalidateQueries({ queryKey: ['/api/site-settings'] });
      await siteSettingsQuery.refetch();
      
    } catch (error) {
      console.error('Error saving site settings:', error);
      toast({
        title: "Fout",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden bij het opslaan",
        variant: "destructive",
      });
    }
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
          <TabsList className={`grid w-full ${currentUser?.canManageUsers && currentUser?.role === 'admin' ? 'grid-cols-10' : currentUser?.canManageUsers ? 'grid-cols-8' : 'grid-cols-8'}`}>
            {/* Alleen tonen wat de gebruiker mag doen */}
            {currentUser?.canCreateContent && <TabsTrigger value="destinations">Bestemmingen</TabsTrigger>}
            {currentUser?.canCreateContent && <TabsTrigger value="guides">Reisgidsen</TabsTrigger>}
            {currentUser?.canCreateContent && <TabsTrigger value="pages">📄 Pagina's</TabsTrigger>}
            {currentUser?.canCreateContent && <TabsTrigger value="new-destination">Nieuwe Bestemming</TabsTrigger>}
            {currentUser?.canCreateContent && <TabsTrigger value="new-guide">Nieuwe Gids</TabsTrigger>}
            {currentUser?.role === 'admin' && <TabsTrigger value="templates">🎨 Templates</TabsTrigger>}
            {(currentUser?.canDeleteContent || currentUser?.canEditContent) && (
              <TabsTrigger value="recycle">
                <Trash2 className="h-4 w-4 mr-2" />
                Prullenbak
              </TabsTrigger>
            )}
            {currentUser?.canManageUsers && (
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Gebruikers
              </TabsTrigger>
            )}
            {currentUser?.role === 'admin' && (
              <TabsTrigger value="site-settings">
                <Shield className="h-4 w-4 mr-2" />
                Site Instellingen
              </TabsTrigger>
            )}
            <TabsTrigger value="account">
              <Shield className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Bestaande Bestemmingen - alleen voor gebruikers met create/edit permissies */}
          {currentUser?.canCreateContent && (
            <TabsContent value="destinations" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Bestemmingen ({destinationsQuery.data?.length || 0})</h2>
                  <p className="text-gray-600">Beheer al je Polish reisbestemmingen</p>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(destinationsQuery.data || []).map((destination: any) => (
                <Card key={destination.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg leading-tight">{destination.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">#{destination.ranking || 0}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {destination.featured && <Badge variant="secondary" className="text-xs">⭐ Featured</Badge>}
                        <Badge variant={destination.published ? "default" : "outline"} className="text-xs">
                          {destination.published ? "✅ Gepubliceerd" : "📝 Concept"}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm line-clamp-2">{destination.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedDestination(destination);
                          setEditDestinationData({
                            name: destination.name,
                            description: destination.description,
                            image: destination.image,
                            alt: destination.alt || '',
                            content: destination.content || '',
                            featured: destination.featured,
                            published: destination.published,
                            ranking: destination.ranking || 0
                          });
                          setShowEditDestination(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Bewerken
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedDestination(destination);
                          setShowViewDestination(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Bekijken
                      </Button>
                      {currentUser?.canDeleteContent && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSoftDeleteDestination(destination.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          🗑️ Naar Prullenbak
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            </TabsContent>
          )}

          {/* Bestaande Reisgidsen */}
          {currentUser?.canCreateContent && (
            <TabsContent value="guides" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Reisgidsen ({guidesQuery.data?.length || 0})</h2>
                  <p className="text-gray-600">Beheer al je Polish reisgidsen en tips</p>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(guidesQuery.data || []).map((guide: any) => (
                <Card key={guide.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg leading-tight">{guide.title}</CardTitle>
                        <Badge variant="outline" className="text-xs">#{guide.ranking || 0}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {guide.featured && <Badge variant="secondary" className="text-xs">⭐ Featured</Badge>}
                        <Badge variant={guide.published ? "default" : "outline"} className="text-xs">
                          {guide.published ? "✅ Gepubliceerd" : "📝 Concept"}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm line-clamp-2">{guide.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedGuide(guide);
                          setEditGuideData({
                            title: guide.title,
                            description: guide.description,
                            image: guide.image,
                            alt: guide.alt || '',
                            content: guide.content || '',
                            featured: guide.featured,
                            published: guide.published,
                            ranking: guide.ranking || 0
                          });
                          setShowEditGuide(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Bewerken
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedGuide(guide);
                          setShowViewGuide(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Bekijken
                      </Button>
                      {currentUser?.canDeleteContent && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSoftDeleteGuide(guide.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          🗑️ Naar Prullenbak
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            </TabsContent>
          )}

          {/* Nieuwe Bestemming */}
          {currentUser?.canCreateContent && (
            <TabsContent value="new-destination" className="space-y-4">
              <Card>
              <CardHeader>
                <CardTitle>Nieuwe Bestemming Toevoegen</CardTitle>
                <CardDescription>Voeg een nieuwe bestemming toe aan je website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="dest-name">Naam <span className="text-red-500">*</span></Label>
                    <Input
                      id="dest-name"
                      placeholder="Bijv. Warsaw"
                      value={newDestination.name}
                      onChange={(e) => setNewDestination({...newDestination, name: e.target.value})}
                      className={!newDestination.name.trim() ? "border-red-300" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dest-ranking">Ranking (volgorde)</Label>
                    <Input
                      id="dest-ranking"
                      type="number"
                      placeholder="0"
                      value={newDestination.ranking || 0}
                      onChange={(e) => setNewDestination({...newDestination, ranking: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <ImageUploadField
                    label="Afbeelding *"
                    value={newDestination.image}
                    onChange={(value) => setNewDestination({...newDestination, image: value})}
                    placeholder="/images/warsaw.jpg"
                    fileName={newDestination.name}
                  />
                </div>
                
                <div>
                  <Label htmlFor="dest-alt">Alt-tekst *</Label>
                  <Input
                    id="dest-alt"
                    placeholder="Bijv. Krakow marktplein"
                    value={newDestination.alt}
                    onChange={(e) => setNewDestination({...newDestination, alt: e.target.value})}
                    className={!newDestination.alt.trim() ? "border-red-300" : ""}
                  />
                </div>
                
                <div>
                  <Label htmlFor="dest-description">Beschrijving <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="dest-description"
                    placeholder="Korte beschrijving van de bestemming..."
                    value={newDestination.description}
                    onChange={(e) => setNewDestination({...newDestination, description: e.target.value})}
                    className={!newDestination.description.trim() ? "border-red-300" : ""}
                  />
                </div>

                <div>
                  <Label htmlFor="dest-content">Content (Markdown) <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="dest-content"
                    placeholder="# Titel&#10;&#10;Volledige beschrijving in Markdown formaat..."
                    className={`min-h-32 ${!newDestination.content.trim() ? "border-red-300" : ""}`}
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
          )}

          {/* Nieuwe Reisgids */}
          {currentUser?.canCreateContent && (
            <TabsContent value="new-guide" className="space-y-4">
              <Card>
              <CardHeader>
                <CardTitle>Nieuwe Reisgids Toevoegen</CardTitle>
                <CardDescription>Voeg een nieuwe reisgids toe aan je website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="guide-title">Titel <span className="text-red-500">*</span></Label>
                    <Input
                      id="guide-title"
                      placeholder="Bijv. Weekend in Warsaw"
                      value={newGuide.title}
                      onChange={(e) => setNewGuide({...newGuide, title: e.target.value})}
                      className={!newGuide.title.trim() ? "border-red-300" : ""}
                    />
                  </div>
                  <ImageUploadField
                    label="Afbeelding *"
                    value={newGuide.image}
                    onChange={(value) => setNewGuide({...newGuide, image: value})}
                    placeholder="/images/warsaw-guide.jpg"
                    fileName={newGuide.title}
                  />
                </div>
                
                <div>
                  <Label htmlFor="guide-alt">Alt-tekst *</Label>
                  <Input
                    id="guide-alt"
                    placeholder="Bijv. Krakow marktplein reisgids"
                    value={newGuide.alt}
                    onChange={(e) => setNewGuide({...newGuide, alt: e.target.value})}
                    className={!newGuide.alt.trim() ? "border-red-300" : ""}
                  />
                </div>
                
                <div>
                  <Label htmlFor="guide-description">Beschrijving <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="guide-description"
                    placeholder="Korte beschrijving van de reisgids..."
                    value={newGuide.description}
                    onChange={(e) => setNewGuide({...newGuide, description: e.target.value})}
                    className={!newGuide.description.trim() ? "border-red-300" : ""}
                  />
                </div>

                <div>
                  <Label htmlFor="guide-content">Content (Markdown) <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="guide-content"
                    placeholder="# Titel&#10;&#10;Volledige reisgids in Markdown formaat..."
                    className={`min-h-32 ${!newGuide.content.trim() ? "border-red-300" : ""}`}
                    value={newGuide.content}
                    onChange={(e) => setNewGuide({...newGuide, content: e.target.value})}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="guide-ranking">Ranking</Label>
                    <Input
                      id="guide-ranking"
                      type="number"
                      placeholder="0"
                      value={newGuide.ranking}
                      onChange={(e) => setNewGuide({...newGuide, ranking: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch 
                      id="guide-featured"
                      checked={newGuide.featured}
                      onCheckedChange={(checked) => setNewGuide({...newGuide, featured: checked})}
                    />
                    <Label htmlFor="guide-featured">Featured</Label>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
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
          )}

          {/* Gebruikersbeheer Tab - alleen voor admins */}
          {currentUser?.canManageUsers && (
            <TabsContent value="users" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Gebruikersbeheer ({usersQuery.data?.length || 0})</h2>
                  <p className="text-gray-600">Beheer gebruikers en hun rechten</p>
                </div>
                <Button onClick={() => setShowCreateUser(true)} className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nieuwe Gebruiker
                </Button>
              </div>
              
              <div className="grid gap-6">
                {usersQuery.data?.map((user) => (
                  <Card key={user.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <CardTitle className="text-lg">{user.username}</CardTitle>
                            <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'editor' ? 'default' : 'secondary'}>
                              {user.role === 'admin' ? '👑 Administrator' : user.role === 'editor' ? '✏️ Editor' : '👤 Gebruiker'}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {user.canCreateContent && <Badge variant="outline" className="text-xs">✏️ Aanmaken</Badge>}
                            {user.canEditContent && <Badge variant="outline" className="text-xs">📝 Bewerken</Badge>}
                            {user.canDeleteContent && <Badge variant="outline" className="text-xs">🗑️ Verwijderen</Badge>}
                            {user.canManageUsers && <Badge variant="outline" className="text-xs">👥 Gebruikers</Badge>}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditUser(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Bewerken
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowResetPassword(true);
                            }}
                          >
                            <Key className="h-4 w-4 mr-1" />
                            Reset
                          </Button>
                          {user.id !== currentUser.id && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Verwijderen
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}

          {/* Account Tab - voor alle gebruikers */}
          <TabsContent value="account" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Mijn Account</h2>
                <p className="text-gray-600">Beheer je persoonlijke account instellingen</p>
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Account Informatie</CardTitle>
                  <CardDescription>Je huidige account gegevens</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Gebruikersnaam</Label>
                    <div className="font-medium">{currentUser?.username}</div>
                  </div>
                  <div>
                    <Label>Rol</Label>
                    <div className="font-medium">
                      {currentUser?.role === 'admin' ? 'Administrator' : 'Gebruiker'}
                    </div>
                  </div>
                  <div>
                    <Label>Permissies</Label>
                    <div className="flex gap-2 mt-2">
                      {currentUser?.canCreateContent && <Badge variant="outline">Aanmaken</Badge>}
                      {currentUser?.canEditContent && <Badge variant="outline">Bewerken</Badge>}
                      {currentUser?.canDeleteContent && <Badge variant="outline">Verwijderen</Badge>}
                      {currentUser?.canManageUsers && <Badge variant="default">Gebruikersbeheer</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Wachtwoord Wijzigen</CardTitle>
                  <CardDescription>Wijzig je huidige wachtwoord</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChangePasswordForm />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recycle Bin Tab */}
          {(currentUser?.canDeleteContent || currentUser?.canEditContent) && (
            <TabsContent value="recycle" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Prullenbak</h2>
                  <p className="text-gray-600">Hier kun je verwijderde content bekijken en herstellen</p>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {/* Verwijderde Bestemmingen */}
                <Card>
                  <CardHeader>
                    <CardTitle>Verwijderde Bestemmingen</CardTitle>
                    <CardDescription>Items die naar de prullenbak zijn verplaatst</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-500">
                      Verwijderde bestemmingen verschijnen hier
                    </div>
                    <div className="space-y-2">
                      {deletedDestinationsQuery.data && deletedDestinationsQuery.data.length > 0 ? (
                        deletedDestinationsQuery.data.map((destination: any) => (
                          <div key={destination.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{destination.name}</h4>
                                <p className="text-sm text-gray-500 truncate">{destination.description}</p>
                                <p className="text-xs text-gray-400">
                                  Verwijderd: {new Date(destination.deleted_at).toLocaleDateString('nl-NL')}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleRestoreDestination(destination.id)}
                                  title="Herstellen"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handlePermanentDeleteDestination(destination.id)}
                                  title="Permanent verwijderen"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <Trash2 className="h-8 w-8 mx-auto mb-2" />
                          <p>Geen verwijderde bestemmingen</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Verwijderde Reisgidsen */}
                <Card>
                  <CardHeader>
                    <CardTitle>Verwijderde Reisgidsen</CardTitle>
                    <CardDescription>Items die naar de prullenbak zijn verplaatst</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-500">
                      Verwijderde reisgidsen verschijnen hier
                    </div>
                    <div className="space-y-2">
                      {deletedGuidesQuery.data && deletedGuidesQuery.data.length > 0 ? (
                        deletedGuidesQuery.data.map((guide: any) => (
                          <div key={guide.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{guide.title}</h4>
                                <p className="text-sm text-gray-500 truncate">{guide.description}</p>
                                <p className="text-xs text-gray-400">
                                  Verwijderd: {new Date(guide.deleted_at).toLocaleDateString('nl-NL')}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleRestoreGuide(guide.id)}
                                  title="Herstellen"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handlePermanentDeleteGuide(guide.id)}
                                  title="Permanent verwijderen"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <Trash2 className="h-8 w-8 mx-auto mb-2" />
                          <p>Geen verwijderde reisgidsen</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Verwijderde Afbeeldingen */}
              <Card>
                <CardHeader>
                  <CardTitle>Gearchiveerde & Verwijderde Afbeeldingen</CardTitle>
                  <CardDescription>Afbeeldingen die automatisch gearchiveerd zijn bij upload of handmatig verwijderd</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {trashedImagesQuery.data && trashedImagesQuery.data.length > 0 ? (
                      trashedImagesQuery.data.map((image: any) => (
                        <div key={image.trashName} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{image.originalName}</h4>
                              <p className="text-sm text-gray-500">{image.trashName}</p>
                              <p className="text-xs text-gray-400">
                                {image.reason === "Auto-archived before new upload" ? "Gearchiveerd" : "Verwijderd"}: {new Date(image.movedAt).toLocaleDateString('nl-NL', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleRestoreImage(image.trashName, image.originalName)}
                                title="Afbeelding herstellen"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handlePermanentDeleteImage(image.trashName)}
                                title="Permanent verwijderen"
                              >
                                <Trash className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                        <p>Geen verwijderde afbeeldingen</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prullenbak Acties</CardTitle>
                  <CardDescription>Beheer je verwijderde content en afbeeldingen</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Content Acties</h4>
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={(deletedDestinationsQuery.data?.length || 0) === 0 && (deletedGuidesQuery.data?.length || 0) === 0}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Alle Content Herstellen ({(deletedDestinationsQuery.data?.length || 0) + (deletedGuidesQuery.data?.length || 0)})
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          disabled={(deletedDestinationsQuery.data?.length || 0) === 0 && (deletedGuidesQuery.data?.length || 0) === 0}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Content Prullenbak Leegmaken
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Afbeelding Acties</h4>
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!trashedImagesQuery.data || trashedImagesQuery.data.length === 0}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Alle Afbeeldingen Herstellen ({trashedImagesQuery.data?.length || 0})
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleEmptyImageTrash()}
                          disabled={!trashedImagesQuery.data || trashedImagesQuery.data.length === 0 || !currentUser?.canDeleteContent}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Afbeelding Prullenbak Leegmaken
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 pt-2 border-t">
                    <p>💡 Tip: Verwijderde content en afbeeldingen blijven beschikbaar voor herstel</p>
                    <p>🔄 Afbeeldingen worden automatisch gearchiveerd voordat nieuwe uploads conflicten veroorzaken</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Site Settings - alleen voor admins */}
          {currentUser?.role === 'admin' && (
            <TabsContent value="site-settings" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Site Instellingen</h2>
                  <p className="text-gray-600">Beheer de algemene instellingen van je website</p>
                </div>
                <Button 
                  onClick={handleSaveSiteSettings} 
                  className="flex items-center gap-2"
                  disabled={siteSettingsQuery.isLoading}
                >
                  <Save className="h-4 w-4" />
                  {siteSettingsQuery.isLoading ? 'Laden...' : 'Instellingen Opslaan'}
                </Button>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Basis Site Informatie */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basis Informatie</CardTitle>
                    <CardDescription>Algemene site instellingen en metadata</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Naam</Label>
                      <Input
                        id="siteName"
                        value={siteSettings.siteName}
                        onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})}
                        placeholder="Ontdek Polen"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="siteDescription">Site Beschrijving</Label>
                      <Textarea
                        id="siteDescription"
                        value={siteSettings.siteDescription}
                        onChange={(e) => setSiteSettings({...siteSettings, siteDescription: e.target.value})}
                        placeholder="Ontdek de mooiste plekken van Polen"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="metaKeywords">Meta Keywords</Label>
                      <Input
                        id="metaKeywords"
                        value={siteSettings.metaKeywords}
                        onChange={(e) => setSiteSettings({...siteSettings, metaKeywords: e.target.value})}
                        placeholder="Polen, reizen, vakantie, bestemmingen"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Afbeeldingen */}
                <Card>
                  <CardHeader>
                    <CardTitle>Site Afbeeldingen</CardTitle>
                    <CardDescription>Logo, achtergrond en social media afbeeldingen</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ImageUploadField
                      label="Achtergrond Afbeelding"
                      value={siteSettings.backgroundImage}
                      onChange={(imagePath) => setSiteSettings({...siteSettings, backgroundImage: imagePath})}
                      placeholder="Header achtergrond afbeelding"
                      fileName="header-background"
                    />
                    
                    <div className="space-y-2">
                      <Label htmlFor="backgroundImageAlt">Achtergrond Alt Tekst</Label>
                      <Input
                        id="backgroundImageAlt"
                        value={siteSettings.backgroundImageAlt}
                        onChange={(e) => setSiteSettings({...siteSettings, backgroundImageAlt: e.target.value})}
                        placeholder="Beschrijving van de achtergrond afbeelding"
                      />
                    </div>
                    
                    <ImageUploadField
                      label="Logo Afbeelding"
                      value={siteSettings.logoImage}
                      onChange={(imagePath) => setSiteSettings({...siteSettings, logoImage: imagePath})}
                      placeholder="Site logo"
                      fileName="site-logo"
                    />
                    
                    <div className="space-y-2">
                      <Label htmlFor="logoImageAlt">Logo Alt Tekst</Label>
                      <Input
                        id="logoImageAlt"
                        value={siteSettings.logoImageAlt}
                        onChange={(e) => setSiteSettings({...siteSettings, logoImageAlt: e.target.value})}
                        placeholder="Logo beschrijving"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Social Media & SEO */}
                <Card>
                  <CardHeader>
                    <CardTitle>Social Media & SEO</CardTitle>
                    <CardDescription>Instellingen voor social media sharing en SEO</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ImageUploadField
                      label="Social Media Afbeelding"
                      value={siteSettings.socialMediaImage}
                      onChange={(imagePath) => setSiteSettings({...siteSettings, socialMediaImage: imagePath})}
                      placeholder="Afbeelding voor social media sharing"
                      fileName="social-media-image"
                    />
                    
                    <div className="space-y-2">
                      <Label htmlFor="favicon">Favicon URL</Label>
                      <Input
                        id="favicon"
                        value={siteSettings.favicon}
                        onChange={(e) => setSiteSettings({...siteSettings, favicon: e.target.value})}
                        placeholder="/favicon.ico"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                      <Input
                        id="googleAnalyticsId"
                        value={siteSettings.googleAnalyticsId}
                        onChange={(e) => setSiteSettings({...siteSettings, googleAnalyticsId: e.target.value})}
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Custom Code */}
                <Card>
                  <CardHeader>
                    <CardTitle>Custom Code</CardTitle>
                    <CardDescription>Aangepaste CSS en JavaScript code</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customCSS">Custom CSS</Label>
                      <Textarea
                        id="customCSS"
                        value={siteSettings.customCSS}
                        onChange={(e) => setSiteSettings({...siteSettings, customCSS: e.target.value})}
                        placeholder="/* Aangepaste CSS styling */"
                        rows={5}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="customJS">Custom JavaScript</Label>
                      <Textarea
                        id="customJS"
                        value={siteSettings.customJS}
                        onChange={(e) => setSiteSettings({...siteSettings, customJS: e.target.value})}
                        placeholder="// Aangepaste JavaScript code"
                        rows={5}
                        className="font-mono text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="text-sm text-gray-600 pt-4 border-t">
                <p>💡 Tip: Gebruik de achtergrond afbeelding voor een mooie header op je website</p>
                <p>🎨 Custom CSS en JavaScript worden automatisch geladen op alle pagina's</p>
                <p>📊 Google Analytics tracking wordt actief zodra je een geldig tracking ID invult</p>
              </div>
            </TabsContent>
          )}

          {/* Pages Tab Content */}
          {currentUser?.canCreateContent && (
            <TabsContent value="pages" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-semibold">Pagina's</h2>
                  <p className="text-gray-600">Beheer je statische pagina's</p>
                </div>
                <Button variant="outline" onClick={() => setShowCreatePage(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe Pagina
                </Button>
              </div>
              
              <PageManagement />
            </TabsContent>
          )}

          {/* Templates Tab Content - Admin Only */}
          {currentUser?.role === 'admin' && (
            <TabsContent value="templates" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-semibold">Templates</h2>
                  <p className="text-gray-600">Beheer templates voor pagina's en content</p>
                </div>
                <Button variant="outline" onClick={() => setShowCreateTemplate(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe Template
                </Button>
              </div>
              
              <TemplateManagement />
            </TabsContent>
          )}

        </Tabs>

        {/* Create User Dialog */}
        {showCreateUser && (
          <CreateUserDialog 
            open={showCreateUser} 
            onOpenChange={setShowCreateUser}
            onUserCreated={() => {
              usersQuery.refetch();
              setShowCreateUser(false);
            }}
          />
        )}

        {/* Edit User Dialog */}
        {showEditUser && selectedUser && (
          <EditUserDialog 
            open={showEditUser} 
            onOpenChange={setShowEditUser}
            user={selectedUser}
            onUserUpdated={() => {
              usersQuery.refetch();
              setShowEditUser(false);
            }}
          />
        )}

        {/* Reset Password Dialog */}
        {showResetPassword && selectedUser && (
          <ResetPasswordDialog 
            open={showResetPassword} 
            onOpenChange={setShowResetPassword}
            user={selectedUser}
            onPasswordReset={() => {
              setShowResetPassword(false);
            }}
          />
        )}

        {/* Edit Destination Dialog */}
        {showEditDestination && selectedDestination && (
          <EditDestinationDialog 
            open={showEditDestination} 
            onOpenChange={setShowEditDestination}
            destination={selectedDestination}
            editData={editDestinationData}
            setEditData={setEditDestinationData}
            onSave={() => {
              destinationsQuery.refetch();
              setShowEditDestination(false);
            }}
          />
        )}

        {/* View Destination Dialog */}
        {showViewDestination && selectedDestination && (
          <ViewDestinationDialog 
            open={showViewDestination} 
            onOpenChange={setShowViewDestination}
            destination={selectedDestination}
          />
        )}

        {/* Edit Guide Dialog */}
        {showEditGuide && selectedGuide && (
          <EditGuideDialog 
            open={showEditGuide} 
            onOpenChange={setShowEditGuide}
            guide={selectedGuide}
            editData={editGuideData}
            setEditData={setEditGuideData}
            onSave={() => {
              guidesQuery.refetch();
              setShowEditGuide(false);
            }}
          />
        )}

        {/* View Guide Dialog */}
        {showViewGuide && selectedGuide && (
          <ViewGuideDialog 
            open={showViewGuide} 
            onOpenChange={setShowViewGuide}
            guide={selectedGuide}
          />
        )}
      </div>
    </div>
  );
}

// Herbruikbare afbeelding upload component
function ImageUploadField({ label, value, onChange, placeholder, fileName }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  fileName?: string;
}) {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Valideer bestandstype
    if (!file.type.startsWith('image/')) {
      toast({ title: "Fout", description: "Selecteer een geldig afbeelding bestand", variant: "destructive" });
      return;
    }

    // Valideer bestandsgrootte (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Fout", description: "Afbeelding moet kleiner zijn dan 5MB", variant: "destructive" });
      return;
    }

    try {
      // Gebruik de echte upload functie
      const formData = new FormData();
      formData.append('image', file);
      
      // Voeg de gewenste bestandsnaam toe als het beschikbaar is
      if (fileName && fileName.trim()) {
        formData.append('fileName', fileName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload gefaald');
      }

      if (result.success) {
        toast({ 
          title: "Succes", 
          description: `Afbeelding succesvol geüpload als ${result.fileName || file.name}` 
        });
        onChange(result.imagePath);
      } else {
        throw new Error(result.message || 'Upload gefaald');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({ 
        title: "Upload fout", 
        description: error instanceof Error ? error.message : "Er is een fout opgetreden tijdens uploaden",
        variant: "destructive" 
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange('')}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      {value && (
        <div className="text-sm text-gray-500">
          Huidige afbeelding: {value}
        </div>
      )}
    </div>
  );
}

// Component voor nieuwe gebruiker aanmaken
function CreateUserDialog({ open, onOpenChange, onUserCreated }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user',
    canCreateContent: true,
    canEditContent: true,
    canDeleteContent: false,
    canManageUsers: false,
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({ title: "Succes", description: "Gebruiker succesvol aangemaakt" });
        onUserCreated();
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nieuwe Gebruiker Aanmaken</DialogTitle>
          <DialogDescription>
            Voeg een nieuwe gebruiker toe aan het systeem
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Gebruikersnaam</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Wachtwoord</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Gebruiker</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            <Label>Permissies</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="canCreateContent"
                  checked={formData.canCreateContent}
                  onCheckedChange={(checked) => setFormData({ ...formData, canCreateContent: checked })}
                />
                <Label htmlFor="canCreateContent">Content aanmaken</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="canEditContent"
                  checked={formData.canEditContent}
                  onCheckedChange={(checked) => setFormData({ ...formData, canEditContent: checked })}
                />
                <Label htmlFor="canEditContent">Content bewerken</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="canDeleteContent"
                  checked={formData.canDeleteContent}
                  onCheckedChange={(checked) => setFormData({ ...formData, canDeleteContent: checked })}
                />
                <Label htmlFor="canDeleteContent">Content verwijderen</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="canManageUsers"
                  checked={formData.canManageUsers}
                  onCheckedChange={(checked) => setFormData({ ...formData, canManageUsers: checked })}
                />
                <Label htmlFor="canManageUsers">Gebruikers beheren</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit">Aanmaken</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Component voor gebruiker bewerken
function EditUserDialog({ open, onOpenChange, user, onUserUpdated }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  user: any;
  onUserUpdated: () => void;
}) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    role: user?.role || 'user',
    canCreateContent: user?.canCreateContent || false,
    canEditContent: user?.canEditContent || false,
    canDeleteContent: user?.canDeleteContent || false,
    canManageUsers: user?.canManageUsers || false,
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({ title: "Succes", description: "Gebruiker succesvol bijgewerkt" });
        onUserUpdated();
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gebruiker Bewerken</DialogTitle>
          <DialogDescription>
            Bewerk de gegevens van {user?.username}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Gebruikersnaam</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Gebruiker</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            <Label>Permissies</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="canCreateContent"
                  checked={formData.canCreateContent}
                  onCheckedChange={(checked) => setFormData({ ...formData, canCreateContent: checked })}
                />
                <Label htmlFor="canCreateContent">Content aanmaken</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="canEditContent"
                  checked={formData.canEditContent}
                  onCheckedChange={(checked) => setFormData({ ...formData, canEditContent: checked })}
                />
                <Label htmlFor="canEditContent">Content bewerken</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="canDeleteContent"
                  checked={formData.canDeleteContent}
                  onCheckedChange={(checked) => setFormData({ ...formData, canDeleteContent: checked })}
                />
                <Label htmlFor="canDeleteContent">Content verwijderen</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="canManageUsers"
                  checked={formData.canManageUsers}
                  onCheckedChange={(checked) => setFormData({ ...formData, canManageUsers: checked })}
                />
                <Label htmlFor="canManageUsers">Gebruikers beheren</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit">Bijwerken</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Component voor wachtwoord reset
function ResetPasswordDialog({ open, onOpenChange, user, onPasswordReset }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  user: any;
  onPasswordReset: () => void;
}) {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast({ title: "Fout", description: "Wachtwoorden komen niet overeen", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({ title: "Succes", description: "Wachtwoord succesvol gereset" });
        onPasswordReset();
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Wachtwoord Reset</DialogTitle>
          <DialogDescription>
            Reset het wachtwoord voor {user?.username}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nieuw Wachtwoord</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Bevestig Wachtwoord</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit">Reset Wachtwoord</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Component voor bestemming bewerken
function EditDestinationDialog({ open, onOpenChange, destination, editData, setEditData, onSave }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  destination: any;
  editData: any;
  setEditData: (data: any) => void;
  onSave: () => void;
}) {
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest(`/api/destinations/${destination.id}`, {
        method: 'PUT',
        body: JSON.stringify(editData)
      });
      
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/destinations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/destinations'] });
      
      toast({ title: "Succes", description: "Bestemming succesvol bijgewerkt" });
      onSave();
    } catch (error) {
      console.error('Error updating destination:', error);
      toast({ title: "Fout", description: "Er is een fout opgetreden bij het bijwerken van de bestemming", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bestemming Bewerken</DialogTitle>
          <DialogDescription>
            Bewerk de gegevens van {destination?.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Naam</Label>
            <Input
              id="name"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ranking">Ranking (volgorde - lagere nummers eerst)</Label>
            <Input
              id="ranking"
              type="number"
              value={editData.ranking || 0}
              onChange={(e) => setEditData({ ...editData, ranking: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Beschrijving</Label>
            <Textarea
              id="description"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              required
            />
          </div>
          <ImageUploadField
            label="Afbeelding"
            value={editData.image}
            onChange={(value) => setEditData({ ...editData, image: value })}
            placeholder="/images/bestemming.jpg"
            fileName={editData.name}
          />
          <div className="space-y-2">
            <Label htmlFor="alt">Alt-tekst</Label>
            <Input
              id="alt"
              value={editData.alt}
              onChange={(e) => setEditData({ ...editData, alt: e.target.value })}
              placeholder="Beschrijving van de afbeelding"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown)</Label>
            <Textarea
              id="content"
              className="min-h-32"
              value={editData.content}
              onChange={(e) => setEditData({ ...editData, content: e.target.value })}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="featured"
                checked={editData.featured}
                onCheckedChange={(checked) => setEditData({ ...editData, featured: checked })}
              />
              <Label htmlFor="featured">Featured</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="published"
                checked={editData.published}
                onCheckedChange={(checked) => setEditData({ ...editData, published: checked })}
              />
              <Label htmlFor="published">Gepubliceerd</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit">Opslaan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Component voor bestemming bekijken
function ViewDestinationDialog({ open, onOpenChange, destination }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  destination: any;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{destination?.name}</DialogTitle>
          <DialogDescription>
            Vooruitblik van de bestemming
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {destination?.image && (
            <div className="w-full">
              <h3 className="font-semibold mb-2">Afbeelding</h3>
              <div className="relative h-48 w-full rounded-md overflow-hidden border">
                <img 
                  src={destination.image} 
                  alt={destination.name || 'Bestemming afbeelding'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full bg-gray-200 items-center justify-center">
                  <span className="text-gray-500">Afbeelding kon niet geladen worden: {destination.image}</span>
                </div>
              </div>
            </div>
          )}
          <div>
            <h3 className="font-semibold mb-2">Beschrijving</h3>
            <p className="text-gray-700">{destination?.description}</p>
          </div>
          {destination?.content && (
            <div>
              <h3 className="font-semibold mb-2">Content</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm">{destination.content}</pre>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            {destination?.featured && <Badge variant="secondary">Featured</Badge>}
            <Badge variant={destination?.published ? "default" : "outline"}>
              {destination?.published ? "Gepubliceerd" : "Concept"}
            </Badge>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Sluiten</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Component voor reisgids bewerken
function EditGuideDialog({ open, onOpenChange, guide, editData, setEditData, onSave }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  guide: any;
  editData: any;
  setEditData: (data: any) => void;
  onSave: () => void;
}) {
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest(`/api/guides/${guide.id}`, {
        method: 'PUT',
        body: JSON.stringify(editData)
      });
      
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/guides'] });
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
      
      toast({ title: "Succes", description: "Reisgids succesvol bijgewerkt" });
      onSave();
    } catch (error) {
      console.error('Error updating guide:', error);
      toast({ title: "Fout", description: "Er is een fout opgetreden bij het bijwerken van de reisgids", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reisgids Bewerken</DialogTitle>
          <DialogDescription>
            Bewerk de gegevens van {guide?.title}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Beschrijving</Label>
            <Textarea
              id="description"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              required
            />
          </div>
          <ImageUploadField
            label="Afbeelding"
            value={editData.image}
            onChange={(value) => setEditData({ ...editData, image: value })}
            placeholder="/images/reisgids.jpg"
            fileName={editData.title}
          />
          <div className="space-y-2">
            <Label htmlFor="alt">Alt-tekst</Label>
            <Input
              id="alt"
              value={editData.alt}
              onChange={(e) => setEditData({ ...editData, alt: e.target.value })}
              placeholder="Beschrijving van de afbeelding"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown)</Label>
            <Textarea
              id="content"
              className="min-h-32"
              value={editData.content}
              onChange={(e) => setEditData({ ...editData, content: e.target.value })}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="featured"
                checked={editData.featured}
                onCheckedChange={(checked) => setEditData({ ...editData, featured: checked })}
              />
              <Label htmlFor="featured">Featured</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="published"
                checked={editData.published}
                onCheckedChange={(checked) => setEditData({ ...editData, published: checked })}
              />
              <Label htmlFor="published">Gepubliceerd</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit">Opslaan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Component voor reisgids bekijken
function ViewGuideDialog({ open, onOpenChange, guide }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  guide: any;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{guide?.title}</DialogTitle>
          <DialogDescription>
            Vooruitblik van de reisgids
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {guide?.image && (
            <div className="w-full">
              <h3 className="font-semibold mb-2">Afbeelding</h3>
              <div className="relative h-48 w-full rounded-md overflow-hidden border">
                <img 
                  src={guide.image} 
                  alt={guide.title || 'Reisgids afbeelding'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full bg-gray-200 items-center justify-center">
                  <span className="text-gray-500">Afbeelding kon niet geladen worden: {guide.image}</span>
                </div>
              </div>
            </div>
          )}
          <div>
            <h3 className="font-semibold mb-2">Beschrijving</h3>
            <p className="text-gray-700">{guide?.description}</p>
          </div>
          {guide?.content && (
            <div>
              <h3 className="font-semibold mb-2">Content</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm">{guide.content}</pre>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            {guide?.featured && <Badge variant="secondary">Featured</Badge>}
            <Badge variant={guide?.published ? "default" : "outline"}>
              {guide?.published ? "Gepubliceerd" : "Concept"}
            </Badge>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Sluiten</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Component voor wachtwoord wijzigen
function ChangePasswordForm() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast({ title: "Fout", description: "Wachtwoorden komen niet overeen", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({ title: "Succes", description: "Wachtwoord succesvol gewijzigd" });
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Huidig Wachtwoord</Label>
        <Input
          id="currentPassword"
          type="password"
          value={formData.currentPassword}
          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">Nieuw Wachtwoord</Label>
        <Input
          id="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Bevestig Nieuw Wachtwoord</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
        />
      </div>
      <Button type="submit" className="w-full">Wachtwoord Wijzigen</Button>
    </form>
  );
}

// Template Management Components (placeholder voor toekomstige implementatie)
function TemplateManagement() {
  const templatesQuery = useQuery({ queryKey: ['/api/admin/templates'] });

  if (templatesQuery.isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p>Templates laden...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const templates = templatesQuery.data || [];

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{templates.length}</p>
              <p className="text-sm text-gray-600">Totaal Templates</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{templates.filter(t => t.isActive).length}</p>
              <p className="text-sm text-gray-600">Actieve Templates</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{templates.filter(t => !t.isActive).length}</p>
              <p className="text-sm text-gray-600">Inactieve Templates</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
          <CardDescription>Beheer je content templates met variabelen ondersteuning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nog geen templates aangemaakt</p>
              </div>
            ) : (
              templates.map((template: any) => (
                <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={template.isActive ? "default" : "outline"}>
                        {template.isActive ? "Actief" : "Inactief"}
                      </Badge>
                      <Badge variant="outline">
                        Gebruikt door {template.pageCount || 0} pagina's
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Template Variables Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Beschikbare Variabelen:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-blue-800">
              <code>&#123;&#123;title&#125;&#125;</code>
              <code>&#123;&#123;description&#125;&#125;</code>
              <code>&#123;&#123;metaTitle&#125;&#125;</code>
              <code>&#123;&#123;metaDescription&#125;&#125;</code>
              <code>&#123;&#123;metaKeywords&#125;&#125;</code>
              <code>&#123;&#123;slug&#125;&#125;</code>
              <code>&#123;&#123;author&#125;&#125;</code>
              <code>&#123;&#123;date&#125;&#125;</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PageManagement() {
  const pagesQuery = useQuery({ queryKey: ['/api/admin/pages'] });
  const deletedPagesQuery = useQuery({ queryKey: ['/api/admin/pages/deleted'] });
  const [showRecycleBin, setShowRecycleBin] = useState(false);

  if (pagesQuery.isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p>Pagina's laden...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pages = pagesQuery.data || [];
  const deletedPages = deletedPagesQuery.data || [];

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{pages.length}</p>
              <p className="text-sm text-gray-600">Actieve Pagina's</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{pages.filter(p => p.published).length}</p>
              <p className="text-sm text-gray-600">Gepubliceerd</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{deletedPages.length}</p>
              <p className="text-sm text-gray-600">In Prullenbak</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pages List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Pagina's</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowRecycleBin(!showRecycleBin)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {showRecycleBin ? 'Actieve Pagina\'s' : 'Prullenbak'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!showRecycleBin ? (
            <div className="space-y-4">
              {pages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nog geen pagina's aangemaakt</p>
                </div>
              ) : (
                pages.map((page: any) => (
                  <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{page.title}</h3>
                      <p className="text-sm text-gray-600">/{page.slug}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={page.published ? "default" : "outline"}>
                          {page.published ? "Gepubliceerd" : "Concept"}
                        </Badge>
                        {page.featured && <Badge variant="secondary">Featured</Badge>}
                        <Badge variant="outline">{page.template}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {deletedPages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Prullenbak is leeg</p>
                </div>
              ) : (
                deletedPages.map((page: any) => (
                  <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-700">{page.title}</h3>
                      <p className="text-sm text-gray-500">Verwijderd op {new Date(page.deletedAt).toLocaleDateString('nl-NL')}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Herstel
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}