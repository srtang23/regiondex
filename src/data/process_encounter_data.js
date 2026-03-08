// Process CSV and map locations to grid coordinates
const fs = require('fs');

// Read the CSV file
const csvContent = fs.readFileSync('gen1_red_walk_tidy.csv', 'utf-8');
const lines = csvContent.split('\n');
const headers = lines[0].split(',');

// Parse CSV data
const encounters = [];
for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;

  const values = lines[i].split(',');
  const row = {};
  headers.forEach((header, index) => {
    row[header] = values[index];
  });
  encounters.push(row);
}

// Group encounters by location area
const locationMap = new Map();

encounters.forEach(encounter => {
  const locationSlug = encounter.location_area_slug;
  const locationName = encounter.location_area;
  const pokemon = encounter.pokemon;
  const chance = parseFloat(encounter.chance);

  if (!locationMap.has(locationSlug)) {
    locationMap.set(locationSlug, {
      slug: locationSlug,
      name: locationName,
      encounters: []
    });
  }

  const location = locationMap.get(locationSlug);

  // Check if pokemon already exists in encounters
  const existingPokemon = location.encounters.find(e => e.pokemon === pokemon);
  if (existingPokemon) {
    // Sum up the chances for the same pokemon
    existingPokemon.rate += chance;
  } else {
    location.encounters.push({
      pokemon: pokemon,
      rate: chance
    });
  }
});

// Kanto map coordinate mapping (approximate pixel coordinates on a 7700x6400 map)
// This is a manual mapping based on the Kanto region layout
// Coordinates scaled from 1000x1000 to 7700x6400 for actual image dimensions (full_kanto_map.png)
const SCALE_X = 7.7;
const SCALE_Y = 6.4;

const locationCoordinatesBase = {
  // Routes
  'kanto-route-1-area': [620, 780],
  'kanto-route-2-south-towards-viridian-city': [580, 720],
  'kanto-route-3-area': [720, 620],
  'kanto-route-4-area': [820, 580],
  'kanto-route-5-area': [620, 520],
  'kanto-route-6-area': [620, 600],
  'kanto-route-7-area': [540, 520],
  'kanto-route-8-area': [700, 520],
  'kanto-route-9-area': [780, 480],
  'kanto-route-10-area': [780, 420],
  'kanto-route-11-area': [720, 600],
  'kanto-route-12-area': [780, 650],
  'kanto-route-13-area': [720, 720],
  'kanto-route-14-area': [680, 760],
  'kanto-route-15-area': [640, 760],
  'kanto-route-16-area': [480, 540],
  'kanto-route-17-area': [460, 620],
  'kanto-route-18-area': [500, 700],
  'kanto-route-22-area': [410, 690],
  'kanto-route-23-area': [380, 600],
  'kanto-route-24-area': [680, 420],
  'kanto-route-25-area': [740, 380],
  'kanto-sea-route-21-area': [520, 800],

  // Cities and Towns
  'viridian-forest-area': [560, 650],
  'digletts-cave-area': [520, 560],
  'mt-moon-1f': [640, 620],
  'mt-moon-b1f': [640, 620],
  'mt-moon-b2f': [640, 620],
  'rock-tunnel-b1f': [820, 480],
  'rock-tunnel-b2f': [820, 480],
  'pokemon-tower-3f': [700, 580],
  'pokemon-tower-4f': [700, 580],
  'pokemon-tower-5f': [700, 580],
  'pokemon-tower-6f': [700, 580],
  'pokemon-tower-7f': [700, 580],
  'power-plant-area': [850, 480],

  // Safari Zone
  'kanto-safari-zone-area-1-east': [520, 700],
  'kanto-safari-zone-area-2-north': [500, 680],
  'kanto-safari-zone-area-3-west': [480, 700],
  'kanto-safari-zone-middle': [500, 700],

  // Seafoam Islands
  'seafoam-islands-1f': [480, 760],
  'seafoam-islands-b1f': [480, 760],
  'seafoam-islands-b2f': [480, 760],
  'seafoam-islands-b3f': [480, 760],
  'seafoam-islands-b4f': [480, 760],

  // Pokemon Mansion
  'pokemon-mansion-1f': [520, 850],
  'pokemon-mansion-2f': [520, 850],
  'pokemon-mansion-3f': [520, 850],
  'pokemon-mansion-b1f': [520, 850],

  // Victory Road
  'kanto-victory-road-2-1f': [360, 580],
  'kanto-victory-road-2-2f': [360, 580],
  'kanto-victory-road-2-3f': [360, 580],

  // Cerulean Cave
  'cerulean-cave-1f': [680, 460],
  'cerulean-cave-2f': [680, 460],
  'cerulean-cave-b1f': [680, 460],
};

// Scale coordinates to match actual image dimensions
const locationCoordinates = {};
Object.keys(locationCoordinatesBase).forEach(key => {
  const [x, y] = locationCoordinatesBase[key];
  locationCoordinates[key] = [
    Math.round(x * SCALE_X),
    Math.round(y * SCALE_Y)
  ];
});

// Generate the data.js content
const locationsArray = [];

locationMap.forEach((location, slug) => {
  const coords = locationCoordinates[slug] || [500, 500]; // Default center if not mapped

  locationsArray.push({
    id: slug,
    name: location.name,
    xy: coords,
    encounters: location.encounters.map(e => ({
      pokemon: e.pokemon.charAt(0).toUpperCase() + e.pokemon.slice(1),
      rate: Math.round(e.rate * 10) / 10 // Round to 1 decimal
    }))
  });
});

// Sort by name for easier reading
locationsArray.sort((a, b) => a.name.localeCompare(b.name));

// Generate the JavaScript file
const output = `// data.js
// Generated from gen1_red_walk_tidy.csv
window.ENCOUNTERS = ${JSON.stringify(locationsArray, null, 2)};
`;

fs.writeFileSync('../js/data.js', output);

console.log(`Generated data.js with ${locationsArray.length} locations`);
console.log('Locations without coordinates (using default):');
locationMap.forEach((location, slug) => {
  if (!locationCoordinates[slug]) {
    console.log(`  - ${slug}: ${location.name}`);
  }
});
