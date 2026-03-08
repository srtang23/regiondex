// data-helpers.js - Helper functions to access data from data.js

// Create App namespace if it doesn't exist
window.App = window.App || {};

// Helper functions to access data from data.js (attached to window)
// Using functions ensures we always get the latest value from window
App.getEncounterData = function() {
  return window.encounterData || {};
};

App.getLocationAreas = function() {
  return window.locationAreas || [];
};

App.getGen1Pokemon = function() {
  return window.gen1Pokemon || [];
};
