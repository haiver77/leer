// words.js — curated CV+CV two-syllable word catalog. Pure + testable.
//
// Each entry: { word, parts: [cv, cv], artId }
// Words are built only from already-introduced consonants (p, m, s, t, l, d)
// so the child meets familiar syllables. `artId` maps to art.js for a picture.

/**
 * The starter word catalog. Parts are title-cased CV syllables that, when
 * lowercased and concatenated, form the (accent-free) word.
 * @type {Array<{word: string, parts: [string, string], artId: string}>}
 */
export const WORDS = [
  { word: "pato", parts: ["Pa", "To"], artId: "word-pato" },
  { word: "mesa", parts: ["Me", "Sa"], artId: "word-mesa" },
  { word: "lupa", parts: ["Lu", "Pa"], artId: "word-lupa" },
  { word: "dedo", parts: ["De", "Do"], artId: "word-dedo" },
  { word: "mapa", parts: ["Ma", "Pa"], artId: "word-mapa" },
  { word: "sopa", parts: ["So", "Pa"], artId: "word-sopa" },
  { word: "dado", parts: ["Da", "Do"], artId: "word-dado" },
  { word: "pelo", parts: ["Pe", "Lo"], artId: "word-pelo" },
  { word: "loma", parts: ["Lo", "Ma"], artId: "word-loma" },
  { word: "tela", parts: ["Te", "La"], artId: "word-tela" },
];

/**
 * Return the word list for a word level. Currently all words belong to the
 * single "palabras" level; the signature leaves room for more word levels.
 * @param {string} [levelId]
 * @returns {Array<{word: string, parts: [string, string], artId: string}>}
 */
export function forLevel(levelId = "palabras") {
  // Single word level for now; return a shallow copy so callers can't mutate.
  return WORDS.map((w) => ({ ...w, parts: [...w.parts] }));
}

/**
 * Look up a word entry by its word string (accent-free, lowercase).
 * @param {string} word
 * @returns {object|null}
 */
export function byWord(word) {
  const key = String(word).toLowerCase();
  return WORDS.find((w) => w.word === key) || null;
}

/**
 * Validate that an entry's parts concatenate to its word (case-insensitive).
 * Exposed for tests / integrity checks.
 * @param {{word: string, parts: string[]}} entry
 * @returns {boolean}
 */
export function partsMatchWord(entry) {
  if (!entry || !Array.isArray(entry.parts)) return false;
  const joined = entry.parts.join("").toLowerCase();
  return joined === String(entry.word).toLowerCase();
}
