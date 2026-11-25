// praise.test.js — pure checks for adaptive praise + combo tiers.

import { test } from "node:test";
import assert from "node:assert/strict";

import { KINDS, pickPraise, resetPraise, toSpeech, comboTier } from "./praise.js";

test("every kind returns non-empty text and speech", () => {
  resetPraise();
  for (const kind of KINDS) {
    const p = pickPraise({ kind, word: "pato" });
    assert.equal(p.kind, kind);
    assert.ok(p.text.length > 0, kind);
    assert.ok(p.speech.length > 0, kind);
  }
});

test("never repeats the same phrase twice in a row (any rng)", () => {
  resetPraise();
  for (const kind of KINDS) {
    let prev = null;
    for (let i = 0; i < 30; i += 1) {
      const { text } = pickPraise({ kind, word: "sol" }, () => 0); // worst case
      assert.notEqual(text, prev, `${kind} repeated`);
      prev = text;
    }
  }
});

test("{palabra} is substituted and never leaks; absent word is handled", () => {
  resetPraise();
  for (let i = 0; i < 20; i += 1) {
    const a = pickPraise({ kind: "mastered", word: "mariposa" }, () => i / 20);
    assert.ok(!a.text.includes("{"));
    const b = pickPraise({ kind: "mastered" }, () => i / 20);
    assert.ok(!b.text.includes("{") && !b.text.includes("undefined"));
  }
  resetPraise();
  const p = pickPraise({ kind: "mastered", word: "luna" }, () => 0.3);
  assert.ok(p.text.includes("luna") || !p.text.includes("palabra"));
});

test("unknown kind falls back to plain", () => {
  assert.equal(pickPraise({ kind: "nope" }).kind, "plain");
  assert.equal(pickPraise().kind, "plain");
});

test("speech has no emoji and no stray spacing", () => {
  assert.equal(toSpeech("¡Muy bien! 🎉"), "¡Muy bien!");
  assert.equal(toSpeech("¡Listo! ✅"), "¡Listo!");
  assert.equal(toSpeech("¡Increíble! 🌟🌟"), "¡Increíble!");
  for (const kind of KINDS) {
    resetPraise();
    const { speech } = pickPraise({ kind, word: "sol" });
    assert.ok(!/[\p{Extended_Pictographic}]/u.test(speech), speech);
  }
});

test("phrases are short for pre-readers (<= 5 words)", () => {
  for (const kind of KINDS) {
    for (let i = 0; i < 12; i += 1) {
      resetPraise();
      const { speech } = pickPraise({ kind, word: "sol" }, () => i / 12);
      assert.ok(speech.split(/\s+/).length <= 5, speech);
    }
  }
});

test("comboTier thresholds at 3, 5 and 8", () => {
  assert.equal(comboTier(0), 0);
  assert.equal(comboTier(2), 0);
  assert.equal(comboTier(3), 1);
  assert.equal(comboTier(4), 1);
  assert.equal(comboTier(5), 2);
  assert.equal(comboTier(7), 2);
  assert.equal(comboTier(8), 3);
  assert.equal(comboTier(50), 3);
  assert.equal(comboTier(undefined), 0);
  assert.equal(comboTier(-4), 0);
});
