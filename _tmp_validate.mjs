// Temp validator for the grown CSVs. Run: node _tmp_validate.mjs
import { readFileSync } from "node:fs";
import {
  parseCsv,
  rowIntegrity,
  isOrderedByRank,
  expectedTierKey,
  hardestConsonantTier,
  hasDigraph,
  hasClosedSyllable,
  forBand,
  loadInventory,
} from "./js/words.js";
import * as art from "./js/art.js";

function check(name, expectedCount, syll) {
  const text = readFileSync(`./data/${name}`, "utf8");
  const rows = parseCsv(text);
  let ok = true;
  const log = (m) => { console.log(`  ${m}`); };
  console.log(`\n=== ${name} (${rows.length} rows, expect ${expectedCount}) ===`);
  if (rows.length !== expectedCount) { ok = false; log(`COUNT MISMATCH: ${rows.length}`); }

  // rank == row order, strictly ascending unique
  rows.forEach((r, i) => {
    if (Number(r.difficulty_rank) !== i + 1) { ok = false; log(`RANK at row ${i}: ${r.difficulty_rank} != ${i + 1} (${r.word})`); }
  });

  // integrity + count + art
  for (const r of rows) {
    if (!rowIntegrity(r)) { ok = false; log(`INTEGRITY FAIL: ${r.word} (${r.syllables} / ${r.syllable_count})`); }
    if (Number(r.syllable_count) !== syll) { ok = false; log(`SYLL FAIL: ${r.word} count ${r.syllable_count}`); }
    if (!art.has(r.art_id)) { ok = false; log(`ART MISSING: ${r.word} -> ${r.art_id}`); }
    if (!r.emoji) { ok = false; log(`EMOJI MISSING: ${r.word}`); }
  }

  // pedagogical order (mirror of words.test assertPedagogicalOrder)
  const items = rows.map((r) => ({
    word: r.word,
    digraph: hasDigraph(r.word),
    closed: hasClosedSyllable(r.syllables.split("-")),
    tier: hardestConsonantTier(r.word),
  }));
  const firstDigraph = items.findIndex((it) => it.digraph);
  if (firstDigraph !== -1) {
    for (let i = firstDigraph; i < items.length; i++) {
      if (!items[i].digraph) { ok = false; log(`ORDER(digraph): non-digraph "${items[i].word}" after a digraph`); }
    }
  }
  const firstClosed = items.findIndex((it) => it.closed && !it.digraph);
  if (firstClosed !== -1) {
    for (let i = firstClosed; i < items.length; i++) {
      if (!(items[i].closed || items[i].digraph)) { ok = false; log(`ORDER(closed): all-open "${items[i].word}" after a closed`); }
    }
  }
  const openPrefix = items.filter((it) => !it.closed && !it.digraph);
  for (let i = 1; i < openPrefix.length; i++) {
    if (openPrefix[i].tier < openPrefix[i - 1].tier) { ok = false; log(`ORDER(tier): open "${openPrefix[i].word}" (t${openPrefix[i].tier}) after t${openPrefix[i - 1].tier} "${openPrefix[i-1].word}"`); }
  }

  // duplicates within file
  const seen = new Set();
  for (const r of rows) {
    if (seen.has(r.word)) { ok = false; log(`DUP in file: ${r.word}`); }
    seen.add(r.word);
  }

  console.log(ok ? "  OK" : "  *** FAILED ***");
  return rows;
}

const two = check("words-2syllables.csv", 85, 2);
const three = check("words-3syllables.csv", 80, 3);
const four = check("words-4syllables.csv", 52, 4);

// cross-file dup
const all = [...two, ...three, ...four].map((r) => r.word);
const dup = all.filter((w, i) => all.indexOf(w) !== i);
if (dup.length) console.log(`\nCROSS-FILE DUPLICATES: ${[...new Set(dup)].join(", ")}`);
else console.log("\nNo cross-file duplicate words.");

// band breadth with the real CSVs loaded
const fetchImpl = async (url) => ({
  ok: true,
  text: async () =>
    String(url).includes("4syll") ? readFileSync("./data/words-4syllables.csv", "utf8")
    : String(url).includes("3syll") ? readFileSync("./data/words-3syllables.csv", "utf8")
    : readFileSync("./data/words-2syllables.csv", "utf8"),
});
await loadInventory({ fetchImpl });
const bands = [
  ["pal-2-abiertas-1", { count: 2, tiers: [1], special: false }],
  ["pal-2-abiertas-2", { count: 2, tiers: [2], special: false }],
  ["pal-2-abiertas-3", { count: 2, tiers: [3], special: false }],
  ["pal-2-especiales", { count: 2, special: true }],
  ["pal-3-abiertas-1", { count: 3, tiers: [1, 2], special: false }],
  ["pal-3-abiertas-2", { count: 3, tiers: [3], special: false }],
  ["pal-3-especiales", { count: 3, special: true }],
  ["pal-4-abiertas", { count: 4, special: false }],
  ["pal-4-especiales", { count: 4, special: true }],
];
console.log("\n=== Band breadth (need >=10) ===");
for (const [id, spec] of bands) {
  const n = forBand(spec).length;
  console.log(`  ${id}: ${n} ${n >= 10 ? "" : "*** <10 ***"}`);
}
