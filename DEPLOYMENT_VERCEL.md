# Vercel Deployment Guide voor Ontdek Polen

## ✅ Build Configuratie Voltooid

Je project is nu klaar voor deployment op Vercel. Alle benodigde configuratie is aangemaakt:

### 📁 Aangemaakte bestanden:
- `vercel.json` - Vercel deployment configuratie
- `build.js` - Production build script
- `.vercelignore` - Bestanden die Vercel moet negeren

### 🏗️ Build Process:
Het `npm run build` commando creëert:
- `dist/public/` - Je React frontend (HTML, CSS, JS)
- `dist/index.js` - Je Express backend server
- Alle statische assets (afbeeldingen, favicon)

## 🚀 Deployment Stappen voor Vercel:

### 1. Upload naar GitHub
- Upload je project naar een GitHub repository
- Zorg dat alle bestanden erin staan (inclusief de nieuwe `vercel.json`)

### 2. Vercel Instellingen:
Bij importeren in Vercel:
- **Framework Preset**: "Other"
- **Build Command**: `npm run build` (automatisch gedetecteerd)
- **Output Directory**: `dist/public` (automatisch ingesteld via vercel.json)
- **Root Directory**: `./` (standaard)

### 3. Environment Variables:
Voeg toe in Vercel Settings → Environment Variables:
- `DATABASE_URL`: Je Neon database connection string
- `NODE_ENV`: `production`

### 4. Deploy:
- Klik "Deploy" in Vercel
- Je site wordt automatisch gebouwd en gehost

## 🎯 Wat er gebeurt bij deployment:
1. Vercel installeert dependencies (`npm install`)
2. Bouwt je React frontend (`vite build`)
3. Bouwt je Express server (`esbuild`)
4. Serveert statische bestanden vanuit `dist/public/`
5. API routes worden gehandeld door `dist/index.js`

## ✨ Resultaat:
- **Frontend**: Je Polish Travel Platform homepage, bestemmingen, admin panel
- **Backend**: Alle API endpoints voor database, authentication, CMS
- **Database**: Blijft verbonden met je Neon PostgreSQL
- **Functionaliteit**: Exact hetzelfde als in Replit

## 🔧 Troubleshooting:
Als deployment faalt:
1. Check build logs in Vercel dashboard
2. Controleer of `DATABASE_URL` correct is ingesteld
3. Zorg dat GitHub repo publiek is of Vercel toegang heeft

Je website blijft volledig functioneel - alleen de hosting verandert van Replit naar Vercel!