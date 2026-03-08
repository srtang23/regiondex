// data.js

// Pokemon encounter data by location (temporary fallback)
window.encounterData = {
  "kanto-route-1-area": [
    { id: 16, name: "pidgey" },
    { id: 19, name: "rattata" }
  ],
  "kanto-route-10-area": [
    { id: 23, name: "ekans" },
    { id: 21, name: "spearow" },
    { id: 100, name: "voltorb" }
  ],
  "kanto-route-11-area": [
    { id: 96, name: "drowzee" },
    { id: 23, name: "ekans" },
    { id: 21, name: "spearow" }
  ],
  "kanto-route-12-area": [
    { id: 16, name: "pidgey" },
    { id: 48, name: "venonat" },
    { id: 43, name: "oddish" }
  ],
  "kanto-route-13-area": [
    { id: 16, name: "pidgey" },
    { id: 48, name: "venonat" },
    { id: 43, name: "oddish" },
    { id: 132, name: "ditto" }
  ],
  "kanto-route-14-area": [
    { id: 16, name: "pidgey" },
    { id: 48, name: "venonat" },
    { id: 43, name: "oddish" },
    { id: 132, name: "ditto" }
  ],
  "kanto-route-15-area": [
    { id: 16, name: "pidgey" },
    { id: 43, name: "oddish" },
    { id: 48, name: "venonat" },
    { id: 132, name: "ditto" }
  ],
  "kanto-route-16-area": [
    { id: 21, name: "spearow" },
    { id: 19, name: "rattata" },
    { id: 20, name: "raticate" },
    { id: 84, name: "doduo" }
  ],
  "kanto-route-17-area": [
    { id: 21, name: "spearow" },
    { id: 19, name: "rattata" },
    { id: 20, name: "raticate" },
    { id: 84, name: "doduo" },
    { id: 22, name: "fearow" }
  ],
  "kanto-route-18-area": [
    { id: 21, name: "spearow" },
    { id: 19, name: "rattata" },
    { id: 20, name: "raticate" },
    { id: 22, name: "fearow" }
  ],
  "kanto-route-2-south-towards-viridian-city": [
    { id: 16, name: "pidgey" },
    { id: 19, name: "rattata" }
  ],
  "kanto-route-22-area": [
    { id: 19, name: "rattata" },
    { id: 21, name: "spearow" },
    { id: 56, name: "mankey" }
  ],
  "kanto-route-23-area": [
    { id: 21, name: "spearow" },
    { id: 22, name: "fearow" },
    { id: 24, name: "arbok" },
    { id: 57, name: "primeape" },
    { id: 132, name: "ditto" }
  ],
  "kanto-route-24-area": [
    { id: 43, name: "oddish" },
    { id: 69, name: "bellsprout" },
    { id: 63, name: "abra" }
  ],
  "kanto-route-25-area": [
    { id: 43, name: "oddish" },
    { id: 69, name: "bellsprout" },
    { id: 63, name: "abra" }
  ],
  "kanto-route-3-area": [
    { id: 21, name: "spearow" },
    { id: 16, name: "pidgey" },
    { id: 39, name: "jigglypuff" }
  ],
  "kanto-route-4-area": [
    { id: 21, name: "spearow" },
    { id: 16, name: "pidgey" },
    { id: 23, name: "ekans" }
  ],
  "kanto-route-5-area": [
    { id: 16, name: "pidgey" },
    { id: 52, name: "meowth" },
    { id: 56, name: "mankey" }
  ],
  "kanto-route-6-area": [
    { id: 16, name: "pidgey" },
    { id: 52, name: "meowth" },
    { id: 56, name: "mankey" }
  ],
  "kanto-route-7-area": [
    { id: 16, name: "pidgey" },
    { id: 52, name: "meowth" },
    { id: 58, name: "growlithe" }
  ],
  "kanto-route-8-area": [
    { id: 16, name: "pidgey" },
    { id: 52, name: "meowth" },
    { id: 58, name: "growlithe" }
  ],
  "kanto-route-9-area": [
    { id: 21, name: "spearow" },
    { id: 19, name: "rattata" },
    { id: 27, name: "sandshrew" }
  ],
  "kanto-sea-route-21-area": [
    { id: 72, name: "tentacool" },
    { id: 116, name: "horsea" }
  ],
  "viridian-forest-area": [
    { id: 10, name: "caterpie" },
    { id: 13, name: "weedle" },
    { id: 16, name: "pidgey" },
    { id: 25, name: "pikachu" }
  ],
  "power-plant-area": [
    { id: 25, name: "pikachu" },
    { id: 81, name: "magnemite" },
    { id: 100, name: "voltorb" }
  ]
};

// Define location areas
window.locationAreas = [
  {
    id: 'kanto-route-1-area',
    bounds: [[960, 2240], [1340, 2880]],  // [X, Y] format
    label: 'Route 1',
    labelPosition: 'right',
    zoomLevel: 3
  },
  {
    id: 'kanto-route-10-area',
    bounds: [[6145, 4325], [6525, 5600]],
    label: 'Route 10',
    labelPosition: 'right',
    labelOffsetY: 300,
    zoomLevel: 3
  },
  {
    id: 'kanto-route-11-area',
    bounds: [[4990, 2720], [6145, 3040]],
    label: 'Route 11',
    labelPosition: 'top',
    zoomLevel: 3
  },
  {
    id: 'kanto-route-12-area',
    bounds: [[6145, 2080], [6525, 4000]],
    label: 'Route 12',
    labelPosition: 'right',
    zoomLevel: 3
  },
  {
    id: 'kanto-route-13-area',
    bounds: [[5375, 1760], [6525, 2080]],
    label: 'Route 13',
    labelPosition: 'right',
    zoomLevel: 3
  },
  {
    id: 'kanto-route-14-area',
    bounds: [[4990, 1120], [5375, 2080]],
    label: 'Route 14',
    labelPosition: 'right',
    zoomLevel: 3
  },
  {
    id: 'kanto-route-15-area',
    bounds: [[3840, 1120], [4990, 1440]],
    label: 'Route 15',
    labelPosition: 'bottom',
    zoomLevel: 3
  },
  {
    id: 'kanto-route-16-area',
    bounds: [[2115, 4000], [2880, 4320]],
    label: 'Route 16',
    labelPosition: 'top',
    zoomLevel: 3
  },
  {
    id: 'kanto-route-17-area',
    bounds: [[2115, 1440], [2495, 4000]],
    label: 'Route 17',
    labelPosition: 'right',
    zoomLevel: 3
  },
  {
    id: 'kanto-route-18-area',
    bounds: [[2115, 1120], [3070, 1440]],
    label: 'Route 18',
    labelPosition: 'bottom',
    zoomLevel: 3
  },
  {
    id: 'kanto-route-2-south-towards-viridian-city',
    bounds: [[960, 3520], [1340, 4800]],
    label: 'Route 2',
    labelPosition: 'right',
    zoomLevel: 3
  },
  {
    id: 'kanto-route-22-area',
    bounds: [[0, 2980], [770, 3360]],
    label: 'Route 22',
    labelPosition: 'left',
    zoomLevel: 3
  },
  {
    id: 'kanto-route-23-area',
    bounds: [[0, 3360], [380, 6240]],
    label: 'Route 23',
    labelPosition: 'left',
    zoomLevel: 3
  },
  {
    id: 'kanto-route-24-area',
    bounds: [[4420, 5760], [4800, 6400]],
    label: 'Route 24',
    labelPosition: 'top',
    zoomLevel: 3
  },
  {
    id: 'kanto-route-25-area',
    bounds: [[4800, 6080], [5950, 6400]],
    label: 'Route 25',
    labelPosition: 'bottom',
    zoomLevel: 3
  },
  {
    id: 'kanto-route-5-area',
    bounds: [[4220, 4480], [5000, 5280]],
    label: 'Route 5',
    labelPosition: 'left',
    zoomLevel: 3
  },
  {
    id: 'kanto-route-6-area',
    bounds: [[4420, 3200], [4800, 3840]],
    label: 'Route 6',
    labelPosition: 'right',
    zoomLevel: 3
  },
  {
    id: 'kanto-route-7-area',
    bounds: [[3840, 4000], [4220, 4320]],
    label: 'Route 7',
    labelPosition: 'top',
    zoomLevel: 3
  },
  {
    id: 'kanto-route-8-area',
    bounds: [[4930, 4000], [6140, 4320]],
    label: 'Route 8',
    labelPosition: 'top',
    zoomLevel: 3
  },
  {
    id: 'kanto-route-9-area',
    bounds: [[5000, 5280], [6140, 5600]],
    label: 'Route 9',
    labelPosition: 'top',
    zoomLevel: 3
  },
  // Safari Zone - East
  {
    id: 'kanto-safari-zone-area-1-east',
    bounds: [[6730, 540], [7600, 1100]],
    label: 'East',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Safari Zone - North
  {
    id: 'kanto-safari-zone-area-2-north',
    bounds: [[5810, 900], [6720, 1540]],
    label: 'North',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Safari Zone - West
  {
    id: 'kanto-safari-zone-area-3-west',
    bounds: [[5040, 490], [5800, 1070]],
    label: 'West',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Safari Zone - Center
  {
    id: 'kanto-safari-zone-center',
    bounds: [[5860, 300], [6680, 880]],
    label: 'Center',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Safari Zone - Main Label (clickable, selects all safari zone areas)
  {
    id: 'safari-zone-main-label',
    bounds: [[5860, 300], [6680, 880]], // Use Center bounds for positioning
    label: 'Safari Zone',
    labelPosition: 'bottom',
    labelOffsetY: -100,
    isMainLabel: true,
    mainAreaPolygon: [
      // TODO: Fill in irregular polygon coordinates
      // Format: [[x1, y1], [x2, y2], ...]
      [5030, 1080], // West top left
      [5790, 1080], // West top right
      [5790, 1550], // North top left
      [6740, 1550], // North top right
      [6740, 1110], // East top left
      [7610, 1110], // East top right
      [7610, 530], // East bottom right
      [6730, 530], // East bottom left
      [6730, 290], // Center bottom right
      [5800, 290], // Center bottom left
      [5800, 480], // West bottom right
      [5030, 480] // West bottom left
    ],
    subAreaIds: ['kanto-safari-zone-area-1-east', 'kanto-safari-zone-area-2-north', 'kanto-safari-zone-area-3-west', 'kanto-safari-zone-center'],
    zoomLevel: 3
  },
  // Route 4
  {
    id: 'kanto-route-4-area',
    bounds: [[3150, 5280], [4050, 5600]],
    label: 'Route 4',
    labelPosition: 'bottom',
    zoomLevel: 3
  },
  // Viridian Forest
  {
    id: 'viridian-forest-area',
    bounds: [[80, 1770], [940, 2860]],
    label: 'Viridian Forest',
    labelPosition: 'left',
    zoomLevel: 3
  },
  // Route 21
  {
    id: 'kanto-sea-route-21-area',
    bounds: [[960, 420], [1340, 1680]],
    label: 'Route 21',
    labelPosition: 'left',
    zoomLevel: 3
  },
  // Power Plant
  {
    id: 'power-plant-area',
    bounds: [[5330, 4525], [6095, 5145]],
    label: 'Power Plant',
    labelPosition: 'top',
    zoomLevel: 3
  },
  // Victory Road - 1F
  {
    id: 'kanto-victory-road-2-1f',
    bounds: [[390, 5655], [790, 6005]],
    label: '1F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Victory Road - 2F
  {
    id: 'kanto-victory-road-2-2f',
    bounds: [[790, 5855], [1605, 6205]],
    label: '2F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Victory Road - 3F
  {
    id: 'kanto-victory-road-2-3f',
    bounds: [[790, 5490], [1510, 5855]],
    label: '3F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Victory Road - Main Label (clickable, selects all victory road areas)
  {
    id: 'victory-road-main-label',
    bounds: [[790, 5855], [1605, 6205]], // Use 2F bounds for positioning
    label: 'Victory Road',
    labelPosition: 'top',
    labelOffsetY: 100,
    isMainLabel: true,
    mainAreaPolygon: [
      // TODO: Fill in irregular polygon coordinates
      // Format: [[x1, y1], [x2, y2], ...]
      [380, 6015], // 1F top left
      [780, 6015], // 1F top right
      [780, 6215], // 2F top left
      [1615, 6215], // 2F top right
      [1615, 5845], // 2F bottom right
      [1520, 5845], // 3F top right
      [1520, 5480], // 3F bottom right
      [780, 5480], // 3F bottom left
      [780, 5645], // 1F bottom right
      [380, 5645] // 1F bottom left
    ],
    subAreaIds: ['kanto-victory-road-2-1f', 'kanto-victory-road-2-2f', 'kanto-victory-road-2-3f'],
    zoomLevel: 3
  },
  // Seafoam Islands - 1F
  {
    id: 'seafoam-islands-1f',
    bounds: [[3660, 420], [4250, 790]],
    label: '1F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Seafoam Islands - B1F
  {
    id: 'seafoam-islands-b1f',
    bounds: [[4250, 420], [4860, 790]],
    label: 'B1F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Seafoam Islands - B2F
  {
    id: 'seafoam-islands-b2f',
    bounds: [[3660, 20], [4260, 400]],
    label: 'B2F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Seafoam Islands - B3F
  {
    id: 'seafoam-islands-b3f',
    bounds: [[4260, 20], [4860, 400]],
    label: 'B3F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Seafoam Islands - B4F
  {
    id: 'seafoam-islands-b4f',
    bounds: [[4880, 20], [5480, 390]],
    label: 'B4F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Seafoam Islands - Main Label (clickable, selects all seafoam islands areas)
  {
    id: 'seafoam-islands-main-label',
    bounds: [[4260, 20], [4860, 400]], // Use B3F bounds for positioning
    label: 'Seafoam Islands',
    labelPosition: 'bottom',
    labelOffsetY: -100,
    isMainLabel: true,
    mainAreaPolygon: [
      // TODO: Fill in irregular polygon coordinates
      // Format: [[x1, y1], [x2, y2], ...]
      [3650, 800], // 1F top left
      [4870, 800], // B1F top right
      [4870, 400], // B3F top right
      [5490, 400], // B4F top right
      [5490, 10], // B4F bottom right
      [3650, 10], // B2F bottom left
    ],
    subAreaIds: ['seafoam-islands-1f', 'seafoam-islands-b1f', 'seafoam-islands-b2f', 'seafoam-islands-b3f', 'seafoam-islands-b4f'],
    zoomLevel: 3
  },
  // Rock Tunnel - B1F
  {
    id: 'rock-tunnel-b1f',
    bounds: [[6040, 5620], [6800, 6250]],
    label: 'B1F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Rock Tunnel - B2F
  {
    id: 'rock-tunnel-b2f',
    bounds: [[6820, 5620], [7580, 6250]],
    label: 'B2F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Rock Tunnel - Main Label (clickable, selects all rock tunnel areas)
  {
    id: 'rock-tunnel-main-label',
    bounds: [[6420, 5620], [7200, 6250]], // Use B1F bounds for positioning
    label: 'Rock Tunnel',
    labelPosition: 'top',
    labelOffsetY: 100,
    isMainLabel: true,
    mainAreaPolygon: [
      [6040, 5620], // Bottom-Left
      [7580, 5620], // Bottom-Right
      [7580, 6250], // Top-Right
      [6040, 6250]  // Top-Left
    ],
    subAreaIds: ['rock-tunnel-b1f', 'rock-tunnel-b2f'],
    zoomLevel: 3
  },
  // Route 3
  {
    id: 'kanto-route-3-area',
    bounds: [[1540, 4960], [2880, 5280]],
    label: 'Route 3',
    labelPosition: 'top',
    zoomLevel: 3
  },
  // Mt. Moon - 1F
  {
    id: 'mt-moon-1f',
    bounds: [[1710, 5680], [2475, 6310]],
    label: '1F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Mt. Moon - B1F
  {
    id: 'mt-moon-b1f',
    bounds: [[2475, 5850], [3235, 6175]],
    label: 'B1F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Mt. Moon - B2F
  {
    id: 'mt-moon-b2f',
    bounds: [[3235, 5695], [4000, 6335]],
    label: 'B2F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Mt. Moon - Main Label (clickable, selects all mt moon areas)
  {
    id: 'mt-moon-main-label',
    bounds: [[2475, 5850], [3235, 6175]], // Use B1F bounds for positioning
    label: 'Mt. Moon',
    labelPosition: 'top',
    labelOffsetY: 250,
    isMainLabel: true,
    mainAreaPolygon: [
      // TODO: Fill in irregular polygon coordinates
      // Format: [[x1, y1], [x2, y2], ...]
      [1700, 6320],
      [2485, 6320],
      [2485, 6185],
      [3225, 6185],
      [3225, 6345],
      [4010, 6345],
      [4010, 5685],
      [3225, 5685],
      [3225, 5840],
      [2485, 5840],
      [2485, 5670],
      [1700, 5670]
    ],
    subAreaIds: ['mt-moon-1f', 'mt-moon-b1f', 'mt-moon-b2f'],
    zoomLevel: 3
  },
  // Pokemon Mansion - 1F
  {
    id: 'pokemon-mansion-1f',
    bounds: [[1355, 335], [1960, 895]],
    label: '1F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Pokemon Mansion - 2F
  {
    id: 'pokemon-mansion-2f',
    bounds: [[1355, 900], [1960, 1525]],
    label: '2F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Pokemon Mansion - 3F
  {
    id: 'pokemon-mansion-3f',
    bounds: [[1970, 395], [2580, 810]],
    label: '3F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Pokemon Mansion - B1F
  {
    id: 'pokemon-mansion-b1f',
    bounds: [[2590, 335], [3195, 910]],
    label: 'B1F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Pokemon Mansion - Main Label (clickable, selects all pokemon mansion areas)
  {
    id: 'pokemon-mansion-main-label',
    bounds: [[1355, 900], [1960, 1525]], // Use 2F bounds for positioning
    label: 'Pokemon Mansion',
    labelPosition: 'top',
    labelOffsetY: 100,
    isMainLabel: true,
    mainAreaPolygon: [
      [1345, 1535], // 2F top-left (with padding)
      [1970, 1535], // 2F top-right
      [1970, 900],  // 2F/1F connection
      [1970, 820],  // to 3F
      [2580, 820],  // 3F top-right
      [2580, 920],  // to B1F
      [3205, 920],  // B1F top-right
      [3205, 325],  // B1F bottom-right
      [2580, 325],  // B1F bottom-left
      [2580, 385],  // to 3F
      [1970, 385],  // 3F bottom-left
      [1970, 325],  // to 1F
      [1345, 325],  // 1F bottom-left
      [1345, 1535]  // back to start
    ],
    subAreaIds: ['pokemon-mansion-1f', 'pokemon-mansion-2f', 'pokemon-mansion-3f', 'pokemon-mansion-b1f'],
    zoomLevel: 3
  },
  // Pokemon Tower - 2F
  {
    id: 'pokemon-tower-2f',
    bounds: [[6550, 3400], [6855, 3690]],
    label: '2F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Pokemon Tower - 3F
  {
    id: 'pokemon-tower-3f',
    bounds: [[6550, 3690], [6855, 3975]],
    label: '3F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Pokemon Tower - 4F
  {
    id: 'pokemon-tower-4f',
    bounds: [[6550, 3975], [6855, 4265]],
    label: '4F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Pokemon Tower - 5F
  {
    id: 'pokemon-tower-5f',
    bounds: [[6550, 4265], [6855, 4555]],
    label: '5F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Pokemon Tower - 6F
  {
    id: 'pokemon-tower-6f',
    bounds: [[6550, 4555], [6855, 4840]],
    label: '6F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Pokemon Tower - 7F
  {
    id: 'pokemon-tower-7f',
    bounds: [[6550, 4840], [6855, 5130]],
    label: '7F',
    labelPosition: 'center',
    labelFontSize: 12,
    zoomLevel: 3
  },
  // Pokemon Tower - Main Label (clickable, selects all pokemon tower areas)
  {
    id: 'pokemon-tower-main-label',
    bounds: [[6550, 4265], [6855, 4555]], // Use 5F bounds for positioning
    label: 'Pokemon Tower',
    labelPosition: 'right',
    isMainLabel: true,
    mainAreaBounds: [[6550, 3400], [6855, 5130]], // Entire pokemon tower bounds
    subAreaIds: ['pokemon-tower-2f', 'pokemon-tower-3f', 'pokemon-tower-4f', 'pokemon-tower-5f', 'pokemon-tower-6f', 'pokemon-tower-7f'],
    zoomLevel: 3
  }
];

// Populate Pokemon filter with all Gen 1 Pokemon (1-151)
window.gen1Pokemon = [
  { id: 1, name: 'Bulbasaur' }, { id: 2, name: 'Ivysaur' }, { id: 3, name: 'Venusaur' },
  { id: 4, name: 'Charmander' }, { id: 5, name: 'Charmeleon' }, { id: 6, name: 'Charizard' },
  { id: 7, name: 'Squirtle' }, { id: 8, name: 'Wartortle' }, { id: 9, name: 'Blastoise' },
  { id: 10, name: 'Caterpie' }, { id: 11, name: 'Metapod' }, { id: 12, name: 'Butterfree' },
  { id: 13, name: 'Weedle' }, { id: 14, name: 'Kakuna' }, { id: 15, name: 'Beedrill' },
  { id: 16, name: 'Pidgey' }, { id: 17, name: 'Pidgeotto' }, { id: 18, name: 'Pidgeot' },
  { id: 19, name: 'Rattata' }, { id: 20, name: 'Raticate' },
  { id: 21, name: 'Spearow' }, { id: 22, name: 'Fearow' }, { id: 23, name: 'Ekans' },
  { id: 24, name: 'Arbok' }, { id: 25, name: 'Pikachu' }, { id: 26, name: 'Raichu' },
  { id: 27, name: 'Sandshrew' }, { id: 28, name: 'Sandslash' }, { id: 29, name: 'Nidoran♀' },
  { id: 30, name: 'Nidorina' }, { id: 31, name: 'Nidoqueen' }, { id: 32, name: 'Nidoran♂' },
  { id: 33, name: 'Nidorino' }, { id: 34, name: 'Nidoking' }, { id: 35, name: 'Clefairy' },
  { id: 36, name: 'Clefable' }, { id: 37, name: 'Vulpix' }, { id: 38, name: 'Ninetales' },
  { id: 39, name: 'Jigglypuff' }, { id: 40, name: 'Wigglytuff' }, { id: 41, name: 'Zubat' },
  { id: 42, name: 'Golbat' }, { id: 43, name: 'Oddish' }, { id: 44, name: 'Gloom' },
  { id: 45, name: 'Vileplume' }, { id: 46, name: 'Paras' }, { id: 47, name: 'Parasect' },
  { id: 48, name: 'Venonat' }, { id: 49, name: 'Venomoth' }, { id: 50, name: 'Diglett' },
  { id: 51, name: 'Dugtrio' }, { id: 52, name: 'Meowth' }, { id: 53, name: 'Persian' },
  { id: 54, name: 'Psyduck' }, { id: 55, name: 'Golduck' }, { id: 56, name: 'Mankey' },
  { id: 57, name: 'Primeape' }, { id: 58, name: 'Growlithe' }, { id: 59, name: 'Arcanine' },
  { id: 60, name: 'Poliwag' }, { id: 61, name: 'Poliwhirl' }, { id: 62, name: 'Poliwrath' },
  { id: 63, name: 'Abra' }, { id: 64, name: 'Kadabra' }, { id: 65, name: 'Alakazam' },
  { id: 66, name: 'Machop' }, { id: 67, name: 'Machoke' }, { id: 68, name: 'Machamp' },
  { id: 69, name: 'Bellsprout' }, { id: 70, name: 'Weepinbell' }, { id: 71, name: 'Victreebel' },
  { id: 72, name: 'Tentacool' }, { id: 73, name: 'Tentacruel' }, { id: 74, name: 'Geodude' },
  { id: 75, name: 'Graveler' }, { id: 76, name: 'Golem' }, { id: 77, name: 'Ponyta' },
  { id: 78, name: 'Rapidash' }, { id: 79, name: 'Slowpoke' }, { id: 80, name: 'Slowbro' },
  { id: 81, name: 'Magnemite' }, { id: 82, name: 'Magneton' }, { id: 83, name: 'Farfetch\'d' },
  { id: 84, name: 'Doduo' }, { id: 85, name: 'Dodrio' }, { id: 86, name: 'Seel' },
  { id: 87, name: 'Dewgong' }, { id: 88, name: 'Grimer' }, { id: 89, name: 'Muk' },
  { id: 90, name: 'Shellder' }, { id: 91, name: 'Cloyster' }, { id: 92, name: 'Gastly' },
  { id: 93, name: 'Haunter' }, { id: 94, name: 'Gengar' }, { id: 95, name: 'Onix' },
  { id: 96, name: 'Drowzee' }, { id: 97, name: 'Hypno' }, { id: 98, name: 'Krabby' },
  { id: 99, name: 'Kingler' }, { id: 100, name: 'Voltorb' }, { id: 101, name: 'Electrode' },
  { id: 102, name: 'Exeggcute' }, { id: 103, name: 'Exeggutor' }, { id: 104, name: 'Cubone' },
  { id: 105, name: 'Marowak' }, { id: 106, name: 'Hitmonlee' }, { id: 107, name: 'Hitmonchan' },
  { id: 108, name: 'Lickitung' }, { id: 109, name: 'Koffing' }, { id: 110, name: 'Weezing' },
  { id: 111, name: 'Rhyhorn' }, { id: 112, name: 'Rhydon' }, { id: 113, name: 'Chansey' },
  { id: 114, name: 'Tangela' }, { id: 115, name: 'Kangaskhan' }, { id: 116, name: 'Horsea' },
  { id: 117, name: 'Seadra' }, { id: 118, name: 'Goldeen' }, { id: 119, name: 'Seaking' },
  { id: 120, name: 'Staryu' }, { id: 121, name: 'Starmie' }, { id: 122, name: 'Mr. Mime' },
  { id: 123, name: 'Scyther' }, { id: 124, name: 'Jynx' }, { id: 125, name: 'Electabuzz' },
  { id: 126, name: 'Magmar' }, { id: 127, name: 'Pinsir' }, { id: 128, name: 'Tauros' },
  { id: 129, name: 'Magikarp' }, { id: 130, name: 'Gyarados' }, { id: 131, name: 'Lapras' },
  { id: 132, name: 'Ditto' }, { id: 133, name: 'Eevee' }, { id: 134, name: 'Vaporeon' },
  { id: 135, name: 'Jolteon' }, { id: 136, name: 'Flareon' }, { id: 137, name: 'Porygon' },
  { id: 138, name: 'Omanyte' }, { id: 139, name: 'Omastar' }, { id: 140, name: 'Kabuto' },
  { id: 141, name: 'Kabutops' }, { id: 142, name: 'Aerodactyl' }, { id: 143, name: 'Snorlax' },
  { id: 144, name: 'Articuno' }, { id: 145, name: 'Zapdos' }, { id: 146, name: 'Moltres' },
  { id: 147, name: 'Dratini' }, { id: 148, name: 'Dragonair' }, { id: 149, name: 'Dragonite' },
  { id: 150, name: 'Mewtwo' }, { id: 151, name: 'Mew' }
];
