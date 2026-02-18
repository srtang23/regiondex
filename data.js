// data.js
// Tiny sample dataset (you can expand this later)
window.ENCOUNTERS = [
  {
    id: "route-1",
    name: "Route 1",
    xy: [620, 780], // [x, y] in image coordinates (pixels-ish)
    encounters: [
      { pokemon: "Pidgey", rate: 55 },
      { pokemon: "Rattata", rate: 45 },
    ],
  },
  {
    id: "viridian-forest",
    name: "Viridian Forest",
    xy: [560, 650],
    encounters: [
      { pokemon: "Caterpie", rate: 35 },
      { pokemon: "Weedle", rate: 35 },
      { pokemon: "Pikachu", rate: 5 },
    ],
  },
  {
    id: "route-22",
    name: "Route 22",
    xy: [410, 690],
    encounters: [
      { pokemon: "Nidoran♀", rate: 30 },
      { pokemon: "Nidoran♂", rate: 30 },
      { pokemon: "Spearow", rate: 40 },
    ],
  },
];
