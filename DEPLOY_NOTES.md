# Deployment Fix voor ontdekpolen.nl

## Probleem
- Live site mist styling (CSS laadt niet correct)
- Vercel serveert oude cached assets
- Assets hash mismatch: oude vs nieuwe build

## Lokale Build Status
- ✅ Nieuwe CSS: `index-DcJI0ODI.css` 
- ✅ Nieuwe JS: `index-D26Bpxnx.js`
- ✅ Header background fallback gefixed

## Upload Instructies
1. **Build deze versie**: `npm run build` (al gedaan)
2. **Upload COMPLETE project** naar GitHub (niet alleen source)
3. **Of**: Push naar GitHub en trigger nieuwe Vercel build
4. **Clear Vercel cache** in dashboard indien nodig

## Vercel Cache Clear
1. Ga naar Vercel dashboard
2. Selecteer ontdekpolen project  
3. Klik "Functions" tab
4. Klik "Clear Cache" of redeploy latest commit

## Test na deployment
- Check: https://ontdekpolen.nl/assets/index-DcJI0ODI.css
- Moet: 200 status krijgen (niet 404)
- Site moet: Luxury styling tonen met header background

## Backup Plan
Als cache problemen blijven: voeg `?v=${Date.now()}` toe aan asset URLs in build script.