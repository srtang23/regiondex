// state.js - Shared application state

// Create App namespace if it doesn't exist
window.App = window.App || {};

// Encounter data
App.encountersByLocation = {};
App.pokemonEncountersByLocation = {}; // Map: pokemonId -> Set of locationIds where it appears

// Pokemon display
App.pokemonMarkers = {}; // Store markers by location ID

// Selection state
App.selectedLocationId = null; // Track currently selected location area
App.selectedPokemonIds = new Set(); // Track selected Pokemon for filtering

// Location areas
App.currentlySelectedArea = null;
App.groupedAreas = {}; // Track areas by group
App.allAreas = {}; // Track all rectangles by ID
App.allLabels = {}; // Track all labels by ID
