# RegionDex - Pokémon Encounter Map

An interactive map showing Pokémon encounter locations from Generation 1 (Red version).

## Quick Start

### Prerequisites

You'll need the high-resolution map image:
- **full_kanto_map.png**  - Not included in the repository due to file size
- Place it in the root directory of this project

### Running locally

Start a local server:
```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Features

- **Interactive Map**: Click on location areas to see Pokémon encounters
- **Pokémon Filter**: Select a Pokémon to highlight all locations where it can be found
- **Location Filter**: Browse locations by area
- **Encounter Visualization**: See encounter density through multiple sprite copies
- **Pokémon Details**: Click on any Pokémon sprite to view details and level ranges

## Usage

1. Open the website in a browser (via localhost server)
2. Use the sidebar to filter by Pokémon or browse locations
3. Click on location areas to see Pokémon encounters
4. Click on any Pokémon sprite to view details and level ranges

## Updating Coordinates

If you need to adjust location coordinates:

1. Open `coordinate_helper.html` in a browser
2. Click on the map to get coordinates


## Processing CSV Data

To extract encounter data by generation:
```bash
node generation_encounters.js
```
