// modal.js - Pokemon modal functionality

// Create App namespace if it doesn't exist
window.App = window.App || {};

// Initialize modal elements and event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Modal elements
  App.modalOverlay = document.getElementById('pokemon-modal-overlay');
  App.modalCloseBtn = document.getElementById('modal-close-btn');
  App.modalImage = document.getElementById('modal-image');
  App.modalName = document.getElementById('modal-name');
  App.modalHeight = document.getElementById('modal-height');
  App.modalWeight = document.getElementById('modal-weight');
  App.modalCategory = document.getElementById('modal-category');
  App.modalAbility = document.getElementById('modal-ability');
  App.modalLoading = document.getElementById('modal-loading');
  App.modalContent = document.getElementById('pokemon-modal');

  // Close modal
  App.closeModal = function() {
    App.modalOverlay.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
  };

  if (App.modalCloseBtn) {
    App.modalCloseBtn.addEventListener('click', App.closeModal);
  }

  // Close on clicking outside modal content
  if (App.modalOverlay) {
    App.modalOverlay.addEventListener('click', (e) => {
      if (e.target === App.modalOverlay) {
        App.closeModal();
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && App.modalOverlay && App.modalOverlay.style.display === 'flex') {
      App.closeModal();
    }
  });
});

// Show modal and fetch data
App.showPokemonModal = async function(pokemonName) {
  // Ensure modal elements are initialized
  if (!App.modalOverlay) {
    App.modalOverlay = document.getElementById('pokemon-modal-overlay');
    App.modalImage = document.getElementById('modal-image');
    App.modalName = document.getElementById('modal-name');
    App.modalHeight = document.getElementById('modal-height');
    App.modalWeight = document.getElementById('modal-weight');
    App.modalCategory = document.getElementById('modal-category');
    App.modalAbility = document.getElementById('modal-ability');
    App.modalLoading = document.getElementById('modal-loading');
  }

  // Show overlay
  App.modalOverlay.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // Prevent background scrolling

  // Show loading state for stats, but show image immediately
  App.modalLoading.style.display = 'block';

  // Set Image immediately using local sprite
  const spritePath = App.getSpritePath(pokemonName);
  App.modalImage.src = spritePath;
  App.modalImage.style.opacity = '1';

  App.modalName.textContent = App.formatPokemonName(pokemonName); // Show name immediately too
  App.modalHeight.textContent = '-';
  App.modalWeight.textContent = '-';
  App.modalCategory.textContent = '-';
  App.modalAbility.textContent = '-';

  // Normalize name for API
  // Handle special cases like Nidoran
  let apiName = pokemonName.toLowerCase();
  if (apiName.includes('♀')) apiName = 'nidoran-f';
  else if (apiName.includes('♂')) apiName = 'nidoran-m';
  else apiName = apiName.replace(/\s+/g, '-').replace(/'/g, '').replace(/\./g, '');

  try {
    // Fetch Pokemon data
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${apiName}`);
    if (!response.ok) throw new Error('Pokemon not found');
    const data = await response.json();

    // Image is already set, no need to update

    // Name is already set

    // Update Height (dm -> ft/in)
    // 1 dm = 0.328084 ft
    const heightInFeet = data.height * 0.328084;
    const feet = Math.floor(heightInFeet);
    const inches = Math.round((heightInFeet - feet) * 12);
    App.modalHeight.textContent = `${feet}' ${inches.toString().padStart(2, '0')}"`;

    // Update Weight (hg -> lbs)
    // 1 hg = 0.220462 lbs
    const weightInLbs = (data.weight * 0.220462).toFixed(1);
    App.modalWeight.textContent = `${weightInLbs} lbs`;

    // Update Ability (use first ability)
    const abilityName = data.abilities[0].ability.name.replace('-', ' ');
    App.modalAbility.textContent = abilityName.charAt(0).toUpperCase() + abilityName.slice(1);

    // Fetch Species data for Category
    const speciesResponse = await fetch(data.species.url);
    if (speciesResponse.ok) {
      const speciesData = await speciesResponse.json();
      // Find genus in English
      const genusEntry = speciesData.genera.find(g => g.language.name === 'en');
      if (genusEntry) {
        const category = genusEntry.genus.replace(' Pokémon', '');
        App.modalCategory.textContent = category;
      }
    }

  } catch (error) {
    console.error('Error fetching Pokemon data:', error);
    App.modalName.textContent = App.formatPokemonName(pokemonName); // Show name at least
    App.modalImage.src = App.getSpritePath(pokemonName); // Fallback to pixel sprite
    App.modalImage.style.opacity = '1';
  } finally {
    App.modalLoading.style.display = 'none';
  }

  // Generate and display range graph
  App.generateRangeGraph(pokemonName, App.selectedLocationId);
  
  // --- TO RENDER YOUR RADAR CHART ---
  App.renderRadarChart(pokemonName);
}

/**
 * Generates a range graph showing wild encounter level ranges for a Pokemon
 * @param {string} pokemonName - The name of the Pokemon
 * @param {string|null} locationId - Optional location ID to filter by
 */
App.generateRangeGraph = async function(pokemonName, locationId = null) {
  const graphContainer = document.getElementById('modal-range-graph');
  if (!graphContainer) return;

  // Clear previous graph
  graphContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Loading encounter data...</p>';

  // Normalize Pokemon name for matching
  const normalizedName = pokemonName.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '').replace(/\./g, '');

  // Collect encounter data by parsing CSV directly
  const encounterData = [];

  try {
    const response = await fetch('./src/data/gen1_red_walk_tidy.csv');
    const csvText = await response.text();
    const lines = csvText.split('\n');

    // Parse header to find column indices
    const header = lines[0].split(',').map(h => h.trim());
    const pokemonIdx = header.indexOf('pokemon');
    const pokemonIdIdx = header.indexOf('pokemon_id');
    const locationIdx = header.indexOf('location') !== -1 ? header.indexOf('location') : header.indexOf('location_area_slug');
    const versionIdx = header.indexOf('version');
    const minLevelIdx = header.indexOf('min_level');
    const maxLevelIdx = header.indexOf('max_level');
    const methodIdx = header.indexOf('method');
    const chanceIdx = header.indexOf('chance');

    // Check if required columns exist
    if (pokemonIdx === -1 || locationIdx === -1) {
      throw new Error('Required CSV columns not found');
    }

    // Parse CSV lines
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',');
      const csvPokemonName = parts[pokemonIdx]?.toLowerCase().trim();

      if (csvPokemonName === normalizedName) {
        const csvLocationId = parts[locationIdx]?.trim();
        if (!csvLocationId) continue;

        // Filter by selected location if provided
        if (locationId && csvLocationId !== locationId) continue;

        const locationArea = App.getLocationAreas().find(area => area.id === csvLocationId);
        const locationName = locationArea ? locationArea.label : csvLocationId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        encounterData.push({
          pokemon: pokemonName,
          pokemon_id: pokemonIdIdx !== -1 ? parseInt(parts[pokemonIdIdx]) || 0 : 0,
          location: csvLocationId,
          version: versionIdx !== -1 ? (parts[versionIdx]?.trim() || 'red') : 'red',
          min_level: minLevelIdx !== -1 ? parseInt(parts[minLevelIdx]) || 1 : 1,
          max_level: maxLevelIdx !== -1 ? parseInt(parts[maxLevelIdx]) || 1 : 1,
          method: methodIdx !== -1 ? (parts[methodIdx]?.trim() || 'walk') : 'walk',
          chance: chanceIdx !== -1 ? parseInt(parts[chanceIdx]) || 0 : 0,
          location_clean: locationName
        });
      }
    }
  } catch (error) {
    console.error('Error loading CSV for range graph:', error);
    graphContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Error loading encounter data.</p>';
    return;
  }

  // If no encounter data found, show message
  if (encounterData.length === 0) {
    graphContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No encounter data available for this Pokemon.</p>';
    return;
  }

  // Use only the first version found (or default to 'red')
  const primaryVersion = encounterData.length > 0 ? encounterData[0].version : 'red';
  const versionColor = primaryVersion.toLowerCase() === 'blue' || primaryVersion.toLowerCase() === 'leafgreen' ? "#00B906" : "#E3350D";

  // Filter to only show the primary version
  const filteredData = encounterData.filter(d => d.version === primaryVersion);

  // Aggregate by location to get overall min/max levels per location
  const locationMap = new Map();
  filteredData.forEach(d => {
    if (!locationMap.has(d.location_clean)) {
      locationMap.set(d.location_clean, {
        location_clean: d.location_clean,
        min_level: d.min_level,
        max_level: d.max_level,
        method: d.method,
        chance: d.chance
      });
    } else {
      const existing = locationMap.get(d.location_clean);
      existing.min_level = Math.min(existing.min_level, d.min_level);
      existing.max_level = Math.max(existing.max_level, d.max_level);
      existing.chance = Math.max(existing.chance, d.chance); // Use max chance
    }
  });

  // Convert to array and sort by location name, and add level range string
  const aggregatedData = Array.from(locationMap.values())
    .map(d => ({
      ...d,
      level_range: `${d.min_level}-${d.max_level}`
    }))
    .sort((a, b) => a.location_clean.localeCompare(b.location_clean));

  // Calculate min/max levels for domain with nice rounding
  const allLevels = aggregatedData.flatMap(d => [d.min_level, d.max_level]);
  const dataMinLevel = Math.min(...allLevels, 1);
  const dataMaxLevel = Math.max(...allLevels, 70);

  // Round domain to nice numbers with padding
  const domainMin = Math.max(1, Math.floor(dataMinLevel / 5) * 5);
  const domainMax = Math.min(100, Math.ceil(dataMaxLevel / 5) * 5 + 5);

  // Calculate appropriate dimensions
  const numLocations = aggregatedData.length;
  // If location is selected, use compact height (no y-axis needed)
  const chartHeight = locationId ? 100 : Math.max(120, Math.min(250, numLocations * 30 + 40));
  const chartWidth = 380;

  // Altair equivalent structure:
  // base = alt.Chart(df).encode(
  //   x=alt.X('min_level:Q', scale=alt.Scale(domain=[domainMin, domainMax])),
  //   tooltip=[...]
  // )
  // rule = base.mark_rule(strokeWidth=4).encode(x2='max_level:Q')
  // ticks = base.mark_tick(size=14).encode(x='min_level:Q') + base.mark_tick().encode(x='max_level:Q')
  // chart = (rule + ticks).properties(width=width, height=height)

  // Build encoding based on whether location is selected
  const baseEncoding = {
    "x": {
      "field": "min_level",
      "type": "quantitative",
      "scale": {
        "domain": [domainMin, domainMax],
        "nice": true
      },
      "axis": {
        "title": "Level",
        "format": "d"
      }
    },
    "x2": {
      "field": "max_level"
    },
    "tooltip": [
      {
        "field": "level_range",
        "title": "Level Range",
        "type": "nominal"
      },
      {
        "field": "min_level",
        "title": "Min",
        "type": "quantitative",
        "format": "d"
      },
      {
        "field": "max_level",
        "title": "Max",
        "type": "quantitative",
        "format": "d"
      },
      {
        "field": "chance",
        "title": "Encounter Rate",
        "type": "quantitative",
        "format": ".1f",
        "formatType": "number"
      }
    ]
  };

  // Add y encoding only if location is not selected (multiple locations)
  if (!locationId) {
    baseEncoding.y = {
      "field": "location_clean",
      "type": "nominal",
      "title": "Location",
      "axis": {
        "labelLimit": 120,
        "labelAngle": 0
      },
      "sort": null
    };
  }

  // Create Vega-Lite specification
  const spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.20.1.json",
    "config": {
      "view": {
        "continuousWidth": chartWidth,
        "continuousHeight": chartHeight,
        "strokeWidth": 0
      },
      "axis": {
        "labelFontSize": 11,
        "titleFontSize": 12,
        "titleFontWeight": "bold",
        "labelPadding": 5,
        "titlePadding": 8,
        "grid": true,
        "gridColor": "#E0E0E0",
        "gridOpacity": 0.5,
        "domainColor": "#999",
        "tickColor": "#999"
      },
      "axisX": {
        "tickCount": Math.min(10, Math.ceil((domainMax - domainMin) / 5))
      },
      "axisY": locationId ? {
        "labels": false,
        "title": null,
        "domain": false,
        "ticks": false
      } : {
        "labelLimit": 120,
        "labelAngle": 0
      },
      "title": {
        "fontSize": 13,
        "fontWeight": "bold",
        "anchor": "start",
        "offset": 10
      },
      "tooltip": {
        "theme": "light"
      }
    },
    "layer": [
      {
        "mark": {
          "type": "rule",
          "strokeWidth": 4,
          "color": versionColor,
          "opacity": 0.8,
          "cursor": "pointer"
        },
        "encoding": baseEncoding
      },
      {
        "mark": {
          "type": "tick",
          "size": 14,
          "thickness": 3,
          "color": versionColor,
          "cursor": "pointer"
        },
        "encoding": {
          "x": {
            "field": "min_level",
            "type": "quantitative"
          },
          ...(locationId ? {} : {
            "y": {
              "field": "location_clean",
              "type": "nominal",
              "sort": null
            }
          }),
          "tooltip": baseEncoding.tooltip
        }
      },
      {
        "mark": {
          "type": "tick",
          "size": 14,
          "thickness": 3,
          "color": versionColor,
          "cursor": "pointer"
        },
        "encoding": {
          "x": {
            "field": "max_level",
            "type": "quantitative"
          },
          ...(locationId ? {} : {
            "y": {
              "field": "location_clean",
              "type": "nominal",
              "sort": null
            }
          }),
          "tooltip": baseEncoding.tooltip
        }
      }
    ],
    "data": {"values": aggregatedData},
    "height": chartHeight,
    "width": chartWidth,
    "title": locationId
      ? `Level Range: ${App.formatPokemonName(pokemonName)}`
      : `Encounter Level Ranges: ${App.formatPokemonName(pokemonName)}`,
    "padding": {"left": 10, "right": 10, "top": 10, "bottom": 10}
  };

  // Embed the visualization
  if (typeof vegaEmbed !== 'undefined') {
    vegaEmbed("#modal-range-graph", spec, {
      "mode": "vega-lite",
      "tooltip": true,
      "actions": false
    })
      .catch(error => {
        console.error('Error rendering range graph:', error);
        graphContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Error loading encounter data visualization.</p>';
      });
  } else {
    graphContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Visualization library not loaded.</p>';
  }
}

/**
 * Renders the Altair Radar Chart from your generated JSON files
 */
App.renderRadarChart = function(pokemonName) {
  const chartContainer = document.getElementById('modal-radar-chart');
  if (!chartContainer) return;

  chartContainer.innerHTML = '<p style="text-align: center; color: #666;">Loading radar chart...</p>';

  // Format the name exactly like your Python script saved it (e.g., nidoran-f)
  let apiName = pokemonName.toLowerCase()
    .replace('♀', '-f')
    .replace('♂', '-m')
    .replace(/\s+/g, '-')
    .replace(/'/g, '')
    .replace(/\./g, '');

  // Point to the JSON files inside your src/assets/charts folder
  const chartPath = `./src/assets/charts/${apiName}_chart.json`;

  // Use Vega-Embed to render the chart into the div
  if (typeof vegaEmbed !== 'undefined') {
    vegaEmbed("#modal-radar-chart", chartPath, { 
      mode: "vega-lite", 
      actions: false, // Hides the "View Source" button for a cleaner look
      tooltip: true
    }).catch(error => {
      console.error('Radar chart error:', error);
      chartContainer.innerHTML = '<p style="text-align: center; color: #666;">Radar chart not available.</p>';
    });
  }
}

