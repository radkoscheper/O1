#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuratie
const CONFIG = {
  contentDir: path.join(path.dirname(__dirname), 'content'),
  outputDir: path.join(path.dirname(__dirname), 'client/src/data'),
  imagesDir: path.join(path.dirname(__dirname), 'client/public/images')
};

// Zorg ervoor dat directories bestaan
function ensureDirectories() {
  [CONFIG.contentDir, CONFIG.outputDir, CONFIG.imagesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Laad alle content bestanden
function loadContent() {
  const destinations = [];
  const guides = [];
  
  // Laad bestemmingen
  const destDir = path.join(CONFIG.contentDir, 'destinations');
  if (fs.existsSync(destDir)) {
    fs.readdirSync(destDir).forEach(file => {
      if (file.endsWith('.json')) {
        const content = JSON.parse(fs.readFileSync(path.join(destDir, file), 'utf8'));
        destinations.push(content);
      }
    });
  }
  
  // Laad reisgidsen
  const guidesDir = path.join(CONFIG.contentDir, 'guides');
  if (fs.existsSync(guidesDir)) {
    fs.readdirSync(guidesDir).forEach(file => {
      if (file.endsWith('.json')) {
        const content = JSON.parse(fs.readFileSync(path.join(guidesDir, file), 'utf8'));
        guides.push(content);
      }
    });
  }
  
  return { destinations, guides };
}

// Genereer data bestanden voor de website
function generateDataFiles() {
  const { destinations, guides } = loadContent();
  
  // Genereer destinations.ts
  const destinationsTs = `// Auto-generated - Do not edit manually
export const destinations = ${JSON.stringify(destinations, null, 2)};
`;
  
  // Genereer guides.ts
  const guidesTs = `// Auto-generated - Do not edit manually
export const guides = ${JSON.stringify(guides, null, 2)};
`;
  
  fs.writeFileSync(path.join(CONFIG.outputDir, 'destinations.ts'), destinationsTs);
  fs.writeFileSync(path.join(CONFIG.outputDir, 'guides.ts'), guidesTs);
  
  console.log('✅ Data bestanden gegenereerd');
}

// Maak nieuwe bestemming
function createDestination(name) {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const destDir = path.join(CONFIG.contentDir, 'destinations');
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  const template = {
    id: Date.now(),
    name: name,
    slug: slug,
    image: `/images/${slug}.jpg`,
    alt: name,
    description: `Ontdek ${name} - een prachtige bestemming in Polen`,
    featured: false,
    published: true,
    createdAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(destDir, `${slug}.json`),
    JSON.stringify(template, null, 2)
  );
  
  console.log(`✅ Bestemming "${name}" aangemaakt`);
}

// Maak nieuwe reisgids
function createGuide(title) {
  const slug = title.toLowerCase().replace(/\s+/g, '-');
  const guidesDir = path.join(CONFIG.contentDir, 'guides');
  
  if (!fs.existsSync(guidesDir)) {
    fs.mkdirSync(guidesDir, { recursive: true });
  }
  
  const template = {
    id: Date.now(),
    title: title,
    slug: slug,
    image: `/images/${slug}.jpg`,
    alt: title,
    description: `Lees onze complete gids: ${title}`,
    content: `# ${title}\n\nContent komt hier...`,
    featured: false,
    published: true,
    createdAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(guidesDir, `${slug}.json`),
    JSON.stringify(template, null, 2)
  );
  
  console.log(`✅ Reisgids "${title}" aangemaakt`);
}

// Toon lijst van content
function listContent() {
  const { destinations, guides } = loadContent();
  
  console.log('\n📍 Bestemmingen:');
  destinations.forEach(dest => {
    console.log(`  - ${dest.name} (${dest.published ? 'gepubliceerd' : 'concept'})`);
  });
  
  console.log('\n📚 Reisgidsen:');
  guides.forEach(guide => {
    console.log(`  - ${guide.title} (${guide.published ? 'gepubliceerd' : 'concept'})`);
  });
}

// Build en deploy
function build() {
  console.log('🔄 Genereren data bestanden...');
  generateDataFiles();
  
  console.log('🔄 Builden website...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build voltooid');
}

// Command line interface
function main() {
  const [,, command, ...args] = process.argv;
  
  ensureDirectories();
  
  switch (command) {
    case 'new:destination':
      if (!args[0]) {
        console.error('❌ Geef een naam op: npm run cms new:destination "Naam"');
        process.exit(1);
      }
      createDestination(args.join(' '));
      break;
      
    case 'new:guide':
      if (!args[0]) {
        console.error('❌ Geef een titel op: npm run cms new:guide "Titel"');
        process.exit(1);
      }
      createGuide(args.join(' '));
      break;
      
    case 'list':
      listContent();
      break;
      
    case 'generate':
      generateDataFiles();
      break;
      
    case 'build':
      build();
      break;
      
    default:
      console.log(`
🏛️  Ontdek Polen CMS

Beschikbare commando's:
  new:destination "Naam"  - Maak nieuwe bestemming
  new:guide "Titel"       - Maak nieuwe reisgids
  list                    - Toon alle content
  generate                - Genereer data bestanden
  build                   - Build website

Voorbeelden:
  node cms/cli.js new:destination "Warsaw"
  node cms/cli.js new:guide "3 Dagen in Warsaw"
  node cms/cli.js list
  node cms/cli.js build
      `);
  }
}

main();