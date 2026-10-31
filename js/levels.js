// levels.js — level / world-map node definitions + state derivation.
// Pure + testable: no DOM, no storage. Consumes a progress state object
// (see progress.js) and returns map state.
//
// Iteration 5 (D1): the map is WORDS-ONLY. There is no standalone-syllable
// level, item, pool, or answer path. Levels are grouped by consonant/sound
// family within a syllable-length band, ordered easiest-first, and every pool
// is derived at runtime from the CSV word inventory via words.forBand(), so the
// pedagogical order lives in one place (words.js helpers), not two.

import { forBand } from "./words.js";

// Iteration 8 (D3 / AC-L3): the per-level/session goal is an adult-configurable
// words-per-level setting, clamped to a sensible range. Levels stay PURE (no
// import of progress) — game.js passes the current setting in at openLevel().
export const MIN_WORDS_PER_LEVEL = 5;
export const MAX_WORDS_PER_LEVEL = 20;
export const DEFAULT_WORDS_PER_LEVEL = 10;

/**
 * Coerce + clamp an arbitrary value to a valid integer words-per-level in
 * [MIN..MAX], defaulting to 10 on anything non-numeric. Pure (AC-L3.1).
 * @param {*} n
 * @returns {number}
 */
export function clampWordsPerLevel(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return DEFAULT_WORDS_PER_LEVEL;
  return Math.max(MIN_WORDS_PER_LEVEL, Math.min(MAX_WORDS_PER_LEVEL, v));
}

/**
 * The effective number of correct answers to finish a session: the clamped
 * words-per-level setting, never more than the band's pool size (so a thin band
 * can never dead-end). Pure (AC-L3.3/L3.4).
 * @param {number} poolSize
 * @param {number} wordsPerLevel
 * @returns {number}
 */
export function effectiveGoal(poolSize, wordsPerLevel) {
  const want = clampWordsPerLevel(wordsPerLevel);
  const size = Number.isFinite(poolSize) ? poolSize : 0;
  return Math.min(want, size);
}

/**
 * Ordered word-band definitions (AC-I1). Each band selects its words by
 * filtering the CSV inventory with the pure helpers in words.js (tier via
 * hardestConsonantTier, digraph/closed via hasDigraph/hasClosedSyllable). The
 * order is: all 2-syllable bands (open tiers 1→3 then especiales) before the
 * 3-syllable bands (open then especiales) — easiest-first (AC-I1.3/I1.7).
 *
 * `band` is the pure spec passed to words.forBand(); `pool()` maps the selected
 * items to their `.word` strings at call-time so a late CSV load is picked up.
 */
const WORD_BANDS = [
  // ---- 2-syllable bands (easiest first) ----
  {
    id: "pal-2-abiertas-1",
    title: "¡Primeros pasos!",
    artId: "island-words-2-1",
    band: { count: 2, tiers: [1], special: false },
  },
  {
    id: "pal-2-abiertas-2",
    title: "¡A rodar!",
    artId: "island-words-2-2",
    band: { count: 2, tiers: [2], special: false },
  },
  {
    id: "pal-2-abiertas-3",
    title: "¡Más aventuras!",
    artId: "island-words-2-3",
    band: { count: 2, tiers: [3], special: false },
  },
  {
    id: "pal-2-especiales",
    title: "¡Sonidos mágicos!",
    artId: "island-words-2-esp",
    band: { count: 2, special: true },
  },
  // ---- 3-syllable bands (split open into tiers 1–2 then tier 3) ----
  {
    id: "pal-3-abiertas-1",
    title: "¡La jungla de sílabas!",
    artId: "island-words-3-1",
    band: { count: 3, tiers: [1, 2], special: false },
  },
  {
    id: "pal-3-abiertas-2",
    title: "¡Palabras cohete!",
    artId: "island-words-3-2",
    band: { count: 3, tiers: [3], special: false },
  },
  {
    id: "pal-3-especiales",
    title: "¡Tesoros escondidos!",
    artId: "island-words-3-esp",
    band: { count: 3, special: true },
  },
  // ---- 4-syllable bands (the big finale) ----
  {
    id: "pal-4-abiertas",
    title: "¡A despegar!",
    artId: "island-words-4-abi",
    band: { count: 4, special: false },
  },
  {
    id: "pal-4-especiales",
    title: "¡Campeones de 4 sílabas!",
    artId: "island-words-4-esp",
    band: { count: 4, special: true },
  },
];

/**
 * Build the ordered array of level definitions. Every level is a word level
 * (type "word", mode "word"). A band whose current pool is empty is SKIPPED so
 * the unlock chain never breaks (should not happen with the shipped inventory
 * or embedded fallback, but keeps continuity if a band ever thins out).
 */
function buildLevels() {
  const levels = [];
  for (const b of WORD_BANDS) {
    // Snapshot the pool at build time only to decide emptiness; pool() below
    // re-derives at call-time so a later CSV load is reflected.
    const initial = forBand(b.band);
    if (!initial.length) continue; // skip an empty band → chain stays intact
    const spec = b.band;
    const poolSize = initial.length;
    levels.push({
      id: b.id,
      title: b.title,
      type: "word",
      mode: "word",
      artId: b.artId,
      goal: Math.min(10, poolSize),
      pool: () => forBand(spec).map((w) => w.word),
    });
  }
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
