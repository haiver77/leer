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

// ---- Background music (iteration 9, D8 / AC-M8) ----------------------------
// A soft, gentle, Web-Audio-generated loop (no files, no library). It starts
// only after a user gesture (autoplay policy), stays at a low volume, ducks to
// near-silence during read-aloud and the mic listen window (driven by game.js),
// and stops on request. All guarded so importing this module in Node is a no-op.

const MUSIC_BASE_GAIN = 0.045; // low, gentle
const MUSIC_DUCK_GAIN = 0.006; // near-silent while reading/listening
// A soft, slow pentatonic arpeggio (C major pentatonic across two octaves).
const MUSIC_NOTES = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63];
const MUSIC_STEP_MS = 650;

let musicCtx = null;
let musicGain = null;
let musicTimer = null;
let musicStep = 0;
let musicOn = false;

function AudioCtxCtor() {
  if (typeof window === "undefined") return null;
  return window.AudioContext || window.webkitAudioContext || null;
}

/** Whether the background music is currently playing. */
export function isMusicPlaying() {
  return musicOn;
}

/**
 * Start the soft background melody. Idempotent. Must be called from (or after)
 * a user gesture so the AudioContext can run. Safe no-op where Web Audio is
 * unavailable. Never throws.
 */
export function startMusic() {
  const Ctor = AudioCtxCtor();
  if (!Ctor) return;
  try {
    if (!musicCtx) {
      musicCtx = new Ctor();
      musicGain = musicCtx.createGain();
      musicGain.gain.value = MUSIC_BASE_GAIN;
      musicGain.connect(musicCtx.destination);
    }
    if (musicCtx.state === "suspended") musicCtx.resume();
    if (musicOn) return;
    musicOn = true;
    musicStep = 0;
    scheduleMusicStep();
  } catch (_e) {
    /* audio is a bonus; never block the game */
  }
}

/** Play the next soft note and queue the following one while music is on. */
function scheduleMusicStep() {
  if (!musicOn || !musicCtx || !musicGain) return;
  try {
    const now = musicCtx.currentTime;
    const freq = MUSIC_NOTES[musicStep % MUSIC_NOTES.length];
    const osc = musicCtx.createOscillator();
    const g = musicCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    // soft bell-like envelope per note
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.8, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    osc.connect(g).connect(musicGain);
    osc.start(now);
    osc.stop(now + 0.6);
    musicStep += 1;
  } catch (_e) {
    /* ignore a single bad note */
  }
  musicTimer = setTimeout(scheduleMusicStep, MUSIC_STEP_MS);
}

/** Stop the background melody and release the step timer. Never throws. */
export function stopMusic() {
  musicOn = false;
  if (musicTimer) {
    clearTimeout(musicTimer);
    musicTimer = null;
  }
  try {
    if (musicGain) musicGain.gain.value = MUSIC_BASE_GAIN; // reset for next time
  } catch (_e) {
    /* ignore */
  }
}

/**
 * Duck (lower) or restore the music volume. game.js ducks around read-aloud and
 * while the mic is listening so music never covers TTS/ASR (AC-M8.2). No-op if
 * music isn't initialised. Never throws.
 * @param {boolean} on true = duck (quiet), false = restore
 */
export function duckMusic(on) {
  if (!musicCtx || !musicGain) return;
  try {
    const target = on ? MUSIC_DUCK_GAIN : MUSIC_BASE_GAIN;
    const now = musicCtx.currentTime;
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setTargetAtTime(target, now, 0.08);
  } catch (_e) {
    /* ignore */
  }
}
