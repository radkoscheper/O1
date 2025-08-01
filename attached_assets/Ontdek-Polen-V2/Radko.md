# Radko - Deployment Handleiding voor Ontdek Polen

## Overzicht
Deze handleiding legt uit hoe je jouw Polish Travel Platform ("Ontdek Polen") kunt deployen op verschillende hosting platforms. De site is gebouwd met React frontend, Express.js backend en een PostgreSQL database.

## Wat heb je nodig voor deployment?

### 1. Database
- **Neon PostgreSQL Database** (huidige setup)
  - Host: `ep-shrill-brook-a4kt6cjb.us-east-1.aws.neon.tech`
  - Port: `5432`
  - Database: `neondb`
  - Regio: `us-east-1`
- **Database URL**: Je hebt de volledige connection string nodig uit je Replit secrets

### 2. Project Bestanden
- Alle code uit je Replit project
- Environment variabelen (DATABASE_URL, SESSION_SECRET)
- Alle afbeeldingen in `/client/public/images/`

## Deployment Opties

### Option 1: Vercel (Aanbevolen - Gratis tier beschikbaar)

**Stappen:**
1. **Code voorbereiden:**
   - Download je project van Replit
   - Zorg dat `vercel.json` aanwezig is (al geconfigureerd)

2. **Vercel account:**
   - Ga naar [vercel.com](https://vercel.com)
   - Maak gratis account aan
   - Koppel je GitHub account (optioneel)

3. **Project uploaden:**
   - Upload via Vercel dashboard of verbind GitHub repository
   - Selecteer "Import Git Repository"

4. **Environment variabelen instellen:**
   ```
   DATABASE_URL=postgresql://[jouw-neon-connection-string]
   SESSION_SECRET=een-willekeurige-lange-string
   NODE_ENV=production
   ```

5. **Deploy:**
   - Klik "Deploy"
   - Vercel bouwt automatisch je site
   - Je krijgt een `.vercel.app` URL

**Voordelen:**
- Gratis tier met goede limieten
- Automatische HTTPS
- Globale CDN
- Eenvoudige setup

### Option 2: Render.com (Goed voor fullstack apps)

**Stappen:**
1. **Account aanmaken:**
   - Ga naar [render.com](https://render.com)
   - Maak gratis account aan

2. **Web Service maken:**
   - Klik "New" → "Web Service"
   - Verbind je GitHub repository of upload code

3. **Build instellingen:**
   ```
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Environment variabelen:**
   - Voeg DATABASE_URL toe
   - Voeg SESSION_SECRET toe
   - Zet NODE_ENV op "production"

5. **Deploy:**
   - Render bouwt en deployet automatisch
   - Je krijgt een `.onrender.com` URL

**Voordelen:**
- Gratis tier beschikbaar
- Eenvoudige database integratie
- Automatische deploys bij code wijzigingen

### Option 3: Nederlandse Hosting (TransIP, Hostnet, etc.)

**Voor VPS/Dedicated servers:**

1. **Server requirements:**
   - Ubuntu/Debian Linux
   - Node.js 18+ geïnstalleerd
   - PostgreSQL database toegang
   - Nginx voor reverse proxy

2. **Upload bestanden:**
   - Upload project via FTP/SFTP naar `/var/www/ontdek-polen/`

3. **Dependencies installeren:**
   ```bash
   cd /var/www/ontdek-polen/
   npm install
   npm run build
   ```

4. **Environment variabelen:**
   ```bash
   # Maak .env bestand
   echo "DATABASE_URL=jouw-database-url" > .env
   echo "SESSION_SECRET=jouw-secret" >> .env
   echo "NODE_ENV=production" >> .env
   ```

5. **Nginx configuratie:**
   ```nginx
   server {
       listen 80;
       server_name jouw-domein.nl;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

6. **Process manager (PM2):**
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name "ontdek-polen"
   pm2 startup
   pm2 save
   ```

### Option 4: Railway (Eenvoudig, betaald)

**Stappen:**
1. Ga naar [railway.app](https://railway.app)
2. Maak account aan
3. "New Project" → "Deploy from GitHub repo"
4. Selecteer je repository
5. Railway detecteert automatisch Node.js
6. Voeg environment variabelen toe
7. Deploy gebeurt automatisch

**Voordelen:**
- Zeer eenvoudige setup
- Automatische deployments
- Goede performance

## Database Migratie (indien nodig)

**Als je een nieuwe database wilt:**

1. **Nieuwe PostgreSQL database maken**
2. **Schema migreren:**
   ```bash
   npm run db:push
   ```
3. **Data exporteren uit huidige database**
4. **Data importeren in nieuwe database**

## Tips en Aandachtspunten

### Belangrijke bestanden controleren:
- `package.json` - dependencies
- `vercel.json` - Vercel configuratie
- `railway.json` - Railway configuratie
- Environment variabelen correct ingesteld

### Performance:
- Afbeeldingen geoptimaliseerd houden
- Database queries efficiënt
- Caching waar mogelijk

### Beveiliging:
- Altijd HTTPS gebruiken
- Environment variabelen veilig bewaren
- Regelmatig database backups maken

### Onderhoud:
- Dependencies regelmatig updaten
- Database performance monitoren
- Error logs controleren

## Snelle Start Checklist

□ Database connection string verzamelen  
□ Project code downloaden van Replit  
□ Hosting platform kiezen  
□ Account aanmaken bij gekozen provider  
□ Environment variabelen instellen  
□ Project uploaden/deployen  
□ Database connectie testen  
□ Site functionaliteit controleren  
□ Custom domein koppelen (optioneel)  

## Kosten Overzicht

**Gratis opties:**
- Vercel: Gratis tier (hobby projecten)
- Render: Gratis tier (beperkt)
- Neon Database: Gratis tier (current setup)

**Betaalde opties:**
- Nederlandse VPS: €5-20/maand
- Railway: ~$5/maand
- Vercel Pro: $20/maand

## Hulp nodig?

Bij problemen kun je altijd:
1. Error logs controleren in hosting dashboard
2. Database connectie testen
3. Environment variabelen dubbelchecken
4. Contact opnemen met hosting support

---

*Deze handleiding is gemaakt voor het "Ontdek Polen" project - Een complete Polish Travel Platform met CMS functionaliteit.*