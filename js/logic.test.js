// logic.test.js — framework-free unit checks for pure logic (Node's node:test).
// Run with:  node --test "app/js/**/*.test.js"
//
// Only pure, browser-independent logic is covered here. SpeechRecognition /
// SpeechSynthesis, PWA install, offline cache, and visual/UI acceptance are
// browser-only and are verified manually in a browser.

import { test } from "node:test";
import assert from "node:assert/strict";

import { pickRandom, titleCase } from "./syllables.js";
import { normalize, classify } from "./speech.js";

// ---------------------------------------------------------------------------
// syllables — SUPERSEDED in iteration 5 (D1). The CV matrix / EXTRA_POOLS /
// generate() practice pools are gone; the module is trimmed to pickRandom +
// titleCase, so only those remain under test here.
// ---------------------------------------------------------------------------

test("titleCase capitalizes the first letter, lowercases the rest", () => {
  assert.equal(titleCase("pa"), "Pa");
  assert.equal(titleCase("MESA"), "Mesa");
  assert.equal(titleCase(""), "");
});

test("pickRandom always returns a pool member and never the exclude", () => {
  const pool = ["pato", "mesa", "lupa", "gato", "casa", "rana", "sopa"];
  let cur = pool[0];
  for (let i = 0; i < 1000; i++) {
    const next = pickRandom(pool, cur);
    assert.ok(pool.includes(next));
    assert.notEqual(next, cur);
    cur = next;
  }
  assert.equal(pickRandom(["pato"], "pato"), "pato");
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
