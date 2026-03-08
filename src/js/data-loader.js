// data-loader.js - CSV data loading and processing

// Create App namespace if it doesn't exist
window.App = window.App || {};

App.loadEncounterData = async function() {
  try {
    const response = await fetch('./src/data/gen1_red_walk_tidy.csv');
    const csvText = await response.text();
    const lines = csvText.split('\n');

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',');
      if (parts.length < 10) continue;

      const pokemonName = parts[0];
      const pokemonId = parseInt(parts[1]);
      const locationSlug = parts[4];
      const encounterChance = parseInt(parts[9]) || 0; // Column 10 is the chance

      // Initialize set for this location if it doesn't exist
      // Check if it's already an array (from previous conversion) and reset to Map if needed
      if (!App.encountersByLocation[locationSlug] || Array.isArray(App.encountersByLocation[locationSlug])) {
        App.encountersByLocation[locationSlug] = new Map();
      }

      // Add or update pokemon with cumulative encounter rate
      if (!App.encountersByLocation[locationSlug].has(pokemonId)) {
        App.encountersByLocation[locationSlug].set(pokemonId, {
          id: pokemonId,
          name: pokemonName,
          totalChance: encounterChance
        });
      } else {
        // Add to existing encounter rate
        const existing = App.encountersByLocation[locationSlug].get(pokemonId);
        existing.totalChance += encounterChance;
      }

      // Track which locations have this Pokemon
      if (!App.pokemonEncountersByLocation[pokemonId]) {
        App.pokemonEncountersByLocation[pokemonId] = new Set();
      }
      App.pokemonEncountersByLocation[pokemonId].add(locationSlug);
    }

    // Convert Maps to sorted arrays
    Object.keys(App.encountersByLocation).forEach(location => {
      App.encountersByLocation[location] = Array.from(App.encountersByLocation[location].values())
        .sort((a, b) => a.id - b.id);
    });

    console.log('Loaded encounter data for', Object.keys(App.encountersByLocation).length, 'locations');

  } catch (error) {
    console.error('Error loading encounter data:', error);
  }
};
