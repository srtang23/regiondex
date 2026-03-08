// utils.js - Utility functions

// Create App namespace if it doesn't exist
window.App = window.App || {};

// Function to convert Pokemon name to sprite filename
App.getSpritePath = function(name) {
  // Handle both display names (e.g., "Nidoran♀") and CSV names (e.g., "nidoran-f")
  const normalized = name.toLowerCase()
    .replace('♀', '-f')
    .replace('♂', '-m')
    .replace(/\s+/g, '-')
    .replace(/'/g, '')
    .replace(/\./g, '');
  return './src/assets/sprites/' + normalized + '.png';
};

// Helper to format name for display
App.formatPokemonName = function(name) {
  if (!name) return '';
  if (name === 'nidoran-f') return 'Nidoran♀';
  if (name === 'nidoran-m') return 'Nidoran♂';
  if (name === 'mr-mime') return 'Mr. Mime';
  if (name === 'farfetchd') return "Farfetch'd";
  // Capitalize first letter of each word
  return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};
