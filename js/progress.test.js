// progress.test.js — pure-logic checks for the mastery + persistence model.
// localStorage access is NOT tested here (browser-only); these cover the pure
// aggregation helpers over a plain state object.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  freshState,
  migrate,
  recordSeen,
  recordAttempt,
  masteredCount,
  troubleItems,
  localDateKey,
  ensureDailyGoal,
  bumpDailyGoal,
  MASTERY_THRESHOLD,
  DEFAULT_DAILY_TARGET,
} from "./progress.js";

test("freshState has a complete v2 shape", () => {
  const s = freshState();
  assert.equal(s.version, 2);
  assert.equal(s.difficulty, "facil");
  assert.equal(s.onboardingDone, false);
  assert.equal(s.stars, 0);
  assert.deepEqual(s.items, {});
  assert.deepEqual(s.stickers, []);
  assert.equal(s.dailyGoal.target, DEFAULT_DAILY_TARGET);
});

test("AC-K7.2/K3.3: freshState defaults autoRead ON and voicePref null", () => {
  const s = freshState();
  assert.equal(s.autoRead, true, "autoRead defaults ON");
  assert.equal(s.voicePref, null, "voicePref defaults to Automática (null)");
});

test("AC-K7.2/K3.3: migrate fills autoRead + voicePref for older v2 states", () => {
  // An older v2 blob with neither key set → both default in place.
  const v2 = migrate({ version: 2, stars: 3, difficulty: "normal" });
  assert.equal(v2.autoRead, true);
  assert.equal(v2.voicePref, null);
  assert.equal(v2.stars, 3, "other fields are undisturbed");
  assert.equal(v2.difficulty, "normal");
  // A saved value is preserved, not overwritten.
  const saved = migrate({ version: 2, autoRead: false, voicePref: "urn:voice:x" });
  assert.equal(saved.autoRead, false);
  assert.equal(saved.voicePref, "urn:voice:x");
  // A v1 blob also gets the defaults.
  const fromV1 = migrate({ difficulty: "normal", bestStreak: 4 });
  assert.equal(fromV1.autoRead, true);
  assert.equal(fromV1.voicePref, null);
});

test("migrate: v1 blob preserves difficulty + bestStreak, defaults the rest", () => {
  const v2 = migrate({ difficulty: "normal", bestStreak: 7 });
  assert.equal(v2.version, 2);
  assert.equal(v2.difficulty, "normal");
  assert.equal(v2.bestStreak, 7);
  assert.equal(v2.stars, 0);
  assert.deepEqual(v2.items, {});
});

test("migrate: null / garbage yields a clean fresh state", () => {
  assert.equal(migrate(null).version, 2);
  assert.equal(migrate(undefined).version, 2);
  assert.equal(migrate(42).version, 2);
});

test("migrate: partial v2 is filled with defaults and item records normalised", () => {
  const v2 = migrate({ version: 2, stars: 5, items: { Pa: { correct: 2 } } });
  assert.equal(v2.stars, 5);
  // missing fields on the item record are filled
  assert.equal(v2.items.Pa.correct, 2);
  assert.equal(v2.items.Pa.seen, 0);
  assert.equal(v2.items.Pa.mastered, false);
  assert.equal(v2.dailyGoal.target, DEFAULT_DAILY_TARGET);
});

test("recordSeen increments seen + sets lastSeen", () => {
  const s = freshState();
  recordSeen(s, "Pa", 1000);
  recordSeen(s, "Pa", 2000);
  assert.equal(s.items.Pa.seen, 2);
  assert.equal(s.items.Pa.lastSeen, 2000);
});

test("recordAttempt: verified-correct counts toward mastery; self-confirm does not", () => {
  const s = freshState();
  // self-confirmed correct 5x → correct rises, verified stays 0, never mastered
  for (let i = 0; i < 5; i++) recordAttempt(s, "Ma", { verified: false, correct: true });
  assert.equal(s.items.Ma.correct, 5);
  assert.equal(s.items.Ma.verifiedCorrect, 0);
  assert.equal(s.items.Ma.mastered, false);
});

test("recordAttempt: item flips to mastered at the verified threshold", () => {
  const s = freshState();
  for (let i = 0; i < MASTERY_THRESHOLD; i++) {
    recordAttempt(s, "Pa", { verified: true, correct: true });
  }
  assert.equal(s.items.Pa.verifiedCorrect, MASTERY_THRESHOLD);
  assert.equal(s.items.Pa.mastered, true);
});

test("recordAttempt: a miss increments attempted but not correct", () => {
  const s = freshState();
  recordAttempt(s, "Se", { verified: false, correct: false });
  assert.equal(s.items.Se.attempted, 1);
  assert.equal(s.items.Se.correct, 0);
});

test("masteredCount counts only mastered items within the given ids", () => {
  const s = freshState();
  for (let i = 0; i < MASTERY_THRESHOLD; i++) recordAttempt(s, "Pa", { verified: true, correct: true });
  for (let i = 0; i < MASTERY_THRESHOLD; i++) recordAttempt(s, "Ma", { verified: true, correct: true });
  const { mastered, total } = masteredCount(s, ["Pa", "Ma", "Se", "Lo"]);
  assert.equal(mastered, 2);
  assert.equal(total, 4);
});

test("troubleItems returns lowest-ratio items with attempts >= k", () => {
  const s = freshState();
  // Pa: 1/4 correct (bad), Se: 3/4 (ok-ish), Lo: 1/1 perfect (excluded), Mi: 1 attempt (excluded by k=2)
  recordAttempt(s, "Pa", { correct: true });
  for (let i = 0; i < 3; i++) recordAttempt(s, "Pa", { correct: false });
  for (let i = 0; i < 3; i++) recordAttempt(s, "Se", { correct: true });
  recordAttempt(s, "Se", { correct: false });
  recordAttempt(s, "Lo", { correct: true });
  recordAttempt(s, "Mi", { correct: false });

  const trouble = troubleItems(s, 2, 5);
  assert.ok(trouble.includes("Pa"));
  assert.ok(trouble.includes("Se"));
  assert.ok(!trouble.includes("Lo"), "perfect items excluded");
  assert.ok(!trouble.includes("Mi"), "under-k items excluded");
  assert.equal(trouble[0], "Pa", "worst ratio first");
});

test("localDateKey formats YYYY-MM-DD in local time", () => {
  const key = localDateKey(new Date(2024, 0, 5)); // Jan 5 2024
  assert.equal(key, "2024-01-05");
});

test("ensureDailyGoal resets progress on a new local day, keeps target", () => {
  const s = freshState();
  s.dailyGoal = { date: "2024-01-01", progress: 6, target: 10 };
  ensureDailyGoal(s, new Date(2024, 0, 2));
  assert.equal(s.dailyGoal.date, "2024-01-02");
  assert.equal(s.dailyGoal.progress, 0);
  assert.equal(s.dailyGoal.target, 10);
});

test("ensureDailyGoal keeps progress on the same day", () => {
  const s = freshState();
  const today = new Date(2024, 5, 10);
  s.dailyGoal = { date: localDateKey(today), progress: 4, target: 10 };
  ensureDailyGoal(s, today);
  assert.equal(s.dailyGoal.progress, 4);
});

test("bumpDailyGoal advances toward target and caps there", () => {
  const s = freshState();
  const today = new Date(2024, 5, 10);
  s.dailyGoal = { date: localDateKey(today), progress: 0, target: 3 };
  bumpDailyGoal(s, 1, today);
  bumpDailyGoal(s, 1, today);
  bumpDailyGoal(s, 1, today);
  bumpDailyGoal(s, 1, today); // over target
  assert.equal(s.dailyGoal.progress, 3);
});

// ---- Iteration 9: lalo customization + music (AC-M1 / AC-M8) ---------------

import { defaultSelection } from "./customize.js";

test("AC-M1 / AC-M8: freshState defaults music OFF and lalo to the default selection", () => {
  const s = freshState();
  assert.equal(s.music, false, "music defaults OFF");
  assert.deepEqual(s.lalo, defaultSelection(), "lalo equals customize.defaultSelection()");
});

test("AC-M1/M8: migrate fills + validates lalo/music without disturbing other settings", () => {
  // older v2 blob with neither key → both default, other settings preserved
  const v2 = migrate({
    version: 2,
    stars: 4,
    autoRead: false,
    voicePref: "urn:voice:x",
    wordsPerLevel: 15,
  });
  assert.equal(v2.music, false, "music defaults OFF when missing");
  assert.deepEqual(v2.lalo, defaultSelection(), "lalo defaults when missing");
  assert.equal(v2.autoRead, false, "autoRead undisturbed");
  assert.equal(v2.voicePref, "urn:voice:x", "voicePref undisturbed");
  assert.equal(v2.wordsPerLevel, 15, "wordsPerLevel undisturbed");

  // a saved valid lalo + music are preserved
  const saved = migrate({
    version: 2,
    music: true,
    lalo: { color: "rose", accessories: ["bow", "hat"] },
  });
  assert.equal(saved.music, true);
  assert.deepEqual(saved.lalo, { color: "rose", accessories: ["bow", "hat"] });
});

test("AC-M1: migrate replaces a structurally invalid stored lalo with the default", () => {
  assert.deepEqual(migrate({ version: 2, lalo: "oops" }).lalo, defaultSelection());
  assert.deepEqual(migrate({ version: 2, lalo: 42 }).lalo, defaultSelection());
  // partial/garbage shapes coerce to a valid selection
  const coerced = migrate({ version: 2, lalo: { color: 5, accessories: "x" } });
  assert.equal(coerced.lalo.color, defaultSelection().color);
  assert.deepEqual(coerced.lalo.accessories, []);
  // non-string accessory entries are stripped
  const stripped = migrate({ version: 2, lalo: { color: "mint", accessories: ["bow", 7, null] } });
  assert.deepEqual(stripped.lalo, { color: "mint", accessories: ["bow"] });
  // a non-boolean music coerces to the default OFF
  assert.equal(migrate({ version: 2, music: "yes" }).music, false);
});
