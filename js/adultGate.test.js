// adultGate.test.js — pure checks for the adult-gate challenge logic.

import { test } from "node:test";
import assert from "node:assert/strict";

import { makeChallenge, checkAnswer, answerChoices } from "./adultGate.js";

// deterministic rng for reproducible tests
function seeded(seq) {
  let i = 0;
  return () => seq[i++ % seq.length];
}

test("makeChallenge builds a valid addition prompt", () => {
  const c = makeChallenge(seeded([0, 0])); // a=2, b=2
  assert.equal(c.a, 2);
  assert.equal(c.b, 2);
  assert.equal(c.answer, 4);
  assert.match(c.prompt, /2 \+ 2/);
});

test("checkAnswer accepts the correct number and numeric strings", () => {
  const c = makeChallenge(seeded([0.5, 0.5])); // a=5,b=5 -> 10
  assert.equal(c.answer, 10);
  assert.equal(checkAnswer(c, 10), true);
  assert.equal(checkAnswer(c, "10"), true);
  assert.equal(checkAnswer(c, " 10 "), true);
  assert.equal(checkAnswer(c, 9), false);
  assert.equal(checkAnswer(c, "abc"), false);
  assert.equal(checkAnswer(null, 10), false);
});

test("answerChoices always contains the correct answer and 4 unique positives", () => {
  const c = makeChallenge(seeded([0.3, 0.6])); // deterministic-ish
  const choices = answerChoices(c, seeded([0.1, 0.9, 0.4, 0.7, 0.2, 0.8, 0.5]));
  assert.equal(choices.length, 4);
  assert.equal(new Set(choices).size, 4, "choices unique");
  assert.ok(choices.includes(c.answer), "correct answer present");
  for (const ch of choices) assert.ok(ch > 0, "all positive");
});
