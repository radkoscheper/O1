# Neon PostgreSQL Database Setup - Ontdek Polen
*Database Configuratie voor Alle Hosting Platforms*

## Overzicht
Je Ontdek Polen website gebruikt Neon PostgreSQL als database. Deze configuratie werkt met alle hosting platforms die backend functionaliteit ondersteunen.

**Huidige Database Details:**
- **Provider:** Neon PostgreSQL Serverless
- **Host:** `ep-shrill-brook-a4kt6cjb.us-east-1.aws.neon.tech`
- **Port:** `5432`
- **Database:** `neondb`
- **Regio:** `us-east-1`

## Database Connection String
Je hebt de volledige DATABASE_URL nodig in dit formaat:
```
postgresql://username:password@ep-shrill-brook-a4kt6cjb.us-east-1.aws.neon.tech:5432/neondb
```

Deze vind je in:
- Replit Secrets → DATABASE_URL
- Neon Dashboard → Connection Details
- Database Configuration CMS (admin panel)

## Platform-specifieke Setup

### Vercel
```bash
# Environment Variables in Vercel
DATABASE_URL=postgresql://username:password@ep-shrill-brook-a4kt6cjb.us-east-1.aws.neon.tech:5432/neondb
NODE_ENV=production
SESSION_SECRET=willekeurige-lange-string
```

### Railway
```bash
# Environment Variables in Railway
DATABASE_URL=postgresql://username:password@ep-shrill-brook-a4kt6cjb.us-east-1.aws.neon.tech:5432/neondb
NODE_ENV=production
SESSION_SECRET=willekeurige-lange-string
```

### Render
```bash
# Environment Variables in Render
DATABASE_URL=postgresql://username:password@ep-shrill-brook-a4kt6cjb.us-east-1.aws.neon.tech:5432/neondb
NODE_ENV=production
SESSION_SECRET=willekeurige-lange-string
```

### Nederlandse VPS/Server
```bash
# .env file op server
DATABASE_URL=postgresql://username:password@ep-shrill-brook-a4kt6cjb.us-east-1.aws.neon.tech:5432/neondb
NODE_ENV=production
SESSION_SECRET=willekeurige-lange-string
```

## Database Schema & Migratie

### Automatische Setup
Je website gebruikt Drizzle ORM voor automatische database setup:
```bash
# Schema push (creates tables automatically)
npm run db:push
```

### Bestaande Tabellen
Je database bevat al alle benodigde tabellen:
- `users` - Gebruikers en authenticatie
- `destinations` - Bestemmingen (40 records)
- `activities` - Activiteiten (93 records)
- `guides` - Reisgidsen
- `pages` - Dynamic pagina's
- `templates` - Content templates
- `highlights` - Hoogtepunten
- `site_settings` - Website instellingen
- `database_settings` - Database configuratie
- `search_configs` - Zoek configuraties
- `motivation` - Motivatie sectie

### Data Backup
Maak regelmatig backups:
```bash
# Via Neon Console
# Download SQL dump van je database
# Of gebruik pg_dump vanuit je hosting platform
```

## Database Performance

### Connection Pooling
Neon heeft automatische connection pooling:
- Max connections: 10 (gratis tier)
- Connection timeout: 30 seconden
- SSL required: Ja

### Optimalisatie
- Database caching via React Query
- Efficient queries in Drizzle ORM
- Soft delete patterns implemented

## Beveiliging

### Best Practices
✅ SSL encryption (automatisch met Neon)  
✅ Environment variables voor credentials  
✅ Session-based authentication  
✅ Prepared statements (Drizzle ORM)  
✅ Role-based access control  

### Monitoring
- Neon Console voor database metrics
- Connection status via admin panel
- Performance monitoring ingebouwd

## Troubleshooting

### Connection Issues
```bash
# Test database verbinding
node -e "const { neon } = require('@neondatabase/serverless'); const sql = neon(process.env.DATABASE_URL); sql\`SELECT 1\`.then(console.log);"
```

### Common Errors
- **Connection timeout:** Check firewall/network
- **SSL required:** Ensure connection string includes SSL
- **Max connections:** Check concurrent connections

### Recovery
1. Check Neon dashboard status
2. Verify environment variables
3. Test connection locally
4. Check hosting platform logs

## Database Management via CMS
Je admin panel heeft een volledige Database Configuration Editor:
- Database status monitoring
- Connection settings management
- Table statistics overview
- Real-time health checks

Toegang via: Admin Panel → Deployment & Platform → Database Settings

## Migration naar Nieuwe Database
Als je naar een andere database provider wilt:
1. Export data via Neon Console
2. Create nieuwe database
3. Import schema: `npm run db:push`
4. Import data via SQL dump
5. Update DATABASE_URL

Je huidige Neon setup is echter uitstekend geschikt voor productie met automatische backups en goede performance.