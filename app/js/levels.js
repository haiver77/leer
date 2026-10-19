// levels.js — level / world-map node definitions + state derivation.
// Pure + testable: no DOM, no storage. Consumes a progress state object
// (see progress.js) and returns map state.

import { cvPool, EXTRA_POOLS } from "./syllables.js";
import { forLevel as wordsForLevel } from "./words.js";

/**
 * Ordered level definitions. The staged path:
 *   per-consonant islands → mixed syllables → two-syllable words →
 *   closed syllables & digraphs.
 *
 * Each node:
 *   id      stable id (used as localStorage key + unlock key)
 *   title   Spanish label (hidden in very-young mode; art carries meaning)
 *   type    "syllable" | "word"
 *   mode    "cv" | "mixed" | "word" | pool id ("ch","ll",...)
 *   artId   art.js id for the island/node illustration
 *   goal    correct answers needed to complete the node
 *   pool()  returns the item pool for this node
 */
const CONSONANT_ISLANDS = [
  { c: "p", title: "Isla de la P", artId: "island-p" },
  { c: "m", title: "Isla de la M", artId: "island-m" },
  { c: "s", title: "Isla de la S", artId: "island-s" },
  { c: "t", title: "Isla de la T", artId: "island-t" },
  { c: "l", title: "Isla de la L", artId: "island-l" },
  { c: "d", title: "Isla de la D", artId: "island-d" },
];

/** Build the ordered array of level definitions. */
function buildLevels() {
  const levels = [];

  // 1) Per-consonant islands (CV for one consonant).
  for (const isl of CONSONANT_ISLANDS) {
    levels.push({
      id: `isla-${isl.c}`,
      title: isl.title,
      type: "syllable",
      mode: "cv",
      consonant: isl.c,
      artId: isl.artId,
      goal: 5,
      pool: () => cvPool(isl.c),
    });
  }

  // 2) Mixed syllables (all introduced consonants together).
  levels.push({
    id: "mixto",
    title: "Mezcla de sílabas",
    type: "syllable",
    mode: "mixed",
    artId: "island-mixed",
    goal: 8,
    pool: () => CONSONANT_ISLANDS.flatMap((i) => cvPool(i.c)),
  });

  // 3) Two-syllable words.
  levels.push({
    id: "palabras",
    title: "Palabras",
    type: "word",
    mode: "word",
    artId: "island-words",
    goal: 5,
    pool: () => wordsForLevel("palabras").map((w) => w.word),
  });

  // 4) Digraphs.
  levels.push({
    id: "digrafos",
    title: "Sonidos especiales",
    type: "syllable",
    mode: "digraphs",
    artId: "island-digraphs",
    goal: 6,
    pool: () => [
      ...EXTRA_POOLS.ch,
      ...EXTRA_POOLS.ll,
      ...EXTRA_POOLS.rr,
      ...EXTRA_POOLS.enye,
    ],
  });

  // 5) Closed syllables + the silent-u digraphs.
  levels.push({
    id: "cerradas",
    title: "Sílabas cerradas",
    type: "syllable",
    mode: "closed",
    artId: "island-closed",
    goal: 5,
    pool: () => [...EXTRA_POOLS.closed, ...EXTRA_POOLS.qu, ...EXTRA_POOLS.gu],
  });

  return levels;
}

const LEVELS = buildLevels();

/** All level definitions in order. */
export function all() {
  return LEVELS;
}

/** Look up a single level definition by id. */
export function byId(levelId) {
  return LEVELS.find((l) => l.id === levelId) || null;
}

/** The id of the very first level (always unlocked). */
export function firstLevelId() {
  return LEVELS[0].id;
}

/**
 * Given a level id, return the id of the next level in order, or null if it's
 * the last. Pure.
 * @param {string} levelId
 * @returns {string|null}
 */
export function nextUnlock(levelId) {
  const idx = LEVELS.findIndex((l) => l.id === levelId);
  if (idx === -1 || idx === LEVELS.length - 1) return null;
  return LEVELS[idx + 1].id;
}

/**
 * Determine whether a level is unlocked given progress. The first level is
 * always unlocked; any other level is unlocked if its own stored flag is set
 * OR the previous level is completed. Pure.
 * @param {object} progress progress state
 * @param {string} levelId
 * @returns {boolean}
 */
export function isUnlocked(progress, levelId) {
  const idx = LEVELS.findIndex((l) => l.id === levelId);
  if (idx <= 0) return true; // first level (or unknown) is always reachable
  const stored = progress.levels && progress.levels[levelId];
  if (stored && stored.unlocked) return true;
  const prev = LEVELS[idx - 1];
  const prevState = progress.levels && progress.levels[prev.id];
  return Boolean(prevState && prevState.completed);
}

/**
 * Derive the full map state for rendering. Each node carries its definition
 * plus derived { unlocked, completed, bestStars }. Pure.
 * @param {object} progress progress state
 * @returns {Array<object>}
 */
export function mapState(progress) {
  return LEVELS.map((lvl) => {
    const stored = (progress.levels && progress.levels[lvl.id]) || {};
    return {
      id: lvl.id,
      title: lvl.title,
      type: lvl.type,
      mode: lvl.mode,
      artId: lvl.artId,
      goal: lvl.goal,
      unlocked: isUnlocked(progress, lvl.id),
      completed: Boolean(stored.completed),
      bestStars: Number.isFinite(stored.bestStars) ? stored.bestStars : 0,
    };
  });
}

/**
 * Mark a level completed in the progress object, unlock the next node, and
 * record best stars. Mutates + returns progress. Pure over the passed object.
 * @param {object} progress
 * @param {string} levelId
 * @param {number} starsEarned
 * @returns {object} progress
 */
export function completeLevel(progress, levelId, starsEarned = 0) {
  if (!progress.levels) progress.levels = {};
  const cur = progress.levels[levelId] || { unlocked: true, completed: false, bestStars: 0 };
  cur.unlocked = true;
  cur.completed = true;
  cur.bestStars = Math.max(cur.bestStars || 0, starsEarned);
  progress.levels[levelId] = cur;

  const next = nextUnlock(levelId);
  if (next) {
    const n = progress.levels[next] || { unlocked: false, completed: false, bestStars: 0 };
    n.unlocked = true;
    progress.levels[next] = n;
  }
  return progress;
}
