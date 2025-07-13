# Ontdek Polen - Polish Travel Website

Een Nederlandse reiswebsite voor het ontdekken van mooie plekken in Polen. Gebouwd met React, Express en TypeScript.

## Features

- 🏛️ Historische steden zoals Krakow en Gdansk
- 🏔️ Natuurlijke bestemmingen zoals Tatra Mountains en Bialowieza
- 📚 Reisgidsen en tips
- 🔍 Zoekfunctionaliteit voor bestemmingen
- 📱 Responsive design voor alle apparaten

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **Deployment**: Netlify + GitHub Actions

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Netlify (Recommended)

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist/public`
3. Add environment variables if needed
4. Deploy!

### GitHub Actions

This project includes automatic deployment to Netlify via GitHub Actions. Set up the following secrets in your GitHub repository:

- `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token
- `NETLIFY_SITE_ID`: Your Netlify site ID

## Project Structure

```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   └── lib/         # Utilities
│   └── public/
│       └── images/      # Static images
├── server/          # Express backend
├── shared/          # Shared types and schemas
└── .github/         # GitHub Actions workflows
```

## Images

Place your images in the `client/public/images/` directory:

- `header.jpg` - Hero background
- `krakow.jpg` - Krakow destination
- `tatra.jpg` - Tatra Mountains
- `gdansk.jpg` - Gdansk harbor
- `bialowieza.jpg` - Bialowieza forest
- `krakau-dagtrip.jpg` - Krakow travel guide
- `roadtrip-zuid.jpg` - Southern Poland roadtrip
- `zee-parels.jpg` - Coastal destinations
- `tatra-vallei.jpg` - Tatra valley

## License

MIT License