// progress.js — mastery + persistence. Single source of truth for localStorage.
//
// Schema `silabas:v2`, migrating from v1 `{ difficulty, bestStreak }`.
// The aggregation helpers (recordAttempt, masteredCount, troubleItems,
// migration, daily-goal date handling) are PURE functions over a plain state
// object, so they are unit-testable under Node with no browser dependency.
// Only load()/save() touch localStorage, and they are guarded.

export const STORAGE_KEY = "silabas:v2";
export const LEGACY_KEY = "silabas:v1";

/** Verified (mic-matched) correct answers needed to master an item. */
export const MASTERY_THRESHOLD = 3;

/** Default new-item auto-model budget (F1.3). */
export const DEFAULT_AUTO_MODEL = 3;

/** Default daily-goal target (correct answers to fill today's bar). */
export const DEFAULT_DAILY_TARGET = 10;

/**
 * A fresh, clean v2 progress object (first-run state).
 * @returns {object}
 */
export function freshState() {
  return {
    version: 2,
    difficulty: "facil",
    veryYoung: false,
    onboardingDone: false,
    autoModelRemaining: DEFAULT_AUTO_MODEL,
    streak: 0,
    bestStreak: 0,
    stars: 0,
    items: {},
    levels: {},
    stickers: [],
    dailyGoal: { date: "", progress: 0, target: DEFAULT_DAILY_TARGET },
  };
}

/**
 * A fresh per-item record.
 * @returns {object}
 */
function freshItem() {
  return {
    seen: 0,
    attempted: 0,
    correct: 0,
    verifiedCorrect: 0,
    mastered: false,
    lastSeen: 0,
  };
}

/**
 * Migrate an arbitrary stored blob (v1 or partial v2) to a complete v2 state.
 * Pure. Preserves best streak + difficulty from v1; defaults the rest.
 * @param {object|null} raw parsed stored value (any version) or null
 * @returns {object} a complete v2 state
 */
export function migrate(raw) {
  const base = freshState();
  if (!raw || typeof raw !== "object") return base;

  // v1 → v2: preserve difficulty + bestStreak only.
  if (!raw.version || raw.version < 2) {
    return {
      ...base,
      difficulty: raw.difficulty === "normal" ? "normal" : "facil",
      bestStreak: Number.isFinite(raw.bestStreak) ? raw.bestStreak : 0,
    };
  }

  // Already v2 (or newer): merge over defaults so missing keys are filled.
  const merged = {
    ...base,
    ...raw,
    dailyGoal: { ...base.dailyGoal, ...(raw.dailyGoal || {}) },
    items: { ...(raw.items || {}) },
    levels: { ...(raw.levels || {}) },
    stickers: Array.isArray(raw.stickers) ? [...raw.stickers] : [],
  };
  merged.version = 2;
  // Normalise item records so every item has all fields.
  for (const id of Object.keys(merged.items)) {
    merged.items[id] = { ...freshItem(), ...merged.items[id] };
  }
  return merged;
}

/**
 * Record that `id` was shown to the child. Mutates + returns state.
 * @param {object} state
 * @param {string} id
 */
export function recordSeen(state, id, now = Date.now()) {
  if (!state.items[id]) state.items[id] = freshItem();
  state.items[id].seen += 1;
  state.items[id].lastSeen = now;
  return state;
}

/**
 * Record an attempt against item `id`.
 * - `verified` means a real mic match (counts toward mastery).
 * - `correct` means it was accepted (verified OR adult/self-confirmed).
 * Mastery flips at MASTERY_THRESHOLD verified-correct answers.
 * Pure over the passed state object (mutates + returns it).
 *
 * @param {object} state progress state
 * @param {string} id item id (syllable or word)
 * @param {{verified?: boolean, correct?: boolean}} outcome
 * @returns {object} the same state
 */
export function recordAttempt(state, id, outcome = {}) {
  const verified = Boolean(outcome.verified);
  const correct = Boolean(outcome.correct);
  if (!state.items[id]) state.items[id] = freshItem();
  const rec = state.items[id];

  rec.attempted += 1;
  if (correct) rec.correct += 1;
  if (verified && correct) rec.verifiedCorrect += 1;
  if (rec.verifiedCorrect >= MASTERY_THRESHOLD) rec.mastered = true;

  return state;
}

/**
 * Count mastered items among the given ids.
 * @param {object} state
 * @param {string[]} ids item ids to consider (e.g. a pool)
 * @returns {{mastered: number, total: number}}
 */
export function masteredCount(state, ids) {
  const list = Array.isArray(ids) ? ids : [];
  let mastered = 0;
  for (const id of list) {
    if (state.items[id] && state.items[id].mastered) mastered += 1;
  }
  return { mastered, total: list.length };
}

/**
 * Return ids the child struggles with: attempts ≥ k and the lowest
 * correct/attempted ratio first. Items never attempted are excluded.
 * @param {object} state
 * @param {number} [k] minimum attempts to qualify (default 2)
 * @param {number} [limit] max ids to return (default 5)
 * @returns {string[]}
 */
export function troubleItems(state, k = 2, limit = 5) {
  const entries = Object.entries(state.items)
    .filter(([, r]) => r.attempted >= k)
    .map(([id, r]) => ({ id, ratio: r.correct / r.attempted, attempted: r.attempted }))
    .filter((e) => e.ratio < 1) // only items with at least one miss
    .sort((a, b) => a.ratio - b.ratio || b.attempted - a.attempted);
  return entries.slice(0, limit).map((e) => e.id);
}

/**
 * Format a Date (or timestamp) as a local "YYYY-MM-DD" string.
 * @param {Date|number} [d]
 * @returns {string}
 */
export function localDateKey(d = new Date()) {
  const date = d instanceof Date ? d : new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Ensure the daily goal matches today's local date. If it's a new day, reset
 * progress to 0 (keep target). Never penalises a missed day. Pure (mutates +
 * returns state).
 * @param {object} state
 * @param {Date|number} [today]
 * @returns {object} state
 */
export function ensureDailyGoal(state, today = new Date()) {
  const key = localDateKey(today);
  if (!state.dailyGoal) {
    state.dailyGoal = { date: key, progress: 0, target: DEFAULT_DAILY_TARGET };
    return state;
  }
  if (state.dailyGoal.date !== key) {
    state.dailyGoal.date = key;
    state.dailyGoal.progress = 0;
  }
  return state;
}

/**
 * Advance today's daily-goal progress by `by` (default 1), capped at target.
 * Resets first if the day changed. Pure (mutates + returns state).
 * @param {object} state
 * @param {number} [by]
 * @param {Date|number} [today]
 * @returns {object} state
 */
export function bumpDailyGoal(state, by = 1, today = new Date()) {
  ensureDailyGoal(state, today);
  const t = state.dailyGoal.target || DEFAULT_DAILY_TARGET;
  state.dailyGoal.progress = Math.min(t, state.dailyGoal.progress + by);
  return state;
}

// ---- localStorage access (guarded; the only impure part) --------------------

/**
 * Load + migrate persisted progress. Reads v2, falling back to the legacy v1
 * key, and always returns a complete v2 state. Never throws.
 * @returns {object}
 */
export function load() {
  if (typeof localStorage === "undefined") return freshState();
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY);
    if (rawV2) return migrate(JSON.parse(rawV2));
    const rawV1 = localStorage.getItem(LEGACY_KEY);
    if (rawV1) return migrate(JSON.parse(rawV1));
    return freshState();
  } catch (_e) {
    return freshState();
  }
}

/**
 * Persist the given v2 state. Never throws (storage may be disabled).
 * @param {object} state
 */
export function save(state) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_e) {
    /* storage disabled / full; game still works in memory */
  }
}

/**
 * Clear persisted progress and return a clean first-run state (F7.3 reset).
 * @returns {object}
 */
export function reset() {
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_KEY);
    } catch (_e) {
      /* ignore */
    }
  }
  return freshState();
}
