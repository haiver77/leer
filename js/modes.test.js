// modes.test.js — pure-logic checks for practice-mode selection + option
// generation (iteration 9, D3 / AC-M3.5). No DOM/storage.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  MODES,
  isTextMode,
  pickMode,
  buildOptions,
  missingSyllableChoices,
} from "./modes.js";

test("MODES includes say-it plus the two tap modes", () => {
  assert.ok(MODES.includes("say-it"));
  assert.ok(MODES.includes("pick-word"));
  assert.ok(MODES.includes("missing-syllable"));
});

test("pickMode rotates deterministically: say-it → pick-word → missing-syllable", () => {
  assert.equal(pickMode("lvl", 0), "say-it");
  assert.equal(pickMode("lvl", 1), "pick-word");
  assert.equal(pickMode("lvl", 2), "missing-syllable");
  assert.equal(pickMode("lvl", 3), "say-it");
  assert.equal(pickMode("lvl", 4), "pick-word");
});

test("AC-M3.6: very-young mode always returns the picture-based say-it", () => {
  for (let i = 0; i < 6; i++) {
    assert.equal(pickMode("lvl", i, { veryYoung: true }), "say-it");
    assert.ok(!isTextMode(pickMode("lvl", i, { veryYoung: true })));
  }
});

test("isTextMode flags the tap modes as text-dependent", () => {
  assert.equal(isTextMode("say-it"), false);
  assert.equal(isTextMode("pick-word"), true);
  assert.equal(isTextMode("missing-syllable"), true);
});

test("AC-M3.5: buildOptions returns N distinct options incl. the target, only from the pool", () => {
  const pool = ["pato", "mesa", "sopa", "lupa", "casa"];
  for (let trial = 0; trial < 50; trial++) {
    const opts = buildOptions("pato", pool, 3);
    assert.equal(opts.length, 3, "three options");
    assert.ok(opts.includes("pato"), "target present");
    assert.equal(new Set(opts).size, 3, "no duplicates");
    for (const o of opts) assert.ok(pool.includes(o), `${o} is from the pool`);
  }
});

test("buildOptions never exceeds the pool's distinct size", () => {
  const opts = buildOptions("pato", ["pato", "mesa"], 3);
  assert.ok(opts.length <= 2);
  assert.ok(opts.includes("pato"));
});

test("AC-M3.5: missingSyllableChoices blanks exactly one real syllable + offers the correct one", () => {
  const parts = ["Pe", "Lo", "Ta"];
  const otherParts = ["Ma", "Sa", "To", "Ca", "Lo", "Ni"];
  for (let trial = 0; trial < 50; trial++) {
    const c = missingSyllableChoices("pelota", parts, 3, otherParts);
    assert.ok(c.blankIndex >= 0 && c.blankIndex < parts.length, "a real index is blanked");
    assert.equal(c.correct, parts[c.blankIndex], "the correct syllable matches the blank");
    assert.ok(c.options.includes(c.correct), "the correct option is offered");
    assert.equal(new Set(c.options).size, c.options.length, "no duplicate options");
    assert.ok(c.options.length <= 3);
  }
});

test("missingSyllableChoices degrades gracefully with empty parts", () => {
  const c = missingSyllableChoices("", [], 3, []);
  assert.equal(c.blankIndex, -1);
  assert.deepEqual(c.options, []);
});
