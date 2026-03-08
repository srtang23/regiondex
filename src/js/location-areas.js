// location-areas.js - Location area creation and management

// Create App namespace if it doesn't exist
window.App = window.App || {};

// Function to create interactive location areas
App.createLocationArea = function(config) {
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
    }).addTo(App.map);

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
    }).addTo(App.map);

    // Function to update main label size dynamically
    function updateMainLabelSize() {
      const zoom = App.map.getZoom();
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
    App.map.on('zoom', updateMainLabelSize);
    App.map.on('zoomend', updateMainLabelSize);
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
        if (App.currentlySelectedArea) {
          App.currentlySelectedArea.deselect();
        }

        // Select: show main polygon border
        isSelected = true;
        App.currentlySelectedArea = mainPolygon;

        mainPolygon.setStyle({
          fillOpacity: 0,
          weight: borderWeight
        });

        // Update label color
        const labelElement = mainLabel.getElement()?.querySelector('div');
        if (labelElement) {
          labelElement.style.color = '#FFBD1D';
        }

        // Track selected location
        App.selectedLocationId = id;

        // Display Pokemon for all sub-areas
        if (subAreaIds && subAreaIds.length > 0) {
          subAreaIds.forEach(subAreaId => {
            const subArea = App.getLocationAreas().find(a => a.id === subAreaId);
            if (subArea && subArea.bounds) {
              App.displayPokemonInArea(subAreaId, subArea.bounds);
            }
          });
        }

        // Zoom to main area
        App.map.flyToBounds(leafletMainBounds, {
          padding: [50, 50],
          maxZoom: zoomLevel,
          duration: 1
        });
      } else {
        // Deselect: hide main polygon
        isSelected = false;
        App.currentlySelectedArea = null;

        mainPolygon.setStyle({
          fillOpacity: 0,
          weight: 0
        });

        // Clear selected location
        App.selectedLocationId = null;

        // Hide Pokemon for all sub-areas
        if (subAreaIds && subAreaIds.length > 0) {
          subAreaIds.forEach(subAreaId => {
            App.hidePokemonInArea(subAreaId);
          });
        }

        // Update label color
        const labelElement = mainLabel.getElement()?.querySelector('div');
        if (labelElement) {
          labelElement.style.color = '#000000';
        }

        // Zoom out to full App.map
        App.map.flyToBounds([[0, 0], [App.IMAGE_HEIGHT, App.IMAGE_WIDTH]], {
          padding: [0, 0],
          maxZoom: 1,
          duration: 1
        });
      }
    });

    // Add deselect method to main polygon
    mainPolygon.deselect = function() {
      isSelected = false;

      // Check if any sub-area should be highlighted due to Pokemon filter
      let shouldHighlight = false;
      if (subAreaIds && subAreaIds.length > 0 && App.selectedPokemonIds.size > 0) {
        shouldHighlight = subAreaIds.some(subAreaId =>
          Array.from(App.selectedPokemonIds).some(pokemonId => {
            const locations = App.pokemonEncountersByLocation[pokemonId];
            return locations && locations.has(subAreaId);
          })
        );
      }

      if (shouldHighlight) {
        this.setStyle({
          fillColor: '#E07451',
          fillOpacity: 0.6, // Increased opacity for more visibility
          weight: 3, // Increased border weight
          color: '#E07451'
        });
      } else {
        this.setStyle({
          fillOpacity: 0,
          weight: 0
        });
      }

      const labelElement = mainLabel.getElement()?.querySelector('div');
      if (labelElement) {
        labelElement.style.color = '#000000';
      }

      // Hide Pokemon for all sub-areas
      if (subAreaIds && subAreaIds.length > 0) {
        subAreaIds.forEach(subAreaId => {
          App.hidePokemonInArea(subAreaId);
        });
      }

      App.updateLocationHighlights(); // Update highlights after deselection
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
  }).addTo(App.map);

  // Show highlight on hover (use original colors, not Pokemon filter colors)
  rectangle.on('mouseover', function() {
    // Use original colors for hover, regardless of Pokemon filter state
    this.setStyle({
      fillColor: fillColor, // Original fill color (gold)
      fillOpacity: 0.3,
      weight: borderWeight,
      color: borderColor // Original border color (gold)
    });
    updateLabelStyle(true, isSelected);
  });

  // Hide highlight when not hovering
  rectangle.on('mouseout', function() {
    if (isSelected) {
      // If selected, show only border (no fill) with gold color
      this.setStyle({
        fillOpacity: 0,
        weight: borderWeight,
        color: borderColor // Gold border for selection
      });
      updateLabelStyle(false, true);
    } else {
      // Check if this area should be highlighted due to Pokemon filter
      const shouldHighlight = App.selectedPokemonIds.size > 0 &&
        Array.from(App.selectedPokemonIds).some(pokemonId => {
          const locations = App.pokemonEncountersByLocation[pokemonId];
          return locations && locations.has(id);
        });

      if (shouldHighlight) {
        // Maintain Pokemon filter highlight (more prominent)
        this.setStyle({
          fillColor: '#E07451',
          fillOpacity: 0.6, // Increased opacity for more visibility
          weight: 3, // Increased border weight
          color: '#E07451'
        });
      } else {
        // If not selected and not highlighted, hide everything
        this.setStyle({
          fillOpacity: 0,
          weight: 0
        });
      }
      updateLabelStyle(false, false);
    }
  });

  // Toggle selection on click
  rectangle.on('click', function() {
    if (!isSelected) {
      // Deselect previously selected area if any
      if (App.currentlySelectedArea && App.currentlySelectedArea !== rectangle) {
        App.currentlySelectedArea.deselect();
      }

      // Select: show only border, zoom in
      isSelected = true;
      App.currentlySelectedArea = rectangle;

      // Update sidebar item to show selected state
      const sidebarItem = document.querySelector(`[data-area-id="${id}"]`);
      if (sidebarItem) {
        sidebarItem.classList.add('selected');
      }

      // If part of a group, select all areas in the group
      if (group && App.groupedAreas[group]) {
        App.groupedAreas[group].forEach(rect => {
          rect.setStyle({
            fillOpacity: 0,
            weight: borderWeight,
            color: borderColor // Gold border for selection
          });
        });
      } else {
        this.setStyle({
          fillOpacity: 0,
          weight: borderWeight,
          color: borderColor // Gold border for selection
        });
      }

      updateLabelStyle(false, true);

      // Track selected location
      App.selectedLocationId = id;

      // Display Pokemon for this area
      App.displayPokemonInArea(id, bounds);

      App.map.flyToBounds(leafletBounds, {
        padding: [50, 50],
        maxZoom: zoomLevel,
        duration: 1
      });
    } else {
      // Deselect: hide everything, zoom out to full App.map
      isSelected = false;
      App.currentlySelectedArea = null;

      // Clear selected location
      App.selectedLocationId = null;

      // Hide Pokemon for this area
      App.hidePokemonInArea(id);

      // If part of a group, deselect all areas in the group
      if (group && App.groupedAreas[group]) {
        App.groupedAreas[group].forEach(rect => {
          // Check if area should be highlighted due to Pokemon filter
          const rectId = Object.keys(App.allAreas).find(key => App.allAreas[key] === rect);
          const shouldHighlight = rectId && App.selectedPokemonIds.size > 0 &&
            Array.from(App.selectedPokemonIds).some(pokemonId => {
              const locations = App.pokemonEncountersByLocation[pokemonId];
              return locations && locations.has(rectId);
            });

          if (shouldHighlight) {
            rect.setStyle({
              fillColor: '#E07451',
              fillOpacity: 0.6, // Increased opacity for more visibility
              weight: 3, // Increased border weight
              color: '#E07451'
            });
          } else {
            rect.setStyle({
              fillOpacity: 0,
              weight: 0
            });
          }
        });
      } else {
        // Check if area should be highlighted due to Pokemon filter
        const shouldHighlight = App.selectedPokemonIds.size > 0 &&
          Array.from(App.selectedPokemonIds).some(pokemonId => {
            const locations = App.pokemonEncountersByLocation[pokemonId];
            return locations && locations.has(id);
          });

        if (shouldHighlight) {
          this.setStyle({
            fillColor: '#E07451',
            fillOpacity: 0.6, // Increased opacity for more visibility
            weight: 3, // Increased border weight
            color: '#E07451'
          });
        } else {
          this.setStyle({
            fillOpacity: 0,
            weight: 0
          });
        }
      }

      updateLabelStyle(false, false);
      App.updateLocationHighlights(); // Update highlights after deselection

      // Update sidebar item to remove selected state
      const sidebarItem = document.querySelector(`[data-area-id="${id}"]`);
      if (sidebarItem) {
        sidebarItem.classList.remove('selected');
      }

      App.map.flyToBounds([[0, 0], [App.IMAGE_HEIGHT, App.IMAGE_WIDTH]], {
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
  const initialAnchor = calculateAnchor(App.map.getZoom());

  // Create marker with calculated initial anchor
  const areaLabel = L.marker([labelLat, labelLng], {
    icon: L.divIcon({
      className: 'area-label',
      html: labelDiv.outerHTML,
      iconSize: [300, 60],
      iconAnchor: initialAnchor
    })
  }).addTo(App.map);

  // Function to update label font size and anchor based on zoom
  function updateLabelSize() {
    const zoom = App.map.getZoom();
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
  App.map.on('zoom', updateLabelSize);
  App.map.on('zoomend', updateLabelSize);

  // Set initial size after a short delay to ensure element is rendered
  setTimeout(updateLabelSize, 100);

  // Add deselect method to rectangle
  rectangle.deselect = function() {
    isSelected = false;

    // Check if area should be highlighted due to Pokemon filter
    const shouldHighlight = App.selectedPokemonIds.size > 0 &&
      Array.from(App.selectedPokemonIds).some(pokemonId => {
        const locations = App.pokemonEncountersByLocation[pokemonId];
        return locations && locations.has(id);
      });

    if (shouldHighlight) {
      this.setStyle({
        fillColor: '#E07451',
        fillOpacity: 0.6, // Increased opacity for more visibility
        weight: 3, // Increased border weight
        color: '#E07451'
      });
    } else {
      this.setStyle({
        fillOpacity: 0,
        weight: 0
      });
    }

    updateLabelStyle(false, false);
    App.updateLocationHighlights(); // Update highlights after deselection

    // Hide Pokemon for this area
    App.hidePokemonInArea(id);

    // Update sidebar item to remove selected state
    const sidebarItem = document.querySelector(`[data-area-id="${id}"]`);
    if (sidebarItem) {
      sidebarItem.classList.remove('selected');
    }
  };

  // Track this area in its group if it has one
  if (group) {
    if (!App.groupedAreas[group]) {
      App.groupedAreas[group] = [];
    }
    App.groupedAreas[group].push(rectangle);
  }

  // Track this area by ID
  App.allAreas[id] = rectangle;
  App.allLabels[id] = areaLabel;

  return { rectangle, label: areaLabel };
};

// Updates location area highlights based on selected Pokemon
App.updateLocationHighlights = function() {
  // Get all location IDs that have encounters for selected Pokemon
  const highlightedLocations = new Set();

  if (App.selectedPokemonIds.size > 0) {
    App.selectedPokemonIds.forEach(pokemonId => {
      const locations = App.pokemonEncountersByLocation[pokemonId];
      if (locations) {
        locations.forEach(locationId => highlightedLocations.add(locationId));
      }
    });
  }

  // Update all location areas
  Object.keys(App.allAreas).forEach(locationId => {
    const area = App.allAreas[locationId];
    if (!area) return;

    const shouldHighlight = highlightedLocations.has(locationId);
    const isSelected = App.currentlySelectedArea === area;

    if (shouldHighlight && !isSelected) {
      // Highlight with red color for Pokemon filter (more prominent)
      area.setStyle({
        fillColor: '#E07451', // Red highlight for Pokemon filter
        fillOpacity: 0.6, // Increased opacity for more visibility
        weight: 3, // Increased border weight
        color: '#E07451'
      });
    } else if (!shouldHighlight && !isSelected) {
      // Reset to default (hidden)
      area.setStyle({
        fillOpacity: 0,
        weight: 0
      });
    } else if (isSelected) {
      // Maintain selection style (gold border, no fill)
      area.setStyle({
        fillOpacity: 0,
        weight: 4,
        color: '#FFBD1D'
      });
    }
  });
};
