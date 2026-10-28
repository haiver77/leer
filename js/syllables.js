// syllables.js — trimmed in iteration 5 (D1).
//
// The CV matrix, EXTRA_POOLS, and generate() practice pools are SUPERSEDED:
// standalone-syllable practice is no longer a goal, so they are no longer a
// practice source. The module is reduced to the two pure, still-useful
// helpers — `pickRandom` (non-repeating random selector) and `titleCase` —
// kept so the file remains a valid, importable ES module and its pure logic
// stays unit-testable under Node.

/**
 * Capitalize the first letter, lowercase the rest (e.g. "pa" -> "Pa").
 * @param {string} s
 * @returns {string}
 */
export function titleCase(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/**
 * Pick a random item from the pool, never equal to `exclude`
 * (prevents immediate repeats). If the pool has a single item, returns it.
 * Pure aside from Math.random.
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
