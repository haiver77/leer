// levels.test.js — pure checks for level definitions + unlock rules.

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

test("all() returns ordered levels: islands → mixto → palabras → digrafos → cerradas", () => {
  const ids = all().map((l) => l.id);
  assert.ok(ids[0].startsWith("isla-"));
  assert.ok(ids.includes("mixto"));
  assert.ok(ids.includes("palabras"));
  assert.ok(ids.includes("digrafos"));
  assert.ok(ids.includes("cerradas"));
  // ordering: mixto before palabras before digrafos before cerradas
  assert.ok(ids.indexOf("mixto") < ids.indexOf("palabras"));
  assert.ok(ids.indexOf("palabras") < ids.indexOf("digrafos"));
  assert.ok(ids.indexOf("digrafos") < ids.indexOf("cerradas"));
});

test("every level exposes a non-empty pool and a positive goal", () => {
  for (const lvl of all()) {
    const pool = lvl.pool();
    assert.ok(Array.isArray(pool) && pool.length > 0, `${lvl.id} pool`);
    assert.ok(lvl.goal > 0, `${lvl.id} goal`);
    assert.ok(typeof lvl.artId === "string" && lvl.artId.length > 0);
  }
});

test("byId + firstLevelId resolve correctly", () => {
  assert.equal(firstLevelId(), all()[0].id);
  assert.equal(byId(firstLevelId()).id, firstLevelId());
  assert.equal(byId("nope"), null);
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

test("completeLevel marks completed, records bestStars, unlocks exactly the next", () => {
  const s = freshState();
  const ids = all().map((l) => l.id);
  completeLevel(s, ids[0], 4);
  assert.equal(s.levels[ids[0]].completed, true);
  assert.equal(s.levels[ids[0]].bestStars, 4);
  // next unlocked, but the one after is NOT
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
});
