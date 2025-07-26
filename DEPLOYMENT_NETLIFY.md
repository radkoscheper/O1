# Netlify Deployment Guide - Ontdek Polen
*Frontend-only Static Hosting (Beperkte Functionaliteit)*

## ⚠️ Belangrijke Beperking
**Netlify ondersteunt GEEN volledige backend functionaliteit.** Je krijgt alleen de frontend zonder:
- Admin panel / CMS functionaliteit
- Database connectie
- User authentication
- File uploads
- Dynamic content management

Voor volledige functionaliteit gebruik **Vercel**, **Railway**, **Render**, of **VPS hosting**.

## Wanneer Netlify Gebruiken
- Demo/preview versie
- Statische content showcase
- Frontend development testen
- Basis website zonder admin functies

## Deployment Stappen

### 1. Code Voorbereiden
```bash
# Alleen frontend build (geen server)
npm run build:frontend
# Of handmatig:
cd client && npm run build
```

### 2. GitHub Setup
```bash
git init
git add .
git commit -m "Frontend deploy"
git remote add origin https://github.com/username/ontdek-polen.git
git push -u origin main
```

### 3. Netlify Deployment

**Optie A: Automatisch via GitHub**
1. Ga naar [netlify.com](https://netlify.com)
2. "New site from Git" → selecteer repository
3. Build settings:
   - **Build command:** `cd client && npm run build`
   - **Publish directory:** `client/dist`
   - **Node version:** `20`

**Optie B: Drag & Drop**
1. Lokaal: `cd client && npm run build`
2. Upload `client/dist` folder naar Netlify

### 4. Configuratie
Environment variables (beperkt):
```
NODE_ENV=production
VITE_API_URL=https://jouw-backend.vercel.app
```

### 5. Custom Domain (Optioneel)
1. Settings → Domain management
2. Voeg custom domain toe
3. Configureer DNS bij domain provider

## Beperkingen op Netlify

### Wat WERKT:
✅ Homepage met statische content  
✅ Bestemmingen overzicht (hardcoded)  
✅ Basis navigatie  
✅ Responsive design  
✅ Afbeeldingen en styling  

### Wat NIET WERKT:
❌ Admin panel toegang  
❌ Content bewerken via CMS  
❌ Database-driven content  
❌ User login/registratie  
❌ Dynamic pagina's  
❌ Search functionaliteit  
❌ File uploads  

## Alternatieve Oplossing
Voor volledige functionaliteit kombineer:
- **Frontend:** Netlify (gratis static hosting)
- **Backend:** Vercel/Railway (API endpoints)
- **Database:** Neon PostgreSQL (gratis tier)

## Build Commands

```bash
# Frontend-only build
npm run build:client

# Full build (voor andere platforms)
npm run build

# Development
npm run dev
```

## Troubleshooting

**Build Errors:**
- Controleer Node.js versie (20+)
- Verify frontend dependencies
- Check build path: `client/dist`

**Routing Issues:**
- Netlify redirects via `_redirects` file
- SPA routing via `netlify.toml`

**Images Missing:**
- Upload afbeeldingen naar `client/public/images/`
- Check image paths in code

## Kosten
- **Gratis tier:** 100GB bandwidth, 300 build minuten
- **Pro ($19/maand):** Meer bandwidth, custom domains

## Conclusie
Netlify is geschikt voor basis frontend hosting, maar voor je volledige Polish Travel Platform CMS gebruik **Vercel** (aanbevolen) of andere fullstack hosting providers.