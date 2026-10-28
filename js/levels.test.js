// levels.test.js — pure checks for the WORDS-ONLY level map (iteration 5, D1)
// + unlock rules. Every level is a word level drawn from the CSV inventory; the
// retired syllable levels (isla-*, mixto, digrafos, cerradas) must not exist.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  all,
  byId,
  firstLevelId,
  nextUnlock,
  isUnlocked,
  mapState,
  completeLevel,
} from "./levels.js";
import { freshState } from "./progress.js";
import {
  forLevel,
  expectedTierKey,
  hardestConsonantTier,
  hasDigraph,
  hasClosedSyllable,
} from "./words.js";

// Full inventory word-set (2- + 3- + 4-syllable) for membership checks.
function inventoryWords() {
  return new Set([
    ...forLevel("palabras").map((w) => w.word),
    ...forLevel("palabras-3").map((w) => w.word),
    ...forLevel("palabras-4").map((w) => w.word),
  ]);
}

// Flat inventory-entry list across all three counts.
function inventoryEntries() {
  return [
    ...forLevel("palabras"),
    ...forLevel("palabras-3"),
    ...forLevel("palabras-4"),
  ];
}

// Retired syllable-era ids that must be gone (AC-I1.1).
const RETIRED_IDS = [
  "isla-p",
  "isla-m",
  "isla-s",
  "isla-t",
  "isla-l",
  "isla-d",
  "mixto",
  "digrafos",
  "cerradas",
];

test("AC-I1.1: no retired syllable-era level ids exist", () => {
  const ids = all().map((l) => l.id);
  for (const dead of RETIRED_IDS) {
    assert.ok(!ids.includes(dead), `retired id "${dead}" must not be in the chain`);
  }
  // also: nothing starts with "isla-"
  assert.ok(!ids.some((id) => id.startsWith("isla-")), "no isla-* nodes");
});

test("AC-I1.1/I1.2: every level is a word level with a non-empty pool of inventory words", () => {
  const inv = inventoryWords();
  const levels = all();
  assert.ok(levels.length >= 1, "at least one word level");
  for (const lvl of levels) {
    assert.equal(lvl.type, "word", `${lvl.id} type === "word"`);
    assert.equal(lvl.mode, "word", `${lvl.id} mode === "word"`);
    const pool = lvl.pool();
    assert.ok(Array.isArray(pool) && pool.length > 0, `${lvl.id} pool is non-empty`);
    for (const w of pool) {
      assert.equal(typeof w, "string", `${lvl.id} pool holds word strings`);
      assert.ok(inv.has(w), `${lvl.id} word "${w}" is in the inventory`);
    }
    assert.ok(typeof lvl.artId === "string" && lvl.artId.length > 0);
  }
});

test("AC-K1.1/K1.2: every level's goal is 10 and every pool has >= 10 words", () => {
  const levels = all();
  for (const lvl of levels) {
    assert.equal(lvl.goal, 10, `${lvl.id} goal === 10 (min(10, poolSize))`);
    assert.ok(
      lvl.pool().length >= 10,
      `${lvl.id} pool has ${lvl.pool().length} words (need >= 10)`
    );
  }
});

test("AC-J3.1: strict 2→3→4 length ordering — no higher-count band precedes a lower-count one", () => {
  const levels = all();
  const entries = inventoryEntries();

  const syllCountOf = (lvl) => {
    const w = lvl.pool()[0];
    const entry = entries.find((e) => e.word === w);
    return entry ? entry.syllableCount : 0;
  };
  const counts = levels.map(syllCountOf);

  // counts must be non-decreasing across the whole chain (2…2,3…3,4…4).
  for (let i = 1; i < counts.length; i++) {
    assert.ok(
      counts[i] >= counts[i - 1],
      `band ${levels[i].id} (count ${counts[i]}) must not precede count ${counts[i - 1]}`
    );
  }

  // (b) within the same syllable count, open bands precede especiales and the
  //     open family-tier is non-decreasing.
  function bandProfile(lvl) {
    const pool = lvl.pool();
    const es = entries.filter((e) => pool.includes(e.word));
    const special = es.some(
      (e) =>
        hardestConsonantTier(e.parts) === 4 ||
        hasDigraph(e.parts) ||
        hasClosedSyllable(e.parts)
    );
    const minTier = Math.min(...es.map((e) => hardestConsonantTier(e.parts)));
    return { special, minTier };
  }

  for (let i = 1; i < levels.length; i++) {
    if (counts[i] !== counts[i - 1]) continue; // only compare within a count
    const prev = bandProfile(levels[i - 1]);
    const cur = bandProfile(levels[i]);
    assert.ok(
      !(prev.special && !cur.special),
      `${levels[i - 1].id} (especiales) precedes open band ${levels[i].id}`
    );
    if (!prev.special && !cur.special) {
      assert.ok(
        cur.minTier >= prev.minTier,
        `open band ${levels[i].id} (tier ${cur.minTier}) precedes lower tier ${prev.minTier}`
      );
    }
  }
});

test("AC-J3.2: at least one 4-syllable band (pal-4-*) exists with a non-empty pool", () => {
  const levels = all();
  const fourBands = levels.filter((l) => l.id.startsWith("pal-4-"));
  assert.ok(fourBands.length >= 1, "a pal-4-* band exists");
  const entries = inventoryEntries();
  for (const b of fourBands) {
    const pool = b.pool();
    assert.ok(pool.length > 0, `${b.id} pool non-empty`);
    for (const w of pool) {
      const e = entries.find((x) => x.word === w);
      assert.ok(e && e.syllableCount === 4, `${b.id} word "${w}" is 4-syllable`);
    }
  }
});

test("AC-I1.7: within the open bands of a count, expectedTierKey is easiest-first", () => {
  // The pedagogy (expectedTierKey = [tier, typeRank, length, word]) governs the
  // ORDER OF THE OPEN BANDS: a higher-tier open family must not precede a
  // strictly-lower-tier open family of the same syllable count. (The especiales
  // bands are "last" by type, checked in the I1.3/I1.7 test above — their words
  // can carry a low-tier-but-closed key, so they are excluded here.)
  const levels = all();
  const invById = new Map(inventoryEntries().map((e) => [e.word, e]));
  const keyFor = (word) => {
    const e = invById.get(word);
    return expectedTierKey({ word: e.word, parts: e.parts });
  };
  const minTierOf = (words) => Math.min(...words.map((w) => keyFor(w)[0]));
  const syllOf = (words) => invById.get(words[0]).syllableCount;
  const isOpenBand = (lvl) =>
    lvl.pool().every((w) => {
      const e = invById.get(w);
      return (
        hardestConsonantTier(e.parts) !== 4 &&
        !hasDigraph(e.parts) &&
        !hasClosedSyllable(e.parts)
      );
    });

  const openBands = levels.filter(isOpenBand);
  for (let i = 1; i < openBands.length; i++) {
    const prev = openBands[i - 1];
    const cur = openBands[i];
    if (syllOf(prev.pool()) !== syllOf(cur.pool())) continue; // compare within a count
    assert.ok(
      minTierOf(cur.pool()) >= minTierOf(prev.pool()),
      `open band ${cur.id} (min tier ${minTierOf(cur.pool())}) precedes lower-tier ${prev.id}`
    );
  }

  // FAILS-guard: a digraph/3-syll band must never sit before the open tier-1
  // band — assert the first band is 2-syllable open tier-1.
  const first = levels[0];
  assert.ok(isOpenBand(first), "first band is open");
  assert.equal(syllOf(first.pool()), 2, "first band is 2-syllable");
  assert.equal(minTierOf(first.pool()), 1, "first band is tier-1");
});

test("byId + firstLevelId resolve correctly", () => {
  assert.equal(firstLevelId(), all()[0].id);
  assert.equal(byId(firstLevelId()).id, firstLevelId());
  assert.equal(byId("nope"), null);
  // first level is a 2-syllable, tier-1, open band
  assert.equal(firstLevelId(), "pal-2-abiertas-1");
});

test("nextUnlock returns the following level, null on the last", () => {
  const ids = all().map((l) => l.id);
  assert.equal(nextUnlock(ids[0]), ids[1]);
  assert.equal(nextUnlock(ids[ids.length - 1]), null);
  assert.equal(nextUnlock("nope"), null);
});

test("isUnlocked: first level always unlocked; others need prior completion", () => {
  const s = freshState();
  const ids = all().map((l) => l.id);
  assert.equal(isUnlocked(s, ids[0]), true);
  assert.equal(isUnlocked(s, ids[1]), false);
});

test("unlock chain intact: completing each level unlocks exactly the next", () => {
  const s = freshState();
  const ids = all().map((l) => l.id);
  for (let i = 0; i < ids.length - 1; i++) {
    assert.equal(isUnlocked(s, ids[i]), true, `${ids[i]} should be reachable`);
    assert.equal(isUnlocked(s, ids[i + 1]), false, `${ids[i + 1]} locked before completing ${ids[i]}`);
    completeLevel(s, ids[i], 3);
    assert.equal(isUnlocked(s, ids[i + 1]), true, `${ids[i + 1]} unlocks after ${ids[i]}`);
  }
});

test("completeLevel marks completed, records bestStars, unlocks exactly the next", () => {
  const s = freshState();
  const ids = all().map((l) => l.id);
  completeLevel(s, ids[0], 4);
  assert.equal(s.levels[ids[0]].completed, true);
  assert.equal(s.levels[ids[0]].bestStars, 4);
  assert.equal(isUnlocked(s, ids[1]), true);
  assert.equal(isUnlocked(s, ids[2]), false);
});

test("completeLevel keeps the best star count across replays", () => {
  const s = freshState();
  const ids = all().map((l) => l.id);
  completeLevel(s, ids[0], 5);
  completeLevel(s, ids[0], 2); // worse replay
  assert.equal(s.levels[ids[0]].bestStars, 5);
});

test("mapState marks locked/unlocked/completed consistently", () => {
  const s = freshState();
  const ids = all().map((l) => l.id);
  completeLevel(s, ids[0], 3);
  const map = mapState(s);
  const first = map.find((m) => m.id === ids[0]);
  const second = map.find((m) => m.id === ids[1]);
  const third = map.find((m) => m.id === ids[2]);
  assert.equal(first.completed, true);
  assert.equal(first.unlocked, true);
  assert.equal(second.unlocked, true);
  assert.equal(second.completed, false);
  assert.equal(third.unlocked, false);
  // every map node is a word node
  for (const m of map) assert.equal(m.type, "word");
});
