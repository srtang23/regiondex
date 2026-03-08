// pokemon-display.js - Pokemon sprite display functionality

// Create App namespace if it doesn't exist
window.App = window.App || {};

// Function to display Pokemon sprites in a location area
App.displayPokemonInArea = function(locationId, bounds) {
  // Clear existing markers for this location
  if (App.pokemonMarkers[locationId]) {
    App.pokemonMarkers[locationId].forEach(marker => App.map.removeLayer(marker));
    App.pokemonMarkers[locationId] = [];
  }

  // Get encounters for this location (try both encountersByLocation and fallback)
  const encounters = App.encountersByLocation[locationId] || App.getEncounterData()[locationId] || [];
  if (encounters.length === 0) {
    console.log(`No encounters found for ${locationId}`);
    return;
  }
  console.log(`Displaying ${encounters.length} Pokemon for ${locationId}`);

  // Calculate area bounds
  const minX = bounds[0][0];
  const minY = bounds[0][1];
  const maxX = bounds[1][0];
  const maxY = bounds[1][1];
  const areaWidth = maxX - minX;
  const areaHeight = maxY - minY;

  // Calculate total encounter rate (should sum to 100 or close to it)
  const totalChance = encounters.reduce((sum, p) => sum + (p.totalChance || 0), 0);

  // Calculate uniform sprite size based on area and total number of sprites we'll show
  const totalSprites = Math.min(10, totalChance / 10); // Aim for ~10 total sprites
  const baseSize = Math.min(areaWidth, areaHeight) / Math.sqrt(totalSprites * 2);
  const spriteSize = Math.max(40, Math.min(70, baseSize));

  // Create markers array for this location
  App.pokemonMarkers[locationId] = [];

  // Display Pokemon based on density (out of 10 encounters)
  encounters.forEach((pokemon, index) => {
    const encounterRate = pokemon.totalChance || 0;

    // Calculate how many copies to show based on "out of 10 encounters"
    // e.g., 50% = 5 copies, 20% = 2 copies, 5% = 1 copy (rounded)
    const numCopies = Math.max(1, Math.round((encounterRate / totalChance) * 10));

    // Create multiple copies based on encounter density
    for (let copy = 0; copy < numCopies; copy++) {
      // Generate random position with some padding from edges
      const padding = spriteSize * 0.5;
      const randomX = minX + padding + Math.random() * (areaWidth - padding * 2);
      const randomY = minY + padding + Math.random() * (areaHeight - padding * 2);

      // Convert to Leaflet coordinates
      const position = App.toLatLng([randomX, randomY]);

      // Get sprite path
      const spritePath = App.getSpritePath(pokemon.name);

      // Create custom icon with hover tooltip
      const pokemonIcon = L.divIcon({
        className: 'pokemon-sprite-marker',
        html: `
          <div class="pokemon-sprite-container" style="position: relative; width: ${spriteSize}px; height: ${spriteSize}px;">
            <img src="${spritePath}"
                 alt="${pokemon.name}"
                 style="width: 100%; height: 100%; object-fit: contain; cursor: pointer;">
            <div class="pokemon-tooltip" style="
              position: absolute;
              bottom: 110%;
              left: 50%;
              transform: translateX(-50%);
              pointer-events: none;
              white-space: nowrap;
            ">
              <div class="pokemon-tooltip-name">${App.formatPokemonName(pokemon.name)}</div>
              <div class="pokemon-tooltip-rate">${encounterRate}% chance</div>
      </div>
    </div>
        `,
        iconSize: [spriteSize, spriteSize],
        iconAnchor: [spriteSize / 2, spriteSize / 2]
      });

      // Create marker with interactivity for tooltip
      const marker = L.marker(position, {
        icon: pokemonIcon,
        interactive: true // Enable interaction for tooltip
      }).addTo(App.map);

      // Add hover events for tooltip
      marker.on('mouseover', function(e) {
        const tooltip = e.target.getElement()?.querySelector('.pokemon-tooltip');
        if (tooltip) {
          tooltip.style.opacity = '1';
        }
      });

      marker.on('mouseout', function(e) {
        const tooltip = e.target.getElement()?.querySelector('.pokemon-tooltip');
        if (tooltip) {
          tooltip.style.opacity = '0';
        }
      });

      // Add click event to show modal
      marker.on('click', function(e) {
         L.DomEvent.stopPropagation(e); // Prevent map click
         App.showPokemonModal(pokemon.name);
      });

      App.pokemonMarkers[locationId].push(marker);
    }
  });
};

// Function to hide Pokemon sprites for a location
App.hidePokemonInArea = function(locationId) {
  if (App.pokemonMarkers[locationId]) {
    App.pokemonMarkers[locationId].forEach(marker => App.map.removeLayer(marker));
    App.pokemonMarkers[locationId] = [];
  }
};
