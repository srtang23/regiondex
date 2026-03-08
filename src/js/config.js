// config.js - Constants and configuration

// Create App namespace if it doesn't exist
window.App = window.App || {};

// Image dimensions
App.IMAGE_WIDTH = 7700;
App.IMAGE_HEIGHT = 6400;

// Leaflet uses [y, x] for "LatLng"-like pairs in CRS.Simple.
// We'll store data as [x, y], then convert with toLatLng().
App.toLatLng = ([x, y]) => [y, x];

// Map bounds
App.bounds = [
  [0, 0],
  [App.IMAGE_HEIGHT, App.IMAGE_WIDTH],
];
