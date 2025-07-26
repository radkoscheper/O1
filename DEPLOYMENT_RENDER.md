# Render Deployment Guide - Ontdek Polen
*Betrouwbare Fullstack Hosting met Gratis Tier*

## Overzicht
Render is uitstekend voor fullstack Node.js applicaties met gratis tier optie. Goede balans tussen features en kosten.

**Kosten:** Gratis tier beschikbaar, Pro vanaf $7/maand

## Vereisten
- **Database:** Neon PostgreSQL (huidige setup) of Render PostgreSQL
- **Code:** GitHub/GitLab repository
- **Build configuratie:** `render.yaml` (al geconfigureerd)

## Stap-voor-stap Deployment

### 1. Render Account
1. Ga naar [render.com](https://render.com)
2. Maak gratis account aan
3. Verbind GitHub/GitLab account

### 2. Web Service Maken
1. Dashboard → "New" → "Web Service"
2. Selecteer je GitHub repository
3. Service configuratie:
   - **Name:** ontdek-polen
   - **Branch:** main
   - **Root Directory:** . (leeg laten)
   - **Runtime:** Node

### 3. Build & Deploy Settings
```bash
# Build Command
npm install && npm run build

# Start Command  
npm start

# Node Version
20
```

### 4. Environment Variables
Voeg toe via Environment tab:
```bash
DATABASE_URL=postgresql://username:password@ep-shrill-brook-a4kt6cjb.us-east-1.aws.neon.tech:5432/neondb
NODE_ENV=production
SESSION_SECRET=een-willekeurige-lange-string-voor-sessies
PORT=10000
```

### 5. Deploy
- Klik "Deploy Web Service"
- Render bouwt en deployet automatisch
- Je krijgt een `.onrender.com` URL

## Gratis vs Pro Tier

### Gratis Tier Beperkingen
⚠️ **Spin Down:** Service slaapt na 15 minuten inactiviteit  
⚠️ **Cold Start:** Eerste request na slaap duurt 30+ seconden  
⚠️ **Bandwidth:** 100GB/maand  
⚠️ **Build Time:** 500 uur/maand  

### Pro Tier ($7/maand)
✅ **Always On:** Geen spin down  
✅ **Custom Domains:** Met SSL  
✅ **Onbeperkte builds**  
✅ **Priority support**  

## Database Opties

### Optie 1: Bestaande Neon Database (Aanbevolen)
Gebruik je huidige Neon PostgreSQL:
```bash
DATABASE_URL=postgresql://username:password@ep-shrill-brook-a4kt6cjb.us-east-1.aws.neon.tech:5432/neondb
```

### Optie 2: Render PostgreSQL
1. Dashboard → "New" → "PostgreSQL"
2. Kies plan (gratis beschikbaar)
3. Render genereert DATABASE_URL automatisch
4. Connect via Internal Database URL

## Automatische Deployments
- Elke push naar main branch triggert deployment
- Build logs real-time zichtbaar
- Rollback naar eerdere deploys mogelijk
- Preview deployments voor branches

## Custom Domain Setup
1. Upgrade naar Pro tier ($7/maand)
2. Settings → Custom Domains
3. Voeg domain toe en configureer DNS
4. SSL certificaat automatisch toegevoegd

## Health Checks & Monitoring
Render heeft ingebouwde monitoring:
- Service uptime tracking
- Memory en CPU usage
- Request latency metrics
- Error rate monitoring

## Troubleshooting

### Build Failures
```bash
# Check build logs in Render dashboard
# Common issues:
- Node.js version (set to 20)
- Missing dependencies
- Build script errors
- Memory limits exceeded
```

### Spin Down Issues (Gratis Tier)
```bash
# Service slaapt na 15 minuten
# Eerste request duurt lang
# Oplossingen:
1. Upgrade naar Pro ($7/maand)
2. Gebruik cron job om service wakker te houden
3. Informeer gebruikers over cold starts
```

### Database Connection
```bash
# Test database verbinding
curl https://jouw-app.onrender.com/api/admin/database/status
```

## Performance Optimalisatie

### Build Optimalisatie
```bash
# Render.yaml configuratie
build:
  commands:
    - npm ci  # Sneller dan npm install
    - npm run build
```

### Caching
```bash
# Node modules caching automatisch
# Build artifacts caching
# Static assets via CDN
```

## Render.yaml Configuratie
Je project heeft al optimale configuratie:
```yaml
services:
  - type: web
    name: ontdek-polen
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    plan: free  # of "starter" voor Pro
    envVars:
      - key: NODE_ENV
        value: production
```

## CLI Usage (Optioneel)
```bash
# Install Render CLI
npm install -g @render/cli

# Deploy via CLI
render deploy

# Logs bekijken  
render logs -s [service-id]

# Service status
render services list
```

## Voordelen Render
✅ **Gratis tier beschikbaar**  
✅ **Eenvoudige deployment**  
✅ **Automatische SSL**  
✅ **Git-based deploys**  
✅ **Ingebouwde monitoring**  
✅ **PostgreSQL hosting**  
✅ **Goede documentatie**  

## Nadelen Render
❌ **Spin down op gratis tier**  
❌ **Cold starts (30+ seconden)**  
❌ **Beperkte gratis resources**  
❌ **Minder features dan Vercel**  

## Kostenoverzicht
- **Gratis:** Spin down, 750 uur/maand
- **Starter ($7/maand):** Always-on, custom domains
- **Standard ($25/maand):** Meer resources, teams

## Aanbeveling per Use Case

### Voor Development/Testing
- **Gratis tier** - Perfect voor testen
- Accepteer cold starts voor demo doeleinden

### Voor Productie
- **Starter tier ($7/maand)** - Always-on essentieel
- Custom domain voor professionele uitstraling

### Voor High Traffic
- **Standard tier** - Meer resources en scaling

## Migration van Replit
1. Push code naar GitHub
2. Maak Render Web Service
3. Configureer environment variables
4. Test deployment
5. Update DNS (bij custom domain)

Render is een uitstekende keuze voor je Polish Travel Platform, vooral als je:
- Budget hebt voor $7/maand (voor always-on)
- Eenvoudige deployment waardeert  
- Goede monitoring wilt
- PostgreSQL hosting overweegt

Voor volledig gratis hosting: gebruik **Vercel**  
Voor Nederlandse hosting: gebruik **VPS providers**