// words.test.js — catalog integrity for the two-syllable word set.

import { test } from "node:test";
import assert from "node:assert/strict";

import { WORDS, forLevel, byWord, partsMatchWord } from "./words.js";

const INTRODUCED = new Set(["p", "m", "s", "t", "l", "d"]);

test("catalog is non-empty and every entry has word, 2 parts, artId", () => {
  assert.ok(WORDS.length >= 5);
  for (const w of WORDS) {
    assert.equal(typeof w.word, "string");
    assert.ok(Array.isArray(w.parts) && w.parts.length === 2, `${w.word} has 2 parts`);
    assert.ok(w.artId && w.artId.startsWith("word-"), `${w.word} has art id`);
  }
});

test("each word's parts concatenate to the word (CV + CV)", () => {
  for (const w of WORDS) {
    assert.ok(partsMatchWord(w), `${w.word} parts should join to the word`);
    for (const part of w.parts) {
      assert.match(part, /^[A-Z][a-z]$/, `${w.word}: part "${part}" is a CV syllable`);
    }
  }
});

test("words only use already-introduced consonants", () => {
  for (const w of WORDS) {
    for (const part of w.parts) {
      const c = part[0].toLowerCase();
      assert.ok(INTRODUCED.has(c), `${w.word}: consonant "${c}" must be introduced`);
    }
  }
});

test("spec example words are present (pato, mesa, lupa, dedo)", () => {
  const set = new Set(WORDS.map((w) => w.word));
  for (const expected of ["pato", "mesa", "lupa", "dedo"]) {
    assert.ok(set.has(expected), `catalog should include ${expected}`);
  }
});

test("forLevel returns a defensive copy; byWord resolves + normalises", () => {
  const list = forLevel("palabras");
  assert.equal(list.length, WORDS.length);
  list[0].parts.push("X"); // mutate the copy
  assert.equal(WORDS[0].parts.length, 2, "original catalog not mutated");
  assert.equal(byWord("PATO").word, "pato");
  assert.equal(byWord("nope"), null);
});

test("word ids are unique", () => {
  const words = WORDS.map((w) => w.word);
  assert.equal(new Set(words).size, words.length);
});
