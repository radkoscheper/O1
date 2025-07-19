import { useState, useEffect, useRef } from "react";
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
import { Plus, Edit, Eye, Save, LogIn, LogOut, Shield, Users, UserPlus, Trash2, Key, Upload, X, Image as ImageIcon, RotateCcw, Trash, Copy, Crop as CropIcon, Move, RotateCw, Check, RefreshCw, FolderOpen, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/uploadUtils";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { CreateHighlightDialog, EditHighlightDialog, ViewHighlightDialog, CreateDestinationDialog, CreateGuideDialog, CreateActivityDialog, EditActivityDialog, ViewActivityDialog } from '@/components/highlights-dialogs';

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

  // Homepage pages query (filtered pages shown on homepage)
  const homepagePagesQuery = useQuery({
    queryKey: ['/api/pages'],
    enabled: isAuthenticated && currentUser?.canCreateContent,
  });

  const deletedPagesQuery = useQuery({
    queryKey: ['/api/admin/pages/deleted'],
    enabled: isAuthenticated && (currentUser?.canDeleteContent || currentUser?.canEditContent),
  });

  // Highlights queries (admin only)
  const highlightsQuery = useQuery({
    queryKey: ['/api/admin/highlights'],
    enabled: isAuthenticated && currentUser?.role === 'admin',
  });

  const activitiesQuery = useQuery({
    queryKey: ['/api/admin/activities'],
    enabled: isAuthenticated,
  });

  // Search configuration queries
  const searchConfigsQuery = useQuery({
    queryKey: ['/api/admin/search-configs'],
    enabled: isAuthenticated && currentUser?.canEditContent,
    retry: 1,
    staleTime: 0,
    onError: (error) => {
      console.error('Search configs query error:', error);
    },
    onSuccess: (data) => {
      console.log('Search configs loaded successfully:', data);
    }
  });
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);


  
  // Content editing states
  const [showCreateDestination, setShowCreateDestination] = useState(false);
  const [showEditDestination, setShowEditDestination] = useState(false);
  const [showViewDestination, setShowViewDestination] = useState(false);
  const [showCreateGuide, setShowCreateGuide] = useState(false);
  const [showEditGuide, setShowEditGuide] = useState(false);
  const [showViewGuide, setShowViewGuide] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  const [editDestinationData, setEditDestinationData] = useState({
    name: '',
    location: '',
    description: '',
    image: '',
    alt: '',
    content: '',
    link: '',
    featured: false,
    published: false,
    showOnHomepage: false,
    ranking: 0
  });
  const [editGuideData, setEditGuideData] = useState({
    title: '',
    description: '',
    image: '',
    alt: '',
    content: '',
    link: '',
    featured: false,
    published: false,
    showOnHomepage: false,
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

  // Highlights management state
  const [showCreateHighlight, setShowCreateHighlight] = useState(false);
  const [showEditHighlight, setShowEditHighlight] = useState(false);
  const [showViewHighlight, setShowViewHighlight] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<any>(null);
  const [editHighlightData, setEditHighlightData] = useState({
    name: '',
    iconPath: '',
    category: 'general',
    ranking: 0,
    active: true,
    showOnHomepage: true
  });

  // Activities management state
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [showEditActivity, setShowEditActivity] = useState(false);
  const [showViewActivity, setShowViewActivity] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [newActivity, setNewActivity] = useState({
    name: '',
    location: '',
    category: '',
    activityType: '',
    description: '',
    image: '',
    alt: '',
    content: '',
    link: '',
    featured: false,
    published: true,
    ranking: 0
  });
  const [createActivityData, setCreateActivityData] = useState({
    name: '',
    location: '',
    category: '',
    activityType: '',
    description: '',
    image: '',
    alt: '',
    content: '',
    link: '',
    featured: false,
    published: false,
    ranking: 0
  });

  const [editActivityData, setEditActivityData] = useState({
    name: '',
    location: '',
    category: '',
    activityType: '',
    description: '',
    image: '',
    alt: '',
    content: '',
    link: '',
    featured: false,
    published: false,
    ranking: 0
  });

  // Search configuration management state
  const [showCreateSearchConfig, setShowCreateSearchConfig] = useState(false);
  const [showEditSearchConfig, setShowEditSearchConfig] = useState(false);
  const [showViewSearchConfig, setShowViewSearchConfig] = useState(false);
  const [selectedSearchConfig, setSelectedSearchConfig] = useState<any>(null);
  const [searchConfigData, setSearchConfigData] = useState({
    context: '',
    placeholderText: '',
    searchScope: 'destinations',
    enableLocationFilter: false,
    enableCategoryFilter: false,
    customInstructions: '',
    redirectPattern: '',
    isActive: true
  });

  const { toast } = useToast();

  // Image upload helpers
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const result = await uploadFile({ file, type: 'image' });
      
      // Refresh queries when upload succeeds
      trashedImagesQuery.refetch();
      destinationsQuery.refetch();
      guidesQuery.refetch();
      
      return result.imagePath || '';
    } catch (error) {
      throw error; // Error handling is done in uploadFile utility
    }
  };

  const [newDestination, setNewDestination] = useState({
    name: '',
    location: '',
    description: '',
    image: '',
    alt: '',
    content: '',
    link: '',
    featured: false,
    published: false,
    ranking: 0
  });

  // Location filter state
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [guideFilter, setGuideFilter] = useState<string>('all');
  const [activityLocationFilter, setActivityLocationFilter] = useState<string>('all');
  const [activityCategoryFilter, setActivityCategoryFilter] = useState<string>('all');

  // Get unique locations from destinations for filter
  const getUniqueLocations = () => {
    if (!destinationsQuery.data) return [];
    const locations = destinationsQuery.data
      .map((dest: any) => dest.location)
      .filter((location: string) => location && location.trim() !== '')
      .filter((location: string, index: number, arr: string[]) => arr.indexOf(location) === index)
      .sort();
    return locations;
  };

  // Get unique titles from guides for filter (first word)
  const getUniqueGuideCategories = () => {
    if (!guidesQuery.data) return [];
    const categories = guidesQuery.data
      .map((guide: any) => {
        const firstWord = guide.title.split(' ')[0];
        return firstWord || 'Overig';
      })
      .filter((category: string, index: number, arr: string[]) => arr.indexOf(category) === index)
      .sort();
    return categories;
  };

  // Filter destinations by location
  const getFilteredDestinations = () => {
    if (!destinationsQuery.data) return [];
    if (locationFilter === 'all') return destinationsQuery.data;
    return destinationsQuery.data.filter((dest: any) => dest.location === locationFilter);
  };

  // Filter guides by category
  const getFilteredGuides = () => {
    if (!guidesQuery.data) return [];
    if (guideFilter === 'all') return guidesQuery.data;
    return guidesQuery.data.filter((guide: any) => {
      const firstWord = guide.title.split(' ')[0] || 'Overig';
      return firstWord === guideFilter;
    });
  };

  // Get unique locations from activities for filter
  const getUniqueActivityLocations = () => {
    if (!activitiesQuery.data) return [];
    const locations = activitiesQuery.data
      .map((activity: any) => activity.location)
      .filter((location: string) => location && location.trim() !== '')
      .filter((location: string, index: number, arr: string[]) => arr.indexOf(location) === index)
      .sort();
    return locations;
  };

  // Get unique categories from activities for filter
  const getUniqueActivityCategories = () => {
    if (!activitiesQuery.data) return [];
    const categories = activitiesQuery.data
      .map((activity: any) => activity.category)
      .filter((category: string) => category && category.trim() !== '')
      .filter((category: string, index: number, arr: string[]) => arr.indexOf(category) === index)
      .sort();
    return categories;
  };

  // Filter activities by location
  const getFilteredActivities = () => {
    if (!activitiesQuery.data) return [];
    let filtered = activitiesQuery.data;
    
    if (activityLocationFilter !== 'all') {
      filtered = filtered.filter((activity: any) => activity.location === activityLocationFilter);
    }
    
    if (activityCategoryFilter !== 'all') {
      filtered = filtered.filter((activity: any) => activity.category === activityCategoryFilter);
    }
    
    return filtered;
  };



  // Site settings state
  const [siteSettings, setSiteSettings] = useState({
    siteName: '',
    siteDescription: '',
    metaKeywords: '',
    favicon: '',
    faviconEnabled: true,
    backgroundImage: '',
    backgroundImageAlt: '',
    logoImage: '',
    logoImageAlt: '',
    socialMediaImage: '',
    headerOverlayEnabled: false,
    headerOverlayOpacity: 30,
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
        faviconEnabled: siteSettingsQuery.data.faviconEnabled ?? true,
        backgroundImage: siteSettingsQuery.data.backgroundImage || '',
        backgroundImageAlt: siteSettingsQuery.data.backgroundImageAlt || '',
        logoImage: siteSettingsQuery.data.logoImage || '',
        logoImageAlt: siteSettingsQuery.data.logoImageAlt || '',
        socialMediaImage: siteSettingsQuery.data.socialMediaImage || '',
        headerOverlayEnabled: siteSettingsQuery.data.headerOverlayEnabled || false,
        headerOverlayOpacity: siteSettingsQuery.data.headerOverlayOpacity || 30,
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

  // Highlights handlers
  const handleDeleteHighlight = async (id: number) => {
    if (!confirm('Weet je zeker dat je deze highlight wilt verwijderen?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/highlights/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        toast({ title: "Succes", description: "Highlight verwijderd" });
        highlightsQuery.refetch();
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  // Search configuration handlers
  const handleDeleteSearchConfig = async (id: number) => {
    if (!confirm('Weet je zeker dat je deze zoek configuratie wilt verwijderen?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/search-configs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        toast({ title: "Succes", description: "Zoek configuratie verwijderd" });
        searchConfigsQuery.refetch();
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  const handleCreateSearchConfig = async (data: any) => {
    // Validatie van verplichte velden
    if (!data.context || !data.placeholderText) {
      toast({ 
        title: "Validatiefout", 
        description: "Context en placeholder tekst zijn verplicht", 
        variant: "destructive" 
      });
      return;
    }

    try {
      console.log('Creating search config with data:', data);
      const response = await fetch('/api/admin/search-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Created search config:', result);
        toast({ title: "Succes", description: "Zoek configuratie aangemaakt" });
        searchConfigsQuery.refetch();
        setShowCreateSearchConfig(false);
        setSearchConfigData({
          context: '',
          placeholderText: '',
          searchScope: 'destinations',
          enableLocationFilter: false,
          enableCategoryFilter: false,
          customInstructions: '',
          redirectPattern: '',
          isActive: true
        });
      } else {
        const error = await response.json();
        console.error('Error creating search config:', error);
        toast({ title: "Fout", description: error.message || "Onbekende fout", variant: "destructive" });
      }
    } catch (error) {
      console.error('Network error creating search config:', error);
      toast({ title: "Fout", description: "Er is een netwerkfout opgetreden", variant: "destructive" });
    }
  };

  const handleUpdateSearchConfig = async (id: number, data: any) => {
    try {
      const response = await fetch(`/api/admin/search-configs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        toast({ title: "Succes", description: "Zoek configuratie bijgewerkt" });
        searchConfigsQuery.refetch();
        setShowEditSearchConfig(false);
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  const handleToggleHighlightHomepage = async (id: number, showOnHomepage: boolean) => {
    try {
      const response = await fetch(`/api/admin/highlights/${id}/homepage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ showOnHomepage }),
      });
      
      if (response.ok) {
        toast({ 
          title: "Succes", 
          description: showOnHomepage ? "Highlight toegevoegd aan homepage" : "Highlight verwijderd van homepage" 
        });
        highlightsQuery.refetch();
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  const handleTogglePageHomepage = async (id: number, published: boolean) => {
    try {
      const response = await fetch(`/api/admin/pages/${id}/homepage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ published }),
      });
      
      if (response.ok) {
        toast({ 
          title: "Succes", 
          description: published ? "Pagina toegevoegd aan homepage" : "Pagina verwijderd van homepage" 
        });
        homepagePagesQuery.refetch();
        pagesQuery.refetch();
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  const handleToggleDestinationHomepage = async (id: number, showOnHomepage: boolean) => {
    try {
      const response = await fetch(`/api/admin/destinations/${id}/homepage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ showOnHomepage }),
      });
      
      if (response.ok) {
        toast({ 
          title: "Succes", 
          description: showOnHomepage ? "Bestemming toegevoegd aan homepage" : "Bestemming verwijderd van homepage" 
        });
        destinationsQuery.refetch();
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  const handleToggleGuideHomepage = async (id: number, showOnHomepage: boolean) => {
    try {
      const response = await fetch(`/api/admin/guides/${id}/homepage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ showOnHomepage }),
      });
      
      if (response.ok) {
        toast({ 
          title: "Succes", 
          description: showOnHomepage ? "Reisgids toegevoegd aan homepage" : "Reisgids verwijderd van homepage" 
        });
        guidesQuery.refetch();
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
        location: '',
        description: '',
        image: '',
        alt: '',
        content: '',
        link: '',
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
        faviconEnabled: result.faviconEnabled ?? true,
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
          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 p-2 bg-muted/30">
            {/* Eerste regel: Bestemmingen, Activiteiten, Hoogtepunten, Reisgidsen */}
            {currentUser?.canCreateContent && (
              <>
                <TabsTrigger value="destinations" className="flex items-center gap-2">
                  🏔️ Bestemmingen
                </TabsTrigger>
                <TabsTrigger value="activities" className="flex items-center gap-2">
                  🎯 Activiteiten
                </TabsTrigger>
              </>
            )}
            {currentUser?.role === 'admin' && (
              <TabsTrigger value="highlights" className="flex items-center gap-2">
                ✨ Hoogtepunten
              </TabsTrigger>
            )}
            {currentUser?.canCreateContent && (
              <TabsTrigger value="guides" className="flex items-center gap-2">
                📖 Reisgidsen
              </TabsTrigger>
            )}

            {/* Tweede regel: Pagina's en Templates */}
            <div className="w-full" />
            {currentUser?.canCreateContent && (
              <TabsTrigger value="pages" className="flex items-center gap-2">
                📄 Pagina's
              </TabsTrigger>
            )}
            {currentUser?.canCreateContent && (
              <TabsTrigger value="homepage-overview" className="flex items-center gap-2">
                🏠 Homepage Overview
              </TabsTrigger>
            )}
            {currentUser?.canCreateContent && (
              <TabsTrigger value="ontdek-meer" className="flex items-center gap-2">
                📄 Ontdek Meer
              </TabsTrigger>
            )}
            {currentUser?.role === 'admin' && (
              <TabsTrigger value="templates" className="flex items-center gap-2">
                🎨 Templates
              </TabsTrigger>
            )}
            
            {/* Derde regel: Beheer & Instellingen */}
            <div className="w-full" />
            {currentUser?.canEditContent && (
              <TabsTrigger value="search-configs" className="flex items-center gap-2">
                🔍 Zoekbalk CMS
              </TabsTrigger>
            )}
            {(currentUser?.canDeleteContent || currentUser?.canEditContent) && (
              <TabsTrigger value="recycle" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Prullenbak
              </TabsTrigger>
            )}
            {currentUser?.canManageUsers && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Gebruikers
              </TabsTrigger>
            )}
            {currentUser?.role === 'admin' && (
              <TabsTrigger value="site-settings" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Site Instellingen
              </TabsTrigger>
            )}
            <TabsTrigger value="account" className="flex items-center gap-2">
              👤 Account
            </TabsTrigger>
          </TabsList>

          {/* Content Manager - Unified CMS for Bestemmingen + Ontdek Meer */}
          {false && currentUser?.canCreateContent && (
            <TabsContent value="content-manager" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Unified Content Manager</h2>
                  <p className="text-gray-600">Beheer bestemmingen en ontdek meer content in één interface</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setShowCreateDestination(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nieuwe Bestemming
                  </Button>
                  <Button onClick={() => setShowCreatePage(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nieuwe Pagina
                  </Button>
                </div>
              </div>

              {/* Content Type Tabs */}
              <Tabs defaultValue="all-content" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="all-content" className="flex items-center gap-2">
                    📋 Alle Content
                  </TabsTrigger>
                  <TabsTrigger value="pages-only" className="flex items-center gap-2">
                    📄 Ontdek Meer ({pagesQuery.data?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="homepage-content" className="flex items-center gap-2">
                    🏠 Homepage Content
                  </TabsTrigger>
                </TabsList>

                {/* All Content View - Unified Table */}
                <TabsContent value="all-content" className="space-y-4">
                  <div className="rounded-lg border bg-white">
                    <div className="p-4 border-b bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">Alle Content Items</h3>
                          <p className="text-sm text-gray-600">Bestemmingen en Ontdek Meer pagina's in één overzicht</p>
                        </div>
                        <Select value={locationFilter} onValueChange={setLocationFilter}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter op locatie" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Alle locaties</SelectItem>
                            {getUniqueLocations().map((location) => (
                              <SelectItem key={location} value={location}>
                                📍 {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titel</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Homepage</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ranking</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acties</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {/* Destinations */}
                          {getFilteredDestinations().map((destination: any) => (
                            <tr key={`dest-${destination.id}`} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <Badge className="bg-blue-100 text-blue-800">🏔️ Bestemming</Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-medium">{destination.name}</div>
                                  {destination.location && (
                                    <div className="text-xs text-blue-600 mb-1">📍 {destination.location}</div>
                                  )}
                                  <div className="text-sm text-gray-500">{destination.description?.substring(0, 80)}...</div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col gap-1">
                                  <Badge variant={destination.published ? "default" : "outline"} className="text-xs w-fit">
                                    {destination.published ? "✅ Gepubliceerd" : "📝 Concept"}
                                  </Badge>
                                  {destination.featured && <Badge variant="secondary" className="text-xs w-fit">⭐ Featured</Badge>}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Button 
                                  size="sm"
                                  variant={destination.showOnHomepage ? "default" : "outline"}
                                  onClick={() => handleToggleDestinationHomepage(destination.id, !destination.showOnHomepage)}
                                  className="text-xs"
                                >
                                  {destination.showOnHomepage ? "🏠 Op Homepage" : "➕ Naar Homepage"}
                                </Button>
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant="outline" className="text-xs">#{destination.ranking || 0}</Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedDestination(destination);
                                      setEditDestinationData({
                                        name: destination.name,
                                        location: destination.location || '',
                                        description: destination.description,
                                        image: destination.image,
                                        alt: destination.alt || '',
                                        content: destination.content || '',
                                        link: destination.link || '',
                                        featured: destination.featured,
                                        published: destination.published,
                                        showOnHomepage: destination.showOnHomepage || false,
                                        ranking: destination.ranking || 0
                                      });
                                      setShowEditDestination(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  {currentUser?.canDeleteContent && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleSoftDeleteDestination(destination.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                          
                          {/* Pages */}
                          {(pagesQuery.data || []).map((page: any) => (
                            <tr key={`page-${page.id}`} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <Badge className="bg-green-100 text-green-800">📄 Ontdek Meer</Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-medium">{page.title}</div>
                                  <div className="text-sm text-gray-500">{page.metaDescription?.substring(0, 80)}...</div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col gap-1">
                                  <Badge variant={page.published ? "default" : "outline"} className="text-xs w-fit">
                                    {page.published ? "✅ Gepubliceerd" : "📝 Concept"}
                                  </Badge>
                                  {page.featured && <Badge variant="secondary" className="text-xs w-fit">⭐ Featured</Badge>}
                                  <Badge variant="outline" className="text-xs w-fit bg-gray-100">{page.template}</Badge>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Button 
                                  size="sm"
                                  variant={page.published ? "default" : "outline"}
                                  onClick={() => handleTogglePageHomepage(page.id, !page.published)}
                                  className="text-xs"
                                >
                                  {page.published ? "🏠 Op Homepage" : "➕ Naar Homepage"}
                                </Button>
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant="outline" className="text-xs">#{page.ranking || 0}</Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedPage(page);
                                      setEditPageData({
                                        title: page.title,
                                        slug: page.slug,
                                        content: page.content,
                                        metaTitle: page.metaTitle || '',
                                        metaDescription: page.metaDescription || '',
                                        metaKeywords: page.metaKeywords || '',
                                        template: page.template,
                                        headerImage: page.headerImage || '',
                                        headerImageAlt: page.headerImageAlt || '',
                                        highlightSections: page.highlightSections || '',
                                        published: page.published,
                                        featured: page.featured,
                                        ranking: page.ranking || 0
                                      });
                                      setShowEditPage(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  {currentUser?.canDeleteContent && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleSoftDeletePage(page.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>



                {/* Pages Only View */}
                <TabsContent value="pages-only" className="space-y-4">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {(pagesQuery.data || []).map((page: any) => (
                      <Card key={page.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg leading-tight">{page.title}</CardTitle>
                              <Badge variant="outline" className="text-xs">#{page.ranking || 0}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {page.featured && <Badge variant="secondary" className="text-xs">⭐ Featured</Badge>}
                              <Badge variant={page.published ? "default" : "outline"} className="text-xs">
                                {page.published ? "✅ Gepubliceerd" : "📝 Concept"}
                              </Badge>
                              {page.published && <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">🏠 Homepage</Badge>}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 gap-2">
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                {page.template}
                              </span>
                              <span>
                                {new Date(page.createdAt).toLocaleDateString('nl-NL')}
                              </span>
                            </div>
                            <CardDescription className="text-sm line-clamp-2">{page.metaDescription}</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-col gap-3">
                            <Button 
                              size="sm" 
                              variant={page.published ? "default" : "outline"}
                              onClick={() => handleTogglePageHomepage(page.id, !page.published)}
                              className="w-full"
                            >
                              {page.published ? "🏠 Op Homepage" : "➕ Naar Homepage"}
                            </Button>
                            
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedPage(page);
                                  setEditPageData({
                                    title: page.title,
                                    slug: page.slug,
                                    content: page.content,
                                    metaTitle: page.metaTitle || '',
                                    metaDescription: page.metaDescription || '',
                                    metaKeywords: page.metaKeywords || '',
                                    template: page.template,
                                    headerImage: page.headerImage || '',
                                    headerImageAlt: page.headerImageAlt || '',
                                    highlightSections: page.highlightSections || '',
                                    published: page.published,
                                    featured: page.featured,
                                    ranking: page.ranking || 0
                                  });
                                  setShowEditPage(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Bewerken
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedPage(page);
                                  setShowViewPage(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Bekijken
                              </Button>
                              {page.published && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.open(`/${page.slug}`, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Live
                                </Button>
                              )}
                              {currentUser?.canDeleteContent && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleSoftDeletePage(page.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  🗑️ Naar Prullenbak
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Homepage Content View */}
                <TabsContent value="homepage-content" className="space-y-4">
                  <div className="grid gap-4">
                    {/* Homepage Bestemmingen */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3">Homepage Bestemmingen ({destinationsQuery.data?.filter((d: any) => d.showOnHomepage).length || 0})</h4>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {(destinationsQuery.data || []).filter((d: any) => d.showOnHomepage).map((destination: any) => (
                          <div key={destination.id} className="bg-white p-3 rounded border border-blue-200">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-blue-900">{destination.name}</h5>
                              <Badge className="bg-blue-600 text-xs">#{destination.ranking || 0}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{destination.description?.substring(0, 60)}...</p>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleToggleDestinationHomepage(destination.id, false)}
                                className="text-xs"
                              >
                                ❌ Verwijderen
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedDestination(destination);
                                  setShowEditDestination(true);
                                }}
                                className="text-xs"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Homepage Ontdek Meer */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-3">Homepage Ontdek Meer ({pagesQuery.data?.filter((p: any) => p.published).length || 0})</h4>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {(pagesQuery.data || []).filter((p: any) => p.published).map((page: any) => (
                          <div key={page.id} className="bg-white p-3 rounded border border-green-200">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-green-900">{page.title}</h5>
                              <Badge className="bg-green-600 text-xs">#{page.ranking || 0}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{page.metaDescription?.substring(0, 60)}...</p>
                            <div className="flex gap-1 mb-2">
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">{page.template}</span>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleTogglePageHomepage(page.id, false)}
                                className="text-xs"
                              >
                                ❌ Depubliceren
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedPage(page);
                                  setShowEditPage(true);
                                }}
                                className="text-xs"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
          )}

          {/* Content Manager 1 - Bestemmingen + Highlights */}
          {false && currentUser?.canCreateContent && (
            <TabsContent value="content-manager-1" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Content Manager 1 - Bestemmingen & Highlights</h2>
                  <p className="text-gray-600">Unified interface voor bestemmingen en highlights beheer</p>
                </div>
              </div>

              <Tabs defaultValue="all-content" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all-content">Overzicht</TabsTrigger>
                  <TabsTrigger value="highlights-view">Highlights</TabsTrigger>
                  <TabsTrigger value="actions">Acties</TabsTrigger>
                </TabsList>

                {/* Overzicht Tab */}
                <TabsContent value="all-content" className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Bestemmingen Overzicht */}
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-blue-900 mb-4">
                        Bestemmingen ({destinationsQuery.data?.length || 0})
                      </h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {(destinationsQuery.data || []).map((destination: any) => (
                          <div key={destination.id} className="bg-white p-3 rounded border border-blue-200">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-blue-900">{destination.name}</h4>
                              <div className="flex gap-1">
                                <Badge variant="outline" className="text-xs">#{destination.ranking || 0}</Badge>
                                {destination.showOnHomepage && <Badge variant="default" className="text-xs bg-green-600">🏠</Badge>}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{destination.description?.substring(0, 80)}...</p>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleToggleDestinationHomepage(destination.id, !destination.showOnHomepage)}
                                className="text-xs"
                              >
                                {destination.showOnHomepage ? '❌ Van Homepage' : '✅ Op Homepage'}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedDestination(destination);
                                  setEditDestinationData({
                                    name: destination.name,
                                        location: destination.location || '',
                                    description: destination.description,
                                    image: destination.image,
                                    alt: destination.alt || '',
                                    content: destination.content || '',
                                    link: destination.link || '',
                                    featured: destination.featured,
                                    published: destination.published,
                                    showOnHomepage: destination.showOnHomepage || false,
                                    ranking: destination.ranking || 0
                                  });
                                  setShowEditDestination(true);
                                }}
                                className="text-xs"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Highlights Overzicht */}
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-purple-900 mb-4">
                        Highlights ({highlightsQuery.data?.length || 0})
                      </h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {(highlightsQuery.data || []).map((highlight: any) => (
                          <div key={highlight.id} className="bg-white p-3 rounded border border-purple-200">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-purple-900">{highlight.name}</h4>
                              <Badge variant="outline" className="text-xs">#{highlight.ranking || 0}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{highlight.description?.substring(0, 80)}...</p>
                            <div className="flex gap-1">
                              <ViewHighlightDialog highlight={highlight} />
                              <EditHighlightDialog 
                                highlight={highlight} 
                                onUpdate={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/highlights'] })} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Highlights View Tab */}
                <TabsContent value="highlights-view" className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">Highlights Beheer ({highlightsQuery.data?.length || 0})</h3>
                      <p className="text-gray-600">Beheer al je Polish reisbestemmingen</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select value={locationFilter} onValueChange={setLocationFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filter op locatie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle locaties</SelectItem>
                          {getUniqueLocations().map((location) => (
                            <SelectItem key={location} value={location}>
                              📍 {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={() => setShowCreateDestination(true)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Nieuwe Bestemming
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {getFilteredDestinations().map((destination: any) => (
                    <Card key={destination.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg leading-tight">{destination.name}</CardTitle>
                            <Badge variant="outline" className="text-xs">#{destination.ranking || 0}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {destination.location && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                📍 {destination.location}
                              </Badge>
                            )}
                            {destination.featured && <Badge variant="secondary" className="text-xs">⭐ Featured</Badge>}
                            <Badge variant={destination.published ? "default" : "outline"} className="text-xs">
                              {destination.published ? "✅ Gepubliceerd" : "📝 Concept"}
                            </Badge>
                            {destination.showOnHomepage && <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">🏠 Homepage</Badge>}
                          </div>
                          <CardDescription className="text-sm line-clamp-2">{destination.description}</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-col gap-3">
                          {destination.image && (
                            <div className="relative h-32 w-full overflow-hidden rounded-md">
                              <img 
                                src={destination.image} 
                                alt={destination.alt || destination.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleToggleDestinationHomepage(destination.id, !destination.showOnHomepage)}
                              className="text-xs flex-1"
                            >
                              {destination.showOnHomepage ? (
                                <>❌ Van Homepage</>
                              ) : (
                                <>✅ Op Homepage</>
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedDestination(destination);
                                setEditDestinationData({
                                  name: destination.name,
                                        location: destination.location || '',
                                  description: destination.description,
                                  image: destination.image,
                                  alt: destination.alt || '',
                                  content: destination.content || '',
                                  link: destination.link || '',
                                  featured: destination.featured,
                                  published: destination.published,
                                  showOnHomepage: destination.showOnHomepage || false,
                                  ranking: destination.ranking || 0
                                });
                                setShowEditDestination(true);
                              }}
                              className="text-xs flex-1"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Bewerken
                            </Button>
                          </div>
                          
                          {destination.link && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => window.open(destination.link, '_blank')}
                              className="text-xs w-full"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Bekijk Pagina
                            </Button>
                          )}
                          
                          {currentUser?.canDeleteContent && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteDestination(destination.id)}
                              className="text-xs w-full"
                            >
                              🗑️ Naar Prullenbak
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                </TabsContent>

                {/* Highlights View Tab */}
                <TabsContent value="highlights-view" className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">Highlights Beheer ({highlightsQuery.data?.length || 0})</h3>
                      <p className="text-gray-600">Beheer alle Polish highlights en attracties</p>
                    </div>
                    <CreateHighlightDialog onUpdate={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/highlights'] })} />
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {(highlightsQuery.data || []).map((highlight: any) => (
                      <Card key={highlight.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg leading-tight">{highlight.name}</CardTitle>
                              <Badge variant="outline" className="text-xs">#{highlight.ranking || 0}</Badge>
                            </div>
                            <CardDescription className="text-sm line-clamp-2">{highlight.description}</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-col gap-3">
                            {highlight.iconPath && (
                              <div className="relative h-32 w-full overflow-hidden rounded-md bg-gray-50 flex items-center justify-center">
                                <img 
                                  src={highlight.iconPath} 
                                  alt={highlight.name}
                                  className="h-16 w-16 object-contain"
                                />
                              </div>
                            )}
                            
                            <div className="flex flex-wrap gap-2">
                              <ViewHighlightDialog highlight={highlight} />
                              <EditHighlightDialog 
                                highlight={highlight} 
                                onUpdate={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/highlights'] })} 
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Acties Tab */}
                <TabsContent value="actions" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Nieuwe Content Maken</CardTitle>
                        <CardDescription>Voeg nieuwe bestemmingen en highlights toe</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button 
                          onClick={() => setShowCreateDestination(true)}
                          className="w-full flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Nieuwe Bestemming
                        </Button>
                        <CreateHighlightDialog 
                          onUpdate={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/highlights'] })}
                          className="w-full"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Homepage Beheer</CardTitle>
                        <CardDescription>Snel homepage content beheren</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span>Bestemmingen op homepage:</span>
                            <Badge variant="default" className="bg-blue-600">
                              {destinationsQuery.data?.filter((d: any) => d.showOnHomepage).length || 0}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Totaal highlights:</span>
                            <Badge variant="default" className="bg-purple-600">
                              {highlightsQuery.data?.length || 0}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
          )}

          {/* Bestaande Bestemmingen - alleen voor gebruikers met create/edit permissies */}
          {currentUser?.canCreateContent && (
            <TabsContent value="destinations" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Bestemmingen ({getFilteredDestinations().length} van {destinationsQuery.data?.length || 0})</h2>
                  <p className="text-gray-600">Beheer al je Polish reisbestemmingen</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter op locatie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle locaties</SelectItem>
                      {getUniqueLocations().map((location) => (
                        <SelectItem key={location} value={location}>
                          📍 {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => setShowCreateDestination(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nieuwe Bestemming
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {getFilteredDestinations().map((destination: any) => (
                <Card key={destination.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg leading-tight">{destination.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">#{destination.ranking || 0}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {destination.location && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            📍 {destination.location}
                          </Badge>
                        )}
                        {destination.featured && <Badge variant="secondary" className="text-xs">⭐ Featured</Badge>}
                        <Badge variant={destination.published ? "default" : "outline"} className="text-xs">
                          {destination.published ? "✅ Gepubliceerd" : "📝 Concept"}
                        </Badge>
                        {destination.showOnHomepage && <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">🏠 Homepage</Badge>}
                      </div>
                      <CardDescription className="text-sm line-clamp-2">{destination.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col gap-3">
                      {destination.image && (
                        <div className="relative h-32 w-full overflow-hidden rounded-md">
                          <img 
                            src={destination.image} 
                            alt={destination.alt || destination.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleToggleDestinationHomepage(destination.id, !destination.showOnHomepage)}
                          className="text-xs flex-1"
                        >
                          {destination.showOnHomepage ? (
                            <>❌ Van Homepage</>
                          ) : (
                            <>✅ Op Homepage</>
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedDestination(destination);
                            setEditDestinationData({
                              name: destination.name,
                              location: destination.location || '',
                              description: destination.description,
                              image: destination.image,
                              alt: destination.alt || '',
                              content: destination.content || '',
                              link: destination.link || '',
                              featured: destination.featured,
                              published: destination.published,
                              showOnHomepage: destination.showOnHomepage || false,
                              ranking: destination.ranking || 0
                            });
                            setShowEditDestination(true);
                          }}
                          className="text-xs flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Bewerken
                        </Button>
                      </div>
                      
                      {destination.link && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => window.open(destination.link, '_blank')}
                          className="text-xs w-full"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Bekijk Pagina
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedDestination(destination);
                          setShowViewDestination(true);
                        }}
                        className="text-xs w-full"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Bekijken
                      </Button>
                      
                      {currentUser?.canDeleteContent && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSoftDeleteDestination(destination.id)}
                          className="text-xs w-full"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
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
                  <h2 className="text-2xl font-semibold">Reisgidsen ({getFilteredGuides().length} van {guidesQuery.data?.length || 0})</h2>
                  <p className="text-gray-600">Beheer al je Polish reisgidsen en tips</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={guideFilter} onValueChange={setGuideFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter op categorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle categorieën</SelectItem>
                      {getUniqueGuideCategories().map((category) => (
                        <SelectItem key={category} value={category}>
                          📖 {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => setShowCreateGuide(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nieuwe Reisgids
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {getFilteredGuides().map((guide: any) => (
                <Card key={guide.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg leading-tight">{guide.title}</CardTitle>
                        <Badge variant="outline" className="text-xs">#{guide.ranking || 0}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          📖 {guide.title.split(' ')[0] || 'Overig'}
                        </Badge>
                        {guide.featured && <Badge variant="secondary" className="text-xs">⭐ Featured</Badge>}
                        <Badge variant={guide.published ? "default" : "outline"} className="text-xs">
                          {guide.published ? "✅ Gepubliceerd" : "📝 Concept"}
                        </Badge>
                        {guide.showOnHomepage && <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">🏠 Homepage</Badge>}
                      </div>
                      <CardDescription className="text-sm line-clamp-2">{guide.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col gap-3">
                      {guide.image && (
                        <div className="relative h-32 w-full overflow-hidden rounded-md">
                          <img 
                            src={guide.image} 
                            alt={guide.alt || guide.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleToggleGuideHomepage(guide.id, !guide.showOnHomepage)}
                          className="text-xs flex-1"
                        >
                          {guide.showOnHomepage ? (
                            <>❌ Van Homepage</>
                          ) : (
                            <>✅ Op Homepage</>
                          )}
                        </Button>
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
                              link: guide.link || '',
                              featured: guide.featured,
                              published: guide.published,
                              showOnHomepage: guide.showOnHomepage || false,
                              ranking: guide.ranking || 0
                            });
                            setShowEditGuide(true);
                          }}
                          className="text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Bewerken
                        </Button>
                      </div>

                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedGuide(guide);
                          setShowViewGuide(true);
                        }}
                        className="text-xs w-full"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Bekijken
                      </Button>
                      
                      {currentUser?.canDeleteContent && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSoftDeleteGuide(guide.id)}
                          className="text-xs w-full"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
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

          {/* Homepage Overview - Combinatie van Bestemmingen en Ontdek Meer */}
          {currentUser?.canCreateContent && (
            <TabsContent value="homepage-overview" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Homepage Content Overview</h2>
                  <p className="text-gray-600">Overzicht van alle content die op de homepage wordt getoond</p>
                </div>
              </div>

              {/* Bestemmingen Sectie */}
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-blue-900">
                    Bestemmingen ({destinationsQuery.data?.filter((d: any) => d.showOnHomepage).length || 0} op homepage)
                  </h3>
                  <div className="text-sm text-blue-700">
                    Totaal: {destinationsQuery.data?.length || 0} bestemmingen
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(destinationsQuery.data || []).filter((destination: any) => destination.showOnHomepage).map((destination: any) => (
                    <Card key={destination.id} className="bg-white border-blue-200">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg text-blue-900">{destination.name}</CardTitle>
                          <Badge variant="default" className="bg-blue-600 text-xs">Homepage</Badge>
                        </div>
                        <CardDescription className="text-sm">{destination.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleToggleDestinationHomepage(destination.id, false)}
                            className="text-xs"
                          >
                            ❌ Van Homepage
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedDestination(destination);
                              setEditDestinationData({
                                name: destination.name,
                                        location: destination.location || '',
                                description: destination.description,
                                image: destination.image,
                                alt: destination.alt || '',
                                content: destination.content || '',
                                link: destination.link || '',
                                featured: destination.featured,
                                published: destination.published,
                                showOnHomepage: destination.showOnHomepage || false,
                                ranking: destination.ranking || 0
                              });
                              setShowEditDestination(true);
                            }}
                            className="text-xs"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Bewerken
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {destinationsQuery.data?.filter((d: any) => d.showOnHomepage).length === 0 && (
                  <div className="text-center py-8 text-blue-700">
                    Geen bestemmingen geselecteerd voor homepage
                  </div>
                )}
              </div>

              {/* Ontdek Meer Sectie */}
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-green-900">
                    Ontdek Meer Pagina's ({pagesQuery.data?.filter((p: any) => p.published).length || 0} gepubliceerd)
                  </h3>
                  <div className="text-sm text-green-700">
                    Totaal: {pagesQuery.data?.length || 0} pagina's
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(pagesQuery.data || []).filter((page: any) => page.published).map((page: any) => (
                    <Card key={page.id} className="bg-white border-green-200">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg text-green-900">{page.title}</CardTitle>
                          <Badge variant="default" className="bg-green-600 text-xs">Gepubliceerd</Badge>
                        </div>
                        <CardDescription className="text-sm">{page.metaDescription}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex gap-2 mb-2">
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                            {page.template}
                          </span>
                          {page.featured && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleTogglePageHomepage(page.id, false)}
                            className="text-xs"
                          >
                            ❌ Depubliceer
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedPage(page);
                              setEditPageData({
                                title: page.title,
                                slug: page.slug,
                                content: page.content,
                                metaTitle: page.metaTitle || '',
                                metaDescription: page.metaDescription || '',
                                metaKeywords: page.metaKeywords || '',
                                template: page.template,
                                headerImage: page.headerImage || '',
                                headerImageAlt: page.headerImageAlt || '',
                                highlightSections: page.highlightSections || '',
                                published: page.published,
                                featured: page.featured,
                                ranking: page.ranking || 0
                              });
                              setShowEditPage(true);
                            }}
                            className="text-xs"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Bewerken
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {pagesQuery.data?.filter((p: any) => p.published).length === 0 && (
                  <div className="text-center py-8 text-green-700">
                    Geen pagina's gepubliceerd voor Ontdek Meer sectie
                  </div>
                )}
              </div>

              {/* Reisgidsen Sectie */}
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-purple-900">
                    Reisgidsen ({guidesQuery.data?.filter((g: any) => g.showOnHomepage).length || 0} op homepage)
                  </h3>
                  <div className="text-sm text-purple-700">
                    Totaal: {guidesQuery.data?.length || 0} reisgidsen
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(guidesQuery.data || []).filter((guide: any) => guide.showOnHomepage).map((guide: any) => (
                    <Card key={guide.id} className="bg-white border-purple-200">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg text-purple-900">{guide.title}</CardTitle>
                          <Badge variant="default" className="bg-purple-600 text-xs">Homepage</Badge>
                        </div>
                        <CardDescription className="text-sm">{guide.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleToggleGuideHomepage(guide.id, false)}
                            className="text-xs"
                          >
                            ❌ Van Homepage
                          </Button>
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
                                link: guide.link || '',
                                featured: guide.featured,
                                published: guide.published,
                                showOnHomepage: guide.showOnHomepage || false,
                                ranking: guide.ranking || 0
                              });
                              setShowEditGuide(true);
                            }}
                            className="text-xs"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Bewerken
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {guidesQuery.data?.filter((g: any) => g.showOnHomepage).length === 0 && (
                  <div className="text-center py-8 text-purple-700">
                    Geen reisgidsen geselecteerd voor homepage
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* Ontdek Meer Tab Content */}
          {currentUser?.canCreateContent && (
            <TabsContent value="ontdek-meer" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Ontdek Meer Homepage ({pagesQuery.data?.filter((page: any) => page.published).length || 0})</h2>
                  <p className="text-gray-600">Beheer de pagina's die in de "Ontdek Meer" sectie op de homepage worden getoond</p>
                </div>
                <Button onClick={() => setShowCreatePage(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe Pagina
                </Button>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {(pagesQuery.data || []).map((page: any) => (
                  <Card key={page.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg leading-tight">{page.title}</CardTitle>
                          <Badge variant="outline" className="text-xs">#{page.ranking || 0}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {page.featured && <Badge variant="secondary" className="text-xs">⭐ Featured</Badge>}
                          <Badge variant={page.published ? "default" : "outline"} className="text-xs">
                            {page.published ? "✅ Gepubliceerd" : "📝 Concept"}
                          </Badge>
                          {page.published && <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">🏠 Homepage</Badge>}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 gap-2">
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {page.template}
                          </span>
                          <span>
                            {new Date(page.createdAt).toLocaleDateString('nl-NL')}
                          </span>
                        </div>
                        <CardDescription className="text-sm line-clamp-2">{page.metaDescription}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-col gap-3">
                        {/* Quick Homepage Toggle */}
                        <Button 
                          size="sm" 
                          variant={page.published ? "default" : "outline"}
                          onClick={() => handleTogglePageHomepage(page.id, !page.published)}
                          className="w-full"
                        >
                          {page.published ? "🏠 Op Homepage" : "➕ Naar Homepage"}
                        </Button>
                        
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedPage(page);
                              setShowEditPage(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Bewerken
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedPage(page);
                              setShowViewPage(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Bekijken
                          </Button>
                          {page.published && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(`/${page.slug}`, '_blank')}
                            >
                              <FolderOpen className="h-4 w-4 mr-2" />
                              Live
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {(!pagesQuery.data || pagesQuery.data.length === 0) && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      📄
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Geen pagina's</h3>
                    <p className="text-sm">Maak je eerste "Ontdek Meer" pagina aan om content op de homepage te tonen.</p>
                  </div>
                  <Button onClick={() => setShowCreatePage(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Eerste Pagina Maken
                  </Button>
                </div>
              )}
            </TabsContent>
          )}

          {/* Highlights Tab Content - Admin Only */}
          {currentUser?.role === 'admin' && (
            <TabsContent value="highlights" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Highlights ({highlightsQuery.data?.length || 0})</h2>
                  <p className="text-gray-600">Beheer de highlights die op de homepage worden getoond</p>
                </div>
                <Button onClick={() => setShowCreateHighlight(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe Highlight
                </Button>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {(highlightsQuery.data || []).map((highlight: any) => (
                  <Card key={highlight.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg leading-tight">{highlight.name}</CardTitle>
                          <Badge variant="outline" className="text-xs">#{highlight.ranking || 0}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={highlight.active ? "default" : "outline"} className="text-xs">
                            {highlight.active ? "✅ Actief" : "❌ Inactief"}
                          </Badge>
                          <Badge variant={highlight.showOnHomepage ? "default" : "outline"} className="text-xs">
                            {highlight.showOnHomepage ? "🏠 Homepage" : "🚫 Niet homepage"}
                          </Badge>
                          {highlight.category !== 'general' && (
                            <Badge variant="secondary" className="text-xs capitalize">
                              {highlight.category}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                          <img
                            src={highlight.iconPath}
                            alt={highlight.name}
                            className="w-12 h-12"
                            onError={(e) => {
                              e.currentTarget.src = '/images/highlights/placeholder.svg';
                            }}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-col gap-3">
                        {/* Quick Homepage Toggle */}
                        <Button 
                          size="sm" 
                          variant={highlight.showOnHomepage ? "default" : "outline"}
                          onClick={() => handleToggleHighlightHomepage(highlight.id, !highlight.showOnHomepage)}
                          className="w-full"
                        >
                          {highlight.showOnHomepage ? "🏠 Op Homepage" : "➕ Naar Homepage"}
                        </Button>
                        
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedHighlight(highlight);
                              setEditHighlightData({
                                name: highlight.name,
                                iconPath: highlight.iconPath,
                                category: highlight.category || 'general',
                                ranking: highlight.ranking || 0,
                                active: highlight.active,
                                showOnHomepage: highlight.showOnHomepage
                              });
                              setShowEditHighlight(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Bewerken
                          </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedHighlight(highlight);
                            setShowViewHighlight(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Bekijken
                        </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteHighlight(highlight.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Verwijderen
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}

          {/* Activiteiten Tab */}
          <TabsContent value="activities" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Activiteiten ({getFilteredActivities().length} van {activitiesQuery.data?.length || 0})</h2>
                  <p className="text-gray-600">Beheer activiteiten zoals musea, bergen, pleinen en restaurants</p>
                </div>
                <Button onClick={() => {
                  console.log("DEBUG: Nieuwe Activiteit clicked, current state:", showCreateActivity);
                  setShowCreateActivity(true);
                  console.log("DEBUG: After setShowCreateActivity(true)");
                }} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe Activiteit
                </Button>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="activity-location-filter">Filter op locatie</Label>
                  <Select value={activityLocationFilter} onValueChange={setActivityLocationFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Alle locaties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle locaties ({activitiesQuery.data?.length || 0})</SelectItem>
                      {getUniqueActivityLocations().map((location) => {
                        const count = activitiesQuery.data?.filter((a: any) => a.location === location).length || 0;
                        return (
                          <SelectItem key={location} value={location}>
                            {location} ({count})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="activity-category-filter">Filter op categorie</Label>
                  <Select value={activityCategoryFilter} onValueChange={setActivityCategoryFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Alle categorieën" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle categorieën ({activitiesQuery.data?.length || 0})</SelectItem>
                      {getUniqueActivityCategories().map((category) => {
                        const count = activitiesQuery.data?.filter((a: any) => a.category === category).length || 0;
                        return (
                          <SelectItem key={category} value={category}>
                            {category} ({count})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Activities Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {getFilteredActivities().map((activity: any) => (
                  <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                    <div className="relative">
                      {activity.image && (
                        <div className="h-32 w-full overflow-hidden rounded-t-lg">
                          <img
                            src={activity.image}
                            alt={activity.alt || activity.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <Badge variant="outline" className="absolute top-2 right-2 text-xs bg-white/90">
                        #{activity.ranking || 0}
                      </Badge>
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-lg leading-tight">{activity.name}</CardTitle>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          📍 {activity.location || 'Geen locatie'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          🎯 {activity.category || 'Geen categorie'}
                        </Badge>
                        {activity.activityType && (
                          <Badge variant="outline" className="text-xs">
                            {activity.activityType}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm mt-2">{activity.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            console.log("Bewerken button clicked for activity:", activity.name);
                            console.log("Setting selectedActivity:", activity);
                            setSelectedActivity(activity);
                            setEditActivityData({
                              name: activity.name,
                              location: activity.location || '',
                              category: activity.category || '',
                              activityType: activity.activityType || '',
                              description: activity.description,
                              image: activity.image,
                              alt: activity.alt || '',
                              content: activity.content || '',
                              link: activity.link || '',
                              featured: activity.featured,
                              published: activity.published,
                              ranking: activity.ranking || 0
                            });
                            console.log("Setting showEditActivity to true");
                            setShowEditActivity(true);
                          }}
                          className="flex-1 text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Bewerken
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            console.log("Bekijken button clicked for activity:", activity.name);
                            setSelectedActivity(activity);
                            setShowViewActivity(true);
                          }}
                          className="flex-1 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Bekijken
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteActivity(activity.id, activity.name, activitiesQuery, toast)}
                          className="text-xs"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Prullenbak
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {getFilteredActivities().length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Plus className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Geen activiteiten gevonden</h3>
                  <p className="text-gray-500 mb-4">
                    {activitiesQuery.data?.length === 0 
                      ? "Begin met het toevoegen van je eerste activiteit."
                      : "Probeer je filters aan te passen om meer resultaten te zien."
                    }
                  </p>
                  {activitiesQuery.data?.length === 0 && (
                    <Button onClick={() => setShowCreateActivity(true)} className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Nieuwe Activiteit
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

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

          {/* Search Configuration Tab */}
          {currentUser?.canEditContent && (
            <TabsContent value="search-configs" className="space-y-6">
              {/* Debug information */}
              <div className="bg-blue-50 p-3 rounded border text-sm">
                <strong>Debug Info:</strong> 
                <div>User can edit: {String(currentUser?.canEditContent)}</div>
                <div>Search configs loading: {String(searchConfigsQuery.isLoading)}</div>
                <div>Search configs error: {searchConfigsQuery.error ? String(searchConfigsQuery.error) : 'None'}</div>
                <div>Search configs data: {searchConfigsQuery.data ? `${searchConfigsQuery.data.length} items` : 'No data'}</div>
                <div>Dialog states: Create={String(showCreateSearchConfig)}, Edit={String(showEditSearchConfig)}, View={String(showViewSearchConfig)}</div>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Zoekbalk CMS</h2>
                  <p className="text-gray-600">Beheer zoekfunctionaliteit en configuraties per context</p>
                </div>
                <Button 
                  onClick={() => {
                    console.log('🔵 Create search config button clicked');
                    console.log('🔵 Current showCreateSearchConfig state:', showCreateSearchConfig);
                    
                    // Test state immediately
                    const beforeState = showCreateSearchConfig;
                    
                    // Reset form data
                    setSearchConfigData({
                      context: '',
                      placeholderText: '',
                      searchScope: 'destinations',
                      enableLocationFilter: false,
                      enableCategoryFilter: false,
                      customInstructions: '',
                      redirectPattern: '',
                      isActive: true
                    });
                    
                    console.log('🔵 Setting showCreateSearchConfig to true');
                    setShowCreateSearchConfig(true);
                    
                    // Check state change after a brief delay
                    setTimeout(() => {
                      console.log('🔵 State after timeout - before:', beforeState, 'after setting true, current:', showCreateSearchConfig);
                    }, 100);
                  }} 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe Zoek Configuratie
                </Button>
              </div>

              {/* Search Configurations List */}
              <div className="space-y-4">
                {searchConfigsQuery.data?.map((config: any) => (
                  <Card key={config.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{config.context}</h3>
                            <Badge variant={config.isActive ? "default" : "secondary"}>
                              {config.isActive ? "Actief" : "Inactief"}
                            </Badge>
                            <Badge variant="outline">{config.searchScope}</Badge>
                          </div>
                          <p className="text-gray-600">{config.placeholderText}</p>
                          {config.customInstructions && (
                            <p className="text-sm text-gray-500">{config.customInstructions}</p>
                          )}
                          <div className="flex gap-2">
                            {config.enableLocationFilter && (
                              <Badge variant="outline" className="text-xs">📍 Locatie filter</Badge>
                            )}
                            {config.enableCategoryFilter && (
                              <Badge variant="outline" className="text-xs">🏷️ Categorie filter</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              console.log('View search config clicked:', config);
                              setSelectedSearchConfig(config);
                              setShowViewSearchConfig(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Bekijk
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              console.log('Edit search config clicked:', config);
                              setSelectedSearchConfig(config);
                              // Pre-populate form with current data
                              setSearchConfigData({
                                context: config.context || '',
                                placeholderText: config.placeholderText || '',
                                searchScope: config.searchScope || 'destinations',
                                enableLocationFilter: Boolean(config.enableLocationFilter),
                                enableCategoryFilter: Boolean(config.enableCategoryFilter),
                                customInstructions: config.customInstructions || '',
                                redirectPattern: config.redirectPattern || '',
                                isActive: Boolean(config.isActive)
                              });
                              setShowEditSearchConfig(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Bewerk
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteSearchConfig(config.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Verwijder
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Loading state */}
              {searchConfigsQuery.isLoading && (
                <div className="text-center py-8">
                  <div className="text-gray-400">Zoek configuraties laden...</div>
                </div>
              )}

              {/* Error state */}
              {searchConfigsQuery.error && (
                <div className="text-center py-8 text-red-600">
                  <div>Fout bij laden: {String(searchConfigsQuery.error)}</div>
                  <Button onClick={() => searchConfigsQuery.refetch()} className="mt-2">
                    Opnieuw proberen
                  </Button>
                </div>
              )}

              {/* Empty state */}
              {searchConfigsQuery.data?.length === 0 && !searchConfigsQuery.isLoading && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="space-y-3">
                      <div className="text-4xl">🔍</div>
                      <h3 className="text-lg font-semibold">Geen zoek configuraties</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Maak je eerste zoek configuratie aan om de zoekfunctionaliteit te beheren
                      </p>
                      <Button 
                        onClick={() => {
                          console.log('Create first search config clicked');
                          // Reset form data
                          setSearchConfigData({
                            context: '',
                            placeholderText: '',
                            searchScope: 'destinations',
                            enableLocationFilter: false,
                            enableCategoryFilter: false,
                            customInstructions: '',
                            redirectPattern: '',
                            isActive: true
                          });
                          setShowCreateSearchConfig(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Eerste Configuratie Aanmaken
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
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

                {/* Header Display Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Header Weergave</CardTitle>
                    <CardDescription>Instellingen voor header overlay en weergave</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="headerOverlayEnabled">Header Overlay</Label>
                        <p className="text-sm text-gray-600">
                          Voeg een donkere overlay toe over alle header afbeeldingen voor betere tekstleesbaarheid
                        </p>
                      </div>
                      <Switch
                        id="headerOverlayEnabled"
                        checked={siteSettings.headerOverlayEnabled}
                        onCheckedChange={(checked) => setSiteSettings({...siteSettings, headerOverlayEnabled: checked})}
                      />
                    </div>
                    
                    {siteSettings.headerOverlayEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="headerOverlayOpacity">Overlay Intensiteit: {siteSettings.headerOverlayOpacity}%</Label>
                        <input
                          type="range"
                          id="headerOverlayOpacity"
                          min="10"
                          max="70"
                          step="5"
                          value={siteSettings.headerOverlayOpacity}
                          onChange={(e) => setSiteSettings({...siteSettings, headerOverlayOpacity: parseInt(e.target.value)})}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Licht (10%)</span>
                          <span>Donker (70%)</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          💡 Tip: Lagere waarden voor lichtere afbeeldingen, hogere waarden voor donkere afbeeldingen
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Afbeeldingen */}
                <Card>
                  <CardHeader>
                    <CardTitle>Site Afbeeldingen</CardTitle>
                    <CardDescription>Logo, achtergrond en social media afbeeldingen</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SiteImageUploadField
                      label="Achtergrond Afbeelding"
                      value={siteSettings.backgroundImage}
                      onChange={(imagePath) => setSiteSettings({...siteSettings, backgroundImage: imagePath})}
                      imageType="background"
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
                    
                    <SiteImageUploadField
                      label="Logo Afbeelding"
                      value={siteSettings.logoImage}
                      onChange={(imagePath) => setSiteSettings({...siteSettings, logoImage: imagePath})}
                      imageType="logo"
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
                    <SiteImageUploadField
                      label="Social Media Afbeelding"
                      value={siteSettings.socialMediaImage}
                      onChange={(imagePath) => setSiteSettings({...siteSettings, socialMediaImage: imagePath})}
                      imageType="social"
                    />
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="faviconEnabled"
                          checked={siteSettings.faviconEnabled ?? true}
                          onCheckedChange={async (checked) => {
                            setSiteSettings({...siteSettings, faviconEnabled: checked});
                            // Direct save to database for immediate effect
                            try {
                              await apiRequest('/api/admin/site-settings', {
                                method: 'PUT',
                                body: JSON.stringify({...siteSettings, faviconEnabled: checked})
                              });
                              queryClient.invalidateQueries({ queryKey: ['/api/site-settings'] });
                              toast({ title: "Succes", description: `Favicon ${checked ? 'ingeschakeld' : 'uitgeschakeld'}` });
                            } catch (error) {
                              toast({ title: "Fout", description: "Kon favicon instelling niet opslaan", variant: "destructive" });
                            }
                          }}
                        />
                        <Label htmlFor="faviconEnabled">Favicon inschakelen</Label>
                      </div>
                      
                      {siteSettings.faviconEnabled && (
                        <FaviconUploadField
                          label="Favicon"
                          value={siteSettings.favicon}
                          onChange={(faviconPath) => setSiteSettings({...siteSettings, favicon: faviconPath})}
                        />
                      )}
                      
                      {!siteSettings.faviconEnabled && (
                        <div className="p-3 bg-gray-100 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-600">
                            Favicon is uitgeschakeld. Schakel in om een favicon te uploaden en te beheren.
                          </p>
                        </div>
                      )}
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
              
              <PageManagement templates={templatesQuery.data || []} />
            </TabsContent>
          )}

          {/* Templates Tab Content */}
          <TabsContent value="templates" className="space-y-6">
            {currentUser && currentUser.role !== 'admin' ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600">Je hebt geen toegang tot deze functie. Alleen administrators kunnen templates beheren.</p>
                </CardContent>
              </Card>
            ) : (
              <>
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
              </>
            )}
          </TabsContent>

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

        {/* Template Dialogs */}
        {showCreateTemplate && (
          <CreateTemplateDialog 
            open={showCreateTemplate} 
            onOpenChange={setShowCreateTemplate}
            onTemplateCreated={() => {
              templatesQuery.refetch();
              setShowCreateTemplate(false);
            }}
          />
        )}

        {showEditTemplate && selectedTemplate && (
          <EditTemplateDialog 
            open={showEditTemplate} 
            onOpenChange={setShowEditTemplate}
            template={selectedTemplate}
            onTemplateUpdated={() => {
              templatesQuery.refetch();
              setShowEditTemplate(false);
            }}
          />
        )}

        {showViewTemplate && selectedTemplate && (
          <ViewTemplateDialog 
            open={showViewTemplate} 
            onOpenChange={setShowViewTemplate}
            template={selectedTemplate}
          />
        )}

        {/* Page Dialogs */}
        {showCreatePage && (
          <CreatePageDialog 
            open={showCreatePage} 
            onOpenChange={setShowCreatePage}
            templates={templatesQuery.data || []}
            onPageCreated={() => {
              pagesQuery.refetch();
              setShowCreatePage(false);
            }}
          />
        )}

        {showEditPage && selectedPage && (
          <EditPageDialog 
            open={showEditPage} 
            onOpenChange={setShowEditPage}
            page={selectedPage}
            templates={templatesQuery.data || []}
            onPageUpdated={() => {
              pagesQuery.refetch();
              setShowEditPage(false);
            }}
          />
        )}

        {showViewPage && selectedPage && (
          <ViewPageDialog 
            open={showViewPage} 
            onOpenChange={setShowViewPage}
            page={selectedPage}
          />
        )}

        {/* Highlights Dialogs */}
        {showCreateHighlight && (
          <CreateHighlightDialog 
            open={showCreateHighlight} 
            onOpenChange={setShowCreateHighlight}
            onHighlightCreated={() => {
              highlightsQuery.refetch();
              setShowCreateHighlight(false);
            }}
          />
        )}

        {showEditHighlight && selectedHighlight && (
          <EditHighlightDialog 
            open={showEditHighlight} 
            onOpenChange={setShowEditHighlight}
            highlight={selectedHighlight}
            editData={editHighlightData}
            setEditData={setEditHighlightData}
            onSave={() => {
              highlightsQuery.refetch();
              setShowEditHighlight(false);
            }}
          />
        )}

        {showViewHighlight && selectedHighlight && (
          <ViewHighlightDialog 
            open={showViewHighlight} 
            onOpenChange={setShowViewHighlight}
            highlight={selectedHighlight}
          />
        )}

        {/* Create Destination Dialog */}
        {showCreateDestination && (
          <CreateDestinationDialog 
            open={showCreateDestination} 
            onOpenChange={setShowCreateDestination}
            onDestinationCreated={() => {
              destinationsQuery.refetch();
              setShowCreateDestination(false);
            }}
          />
        )}

        {/* Create Guide Dialog */}
        {showCreateGuide && (
          <CreateGuideDialog 
            open={showCreateGuide} 
            onOpenChange={setShowCreateGuide}
            onGuideCreated={() => {
              guidesQuery.refetch();
              setShowCreateGuide(false);
            }}
          />
        )}

        {/* Activity Create Dialog */}
        {showCreateActivity && (
          <CreateActivityDialog 
            open={showCreateActivity} 
            onOpenChange={setShowCreateActivity}
            onActivityCreated={() => {
              activitiesQuery.refetch();
              setShowCreateActivity(false);
            }}
          />
        )}

        {/* Activity Edit Dialog */}
        {showEditActivity && selectedActivity && (
          <EditActivityDialog 
            open={showEditActivity} 
            onOpenChange={setShowEditActivity}
            activity={selectedActivity}
            onActivityUpdated={() => {
              activitiesQuery.refetch();
              setShowEditActivity(false);
            }}
          />
        )}

        {/* Activity View Dialog */}
        {showViewActivity && selectedActivity && (
          <ViewActivityDialog 
            open={showViewActivity} 
            onOpenChange={setShowViewActivity}
            activity={selectedActivity}
          />
        )}
      </div>
    </div>
  );
}

// Image Cropper Dialog Component
function ImageCropperDialog({ imagePath, onCroppedImage, destination }: {
  imagePath: string;
  onCroppedImage: (croppedImagePath: string) => void;
  destination?: string;
}) {
  const [open, setOpen] = useState(false);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 41, // 90/2.2 ≈ 41% voor 2.2:1 aspect ratio
    x: 5,
    y: 30
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number>(2.2); // Default site header aspect ratio
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  // Berekend gebaseerd op site header: py-24 = 6rem (96px) padding boven en onder
  // Typische viewport: 1920x1080 - 192px padding = 888px effectieve hoogte
  // Aspect ratio: 1920/888 ≈ 2.16:1 voor desktop
  // Voor responsief ontwerp gebruiken we 2.2:1 als optimaal
  const aspectRatios = [
    { name: 'Site Header (2.2:1)', value: 2.2 }, // Exact match voor site headers
    { name: 'Wide Header (2.5:1)', value: 2.5 },
    { name: 'Banner (3:1)', value: 3 },
    { name: 'Widescreen (16:9)', value: 16/9 },
    { name: 'Landscape (4:3)', value: 4/3 },
    { name: 'Square (1:1)', value: 1 },
    { name: 'Portrait (3:4)', value: 3/4 },
    { name: 'Vrije vorm', value: 0 }
  ];

  const updateCropForAspectRatio = (newAspect: number, imageWidth?: number, imageHeight?: number) => {
    const imgWidth = imageWidth || imgRef.current?.width || 800;
    const imgHeight = imageHeight || imgRef.current?.height || 600;
    
    if (newAspect > 0) {
      const cropWidth = 90;
      const cropHeight = (cropWidth / newAspect) * (imgWidth / imgHeight);
      const cropY = Math.max(0, (100 - cropHeight) / 2);
      
      const newCrop: Crop = {
        unit: '%',
        width: cropWidth,
        height: Math.min(cropHeight, 95),
        x: 5,
        y: cropY
      };
      setCrop(newCrop);
    } else {
      // Vrije vorm
      setCrop({
        unit: '%',
        width: 50,
        height: 50,
        x: 25,
        y: 25
      });
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    updateCropForAspectRatio(aspect, width, height);
  };

  const handleAspectChange = (newAspect: number) => {
    setAspect(newAspect);
    updateCropForAspectRatio(newAspect);
  };

  const getCroppedImg = async (
    image: HTMLImageElement,
    crop: PixelCrop,
    scale: number,
    rotate: number
  ): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('No 2d context');
    }
    
    // Exacte header afmetingen - gebaseerd op werkelijke CSS py-24 padding
    const HEADER_WIDTH = 1920;
    const HEADER_HEIGHT = 873; // Exact 2.2:1 ratio zoals in werkelijke header

    canvas.width = HEADER_WIDTH;
    canvas.height = HEADER_HEIGHT;

    ctx.imageSmoothingQuality = 'high';

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Bereken crop coordinaten in natuurlijke afmetingen
    const sourceX = crop.x * scaleX;
    const sourceY = crop.y * scaleY;
    const sourceWidth = crop.width * scaleX;
    const sourceHeight = crop.height * scaleY;

    // Vul het hele canvas met de gecroppte afbeelding - geen zwarte randen
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, HEADER_WIDTH, HEADER_HEIGHT);
    
    // Bereken optimale schaling om het canvas te vullen terwijl aspect ratio behouden blijft
    const scaleToFitWidth = HEADER_WIDTH / sourceWidth;
    const scaleToFitHeight = HEADER_HEIGHT / sourceHeight;
    const scaleToFit = Math.max(scaleToFitWidth, scaleToFitHeight) * scale;
    
    const scaledWidth = sourceWidth * scaleToFit;
    const scaledHeight = sourceHeight * scaleToFit;
    
    // Centreer de afbeelding
    const offsetX = (HEADER_WIDTH - scaledWidth) / 2;
    const offsetY = (HEADER_HEIGHT - scaledHeight) / 2;

    ctx.save();
    
    // Rotatie toepassen rond het midden van het canvas
    if (rotate !== 0) {
      ctx.translate(HEADER_WIDTH / 2, HEADER_HEIGHT / 2);
      ctx.rotate((rotate * Math.PI) / 180);
      ctx.translate(-HEADER_WIDTH / 2, -HEADER_HEIGHT / 2);
    }
    
    // Teken de gecroppte afbeelding om het hele canvas te vullen
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      offsetX,
      offsetY,
      scaledWidth,
      scaledHeight
    );
    
    ctx.restore();

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(URL.createObjectURL(blob));
        },
        'image/jpeg',
        0.95
      );
    });
  };

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) return;

    setIsProcessing(true);
    try {
      const croppedImageUrl = await getCroppedImg(
        imgRef.current,
        completedCrop,
        scale,
        rotate
      );

      // Upload de gecroppte afbeelding
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      
      const formData = new FormData();
      const pathParts = imagePath.split('/');
      let destinationFolder = destination;
      
      // Als destination niet is opgegeven, probeer het uit het path te halen
      if (!destinationFolder) {
        destinationFolder = pathParts[pathParts.length - 2]; // Get destination from path
      }
      
      const originalName = pathParts[pathParts.length - 1];
      const baseName = originalName.split('.')[0];
      const filename = `${baseName}-cropped-${Date.now()}`; // Geen extensie, server voegt .jpg toe
      
      formData.append('image', blob, filename);
      if (destinationFolder) {
        formData.append('destination', destinationFolder);
      }
      formData.append('fileName', filename);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const result = await uploadResponse.json();
      
      toast({
        title: "Succes",
        description: "Afbeelding is succesvol gecroppt en opgeslagen",
      });

      onCroppedImage(result.path);
      setOpen(false);
    } catch (error) {
      console.error('Error cropping image:', error);
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het croppen van de afbeelding",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetCrop = () => {
    setScale(1);
    setRotate(0);
    updateCropForAspectRatio(aspect);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
        >
          <CropIcon className="h-3 w-3 mr-1" />
          Crop
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Afbeelding Croppen & Bewerken</DialogTitle>
          <DialogDescription>
            Selecteer het gewenste gebied van de afbeelding. De uitvoer wordt altijd 1920x873 pixels (2.2:1) voor perfecte header weergave.
            Gebruik de crop, scale en rotate tools om de afbeelding optimaal uit te lijnen.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Crop Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect > 0 ? aspect : undefined}
                minHeight={50}
                className="max-w-full"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imagePath}
                  onLoad={onImageLoad}
                  style={{
                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                    maxWidth: '100%',
                    maxHeight: '400px'
                  }}
                />
              </ReactCrop>
            </div>

            {/* Preview */}
            {completedCrop && imgRef.current && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Preview (vaste header afmetingen: 1920x873px)</Label>
                <div className="border rounded-lg p-2 bg-white">
                  <div 
                    className="w-full bg-gray-100 rounded overflow-hidden relative"
                    style={{ 
                      aspectRatio: '2.2',
                      height: '120px'
                    }}
                  >
                    <canvas
                      ref={(canvas) => {
                        if (canvas && completedCrop && imgRef.current) {
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            const previewWidth = 240;
                            const previewHeight = Math.round(previewWidth / 2.2); // Exact 2.2:1 ratio
                            
                            canvas.width = previewWidth;
                            canvas.height = previewHeight;
                            
                            ctx.imageSmoothingQuality = 'high';
                            
                            const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
                            const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
                            
                            const sourceX = completedCrop.x * scaleX;
                            const sourceY = completedCrop.y * scaleY;
                            const sourceWidth = completedCrop.width * scaleX;
                            const sourceHeight = completedCrop.height * scaleY;
                            
                            // Vul achtergrond
                            ctx.fillStyle = '#000000';
                            ctx.fillRect(0, 0, previewWidth, previewHeight);
                            
                            // Bereken schaling om canvas te vullen (zoals echte crop)
                            const scaleToFitWidth = previewWidth / completedCrop.width;
                            const scaleToFitHeight = previewHeight / completedCrop.height;
                            const scaleToFit = Math.max(scaleToFitWidth, scaleToFitHeight) * scale;
                            
                            const scaledWidth = completedCrop.width * scaleToFit;
                            const scaledHeight = completedCrop.height * scaleToFit;
                            
                            const offsetX = (previewWidth - scaledWidth) / 2;
                            const offsetY = (previewHeight - scaledHeight) / 2;
                            
                            ctx.save();
                            
                            // Rotatie toepassen
                            if (rotate !== 0) {
                              ctx.translate(previewWidth / 2, previewHeight / 2);
                              ctx.rotate((rotate * Math.PI) / 180);
                              ctx.translate(-previewWidth / 2, -previewHeight / 2);
                            }
                            
                            ctx.drawImage(
                              imgRef.current,
                              sourceX,
                              sourceY,
                              sourceWidth,
                              sourceHeight,
                              offsetX,
                              offsetY,
                              scaledWidth,
                              scaledHeight
                            );
                            
                            ctx.restore();
                            
                            // Overlay voor realistische preview
                            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                            ctx.fillRect(0, 0, previewWidth, previewHeight);
                            
                            // Tekst overlay
                            ctx.fillStyle = 'white';
                            ctx.font = 'bold 12px Arial';
                            ctx.textAlign = 'center';
                            ctx.fillText('Ontdek Polen', previewWidth / 2, previewHeight / 2 - 8);
                            ctx.font = '10px Arial';
                            ctx.fillText('Header Preview', previewWidth / 2, previewHeight / 2 + 8);
                          }
                        }
                      }}
                      className="w-full h-full rounded"
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                  💡 <strong>Vaste afmetingen:</strong> De gecroppte afbeelding wordt altijd opgeslagen als 1920x873 pixels, 
                  perfect voor header weergave. Gebruik de crop, scale en rotate tools om de afbeelding optimaal uit te lijnen.
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Aspect Ratio</Label>
              <Select value={aspect.toString()} onValueChange={(value) => handleAspectChange(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aspectRatios.map((ratio) => (
                    <SelectItem key={ratio.value} value={ratio.value.toString()}>
                      {ratio.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Schaal: {scale.toFixed(1)}x</Label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Rotatie: {rotate}°</Label>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={rotate}
                onChange={(e) => setRotate(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetCrop}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRotate(rotate - 90)}
                className="flex-1"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Draai
              </Button>
            </div>

            <div className="pt-4 border-t">
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Header (2.5:1)</strong> - Optimaal voor website headers</p>
                <p><strong>Banner (3:1)</strong> - Breed banner formaat</p>
                <p><strong>Widescreen (16:9)</strong> - Modern scherm formaat</p>
                <p><strong>Vrije vorm</strong> - Geen vaste verhoudingen</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Annuleren
          </Button>
          <Button
            onClick={handleCropComplete}
            disabled={!completedCrop || isProcessing}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Verwerken...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Crop & Opslaan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Herbruikbare afbeelding upload component
function HeaderImageSelector({ destination, currentImage, onImageSelect }: {
  destination: string;
  currentImage: string;
  onImageSelect: (imagePath: string, altText: string) => void;
}) {
  const [availableImages, setAvailableImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (destination && showGallery) {
      setIsLoading(true);
      fetch(`/api/admin/header-images/${destination}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then(res => res.json())
        .then(data => {
          // Ensure data is an array
          setAvailableImages(Array.isArray(data) ? data : []);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching header images:', error);
          setAvailableImages([]);
          setIsLoading(false);
        });
    }
  }, [destination, showGallery]);

  const handleDeleteImage = async (imagePath: string, imageName: string) => {
    if (!confirm(`Weet je zeker dat je "${imageName}" wilt verwijderen?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/images/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ imagePath })
      });

      if (!response.ok) {
        throw new Error('Fout bij verwijderen afbeelding');
      }

      // Refresh de gallery
      const updatedImages = availableImages.filter(img => img.path !== imagePath);
      setAvailableImages(updatedImages);
      
      // Als het huidige image is verwijderd, clear de selectie
      if (currentImage === imagePath) {
        onImageSelect('', '');
      }

      toast({
        title: "Succesvol verwijderd",
        description: `${imageName} is verwijderd`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Fout bij verwijderen",
        description: "Er is een fout opgetreden bij het verwijderen van de afbeelding",
        variant: "destructive"
      });
    }
  };

  if (!destination) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Selecteer Header Afbeelding</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowGallery(!showGallery)}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          {showGallery ? 'Verberg Galerie' : 'Toon Beschikbare Afbeeldingen'}
        </Button>
      </div>

      {showGallery && (
        <div className="border rounded-lg p-4 bg-white">
          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Afbeeldingen laden...</p>
            </div>
          ) : availableImages.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Geen header afbeeldingen gevonden voor {destination}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availableImages.map((image, index) => (
                <div key={index} className="relative">
                  <div 
                    className={`relative h-24 w-full rounded-md overflow-hidden border cursor-pointer hover:border-blue-500 transition-colors ${
                      currentImage === image.path ? 'border-blue-500 border-2' : 'border-gray-300'
                    }`}
                    onClick={() => onImageSelect(image.path, `${image.name} header afbeelding`)}
                    style={{
                      backgroundImage: `url('${image.path}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {/* Overlay voor consistentie met header */}
                    <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                    
                    {/* Tekst overlay voor realistische preview */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center z-10">
                      <div className="text-xs font-bold mb-1">Ontdek Polen</div>
                      <div className="text-xs opacity-90">Mooie plekken in {destination} ontdekken</div>
                    </div>
                    
                    {/* Verborgen img voor fallback error handling */}
                    <img 
                      src={image.path} 
                      alt={image.name}
                      className="hidden"
                      onError={(e) => {
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.style.backgroundImage = 'none';
                          parent.style.backgroundColor = '#e5e7eb';
                          parent.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 text-xs">Fout bij laden</div>';
                        }
                      }}
                    />
                    {currentImage === image.path && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-20">
                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded font-bold">
                          ✓ Geselecteerd
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-center mt-1 text-gray-600">{image.name}</p>
                  <div className="flex gap-1 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => onImageSelect(image.path, `${image.name} header afbeelding`)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Selecteer
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteImage(image.path, image.name)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <ImageCropperDialog
                      imagePath={image.path}
                      destination={destination}
                      onCroppedImage={(croppedPath) => {
                        onImageSelect(croppedPath, `${image.name} header afbeelding (gecroppt)`);
                        // Refresh de gallery om de nieuwe afbeelding te laten zien
                        setShowGallery(false);
                        setTimeout(() => {
                          setShowGallery(true);
                        }, 100);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ImageUploadField({ label, value, onChange, placeholder, fileName, destination }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  fileName?: string;
  destination?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadFile({ 
        file, 
        fileName, 
        destination,
        type: 'image' 
      });
      onChange(result.imagePath || '');
    } catch (error) {
      // Error handling is done in uploadFile utility
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

function SiteImageUploadField({ label, value, onChange, imageType }: {
  label: string;
  value: string;
  onChange: (imagePath: string) => void;
  imageType: 'background' | 'logo' | 'social';
}) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImageList, setShowImageList] = useState(false);

  const imageQuery = useQuery({
    queryKey: ['/api/site-images', imageType],
    queryFn: () => fetch(`/api/site-images/${imageType}`).then(res => res.json())
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadFile({ 
        file, 
        fileName: `${imageType}-${Date.now()}`, 
        destination: imageType,
        type: 'image' 
      });
      onChange(result.imagePath || '');
      
      // Refresh image list
      imageQuery.refetch();
    } catch (error) {
      // Error handling is done in uploadFile utility
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (filename: string) => {
    try {
      const response = await fetch(`/api/site-images/${imageType}/${filename}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      toast({
        title: "Succes",
        description: "Afbeelding succesvol verwijderd!",
      });

      // Clear current value if deleted file was selected
      if (value.includes(filename)) {
        onChange('');
      }

      // Refresh image list
      imageQuery.refetch();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Verwijder fout",
        description: "Er is een fout opgetreden bij het verwijderen van de afbeelding",
        variant: "destructive",
      });
    }
  };

  const imageFiles = imageQuery.data || [];
  const typeLabels = {
    background: 'Achtergrond',
    logo: 'Logo',
    social: 'Social Media'
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`/${imageType}-afbeelding.jpg`}
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowImageList(!showImageList)}
          className="shrink-0"
        >
          {showImageList ? (
            <>
              <Eye className="h-4 w-4 mr-1" />
              Verberg
            </>
          ) : (
            <>
              <FolderOpen className="h-4 w-4 mr-1" />
              Bekijk ({imageFiles.length})
            </>
          )}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {showImageList && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Beschikbare {typeLabels[imageType]} Afbeeldingen</h4>
            <span className="text-sm text-gray-500">{imageFiles.length} bestand(en)</span>
          </div>
          {imageFiles.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">Geen {typeLabels[imageType].toLowerCase()} afbeeldingen gevonden</p>
              <p className="text-xs text-gray-400">Upload een afbeelding om te beginnen</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {imageFiles.map((file: any) => (
                <div key={file.name} className="flex items-center justify-between p-3 bg-white rounded border hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 border rounded overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img
                        src={file.path}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent && !parent.querySelector('.fallback-icon')) {
                            const fallbackIcon = document.createElement('div');
                            fallbackIcon.className = 'fallback-icon text-xs text-gray-400 flex items-center justify-center w-full h-full';
                            fallbackIcon.innerHTML = '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg>';
                            parent.appendChild(fallbackIcon);
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB • 
                        {file.dimensions && ` ${file.dimensions} • `}
                        {new Date(file.lastModified).toLocaleDateString('nl-NL')}
                      </p>
                    </div>
                    {value === file.path && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Actief
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onChange(file.path)}
                      disabled={value === file.path}
                    >
                      {value === file.path ? 'Geselecteerd' : 'Selecteer'}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteImage(file.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FaviconUploadField({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (faviconPath: string) => void;
}) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFaviconList, setShowFaviconList] = useState(false);

  const faviconQuery = useQuery({
    queryKey: ['/api/favicons'],
    queryFn: () => fetch('/api/favicons').then(res => res.json())
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadFile({ 
        file, 
        fileName: file.name.replace('.ico', ''), 
        type: 'favicon' 
      });
      onChange(result.faviconPath || '');
      
      // Refresh favicon list
      faviconQuery.refetch();
    } catch (error) {
      // Error handling is done in uploadFile utility
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteFavicon = async (filename: string) => {
    try {
      const response = await fetch(`/api/favicons/${filename}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      toast({
        title: "Succes",
        description: "Favicon succesvol verwijderd!",
      });

      // Clear current value if deleted file was selected
      if (value === `/${filename}`) {
        onChange('');
      }

      // Refresh favicon list
      faviconQuery.refetch();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Verwijder fout",
        description: "Er is een fout opgetreden bij het verwijderen van de favicon",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const faviconFiles = faviconQuery.data || [];

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/favicon.ico"
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
          Upload .ico
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowFaviconList(!showFaviconList)}
          className="shrink-0"
        >
          {showFaviconList ? (
            <>
              <Eye className="h-4 w-4 mr-1" />
              Verberg
            </>
          ) : (
            <>
              <FolderOpen className="h-4 w-4 mr-1" />
              Bekijk ({faviconFiles.length})
            </>
          )}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".ico"
        onChange={handleFileUpload}
        className="hidden"
      />

      {showFaviconList && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Beschikbare Favicon Bestanden</h4>
            <span className="text-sm text-gray-500">{faviconFiles.length} bestand(en)</span>
          </div>
          {faviconFiles.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                <span className="text-gray-400 text-xs font-bold">ICO</span>
              </div>
              <p className="text-gray-500 mb-2">Geen favicon bestanden gevonden</p>
              <p className="text-xs text-gray-400">Upload een .ico bestand om te beginnen</p>
            </div>
          ) : (
            <div className="space-y-2">
              {faviconFiles.map((file: any) => (
                <div key={file.name} className="flex items-center justify-between p-3 bg-white rounded border hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 border rounded flex items-center justify-center bg-gray-50">
                      <img
                        src={file.path}
                        alt={file.name}
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          // Fallback: toon een bestand icoon als de favicon niet kan worden geladen
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentNode as HTMLElement;
                          if (parent && !parent.querySelector('.fallback-icon')) {
                            const fallbackIcon = document.createElement('div');
                            fallbackIcon.className = 'fallback-icon text-gray-400 text-xs font-bold';
                            fallbackIcon.textContent = 'ICO';
                            parent.appendChild(fallbackIcon);
                          }
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {new Date(file.lastModified).toLocaleDateString('nl-NL', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-blue-600">{file.path}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onChange(file.path)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Selecteer
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteFavicon(file.name)}
                      className="hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {value && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border rounded flex items-center justify-center bg-white">
              <img
                src={value}
                alt="Current favicon"
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentNode as HTMLElement;
                  if (parent && !parent.querySelector('.fallback-current')) {
                    const fallbackIcon = document.createElement('div');
                    fallbackIcon.className = 'fallback-current text-gray-400 text-xs font-bold';
                    fallbackIcon.textContent = 'ICO';
                    parent.appendChild(fallbackIcon);
                  }
                }}
              />
            </div>
            <div>
              <p className="font-medium text-blue-900">Huidige favicon</p>
              <p className="text-sm text-blue-700">{value}</p>
            </div>
          </div>
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
      queryClient.invalidateQueries({ queryKey: ['/api/destinations/homepage'] });
      
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
            <Label htmlFor="location">Plaats/Locatie</Label>
            <Input
              id="location"
              value={editData.location || ''}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              placeholder="Bijv. Krakow, Warschau"
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
            placeholder="/images/destinations/bestemming.jpg"
            fileName={editData.name}
            destination="destinations"
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
          <div className="space-y-2">
            <Label htmlFor="link">Link (optioneel)</Label>
            <Input
              id="link"
              value={editData.link || ''}
              onChange={(e) => setEditData({ ...editData, link: e.target.value })}
              placeholder="Bijv. /krakow-bezoeken of https://example.com"
            />
            <p className="text-sm text-gray-500">
              Link waar de afbeelding naartoe moet leiden. Gebruik interne links (bijv. /pagina) of externe links (bijv. https://website.com)
            </p>
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
            <div className="flex items-center space-x-2">
              <Switch 
                id="showOnHomepage"
                checked={editData.showOnHomepage !== false}
                onCheckedChange={(checked) => setEditData({ ...editData, showOnHomepage: checked })}
              />
              <Label htmlFor="showOnHomepage">Toon op Homepage</Label>
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
      queryClient.invalidateQueries({ queryKey: ['/api/guides/homepage'] });
      
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
            placeholder="/images/guides/reisgids.jpg"
            fileName={editData.title}
            destination="guides"
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
          <div className="space-y-2">
            <Label htmlFor="link">Link (optioneel)</Label>
            <Input
              id="link"
              value={editData.link || ''}
              onChange={(e) => setEditData({ ...editData, link: e.target.value })}
              placeholder="Bijv. /krakow-bezoeken of https://example.com"
            />
            <p className="text-sm text-gray-500">
              Link waar de afbeelding naartoe moet leiden. Gebruik interne links (bijv. /pagina) of externe links (bijv. https://website.com)
            </p>
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
            <div className="flex items-center space-x-2">
              <Switch 
                id="showOnHomepage"
                checked={editData.showOnHomepage !== false}
                onCheckedChange={(checked) => setEditData({ ...editData, showOnHomepage: checked })}
              />
              <Label htmlFor="showOnHomepage">Toon op Homepage</Label>
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
  const [showViewTemplate, setShowViewTemplate] = useState(false);
  const [showEditTemplate, setShowEditTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const { toast } = useToast();

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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowViewTemplate(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowEditTemplate(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        try {
                          const newTemplate = {
                            ...template,
                            name: `${template.name} (Kopie)`,
                            id: undefined
                          };
                          await apiRequest('/api/admin/templates', {
                            method: 'POST',
                            body: JSON.stringify(newTemplate)
                          });
                          toast({ title: "Succes", description: "Template gekopieerd" });
                          templatesQuery.refetch();
                        } catch (error) {
                          toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
                        }
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        if (confirm('Weet je zeker dat je deze template wilt verwijderen?')) {
                          try {
                            await apiRequest(`/api/admin/templates/${template.id}`, { method: 'DELETE' });
                            toast({ title: "Succes", description: "Template verwijderd" });
                            templatesQuery.refetch();
                          } catch (error) {
                            toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
                          }
                        }
                      }}
                    >
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

      {/* Template View Dialog */}
      {showViewTemplate && selectedTemplate && (
        <ViewTemplateDialog 
          open={showViewTemplate} 
          onOpenChange={setShowViewTemplate}
          template={selectedTemplate}
        />
      )}

      {/* Template Edit Dialog */}
      {showEditTemplate && selectedTemplate && (
        <EditTemplateDialog 
          open={showEditTemplate} 
          onOpenChange={setShowEditTemplate}
          template={selectedTemplate}
          onTemplateUpdated={() => {
            templatesQuery.refetch();
            setShowEditTemplate(false);
          }}
        />
      )}
    </div>
  );
}

// Template Dialog Components
function CreateTemplateDialog({ open, onOpenChange, onTemplateCreated }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onTemplateCreated: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    defaultMetaTitle: '',
    defaultMetaDescription: '',
    defaultMetaKeywords: '',
    isActive: true
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiRequest('/api/admin/templates', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({ title: "Succes", description: "Template succesvol aangemaakt" });
        onTemplateCreated();
        setFormData({
          name: '',
          description: '',
          content: '',
          defaultMetaTitle: '',
          defaultMetaDescription: '',
          defaultMetaKeywords: '',
          isActive: true
        });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nieuwe Template Aanmaken</DialogTitle>
          <DialogDescription>
            Maak een nieuwe template aan met variabelen ondersteuning
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Naam</Label>
              <Input
                id="templateName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Bijv. Travel Destination Template"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateDescription">Beschrijving</Label>
              <Input
                id="templateDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Beschrijf het doel van deze template"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="templateContent">Template Content</Label>
            <Textarea
              id="templateContent"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="# {{title}}&#10;&#10;{{description}}&#10;&#10;## Inhoud&#10;&#10;Gebruik variabelen zoals {{title}}, {{description}}, {{metaDescription}}"
              rows={12}
              className="font-mono text-sm"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="defaultMetaTitle">Standaard Meta Title</Label>
              <Input
                id="defaultMetaTitle"
                value={formData.defaultMetaTitle}
                onChange={(e) => setFormData({ ...formData, defaultMetaTitle: e.target.value })}
                placeholder="{{title}} - Site Naam"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultMetaDescription">Standaard Meta Description</Label>
              <Input
                id="defaultMetaDescription"
                value={formData.defaultMetaDescription}
                onChange={(e) => setFormData({ ...formData, defaultMetaDescription: e.target.value })}
                placeholder="{{description}}"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultMetaKeywords">Standaard Meta Keywords</Label>
              <Input
                id="defaultMetaKeywords"
                value={formData.defaultMetaKeywords}
                onChange={(e) => setFormData({ ...formData, defaultMetaKeywords: e.target.value })}
                placeholder="{{title}}, polen, reizen"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Template actief maken</Label>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit">Template Aanmaken</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditTemplateDialog({ open, onOpenChange, template, onTemplateUpdated }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  template: any;
  onTemplateUpdated: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    content: template?.content || '',
    defaultMetaTitle: template?.defaultMetaTitle || '',
    defaultMetaDescription: template?.defaultMetaDescription || '',
    defaultMetaKeywords: template?.defaultMetaKeywords || '',
    isActive: template?.isActive || false
  });
  const { toast } = useToast();

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        description: template.description || '',
        content: template.content || '',
        defaultMetaTitle: template.defaultMetaTitle || '',
        defaultMetaDescription: template.defaultMetaDescription || '',
        defaultMetaKeywords: template.defaultMetaKeywords || '',
        isActive: template.isActive || false
      });
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiRequest(`/api/admin/templates/${template.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({ title: "Succes", description: "Template succesvol bijgewerkt" });
        onTemplateUpdated();
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Template Bewerken</DialogTitle>
          <DialogDescription>
            Bewerk de template "{template?.name}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="editTemplateName">Template Naam</Label>
              <Input
                id="editTemplateName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTemplateDescription">Beschrijving</Label>
              <Input
                id="editTemplateDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editTemplateContent">Template Content</Label>
            <Textarea
              id="editTemplateContent"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              className="font-mono text-sm"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="editDefaultMetaTitle">Standaard Meta Title</Label>
              <Input
                id="editDefaultMetaTitle"
                value={formData.defaultMetaTitle}
                onChange={(e) => setFormData({ ...formData, defaultMetaTitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDefaultMetaDescription">Standaard Meta Description</Label>
              <Input
                id="editDefaultMetaDescription"
                value={formData.defaultMetaDescription}
                onChange={(e) => setFormData({ ...formData, defaultMetaDescription: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDefaultMetaKeywords">Standaard Meta Keywords</Label>
              <Input
                id="editDefaultMetaKeywords"
                value={formData.defaultMetaKeywords}
                onChange={(e) => setFormData({ ...formData, defaultMetaKeywords: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="editIsActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="editIsActive">Template actief</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit">Wijzigingen Opslaan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ViewTemplateDialog({ open, onOpenChange, template }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  template: any; 
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template?.name}</DialogTitle>
          <DialogDescription>{template?.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Badge variant={template?.isActive ? "default" : "outline"}>
              {template?.isActive ? "Actief" : "Inactief"}
            </Badge>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Template Content</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-sm font-mono">{template?.content}</pre>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-medium mb-1">Meta Title</h4>
              <p className="text-sm text-gray-600">{template?.defaultMetaTitle || 'Geen standaard waarde'}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Meta Description</h4>
              <p className="text-sm text-gray-600">{template?.defaultMetaDescription || 'Geen standaard waarde'}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Meta Keywords</h4>
              <p className="text-sm text-gray-600">{template?.defaultMetaKeywords || 'Geen standaard waarde'}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Sluiten</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Page Dialog Components
function CreatePageDialog({ open, onOpenChange, templates, onPageCreated }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  templates: any[];
  onPageCreated: () => void; 
}) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    template: '',
    published: false,
    featured: false,
    ranking: 0
  });
  const { toast } = useToast();

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiRequest('/api/admin/pages', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({ title: "Succes", description: "Pagina succesvol aangemaakt" });
        onPageCreated();
        setFormData({
          title: '',
          slug: '',
          content: '',
          metaTitle: '',
          metaDescription: '',
          metaKeywords: '',
          template: '',
          published: false,
          featured: false,
          ranking: 0
        });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nieuwe Pagina Aanmaken</DialogTitle>
          <DialogDescription>
            Maak een nieuwe pagina aan met template ondersteuning
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pageTitle">Pagina Titel</Label>
              <Input
                id="pageTitle"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Bijv. Amsterdam Bezoeken"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pageSlug">URL Slug</Label>
              <Input
                id="pageSlug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="amsterdam-bezoeken"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pageTemplate">Template</Label>
            <Select value={formData.template} onValueChange={(value) => setFormData({ ...formData, template: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer een template" />
              </SelectTrigger>
              <SelectContent>
                {templates.filter(t => t.isActive).map((template) => (
                  <SelectItem key={template.id} value={template.name}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pageContent">Pagina Content</Label>
            <Textarea
              id="pageContent"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Schrijf je pagina content hier. Als je een template gebruikt, wordt deze content samengevoegd met de template."
              rows={12}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="pageMetaTitle">Meta Title</Label>
              <Input
                id="pageMetaTitle"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder="SEO titel voor deze pagina"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pageMetaDescription">Meta Description</Label>
              <Input
                id="pageMetaDescription"
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="SEO beschrijving voor deze pagina"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pageMetaKeywords">Meta Keywords</Label>
              <Input
                id="pageMetaKeywords"
                value={formData.metaKeywords}
                onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                placeholder="SEO keywords, gescheiden door komma's"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
              />
              <Label htmlFor="published">Pagina publiceren</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label htmlFor="featured">Featured</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pageRanking">Volgorde (ranking)</Label>
            <Input
              id="pageRanking"
              type="number"
              value={formData.ranking}
              onChange={(e) => setFormData({ ...formData, ranking: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit">Pagina Aanmaken</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditPageDialog({ open, onOpenChange, page, templates, onPageUpdated }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  page: any;
  templates: any[];
  onPageUpdated: () => void; 
}) {
  const [formData, setFormData] = useState({
    title: page?.title || '',
    slug: page?.slug || '',
    content: page?.content || '',
    metaTitle: page?.metaTitle || '',
    metaDescription: page?.metaDescription || '',
    metaKeywords: page?.metaKeywords || '',
    template: page?.template || '',
    headerImage: page?.headerImage || '',
    headerImageAlt: page?.headerImageAlt || '',
    highlightSections: page?.highlightSections || '[]',
    published: page?.published || false,
    featured: page?.featured || false,
    ranking: page?.ranking || 0
  });
  const { toast } = useToast();

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title || '',
        slug: page.slug || '',
        content: page.content || '',
        metaTitle: page.metaTitle || '',
        metaDescription: page.metaDescription || '',
        metaKeywords: page.metaKeywords || '',
        template: page.template || '',
        headerImage: page.headerImage || '',
        headerImageAlt: page.headerImageAlt || '',
        highlightSections: page.highlightSections || '[]',
        published: page.published || false,
        featured: page.featured || false,
        ranking: page.ranking || 0
      });
    }
  }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiRequest(`/api/admin/pages/${page.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({ title: "Succes", description: "Pagina succesvol bijgewerkt" });
        onPageUpdated();
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pagina Bewerken</DialogTitle>
          <DialogDescription>
            Bewerk de pagina "{page?.title}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="editPageTitle">Pagina Titel</Label>
              <Input
                id="editPageTitle"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPageSlug">URL Slug</Label>
              <Input
                id="editPageSlug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editPageTemplate">Template</Label>
            <Select value={formData.template} onValueChange={(value) => setFormData({ ...formData, template: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer een template" />
              </SelectTrigger>
              <SelectContent>
                {templates.filter(t => t.isActive).map((template) => (
                  <SelectItem key={template.id} value={template.name}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Header Afbeelding Upload/Delete */}
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold">Header Afbeelding</h3>
            </div>
            
            {/* Current Header Image Preview - Exacte header weergave */}
            {formData.headerImage && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 mb-2">Header Voorbeeld (exacte weergave):</div>
                <div 
                  className="relative h-40 w-full rounded-md overflow-hidden border"
                  style={{
                    backgroundImage: `url('${formData.headerImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Exacte overlay zoals in echte header */}
                  <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                  
                  {/* Exacte tekst zoals in echte header */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center z-10">
                    <h1 className="text-xl font-bold mb-2 font-inter">
                      Ontdek Polen
                    </h1>
                    <p className="text-base opacity-90 font-inter">
                      Mooie plekken in {formData.title} ontdekken
                    </p>
                  </div>
                  
                  {/* Verborgen img voor error handling */}
                  <img 
                    src={formData.headerImage} 
                    alt={formData.headerImageAlt || 'Header afbeelding'}
                    className="hidden"
                    onError={(e) => {
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.style.backgroundImage = 'none';
                        parent.style.backgroundColor = '#e5e7eb';
                        parent.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500 text-sm">Afbeelding niet gevonden: ${formData.headerImage}</div>`;
                      }
                    }}
                  />
                </div>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setFormData({ ...formData, headerImage: '', headerImageAlt: '' })}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Header Afbeelding Verwijderen
                </Button>
              </div>
            )}

            {/* Header Image Selection */}
            <HeaderImageSelector
              destination={formData.slug}
              currentImage={formData.headerImage}
              onImageSelect={(imagePath, altText) => setFormData({ ...formData, headerImage: imagePath, headerImageAlt: altText })}
            />

            {/* Upload New Header Image */}
            <ImageUploadField
              label={formData.headerImage ? "Nieuwe Header Afbeelding Uploaden" : "Header Afbeelding Uploaden"}
              value={formData.headerImage}
              onChange={(value) => setFormData({ ...formData, headerImage: value })}
              placeholder="/images/destinations/pagina-header.jpg"
              fileName={`${formData.slug || formData.title}-header`}
            />

            {/* Header Image Alt Text */}
            <div className="space-y-2">
              <Label htmlFor="editPageHeaderImageAlt">Header Afbeelding Alt-tekst</Label>
              <Input
                id="editPageHeaderImageAlt"
                value={formData.headerImageAlt}
                onChange={(e) => setFormData({ ...formData, headerImageAlt: e.target.value })}
                placeholder="Beschrijving van de header afbeelding"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editPageContent">Pagina Content</Label>
            <Textarea
              id="editPageContent"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              required
            />
          </div>

          {/* Highlight Secties */}
          <div className="space-y-2">
            <Label>Hoogtepunten Secties</Label>
            <p className="text-sm text-gray-600">
              Voeg hoogtepunten toe die getoond worden onder de header (zoals op de homepage)
            </p>
            <Textarea
              value={formData.highlightSections}
              onChange={(e) => setFormData({ ...formData, highlightSections: e.target.value })}
              className="min-h-[150px] font-mono text-sm"
              placeholder={`[
  {
    "title": "Voorbeeld Locatie",
    "description": "Beschrijving van deze mooie plek",
    "image": "/images/example.jpg",
    "alt": "Alternatieve tekst voor afbeelding"
  }
]`}
            />
            <p className="text-xs text-gray-500">
              JSON format: Array van objecten met title, description, image en alt velden
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="editPageMetaTitle">Meta Title</Label>
              <Input
                id="editPageMetaTitle"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPageMetaDescription">Meta Description</Label>
              <Input
                id="editPageMetaDescription"
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPageMetaKeywords">Meta Keywords</Label>
              <Input
                id="editPageMetaKeywords"
                value={formData.metaKeywords}
                onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="editPublished"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
              />
              <Label htmlFor="editPublished">Pagina publiceren</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="editFeatured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label htmlFor="editFeatured">Featured</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editPageRanking">Volgorde (ranking)</Label>
            <Input
              id="editPageRanking"
              type="number"
              value={formData.ranking}
              onChange={(e) => setFormData({ ...formData, ranking: parseInt(e.target.value) || 0 })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit">Wijzigingen Opslaan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ViewPageDialog({ open, onOpenChange, page }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  page: any; 
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{page?.title}</DialogTitle>
          <DialogDescription>/{page?.slug}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Badge variant={page?.published ? "default" : "outline"}>
              {page?.published ? "Gepubliceerd" : "Concept"}
            </Badge>
            {page?.featured && <Badge variant="secondary">Featured</Badge>}
            <Badge variant="outline">{page?.template}</Badge>
          </div>

          {/* Header Image Preview */}
          {page?.headerImage && (
            <div>
              <h3 className="font-semibold mb-2">Header Afbeelding</h3>
              <div className="relative h-32 w-full rounded-md overflow-hidden border">
                <img 
                  src={page.headerImage} 
                  alt={page.headerImageAlt || 'Header afbeelding'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full bg-gray-200 items-center justify-center">
                  <span className="text-gray-500 text-sm">Afbeelding niet gevonden: {page.headerImage}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{page.headerImageAlt || 'Geen alt-tekst'}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Content</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-sm">{page?.content}</pre>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-medium mb-1">Meta Title</h4>
              <p className="text-sm text-gray-600">{page?.metaTitle || 'Geen meta title'}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Meta Description</h4>
              <p className="text-sm text-gray-600">{page?.metaDescription || 'Geen meta description'}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Meta Keywords</h4>
              <p className="text-sm text-gray-600">{page?.metaKeywords || 'Geen meta keywords'}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-1">Template</h4>
              <p className="text-sm text-gray-600">{page?.template}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Ranking</h4>
              <p className="text-sm text-gray-600">{page?.ranking}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Sluiten</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PageManagement({ templates }: { templates: any[] }) {
  const pagesQuery = useQuery({ queryKey: ['/api/admin/pages'] });
  const deletedPagesQuery = useQuery({ queryKey: ['/api/admin/pages/deleted'] });
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [showViewPage, setShowViewPage] = useState(false);
  const [showEditPage, setShowEditPage] = useState(false);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const { toast } = useToast();

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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedPage(page);
                          setShowViewPage(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedPage(page);
                          setShowEditPage(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          try {
                            await apiRequest(`/api/admin/pages/${page.id}`, { method: 'DELETE' });
                            toast({ title: "Succes", description: "Pagina verplaatst naar prullenbak" });
                            pagesQuery.refetch();
                            deletedPagesQuery.refetch();
                          } catch (error) {
                            toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
                          }
                        }}
                      >
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          try {
                            await apiRequest(`/api/admin/pages/${page.id}/restore`, { method: 'POST' });
                            toast({ title: "Succes", description: "Pagina hersteld" });
                            pagesQuery.refetch();
                            deletedPagesQuery.refetch();
                          } catch (error) {
                            toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
                          }
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Herstel
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          if (confirm('Weet je zeker dat je deze pagina permanent wilt verwijderen?')) {
                            try {
                              await apiRequest(`/api/admin/pages/${page.id}/permanent`, { method: 'DELETE' });
                              toast({ title: "Succes", description: "Pagina permanent verwijderd" });
                              deletedPagesQuery.refetch();
                            } catch (error) {
                              toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
                            }
                          }
                        }}
                      >
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

      {/* Page View Dialog */}
      {showViewPage && selectedPage && (
        <ViewPageDialog 
          open={showViewPage} 
          onOpenChange={setShowViewPage}
          page={selectedPage}
        />
      )}

      {/* Page Edit Dialog */}
      {showEditPage && selectedPage && (
        <EditPageDialog 
          open={showEditPage} 
          onOpenChange={setShowEditPage}
          page={selectedPage}
          templates={templates}
          onPageUpdated={() => {
            pagesQuery.refetch();
            setShowEditPage(false);
          }}
        />
      )}

      {/* Search Configuration Dialogs */}
      {showCreateSearchConfig && (
        <Dialog open={true} onOpenChange={(open) => {
          console.log('Create dialog open state changed:', open);
          if (!open) {
            setShowCreateSearchConfig(false);
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nieuwe Zoek Configuratie</DialogTitle>
              <DialogDescription>
                Maak een nieuwe zoek configuratie aan voor een specifieke context
              </DialogDescription>
            </DialogHeader>
            {/* Debug form data */}
            <div className="bg-gray-50 p-2 text-xs rounded">
              <strong>Form Debug:</strong> 
              <div>Dialog State: showCreateSearchConfig = {String(showCreateSearchConfig)}</div>
              <div>Form Data: {JSON.stringify(searchConfigData, null, 2)}</div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="context">Context *</Label>
                <Input
                  id="context"
                  value={searchConfigData.context}
                  onChange={(e) => {
                    console.log('Context input changed:', e.target.value);
                    setSearchConfigData({...searchConfigData, context: e.target.value});
                  }}
                  placeholder="Bijvoorbeeld: homepage, destination, global"
                />
              </div>
              <div>
                <Label htmlFor="placeholderText">Placeholder Tekst *</Label>
                <Input
                  id="placeholderText"
                  value={searchConfigData.placeholderText}
                  onChange={(e) => {
                    console.log('Placeholder text changed:', e.target.value);
                    setSearchConfigData({...searchConfigData, placeholderText: e.target.value});
                  }}
                  placeholder="Bijvoorbeeld: Zoek bestemmingen..."
                />
              </div>
              <div>
                <Label htmlFor="searchScope">Zoekbereik *</Label>
                <select
                  id="searchScope"
                  value={searchConfigData.searchScope}
                  onChange={(e) => setSearchConfigData({...searchConfigData, searchScope: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="destinations">Bestemmingen</option>
                  <option value="activities">Activiteiten</option>
                  <option value="guides">Reisgidsen</option>
                  <option value="all">Alles</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableLocationFilter"
                    checked={searchConfigData.enableLocationFilter}
                    onCheckedChange={(checked) => setSearchConfigData({...searchConfigData, enableLocationFilter: checked})}
                  />
                  <Label htmlFor="enableLocationFilter">Locatie filter inschakelen</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableCategoryFilter"
                    checked={searchConfigData.enableCategoryFilter}
                    onCheckedChange={(checked) => setSearchConfigData({...searchConfigData, enableCategoryFilter: checked})}
                  />
                  <Label htmlFor="enableCategoryFilter">Categorie filter inschakelen</Label>
                </div>
              </div>
              <div>
                <Label htmlFor="redirectPattern">Redirect Patroon</Label>
                <Input
                  id="redirectPattern"
                  value={searchConfigData.redirectPattern}
                  onChange={(e) => setSearchConfigData({...searchConfigData, redirectPattern: e.target.value})}
                  placeholder="Bijvoorbeeld: /{slug} of /search?q={query}"
                />
              </div>
              <div>
                <Label htmlFor="customInstructions">Aangepaste Instructies</Label>
                <Textarea
                  id="customInstructions"
                  value={searchConfigData.customInstructions}
                  onChange={(e) => setSearchConfigData({...searchConfigData, customInstructions: e.target.value})}
                  placeholder="Extra instructies voor deze zoek configuratie"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={searchConfigData.isActive}
                  onCheckedChange={(checked) => setSearchConfigData({...searchConfigData, isActive: checked})}
                />
                <Label htmlFor="isActive">Configuratie actief</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                console.log('Cancel create search config');
                setShowCreateSearchConfig(false);
              }}>
                Annuleren
              </Button>
              <Button onClick={() => {
                console.log('Submit create search config with data:', searchConfigData);
                handleCreateSearchConfig(searchConfigData);
              }}>
                Aanmaken
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showEditSearchConfig && selectedSearchConfig && (
        <Dialog open={true} onOpenChange={(open) => {
          console.log('Edit dialog open state changed:', open);
          if (!open) {
            setShowEditSearchConfig(false);
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Zoek Configuratie Bewerken</DialogTitle>
              <DialogDescription>
                Bewerk de zoek configuratie voor {selectedSearchConfig.context}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-context">Context *</Label>
                <Input
                  id="edit-context"
                  value={searchConfigData.context}
                  onChange={(e) => setSearchConfigData({...searchConfigData, context: e.target.value})}
                  placeholder="Bijvoorbeeld: homepage, destination, global"
                />
              </div>
              <div>
                <Label htmlFor="edit-placeholderText">Placeholder Tekst *</Label>
                <Input
                  id="edit-placeholderText"
                  value={searchConfigData.placeholderText}
                  onChange={(e) => setSearchConfigData({...searchConfigData, placeholderText: e.target.value})}
                  placeholder="Bijvoorbeeld: Zoek bestemmingen..."
                />
              </div>
              <div>
                <Label htmlFor="edit-searchScope">Zoekbereik *</Label>
                <select
                  id="edit-searchScope"
                  value={searchConfigData.searchScope}
                  onChange={(e) => setSearchConfigData({...searchConfigData, searchScope: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="destinations">Bestemmingen</option>
                  <option value="activities">Activiteiten</option>
                  <option value="guides">Reisgidsen</option>
                  <option value="all">Alles</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-enableLocationFilter"
                    checked={searchConfigData.enableLocationFilter}
                    onCheckedChange={(checked) => setSearchConfigData({...searchConfigData, enableLocationFilter: checked})}
                  />
                  <Label htmlFor="edit-enableLocationFilter">Locatie filter inschakelen</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-enableCategoryFilter"
                    checked={searchConfigData.enableCategoryFilter}
                    onCheckedChange={(checked) => setSearchConfigData({...searchConfigData, enableCategoryFilter: checked})}
                  />
                  <Label htmlFor="edit-enableCategoryFilter">Categorie filter inschakelen</Label>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-redirectPattern">Redirect Patroon</Label>
                <Input
                  id="edit-redirectPattern"
                  value={searchConfigData.redirectPattern}
                  onChange={(e) => setSearchConfigData({...searchConfigData, redirectPattern: e.target.value})}
                  placeholder="Bijvoorbeeld: /{slug} of /search?q={query}"
                />
              </div>
              <div>
                <Label htmlFor="edit-customInstructions">Aangepaste Instructies</Label>
                <Textarea
                  id="edit-customInstructions"
                  value={searchConfigData.customInstructions}
                  onChange={(e) => setSearchConfigData({...searchConfigData, customInstructions: e.target.value})}
                  placeholder="Extra instructies voor deze zoek configuratie"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={searchConfigData.isActive}
                  onCheckedChange={(checked) => setSearchConfigData({...searchConfigData, isActive: checked})}
                />
                <Label htmlFor="edit-isActive">Configuratie actief</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                console.log('Cancel edit search config');
                setShowEditSearchConfig(false);
              }}>
                Annuleren
              </Button>
              <Button onClick={() => {
                console.log('Submit edit search config with data:', searchConfigData);
                handleUpdateSearchConfig(selectedSearchConfig.id, searchConfigData);
              }}>
                Bijwerken
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showViewSearchConfig && selectedSearchConfig && (
        <Dialog open={true} onOpenChange={(open) => {
          console.log('View dialog open state changed:', open);
          if (!open) {
            setShowViewSearchConfig(false);
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Zoek Configuratie Details</DialogTitle>
              <DialogDescription>
                Details van zoek configuratie: {selectedSearchConfig.context}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Context</Label>
                  <p className="text-sm text-gray-600">{selectedSearchConfig.context}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <p className="text-sm text-gray-600">
                    <Badge variant={selectedSearchConfig.isActive ? "default" : "secondary"}>
                      {selectedSearchConfig.isActive ? "Actief" : "Inactief"}
                    </Badge>
                  </p>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Placeholder Tekst</Label>
                <p className="text-sm text-gray-600">{selectedSearchConfig.placeholderText}</p>
              </div>
              <div>
                <Label className="font-semibold">Zoekbereik</Label>
                <p className="text-sm text-gray-600">
                  <Badge variant="outline">{selectedSearchConfig.searchScope}</Badge>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Locatie Filter</Label>
                  <p className="text-sm text-gray-600">
                    {selectedSearchConfig.enableLocationFilter ? "Ingeschakeld" : "Uitgeschakeld"}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Categorie Filter</Label>
                  <p className="text-sm text-gray-600">
                    {selectedSearchConfig.enableCategoryFilter ? "Ingeschakeld" : "Uitgeschakeld"}
                  </p>
                </div>
              </div>
              {selectedSearchConfig.redirectPattern && (
                <div>
                  <Label className="font-semibold">Redirect Patroon</Label>
                  <p className="text-sm text-gray-600">{selectedSearchConfig.redirectPattern}</p>
                </div>
              )}
              {selectedSearchConfig.customInstructions && (
                <div>
                  <Label className="font-semibold">Aangepaste Instructies</Label>
                  <p className="text-sm text-gray-600">{selectedSearchConfig.customInstructions}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <Label className="font-semibold">Aangemaakt</Label>
                  <p>{new Date(selectedSearchConfig.createdAt).toLocaleString('nl-NL')}</p>
                </div>
                <div>
                  <Label className="font-semibold">Laatst bijgewerkt</Label>
                  <p>{new Date(selectedSearchConfig.updatedAt).toLocaleString('nl-NL')}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewSearchConfig(false)}>
                Sluiten
              </Button>
              <Button onClick={() => {
                console.log('Switch from view to edit search config');
                setSearchConfigData({
                  context: selectedSearchConfig.context || '',
                  placeholderText: selectedSearchConfig.placeholderText || '',
                  searchScope: selectedSearchConfig.searchScope || 'destinations',
                  enableLocationFilter: Boolean(selectedSearchConfig.enableLocationFilter),
                  enableCategoryFilter: Boolean(selectedSearchConfig.enableCategoryFilter),
                  customInstructions: selectedSearchConfig.customInstructions || '',
                  redirectPattern: selectedSearchConfig.redirectPattern || '',
                  isActive: Boolean(selectedSearchConfig.isActive)
                });
                setShowViewSearchConfig(false);
                setShowEditSearchConfig(true);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Bewerken
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Activity dialogs */}
      {showEditActivity && selectedActivity && (
        <EditActivityDialog
          open={showEditActivity}
          onOpenChange={setShowEditActivity}
          activity={selectedActivity}
          onActivityUpdated={() => {
            activitiesQuery.refetch();
            setShowEditActivity(false);
          }}
        />
      )}

      {showViewActivity && selectedActivity && (
        <ViewActivityDialog
          open={showViewActivity}
          onOpenChange={setShowViewActivity}
          activity={selectedActivity}
        />
      )}
    </div>
  );
}

// Activity Delete Function
async function handleDeleteActivity(activityId: number, activityName: string, activitiesQuery: any, toast: any) {
  try {
    const response = await fetch(`/api/admin/activities/${activityId}/soft-delete`, {
      method: 'PATCH',
      credentials: 'include'
    });

    if (response.ok) {
      toast({ 
        title: "Activiteit verwijderd", 
        description: `${activityName} is naar de prullenbak verplaatst` 
      });
      activitiesQuery.refetch();
    } else {
      throw new Error('Fout bij verwijderen activiteit');
    }
  } catch (error) {
    toast({ 
      title: "Fout", 
      description: "Er is een fout opgetreden bij het verwijderen", 
      variant: "destructive" 
    });
  }
}
