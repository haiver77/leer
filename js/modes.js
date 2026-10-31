// modes.js — practice-mode definitions + pure option generation (iteration 9,
// D3 / AC-M3). No DOM, no storage: everything here is a pure function over
// plain data, so it is unit-testable under Node.
//
// Modes (all over the SAME vocabulary + inline-SVG art — no new content):
//   - "say-it"            read-and-say (mic auto-listen, AC-L2) — the default,
//                         unchanged, mastery-granting (verified:true).
//   - "pick-word"         show the dibujo + 3 word options; tap the match.
//   - "missing-syllable"  show the word with one syllable blanked + 3 syllable
//                         options; tap the missing piece.
// Tap modes complete a word via a self-confirm-style success (verified:false);
// they do NOT grant mastery (mastery stays mic-verified). Wrong taps encourage
// and let the child retry — never a fail, never a dead-end.

/** Mode ids. `say-it` is the default spoken mode (unchanged behaviour). */
export const MODES = ["say-it", "pick-word", "missing-syllable"];

/** Modes that require reading text (excluded in very-young / text-free mode). */
const TEXT_MODES = new Set(["pick-word", "missing-syllable"]);

/** Whether a mode depends on reading text. Pure. */
export function isTextMode(modeId) {
  return TEXT_MODES.has(modeId);
}

/**
 * Deterministically choose the mode for the `index`-th word of a level.
 * Rotation: say-it → pick-word → missing-syllable → … (index % 3). The first
 * word (index 0) is always "say-it" so a session opens with the familiar
 * read-and-say + a model read.
 *
 * In very-young (text-free) mode the rotation collapses to the picture-safe
 * subset — since both tap modes are text-dependent, very-young stays on
 * "say-it" only, guaranteeing an always-playable, reading-free session
 * (AC-M3.6).
 *
 * @param {string} levelId (reserved for future per-level tuning; unused today)
 * @param {number} index the 0-based word index within the level
 * @param {{veryYoung?: boolean}} [prefs]
 * @returns {string} a mode id from MODES
 */
export function pickMode(levelId, index, prefs = {}) {
  if (prefs && prefs.veryYoung) return "say-it";
  const i = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0;
  return MODES[i % MODES.length];
}

/** Fisher–Yates-ish shuffle using Math.random (pure aside from randomness). */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build N distinct option words for "pick-word": the target plus (N-1) plausible
 * distractors drawn from `pool`, with no duplicates and only from the pool (the
 * target must be in the pool). Returns a shuffled array of length min(N, pool
 * distinct size). If the pool is too small it returns as many distinct options
 * as exist (always including the target). Pure aside from shuffle randomness.
 *
 * @param {string} targetWord the correct answer
 * @param {string[]} pool candidate words (should include the target)
 * @param {number} [n] desired number of options (default 3)
 * @returns {string[]}
 */
export function buildOptions(targetWord, pool, n = 3) {
  const want = Math.max(1, Math.floor(n) || 1);
  const target = String(targetWord);
  // distinct pool members excluding the target
  const seen = new Set([target]);
  const distractors = [];
  for (const w of Array.isArray(pool) ? pool : []) {
    const s = String(w);
    if (seen.has(s)) continue;
    seen.add(s);
    distractors.push(s);
  }
  const picked = shuffle(distractors).slice(0, Math.max(0, want - 1));
  return shuffle([target, ...picked]);
}

/**
 * Build the "missing-syllable" challenge for a word: blank exactly one real
 * syllable and offer N distinct syllable options including the correct one.
 * Distractors are drawn from the provided `otherParts` pool (syllables of other
 * words), excluding the correct answer, de-duplicated. Returns the blanked
 * index, the correct syllable, and the shuffled options.
 *
 * @param {string} word the target word (for reference)
 * @param {string[]} parts the word's syllable parts (title-cased, e.g. ["Pe","Lo","Ta"])
 * @param {number} [n] number of syllable options (default 3)
 * @param {string[]} [otherParts] a pool of syllables from other words
 * @returns {{word:string, parts:string[], blankIndex:number, correct:string, options:string[]}}
 */
export function missingSyllableChoices(word, parts, n = 3, otherParts = []) {
  const list = Array.isArray(parts) ? parts.map(String) : [];
  if (list.length === 0) {
    return { word: String(word), parts: [], blankIndex: -1, correct: "", options: [] };
  }
  const want = Math.max(1, Math.floor(n) || 1);
  const blankIndex = Math.floor(Math.random() * list.length);
  const correct = list[blankIndex];

  // distractor syllables: from otherParts, excluding the correct one; de-duped.
  const seen = new Set([correct]);
  const pool = [];
  for (const p of Array.isArray(otherParts) ? otherParts : []) {
    const s = String(p);
    if (seen.has(s)) continue;
    seen.add(s);
    pool.push(s);
  }
  const distractors = shuffle(pool).slice(0, Math.max(0, want - 1));
  const options = shuffle([correct, ...distractors]);
  return { word: String(word), parts: list, blankIndex, correct, options };
}
