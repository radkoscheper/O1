# Vercel Deployment Guide - Ontdek Polen
*Complete Polish Travel Platform met CMS - Fullstack Hosting*

## Overzicht
Vercel is uitstekend geschikt voor fullstack React/Express applications. Je krijgt automatische deployments, serverless functions, en een globale CDN.

**Kosten:** Gratis tier voor hobby projecten, Pro vanaf $20/maand

## Vereisten
- **Database:** Neon PostgreSQL (huidige setup)
- **Code:** GitHub/GitLab repository
- **Build bestanden:** `vercel.json`, `build.js` (al geconfigureerd)

## Stap-voor-stap Deployment

### 1. Code Voorbereiden
```bash
# Controleer of alle configuratie aanwezig is
ls vercel.json build.js .vercelignore
# Test lokale build
npm run build
```

### 2. Vercel Account & Repository
1. Maak account aan op [vercel.com](https://vercel.com)
2. Verbind je GitHub account
3. Upload project naar GitHub repository

### 3. Project Importeren
1. Klik "New Project" in Vercel dashboard
2. Selecteer je GitHub repository
3. Import settings:
   - **Framework Preset:** "Other"
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/public`
   - **Install Command:** `npm install`

### 4. Environment Variables
Ga naar Settings → Environment Variables en voeg toe:
```
DATABASE_URL=postgresql://username:password@ep-shrill-brook-a4kt6cjb.us-east-1.aws.neon.tech:5432/neondb
NODE_ENV=production
SESSION_SECRET=een-willekeurige-lange-string-voor-sessies
```

### 5. Deploy
- Klik "Deploy"
- Vercel bouwt automatisch je applicatie
- Je krijgt een `.vercel.app` URL

## Build Process Details
Het `npm run build` script creëert:
- `dist/public/` - React frontend met routing
- `dist/index.js` - Express.js server bundle
- Afbeeldingen en assets in juiste directories

## Custom Domain (Optioneel)
1. Ga naar Settings → Domains
2. Voeg je eigen domain toe
3. Configureer DNS records bij je domain provider
4. SSL certificaat wordt automatisch toegevoegd

## Automatische Deployments
- Elke push naar main branch triggert nieuwe deployment
- Preview deployments voor andere branches
- Rollback naar eerdere versies mogelijk

## Troubleshooting

**Build Errors:**
- Check build logs in Vercel dashboard
- Controleer Node.js versie (>=18)
- Verify all dependencies in package.json

**Database Connection:**
- Controleer DATABASE_URL formatting
- Test connection vanuit lokale omgeving
- Check Neon database status

**404 Errors:**
- Controleer vercel.json redirects configuratie
- Test routes lokaal eerst

## Performance Optimalisatie
- Automatische CDN voor alle assets
- Gzip compressie ingeschakeld
- Edge caching voor API responses

## Monitoring
- Real-time function logs
- Performance metrics
- Error tracking in dashboard

## Kosten Overzicht
- **Hobby (Gratis):** 100GB bandwidth, 100 deployments/maand
- **Pro ($20/maand):** Onbeperkt bandwidth, custom domains, team features

Voor je Polish Travel Platform is de gratis tier waarschijnlijk voldoende voor starten.