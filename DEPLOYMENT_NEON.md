# Deployment met Neon Database

## Stappen voor Netlify deployment

### 1. Netlify Environment Variables
Ga naar je Netlify dashboard en voeg deze environment variable toe:

**Environment Variable:**
- **Name:** `NEON_DATABASE_URL`
- **Value:** `postgresql://neondb_owner:npg_pAbda9fC0QTJ@ep-nameless-sound-a2dglih1-pooler.eu-central-1.aws.neon.tech/ontdekpolen?sslmode=require&channel_binding=require`

### 2. Database Setup
De database tabellen worden automatisch aangemaakt door Drizzle ORM.

### 3. Admin Account
Na deployment kun je een admin account aanmaken via:
```bash
curl -X POST https://jouw-site.netlify.app/api/setup-admin \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "jouw-wachtwoord"}'
```

### 4. GitHub Integration
1. Push je code naar GitHub
2. Verbind je GitHub repository met Netlify
3. Netlify bouwt automatisch bij elke push

### 5. Deployment URL
Na deployment is je admin panel beschikbaar op:
- **Website:** `https://jouw-site.netlify.app`
- **Admin Panel:** `https://jouw-site.netlify.app/admin`

## Lokale Development
Voor lokale development gebruik je de bestaande DATABASE_URL of NEON_DATABASE_URL environment variable.

## Beveiliging
- Wijzig altijd het default admin wachtwoord na eerste login
- Gebruik sterke wachtwoorden voor productie
- Database credentials worden veilig opgeslagen in environment variables