// filters.js - Sidebar filters functionality

// Create App namespace if it doesn't exist
window.App = window.App || {};

// Initialize filters after DOM and data are ready
function initializeFilters() {
  // Get Pokemon IDs that have encounters
  const pokemonWithEncounters = new Set(Object.keys(App.pokemonEncountersByLocation).map(id => parseInt(id)));

  // Filter and populate Pokemon
  App.getGen1Pokemon()
    .filter(pokemon => pokemonWithEncounters.has(pokemon.id))
    .forEach(pokemon => {
      const item = document.createElement('div');
      item.className = 'filter-item';
      item.dataset.pokemonId = pokemon.id;
      const spritePath = App.getSpritePath(pokemon.name);
      item.innerHTML = `
        <img src="${spritePath}" alt="${pokemon.name}">
        <div class="filter-item-name">#${pokemon.id} ${pokemon.name}</div>
      `;
      item.addEventListener('click', () => {
        const wasSelected = item.classList.contains('selected');

        // Deselect all other Pokemon items first
        const allPokemonItems = App.pokemonContent.querySelectorAll('.filter-item');
        allPokemonItems.forEach(pokemonItem => {
          pokemonItem.classList.remove('selected');
        });
        App.selectedPokemonIds.clear();

        // If clicking the same Pokemon that was selected, deselect it
        // Otherwise, select the new Pokemon
        if (!wasSelected) {
          item.classList.add('selected');
          App.selectedPokemonIds.add(pokemon.id);
        }

        // Update area highlighting and location filter
        App.updateLocationHighlights();
        App.populateLocationFilter();
      });
      App.pokemonContent.appendChild(item);
    });

  // Populate location filter after Pokemon filter is set up
  App.populateLocationFilter();
}

// Wait for DOM and data to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for encounter data to load (it might already be loaded)
  if (Object.keys(App.encountersByLocation).length > 0) {
    initializeFilters();
  } else {
    App.loadEncounterData().then(() => {
      initializeFilters();
    });
  }
});

// Populate Location filter with hierarchy
// This will be populated after encounter data loads
App.populateLocationFilter = function() {
  const locationContent = App.locationContent || document.getElementById('location-content');
  if (!locationContent) return;

  // Clear existing content
  locationContent.innerHTML = '';

  // Get locations that have encounters
  const locationsWithEncounters = new Set(Object.keys(App.encountersByLocation));

  // Filter locations based on selected Pokemon
  let filteredLocationIds = locationsWithEncounters;
  if (App.selectedPokemonIds.size > 0) {
    filteredLocationIds = new Set();
    App.selectedPokemonIds.forEach(pokemonId => {
      const locations = App.pokemonEncountersByLocation[pokemonId];
      if (locations) {
        locations.forEach(locId => filteredLocationIds.add(locId));
      }
    });
  }

  // Group areas by main label
  const mainAreas = App.getLocationAreas().filter(area => area.isMainLabel);
  const regularAreas = App.getLocationAreas().filter(area => !area.isMainLabel && area.label);

  // Create a map of main areas to their sub-areas
  const areaHierarchy = {};
  mainAreas.forEach(mainArea => {
    if (mainArea.subAreaIds) {
      // Filter sub-areas to only include those with encounters
      const filteredSubs = mainArea.subAreaIds
        .map(subId => {
          const subArea = App.getLocationAreas().find(a => a.id === subId);
          if (!subArea) return null;
          // Only include if it has encounters (or if any sub-area has encounters for selected Pokemon)
          if (filteredLocationIds.has(subId)) {
            return { id: subArea.id, name: subArea.label };
          }
          return null;
        })
        .filter(Boolean);

      // Only add main area if it has sub-areas with encounters
      if (filteredSubs.length > 0) {
        areaHierarchy[mainArea.label] = filteredSubs;
      }
    }
  });

  // Get all locations not in a hierarchy
  const subAreaIds = new Set(mainAreas.flatMap(m => m.subAreaIds || []));
  const standaloneAreas = regularAreas
    .filter(area => !subAreaIds.has(area.id) && filteredLocationIds.has(area.id))
    .map(area => ({ id: area.id, name: area.label, isStandalone: true }));

  // Custom sort function for routes and other locations
  function sortLocations(a, b) {
    // Main areas always go to the bottom
    if (a.isMain && !b.isMain) return 1;
    if (!a.isMain && b.isMain) return -1;

    // If both are main areas, sort alphabetically
    if (a.isMain && b.isMain) {
      return a.name.localeCompare(b.name);
    }

    // For standalone areas
    const aName = a.name;
    const bName = b.name;

    // Extract route numbers if they exist
    const aRouteMatch = aName.match(/Route (\d+)/);
    const bRouteMatch = bName.match(/Route (\d+)/);

    // If both are routes, sort numerically
    if (aRouteMatch && bRouteMatch) {
      return parseInt(aRouteMatch[1]) - parseInt(bRouteMatch[1]);
    }

    // If only one is a route, routes come first
    if (aRouteMatch) return -1;
    if (bRouteMatch) return 1;

    // Otherwise, sort alphabetically
    return aName.localeCompare(bName);
  }

  // Combine and sort
  const allLocations = [
    ...Object.entries(areaHierarchy).map(([mainName, subs]) => ({
      name: mainName,
      isMain: true,
      subAreas: subs
    })),
    ...standaloneAreas
  ].sort(sortLocations);

  // Render locations
  allLocations.forEach(location => {
  if (location.isMain) {
    // Main area with sub-areas (collapsible)
    const mainItem = document.createElement('div');
    mainItem.className = 'filter-item filter-item-main';
    mainItem.style.gridColumn = '1 / -1'; // Span full width
    mainItem.style.background = '#8B4513';
    mainItem.style.color = '#FFF';
    mainItem.style.cursor = 'pointer';
    mainItem.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div class="filter-item-name">${location.name}</div>
        <span class="dropdown-arrow">▼</span>
      </div>
    `;

    // Container for sub-areas
    const subContainer = document.createElement('div');
    subContainer.className = 'sub-areas-container';
    subContainer.style.gridColumn = '1 / -1';
    subContainer.style.display = 'none'; // Hidden by default

    // Sub-areas
    location.subAreas.forEach(subArea => {
      const subItem = document.createElement('div');
      subItem.className = 'filter-item filter-item-sub';
      subItem.style.marginLeft = '10px';
      subItem.style.marginTop = '8px';
      subItem.dataset.areaId = subArea.id; // Store area ID for later reference
      subItem.innerHTML = `<div class="filter-item-name">${subArea.name}</div>`;
      subItem.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering parent collapse
        // Find the area rectangle and trigger its click
        const areaRect = App.allAreas[subArea.id];
        if (areaRect) {
          areaRect.fire('click');
        }
      });
      subContainer.appendChild(subItem);
    });

    // Toggle sub-areas on main item click
    mainItem.addEventListener('click', () => {
      const isHidden = subContainer.style.display === 'none';
      subContainer.style.display = isHidden ? 'grid' : 'none';
      subContainer.style.gridTemplateColumns = '1fr 1fr';
      subContainer.style.gap = '12px';
      const arrow = mainItem.querySelector('.dropdown-arrow');
      arrow.textContent = isHidden ? '▲' : '▼';
    });

    locationContent.appendChild(mainItem);
    locationContent.appendChild(subContainer);
  } else {
    // Standalone area
    const item = document.createElement('div');
    item.className = 'filter-item';
    item.dataset.areaId = location.id; // Store area ID for later reference
    item.innerHTML = `<div class="filter-item-name">${location.name}</div>`;
    item.addEventListener('click', () => {
      // Find the area rectangle and trigger its click
      const areaRect = App.allAreas[location.id];
      if (areaRect) {
        areaRect.fire('click');
      }
    });
    locationContent.appendChild(item);
  }
  }); // Close forEach callback
}