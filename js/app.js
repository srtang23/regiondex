// app.js

// Helper functions to access data from data.js (attached to window)
// Using functions ensures we always get the latest value from window
function getEncounterData() {
  return window.encounterData || {};
}

function getLocationAreas() {
  return window.locationAreas || [];
}

function getGen1Pokemon() {
  return window.gen1Pokemon || [];
}

// --- 1) Configure your image map ---
// Using full_kanto_map.png (7700x6400) for high quality zooming
const IMAGE_WIDTH = 7700;
const IMAGE_HEIGHT = 6400;

// Leaflet uses [y, x] for "LatLng"-like pairs in CRS.Simple.
// We'll store data as [x, y], then convert with toLatLng().
const toLatLng = ([x, y]) => [y, x];

// ===== LOAD ENCOUNTER DATA FROM CSV =====
let encountersByLocation = {};
let pokemonMarkers = {}; // Store markers by location ID

async function loadEncounterData() {
  try {
          const response = await fetch('./data/gen1_red_walk_tidy.csv');
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
      if (!encountersByLocation[locationSlug]) {
        encountersByLocation[locationSlug] = new Map();
      }

      // Add or update pokemon with cumulative encounter rate
      if (!encountersByLocation[locationSlug].has(pokemonId)) {
        encountersByLocation[locationSlug].set(pokemonId, {
          id: pokemonId,
          name: pokemonName,
          totalChance: encounterChance
        });
      } else {
        // Add to existing encounter rate
        const existing = encountersByLocation[locationSlug].get(pokemonId);
        existing.totalChance += encounterChance;
      }
    }

    // Convert Maps to sorted arrays
    Object.keys(encountersByLocation).forEach(location => {
      encountersByLocation[location] = Array.from(encountersByLocation[location].values())
        .sort((a, b) => a.id - b.id);
    });

    console.log('Loaded encounter data for', Object.keys(encountersByLocation).length, 'locations');

  } catch (error) {
    console.error('Error loading encounter data:', error);
  }
}

// Pokemon encounter data by location (temporary fallback)

const bounds = [
  [0, 0],
  [IMAGE_HEIGHT, IMAGE_WIDTH],
];

const map = L.map("map", {
  crs: L.CRS.Simple,
  minZoom: -3,  // Allow zooming out more to see full image
  maxZoom: 5,  // Increased max zoom for better detail
  zoomControl: false,  // Disable default zoom control
  zoomSnap: 0.5,  // Larger zoom increments for easier manual zooming
  zoomDelta: 1,  // Larger zoom steps (double click, scroll wheel)
  preferCanvas: true,  // Use canvas renderer for better performance
});

// Add zoom control to bottom-right
L.control.zoom({
  position: 'bottomright'
}).addTo(map);

// Your Kanto map image with optimized rendering
      L.imageOverlay("./assets/images/full_kanto_map.png", bounds, {
  opacity: 1,
  className: 'high-quality-map',
}).addTo(map);

// Track currently selected area globally
let currentlySelectedArea = null;
let groupedAreas = {}; // Track areas by group
let allAreas = {}; // Track all rectangles by ID
let allLabels = {}; // Track all labels by ID

// Function to create interactive location areas
function createLocationArea(config) {
  const {
    id,
    bounds,
    label,
    borderColor = '#FFBD1D',
    fillColor = '#F4D995',
    borderWeight = 4,
    labelOffset = 30,
    labelOffsetX = 0,
    labelOffsetY = 0,
    labelPosition = 'right',
    labelFontSize,
    isMainLabel = false,
    mainAreaBounds = null,
    mainAreaPolygon = null, // Custom polygon coordinates [[x1,y1], [x2,y2], ...]
    subAreaIds = [],
    zoomLevel = 3,
    group
  } = config;

  // If this is a main label (like "Safari Zone"), create clickable text that selects all sub-areas
  if (isMainLabel) {
    const centerX = (bounds[0][0] + bounds[1][0]) / 2;
    const centerY = (bounds[0][1] + bounds[1][1]) / 2;
    const customOffsetX = config.labelOffsetX || 0;
    const customOffsetY = config.labelOffsetY || 0;

    let labelLng, labelLat;
    if (labelPosition === 'bottom') {
      labelLng = centerX + customOffsetX;
      labelLat = bounds[0][1] - labelOffset + customOffsetY;
    } else if (labelPosition === 'top') {
      labelLng = centerX + customOffsetX;
      labelLat = bounds[1][1] + labelOffset + customOffsetY;
    } else if (labelPosition === 'right') {
      labelLng = bounds[1][0] + labelOffset + customOffsetX;
      labelLat = centerY + customOffsetY;
    } else if (labelPosition === 'left') {
      labelLng = bounds[0][0] - labelOffset + customOffsetX;
      labelLat = centerY + customOffsetY;
    } else {
      labelLng = centerX + customOffsetX;
      labelLat = centerY + customOffsetY;
    }

    let isSelected = false;

    // Create the main area polygon (hidden by default)
    let polygonCoords;
    let leafletMainBounds;

    if (mainAreaPolygon) {
      // Use custom polygon coordinates
      // Convert from [X, Y] format to Leaflet's [Y, X] format
      polygonCoords = mainAreaPolygon.map(coord => [coord[1], coord[0]]);

      // Calculate bounds from polygon for zoom
      const allX = mainAreaPolygon.map(c => c[0]);
      const allY = mainAreaPolygon.map(c => c[1]);
      const minX = Math.min(...allX);
      const maxX = Math.max(...allX);
      const minY = Math.min(...allY);
      const maxY = Math.max(...allY);
      leafletMainBounds = [[minY, minX], [maxY, maxX]];
    } else {
      // Use rectangular bounds
      // Convert bounds to polygon coordinates [minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]
      polygonCoords = [
        [mainAreaBounds[0][1], mainAreaBounds[0][0]],  // bottom-left [minY, minX]
        [mainAreaBounds[0][1], mainAreaBounds[1][0]],  // bottom-right [minY, maxX]
        [mainAreaBounds[1][1], mainAreaBounds[1][0]],  // top-right [maxY, maxX]
        [mainAreaBounds[1][1], mainAreaBounds[0][0]]   // top-left [maxY, minX]
      ];
      leafletMainBounds = [
        [mainAreaBounds[0][1], mainAreaBounds[0][0]],  // [minY, minX]
        [mainAreaBounds[1][1], mainAreaBounds[1][0]]   // [maxY, maxX]
      ];
    }

    const mainPolygon = L.polygon(polygonCoords, {
      color: borderColor,
      weight: 0,
      fillColor: fillColor,
      fillOpacity: 0,
      dashArray: '10, 5',
      className: 'location-area-highlight',
      interactive: false // Don't block clicks to sub-areas
    }).addTo(map);

    const mainBaseFontSize = 16;

    const mainLabelDiv = document.createElement('div');
    mainLabelDiv.style.cssText = `
      font-weight: bold;
      font-size: ${mainBaseFontSize}px;
      color: #000000;
      white-space: nowrap;
      cursor: pointer;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      pointer-events: auto;
      transition: color 0.15s ease-out;
    `;
    mainLabelDiv.textContent = label;

    const mainLabel = L.marker([labelLat, labelLng], {
      icon: L.divIcon({
        className: 'area-label area-label-interactive',
        html: mainLabelDiv.outerHTML,
        iconSize: [300, 60],
        iconAnchor: [150, 30]
      })
    }).addTo(map);

    // Function to update main label size dynamically
    function updateMainLabelSize() {
      const zoom = map.getZoom();
      const fontSize = mainBaseFontSize * Math.pow(1.2, zoom + 3);
      const estimatedTextWidth = label.length * fontSize * 0.7;

      const newMainLabelDiv = document.createElement('div');
      newMainLabelDiv.style.cssText = `
        font-weight: bold;
        font-size: ${fontSize}px;
        color: #000000;
        white-space: nowrap;
        cursor: pointer;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        pointer-events: auto;
        transition: color 0.15s ease-out;
      `;
      newMainLabelDiv.textContent = label;

      // Calculate anchor based on label position
      let anchorX, anchorY;
      if (labelPosition === 'right') {
        anchorX = 80;  // Anchor at left edge
        anchorY = 30;
      } else if (labelPosition === 'left') {
        anchorX = 130 + (estimatedTextWidth / 2);
        anchorY = 30;
      } else if (labelPosition === 'top') {
        anchorX = 150;
        anchorY = 40;
      } else if (labelPosition === 'bottom') {
        anchorX = 150;
        anchorY = 20;
      } else {
        anchorX = 150;
        anchorY = 30;
      }

      const newIcon = L.divIcon({
        className: 'area-label area-label-interactive',
        html: newMainLabelDiv.outerHTML,
        iconSize: [300, 60],
        iconAnchor: [anchorX, anchorY]
      });
      mainLabel.setIcon(newIcon);

      // Reapply color after setIcon
      const labelElement = mainLabel.getElement()?.querySelector('div');
      if (labelElement && isSelected) {
        labelElement.style.color = '#FFBD1D';
      }
    }

    // Update size on zoom
    map.on('zoom', updateMainLabelSize);
    map.on('zoomend', updateMainLabelSize);
    setTimeout(updateMainLabelSize, 100);

    // Hover handler for main label
    mainLabel.on('mouseover', function() {
      if (!isSelected) {
        mainPolygon.setStyle({
          fillOpacity: 0.3,
          weight: borderWeight
        });
      }
      const labelElement = mainLabel.getElement()?.querySelector('div');
      if (labelElement) {
        labelElement.style.color = '#FFBD1D';
      }
    });

    mainLabel.on('mouseout', function() {
      if (!isSelected) {
        mainPolygon.setStyle({
          fillOpacity: 0,
          weight: 0
        });
      }
      const labelElement = mainLabel.getElement()?.querySelector('div');
      if (labelElement && !isSelected) {
        labelElement.style.color = '#000000';
      }
    });

    // Click handler for main label
    mainLabel.on('click', function() {
      if (!isSelected) {
        // Deselect previously selected area if any
        if (currentlySelectedArea) {
          currentlySelectedArea.deselect();
        }

        // Select: show main polygon border
        isSelected = true;
        currentlySelectedArea = mainPolygon;

        mainPolygon.setStyle({
          fillOpacity: 0,
          weight: borderWeight
        });

        // Update label color
        const labelElement = mainLabel.getElement()?.querySelector('div');
        if (labelElement) {
          labelElement.style.color = '#FFBD1D';
        }

        // Display Pokemon for all sub-areas
        if (subAreaIds && subAreaIds.length > 0) {
          subAreaIds.forEach(subAreaId => {
            const subArea = getLocationAreas().find(a => a.id === subAreaId);
            if (subArea && subArea.bounds) {
              displayPokemonInArea(subAreaId, subArea.bounds);
            }
          });
        }

        // Zoom to main area
        map.flyToBounds(leafletMainBounds, {
          padding: [50, 50],
          maxZoom: zoomLevel,
          duration: 1
        });
      } else {
        // Deselect: hide main polygon
        isSelected = false;
        currentlySelectedArea = null;

        mainPolygon.setStyle({
          fillOpacity: 0,
          weight: 0
        });

        // Hide Pokemon for all sub-areas
        if (subAreaIds && subAreaIds.length > 0) {
          subAreaIds.forEach(subAreaId => {
            hidePokemonInArea(subAreaId);
          });
        }

        // Update label color
        const labelElement = mainLabel.getElement()?.querySelector('div');
        if (labelElement) {
          labelElement.style.color = '#000000';
        }

        // Zoom out to full map
        map.flyToBounds([[0, 0], [IMAGE_HEIGHT, IMAGE_WIDTH]], {
          padding: [0, 0],
          maxZoom: 1,
          duration: 1
        });
      }
    });

    // Add deselect method to main polygon
    mainPolygon.deselect = function() {
      isSelected = false;
      this.setStyle({
        fillOpacity: 0,
        weight: 0
      });
      const labelElement = mainLabel.getElement()?.querySelector('div');
      if (labelElement) {
        labelElement.style.color = '#000000';
      }

      // Hide Pokemon for all sub-areas
      if (subAreaIds && subAreaIds.length > 0) {
        subAreaIds.forEach(subAreaId => {
          hidePokemonInArea(subAreaId);
        });
      }
    };

    return { rectangle: mainPolygon, label: mainLabel };
  }

  let isSelected = false;

  // Convert bounds from [X, Y] format to Leaflet's [Y, X] format
  // bounds input: [[minX, minY], [maxX, maxY]]
  // Leaflet needs: [[minY, minX], [maxY, maxX]]
  const leafletBounds = [
    [bounds[0][1], bounds[0][0]],  // [minY, minX]
    [bounds[1][1], bounds[1][0]]   // [maxY, maxX]
  ];

  // Create rectangle
  const rectangle = L.rectangle(leafletBounds, {
    color: borderColor,
    weight: 0,  // Hidden by default
    fillColor: fillColor,
    fillOpacity: 0,  // Hidden by default
    dashArray: '10, 5',
    className: 'location-area-highlight'
  }).addTo(map);

  // Show highlight on hover
  rectangle.on('mouseover', function() {
    this.setStyle({
      fillOpacity: 0.3,
      weight: borderWeight
    });
    updateLabelStyle(true, isSelected);
  });

  // Hide highlight when not hovering
  rectangle.on('mouseout', function() {
    if (isSelected) {
      // If selected, show only border (no fill)
      this.setStyle({
        fillOpacity: 0,
        weight: borderWeight
      });
      updateLabelStyle(false, true);
    } else {
      // If not selected, hide everything
      this.setStyle({
        fillOpacity: 0,
        weight: 0
      });
      updateLabelStyle(false, false);
    }
  });

  // Toggle selection on click
  rectangle.on('click', function() {
    if (!isSelected) {
      // Deselect previously selected area if any
      if (currentlySelectedArea && currentlySelectedArea !== rectangle) {
        currentlySelectedArea.deselect();
      }

      // Select: show only border, zoom in
      isSelected = true;
      currentlySelectedArea = rectangle;

      // Update sidebar item to show selected state
      const sidebarItem = document.querySelector(`[data-area-id="${id}"]`);
      if (sidebarItem) {
        sidebarItem.classList.add('selected');
      }

      // If part of a group, select all areas in the group
      if (group && groupedAreas[group]) {
        groupedAreas[group].forEach(rect => {
          rect.setStyle({
            fillOpacity: 0,
            weight: borderWeight
          });
        });
      } else {
        this.setStyle({
          fillOpacity: 0,
          weight: borderWeight
        });
      }

      updateLabelStyle(false, true);

      // Display Pokemon for this area
      displayPokemonInArea(id, bounds);

      map.flyToBounds(leafletBounds, {
        padding: [50, 50],
        maxZoom: zoomLevel,
        duration: 1
      });
    } else {
      // Deselect: hide everything, zoom out to full map
      isSelected = false;
      currentlySelectedArea = null;

      // Hide Pokemon for this area
      hidePokemonInArea(id);

      // If part of a group, deselect all areas in the group
      if (group && groupedAreas[group]) {
        groupedAreas[group].forEach(rect => {
          rect.setStyle({
            fillOpacity: 0,
            weight: 0
          });
        });
      } else {
        this.setStyle({
          fillOpacity: 0,
          weight: 0
        });
      }

      updateLabelStyle(false, false);

      // Update sidebar item to remove selected state
      const sidebarItem = document.querySelector(`[data-area-id="${id}"]`);
      if (sidebarItem) {
        sidebarItem.classList.remove('selected');
      }

      map.flyToBounds([[0, 0], [IMAGE_HEIGHT, IMAGE_WIDTH]], {
        padding: [0, 0],
        maxZoom: 1,
        duration: 1
      });
    }
  });

  // Calculate label position
  // bounds format: [[minX, minY], [maxX, maxY]]
  // where minX=left, maxX=right, minY=bottom, maxY=top
  const centerX = (bounds[0][0] + bounds[1][0]) / 2;
  const centerY = (bounds[0][1] + bounds[1][1]) / 2;
  let labelLng, labelLat;  // Leaflet uses [lat, lng] which is [Y, X]

  // Get custom offsets if provided
  const customOffsetX = config.labelOffsetX || 0;
  const customOffsetY = config.labelOffsetY || 0;

  // Position labels on the specified side, centered along that edge
  // Note: In your coordinate system, larger Y = higher on screen (top), smaller Y = lower on screen (bottom)
  if (labelPosition === 'right') {
    labelLng = bounds[1][0] + labelOffset + customOffsetX;  // maxX + offset (move right)
    labelLat = centerY + customOffsetY;
  } else if (labelPosition === 'left') {
    labelLng = bounds[0][0] - labelOffset + customOffsetX;  // minX - offset (move left)
    labelLat = centerY + customOffsetY;
  } else if (labelPosition === 'top') {
    // Top = higher Y value, so ADD offset to move label higher
    labelLng = centerX + customOffsetX;
    labelLat = bounds[1][1] + labelOffset + customOffsetY;  // maxY + offset (move up)
  } else if (labelPosition === 'bottom') {
    // Bottom = lower Y value, so SUBTRACT offset to move label lower
    labelLng = centerX + customOffsetX;
    labelLat = bounds[0][1] - labelOffset + customOffsetY;  // minY - offset (move down)
  } else if (labelPosition === 'center') {
    // Center the label in the middle of the area
    labelLng = centerX + customOffsetX;
    labelLat = centerY + customOffsetY;
  } else {
    // Default to right if no position specified
    labelLng = bounds[1][0] + labelOffset + customOffsetX;
    labelLat = centerY + customOffsetY;
  }

  // Add label with dynamic sizing
  const baseFontSize = labelFontSize || 16;  // Use custom font size or default

  const labelDiv = document.createElement('div');
  labelDiv.style.cssText = `
    font-weight: bold;
    font-size: ${baseFontSize}px;
    color: #000000;
    white-space: nowrap;
    cursor: default;
    transition: color 0.15s ease-out;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    pointer-events: none;
  `;
  labelDiv.textContent = label;

  // Function to calculate anchor based on zoom and text width
  function calculateAnchor(zoom) {
    // Adjust zoom so that zoom -3 (initial view) = scale 1
    const fontSize = baseFontSize * Math.pow(1.2, zoom + 3);
    // Estimate text width: roughly 0.7 * fontSize per character (bold text is wider)
    const estimatedTextWidth = label.length * fontSize * 0.7;

    let anchorX;
    let anchorY = 30;  // Y is always centered (for left/right positions)

    if (labelPosition === 'left') {
      // Coordinate is LEFT of the area (at minX - offset), text extends LEFT from there
      // Icon is 300px wide, text is centered at 150px from left edge
      // Text right edge at 150 + textWidth/2, we want this 20px from coordinate (at anchor)
      // So: 150 + textWidth/2 = anchorX + 20, thus anchorX = 130 + textWidth/2
      anchorX = 160 + (estimatedTextWidth / 3);
    } else if (labelPosition === 'right') {
      // Coordinate is RIGHT of the area (at maxX + offset), text should extend RIGHT from coordinate
      // So anchor at LEFT edge of text, text extends right
      anchorX = 115;  // Anchor at right edge
    } else if (labelPosition === 'top') {
      anchorX = 150;  // Center horizontally
      anchorY = 40;   // Anchor at top
    } else if (labelPosition === 'center') {
      anchorX = 150;  // Center horizontally
      anchorY = 30;   // Center vertically
    } else {  // bottom
      anchorX = 150;  // Center horizontally
      anchorY = 20;    // Anchor at bottom
    }

    return [anchorX, anchorY];
  }

  // Calculate initial anchor
  const initialAnchor = calculateAnchor(map.getZoom());

  // Create marker with calculated initial anchor
  const areaLabel = L.marker([labelLat, labelLng], {
    icon: L.divIcon({
      className: 'area-label',
      html: labelDiv.outerHTML,
      iconSize: [300, 60],
      iconAnchor: initialAnchor
    })
  }).addTo(map);

  // Function to update label font size and anchor based on zoom
  function updateLabelSize() {
    const zoom = map.getZoom();
    // Adjust zoom so that zoom -3 (initial view) = scale 1
    const fontSize = baseFontSize * Math.pow(1.2, zoom + 3);

    // Create new label div with updated font size
    const newLabelDiv = document.createElement('div');
    newLabelDiv.style.cssText = `
      font-weight: bold;
      font-size: ${fontSize}px;
      color: #000000;
      white-space: nowrap;
      cursor: default;
      transition: color 0.15s ease-out;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      pointer-events: none;
    `;
    newLabelDiv.textContent = label;

    // Update the icon with new HTML and anchor
    const newAnchor = calculateAnchor(zoom);
    const newIcon = L.divIcon({
      className: 'area-label',
      html: newLabelDiv.outerHTML,
      iconSize: [300, 60],
      iconAnchor: newAnchor
    });
    areaLabel.setIcon(newIcon);

    // Reapply color after setIcon (which recreates the element)
    updateLabelStyle(false, isSelected);
  }

  // Function to update label style (color only)
  function updateLabelStyle(isHovering, isAreaSelected) {
    const labelElement = areaLabel.getElement()?.querySelector('div');
    if (labelElement) {
      if (isHovering) {
        labelElement.style.color = '#FFBD1D';
      } else if (isAreaSelected) {
        labelElement.style.color = '#FFBD1D';
      } else {
        labelElement.style.color = '#000000';
      }
      // Don't modify font size here - it's handled by updateLabelSize
    }
  }

  // Update size on zoom (both during and after animation)
  map.on('zoom', updateLabelSize);
  map.on('zoomend', updateLabelSize);

  // Set initial size after a short delay to ensure element is rendered
  setTimeout(updateLabelSize, 100);

  // Add deselect method to rectangle
  rectangle.deselect = function() {
    isSelected = false;
    this.setStyle({
      fillOpacity: 0,
      weight: 0
    });
    updateLabelStyle(false, false);

    // Hide Pokemon for this area
    hidePokemonInArea(id);

    // Update sidebar item to remove selected state
    const sidebarItem = document.querySelector(`[data-area-id="${id}"]`);
    if (sidebarItem) {
      sidebarItem.classList.remove('selected');
    }
  };

  // Track this area in its group if it has one
  if (group) {
    if (!groupedAreas[group]) {
      groupedAreas[group] = [];
    }
    groupedAreas[group].push(rectangle);
  }

  // Track this area by ID
  allAreas[id] = rectangle;
  allLabels[id] = areaLabel;

  return { rectangle, label: areaLabel };
}

// Define location areas
// To add more areas, add objects to this array with the following properties:
// - id: unique identifier (e.g., 'kanto-route-2-area')
// - bounds: [[minX, minY], [maxX, maxY]]  // X, Y format for consistency
// - label: display name (e.g., 'Route 2')
// - labelPosition: 'right', 'left', 'top', or 'bottom' (optional, default: 'right')
// - labelOffset: distance from area in pixels (optional, default: 30)
// - labelOffsetX: additional X offset in pixels for fine-tuning (optional, default: 0)
// - labelOffsetY: additional Y offset in pixels for fine-tuning (optional, default: 0)
// - borderColor: hex color for border (optional, default: '#FFBD1D')
// - fillColor: hex color for fill (optional, default: '#F4D995')
// - borderWeight: thickness of border (optional, default: 4)
// - zoomLevel: zoom level when clicked (optional, default: 3)

// ===== POKEMON SPRITE DISPLAY FUNCTIONALITY =====
// Function to display Pokemon sprites in a location area
function displayPokemonInArea(locationId, bounds) {
  // Clear existing markers for this location
  if (pokemonMarkers[locationId]) {
    pokemonMarkers[locationId].forEach(marker => map.removeLayer(marker));
    pokemonMarkers[locationId] = [];
  }

  // Get encounters for this location (try both encountersByLocation and fallback)
        const encounters = encountersByLocation[locationId] || getEncounterData()[locationId] || [];
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
  pokemonMarkers[locationId] = [];

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
      const position = toLatLng([randomX, randomY]);

      // Get sprite path
      const spritePath = getSpritePath(pokemon.name);

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
              <div class="pokemon-tooltip-name">${formatPokemonName(pokemon.name)}</div>
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
      }).addTo(map);

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
         showPokemonModal(pokemon.name);
      });

      pokemonMarkers[locationId].push(marker);
    }
  });
}

// Function to hide Pokemon sprites for a location
function hidePokemonInArea(locationId) {
  if (pokemonMarkers[locationId]) {
    pokemonMarkers[locationId].forEach(marker => map.removeLayer(marker));
    pokemonMarkers[locationId] = [];
  }
}

// Track currently selected area for Pokemon display
let currentSelectedArea = null;

// Load encounter data, then create location areas
// Load encounter data, then create location areas
loadEncounterData().then(() => {
  // Create all location areas
  getLocationAreas().forEach(area => createLocationArea(area));
});

// Fit the entire image in the viewport
map.fitBounds(bounds, {
  padding: [0, 0],  // No padding
  maxZoom: 1  // Don't zoom in too much initially
});

// ===== SIDEBAR MENU FUNCTIONALITY =====
const app = document.getElementById('app');
const sidebar = document.getElementById('sidebar');
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const pokemonHeader = document.getElementById('pokemon-header');
const pokemonContent = document.getElementById('pokemon-content');
const pokemonArrow = document.getElementById('pokemon-arrow');
const locationHeader = document.getElementById('location-header');
const locationContent = document.getElementById('location-content');
const locationArrow = document.getElementById('location-arrow');

// Toggle sidebar
menuToggleBtn.addEventListener('click', () => {
  app.classList.toggle('sidebar-hidden');
  // Invalidate map size after transition completes
  setTimeout(() => {
    map.invalidateSize();
  }, 300);
});

// Toggle Pokemon filter section
pokemonHeader.addEventListener('click', () => {
  pokemonContent.classList.toggle('hidden');
  pokemonHeader.classList.toggle('collapsed');
  pokemonArrow.textContent = pokemonContent.classList.contains('hidden') ? '▶' : '▼';
});

// Toggle Location filter section
locationHeader.addEventListener('click', () => {
  locationContent.classList.toggle('hidden');
  locationHeader.classList.toggle('collapsed');
  locationArrow.textContent = locationContent.classList.contains('hidden') ? '▶' : '▼';
});

// Populate Pokemon filter with all Gen 1 Pokemon (1-151)

// Function to convert Pokemon name to sprite filename
function getSpritePath(name) {
  // Handle both display names (e.g., "Nidoran♀") and CSV names (e.g., "nidoran-f")
  const normalized = name.toLowerCase()
    .replace('♀', '-f')
    .replace('♂', '-m')
    .replace(/\s+/g, '-')
    .replace(/'/g, '')
    .replace(/\./g, '');
  return 'assets/sprites/' + normalized + '.png';
}

// Helper to format name for display
function formatPokemonName(name) {
  if (!name) return '';
  if (name === 'nidoran-f') return 'Nidoran♀';
  if (name === 'nidoran-m') return 'Nidoran♂';
  if (name === 'mr-mime') return 'Mr. Mime';
  if (name === 'farfetchd') return "Farfetch'd";
  // Capitalize first letter of each word
  return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

getGen1Pokemon().forEach(pokemon => {
  const item = document.createElement('div');
  item.className = 'filter-item';
  const spritePath = getSpritePath(pokemon.name);
  item.innerHTML = `
    <img src="${spritePath}" alt="${pokemon.name}">
    <div class="filter-item-name">#${pokemon.id} ${pokemon.name}</div>
  `;
  item.addEventListener('click', () => {
    item.classList.toggle('selected');
    // TODO: Apply filter logic here
  });
  pokemonContent.appendChild(item);
});

// Populate Location filter with hierarchy
// Group areas by main label
const mainAreas = getLocationAreas().filter(area => area.isMainLabel);
const regularAreas = getLocationAreas().filter(area => !area.isMainLabel && area.label);

// Create a map of main areas to their sub-areas
const areaHierarchy = {};
mainAreas.forEach(mainArea => {
  if (mainArea.subAreaIds) {
    areaHierarchy[mainArea.label] = mainArea.subAreaIds.map(subId => {
      const subArea = getLocationAreas().find(a => a.id === subId);
      return subArea ? { id: subArea.id, name: subArea.label } : null;
    }).filter(Boolean);
  }
});

// Get all locations not in a hierarchy
const subAreaIds = new Set(mainAreas.flatMap(m => m.subAreaIds || []));
const standaloneAreas = regularAreas
  .filter(area => !subAreaIds.has(area.id))
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
        const areaRect = allAreas[subArea.id];
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
      const areaRect = allAreas[location.id];
      if (areaRect) {
        areaRect.fire('click');
      }
    });
    locationContent.appendChild(item);
  }
});

// Optional: Add grid overlay for debugging coordinates
// Uncomment to see grid lines
/*
for (let x = 0; x <= IMAGE_WIDTH; x += 100) {
  L.polyline([[0, x], [IMAGE_HEIGHT, x]], {
    color: 'red',
    weight: 1,
    opacity: 0.3
  }).addTo(map);
}
for (let y = 0; y <= IMAGE_HEIGHT; y += 100) {
  L.polyline([[y, 0], [y, IMAGE_WIDTH]], {
    color: 'red',
    weight: 1,
    opacity: 0.3
  }).addTo(map);
}
*/

// ===== POKEMON DETAILS MODAL =====
const modalOverlay = document.getElementById('pokemon-modal-overlay');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalImage = document.getElementById('modal-image');
const modalName = document.getElementById('modal-name');
const modalHeight = document.getElementById('modal-height');
const modalWeight = document.getElementById('modal-weight');
const modalCategory = document.getElementById('modal-category');
const modalAbility = document.getElementById('modal-ability');
const modalLoading = document.getElementById('modal-loading');
const modalContent = document.getElementById('pokemon-modal');

// Close modal
function closeModal() {
  modalOverlay.style.display = 'none';
  document.body.style.overflow = ''; // Restore scrolling
}

modalCloseBtn.addEventListener('click', closeModal);

// Close on clicking outside modal content
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.style.display === 'flex') {
    closeModal();
  }
});

// Show modal and fetch data
async function showPokemonModal(pokemonName) {
  // Show overlay
  modalOverlay.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // Prevent background scrolling

  // Show loading state for stats, but show image immediately
  modalLoading.style.display = 'block';

  // Set Image immediately using local sprite
  const spritePath = getSpritePath(pokemonName);
  modalImage.src = spritePath;
  modalImage.style.opacity = '1';

  modalName.textContent = formatPokemonName(pokemonName); // Show name immediately too
  modalHeight.textContent = '-';
  modalWeight.textContent = '-';
  modalCategory.textContent = '-';
  modalAbility.textContent = '-';

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
    modalHeight.textContent = `${feet}' ${inches.toString().padStart(2, '0')}"`;

    // Update Weight (hg -> lbs)
    // 1 hg = 0.220462 lbs
    const weightInLbs = (data.weight * 0.220462).toFixed(1);
    modalWeight.textContent = `${weightInLbs} lbs`;

    // Update Ability (use first ability)
    const abilityName = data.abilities[0].ability.name.replace('-', ' ');
    modalAbility.textContent = abilityName.charAt(0).toUpperCase() + abilityName.slice(1);

    // Fetch Species data for Category
    const speciesResponse = await fetch(data.species.url);
    if (speciesResponse.ok) {
      const speciesData = await speciesResponse.json();
      // Find genus in English
      const genusEntry = speciesData.genera.find(g => g.language.name === 'en');
      if (genusEntry) {
        const category = genusEntry.genus.replace(' Pokémon', '');
        modalCategory.textContent = category;
      }
    }

  } catch (error) {
    console.error('Error fetching Pokemon data:', error);
    modalName.textContent = formatName(pokemonName); // Show name at least
    modalImage.src = getSpritePath(pokemonName); // Fallback to pixel sprite
    modalImage.style.opacity = '1';
  } finally {
    modalLoading.style.display = 'none';
  }
}

