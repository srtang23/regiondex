// app.js - Main entry point

// Initialize application after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Load encounter data, then create location areas
  App.loadEncounterData().then(() => {
    // Create all location areas
    App.getLocationAreas().forEach(area => App.createLocationArea(area));

    // Initialize filters (they will populate themselves after data loads)
    // Filters are initialized in filters.js which runs immediately
  });
});
