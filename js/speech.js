// speech.js — thin wrapper over the Web Speech API (synthesis + recognition)
// with capability detection, Spanish locale, and a pure normalization helper.
//
// `normalize` is pure (no browser deps) and is exported for unit testing.

/**
 * Normalize text for matching: lowercase, strip diacritics/accents,
 * remove punctuation, collapse and trim whitespace.
 * e.g. "¡Pá!" -> "pa", " Se " -> "se", "TÉ." -> "te"
 * @param {string} text
 * @returns {string}
 */
export function normalize(text) {
  if (text == null) return "";
  return String(text)
    .toLowerCase()
    .normalize("NFD") // split base char + combining diacritic
    .replace(/[\u0300-\u036f]/g, "") // drop diacritics
    .replace(/[^\p{L}\p{N}\s]/gu, "") // drop punctuation/symbols
    .replace(/\s+/g, " ")
    .trim();
}

// ---- Pure classification (child-lenient matcher) — unit-testable in Node ----

// Vowel groups that young voices commonly blur together.
const CLOSE_VOWELS = [
  ["e", "i"],
  ["o", "u"],
];

// Consonant pairs that differ only by voicing (or are commonly swapped by
// young/learning speakers) and should count as a NEAR miss, not a hard miss.
const NEAR_CONSONANTS = [
  ["p", "b"],
  ["t", "d"],
  ["c", "g"],
  ["k", "g"],
  ["s", "z"],
  ["b", "v"],
  ["l", "r"],
  ["m", "n"],
];

/** Map a normalized char to a canonical "close vowel" bucket. */
function vowelClass(ch) {
  for (const group of CLOSE_VOWELS) {
    if (group.includes(ch)) return group[0];
  }
  return ch;
}

/** Collapse common digraphs to a single comparison token. */
function canonicalize(norm) {
  return norm
    .replace(/ch/g, "C") // treat "ch" as one sound
    .replace(/ll/g, "Y")
    .replace(/rr/g, "R")
    .replace(/qu/g, "k")
    .replace(/gu/g, "g");
}

/** Are two single letters a "near" (voicing/common-swap) pair? */
function nearConsonant(a, b) {
  if (a === b) return true;
  return NEAR_CONSONANTS.some(
    ([x, y]) => (a === x && b === y) || (a === y && b === x)
  );
}

/**
 * Compare a single spoken token to the target under lenient rules.
 * Returns "match", "near", or "miss".
 * @param {string} targetNorm normalized target (e.g. "pa")
 * @param {string} tokenNorm normalized spoken token
 * @returns {"match"|"near"|"miss"}
 */
function compareToken(targetNorm, tokenNorm) {
  if (!tokenNorm) return "miss";
  const t = canonicalize(targetNorm);
  const s = canonicalize(tokenNorm);

  if (t === s) return "match";

  // Close-vowel leniency: same except an interchangeable vowel → match.
  if (t.length === s.length) {
    let vowelOnlyDiff = true;
    let consonantNearDiff = 0;
    let hardDiff = 0;
    for (let i = 0; i < t.length; i++) {
      if (t[i] === s[i]) continue;
      const bothVowels = "aeiou".includes(t[i]) && "aeiou".includes(s[i]);
      if (bothVowels && vowelClass(t[i]) === vowelClass(s[i])) {
        continue; // interchangeable vowel — counts as match-level
      }
      vowelOnlyDiff = false;
      if (!bothVowels && nearConsonant(t[i], s[i])) {
        consonantNearDiff += 1;
      } else {
        hardDiff += 1;
      }
    }
    if (vowelOnlyDiff) return "match";
    if (hardDiff === 0 && consonantNearDiff <= 1) return "near";
    if (hardDiff <= 1 && consonantNearDiff + hardDiff <= 2) return "near";
  }

  // Length-1 edit (child dropped/added a sound) → near.
  if (Math.abs(t.length - s.length) === 1) {
    const [shorter, longer] = t.length < s.length ? [t, s] : [s, t];
    if (longer.includes(shorter) || longer.startsWith(shorter)) return "near";
  }

  return "miss";
}

/**
 * Classify a transcript against a target with child leniency.
 * Splits the transcript into whitespace tokens and takes the best outcome of
 * any token (so a syllable spoken inside a short phrase still matches).
 * PURE: no browser APIs — safe to unit-test in Node.
 *
 * @param {string} target the syllable/word the child should say
 * @param {string} transcript what recognition heard (may be a phrase)
 * @returns {"match"|"near"|"miss"}
 */
export function classify(target, transcript) {
  const targetNorm = normalize(target);
  const transNorm = normalize(transcript);
  if (!targetNorm || !transNorm) return "miss";

  const tokens = transNorm.split(" ").filter(Boolean);
  // Also consider the whole transcript as one token (for multi-syllable words).
  const candidates = [transNorm, ...tokens];

  let best = "miss";
  for (const tok of candidates) {
    const r = compareToken(targetNorm, tok);
    if (r === "match") return "match";
    if (r === "near") best = "near";
  }
  return best;
}

// ---- Browser-only below (guarded so the module can still be imported in Node) ----

const hasWindow = typeof window !== "undefined";

const SpeechRecognitionCtor = hasWindow
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : undefined;

/** True when the browser exposes a SpeechRecognition implementation. */
export const recognitionSupported = Boolean(SpeechRecognitionCtor);

/** True when speech synthesis is available. */
export const synthesisSupported = hasWindow && "speechSynthesis" in window;

// ---- Pure Spanish-voice selection (AC-I2.1) — unit-testable in Node ---------

/**
 * Normalize a voice's lang tag for bucketing: lowercase, "_" → "-".
 * e.g. "es_AR" → "es-ar", "ES" → "es".
 * @param {string} lang
 * @returns {string}
 */
function normLang(lang) {
  return String(lang || "").toLowerCase().replace(/_/g, "-");
}

/**
 * Rank a single voice by Spanish-preference bucket (lower = better). Buckets:
 *   0 es-ES · 1 es-MX · 2 es-US · 3 es-419 · 4 any other es-* ·
 *   5 name contains spanish/español · 6 (not Spanish → excluded by caller).
 * @param {{lang?: string, name?: string}} v
 * @returns {number} 0..5 for a Spanish voice, 6 when not Spanish
 */
function spanishBucket(v) {
  const lang = normLang(v && v.lang);
  if (lang === "es-es") return 0;
  if (lang === "es-mx") return 1;
  if (lang === "es-us") return 2;
  if (lang === "es-419") return 3;
  if (/^es(-|$)/.test(lang)) return 4; // any other es-* (incl. bare "es")
  if (/spanish|español/i.test((v && v.name) || "")) return 5;
  return 6;
}

/**
 * Pick the best Spanish voice from a list, or null when none qualifies. PURE —
 * takes an array of plain {lang,name?,localService?,default?} objects, uses no
 * browser globals, so it can be unit-tested in Node (AC-I2.1).
 *
 * Preference: es-ES > es-MX > es-US > es-419 > any other es-* (case/-/_
 * insensitive) > name contains spanish/español > null. Within the same bucket,
 * a localService or default voice is preferred as a stable tiebreak.
 *
 * @param {Array<{lang?: string, name?: string, localService?: boolean, default?: boolean}>} voices
 * @returns {object|null}
 */
export function pickSpanishVoice(voices) {
  if (!Array.isArray(voices) || voices.length === 0) return null;
  let best = null;
  let bestBucket = 6;
  let bestTie = -1;
  for (const v of voices) {
    if (!v) continue;
    const bucket = spanishBucket(v);
    if (bucket >= 6) continue; // not a Spanish voice
    // Tiebreak within a bucket: prefer localService, then default.
    const tie = (v.localService ? 2 : 0) + (v.default ? 1 : 0);
    if (bucket < bestBucket || (bucket === bestBucket && tie > bestTie)) {
      best = v;
      bestBucket = bucket;
      bestTie = tie;
    }
  }
  return best;
}

/**
 * Whether the list contains any Spanish voice (lang es-* or name-matched).
 * PURE. Drives the adult-facing "no Spanish voice" notice (AC-I2.5).
 * @param {Array<{lang?: string, name?: string}>} voices
 * @returns {boolean}
 */
export function hasSpanishVoice(voices) {
  return pickSpanishVoice(voices) !== null;
}

// ---- Voice identity + override (iteration 7, D3 / AC-K3) --------------------

/**
 * A stable id for a voice: prefer the standard `voiceURI`, else a
 * `name|lang` composite. Used both to persist the adult's choice and to match a
 * stored preference back to an installed voice. PURE — unit-testable in Node.
 * @param {{voiceURI?: string, name?: string, lang?: string}} voice
 * @returns {string}
 */
export function voiceId(voice) {
  if (!voice) return "";
  if (voice.voiceURI) return String(voice.voiceURI);
  return `${voice.name || ""}|${voice.lang || ""}`;
}

/**
 * Resolve which voice `speak` should use: the adult's chosen voice when it is
 * present on the device (matched by voiceId), else the Spanish auto-pick, else
 * null. PURE — no browser globals, so it is unit-tested in Node (AC-K3.4).
 * @param {Array<object>} voices available voices
 * @param {string|null} preferredId the persisted voiceId, or null for "auto"
 * @returns {object|null}
 */
export function resolveVoice(voices, preferredId) {
  if (!Array.isArray(voices) || voices.length === 0) return null;
  if (preferredId) {
    const chosen = voices.find((v) => v && voiceId(v) === preferredId);
    if (chosen) return chosen;
  }
  return pickSpanishVoice(voices);
}

// The adult-chosen voice id (persisted by the app, applied here). null = auto.
let _preferredVoiceId = null;

/** Set the preferred voice id ("" / null = Automática). Never throws. */
export function setPreferredVoice(id) {
  _preferredVoiceId = id ? String(id) : null;
}

/** Get the current preferred voice id (or null for Automática). */
export function getPreferredVoice() {
  return _preferredVoiceId;
}

// ---- Browser voice state (drives the dashboard notice, AC-I2.5) -------------

// Tracks whether the last speak() found a Spanish voice. null = unknown (not
// yet attempted). Exposed to the UI via noSpanishVoiceDetected().
let _noSpanishVoice = null;

/** getVoices() helper, tolerant of missing synthesis. */
function getVoices() {
  if (!synthesisSupported) return [];
  return window.speechSynthesis.getVoices() || [];
}

/**
 * Enumerate the device's voices for the adult voice picker (AC-K3.1/K3.2),
 * Spanish-first. Each entry is `{ id, label, lang }` where `id` is the stable
 * voiceId and `label` is a human-readable "Name (lang)" string. Returns [] when
 * synthesis is unavailable. Does NOT include the "Automática" sentinel — the UI
 * prepends that option. Safe (never throws).
 * @returns {Array<{id: string, label: string, lang: string}>}
 */
export function availableVoices() {
  const voices = getVoices();
  if (!Array.isArray(voices) || voices.length === 0) return [];
  // Spanish-first: bucket (0..5 Spanish, 6 other), then name for stability.
  const sorted = [...voices].sort((a, b) => {
    const ba = spanishBucket(a);
    const bb = spanishBucket(b);
    if (ba !== bb) return ba - bb;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
  return sorted.map((v) => ({
    id: voiceId(v),
    label: `${v.name || "Voz"}${v.lang ? ` (${v.lang})` : ""}`,
    lang: v.lang || "",
  }));
}

/**
 * Resolve once the voice list is usable: when getVoices() is already non-empty,
 * when `voiceschanged` fires, or after a short timeout (so it never hangs).
 * Chrome populates voices lazily, so the first speak() must await this.
 * @param {number} [timeoutMs]
 * @returns {Promise<Array>}
 */
function awaitVoices(timeoutMs = 1500) {
  return new Promise((resolve) => {
    if (!synthesisSupported) {
      resolve([]);
      return;
    }
    const existing = getVoices();
    if (existing.length) {
      resolve(existing);
      return;
    }
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        window.speechSynthesis.removeEventListener("voiceschanged", onChange);
      } catch (_e) {
        /* older impls use onvoiceschanged only */
      }
      resolve(getVoices());
    };
    const onChange = () => done();
    try {
      window.speechSynthesis.addEventListener("voiceschanged", onChange);
    } catch (_e) {
      window.speechSynthesis.onvoiceschanged = onChange;
    }
    const timer = setTimeout(done, timeoutMs);
  });
}

// Warm up the voice list (Chrome populates it lazily) and keep the "no Spanish
// voice" flag fresh as voices arrive.
if (synthesisSupported) {
  const refresh = () => {
    const voices = getVoices();
    if (voices.length) _noSpanishVoice = !hasSpanishVoice(voices);
  };
  refresh();
  try {
    window.speechSynthesis.addEventListener("voiceschanged", refresh);
  } catch (_e) {
    window.speechSynthesis.onvoiceschanged = refresh;
  }
}

/**
 * Whether the app has detected that NO Spanish voice is installed. Returns
 * false until a determination is possible (list empty / not yet loaded), and
 * true only once a non-empty voice list is seen with no Spanish voice in it.
 * Read by the adult dashboard to show the voice notice (AC-I2.5).
 * @returns {boolean}
 */
export function noSpanishVoiceDetected() {
  return _noSpanishVoice === true;
}

/**
 * Speak the given text in Spanish. Awaits the voice list, re-picks the voice
 * every call via pickSpanishVoice(getVoices()), sets utter.lang to the picked
 * voice's lang (else "es-ES"), and records the "no Spanish voice" state when
 * none exists (AC-I2.2/I2.3). Resolves when done (or immediately/safely if
 * synthesis is unavailable — never throws, never dead-ends; AC-I2.6).
 * @param {string} text
 * @returns {Promise<void>}
 */
export async function speak(text) {
  if (!synthesisSupported) return;
  try {
    const voices = await awaitVoices();
    // Use the adult's chosen voice when present, else the Spanish auto-pick
    // (AC-K3.4). resolveVoice falls back to pickSpanishVoice internally.
    const voice = resolveVoice(voices, _preferredVoiceId);
    // Record whether a Spanish voice exists so the dashboard can warn. This is
    // independent of the adult's override (the notice reflects device voices).
    _noSpanishVoice = voices.length ? !pickSpanishVoice(voices) : _noSpanishVoice;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(String(text));
    utter.lang = voice && voice.lang ? voice.lang : "es-ES"; // best effort
    utter.rate = 0.85; // a touch slower for young readers
    utter.pitch = 1.1;
    if (voice) utter.voice = voice;
    await new Promise((resolve) => {
      utter.onend = () => resolve();
      utter.onerror = () => resolve();
      window.speechSynthesis.speak(utter);
      // Safety net in case onend never fires.
      setTimeout(resolve, 4000);
    });
  } catch (_e) {
    /* never throw, never dead-end */
  }
}

/**
 * Listen for a single spoken utterance and compare it to `target`.
 * Resolves on result, timeout, or error — never rejects, so callers never
 * dead-end. Reports `denied: true` when the mic permission is refused.
 *
 * @param {string} target the syllable the child should say
 * @param {{timeoutMs?: number}} [opts]
 * @returns {Promise<{transcript: string, outcome: "match"|"near"|"miss", matched: boolean, denied: boolean, supported: boolean}>}
 */
export function listen(target, opts = {}) {
  const timeoutMs = opts.timeoutMs ?? 7000;

  return new Promise((resolve) => {
    if (!recognitionSupported) {
      resolve({ transcript: "", outcome: "miss", matched: false, denied: false, supported: false });
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;
    recognition.continuous = false;

    let settled = false;
    const finish = (payload) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        recognition.stop();
      } catch (_e) {
        /* ignore */
      }
      resolve(payload);
    };

    recognition.onresult = (event) => {
      const alternatives = [];
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        for (let j = 0; j < result.length; j++) {
          alternatives.push(result[j].transcript);
        }
      }
      // Classify every alternative under the lenient matcher; take the best.
      let outcome = "miss";
      for (const alt of alternatives) {
        const r = classify(target, alt);
        if (r === "match") {
          outcome = "match";
          break;
        }
        if (r === "near") outcome = "near";
      }
      finish({
        transcript: alternatives[0] || "",
        outcome,
        matched: outcome === "match",
        denied: false,
        supported: true,
      });
    };

    recognition.onerror = (event) => {
      const denied = event.error === "not-allowed" || event.error === "service-not-allowed";
      finish({ transcript: "", outcome: "miss", matched: false, denied, supported: true });
    };

    recognition.onend = () => {
      finish({ transcript: "", outcome: "miss", matched: false, denied: false, supported: true });
    };

    const timer = setTimeout(() => {
      finish({ transcript: "", outcome: "miss", matched: false, denied: false, supported: true });
    }, timeoutMs);

    try {
      recognition.start();
    } catch (_e) {
      finish({ transcript: "", matched: false, denied: false, supported: true });
    }
  });
}
