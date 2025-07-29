# Deployment Fix voor ontdekpolen.nl

## Probleem OPGELOST
- ✅ build-vercel.js hersteld na cleanup
- ✅ Vercel build werkt weer perfect
- ✅ Assets hash mismatch: oude vs nieuwe build
- ✅ Header background fallback gefixed

## Lokale Build Status
- ✅ Nieuwe CSS: `index-DcJI0ODI.css` 
- ✅ Nieuwe JS: `index-D26Bpxnx.js`
- ✅ API bundle: `dist/public/api/index.js` (166KB)
- ✅ Build script: Volledig werkend

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