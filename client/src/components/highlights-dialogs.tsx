import { useState } from 'react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Eye, Edit, Plus, Upload } from 'lucide-react';
import { uploadFile } from '@/lib/uploadUtils';

// Highlights dialog components
export function CreateHighlightDialog({ open, onOpenChange, onHighlightCreated }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onHighlightCreated: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: '',
    iconPath: '',
    category: 'general',
    ranking: 0,
    active: true,
    showOnHomepage: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const availableIcons = [
    'wawel-castle', 'krakow-market', 'st-marys', 'kazimierz',
    'gdansk-church', 'gdansk-market', 'artus-court', 'amber-museum',
    'morskie-oko', 'gubalowka', 'zakopane', 'rysy-peak',
    'forest-paths', 'europese-wisent', 'bird-watching', 'nature-museum', 'forest-photography',
    'warsaw-oldtown', 'warsaw-castle', 'lazienki', 'wilanow'
  ];

  const categories = [
    { value: 'general', label: 'Algemeen' },
    { value: 'historical', label: 'Historisch' },
    { value: 'nature', label: 'Natuur' },
    { value: 'cultural', label: 'Cultureel' },
    { value: 'adventure', label: 'Avontuur' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.iconPath.trim()) {
      toast({ title: "Fout", description: "Naam en icon zijn verplicht", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({ title: "Succes", description: "Highlight succesvol aangemaakt" });
        onHighlightCreated();
        setFormData({ name: '', iconPath: '', category: 'general', ranking: 0, active: true, showOnHomepage: true });
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nieuwe Highlight Toevoegen</DialogTitle>
          <DialogDescription>
            Voeg een nieuwe highlight toe aan de homepage
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="highlight-name">Naam <span className="text-red-500">*</span></Label>
              <Input
                id="highlight-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Bijv. Wawel Kasteel"
                required
              />
            </div>
            <div>
              <Label htmlFor="highlight-category">Categorie</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="highlight-ranking">Ranking (volgorde)</Label>
              <Input
                id="highlight-ranking"
                type="number"
                value={formData.ranking}
                onChange={(e) => setFormData({...formData, ranking: parseInt(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="highlight-active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({...formData, active: checked})}
              />
              <Label htmlFor="highlight-active">Actief</Label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="highlight-homepage"
              checked={formData.showOnHomepage}
              onCheckedChange={(checked) => setFormData({...formData, showOnHomepage: checked})}
            />
            <Label htmlFor="highlight-homepage">Toon op Homepage</Label>
          </div>

          <div>
            <Label>Icon selecteren <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-6 gap-3 mt-2 p-4 border rounded-lg max-h-48 overflow-y-auto">
              {availableIcons.map(icon => (
                <div 
                  key={icon}
                  className={`p-2 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    formData.iconPath === `/images/highlights/${icon}.svg` ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setFormData({...formData, iconPath: `/images/highlights/${icon}.svg`})}
                >
                  <img 
                    src={`/images/highlights/${icon}.svg`} 
                    alt={icon}
                    className="w-8 h-8 mx-auto"
                    onError={(e) => {
                      e.currentTarget.src = '/images/highlights/placeholder.svg';
                    }}
                  />
                  <p className="text-xs text-center mt-1 truncate">{icon}</p>
                </div>
              ))}
            </div>
            {formData.iconPath && (
              <div className="mt-2 p-2 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Geselecteerd: {formData.iconPath}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Bezig...' : 'Highlight Toevoegen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditHighlightDialogContent({ open, onOpenChange, highlight, editData, setEditData, onSave }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  highlight: any;
  editData: any;
  setEditData: (data: any) => void;
  onSave: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const availableIcons = [
    'wawel-castle', 'krakow-market', 'st-marys', 'kazimierz',
    'gdansk-church', 'gdansk-market', 'artus-court', 'amber-museum',
    'morskie-oko', 'gubalowka', 'zakopane', 'rysy-peak',
    'forest-paths', 'europese-wisent', 'bird-watching', 'nature-museum', 'forest-photography',
    'warsaw-oldtown', 'warsaw-castle', 'lazienki', 'wilanow'
  ];

  const categories = [
    { value: 'general', label: 'Algemeen' },
    { value: 'historical', label: 'Historisch' },
    { value: 'nature', label: 'Natuur' },
    { value: 'cultural', label: 'Cultureel' },
    { value: 'adventure', label: 'Avontuur' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData.name.trim() || !editData.iconPath.trim()) {
      toast({ title: "Fout", description: "Naam en icon zijn verplicht", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/highlights/${highlight.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        toast({ title: "Succes", description: "Highlight succesvol bijgewerkt" });
        onSave();
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Highlight Bewerken</DialogTitle>
          <DialogDescription>
            Bewerk de highlight: {highlight?.name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="edit-highlight-name">Naam <span className="text-red-500">*</span></Label>
              <Input
                id="edit-highlight-name"
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
                placeholder="Bijv. Wawel Kasteel"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-highlight-category">Categorie</Label>
              <Select 
                value={editData.category} 
                onValueChange={(value) => setEditData({...editData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="edit-highlight-ranking">Ranking (volgorde)</Label>
              <Input
                id="edit-highlight-ranking"
                type="number"
                value={editData.ranking}
                onChange={(e) => setEditData({...editData, ranking: parseInt(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="edit-highlight-active"
                checked={editData.active}
                onCheckedChange={(checked) => setEditData({...editData, active: checked})}
              />
              <Label htmlFor="edit-highlight-active">Actief</Label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="edit-highlight-homepage"
              checked={editData.showOnHomepage}
              onCheckedChange={(checked) => setEditData({...editData, showOnHomepage: checked})}
            />
            <Label htmlFor="edit-highlight-homepage">Toon op Homepage</Label>
          </div>

          <div>
            <Label>Icon selecteren <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-6 gap-3 mt-2 p-4 border rounded-lg max-h-48 overflow-y-auto">
              {availableIcons.map(icon => (
                <div 
                  key={icon}
                  className={`p-2 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    editData.iconPath === `/images/highlights/${icon}.svg` ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setEditData({...editData, iconPath: `/images/highlights/${icon}.svg`})}
                >
                  <img 
                    src={`/images/highlights/${icon}.svg`} 
                    alt={icon}
                    className="w-8 h-8 mx-auto"
                    onError={(e) => {
                      e.currentTarget.src = '/images/highlights/placeholder.svg';
                    }}
                  />
                  <p className="text-xs text-center mt-1 truncate">{icon}</p>
                </div>
              ))}
            </div>
            {editData.iconPath && (
              <div className="mt-2 p-2 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Geselecteerd: {editData.iconPath}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Bezig...' : 'Highlight Opslaan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Simple Button-based dialogs for use in other interfaces
export function ViewHighlightDialog({ highlight }: { highlight: any }) {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => setOpen(true)}
        className="text-xs"
      >
        <Eye className="h-3 w-3" />
      </Button>
      <ViewHighlightDialogContent open={open} onOpenChange={setOpen} highlight={highlight} />
    </>
  );
}

export function EditHighlightDialog({ highlight, onUpdate }: { highlight: any; onUpdate: () => void }) {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: highlight?.name || '',
    iconPath: highlight?.iconPath || '',
    category: highlight?.category || 'general',
    ranking: highlight?.ranking || 0,
    active: highlight?.active || true,
    showOnHomepage: highlight?.showOnHomepage || true
  });

  // Update editData when highlight changes
  React.useEffect(() => {
    if (highlight) {
      setEditData({
        name: highlight.name || '',
        iconPath: highlight.iconPath || '',
        category: highlight.category || 'general',
        ranking: highlight.ranking || 0,
        active: highlight.active || true,
        showOnHomepage: highlight.showOnHomepage || true
      });
    }
  }, [highlight]);

  return (
    <>
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => setOpen(true)}
        className="text-xs"
      >
        <Edit className="h-3 w-3" />
      </Button>
      <EditHighlightDialogContent 
        open={open} 
        onOpenChange={setOpen}
        highlight={highlight}
        editData={editData}
        setEditData={setEditData}
        onSave={() => {
          onUpdate();
          setOpen(false);
        }}
      />
    </>
  );
}

export function ViewHighlightDialogContent({ open, onOpenChange, highlight }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  highlight: any;
}) {
  const categories = {
    'general': 'Algemeen',
    'historical': 'Historisch', 
    'nature': 'Natuur',
    'cultural': 'Cultureel',
    'adventure': 'Avontuur'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Highlight Details</DialogTitle>
          <DialogDescription>
            Bekijk de details van deze highlight
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
            <img
              src={highlight.iconPath}
              alt={highlight.name}
              className="w-16 h-16"
              onError={(e) => {
                e.currentTarget.src = '/images/highlights/placeholder.svg';
              }}
            />
          </div>

          <div className="grid gap-3">
            <div>
              <Label className="text-sm font-medium text-gray-500">Naam</Label>
              <p className="text-lg font-semibold">{highlight.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Categorie</Label>
                <p>{categories[highlight.category] || highlight.category}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Ranking</Label>
                <p>#{highlight.ranking}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-500">Status</Label>
              <div className="flex gap-2 mt-1">
                <Badge variant={highlight.active ? "default" : "outline"}>
                  {highlight.active ? "✅ Actief" : "❌ Inactief"}
                </Badge>
                <Badge variant={highlight.showOnHomepage ? "default" : "outline"}>
                  {highlight.showOnHomepage ? "🏠 Homepage" : "🚫 Niet homepage"}
                </Badge>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-500">Icon Path</Label>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">{highlight.iconPath}</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Sluiten
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Image Upload Field component
function ImageUploadField({ label, value, onChange, placeholder, fileName, destination }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fileName?: string;
  destination?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await uploadFile({
        file,
        fileName,
        destination: destination || 'destinations',
        type: 'image'
      });
      onChange(result.imagePath || '');
      toast({ title: "Success", description: "Afbeelding succesvol geüpload" });
    } catch (error) {
      toast({ title: "Error", description: "Upload mislukt", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <Label htmlFor={`upload-${label}`}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={`upload-${label}`}
          type="text"
          placeholder={placeholder || "/images/destinations/example.jpg"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => document.getElementById(`file-${label}`)?.click()}
        >
          {isUploading ? "Uploading..." : <Upload className="h-4 w-4" />}
        </Button>
        <input
          id={`file-${label}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />
      </div>
      {value && (
        <div className="mt-2">
          <img src={value} alt="Preview" className="h-20 w-20 object-cover rounded" />
        </div>
      )}
    </div>
  );
}

// Create Destination Dialog
export function CreateDestinationDialog({ open, onOpenChange, onDestinationCreated }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDestinationCreated: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    content: '',
    image: '',
    alt: '',
    link: '',
    ranking: 0,
    featured: false,
    published: true,
    showOnHomepage: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim() || !formData.image.trim() || !formData.alt.trim()) {
      toast({ title: "Fout", description: "Naam, beschrijving, afbeelding en alt-tekst zijn verplicht", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({ title: "Succes", description: "Bestemming succesvol aangemaakt" });
        onDestinationCreated();
        setFormData({
          name: '',
          location: '',
          description: '',
          content: '',
          image: '',
          alt: '',
          link: '',
          ranking: 0,
          featured: false,
          published: true,
          showOnHomepage: true
        });
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nieuwe Bestemming Toevoegen</DialogTitle>
          <DialogDescription>
            Voeg een nieuwe bestemming toe aan je website
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="dest-name">Naam <span className="text-red-500">*</span></Label>
              <Input
                id="dest-name"
                placeholder="Bijv. Warsaw"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={!formData.name.trim() ? "border-red-300" : ""}
              />
            </div>
            <div>
              <Label htmlFor="dest-location">Plaats/Locatie</Label>
              <Input
                id="dest-location"
                placeholder="Bijv. Krakow, Warschau"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dest-ranking">Ranking (volgorde)</Label>
            <Input
              id="dest-ranking"
              type="number"
              placeholder="0"
              value={formData.ranking}
              onChange={(e) => setFormData({...formData, ranking: parseInt(e.target.value) || 0})}
            />
          </div>

          <ImageUploadField
            label="Afbeelding *"
            value={formData.image}
            onChange={(value) => setFormData({...formData, image: value})}
            placeholder="/images/destinations/warsaw.jpg"
            fileName={formData.name}
            destination="destinations"
          />

          <div>
            <Label htmlFor="dest-alt">Alt-tekst *</Label>
            <Input
              id="dest-alt"
              placeholder="Bijv. Krakow marktplein"
              value={formData.alt}
              onChange={(e) => setFormData({...formData, alt: e.target.value})}
              className={!formData.alt.trim() ? "border-red-300" : ""}
            />
          </div>

          <div>
            <Label htmlFor="dest-description">Beschrijving <span className="text-red-500">*</span></Label>
            <Textarea
              id="dest-description"
              placeholder="Beschrijf waarom deze bestemming de moeite waard is..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className={!formData.description.trim() ? "border-red-300" : ""}
            />
          </div>

          <div>
            <Label htmlFor="dest-content">Volledige inhoud</Label>
            <Textarea
              id="dest-content"
              placeholder="Uitgebreide beschrijving van de bestemming..."
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor="dest-link">Link (optioneel)</Label>
            <Input
              id="dest-link"
              placeholder="Bijv. /krakow-bezoeken of https://example.com"
              value={formData.link}
              onChange={(e) => setFormData({...formData, link: e.target.value})}
            />
            <p className="text-sm text-gray-500 mt-1">
              Link waar de afbeelding naartoe moet leiden. Gebruik interne links (bijv. /pagina) of externe links (bijv. https://website.com)
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="dest-featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
              />
              <Label htmlFor="dest-featured">Featured</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="dest-published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({...formData, published: checked})}
              />
              <Label htmlFor="dest-published">Publiceren</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="dest-homepage"
                checked={formData.showOnHomepage}
                onCheckedChange={(checked) => setFormData({...formData, showOnHomepage: checked})}
              />
              <Label htmlFor="dest-homepage">Homepage</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Bezig..." : <><Plus className="h-4 w-4 mr-2" /> Bestemming Aanmaken</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Create Guide Dialog
export function CreateGuideDialog({ open, onOpenChange, onGuideCreated }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuideCreated: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    image: '',
    alt: '',
    link: '',
    ranking: 0,
    featured: false,
    published: true,
    showOnHomepage: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({ title: "Fout", description: "Titel en beschrijving zijn verplicht", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({ title: "Succes", description: "Reisgids succesvol aangemaakt" });
        onGuideCreated();
        setFormData({
          title: '',
          description: '',
          content: '',
          image: '',
          alt: '',
          link: '',
          ranking: 0,
          featured: false,
          published: true,
          showOnHomepage: true
        });
      } else {
        const error = await response.json();
        toast({ title: "Fout", description: error.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Fout", description: "Er is een fout opgetreden", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nieuwe Reisgids Toevoegen</DialogTitle>
          <DialogDescription>
            Voeg een nieuwe reisgids toe aan je website
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="guide-title">Titel <span className="text-red-500">*</span></Label>
            <Input
              id="guide-title"
              placeholder="Bijv. 3 Dagen in Krakau"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className={!formData.title.trim() ? "border-red-300" : ""}
            />
          </div>

          <div>
            <Label htmlFor="guide-ranking">Ranking (volgorde)</Label>
            <Input
              id="guide-ranking"
              type="number"
              placeholder="0"
              value={formData.ranking}
              onChange={(e) => setFormData({...formData, ranking: parseInt(e.target.value) || 0})}
            />
          </div>

          <ImageUploadField
            label="Afbeelding"
            value={formData.image}
            onChange={(value) => setFormData({...formData, image: value})}
            placeholder="/images/guides/krakau-gids.jpg"
            fileName={formData.title}
            destination="guides"
          />

          <div>
            <Label htmlFor="guide-alt">Alt-tekst</Label>
            <Input
              id="guide-alt"
              placeholder="Bijv. Krakau reisgids afbeelding"
              value={formData.alt}
              onChange={(e) => setFormData({...formData, alt: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="guide-description">Beschrijving <span className="text-red-500">*</span></Label>
            <Textarea
              id="guide-description"
              placeholder="Beschrijf wat deze reisgids bevat..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className={!formData.description.trim() ? "border-red-300" : ""}
            />
          </div>

          <div>
            <Label htmlFor="guide-content">Volledige inhoud</Label>
            <Textarea
              id="guide-content"
              placeholder="Uitgebreide inhoud van de reisgids..."
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor="guide-link">Link (optioneel)</Label>
            <Input
              id="guide-link"
              placeholder="Bijv. /krakau-gids of https://example.com"
              value={formData.link}
              onChange={(e) => setFormData({...formData, link: e.target.value})}
            />
            <p className="text-sm text-gray-500 mt-1">
              Link waar de afbeelding naartoe moet leiden
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="guide-featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
              />
              <Label htmlFor="guide-featured">Featured</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="guide-published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({...formData, published: checked})}
              />
              <Label htmlFor="guide-published">Publiceren</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="guide-homepage"
                checked={formData.showOnHomepage}
                onCheckedChange={(checked) => setFormData({...formData, showOnHomepage: checked})}
              />
              <Label htmlFor="guide-homepage">Homepage</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Bezig..." : <><Plus className="h-4 w-4 mr-2" /> Reisgids Aanmaken</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}