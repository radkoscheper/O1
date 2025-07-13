# CMS Commands - Ontdek Polen

## Snelle commands

### Content beheer
```bash
# Nieuwe bestemming toevoegen
node cms/cli.js new:destination "Warsaw"

# Nieuwe reisgids toevoegen  
node cms/cli.js new:guide "Weekend in Warsaw"

# Alle content bekijken
node cms/cli.js list

# Data bestanden genereren
node cms/cli.js generate

# Volledige build
node cms/cli.js build
```

### Workflow
1. **Content toevoegen** → `new:destination` of `new:guide`
2. **Bewerk JSON bestanden** in `content/` mappen
3. **Genereer data** → `generate`
4. **Test website** → `npm run dev`
5. **Build voor productie** → `build`

## Content structuur

### Bestemming (`content/destinations/naam.json`)
```json
{
  "id": 1,
  "name": "Warsaw",
  "slug": "warsaw",
  "image": "/images/warsaw.jpg",
  "alt": "Warsaw",
  "description": "Korte beschrijving",
  "content": "# Titel\n\nMarkdown content hier...",
  "featured": true,
  "published": true,
  "createdAt": "2025-01-13T17:00:00.000Z"
}
```

### Reisgids (`content/guides/naam.json`)
```json
{
  "id": 1,
  "title": "3 Dagen in Warsaw",
  "slug": "3-dagen-in-warsaw",
  "image": "/images/warsaw-guide.jpg",
  "alt": "3 Dagen in Warsaw",
  "description": "Complete gids",
  "content": "# Titel\n\nMarkdown content hier...",
  "featured": true,
  "published": true,
  "createdAt": "2025-01-13T17:00:00.000Z"
}
```

## Afbeeldingen

Plaats afbeeldingen in `client/public/images/`:
- `naam.jpg` - Voor bestemmingen
- `gids-naam.jpg` - Voor reisgidsen  
- `header.jpg` - Hero achtergrond
- `tatra-vallei.jpg` - CTA sectie

## Automatische integratie

Het CMS systeem:
- ✅ Genereert automatisch TypeScript bestanden
- ✅ Filters gepubliceerde content
- ✅ Werkt met bestaande website code
- ✅ Ondersteunt Markdown formatting
- ✅ Netlify compatible