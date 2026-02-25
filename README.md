# Regiondex - Pokémon Encounter Map

An interactive map showing Pokémon encounter locations from Generation 1 (Red version).

## Quick Start

To run index.html on localhost, run terminal:
```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Features

- **Interactive Map**: Click on location markers to see detailed encounter information
- **Pokémon Filter**: Select a specific Pokémon to see all locations where it can be found
- **Color-Coded Locations**: Different location types are color-coded for easy identification:
  - 🟢 Green: Routes
  - 🟤 Brown: Caves/Tunnels
  - 🟣 Purple: Towers
  - 🟠 Orange: Safari Zone
  - 🔵 Blue: Water Areas
  - 🌲 Dark Green: Forests
  - 🔴 Red: Buildings (Mansion, Power Plant)
  - 🟡 Yellow: Victory Road

## Files

- `index.html` - Main application
- `data.js` - Generated encounter data from CSV
- `gen1_red_walk_tidy.csv` - Source data for Gen 1 encounters
- `map.png` - Kanto region map
- `process_csv_to_grid.js` - Script to process CSV and generate data.js
- `coordinate_helper.html` - Helper tool to find coordinates on the map
- `generation_encounters.js` - Extract encounter data by generation

## Usage

1. Open `index.html` in a web browser (via localhost server)
2. Use the dropdown to filter by Pokémon or view all locations
3. Click on markers to see encounter details
4. Zoom and pan the map to explore different areas

## Updating Coordinates

If you need to adjust location coordinates:

1. Open `coordinate_helper.html` in a browser
2. Click on the map to get coordinates
3. Update the `locationCoordinates` object in `process_csv_to_grid.js`
4. Run `node process_csv_to_grid.js` to regenerate `data.js`

## Processing CSV Data

To extract encounter data by generation:
```bash
node generation_encounters.js
```

To process the Gen 1 CSV and map locations to the grid:
```bash
node process_csv_to_grid.js
```

## Data Source

The encounter data is sourced from `gen1_red_walk_tidy.csv`, which contains:
- Pokémon species
- Location areas
- Encounter rates
- Level ranges
- Additional metadata

## Grid System

The map uses a 1000x1000 pixel coordinate system with Leaflet's CRS.Simple projection. Coordinates are stored as `[x, y]` pairs and converted to Leaflet's `[lat, lng]` format internally.
