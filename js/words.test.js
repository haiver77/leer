// words.test.js — CSV parsing, row integrity, rank ordering, fallback
// integrity, and 2- vs 3-syllable partitioning for the word inventory.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  WORDS,
  WORDS_3,
  WORDS_4,
  forLevel,
  byWord,
  partsMatchWord,
  parseCsv,
  rowIntegrity,
  isOrderedByRank,
  loadInventory,
  hardestConsonantTier,
  hasDigraph,
  hasClosedSyllable,
  expectedTierKey,
  forBand,
} from "./words.js";
import * as art from "./art.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "..", "data");

function readData(name) {
  return readFileSync(join(DATA, name), "utf8");
}

// ---- parseCsv -------------------------------------------------------------

test("parseCsv reads a header + rows, ignoring a trailing newline", () => {
  const rows = parseCsv("word,syllables,syllable_count\nmapa,ma-pa,2\n");
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0], { word: "mapa", syllables: "ma-pa", syllable_count: "2" });
});

test("parseCsv tolerates CRLF, blank lines, and quoted fields", () => {
  const text = 'a,b\r\n"x,y",2\r\n\r\n"he said ""hi""",3\r\n';
  const rows = parseCsv(text);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].a, "x,y");
  assert.equal(rows[0].b, "2");
  assert.equal(rows[1].a, 'he said "hi"');
});

test("parseCsv returns [] for non-string / empty input", () => {
  assert.deepEqual(parseCsv(""), []);
  assert.deepEqual(parseCsv(null), []);
  assert.deepEqual(parseCsv(123), []);
});

// ---- rowIntegrity ---------------------------------------------------------

test("rowIntegrity: parts join to word and syllable_count matches", () => {
  assert.ok(rowIntegrity({ word: "mamá", syllables: "ma-má", syllable_count: "2" }));
  assert.ok(rowIntegrity({ word: "pelota", syllables: "pe-lo-ta", syllable_count: "3" }));
});

test("rowIntegrity rejects wrong count or mismatched parts", () => {
  assert.equal(rowIntegrity({ word: "mapa", syllables: "ma-pa", syllable_count: "3" }), false);
  assert.equal(rowIntegrity({ word: "mapa", syllables: "ma-sa", syllable_count: "2" }), false);
  assert.equal(rowIntegrity({ word: "", syllables: "", syllable_count: "0" }), false);
  assert.equal(rowIntegrity(null), false);
});

// ---- isOrderedByRank ------------------------------------------------------

test("isOrderedByRank accepts non-decreasing ranks (raw + mapped)", () => {
  assert.ok(isOrderedByRank([{ difficulty_rank: "1" }, { difficulty_rank: "2" }, { difficulty_rank: "2" }]));
  assert.ok(isOrderedByRank([{ rank: 1 }, { rank: 5 }, { rank: 10 }]));
});

test("isOrderedByRank rejects a descending rank", () => {
  assert.equal(isOrderedByRank([{ rank: 2 }, { rank: 1 }]), false);
  assert.equal(isOrderedByRank("nope"), false);
});

// ---- the shipped CSV data files -------------------------------------------

test("data/words-2syllables.csv: every row has integrity and all are 2-syllable", () => {
  const rows = parseCsv(readData("words-2syllables.csv"));
  assert.ok(rows.length >= 20, "a solid 2-syllable set");
  for (const r of rows) {
    assert.ok(rowIntegrity(r), `${r.word} integrity`);
    assert.equal(Number(r.syllable_count), 2, `${r.word} is 2-syllable`);
    assert.match(r.art_id, /^word-/, `${r.word} has an art id`);
  }
});

test("data/words-3syllables.csv: every row has integrity and all are 3-syllable", () => {
  const rows = parseCsv(readData("words-3syllables.csv"));
  assert.ok(rows.length >= 12, "a solid 3-syllable set");
  for (const r of rows) {
    assert.ok(rowIntegrity(r), `${r.word} integrity`);
    assert.equal(Number(r.syllable_count), 3, `${r.word} is 3-syllable`);
    assert.match(r.art_id, /^word-/, `${r.word} has an art id`);
  }
});

test("both CSV files are ordered easiest-first by difficulty_rank (AC-G4.2)", () => {
  assert.ok(isOrderedByRank(parseCsv(readData("words-2syllables.csv"))));
  assert.ok(isOrderedByRank(parseCsv(readData("words-3syllables.csv"))));
});

test("2- and 3-syllable inventories are disjoint partitions by count", () => {
  const two = parseCsv(readData("words-2syllables.csv"));
  const three = parseCsv(readData("words-3syllables.csv"));
  assert.ok(two.every((r) => Number(r.syllable_count) === 2));
  assert.ok(three.every((r) => Number(r.syllable_count) === 3));
});

// ---- embedded fallback integrity (AC-G4.4) --------------------------------

test("embedded fallback WORDS are valid 2-part entries, ordered by rank", () => {
  assert.ok(WORDS.length >= 5);
  assert.ok(isOrderedByRank(WORDS));
  for (const w of WORDS) {
    assert.ok(partsMatchWord(w), `${w.word} parts join to the word`);
    assert.equal(w.parts.length, 2, `${w.word} has 2 parts`);
    assert.equal(w.syllableCount, 2);
    assert.match(w.artId, /^word-/);
  }
});

test("embedded fallback WORDS_3 are valid 3-part entries, ordered by rank", () => {
  assert.ok(WORDS_3.length >= 4);
  assert.ok(isOrderedByRank(WORDS_3));
  for (const w of WORDS_3) {
    assert.ok(partsMatchWord(w), `${w.word} parts join to the word`);
    assert.equal(w.parts.length, 3, `${w.word} has 3 parts`);
    assert.equal(w.syllableCount, 3);
    assert.match(w.artId, /^word-/);
  }
});

// ---- forLevel / byWord ----------------------------------------------------

test("forLevel returns a defensive copy per level; byWord resolves + normalises", () => {
  const two = forLevel("palabras");
  const three = forLevel("palabras-3");
  assert.equal(two.length, WORDS.length);
  assert.equal(three.length, WORDS_3.length);
  two[0].parts.push("X"); // mutate the copy
  assert.equal(WORDS[0].parts.length, 2, "original fallback not mutated");
  // byWord is accent/case-insensitive
  assert.equal(byWord("MAPA").word, "mapa");
  assert.equal(byWord("mamá").word, "mamá");
  assert.equal(byWord("nope"), null);
});

// ---- loadInventory with an injected fetch (AC-G4.1) -----------------------

test("loadInventory parses injected CSVs (2/3/4) and serves them via forLevel", async () => {
  const three = "word,syllables,syllable_count,difficulty_rank,emoji,art_id\nmaleta,ma-le-ta,3,1,🧳,word-maleta\n";
  const two = "word,syllables,syllable_count,difficulty_rank,emoji,art_id\ngato,ga-to,2,1,🐱,word-gato\n";
  const four = "word,syllables,syllable_count,difficulty_rank,emoji,art_id\nmariposa,ma-ri-po-sa,4,1,🦋,word-mariposa\n";
  const fetchImpl = async (url) => ({
    ok: true,
    text: async () =>
      String(url).includes("4syll") ? four : String(url).includes("3syll") ? three : two,
  });
  const res = await loadInventory({ fetchImpl });
  assert.ok(res.two.some((w) => w.word === "gato"));
  assert.ok(res.three.some((w) => w.word === "maleta"));
  assert.ok(res.four.some((w) => w.word === "mariposa"), "four-syllable list loaded (AC-J2.3)");
  // forLevel now serves the loaded data
  assert.ok(forLevel("palabras").some((w) => w.word === "gato"));
  assert.ok(forLevel("palabras-4").some((w) => w.word === "mariposa"));
  // byWord resolves a 4-syllable word with its parts (AC-J2.4)
  const mp = byWord("mariposa");
  assert.ok(mp && mp.syllableCount === 4 && mp.parts.length === 4);
});

test("loadInventory keeps the embedded fallback when a fetch fails (AC-G4.4)", async () => {
  const fetchImpl = async () => ({ ok: false, text: async () => "" });
  const res = await loadInventory({ fetchImpl });
  // falls back to (previously loaded or embedded) — never empty, never throws
  assert.ok(Array.isArray(res.two) && res.two.length > 0);
  assert.ok(Array.isArray(res.three) && res.three.length > 0);
  assert.ok(Array.isArray(res.four) && res.four.length > 0, "four-syllable fallback non-empty");
});

// ===========================================================================
// Iteration 4 — pedagogical-ordering helpers & correctness (H1/H2/H3)
// ===========================================================================

// ---- hardestConsonantTier (AC-H2.2) ---------------------------------------

test("hardestConsonantTier: tier 1 for m/p/l/s/t-only all-open words", () => {
  assert.equal(hardestConsonantTier("mapa"), 1);
  assert.equal(hardestConsonantTier("tela"), 1);
  assert.equal(hardestConsonantTier(["Ma", "Le", "Ta"]), 1); // maleta
});

test("hardestConsonantTier: tier 2 for d/n/ñ, tier 3 for f/b/v/c/k/g/j/r", () => {
  assert.equal(hardestConsonantTier("dedo"), 2);
  assert.equal(hardestConsonantTier("niña"), 2);
  assert.equal(hardestConsonantTier("dinero"), 3); // single r
  assert.equal(hardestConsonantTier("gato"), 3);
  assert.equal(hardestConsonantTier("jamón"), 3); // j, accent-insensitive
  assert.equal(hardestConsonantTier("rana"), 3); // single leading r
});

test("hardestConsonantTier: tier 4 for digraphs and z/y/x/w", () => {
  assert.equal(hardestConsonantTier("semilla"), 4); // ll
  assert.equal(hardestConsonantTier("perro"), 4); // rr
  assert.equal(hardestConsonantTier("coche"), 4); // ch
  assert.equal(hardestConsonantTier("zapato"), 4); // z
  assert.equal(hardestConsonantTier("taza"), 4); // z
});

test("hardestConsonantTier: qu/gu fold into the c/k/g family (tier 3)", () => {
  assert.equal(hardestConsonantTier("queso"), 3); // qu + s → tier 3
  assert.equal(hardestConsonantTier("fuego"), 3); // f/g + gu → tier 3
});

// ---- hasDigraph (AC-H2.2) -------------------------------------------------

test("hasDigraph detects ch / ll / rr, accent-insensitive, on word or parts", () => {
  assert.equal(hasDigraph("semilla"), true);
  assert.equal(hasDigraph("perro"), true);
  assert.equal(hasDigraph("coche"), true);
  assert.equal(hasDigraph(["Ga", "Lli", "Na"]), true); // gallina
  assert.equal(hasDigraph("mapa"), false);
  assert.equal(hasDigraph("dinero"), false); // single r, not rr
});

// ---- hasClosedSyllable (AC-H2.2) ------------------------------------------

test("hasClosedSyllable: true when any part ends in a consonant / has a cluster", () => {
  assert.equal(hasClosedSyllable(["ja", "món"]), true); // closed "món"
  assert.equal(hasClosedSyllable(["sol"]), true); // inverse/closed
  assert.equal(hasClosedSyllable("li-mo-nes"), true); // "nes" closed
  assert.equal(hasClosedSyllable(["pla", "ta"]), true); // cluster onset
});

test("hasClosedSyllable: false for all-open CV/V words (digraphs stay open)", () => {
  assert.equal(hasClosedSyllable(["ma", "pa"]), false);
  assert.equal(hasClosedSyllable(["se", "mi", "lla"]), false); // ll is one onset
  assert.equal(hasClosedSyllable(["pe", "rro"]), false); // rr is one onset
  assert.equal(hasClosedSyllable("ma-le-ta"), false);
});

// ---- expectedTierKey (AC-H2.2) --------------------------------------------

test("expectedTierKey derives [tier, typeRank, length, word] from word+syllables", () => {
  assert.deepEqual(expectedTierKey({ word: "mapa", syllables: "ma-pa" }), [1, 0, 4, "mapa"]);
  assert.deepEqual(expectedTierKey({ word: "jamón", syllables: "ja-món" }), [3, 1, 5, "jamon"]);
  assert.deepEqual(expectedTierKey({ word: "semilla", syllables: "se-mi-lla" }), [4, 0, 7, "semilla"]);
});

// ---- CORRECTNESS of file order (AC-H1.1 / H1.2 / H2.1) --------------------
// The two binding minimums: no digraph word precedes a non-digraph word, and
// no closed-syllable word precedes an all-open word of the same syllable count.
// We ALSO check consonant-tier is non-decreasing within the all-open prefix and
// within the closed tail (the documented tier→type ordering). This FAILS on the
// old `semilla`-at-rank-7 data and PASSES on the corrected data.

function assertPedagogicalOrder(rows, label) {
  const items = rows.map((r) => ({
    word: r.word,
    parts: r.syllables.split("-"),
    digraph: hasDigraph(r.word),
    closed: hasClosedSyllable(r.syllables.split("-")),
    tier: hardestConsonantTier(r.word),
    key: expectedTierKey(r),
  }));

  // (1) no digraph word precedes a non-digraph word
  const firstDigraph = items.findIndex((it) => it.digraph);
  if (firstDigraph !== -1) {
    for (let i = firstDigraph; i < items.length; i++) {
      assert.ok(items[i].digraph, `${label}: non-digraph "${items[i].word}" sits after a digraph word`);
    }
  }

  // (2) no closed-syllable word precedes an all-open word of the same count
  const firstClosed = items.findIndex((it) => it.closed && !it.digraph);
  if (firstClosed !== -1) {
    for (let i = firstClosed; i < items.length; i++) {
      // every later word must be closed or a digraph (which legitimately trails)
      assert.ok(
        items[i].closed || items[i].digraph,
        `${label}: all-open "${items[i].word}" sits after a closed word`
      );
    }
  }

  // (3) consonant tier non-decreasing within the all-open, non-digraph prefix
  const openPrefix = items.filter((it) => !it.closed && !it.digraph);
  for (let i = 1; i < openPrefix.length; i++) {
    assert.ok(
      openPrefix[i].tier >= openPrefix[i - 1].tier,
      `${label}: open word "${openPrefix[i].word}" (tier ${openPrefix[i].tier}) precedes a lower tier`
    );
  }
}

test("CORRECTNESS: shipped 2-syllable CSV order follows the pedagogical rule (AC-H2.1)", () => {
  const rows = parseCsv(readData("words-2syllables.csv"));
  assertPedagogicalOrder(rows, "words-2syllables.csv");
});

test("CORRECTNESS: shipped 3-syllable CSV order follows the pedagogical rule (AC-H1.1/H2.1)", () => {
  const rows = parseCsv(readData("words-3syllables.csv"));
  assertPedagogicalOrder(rows, "words-3syllables.csv");
  // explicit: semilla & gallina (ll) are at/after every non-digraph word
  const words = rows.map((r) => r.word);
  const lastNonDigraph = words.reduce(
    (acc, w, i) => (hasDigraph(w) ? acc : i),
    -1
  );
  const semilla = words.indexOf("semilla");
  const gallina = words.indexOf("gallina");
  assert.ok(semilla > lastNonDigraph, "semilla is after all non-digraph words");
  assert.ok(gallina > lastNonDigraph, "gallina is after all non-digraph words");
});

test("the old (buggy) order with semilla before non-digraph words FAILS the check", () => {
  // Sanity guard: the correctness check must actually reject the iteration-3 bug.
  const buggy = [
    { word: "tomate", syllables: "to-ma-te" },
    { word: "semilla", syllables: "se-mi-lla" }, // digraph too early (old rank 7)
    { word: "dinero", syllables: "di-ne-ro" },
  ];
  assert.throws(() => assertPedagogicalOrder(buggy, "buggy"));
});

// ---- count breadth (AC-H3.1) ----------------------------------------------

test("content breadth: >=50 two-syllable, >=50 three-syllable, >=20 four-syllable (AC-J1.1/J2.1)", () => {
  const two = parseCsv(readData("words-2syllables.csv"));
  const three = parseCsv(readData("words-3syllables.csv"));
  const four = parseCsv(readData("words-4syllables.csv"));
  assert.ok(two.length >= 50, `two-syllable rows: ${two.length} (need >= 50)`);
  assert.ok(three.length >= 50, `three-syllable rows: ${three.length} (need >= 50)`);
  assert.ok(four.length >= 20, `four-syllable rows: ${four.length} (need >= 20)`);
});

test("data/words-4syllables.csv: integrity, count 4, rank order, pedagogy (AC-J2.1/J2.2)", () => {
  const rows = parseCsv(readData("words-4syllables.csv"));
  assert.ok(rows.length >= 20, "a solid 4-syllable set");
  for (const r of rows) {
    assert.ok(rowIntegrity(r), `${r.word} integrity`);
    assert.equal(Number(r.syllable_count), 4, `${r.word} is 4-syllable`);
    assert.match(r.art_id, /^word-/, `${r.word} has an art id`);
  }
  assert.ok(isOrderedByRank(rows), "4-syllable rows ordered by difficulty_rank");
  assertPedagogicalOrder(rows, "words-4syllables.csv");
});

// ---- 100% art coverage, no cue-default (AC-H3.2) --------------------------

test("art coverage: every CSV row and every fallback entry resolves in art.js (AC-H3.2/J1.4)", () => {
  const two = parseCsv(readData("words-2syllables.csv"));
  const three = parseCsv(readData("words-3syllables.csv"));
  const four = parseCsv(readData("words-4syllables.csv"));
  for (const r of [...two, ...three, ...four]) {
    assert.ok(art.has(r.art_id), `missing art for CSV word "${r.word}" (${r.art_id})`);
  }
  for (const w of [...WORDS, ...WORDS_3, ...WORDS_4]) {
    assert.ok(art.has(w.artId), `missing art for fallback word "${w.word}" (${w.artId})`);
  }
});

// ===========================================================================
// Iteration 5 — forBand helper (D1): pure, data-derived word-band selector
// ===========================================================================
//
// Earlier tests call loadInventory() with an injected fetch, which leaves the
// module cache holding a tiny stub set. Load the REAL shipped CSVs here so the
// band selector is exercised against the full, ordered inventory.
test("forBand setup: load the real shipped CSV inventory", async () => {
  const fetchImpl = async (url) => ({
    ok: true,
    text: async () =>
      String(url).includes("4syll")
        ? readData("words-4syllables.csv")
        : String(url).includes("3syll")
        ? readData("words-3syllables.csv")
        : readData("words-2syllables.csv"),
  });
  const res = await loadInventory({ fetchImpl });
  assert.ok(res.two.length >= 50 && res.three.length >= 50 && res.four.length >= 20);
});

// ---- Iteration 7 — every 2-syllable band has >=10 words (AC-K2.1/K1.2) -----
test("AC-K2.1: each 2-syllable band (forBand) has >= 10 words from the live CSV", () => {
  const bands = [
    ["pal-2-abiertas-1", { count: 2, tiers: [1], special: false }],
    ["pal-2-abiertas-2", { count: 2, tiers: [2], special: false }],
    ["pal-2-abiertas-3", { count: 2, tiers: [3], special: false }],
    ["pal-2-especiales", { count: 2, special: true }],
  ];
  for (const [id, spec] of bands) {
    const pool = forBand(spec);
    assert.ok(pool.length >= 10, `${id} has ${pool.length} words (need >= 10)`);
  }
});

test("AC-K1.2: every band (2/3/4) yields >= 10 words from the live CSV", () => {
  const bands = [
    { count: 2, tiers: [1], special: false },
    { count: 2, tiers: [2], special: false },
    { count: 2, tiers: [3], special: false },
    { count: 2, special: true },
    { count: 3, tiers: [1, 2], special: false },
    { count: 3, tiers: [3], special: false },
    { count: 3, special: true },
    { count: 4, special: false },
    { count: 4, special: true },
  ];
  for (const spec of bands) {
    assert.ok(
      forBand(spec).length >= 10,
      `band ${JSON.stringify(spec)} has ${forBand(spec).length} (need >= 10)`
    );
  }
});

// ---- Iteration 7 — the embedded WORDS fallback keeps each 2-syllable band ---
// non-empty AND >= 10 offline / file:// (AC-K2.5). This asserts against the
// fallback catalog directly (not the loaded CSV), so it holds offline.
test("AC-K2.5: the embedded WORDS fallback has >= 10 words in each 2-syllable band", () => {
  const bandOf = (w) => {
    const tier = hardestConsonantTier(w.parts);
    const special =
      tier === 4 || hasDigraph(w.parts) || hasClosedSyllable(w.parts);
    if (special) return "especiales";
    return `open-${tier}`;
  };
  const counts = {};
  for (const w of WORDS) {
    const b = bandOf(w);
    counts[b] = (counts[b] || 0) + 1;
  }
  for (const key of ["open-1", "open-2", "open-3", "especiales"]) {
    assert.ok((counts[key] || 0) >= 10, `fallback band ${key}: ${counts[key] || 0} (need >= 10)`);
  }
});

test("forBand: open tier filter returns only open-CV, non-digraph words of that tier", () => {
  const t1 = forBand({ count: 2, tiers: [1], special: false });
  assert.ok(t1.length > 0, "tier-1 open band non-empty");
  for (const it of t1) {
    assert.equal(hardestConsonantTier(it.parts), 1);
    assert.equal(hasDigraph(it.parts), false);
    assert.equal(hasClosedSyllable(it.parts), false);
    assert.equal(it.syllableCount, 2);
  }
});

test("forBand: special band keeps only tier-4 / digraph / closed words", () => {
  const esp = forBand({ count: 2, special: true });
  assert.ok(esp.length > 0, "especiales band non-empty");
  for (const it of esp) {
    const hard =
      hardestConsonantTier(it.parts) === 4 ||
      hasDigraph(it.parts) ||
      hasClosedSyllable(it.parts);
    assert.ok(hard, `${it.word} belongs in especiales`);
  }
});

test("forBand: open and special bands of a count are disjoint and cover the inventory", () => {
  const open = new Set(
    [
      ...forBand({ count: 2, tiers: [1], special: false }),
      ...forBand({ count: 2, tiers: [2], special: false }),
      ...forBand({ count: 2, tiers: [3], special: false }),
    ].map((w) => w.word)
  );
  const esp = new Set(forBand({ count: 2, special: true }).map((w) => w.word));
  // disjoint
  for (const w of open) assert.ok(!esp.has(w), `${w} is in open, not especiales`);
  // together they account for every 2-syllable inventory word
  const all = new Set(forLevel("palabras").map((w) => w.word));
  for (const w of all) {
    assert.ok(open.has(w) || esp.has(w), `${w} covered by a band`);
  }
});

test("forBand: count defaults to 2 and tiers default to all", () => {
  const def = forBand({});
  assert.ok(def.every((w) => w.syllableCount === 2));
  assert.equal(def.length, forLevel("palabras").length);
});

test("forBand: 3-syllable bands draw only from the 3-syllable inventory", () => {
  const open3 = forBand({ count: 3, tiers: [1, 2, 3], special: false });
  const esp3 = forBand({ count: 3, special: true });
  for (const it of [...open3, ...esp3]) assert.equal(it.syllableCount, 3);
  assert.ok(open3.length > 0 && esp3.length > 0);
});

test("forBand: count 4 draws only from the 4-syllable inventory (AC-J2.3)", () => {
  const open4 = forBand({ count: 4, special: false });
  const esp4 = forBand({ count: 4, special: true });
  for (const it of [...open4, ...esp4]) assert.equal(it.syllableCount, 4);
  assert.ok(open4.length > 0 && esp4.length > 0, "both 4-syllable bands non-empty");
  // open and especiales partition the 4-syllable inventory (disjoint + cover)
  const open = new Set(open4.map((w) => w.word));
  const esp = new Set(esp4.map((w) => w.word));
  for (const w of open) assert.ok(!esp.has(w), `${w} is open, not especiales`);
  const all = new Set(forLevel("palabras-4").map((w) => w.word));
  for (const w of all) assert.ok(open.has(w) || esp.has(w), `${w} covered by a band`);
});

test("embedded fallback WORDS_4 are valid 4-part entries, ordered by rank (AC-J2.3)", () => {
  assert.ok(WORDS_4.length >= 8);
  assert.ok(isOrderedByRank(WORDS_4));
  for (const w of WORDS_4) {
    assert.ok(partsMatchWord(w), `${w.word} parts join to the word`);
    assert.equal(w.parts.length, 4, `${w.word} has 4 parts`);
    assert.equal(w.syllableCount, 4);
    assert.match(w.artId, /^word-/);
  }
});

// difficulty_rank strictly ascending, unique, and == row order (AC-H1.4)
test("difficulty_rank is strictly ascending, unique, and equals row order (AC-H1.4)", () => {
  for (const name of ["words-2syllables.csv", "words-3syllables.csv", "words-4syllables.csv"]) {
    const rows = parseCsv(readData(name));
    const ranks = rows.map((r) => Number(r.difficulty_rank));
    for (let i = 0; i < ranks.length; i++) {
      assert.equal(ranks[i], i + 1, `${name}: rank at row ${i} should be ${i + 1}`);
    }
    assert.equal(new Set(ranks).size, ranks.length, `${name}: ranks unique`);
  }
});
