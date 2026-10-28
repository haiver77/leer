// syllables.js — syllable pool generation + non-repeating random selection.
// Pure logic, no DOM, so it can be unit-tested under Node.

const VOWELS = ["a", "e", "i", "o", "u"];

// Core consonant set for "Fácil" (easy) — simple, common open syllables.
const EASY_CONSONANTS = ["p", "m", "s", "t", "l"];

// Full CV matrix consonant set for "Normal".
const NORMAL_CONSONANTS = ["p", "m", "s", "t", "l", "d", "n", "b", "f", "r", "c"];

/**
 * Capitalize the first letter, lowercase the rest (e.g. "pa" -> "Pa").
 * @param {string} s
 * @returns {string}
 */
function titleCase(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/**
 * Build a CV pool for a single consonant across all five vowels.
 * e.g. cvPool("p") -> ["Pa","Pe","Pi","Po","Pu"]
 * @param {string} consonant
 * @returns {string[]}
 */
export function cvPool(consonant) {
  return VOWELS.map((v) => titleCase(consonant + v));
}

/**
 * Named extra pools for iteration 2: closed syllables & digraphs.
 * Each is a flat array of title-cased syllables. These are intentionally kept
 * as separate, named pools so levels.js can target them individually.
 */
export const EXTRA_POOLS = {
  // Digraphs that form a single consonant sound.
  ch: ["Cha", "Che", "Chi", "Cho", "Chu"],
  ll: ["Lla", "Lle", "Lli", "Llo", "Llu"],
  rr: ["Rra", "Rre", "Rri", "Rro", "Rru"],
  // Ñ syllables (child-friendly subset ña/ñe emphasised, full set offered).
  enye: ["Ña", "Ñe", "Ñi", "Ño", "Ñu"],
  // "que/qui" and "gue/gui" — the silent-u digraphs.
  qu: ["Que", "Qui"],
  gu: ["Gue", "Gui"],
  // Closed syllables (CVC) — a small, common starter set.
  closed: ["Pan", "Sol", "Mar", "Luz", "Mes", "Sal", "Tren", "Flor"],
};

/**
 * All extra-pool ids (digraphs + closed), useful for aggregation.
 * @returns {string[]}
 */
export function extraPoolIds() {
  return Object.keys(EXTRA_POOLS);
}

/**
 * Generate the syllable pool for a difficulty, or for a named extra pool id.
 *
 * Backwards compatible: generate("facil") / generate("normal") behave exactly
 * as in iteration 1. Additionally, a known extra-pool id (e.g. "ch", "closed")
 * returns that pool, and "all" returns the full normal CV matrix plus extras.
 *
 * @param {"facil"|"normal"|"all"|string} which difficulty or pool id
 * @returns {string[]} e.g. ["Pa","Pe",...]
 */
export function generate(which) {
  if (which && Object.prototype.hasOwnProperty.call(EXTRA_POOLS, which)) {
    return [...EXTRA_POOLS[which]];
  }

  if (which === "all") {
    const pool = generate("normal");
    for (const id of extraPoolIds()) pool.push(...EXTRA_POOLS[id]);
    return pool;
  }

  const consonants = which === "normal" ? NORMAL_CONSONANTS : EASY_CONSONANTS;
  const pool = [];
  for (const c of consonants) {
    for (const v of VOWELS) {
      pool.push(titleCase(c + v));
    }
  }
  return pool;
}

/**
 * Pick a random syllable from the pool, never equal to `exclude`
 * (prevents immediate repeats). If the pool has a single item, returns it.
 * @param {string[]} pool
 * @param {string|null} [exclude]
 * @returns {string}
 */
export function pickRandom(pool, exclude = null) {
  if (!Array.isArray(pool) || pool.length === 0) {
    throw new Error("pickRandom: pool must be a non-empty array");
  }
  if (pool.length === 1) return pool[0];

  const candidates = exclude == null ? pool : pool.filter((s) => s !== exclude);
  const list = candidates.length > 0 ? candidates : pool;
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}
