# Deployment Guide - Ontdek Polen

## GitHub Setup

1. **Repository maken**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/jouw-username/ontdek-polen.git
   git push -u origin main
   ```

2. **GitHub secrets configureren** (voor automatische Netlify deployment)
   - Ga naar Settings → Secrets and variables → Actions
   - Voeg toe:
     - `NETLIFY_AUTH_TOKEN`: Haal op van Netlify → User settings → Personal access tokens
     - `NETLIFY_SITE_ID`: Te vinden in Netlify site settings → Site information

## Netlify Setup

### Optie 1: Automatisch via GitHub
1. Ga naar [Netlify](https://netlify.com) 
2. Klik "New site from Git"
3. Verbind met GitHub repository
4. Build settings:
   - Build command: `vite build`
   - Publish directory: `dist/public`
   - Node version: `20`

### Optie 2: Handmatig uploaden
1. Lokaal builden:
   ```bash
   npm run build
   ```
2. Upload de `dist/public` folder naar Netlify

## Environment Variables

Voor production op Netlify:
- `NODE_ENV=production`
- `DATABASE_URL=your_postgresql_url` (optioneel)
- `SESSION_SECRET=your_secret_key` (optioneel)

## Build Commando's

- `npm run build` - Volledige build (client + server)
- `vite build` - Alleen client build (voor statische hosting)
- `npm run dev` - Development server

## Tips

1. **Afbeeldingen**: Zorg dat je echte afbeeldingen in `client/public/images/` plaatst
2. **Domeinnaam**: Configureer een custom domain in Netlify settings
3. **HTTPS**: Netlify geeft automatisch SSL certificaten
4. **Redirects**: Worden automatisch geconfigureerd via `netlify.toml`

## Troubleshooting

- **Build errors**: Check Node.js version (gebruik 20)
- **Images niet zichtbaar**: Controleer paths in `client/public/images/`
- **404 errors**: Redirects zijn geconfigureerd in `netlify.toml`