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

/** Words-per-level setting bounds + default (iteration 8, D3 / AC-L3.1). */
export const DEFAULT_WORDS_PER_LEVEL = 10;
export const MIN_WORDS_PER_LEVEL = 5;
export const MAX_WORDS_PER_LEVEL = 20;

/** Daily-streak ("racha de días") goal: words read well per day (configurable). */
export const DEFAULT_STREAK_GOAL = 10;
export const MIN_STREAK_GOAL = 1;
export const MAX_STREAK_GOAL = 100;

/**
 * Coerce + clamp a stored/entered streak goal to an integer in [MIN..MAX],
 * defaulting on anything non-numeric. Pure.
 * @param {*} n
 * @returns {number}
 */
export function clampStreakGoal(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return DEFAULT_STREAK_GOAL;
  return Math.max(MIN_STREAK_GOAL, Math.min(MAX_STREAK_GOAL, v));
}

/**
 * Coerce an arbitrary stored value into a clean `{ "YYYY-MM-DD": count }` map.
 * Drops malformed keys and non-positive / non-numeric counts. Pure.
 * @param {*} raw
 * @returns {Object<string, number>}
 */
function normalizeHistory(raw) {
  const out = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [k, v] of Object.entries(raw)) {
    const n = Math.floor(Number(v));
    if (/^\d{4}-\d{2}-\d{2}$/.test(k) && Number.isFinite(n) && n > 0) out[k] = n;
  }
  return out;
}

/**
 * Coerce + clamp an arbitrary stored/entered value to a valid integer
 * words-per-level in [MIN..MAX], defaulting on anything non-numeric. Pure.
 * @param {*} n
 * @returns {number}
 */
export function clampWordsPerLevel(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return DEFAULT_WORDS_PER_LEVEL;
  return Math.max(MIN_WORDS_PER_LEVEL, Math.min(MAX_WORDS_PER_LEVEL, v));
}

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
    // Iteration 7 (D7 / AC-K7): auto-read the word on display (default ON).
    autoRead: true,
    // Iteration 7 (D3 / AC-K3): adult-chosen reading voice id (null = auto).
    voicePref: null,
    // Iteration 8 (D3 / AC-L3): adult-set words per level (default 10, 5..20).
    wordsPerLevel: DEFAULT_WORDS_PER_LEVEL,
    // Iteration 9 (D1 / AC-M1): Lalo customization (color + accessories). This
    // literal MUST equal customize.defaultSelection() (pinned by a test); it is
    // inlined here so progress.js stays free of a module import cycle.
    lalo: { color: "sky", accessories: [] },
    // Iteration 9 (D8 / AC-M8): background-music toggle, default OFF.
    music: false,
    // Adult-enabled spoken praise ("Lalo habla los elogios"), default OFF.
    praiseVoice: false,
    streak: 0,
    bestStreak: 0,
    stars: 0,
    items: {},
    levels: {},
    stickers: [],
    dailyGoal: { date: "", progress: 0, target: DEFAULT_DAILY_TARGET },
    // Daily streak ("racha de días"): `history` maps local date → words read
    // well that day; `dayStreak` counts days the goal was met. A missed day
    // never resets it — it just doesn't add (see recordPractice).
    history: {},
    dayStreak: 0,
    bestDayStreak: 0,
    lastStreakDate: "",
    streakGoal: DEFAULT_STREAK_GOAL,
  };
}

/**
 * Coerce an arbitrary stored `lalo` blob into a structurally valid selection
 * `{ color: string, accessories: string[] }`. Does NOT check unlocks (that
 * needs the customize catalog; game.js sanitizes against unlocks at load). Pure.
 * @param {*} raw
 * @param {{color:string, accessories:string[]}} def default selection
 * @returns {{color:string, accessories:string[]}}
 */
function normalizeLalo(raw, def) {
  const fallback = { color: def.color, accessories: [...def.accessories] };
  if (!raw || typeof raw !== "object") return fallback;
  const color = typeof raw.color === "string" && raw.color ? raw.color : def.color;
  const accessories = Array.isArray(raw.accessories)
    ? raw.accessories.filter((a) => typeof a === "string")
    : [];
  return { color, accessories };
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
  // Iteration 7: fill the new settings for older v2 states (AC-K7.2 / AC-K3.3).
  // A saved boolean/string is preserved; a missing key defaults from base.
  merged.autoRead = typeof raw.autoRead === "boolean" ? raw.autoRead : base.autoRead;
  merged.voicePref =
    typeof raw.voicePref === "string" || raw.voicePref === null
      ? raw.voicePref
      : base.voicePref;
  // Iteration 8 (AC-L3.1): fill + clamp words-per-level. A missing key defaults
  // to 10; an out-of-range / non-numeric value is clamped into [MIN..MAX].
  merged.wordsPerLevel = clampWordsPerLevel(
    raw.wordsPerLevel === undefined ? base.wordsPerLevel : raw.wordsPerLevel
  );
  // Iteration 9 (AC-M1 / AC-M8): fill + validate the new additive keys.
  // `lalo` must be an object with a string `color` and a string[] `accessories`;
  // anything malformed falls back to the default selection. (Dropping a *locked*
  // equipped item needs the customize catalog and is done in game.js at load.)
  merged.lalo = normalizeLalo(raw.lalo, base.lalo);
  // `music` is a boolean; a missing / non-boolean value defaults OFF.
  merged.music = typeof raw.music === "boolean" ? raw.music : base.music;
  // `praiseVoice` is a boolean; missing / non-boolean defaults OFF.
  merged.praiseVoice =
    typeof raw.praiseVoice === "boolean" ? raw.praiseVoice : base.praiseVoice;
  // Daily-streak fields: validate each so corrupt data can't break the calendar.
  merged.history = normalizeHistory(raw.history);
  const nonNeg = (v) => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);
  merged.dayStreak = nonNeg(raw.dayStreak);
  merged.bestDayStreak = Math.max(nonNeg(raw.bestDayStreak), merged.dayStreak);
  merged.lastStreakDate =
    typeof raw.lastStreakDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.lastStreakDate)
      ? raw.lastStreakDate
      : "";
  merged.streakGoal = clampStreakGoal(
    raw.streakGoal === undefined ? base.streakGoal : raw.streakGoal
  );
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

/**
 * Record one properly-read word for today in the practice history and update
 * the daily streak. The first time today's count reaches `streakGoal`, the
 * streak grows by exactly one (once per day). Days without reaching the goal
 * never reset the streak; it simply doesn't grow until the goal is met again.
 * Pure (mutates + returns state).
 * @param {object} state
 * @param {Date|number} [today]
 * @returns {{state: object, count: number, streakAdded: boolean}}
 */
export function recordPractice(state, today = new Date()) {
  const key = localDateKey(today);
  if (!state.history || typeof state.history !== "object") state.history = {};
  state.history[key] = (state.history[key] || 0) + 1;

  const goal = clampStreakGoal(state.streakGoal);
  let streakAdded = false;
  if (state.history[key] >= goal && state.lastStreakDate !== key) {
    state.dayStreak = (state.dayStreak || 0) + 1;
    state.lastStreakDate = key;
    if (state.dayStreak > (state.bestDayStreak || 0)) state.bestDayStreak = state.dayStreak;
    streakAdded = true;
  }
  return { state, count: state.history[key], streakAdded };
}

/**
 * Build a Monday-first calendar grid for a month. Always whole weeks; cells
 * outside the month are flagged `inMonth: false` (shown dimmed, no count).
 * Pure.
 * @param {number} year full year, e.g. 2026
 * @param {number} month 0-based month (0 = January)
 * @param {Object<string, number>} history date → words practiced
 * @param {number} goal words needed for a "goal day"
 * @param {Date|number} [today]
 * @returns {{year:number, month:number, weeks:object[][], totalWords:number, goalDays:number}}
 */
export function monthCalendar(year, month, history, goal, today = new Date()) {
  const hist = history || {};
  const todayKey = localDateKey(today);
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const total = Math.ceil((lead + daysInMonth) / 7) * 7;

  const cells = [];
  let totalWords = 0;
  let goalDays = 0;
  for (let i = 0; i < total; i += 1) {
    const d = new Date(year, month, 1 - lead + i);
    const key = localDateKey(d);
    const inMonth = d.getMonth() === month && d.getFullYear() === year;
    const count = inMonth ? hist[key] || 0 : 0;
    const goalMet = inMonth && count >= goal;
    if (inMonth) {
      totalWords += count;
      if (goalMet) goalDays += 1;
    }
    cells.push({
      key,
      day: d.getDate(),
      inMonth,
      count,
      goalMet,
      isToday: key === todayKey,
      isFuture: key > todayKey,
    });
  }
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return { year, month, weeks, totalWords, goalDays };
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
