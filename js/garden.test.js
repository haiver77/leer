// garden.test.js — pure-logic checks for the growing "Jardín de Lalo"
// (iteration 9, D4 / AC-M4.4). No DOM/storage.

import { test } from "node:test";
import assert from "node:assert/strict";

import { GARDEN_CATALOG, gardenState, unlockedCount, totalCount } from "./garden.js";
import { MILESTONE_EVERY } from "./rewards.js";
import { freshState } from "./progress.js";
import * as art from "./art.js";

test("first-run shows a modest base garden (>=1 element, not everything)", () => {
  const fresh = freshState();
  const n = unlockedCount(fresh);
  assert.ok(n >= 1, `base garden has at least one element: ${n}`);
  assert.ok(n < totalCount(), "the garden is not fully unlocked at first run");
});

test("gardenState returns every catalog element, ordered + stable, each flagged", () => {
  const state = gardenState(freshState());
  assert.equal(state.length, GARDEN_CATALOG.length);
  state.forEach((e, i) => {
    assert.equal(e.id, GARDEN_CATALOG[i].id, "order matches the catalog");
    assert.equal(typeof e.unlocked, "boolean");
    assert.equal(typeof e.artId, "string");
  });
});

test("AC-M4.2: crossing a star milestone reveals the expected element", () => {
  const fresh = freshState();
  const flowerRed = GARDEN_CATALOG.find((e) => e.id === "flower-red");
  assert.ok(flowerRed && flowerRed.unlock.stars === MILESTONE_EVERY * 1);

  const before = gardenState(fresh).find((e) => e.id === "flower-red");
  assert.equal(before.unlocked, false, "flower-red locked at 0 stars");

  const after = gardenState({ ...fresh, stars: MILESTONE_EVERY });
  assert.equal(
    after.find((e) => e.id === "flower-red").unlocked,
    true,
    "flower-red unlocked after one milestone"
  );
});

test("AC-M4.2: completing the anchor level reveals the level-gated element", () => {
  const fresh = freshState();
  const after = gardenState({
    ...fresh,
    levels: { "pal-2-abiertas-1": { unlocked: true, completed: true, bestStars: 2 } },
  });
  assert.equal(after.find((e) => e.id === "star").unlocked, true);
});

test("AC-M4.3: elements keep unlocking past the map via accruing stars", () => {
  // a high star total (as from replaying completed levels) unlocks more
  const low = unlockedCount({ ...freshState(), stars: MILESTONE_EVERY });
  const high = unlockedCount({ ...freshState(), stars: MILESTONE_EVERY * 20 });
  assert.ok(high > low, "more stars → more garden elements, even after 100% map");
});

test("AC-M4.4: already-unlocked elements never disappear as progress grows", () => {
  const low = gardenState({ ...freshState(), stars: MILESTONE_EVERY * 2 });
  const high = gardenState({ ...freshState(), stars: MILESTONE_EVERY * 100 });
  for (const e of low) {
    if (!e.unlocked) continue;
    const later = high.find((x) => x.id === e.id);
    assert.equal(later.unlocked, true, `${e.id} stays unlocked`);
  }
});

test("every garden element's art id resolves in art.js (AC-M4.5)", () => {
  for (const e of GARDEN_CATALOG) {
    assert.ok(art.has(e.artId), `missing garden art ${e.artId} for ${e.id}`);
  }
});
