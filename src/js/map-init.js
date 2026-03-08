// map-init.js - Map initialization

// Create App namespace if it doesn't exist
window.App = window.App || {};

// Initialize the Leaflet map
App.map = L.map("map", {
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
}).addTo(App.map);

// Your Kanto map image with optimized rendering
L.imageOverlay("./src/assets/images/full_kanto_map.png", App.bounds, {
  opacity: 1,
  className: 'high-quality-map',
}).addTo(App.map);

// Fit the entire image in the viewport
App.map.fitBounds(App.bounds, {
  padding: [0, 0],  // No padding
  maxZoom: 1  // Don't zoom in too much initially
});
