// logic.test.js — framework-free unit checks for pure logic (Node's node:test).
// Run with:  node --test "app/js/**/*.test.js"
//
// Only pure, browser-independent logic is covered here. SpeechRecognition /
// SpeechSynthesis, PWA install, offline cache, and visual/UI acceptance are
// browser-only and are verified manually in a browser.

import { test } from "node:test";
import assert from "node:assert/strict";

import { generate, pickRandom, cvPool, EXTRA_POOLS, extraPoolIds } from "./syllables.js";
import { normalize, classify } from "./speech.js";

// ---------------------------------------------------------------------------
// syllables — carried forward + new pools
// ---------------------------------------------------------------------------

test("generate('facil') produces 5 consonants x 5 vowels = 25 CV syllables", () => {
  const pool = generate("facil");
  assert.equal(pool.length, 25);
  for (const s of pool) assert.match(s, /^[A-Z][a-z]$/);
  assert.ok(pool.includes("Pa"));
  assert.ok(pool.includes("Se"));
  assert.ok(pool.includes("Tu"));
});

test("generate('normal') produces 11 consonants x 5 vowels = 55 syllables", () => {
  const pool = generate("normal");
  assert.equal(pool.length, 55);
  assert.ok(pool.includes("Da"));
  assert.ok(pool.includes("Ri"));
  assert.ok(pool.includes("Cu"));
  for (const s of generate("facil")) assert.ok(pool.includes(s), `normal should include ${s}`);
});

test("generate defaults to 'facil' for unknown difficulty", () => {
  assert.equal(generate("whatever").length, 25);
});

test("cvPool builds 5 title-cased CV syllables for a consonant", () => {
  assert.deepEqual(cvPool("p"), ["Pa", "Pe", "Pi", "Po", "Pu"]);
  assert.deepEqual(cvPool("d"), ["Da", "De", "Di", "Do", "Du"]);
});

test("extra pools: digraphs & closed syllables exist and are title-cased", () => {
  assert.ok(EXTRA_POOLS.ch.includes("Cha"));
  assert.ok(EXTRA_POOLS.ll.includes("Lle"));
  assert.ok(EXTRA_POOLS.rr.includes("Rro"));
  assert.ok(EXTRA_POOLS.enye.includes("Ña"));
  assert.ok(EXTRA_POOLS.qu.includes("Que") && EXTRA_POOLS.qu.includes("Qui"));
  assert.ok(EXTRA_POOLS.gu.includes("Gue") && EXTRA_POOLS.gu.includes("Gui"));
  assert.ok(EXTRA_POOLS.closed.includes("Pan"));
  for (const id of extraPoolIds()) {
    for (const s of EXTRA_POOLS[id]) assert.match(s, /^[A-ZÑ]/);
  }
});

test("generate(poolId) returns the named extra pool; 'all' includes extras", () => {
  assert.deepEqual(generate("ch"), EXTRA_POOLS.ch);
  const all = generate("all");
  assert.ok(all.length > generate("normal").length);
  assert.ok(all.includes("Cha"));
  assert.ok(all.includes("Pan"));
});

test("pickRandom always returns a pool member and never the exclude", () => {
  const pool = generate("normal");
  let cur = pool[0];
  for (let i = 0; i < 1000; i++) {
    const next = pickRandom(pool, cur);
    assert.ok(pool.includes(next));
    assert.notEqual(next, cur);
    cur = next;
  }
  assert.equal(pickRandom(["Pa"], "Pa"), "Pa");
  assert.throws(() => pickRandom([]));
});

// ---------------------------------------------------------------------------
// speech — normalize (carried) + classify (new, child-lenient)
// ---------------------------------------------------------------------------

test("normalize lowercases, strips accents/punctuation, trims, collapses ws", () => {
  assert.equal(normalize("¡Pá!"), "pa");
  assert.equal(normalize(" Se "), "se");
  assert.equal(normalize("TÉ."), "te");
  assert.equal(normalize("¿Mí?"), "mi");
  assert.equal(normalize("  pa    pe  "), "pa pe");
  assert.equal(normalize(null), "");
  assert.equal(normalize(undefined), "");
});

test("classify: exact (accent/case-insensitive) is a match", () => {
  assert.equal(classify("Pa", "pa"), "match");
  assert.equal(classify("Pa", "¡Pá!"), "match");
  assert.equal(classify("Te", "té"), "match");
});

test("classify: syllable inside a short phrase still matches", () => {
  assert.equal(classify("Pa", "la pa"), "match");
  assert.equal(classify("Se", "dice se"), "match");
});

test("classify: close-vowel leniency counts as match", () => {
  // e/i and o/u are interchangeable for young voices
  assert.equal(classify("Pe", "pi"), "match");
  assert.equal(classify("Lo", "lu"), "match");
});

test("classify: voicing / common consonant swaps are NEAR, not match", () => {
  assert.equal(classify("Pa", "ba"), "near"); // p/b voicing
  assert.equal(classify("Ta", "da"), "near"); // t/d voicing
  assert.equal(classify("La", "ra"), "near"); // l/r swap
});

test("classify: clearly different is a miss", () => {
  assert.equal(classify("Pa", "lu"), "miss");
  assert.equal(classify("Se", "mo"), "miss");
});

test("classify: empty / silent transcript is always a miss", () => {
  assert.equal(classify("Pa", ""), "miss");
  assert.equal(classify("Pa", null), "miss");
  assert.equal(classify("", "pa"), "miss");
});

test("classify: digraphs treated as one sound; word match works", () => {
  assert.equal(classify("Cha", "cha"), "match");
  assert.equal(classify("pato", "pato"), "match");
  assert.equal(classify("pato", "el pato"), "match");
});
