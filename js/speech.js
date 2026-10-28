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

/**
 * Try to find a Spanish voice. Voices may load asynchronously, so we also
 * listen for `voiceschanged` once.
 * @returns {SpeechSynthesisVoice|null}
 */
function pickSpanishVoice() {
  if (!synthesisSupported) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  return (
    voices.find((v) => /^es(-|_|$)/i.test(v.lang)) ||
    voices.find((v) => /spanish|español/i.test(v.name)) ||
    null
  );
}

// Warm up the voice list (Chrome populates it lazily).
if (synthesisSupported) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

/**
 * Speak the given text in Spanish. Resolves when done (or immediately/safely
 * if synthesis or an es voice is unavailable — never throws, never dead-ends).
 * @param {string} text
 * @returns {Promise<void>}
 */
export function speak(text) {
  return new Promise((resolve) => {
    if (!synthesisSupported) {
      resolve();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(String(text));
      utter.lang = "es-ES";
      utter.rate = 0.85; // a touch slower for young readers
      utter.pitch = 1.1;
      const voice = pickSpanishVoice();
      if (voice) utter.voice = voice;
      utter.onend = () => resolve();
      utter.onerror = () => resolve();
      window.speechSynthesis.speak(utter);
      // Safety net in case onend never fires.
      setTimeout(resolve, 4000);
    } catch (_e) {
      resolve();
    }
  });
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
