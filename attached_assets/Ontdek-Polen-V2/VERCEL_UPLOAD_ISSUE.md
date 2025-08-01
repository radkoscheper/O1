# Vercel Upload Issue - File System Read-Only

## Probleem
Op Vercel (serverless functions) is het bestandssysteem read-only. Upload functies falen met:
```
EROFS: read-only file system, open '/var/task/client/public/images/...'
```

## Vercel Beperkingen
- Serverless functions hebben geen schrijftoegang tot bestandssysteem
- Uploads naar `/var/task/` directory zijn niet mogelijk
- Static assets moeten tijdens build time beschikbaar zijn

## Oplossingen

### 1. Cloudinary Integration (Aanbevolen)
```bash
npm install cloudinary
```
- Gratis tier: 25GB opslag, 25GB maandelijkse bandwidth
- Automatische image optimalisatie en transformaties
- CDN voor snelle loading

### 2. AWS S3 + CloudFront
```bash
npm install @aws-sdk/client-s3
```
- Zeer goedkoop voor opslag
- Schaalbaar tot enterprise niveau

### 3. Vercel Blob Storage
```bash
npm install @vercel/blob
```
- Directe integratie met Vercel
- €0.15 per GB opslag per maand

### 4. Upload Functie Uitschakelen (Tijdelijke Fix)
- Disable upload buttons in productie
- Behoud bestaande afbeeldingen
- Uploads alleen lokaal tijdens development

## Huidige Status
- Alle bestaande afbeeldingen werken nog (66 SVG bestanden)
- Admin functionaliteit beperkt tot content editing
- Database functies volledig operationeel

## Implementatie Voorstel
1. **Direct**: Upload functie uitschakelen in productie
2. **Later**: Cloudinary integratie voor volledige CMS functionaliteit