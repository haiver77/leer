// praise.js — adaptive, varied praise phrases + the combo tier. PURE: no DOM,
// no storage, no audio. game.js picks a `kind` from what just happened and
// shows `text`; the optional voice (adult-enabled) says `speech`.
//
// Phrases are short (<= 5 words) for pre-readers (ages 3-5). `{palabra}` is
// replaced with the word just practiced. A phrase is never repeated twice in a
// row for the same kind (rotation memory), so praise never feels canned.

/** Praise kinds. */
export const KINDS = [
  "first-try", // read well on the first attempt
  "recovered", // read well after missing/near-missing
  "mastered", // the word just became "dominada"
  "milestone", // every Nth correct answer
  "combo", // several correct in a row
  "plain", // accepted without mic verification (adult/self-confirmed)
  "retry", // a miss: gentle encouragement
  "near", // a near-miss: "almost"
  "together", // 2+ misses on one word: low-pressure "let's say it together"
];

const PHRASES = {
  "first-try": [
    "¡Muy bien! 🎉",
    "¡{palabra}! ¡Genial! ⭐",
    "¡Lo leíste súper! 🌟",
    "¡Qué bien lo dices! 👏",
    "¡Perfecto! 🎉",
  ],
  recovered: [
    "¡Lo lograste! 💪",
    "¡Seguiste y lo lograste! 🌟",
    "¡{palabra}! ¡Eres valiente! 💪",
    "¡Ahora sí! 🎉",
    "¡Qué bien insistes! 👏",
  ],
  mastered: [
    "¡Ya la dominas! 🏆",
    "¡{palabra} es tuya! 🏆",
    "¡Palabra dominada! 🌟",
    "¡Eres un campeón! 🏆",
  ],
  milestone: [
    "¡Increíble! 🌟🌟",
    "¡Wow, qué racha! 🌟🌟",
    "¡Eres una estrella! 🌟🌟",
    "¡Fantástico! 🎊",
  ],
  combo: [
    "¡Sigue así! 🔥",
    "¡Imparable! 🔥",
    "¡Qué racha! 🔥",
    "¡Una tras otra! 🔥",
    "¡Estás volando! 🚀",
  ],
  plain: ["¡Listo! ✅", "¡Bien hecho! 👍", "¡Vamos! ✅", "¡Muy bien! 👍"],
  retry: [
    "¡Inténtalo otra vez! 🙂",
    "¡Tú puedes! 💪",
    "¡Otra vez, vamos! 🙂",
    "¡Casi lo tienes! 🙂",
  ],
  near: [
    "¡Casi! Escucha otra vez 👂",
    "¡Muy cerca! Escucha 👂",
    "¡Ya casi! Escucha otra vez 👂",
  ],
  together: [
    "¡Digámosla juntos! 🤝",
    "¡Juntos lo hacemos! 🤝",
    "¡Vamos juntos! 🤝",
  ],
};

// Last index used per kind, to avoid an immediate repeat.
const lastIndex = Object.create(null);

/** Reset the rotation memory (tests). */
export function resetPraise() {
  for (const k of Object.keys(lastIndex)) delete lastIndex[k];
}

/**
 * Strip emoji / pictographs and tidy spaces so the text can be spoken by TTS.
 * @param {string} text
 * @returns {string}
 */
export function toSpeech(text) {
  return String(text)
    .replace(/[\p{Extended_Pictographic}\u200d\ufe0f\u2705]/gu, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([!?.,¡¿])/g, "$1")
    .trim();
}

/**
 * Pick a praise phrase for the given context. Unknown kinds fall back to
 * "plain". `rng` (0..1) is injectable for deterministic tests.
 * @param {{kind?: string, word?: string}} [ctx]
 * @param {() => number} [rng]
 * @returns {{kind: string, text: string, speech: string}}
 */
export function pickPraise(ctx = {}, rng = Math.random) {
  const kind = PHRASES[ctx.kind] ? ctx.kind : "plain";
  const pool = PHRASES[kind];
  let idx = Math.min(pool.length - 1, Math.floor(rng() * pool.length));
  if (pool.length > 1 && idx === lastIndex[kind]) idx = (idx + 1) % pool.length;
  lastIndex[kind] = idx;

  const word = ctx.word ? String(ctx.word) : "";
  let text = pool[idx];
  // A phrase that needs the word falls back to a word-less one when absent.
  if (!word && text.includes("{palabra}")) {
    const alt = pool.findIndex((p) => !p.includes("{palabra}"));
    text = pool[alt >= 0 ? alt : 0].replace("{palabra}", "");
  }
  text = text.replace("{palabra}", word);
  return { kind, text, speech: toSpeech(text) };
}

/** Streak thresholds for combo tiers 1..3. */
export const COMBO_TIERS = [3, 5, 8];

/**
 * Combo tier (0..3) for a run of consecutive correct answers. Pure.
 * @param {number} run
 * @returns {0|1|2|3}
 */
export function comboTier(run) {
  const n = Math.floor(Number(run)) || 0;
  let tier = 0;
  for (let i = 0; i < COMBO_TIERS.length; i += 1) {
    if (n >= COMBO_TIERS[i]) tier = i + 1;
  }
  return tier;
}
