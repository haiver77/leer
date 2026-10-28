// audio.js — model(id): play a bundled audio clip if present, else fall back
// to Web Speech TTS (speech.speak). Designed so real recorded clips drop in
// later with zero changes elsewhere.
//
// To add real audio: drop files in app/audio/ and register them in CLIPS, e.g.
//   "Pa": "./audio/pa.mp3". Until then every id falls through to TTS, which is
// exactly the spec's intended behavior (recorded clips are a drop-in later).

import * as speech from "./speech.js";

/**
 * Registry of bundled clips, keyed by the exact item id (syllable or word).
 * Empty for now — no recorded clips shipped yet, so everything uses TTS.
 * When clips are added they MUST also be listed in sw.js for offline caching.
 * @type {Record<string, string>}
 */
export const CLIPS = {
  // "Pa": "./audio/pa.mp3",
  // "pato": "./audio/pato.mp3",
};

const hasAudio = typeof Audio !== "undefined";
const cache = new Map();

/** Whether a bundled clip exists for this id. */
export function hasClip(id) {
  return Object.prototype.hasOwnProperty.call(CLIPS, id);
}

/**
 * Try to play a bundled clip. Resolves true if it played, false otherwise
 * (missing clip, no Audio element, or load/playback error) so the caller can
 * fall back to TTS. Never throws.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
function playClip(id) {
  return new Promise((resolve) => {
    if (!hasAudio || !hasClip(id)) {
      resolve(false);
      return;
    }
    try {
      let el = cache.get(id);
      if (!el) {
        el = new Audio(CLIPS[id]);
        el.preload = "auto";
        cache.set(id, el);
      }
      el.currentTime = 0;
      const onDone = () => {
        cleanup();
        resolve(true);
      };
      const onFail = () => {
        cleanup();
        resolve(false);
      };
      const cleanup = () => {
        el.removeEventListener("ended", onDone);
        el.removeEventListener("error", onFail);
      };
      el.addEventListener("ended", onDone, { once: true });
      el.addEventListener("error", onFail, { once: true });
      const p = el.play();
      if (p && typeof p.catch === "function") p.catch(() => onFail());
    } catch (_e) {
      resolve(false);
    }
  });
}

/**
 * Model an item's pronunciation: prefer a bundled clip, fall back to TTS.
 * Always resolves (never dead-ends), even with no audio support at all.
 * @param {string} id the syllable or word to pronounce (e.g. "Pa", "pato")
 * @returns {Promise<void>}
 */
export async function model(id) {
  if (!id) return;
  const played = await playClip(id);
  if (!played) {
    await speech.speak(id);
  }
}
