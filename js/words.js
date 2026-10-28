// words.js — pedagogically-ordered word inventory loaded from CSV data files.
//
// Iteration 3 replaces the hard-coded `WORDS` array as the primary content
// source with two CSV files under /data (2- and 3-syllable words), ordered
// easiest-first by `difficulty_rank`. A small embedded fallback set keeps the
// app playable from file:// or before the inventory finishes loading (AC-G4.4).
//
// Pure, synchronous helpers (parseCsv, rowIntegrity, isOrderedByRank,
// partsMatchWord, byWord) are unit-testable under Node. The async loader
// (loadInventory) is only exercised in the browser / with an injected fetch.
//
// Each inventory item exposed to the game: { word, parts, artId, emoji,
//   syllableCount, rank }. `parts` are title-cased syllables that lowercase-
//   concatenate to the accent-free word.

/**
 * Embedded fallback catalog (two-syllable), used when the CSV files cannot be
 * fetched (file:// origin, offline before first SW cache, or parse failure).
 * Kept small but complete so the word level is never a dead-end (AC-G4.4).
 * @type {Array<{word: string, parts: string[], artId: string, emoji: string, syllableCount: number, rank: number}>}
 */
export const WORDS = [
  // tier-1 (m/p/l/s/t) all-open
  { word: "mamá", parts: ["Ma", "Má"], artId: "word-mama", emoji: "👩", syllableCount: 2, rank: 1 },
  { word: "mapa", parts: ["Ma", "Pa"], artId: "word-mapa", emoji: "🗺️", syllableCount: 2, rank: 2 },
  { word: "mesa", parts: ["Me", "Sa"], artId: "word-mesa", emoji: "🍽️", syllableCount: 2, rank: 3 },
  { word: "pelo", parts: ["Pe", "Lo"], artId: "word-pelo", emoji: "💇", syllableCount: 2, rank: 4 },
  { word: "pato", parts: ["Pa", "To"], artId: "word-pato", emoji: "🦆", syllableCount: 2, rank: 5 },
  { word: "sopa", parts: ["So", "Pa"], artId: "word-sopa", emoji: "🍲", syllableCount: 2, rank: 6 },
  { word: "loma", parts: ["Lo", "Ma"], artId: "word-loma", emoji: "⛰️", syllableCount: 2, rank: 7 },
  { word: "lupa", parts: ["Lu", "Pa"], artId: "word-lupa", emoji: "🔍", syllableCount: 2, rank: 8 },
  { word: "tela", parts: ["Te", "La"], artId: "word-tela", emoji: "🧵", syllableCount: 2, rank: 9 },
  // tier-2 (d/n) all-open
  { word: "dedo", parts: ["De", "Do"], artId: "word-dedo", emoji: "👆", syllableCount: 2, rank: 10 },
  { word: "dado", parts: ["Da", "Do"], artId: "word-dado", emoji: "🎲", syllableCount: 2, rank: 11 },
  { word: "nido", parts: ["Ni", "Do"], artId: "word-nido", emoji: "🪹", syllableCount: 2, rank: 12 },
  { word: "luna", parts: ["Lu", "Na"], artId: "word-luna", emoji: "🌙", syllableCount: 2, rank: 13 },
  // tier-3 (b/c/f/g/j/r…) all-open
  { word: "boca", parts: ["Bo", "Ca"], artId: "word-boca", emoji: "👄", syllableCount: 2, rank: 14 },
  { word: "casa", parts: ["Ca", "Sa"], artId: "word-casa", emoji: "🏠", syllableCount: 2, rank: 15 },
  { word: "gato", parts: ["Ga", "To"], artId: "word-gato", emoji: "🐱", syllableCount: 2, rank: 16 },
  { word: "rana", parts: ["Ra", "Na"], artId: "word-rana", emoji: "🐸", syllableCount: 2, rank: 17 },
  // tier-4 / closed — the "especiales" zone
  { word: "taza", parts: ["Ta", "Za"], artId: "word-taza", emoji: "☕", syllableCount: 2, rank: 18 },
  { word: "limón", parts: ["Li", "Món"], artId: "word-limon", emoji: "🍋", syllableCount: 2, rank: 19 },
  { word: "gallo", parts: ["Ga", "Llo"], artId: "word-gallo", emoji: "🐓", syllableCount: 2, rank: 20 },
  { word: "perro", parts: ["Pe", "Rro"], artId: "word-perro", emoji: "🐶", syllableCount: 2, rank: 21 },
];

/**
 * Embedded fallback catalog (three-syllable). Mirrors the easiest few rows of
 * data/words-3syllables.csv so the 3-syllable level works offline / file://.
 * @type {Array<{word: string, parts: string[], artId: string, emoji: string, syllableCount: number, rank: number}>}
 */
export const WORDS_3 = [
  // all-open tier-1 (m/p/l/s/t) first
  { word: "maleta", parts: ["Ma", "Le", "Ta"], artId: "word-maleta", emoji: "🧳", syllableCount: 3, rank: 1 },
  { word: "paloma", parts: ["Pa", "Lo", "Ma"], artId: "word-paloma", emoji: "🕊️", syllableCount: 3, rank: 2 },
  { word: "pelota", parts: ["Pe", "Lo", "Ta"], artId: "word-pelota", emoji: "⚽", syllableCount: 3, rank: 3 },
  { word: "tomate", parts: ["To", "Ma", "Te"], artId: "word-tomate", emoji: "🍅", syllableCount: 3, rank: 4 },
  // tier-3 (b/c) all-open — after the tier-1 words, alphabetical tiebreak
  { word: "banana", parts: ["Ba", "Na", "Na"], artId: "word-banana", emoji: "🍌", syllableCount: 3, rank: 5 },
  { word: "camisa", parts: ["Ca", "Mi", "Sa"], artId: "word-camisa", emoji: "👕", syllableCount: 3, rank: 6 },
  // tier-4 / z / ll — the "especiales" zone (last)
  { word: "cabeza", parts: ["Ca", "Be", "Za"], artId: "word-cabeza", emoji: "🗣️", syllableCount: 3, rank: 7 },
  { word: "cereza", parts: ["Ce", "Re", "Za"], artId: "word-cereza", emoji: "🍒", syllableCount: 3, rank: 8 },
  { word: "zapato", parts: ["Za", "Pa", "To"], artId: "word-zapato", emoji: "👟", syllableCount: 3, rank: 9 },
  { word: "semilla", parts: ["Se", "Mi", "Lla"], artId: "word-semilla", emoji: "🌱", syllableCount: 3, rank: 10 },
  { word: "gallina", parts: ["Ga", "Lli", "Na"], artId: "word-gallina", emoji: "🐔", syllableCount: 3, rank: 11 },
];

/**
 * Embedded fallback catalog (four-syllable, iteration 6 / AC-J2.3). Mirrors the
 * easiest rows of data/words-4syllables.csv so the 4-syllable levels work
 * offline / from file://.
 * @type {Array<{word: string, parts: string[], artId: string, emoji: string, syllableCount: number, rank: number}>}
 */
export const WORDS_4 = [
  // all-open tier-1/2 first
  { word: "tomatito", parts: ["To", "Ma", "Ti", "To"], artId: "word-tomate", emoji: "🍅", syllableCount: 4, rank: 1 },
  { word: "pelotita", parts: ["Pe", "Lo", "Ti", "Ta"], artId: "word-pelota", emoji: "⚽", syllableCount: 4, rank: 2 },
  { word: "maletita", parts: ["Ma", "Le", "Ti", "Ta"], artId: "word-maleta", emoji: "🧳", syllableCount: 4, rank: 3 },
  { word: "limonada", parts: ["Li", "Mo", "Na", "Da"], artId: "word-limonada", emoji: "🍹", syllableCount: 4, rank: 4 },
  // all-open tier-3
  { word: "mariposa", parts: ["Ma", "Ri", "Po", "Sa"], artId: "word-mariposa", emoji: "🦋", syllableCount: 4, rank: 5 },
  { word: "caracola", parts: ["Ca", "Ra", "Co", "La"], artId: "word-caracola", emoji: "🐚", syllableCount: 4, rank: 6 },
  { word: "telaraña", parts: ["Te", "La", "Ra", "Ña"], artId: "word-telarana", emoji: "🕸️", syllableCount: 4, rank: 7 },
  // especiales (tier-4 / closed / digraph) last
  { word: "calabaza", parts: ["Ca", "La", "Ba", "Za"], artId: "word-calabaza", emoji: "🎃", syllableCount: 4, rank: 8 },
  { word: "elefante", parts: ["E", "Le", "Fan", "Te"], artId: "word-elefante", emoji: "🐘", syllableCount: 4, rank: 9 },
  { word: "chocolate", parts: ["Cho", "Co", "La", "Te"], artId: "word-chocolate", emoji: "🍫", syllableCount: 4, rank: 10 },
];

// Loaded inventory (filled by loadInventory). Null until a load is attempted.
let loaded2 = null;
let loaded3 = null;
let loaded4 = null;

/** Map a level id to the syllable count it practises. */
function syllableCountForLevel(levelId) {
  if (levelId === "palabras-4") return 4;
  if (levelId === "palabras-3") return 3;
  return 2;
}

/**
 * Title-case a single syllable, preserving accents (e.g. "má" -> "Má").
 * @param {string} s
 * @returns {string}
 */
function titleCaseSyllable(s) {
  if (!s) return s;
  return s.charAt(0).toLocaleUpperCase("es") + s.slice(1);
}

/**
 * Strip Spanish accents for comparison / keying (má -> ma, niño -> nino).
 * @param {string} s
 * @returns {string}
 */
function stripAccents(s) {
  return String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u0303\u0308]/g, "")
    .normalize("NFC");
}

// ---- Pedagogical ordering helpers (iteration 4, H2) -----------------------
// Pure, accent-insensitive helpers that make the "easiest-first" order
// machine-checkable. They operate on a word string OR an array of hyphen parts.

/** Spanish vowels (accent already stripped before these are consulted). */
const VOWELS = new Set(["a", "e", "i", "o", "u"]);

/**
 * Normalize a word-or-parts argument into a lowercase, accent-free word string.
 * Accepts "mapa", ["Ma","Pa"], or "ma-pa".
 * @param {string|string[]} wordOrParts
 * @returns {string}
 */
function toWordString(wordOrParts) {
  const raw = Array.isArray(wordOrParts)
    ? wordOrParts.join("")
    : String(wordOrParts || "").replace(/-/g, "");
  return stripAccents(raw).toLowerCase();
}

/**
 * The hardest (highest) consonant tier present in a word. Digraphs ch/ll/rr are
 * single tier-4 units; z,y,x,w are tier-4; f,b,v,c,k,g,j and single r are
 * tier-3; d,n,ñ are tier-2; m,p,l,s,t are tier-1; vowels are ignored. "qu"/"gu"
 * fold into the c/k/g family (tier-3). Returns 1 when no consonant is present.
 * Pure, accent-insensitive.
 * @param {string|string[]} wordOrParts
 * @returns {1|2|3|4}
 */
export function hardestConsonantTier(wordOrParts) {
  const w = toWordString(wordOrParts);
  let tier = 1;
  const bump = (t) => {
    if (t > tier) tier = t;
  };
  for (let i = 0; i < w.length; i++) {
    const ch = w[i];
    const two = w.slice(i, i + 2);
    // Digraphs are single tier-4 units; consume both letters.
    if (two === "ch" || two === "ll" || two === "rr") {
      bump(4);
      i++;
      continue;
    }
    if (VOWELS.has(ch)) continue; // vowels ignored (incl. the u in qu/gu)
    if (ch === "ñ") {
      bump(2);
      continue;
    }
    if ("zyxw".includes(ch)) {
      bump(4);
      continue;
    }
    if ("fbvckgjr".includes(ch)) {
      // single r reaches here (rr already consumed above as tier 4)
      bump(3);
      continue;
    }
    if ("dn".includes(ch)) {
      bump(2);
      continue;
    }
    if ("mplst".includes(ch)) {
      bump(1);
      continue;
    }
    // any other letter (accents already stripped): treat as tier 3, cautious.
    bump(3);
  }
  return tier;
}

/**
 * Whether a word contains a Spanish digraph ch, ll, or rr. Pure,
 * accent-insensitive.
 * @param {string|string[]} wordOrParts
 * @returns {boolean}
 */
export function hasDigraph(wordOrParts) {
  const w = toWordString(wordOrParts);
  return /ch|ll|rr/.test(w);
}

/**
 * Whether any syllable is NOT a bare open CV/V form — i.e. it ends in a
 * consonant (closed/inverse) or carries a consonant cluster (trabada). The
 * digraphs ch/ll/rr count as a single onset consonant, so "lla" stays open.
 * Operates on the hyphen-split parts (array, or a hyphenated string). Pure.
 * @param {string|string[]} parts
 * @returns {boolean}
 */
export function hasClosedSyllable(parts) {
  const list = Array.isArray(parts)
    ? parts
    : String(parts || "").split("-");
  for (const partRaw of list) {
    const p = stripAccents(String(partRaw).trim()).toLowerCase();
    if (!p) continue;
    // Collapse digraphs to a single placeholder consonant so the onset of e.g.
    // "lla"/"cha" is treated as one consonant, not a cluster.
    const s = p.replace(/ch|ll|rr/g, "c");
    // Must end in a vowel to be open (CV / V / CCV-with-vowel-end is allowed
    // only when the vowel is final; a trailing consonant => closed).
    const last = s[s.length - 1];
    if (!VOWELS.has(last)) return true; // ends in a consonant → closed/inverse
    // Detect an onset cluster: two consonants in a row before the vowel core.
    if (/[^aeiou]{2}/.test(s)) return true; // trabada (e.g. "pla", "tre")
  }
  return false;
}

/** Rank for syllable type: 0 = all-open CV/V, 1 = has a closed/cluster part. */
function syllableTypeRank(parts) {
  return hasClosedSyllable(parts) ? 1 : 0;
}

/**
 * Derive a comparable ordering key from a row's word + syllables, independent
 * of difficulty_rank: [consonantTier, syllableTypeRank, length, word]. Used by
 * the correctness test to verify the file order follows the pedagogical rule.
 * Accepts a raw CSV row ({word, syllables}) or a mapped item ({word, parts}).
 * Pure.
 * @param {{word?: string, syllables?: string, parts?: string[]}} row
 * @returns {[number, number, number, string]}
 */
export function expectedTierKey(row) {
  const word = String((row && row.word) || "");
  const parts = row && Array.isArray(row.parts)
    ? row.parts
    : String((row && row.syllables) || "").split("-");
  const tier = hardestConsonantTier(word);
  const typeRank = syllableTypeRank(parts);
  const length = stripAccents(word).length;
  const key = stripAccents(word).toLowerCase();
  return [tier, typeRank, length, key];
}

/**
 * Parse CSV text into an array of row objects keyed by the header row.
 * Pure. Handles a trailing newline, CRLF, blank lines, and simple
 * double-quoted fields (with "" escaping). No external dependency.
 * @param {string} text
 * @returns {Array<Record<string, string>>}
 */
export function parseCsv(text) {
  if (typeof text !== "string") return [];
  const lines = splitCsvLines(text).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = parseCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const row = {};
    for (let c = 0; c < header.length; c++) {
      row[header[c]] = cells[c] !== undefined ? cells[c] : "";
    }
    rows.push(row);
  }
  return rows;
}

/** Split CSV text into logical lines, respecting quoted newlines. */
function splitCsvLines(text) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      cur += ch;
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && text[i + 1] === "\n") i++; // consume CRLF pair
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.length > 0) out.push(cur);
  return out;
}

/** Parse a single CSV line into an array of cells. */
function parseCsvLine(line) {
  const cells = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      cells.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

/**
 * Validate a parsed CSV row (AC-G4.2): the syllable parts join to the word and
 * `syllable_count` matches the number of parts. Comparison ignores accents and
 * case. Pure.
 * @param {Record<string,string>} row
 * @returns {boolean}
 */
export function rowIntegrity(row) {
  if (!row || typeof row.word !== "string" || typeof row.syllables !== "string") {
    return false;
  }
  const parts = row.syllables.split("-").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return false;
  const count = Number(row.syllable_count);
  if (!Number.isInteger(count) || count !== parts.length) return false;
  const joined = stripAccents(parts.join("")).toLowerCase();
  const word = stripAccents(row.word).toLowerCase();
  return joined === word;
}

/**
 * Whether rows are ordered by non-decreasing `difficulty_rank` (AC-G4.2).
 * Accepts either raw CSV rows (`difficulty_rank`) or mapped items (`rank`).
 * Pure.
 * @param {Array<Record<string, any>>} rows
 * @returns {boolean}
 */
export function isOrderedByRank(rows) {
  if (!Array.isArray(rows)) return false;
  let prev = -Infinity;
  for (const r of rows) {
    const rank = Number(r.difficulty_rank !== undefined ? r.difficulty_rank : r.rank);
    if (!Number.isFinite(rank)) return false;
    if (rank < prev) return false;
    prev = rank;
  }
  return true;
}

/**
 * Map a parsed CSV row into a game inventory item.
 * @param {Record<string,string>} row
 * @returns {{word: string, parts: string[], artId: string, emoji: string, syllableCount: number, rank: number}}
 */
function rowToItem(row) {
  const parts = row.syllables
    .split("-")
    .map((p) => p.trim())
    .filter(Boolean)
    .map(titleCaseSyllable);
  return {
    word: row.word,
    parts,
    artId: row.art_id || "",
    emoji: row.emoji || "",
    syllableCount: Number(row.syllable_count) || parts.length,
    rank: Number(row.difficulty_rank) || 0,
  };
}

/**
 * Load both CSV inventory files once at startup and cache them. On any fetch
 * or parse failure the embedded fallback stays in effect (AC-G4.4). Safe to
 * call more than once (later calls re-fetch and refresh the cache).
 * @param {{fetchImpl?: typeof fetch, base?: string}} [opts]
 * @returns {Promise<{two: object[], three: object[], four: object[]}>}
 */
export async function loadInventory(opts = {}) {
  const fetchImpl =
    opts.fetchImpl || (typeof fetch === "function" ? fetch.bind(globalThis) : null);
  const base = opts.base || "./data/";
  if (!fetchImpl) {
    // No fetch available (e.g. plain Node without the flag): keep fallbacks.
    return {
      two: forLevel("palabras"),
      three: forLevel("palabras-3"),
      four: forLevel("palabras-4"),
    };
  }

  const two = await loadOne(fetchImpl, `${base}words-2syllables.csv`);
  const three = await loadOne(fetchImpl, `${base}words-3syllables.csv`);
  const four = await loadOne(fetchImpl, `${base}words-4syllables.csv`);

  if (two && two.length) loaded2 = two;
  if (three && three.length) loaded3 = three;
  if (four && four.length) loaded4 = four;

  return {
    two: forLevel("palabras"),
    three: forLevel("palabras-3"),
    four: forLevel("palabras-4"),
  };
}

/** Fetch + parse a single CSV file into items; returns null on any failure. */
async function loadOne(fetchImpl, url) {
  try {
    const res = await fetchImpl(url);
    if (!res || !res.ok) return null;
    const text = await res.text();
    const rows = parseCsv(text).filter(rowIntegrity);
    if (!rows.length) return null;
    return rows.map(rowToItem);
  } catch (_e) {
    return null;
  }
}

/** Whether the live inventory has been loaded for a given count. */
export function isLoaded(syllableCount = 2) {
  if (syllableCount === 4) return Boolean(loaded4);
  if (syllableCount === 3) return Boolean(loaded3);
  return Boolean(loaded2);
}

/**
 * Return the word list for a word level. Served from the loaded CSV inventory
 * when available, otherwise from the embedded fallback (AC-G4.1/G4.4). Returns
 * a defensive copy so callers can't mutate the cache.
 * @param {string} [levelId]
 * @returns {Array<{word: string, parts: string[], artId: string, emoji: string, syllableCount: number, rank: number}>}
 */
export function forLevel(levelId = "palabras") {
  const count = syllableCountForLevel(levelId);
  const live = count === 4 ? loaded4 : count === 3 ? loaded3 : loaded2;
  const fallback = count === 4 ? WORDS_4 : count === 3 ? WORDS_3 : WORDS;
  const source = live && live.length ? live : fallback;
  return source.map((w) => ({ ...w, parts: [...w.parts] }));
}

/**
 * Look up a word entry by its word string across both inventories (and the
 * embedded fallbacks). Accent/case-insensitive.
 * @param {string} word
 * @returns {object|null}
 */
export function byWord(word) {
  const key = stripAccents(String(word)).toLowerCase();
  const pools = [loaded2, loaded3, loaded4, WORDS, WORDS_3, WORDS_4];
  for (const pool of pools) {
    if (!pool) continue;
    const found = pool.find((w) => stripAccents(w.word).toLowerCase() === key);
    if (found) return { ...found, parts: [...found.parts] };
  }
  return null;
}

/**
 * Filter a word level's inventory into a pedagogical "band" (iteration 5, D1).
 * Pure selector built on the already-tested helpers (`hardestConsonantTier`,
 * `hasDigraph`, `hasClosedSyllable`). Used by `levels.js` so the word-based
 * level map is derived from the CSV data, not hand-listed twice.
 *
 * @param {{count?: number, tiers?: Iterable<number>, special?: boolean}} spec
 *   count   2 (default) or 3 — which inventory to draw from.
 *   tiers   consonant tiers to include (1..4). Defaults to all tiers.
 *   special when true  → keep only "especiales": tier-4 (digraph/z/y/x/w) OR
 *                        closed-syllable words (the hard zone).
 *           when false → keep only the "easy" open-CV, non-digraph words of the
 *                        requested tiers.
 *           when undefined → no special/open filtering (tier filter only).
 * @returns {Array<{word: string, parts: string[], artId: string, emoji: string, syllableCount: number, rank: number}>}
 */
export function forBand(spec = {}) {
  const count = spec.count === 4 ? 4 : spec.count === 3 ? 3 : 2;
  const levelId =
    count === 4 ? "palabras-4" : count === 3 ? "palabras-3" : "palabras";
  const tierSet = spec.tiers ? new Set([...spec.tiers]) : null;
  const items = forLevel(levelId);
  return items.filter((it) => {
    const tier = hardestConsonantTier(it.parts);
    if (tierSet && !tierSet.has(tier)) return false;
    if (spec.special === true) {
      // "especiales": the hard words — tier-4 (digraph/z/y/x/w) or closed.
      return tier === 4 || hasDigraph(it.parts) || hasClosedSyllable(it.parts);
    }
    if (spec.special === false) {
      // "fáciles": open-CV, non-digraph, non-tier-4 words only.
      return tier !== 4 && !hasDigraph(it.parts) && !hasClosedSyllable(it.parts);
    }
    return true;
  });
}

/**
 * Validate that an entry's parts concatenate to its word (accent/case
 * insensitive). Exposed for tests / integrity checks.
 * @param {{word: string, parts: string[]}} entry
 * @returns {boolean}
 */
export function partsMatchWord(entry) {
  if (!entry || !Array.isArray(entry.parts)) return false;
  const joined = stripAccents(entry.parts.join("")).toLowerCase();
  return joined === stripAccents(String(entry.word)).toLowerCase();
}
