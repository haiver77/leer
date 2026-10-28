// rewards.test.js — pure checks for stars / milestones / stickers.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  starsForCorrect,
  isMilestone,
  stickerForLevel,
  stickerById,
  stickerBook,
  onCorrect,
  onLevelComplete,
  STICKER_CATALOG,
  MILESTONE_EVERY,
} from "./rewards.js";
import { all as allLevels } from "./levels.js";

test("starsForCorrect awards >= 1 star per correct answer", () => {
  assert.ok(starsForCorrect(1) >= 1);
  assert.equal(starsForCorrect(3), 3 * starsForCorrect(1));
  assert.equal(starsForCorrect(0), 0);
});

test("isMilestone fires every Nth correct and not in between", () => {
  assert.equal(isMilestone(0), false);
  assert.equal(isMilestone(MILESTONE_EVERY), true);
  assert.equal(isMilestone(MILESTONE_EVERY - 1), false);
  assert.equal(isMilestone(MILESTONE_EVERY * 2), true);
});

test("onCorrect returns stars + milestone flag at the boundary", () => {
  const r1 = onCorrect(1);
  assert.ok(r1.stars >= 1);
  assert.equal(r1.milestone, false);
  const r5 = onCorrect(MILESTONE_EVERY);
  assert.equal(r5.milestone, true);
});

test("every level has a sticker in the catalog", () => {
  for (const lvl of allLevels()) {
    const stk = stickerForLevel(lvl.id);
    assert.ok(stk, `level ${lvl.id} should grant a sticker`);
    assert.ok(stickerById(stk), `sticker ${stk} should exist in catalog`);
  }
});

test("catalog entries are unique by id and have art", () => {
  const ids = STICKER_CATALOG.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, "sticker ids unique");
  for (const s of STICKER_CATALOG) {
    assert.ok(s.artId && s.title, `${s.id} has art + title`);
  }
});

test("onLevelComplete grants a new sticker once, not twice", () => {
  const lvlId = allLevels()[0].id;
  const first = onLevelComplete(lvlId, []);
  assert.ok(first.stickerId);
  assert.equal(first.isNew, true);
  const again = onLevelComplete(lvlId, [first.stickerId]);
  assert.equal(again.isNew, false);
});

test("stickerBook marks earned vs not-earned across the full catalog", () => {
  const earned = [STICKER_CATALOG[0].id, STICKER_CATALOG[2].id];
  const book = stickerBook(earned);
  assert.equal(book.length, STICKER_CATALOG.length);
  assert.equal(book.find((b) => b.id === STICKER_CATALOG[0].id).earned, true);
  assert.equal(book.find((b) => b.id === STICKER_CATALOG[1].id).earned, false);
});
