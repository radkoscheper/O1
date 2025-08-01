# Railway Deployment Guide - Ontdek Polen
*Eenvoudige Fullstack Hosting met Automatische Deployments*

## Overzicht
Railway biedt eenvoudige deployment met automatische Git integratie. Perfect voor fullstack Node.js applicaties met database ondersteuning.

**Kosten:** $5/maand voor hobby projecten (geen gratis tier)

## Vereisten
- **Database:** Neon PostgreSQL (huidige setup) of Railway PostgreSQL
- **Code:** GitHub repository
- **Build configuratie:** `railway.json` (al geconfigureerd)

## Stap-voor-stap Deployment

### 1. Railway Account
1. Ga naar [railway.app](https://railway.app)
2. Maak account aan via GitHub
3. Connecteer je GitHub account

### 2. New Project
1. Klik "New Project"
2. Selecteer "Deploy from GitHub repo"
3. Kies je Ontdek Polen repository
4. Railway detecteert automatisch Node.js project

### 3. Environment Variables
Ga naar Variables tab en voeg toe:
```bash
DATABASE_URL=postgresql://username:password@ep-shrill-brook-a4kt6cjb.us-east-1.aws.neon.tech:5432/neondb
NODE_ENV=production
SESSION_SECRET=een-willekeurige-lange-string-voor-sessies
PORT=5000
```

### 4. Build Configuration
Railway gebruikt automatisch je `package.json` scripts:
- **Build Command:** `npm run build` (automatisch)
- **Start Command:** `npm start` (automatisch)
- **Install Command:** `npm install` (automatisch)

### 5. Deploy
- Railway deployet automatisch na environment setup
- Je krijgt een `.railway.app` URL
- HTTPS is automatisch geconfigureerd

## Build Process
Railway voert automatisch uit:
1. `npm install` - Dependencies installeren
2. `npm run build` - Frontend + backend build
3. `npm start` - Server starten op poort 5000

## Custom Domain
1. Ga naar Settings → Domains
2. Voeg custom domain toe
3. Configureer CNAME bij je DNS provider
4. SSL certificaat automatisch toegevoegd

## Automatische Deployments
- Elke push naar main branch triggert deployment
- Preview deployments voor feature branches
- Rollback naar eerdere versies mogelijk
- Build logs real-time zichtbaar

## Database Opties

### Optie 1: Bestaande Neon Database (Aanbevolen)
Gebruik je huidige Neon PostgreSQL setup:
```bash
DATABASE_URL=postgresql://username:password@ep-shrill-brook-a4kt6cjb.us-east-1.aws.neon.tech:5432/neondb
```

### Optie 2: Railway PostgreSQL
Railway kan ook een database voor je hosten:
1. Add Service → PostgreSQL
2. Railway genereert automatisch DATABASE_URL
3. Kost extra ($5-10/maand)

## Performance & Monitoring

### Metrics
- CPU en memory usage
- Request response times
- Error rates en logs
- Database connection monitoring

### Scaling
- Automatische horizontal scaling
- Custom resource limits instelbaar
- Load balancing ingebouwd

## Troubleshooting

### Build Errors
```bash
# Check build logs in Railway dashboard
# Common issues:
- Node.js version mismatch
- Missing environment variables
- Build timeout (5 minuten max)
```

### Runtime Errors
```bash
# Check application logs
railway logs
# Of via dashboard → Logs tab
```

### Database Issues
```bash
# Test database connection
railway run node -e "console.log('DB:', process.env.DATABASE_URL.slice(0,20))"
```

## CLI Usage (Optioneel)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login en deploy
railway login
railway link [project-id]
railway up

# Logs bekijken
railway logs

# Environment variabelen
railway variables
```

## Voordelen Railway
✅ Zeer eenvoudige setup (5 minuten)  
✅ Automatische deployments  
✅ Excellente build logs  
✅ Built-in monitoring  
✅ Custom domains met SSL  
✅ Environment per branch  
✅ Rollback functionaliteit  

## Nadelen Railway
❌ Geen gratis tier  
❌ Beperkte free credits  
❌ Build timeout van 5 minuten  

## Kostenoverzicht
- **Hobby:** $5/maand
- **Pro:** $20/maand (team features)
- **Database addon:** +$5-10/maand (als je Railway PostgreSQL gebruikt)

Voor je Ontdek Polen platform is de Hobby tier perfect.

## Custom Configuratie
Je `railway.json` bevat al optimale instellingen:
```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "always"
  }
}
```

## Conclusie
Railway is uitstekend voor je Polish Travel Platform als je:
- Eenvoudige deployment wilt
- Bereid bent ~$5/maand te betalen
- Automatische monitoring waardeert
- Git-based workflow prefereert

Voor gratis hosting gebruik **Vercel**. Voor Nederlandse hosting gebruik **VPS providers**.