// rewards.js — reward rules + sticker-book catalog. Pure + testable.
//
// Stars per correct answer, a milestone celebration every N correct, and one
// sticker/badge per level. No DOM, no storage — callers persist via progress.js.

/** Stars awarded per accepted correct answer. */
export const STARS_PER_CORRECT = 1;

/** A milestone celebration fires every Nth correct answer. */
export const MILESTONE_EVERY = 5;

/**
 * Sticker-book catalog. One sticker per level, plus a few milestone stickers.
 * `levelId` links a sticker to the level that grants it (null = milestone).
 * @type {Array<{id: string, title: string, artId: string, levelId: string|null}>}
 */
export const STICKER_CATALOG = [
  { id: "stk-p", title: "Pingüino", artId: "sticker-p", levelId: "isla-p" },
  { id: "stk-m", title: "Mono", artId: "sticker-m", levelId: "isla-m" },
  { id: "stk-s", title: "Sol", artId: "sticker-s", levelId: "isla-s" },
  { id: "stk-t", title: "Tortuga", artId: "sticker-t", levelId: "isla-t" },
  { id: "stk-l", title: "León", artId: "sticker-l", levelId: "isla-l" },
  { id: "stk-d", title: "Dinosaurio", artId: "sticker-d", levelId: "isla-d" },
  { id: "stk-mixto", title: "Arcoíris", artId: "sticker-mixto", levelId: "mixto" },
  { id: "stk-palabras", title: "Estrella de palabras", artId: "sticker-palabras", levelId: "palabras" },
  { id: "stk-digrafos", title: "Cohete", artId: "sticker-digrafos", levelId: "digrafos" },
  { id: "stk-cerradas", title: "Corona", artId: "sticker-cerradas", levelId: "cerradas" },
  { id: "stk-milestone", title: "Medalla de oro", artId: "sticker-milestone", levelId: null },
];

/**
 * Stars awarded for a single correct answer.
 * @param {number} [count] how many correct answers (defaults to 1)
 * @returns {number}
 */
export function starsForCorrect(count = 1) {
  return STARS_PER_CORRECT * Math.max(0, Math.floor(count));
}

/**
 * Whether reaching `totalCorrect` just crossed a milestone boundary.
 * True when totalCorrect is a positive multiple of MILESTONE_EVERY.
 * @param {number} totalCorrect running count of correct answers
 * @returns {boolean}
 */
export function isMilestone(totalCorrect) {
  return totalCorrect > 0 && totalCorrect % MILESTONE_EVERY === 0;
}

/**
 * The sticker id granted for completing a level, or null if none defined.
 * @param {string} levelId
 * @returns {string|null}
 */
export function stickerForLevel(levelId) {
  const found = STICKER_CATALOG.find((s) => s.levelId === levelId);
  return found ? found.id : null;
}

/**
 * Look up a sticker's catalog entry by id.
 * @param {string} stickerId
 * @returns {object|null}
 */
export function stickerById(stickerId) {
  return STICKER_CATALOG.find((s) => s.id === stickerId) || null;
}

/**
 * Build the sticker-book view: every catalog sticker marked earned or not.
 * Pure. Earned-but-unknown ids are ignored (catalog is the source of truth).
 * @param {string[]} earnedIds ids the child has unlocked
 * @returns {Array<{id: string, title: string, artId: string, earned: boolean}>}
 */
export function stickerBook(earnedIds = []) {
  const earned = new Set(earnedIds);
  return STICKER_CATALOG.map((s) => ({
    id: s.id,
    title: s.title,
    artId: s.artId,
    earned: earned.has(s.id),
  }));
}

/**
 * Compute the reward outcome of a single correct answer.
 * Returns the stars to add and whether this answer hit a milestone.
 * Pure — the caller applies the result to progress state.
 * @param {number} totalCorrectAfter the running correct count AFTER this answer
 * @returns {{stars: number, milestone: boolean}}
 */
export function onCorrect(totalCorrectAfter) {
  return {
    stars: starsForCorrect(1),
    milestone: isMilestone(totalCorrectAfter),
  };
}

/**
 * Compute the reward outcome of completing a level: the sticker granted (if
 * not already earned) and whether it's new. Pure.
 * @param {string} levelId
 * @param {string[]} [alreadyEarned]
 * @returns {{stickerId: string|null, isNew: boolean}}
 */
export function onLevelComplete(levelId, alreadyEarned = []) {
  const stickerId = stickerForLevel(levelId);
  const isNew = Boolean(stickerId) && !alreadyEarned.includes(stickerId);
  return { stickerId, isNew };
}
