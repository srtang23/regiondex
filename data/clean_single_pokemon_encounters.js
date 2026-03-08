const fs = require("fs");

const INPUT = "poochyena_encounters.json";
const OUTPUT_JSON = "poochyena_encounters_clean.json";
const OUTPUT_CSV = "poochyena_encounters_clean.csv";

// --- helpers ---
function titleCaseSlug(slug) {
  // drop "-area" suffix, replace dashes, title case
  return slug
    .replace(/-area$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function conditionsKey(conditionValues) {
  // stable key for dedup
  const names = (conditionValues || []).map((c) => c.name).sort();
  return names.join("|"); // "" if none
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
    "conditions"
  ];
  const escape = (v) => {
    const s = String(v ?? "");
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(headers.map((h) => escape(r[h])).join(","));
  }
  return lines.join("\n");
}

// --- load ---
const raw = JSON.parse(fs.readFileSync(INPUT, "utf8"));

// --- configurable filters (edit these) ---
const POKEMON = "poochyena";     // set to your pokemon name
const VERSION_FILTER = "emerald";
const METHOD_FILTER = "walk";    // "walk" is what you asked about

// --- flatten + filter + dedupe ---
const rows = [];
const seen = new Set();

for (const locEntry of raw) {
  const locSlug = locEntry.location_area?.name;
  const locPretty = titleCaseSlug(locSlug);

  for (const vd of locEntry.version_details || []) {
    const version = vd.version?.name;

    if (VERSION_FILTER && version !== VERSION_FILTER) continue;

    for (const ed of vd.encounter_details || []) {
      const method = ed.method?.name;

      if (METHOD_FILTER && method !== METHOD_FILTER) continue;

      const conditions = (ed.condition_values || []).map((c) => c.name).sort();
      const key = [
        POKEMON,
        version,
        method,
        locSlug,
        ed.min_level,
        ed.max_level,
        ed.chance,
        conditionsKey(ed.condition_values)
      ].join("::");

      // remove exact duplicates (your file has many)
      if (seen.has(key)) continue;
      seen.add(key);

      rows.push({
        pokemon: POKEMON,
        version,
        method,
        location_area: locPretty,
        min_level: ed.min_level,
        max_level: ed.max_level,
        chance: ed.chance,
        conditions: conditions.join("|") // "" if none
      });
    }
  }
}

// Optional: if you only want “presence/absence” per location_area (not level variants)
// uncomment this block:
/*
const areaSeen = new Set();
const uniqueAreas = [];
for (const r of rows) {
  const k = `${r.pokemon}::${r.version}::${r.method}::${r.location_area}`;
  if (areaSeen.has(k)) continue;
  areaSeen.add(k);
  uniqueAreas.push({ ...r, min_level: "", max_level: "", chance: "" });
}
rows.length = 0;
rows.push(...uniqueAreas);
*/

// --- write outputs ---
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(rows, null, 2));
fs.writeFileSync(OUTPUT_CSV, toCSV(rows));

console.log(`Clean rows: ${rows.length}`);
console.log(`Wrote: ${OUTPUT_JSON}`);
console.log(`Wrote: ${OUTPUT_CSV}`);
