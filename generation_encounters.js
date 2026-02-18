const fs = require("fs");

const BASE = "https://pokeapi.co/api/v2";
const VERSION = "red";     // <-- Emerald filter
const METHOD = "walk";         // change to null for all methods
const CONCURRENCY = 8;         // be polite to the API

function titleCaseSlug(slug) {
  return slug
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

function toCSV(rows) {
  const headers = [
    "pokemon",
    "version",
    "method",
    "location_area",
    "min_level",
    "max_level",
    "chance",
    "conditions",
  ];
  const escape = (v) => {
    const s = String(v ?? "");
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

function flattenEmerald(encounters, pokemonName) {
  const out = [];
  const seen = new Set();

  for (const entry of encounters) {
    const locSlug = entry.location_area?.name;
    const locPretty = titleCaseSlug(locSlug);

    for (const vd of entry.version_details || []) {
      if (vd.version?.name !== VERSION) continue;

      for (const ed of vd.encounter_details || []) {
        const method = ed.method?.name;
        if (METHOD && method !== METHOD) continue;

        const conditions = (ed.condition_values || []).map((c) => c.name).sort();
        const key = [
          pokemonName,
          VERSION,
          method,
          locSlug,
          ed.min_level,
          ed.max_level,
          ed.chance,
          conditions.join("|"),
        ].join("::");
        if (ed.condition_values?.length) {
          console.log(pokemonName, locSlug, method, ed.condition_values.map(c=>c.name));
        }

        if (seen.has(key)) continue;
        seen.add(key);

        out.push({
          pokemon: pokemonName,
          version: VERSION,
          method,
          location_area: locPretty,
          min_level: ed.min_level,
          max_level: ed.max_level,
          chance: ed.chance,
          conditions: conditions.join("|"),
        });
      }
    }
  }
  return out;
}

function densifyGrid(rows, pokemonList, locationList) {
  const index = new Map();

  for (const r of rows) {
    const key = `${r.pokemon}::${r.location_area}`;
    const prev = index.get(key);

    const cond = (r.conditions || "").trim();

    if (!prev) {
      index.set(key, {
        pokemon: r.pokemon,
        version: r.version,
        method: r.method,
        location_area: r.location_area,
        chance: Number(r.chance || 0),
        min_level: Number.isFinite(Number(r.min_level)) ? Number(r.min_level) : null,
        max_level: Number.isFinite(Number(r.max_level)) ? Number(r.max_level) : null,
        _condSet: new Set(cond ? [cond] : []),
      });
    } else {
      prev.chance += Number(r.chance || 0);

      const mn = Number(r.min_level);
      const mx = Number(r.max_level);
      if (Number.isFinite(mn)) prev.min_level = prev.min_level == null ? mn : Math.min(prev.min_level, mn);
      if (Number.isFinite(mx)) prev.max_level = prev.max_level == null ? mx : Math.max(prev.max_level, mx);

      if (cond) prev._condSet.add(cond);
    }
  }

  const out = [];
  for (const loc of locationList) {
    for (const p of pokemonList) {
      const key = `${p}::${loc}`;
      const existing = index.get(key);
      if (existing) {
        out.push({
          pokemon: existing.pokemon,
          version: existing.version,
          method: existing.method,
          location_area: existing.location_area,
          min_level: existing.min_level ?? "",
          max_level: existing.max_level ?? "",
          chance: existing.chance,
          conditions: Array.from(existing._condSet).sort().join(" || "),
        });
      } else {
        out.push({
          pokemon: p,
          version: VERSION,
          method: METHOD ?? "",
          location_area: loc,
          min_level: "",
          max_level: "",
          chance: 0,
          conditions: "",
        });
      }
    }
  }
  return out;
}

// simple concurrency pool
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

(async () => {
  console.log("Fetching Gen 3 species list...");
  const gen3 = await getJSON(`${BASE}/generation/3`);
  const speciesNames = gen3.pokemon_species.map((s) => s.name);

  console.log(`Gen 3 species: ${speciesNames.length}`);

  console.log("Resolving species -> default pokemon...");
  const pokemonNames = (await mapPool(
    speciesNames,
    async (sp, idx) => {
      if ((idx + 1) % 20 === 0) console.log(`  resolved ${idx + 1}/${speciesNames.length}`);
      return await speciesToDefaultPokemonName(sp);
    },
    CONCURRENCY
  )).filter(Boolean);

  console.log(`Default pokemon forms: ${pokemonNames.length}`);

  console.log(`Fetching encounter data + filtering to ${VERSION} (${METHOD ?? "all methods"})...`);
  const rowsNested = await mapPool(
    pokemonNames,
    async (p, idx) => {
      if ((idx + 1) % 25 === 0) console.log(`  encounters ${idx + 1}/${pokemonNames.length}`);
      const enc = await getJSON(`${BASE}/pokemon/${p}/encounters`);
      return flattenEmerald(enc, p);
    },
    CONCURRENCY
  );

  const rows = rowsNested.flat();

  // list of all pokemon (columns)
  const pokemonList = pokemonNames.slice().sort();

  // list of all locations (rows)
  const locationSet = new Set(rows.map(r => r.location_area));
  const locationList = Array.from(locationSet).sort();

  // build full Location × Pokemon grid (fills missing with chance=0)
  const full = densifyGrid(rows, pokemonList, locationList);

  // write the densified CSV
  fs.writeFileSync("red_gen1_encounters_fullgrid.csv", toCSV(full));

  console.log(`Done. Raw rows: ${rows.length}`);
  console.log(`Full grid rows: ${full.length} (${locationList.length} locations × ${pokemonList.length} pokemon)`);
  console.log("Wrote: red_gen1_encounters_fullgrid.csv");

})().catch((e) => {
  console.error(e);
  process.exit(1);
});
