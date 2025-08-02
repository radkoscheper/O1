import { storage } from "./storage";

// Import existing data
const destinationsData = [
  {
    "id": 4,
    "name": "Bialowieza",
    "slug": "bialowieza",
    "image": "/images/bialowieza.jpg",
    "alt": "Bialowieza",
    "description": "Ontdek het laatste oerbos van Europa in Bialowieza, thuisbasis van de Europese bizon",
    "content": "# Bialowieza\n\nBialowieza Forest is het laatste oerbos van Europa en een UNESCO Werelderfgoedlocatie. Dit unieke natuurgebied herbergt de Europese bizon en vele andere wilde dieren.\n\n## Natuur highlights\n\n- **Europese bizons** - De koning van het bos, terug van de rand van uitsterven\n- **Oerbos** - Bomen die honderden jaren oud zijn\n- **Wilde dieren** - Wolven, lynxen, elanden en meer dan 250 vogelsoorten\n- **Oude eiken** - Sommige meer dan 500 jaar oud\n\n## Activiteiten\n\n- **Geleide tours** - Verplicht voor toegang tot het stricte natuurreservaat\n- **Fietsen** - Prachtige fietspaden door het bos\n- **Birdwatching** - Ideaal voor vogelliefhebbers\n- **Natuurfotografie** - Unieke kansen voor wildlife fotografie\n\n## Bezoekersinfo\n\n- **Toegang** - Alleen met gids toegestaan in het kerngebied\n- **Beste seizoen** - Mei tot oktober voor beste wildlife kansen\n- **Kleding** - Stevige schoenen en insectenspray zijn essentieel\n- **Respect** - Volg altijd de natuurregels en blijf op de paden\n\n## Accommodatie\n\n- **Białowieża dorp** - Basis voor je bosavontuur\n- **Lokale guesthouses** - Authentieke ervaring\n- **Natuurcentrum** - Educatieve tentoonstellingen over het bos",
    "featured": false,
    "published": true,
    "createdAt": "2025-01-13T17:00:00.000Z"
  },
  {
    "id": 3,
    "name": "Gdansk",
    "slug": "gdansk",
    "image": "/images/gdansk.jpg",
    "alt": "Gdansk",
    "description": "Verken Gdansk, de prachtige havenstad met kleurrijke gevels en rijke maritieme geschiedenis",
    "content": "# Gdansk\n\nGdansk is een prachtige havenstad aan de Oostzee met een rijke geschiedenis en kleurrijke architectuur. De stad speelde een belangrijke rol in de Europese geschiedenis en is de bakermat van de Solidarność-beweging.\n\n## Bezienswaardigheden\n\n- **Długi Targ (Lange Markt)** - Het hart van de oude stad met prachtige patriciershuizen\n- **Artus Court** - Historisch gebouw waar kooplieden elkaar ontmoetten\n- **St. Mary's Church** - Een van de grootste bakstenen kerken ter wereld\n- **Crane Gate** - Iconisch symbool van Gdansk aan de Motława rivier\n- **Westerplatte** - Historische locatie waar WOII begon\n\n## Maritime erfgoed\n\n- **Nationaal Maritiem Museum** - Ontdek de zeevaartgeschiedenis\n- **Soldek schip** - Historisch vrachtschip te bezoeken\n- **Havenwandeling** - Prachtige wandeling langs de rivier\n\n## Culinair\n\n- **Goldwasser** - Traditionele likeur met goudvlokken\n- **Verse vis** - Rechtstreeks van de Oostzee\n- **Poolse amber** - Gdansk staat bekend om amber sieraden",
    "featured": true,
    "published": true,
    "createdAt": "2025-01-13T17:00:00.000Z"
  },
  {
    "id": 1,
    "name": "Krakow",
    "slug": "krakow",
    "image": "/images/krakow.jpg",
    "alt": "Krakow",
    "description": "Ontdek de historische stad Krakow met zijn prachtige marktplein en rijke cultuur",
    "content": "# Krakow\n\nKrakow is een van de mooiste steden van Polen. De historische binnenstad staat op de UNESCO Werelderfgoedlijst en biedt bezoekers een unieke kijk op de Poolse geschiedenis en cultuur.\n\n## Bezienswaardigheden\n\n- **Marktplein (Rynek Główny)** - Een van de grootste middeleeuwse marktpleinen van Europa\n- **Wawel Kasteel** - Het symbool van Polen met zijn koninklijke geschiedenis\n- **Kazimierz** - Het historische Joodse kwartier vol restaurants en cafés\n- **St. Mary's Basiliek** - Beroemd om zijn houten altaar en trompetsignaal\n\n## Tips voor je bezoek\n\n- Bezoek vroeg in de ochtend voor minder drukte\n- Proef traditionele pierogi in een lokaal restaurant\n- Maak een wandeling langs de Wisła rivier\n- Neem deel aan een gratis walking tour",
    "featured": true,
    "published": true,
    "createdAt": "2025-01-13T17:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Tatra Mountains",
    "slug": "tatra-mountains",
    "image": "/images/tatra.jpg",
    "alt": "Tatra Mountains",
    "description": "Ervaar de adembenemende Tatra Mountains, perfect voor wandelaars en natuurliefhebbers",
    "content": "# Tatra Mountains\n\nDe Tatra Mountains vormen de natuurlijke grens tussen Polen en Slowakije. Dit berggebied biedt spectaculaire landschappen, kristalheldere meren en uitdagende wandelpaden.\n\n## Hoogtepunten\n\n- **Morskie Oko** - Het 'Oog van de Zee', een prachtig bergmeer\n- **Kasprowy Wierch** - Bereikbaar met de kabelbaan, prachtige uitzichten\n- **Zakopane** - Charmant bergdorpje aan de voet van de Tatra's\n- **Wandelpaden** - Van makkelijke wandelingen tot uitdagende bergtochten\n\n## Activiteiten\n\n- Wandelen en bergbeklimmen\n- Skiën in de winter\n- Fotograferen van wilde dieren\n- Bezoek aan traditionele berghutten\n\n## Praktische info\n\n- Beste tijd: Juni tot september voor wandelen\n- Neem warme kleding mee (weer kan snel omslaan)\n- Wandelpaden kunnen druk zijn in het weekend\n- Respect voor de natuur is essentieel",
    "featured": true,
    "published": true,
    "createdAt": "2025-01-13T17:00:00.000Z"
  }
];

const guidesData = [
  {
    "id": 1,
    "title": "3 Dagen in Krakau",
    "slug": "3-dagen-in-krakau",
    "image": "/images/krakau-dagtrip.jpg",
    "alt": "3 Dagen in Krakau",
    "description": "Complete reisgids voor een perfecte 3-daagse trip naar Krakau",
    "content": "# 3 Dagen in Krakau\n\nKrakau is perfect voor een lang weekend. Deze gids helpt je het beste uit je 3 dagen te halen.\n\n## Dag 1: Oude Stad\n\n### Ochtend\n- **9:00** - Start op het Marktplein (Rynek Główny)\n- **10:00** - Bezoek St. Mary's Basiliek\n- **11:00** - Verken de Sukiennice (Cloth Hall)\n- **12:00** - Koffie in één van de cafés rond het plein\n\n### Middag\n- **13:00** - Lunch bij een traditioneel restaurant\n- **14:30** - Wandeling naar Wawel Castle\n- **15:00** - Bezoek Wawel Castle en Cathedral\n- **17:00** - Wandeling langs de Wisła rivier\n\n### Avond\n- **19:00** - Diner in Kazimierz (Joods kwartier)\n- **21:00** - Nightlife in Kazimierz\n\n## Dag 2: Kazimierz & Podgórze\n\n### Ochtend\n- **9:00** - Ontbijt in Kazimierz\n- **10:00** - Bezoek Remuh Synagogue\n- **11:00** - Wandeling door de Joodse wijk\n- **12:00** - Bezoek aan de Nieuwe Synagoge\n\n### Middag\n- **13:00** - Lunch in een lokaal restaurant\n- **14:30** - Wandeling naar Podgórze\n- **15:00** - Bezoek Schindler's Factory Museum\n- **17:00** - Wandeling langs de Wisła\n\n### Avond\n- **19:00** - Diner in de oude stad\n- **21:00** - Poolse folklore show of opera\n\n## Dag 3: Dagtrip of Musea\n\n### Optie A: Auschwitz-Birkenau (dag trip)\n- **7:00** - Vroeg ontbijt\n- **8:00** - Vertrek naar Auschwitz (1.5 uur)\n- **10:00-16:00** - Bezoek Auschwitz-Birkenau\n- **17:30** - Terug in Krakau\n- **19:00** - Rustig diner\n\n### Optie B: Musea in Krakau\n- **9:00** - Bezoek Nationaal Museum\n- **11:00** - Bezoek Czartoryski Museum\n- **13:00** - Lunch\n- **14:30** - Bezoek ondergrondse markt (Rynek Underground)\n- **16:00** - Laatste souvenirs kopen\n- **17:30** - Afscheidsdiner\n\n## Praktische Tips\n\n### Vervoer\n- **Lopen** - Centrum is klein en goed te voet te verkennen\n- **Tram** - Goedkoop openbaar vervoer\n- **Taxi/Uber** - Beschikbaar maar duurder\n\n### Eten\n- **Pierogi** - Traditionele dumplings, must-try!\n- **Kielbasa** - Poolse worst\n- **Zapiekanka** - Pools street food\n- **Oscypek** - Traditionele bergkaas\n\n### Accommodatie\n- **Oude Stad** - Dichtbij bezienswaardigheden, wel druk\n- **Kazimierz** - Trendy wijk met veel restaurants\n- **Podgórze** - Rustiger, iets verder van centrum\n\n### Budget (per persoon)\n- **Budget** - €40-60 per dag\n- **Midrange** - €60-100 per dag\n- **Luxury** - €100+ per dag\n\n## Niet te missen\n\n- Trompetsignaal vanaf St. Mary's toren (elk uur)\n- Zonsondergang op Wawel Hill\n- Poolse vodka proeven\n- Traditionele Poolse muziek\n- Ambachtelijke souvenirs op het marktplein",
    "featured": true,
    "published": true,
    "createdAt": "2025-01-13T17:00:00.000Z"
  },
  {
    "id": 2,
    "title": "Roadtrip door het zuiden",
    "slug": "roadtrip-door-het-zuiden",
    "image": "/images/roadtrip-zuid.jpg",
    "alt": "Roadtrip door het zuiden",
    "description": "Ontdek Zuid-Polen met deze complete roadtrip gids door de mooiste regio's",
    "content": "# Roadtrip door het zuiden van Polen\n\nEen 7-daagse roadtrip door Zuid-Polen brengt je langs historische steden, prachtige bergen en charmante dorpjes.",
    "featured": true,
    "published": true,
    "createdAt": "2025-01-13T17:00:00.000Z"
  },
  {
    "id": 3,
    "title": "Verborgen Parels aan zee",
    "slug": "verborgen-parels-aan-zee",
    "image": "/images/zee-parels.jpg",
    "alt": "Verborgen Parels aan zee",
    "description": "Ontdek de mooiste verborgen plekjes aan de Poolse Oostzeekust",
    "content": "# Verborgen Parels aan de Poolse Oostzeekust\n\nDe Poolse Oostzeekust biedt meer dan alleen Gdansk. Ontdek deze verborgen parels voor een authentieke kustervaring.",
    "featured": false,
    "published": true,
    "createdAt": "2025-01-13T17:00:00.000Z"
  }
];

async function migrateData() {
  console.log("Starting data migration...");
  
  try {
    // Migrate destinations
    console.log("Migrating destinations...");
    const existingDestinations = await storage.getAllDestinations();
    if (existingDestinations.length < destinationsData.length) {
      // Clear existing data first
      if (existingDestinations.length > 0) {
        for (const dest of existingDestinations) {
          await storage.deleteDestination(dest.id);
        }
      }
      
      // Insert all destinations
      for (const dest of destinationsData) {
        await storage.createDestination({
          name: dest.name,
          slug: dest.slug,
          description: dest.description,
          image: dest.image,
          alt: dest.alt,
          content: dest.content,
          featured: dest.featured,
          published: dest.published,
          createdBy: 1, // admin user
        });
        console.log(`Migrated destination: ${dest.name}`);
      }
    }
    
    // Migrate guides
    console.log("Migrating guides...");
    const existingGuides = await storage.getAllGuides();
    if (existingGuides.length < guidesData.length) {
      // Clear existing data first
      if (existingGuides.length > 0) {
        for (const guide of existingGuides) {
          await storage.deleteGuide(guide.id);
        }
      }
      
      // Insert all guides
      for (const guide of guidesData) {
        await storage.createGuide({
          title: guide.title,
          slug: guide.slug,
          description: guide.description,
          image: guide.image,
          alt: guide.alt,
          content: guide.content,
          featured: guide.featured,
          published: guide.published,
          createdBy: 1, // admin user
        });
        console.log(`Migrated guide: ${guide.title}`);
      }
    }
    
    console.log("Data migration completed successfully!");
    
  } catch (error) {
    console.error("Error during migration:", error);
  }
  
  process.exit(0);
}

migrateData();