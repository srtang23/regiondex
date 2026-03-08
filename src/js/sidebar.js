// sidebar.js - Sidebar menu functionality

// Create App namespace if it doesn't exist
window.App = window.App || {};

// Initialize sidebar elements
App.app = document.getElementById('app');
App.sidebar = document.getElementById('sidebar');
App.menuToggleBtn = document.getElementById('menu-toggle-btn');
App.pokemonHeader = document.getElementById('pokemon-header');
App.pokemonContent = document.getElementById('pokemon-content');
App.pokemonArrow = document.getElementById('pokemon-arrow');
App.locationHeader = document.getElementById('location-header');
App.locationContent = document.getElementById('location-content');
App.locationArrow = document.getElementById('location-arrow');

// Toggle sidebar
App.menuToggleBtn.addEventListener('click', () => {
  App.app.classList.toggle('sidebar-hidden');
  // Invalidate map size after transition completes
  setTimeout(() => {
    App.map.invalidateSize();
  }, 300);
});

// Toggle Pokemon filter section
App.pokemonHeader.addEventListener('click', () => {
  App.pokemonContent.classList.toggle('hidden');
  App.pokemonHeader.classList.toggle('collapsed');
  App.pokemonArrow.textContent = App.pokemonContent.classList.contains('hidden') ? '▶' : '▼';
});

// Toggle Location filter section
App.locationHeader.addEventListener('click', () => {
  App.locationContent.classList.toggle('hidden');
  App.locationHeader.classList.toggle('collapsed');
  App.locationArrow.textContent = App.locationContent.classList.contains('hidden') ? '▶' : '▼';
});
