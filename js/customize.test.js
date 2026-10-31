// customize.test.js — pure-logic checks for Lalo's customization catalog +
// unlock rules (iteration 9, D1 / AC-M1.6). No DOM/storage.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  COLORS,
  ACCESSORIES,
  defaultSelection,
  colorById,
  accessoryById,
  isUnlocked,
  unlockedItems,
  sanitizeSelection,
} from "./customize.js";
import { freshState } from "./progress.js";

test("defaultSelection is a valid, unlocked selection for a first-run state", () => {
  const sel = defaultSelection();
  assert.equal(typeof sel.color, "string");
  assert.ok(Array.isArray(sel.accessories));
  assert.equal(sel.accessories.length, 0);
  const fresh = freshState();
  assert.ok(isUnlocked(fresh, sel.color), "the default color is unlocked at first run");
  // sanitizing the default against a fresh state is a no-op
  assert.deepEqual(sanitizeSelection(fresh, sel), { color: sel.color, accessories: [] });
});

test("AC-M1.3: a base set of colors + at least one accessory is unlocked at first run", () => {
  const fresh = freshState();
  const u = unlockedItems(fresh);
  assert.ok(u.colors.length >= 2, `base colors unlocked: ${u.colors.length}`);
  assert.ok(u.accessories.length >= 1, "at least one accessory unlocked at first run");
  // every base item really is a base-type unlock
  for (const c of COLORS) {
    if (c.unlock.base) assert.ok(u.colors.includes(c.id));
  }
});

test("AC-M1.3: crossing a star milestone unlocks the expected star-gated item", () => {
  const fresh = freshState();
  // rose unlocks at 10 stars
  const rose = colorById("rose");
  assert.ok(rose && rose.unlock.stars === 10);
  assert.ok(!isUnlocked(fresh, "rose"), "rose locked at 0 stars");
  const after = { ...fresh, stars: 10 };
  assert.ok(isUnlocked(after, "rose"), "rose unlocked at 10 stars");
  // glasses accessory unlocks at 15 stars
  assert.ok(!isUnlocked(after, "glasses"), "glasses still locked at 10 stars");
  assert.ok(isUnlocked({ ...fresh, stars: 15 }, "glasses"), "glasses unlocked at 15 stars");
});

test("AC-M1.3: completing a level unlocks a level-gated item", () => {
  const fresh = freshState();
  const lime = colorById("lime");
  assert.ok(lime && lime.unlock.level === "pal-2-abiertas-2");
  assert.ok(!isUnlocked(fresh, "lime"), "lime locked before the level is complete");
  const after = {
    ...fresh,
    levels: { "pal-2-abiertas-2": { unlocked: true, completed: true, bestStars: 3 } },
  };
  assert.ok(isUnlocked(after, "lime"), "lime unlocked once pal-2-abiertas-2 is completed");
});

test("AC-M1.6: sanitizeSelection drops locked + unknown items, keeps unlocked", () => {
  const fresh = freshState();
  const u = unlockedItems(fresh);
  const unlockedAcc = u.accessories[0];
  const sel = {
    color: "grape", // locked at first run (needs 25 stars)
    accessories: [unlockedAcc, "glasses", "does-not-exist"], // mix of unlocked/locked/unknown
  };
  const clean = sanitizeSelection(fresh, sel);
  // locked color falls back to an unlocked color (the default is base-unlocked)
  assert.ok(u.colors.includes(clean.color), "sanitized color is unlocked");
  assert.notEqual(clean.color, "grape", "locked color was dropped");
  assert.ok(clean.accessories.includes(unlockedAcc), "unlocked accessory kept");
  assert.ok(!clean.accessories.includes("glasses"), "locked accessory dropped");
  assert.ok(!clean.accessories.includes("does-not-exist"), "unknown accessory dropped");
});

test("previously unlocked items never re-lock as progress grows", () => {
  const low = { ...freshState(), stars: 10 };
  const high = { ...freshState(), stars: 100 };
  const uLow = unlockedItems(low);
  const uHigh = unlockedItems(high);
  for (const id of uLow.colors) assert.ok(uHigh.colors.includes(id), `${id} stays unlocked`);
  for (const id of uLow.accessories) assert.ok(uHigh.accessories.includes(id), `${id} stays unlocked`);
  assert.ok(uHigh.colors.length >= uLow.colors.length);
});

test("accessory catalog markup stays within the mascot viewBox space (no external refs)", () => {
  for (const a of ACCESSORIES) {
    assert.equal(typeof a.markup, "string");
    assert.ok(a.markup.includes("lalo-acc"), `${a.id} tagged as an accessory layer`);
    assert.ok(!/viewBox/.test(a.markup), `${a.id} must not declare its own viewBox`);
  }
  assert.equal(accessoryById("bow").id, "bow");
  assert.equal(accessoryById("nope"), null);
});
