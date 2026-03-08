// gen1_red_walk_tidy.js
// Run: node gen1_red_walk_tidy.js
// Output: gen1_red_walk_tidy.csv

const fs = require("fs");

const BASE = "https://pokeapi.co/api/v2";

// Altair-friendly: tidy rows, NOT full grid
const GENERATION = 1;

// Filters (set to null to include all)
const VERSION = "red";     // "red" | "blue" | "yellow" | null
const METHOD = "walk";     // "walk" | "surf" | "old-rod" | ... | null

const CONCURRENCY = 8;

// -------------------- helpers --------------------
function titleCaseSlug(slug) {
  return String(slug ?? "")
    .replace(/-area$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function speciesToDefaultPokemonName(speciesName) {
  const s = await getJSON(`${BASE}/pokemon-species/${speciesName}`);
  const def = s.varieties.find((v) => v.is_default);
  return def?.pokemon?.name ?? null;
}

function csvEscape(v) {
  const s = String(v ?? "");
  return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCSV(rows, headers) {
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(",")),
  ].join("\n");
}

async function mapPool(items, worker, concurrency) {
  const results = [];
  let i = 0;

  async function runOne() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx], idx);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, runOne));
  return results;
}

// -------------------- encounter flatten --------------------
// PokeAPI encounters endpoint: /pokemon/{id}/encounters
// We flatten to tidy rows. :contentReference[oaicite:2]{index=2}
function flattenEncounters(encounters, pokemonName) {
  const out = [];
  const seen = new Set();

  for (const entry of encounters) {
    const locSlug = entry.location_area?.name;
    if (!locSlug) continue;

    const location_area = titleCaseSlug(locSlug);

    for (const vd of entry.version_details || []) {
      const version = vd.version?.name ?? "";

      if (VERSION && version !== VERSION) continue;

      for (const ed of vd.encounter_details || []) {
        const method = ed.method?.name ?? "";
        if (METHOD && method !== METHOD) continue;

        const min_level = ed.min_level ?? "";
        const max_level = ed.max_level ?? "";
        const chance = ed.chance ?? 0;

        // Keep conditions as a raw string column (even if mostly empty in Gen1)
        const conditions = (ed.condition_values || []).map((c) => c.name).sort().join("|");

        // de-dupe exact repeats
        const key = [
          pokemonName, version, method, locSlug, min_level, max_level, chance, conditions,
        ].join("::");
        if (seen.has(key)) continue;
        seen.add(key);

        out.push({
          pokemon: pokemonName,
          location_area,
          location_area_slug: locSlug,
          version,
          method,
          min_level,
          max_level,
          chance,
          conditions,
        });
      }
    }
  }

  return out;
}

// -------------------- pokemon metadata --------------------
// Adds columns that are useful in Altair: types, habitat, color, shape, growth_rate, gender_rate.
// gender_rate meaning: chance of being female in eighths; -1 for genderless. :contentReference[oaicite:3]{index=3}
async function fetchPokemonMeta(pokemonName) {
  const [p, s] = await Promise.all([
    getJSON(`${BASE}/pokemon/${pokemonName}`),
    getJSON(`${BASE}/pokemon-species/${pokemonName}`),
  ]);

  const types = (p.types || [])
    .slice()
    .sort((a, b) => (a.slot ?? 999) - (b.slot ?? 999))
    .map((t) => t.type?.name)
    .filter(Boolean);

  const gender_rate = s.gender_rate; // -1 = genderless, else 0..8 (female in eighths)
  const female_ratio = (typeof gender_rate === "number" && gender_rate >= 0) ? gender_rate / 8 : "";
  const male_ratio = (typeof gender_rate === "number" && gender_rate >= 0) ? (8 - gender_rate) / 8 : "";

  return {
    pokemon: pokemonName,
    pokemon_id: p.id ?? "",
    types: types.join("|"),

    // species-level categorical meta (often helpful for faceting/color)
    habitat: s.habitat?.name ?? "",
    color: s.color?.name ?? "",
    shape: s.shape?.name ?? "",
    growth_rate: s.growth_rate?.name ?? "",

    gender_rate,     // -1 or 0..8
    female_ratio,    // 0..1 or ""
    male_ratio,      // 0..1 or ""
    is_legendary: s.is_legendary ?? "",
    is_mythical: s.is_mythical ?? "",
  };
}

// -------------------- main --------------------
(async () => {
  console.log(`Fetching Gen ${GENERATION} species list...`);
  const gen = await getJSON(`${BASE}/generation/${GENERATION}`);
  const speciesNames = gen.pokemon_species.map((s) => s.name);

  console.log(`Gen ${GENERATION} species: ${speciesNames.length}`);

  console.log("Resolving species -> default pokemon forms...");
  const pokemonNames = (await mapPool(
    speciesNames,
    async (sp, idx) => {
      if ((idx + 1) % 25 === 0) console.log(`  resolved ${idx + 1}/${speciesNames.length}`);
      return await speciesToDefaultPokemonName(sp);
    },
    CONCURRENCY
  )).filter(Boolean);

  console.log(`Default pokemon forms: ${pokemonNames.length}`);

  console.log(`Fetching pokemon metadata (types/habitat/etc)...`);
  const metaList = await mapPool(
    pokemonNames,
    async (p, idx) => {
      if ((idx + 1) % 25 === 0) console.log(`  meta ${idx + 1}/${pokemonNames.length}`);
      return await fetchPokemonMeta(p);
    },
    CONCURRENCY
  );
  const metaByName = new Map(metaList.map((m) => [m.pokemon, m]));

  console.log(`Fetching encounter data (${VERSION ?? "all versions"}, ${METHOD ?? "all methods"})...`);
  const rowsNested = await mapPool(
    pokemonNames,
    async (p, idx) => {
      if ((idx + 1) % 25 === 0) console.log(`  encounters ${idx + 1}/${pokemonNames.length}`);
      const enc = await getJSON(`${BASE}/pokemon/${p}/encounters`);
      return flattenEncounters(enc, p);
    },
    CONCURRENCY
  );

  // tidy rows
  const rows = rowsNested.flat();

  // join meta onto each row (Altair loves this)
  const joined = rows.map((r) => {
    const m = metaByName.get(r.pokemon) || {};
    return { ...r, ...m };
  });

  // Optional: sort for nicer inspection
  joined.sort((a, b) =>
    a.location_area.localeCompare(b.location_area) ||
    a.pokemon.localeCompare(b.pokemon) ||
    String(a.min_level).localeCompare(String(b.min_level))
  );

  const outName = `gen${GENERATION}_${VERSION ?? "all"}_${METHOD ?? "all"}_tidy.csv`;

  const headers = [
    // encounter
    "pokemon",
    "pokemon_id",
    "types",
    "location_area",
    "location_area_slug",
    "version",
    "method",
    "min_level",
    "max_level",
    "chance",
    "conditions",

    // pokemon/species metadata
    "habitat",
    "color",
    "shape",
    "growth_rate",
    "gender_rate",
    "female_ratio",
    "male_ratio",
    "is_legendary",
    "is_mythical",
  ];

  fs.writeFileSync(outName, toCSV(joined, headers));
  console.log(`Done. Rows: ${joined.length}`);
  console.log(`Wrote: ${outName}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});