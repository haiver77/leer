// game.js — expanded state machine orchestrating the iteration-2 experience:
//   welcome → onboarding → map → play (syllable | word) → summary →
//   sticker book → dashboard.
// Delegates persistence + mastery to progress.js, level rules to levels.js,
// rewards to rewards.js, speech leniency to speech.js, audio to audio.js.

import * as speech from "./speech.js";
import * as celebrate from "./celebrate.js";
import * as progress from "./progress.js";
import * as levels from "./levels.js";
import * as rewards from "./rewards.js";
import * as words from "./words.js";
import * as audio from "./audio.js";
import * as customize from "./customize.js";
import * as garden from "./garden.js";
import * as modes from "./modes.js";

const ADVANCE_DELAY_MS = 1200;

// Idle → sleeping cadence (iteration 9, D2 / AC-M2.4). After this long with no
// interaction while on the play screen, Lalo dozes; any input wakes him.
const IDLE_SLEEP_MS = 12000;

// Auto-listen (iteration 8, D2 / AC-L2) timing.
// After the optional auto-read, the mic opens by itself. A bounded safety
// timeout opens it even if a read never resolves; a small inter-attempt delay
// on near/miss re-opens spaces retries so a silent child never triggers a tight
// re-listen storm (AC-L2.6).
const AUTO_LISTEN_SAFETY_MS = 4500;
const AUTO_LISTEN_RETRY_MS = 500;

/**
 * Pick a random pool member, never equal to `exclude` (prevents immediate
 * repeats). Tiny inline selector so game.js no longer depends on syllables.js
 * (iteration 5, D1). Pure aside from Math.random.
 * @param {string[]} pool
 * @param {string|null} [exclude]
 * @returns {string}
 */
function pickRandom(pool, exclude = null) {
  if (!Array.isArray(pool) || pool.length === 0) {
    throw new Error("pickRandom: pool must be a non-empty array");
  }
  if (pool.length === 1) return pool[0];
  const candidates = exclude == null ? pool : pool.filter((s) => s !== exclude);
  const list = candidates.length > 0 ? candidates : pool;
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Create a game instance wired to UI callbacks.
 * @param {{
 *   onRender: (view: object) => void,
 *   onFeedback: (msg: string, kind: "neutral"|"success"|"retry"|"near") => void,
 *   onMascot: (state: "idle"|"cheer"|"encourage"|"model") => void,
 * }} handlers
 */
export function createGame(handlers, deps = {}) {
  // Test/override seam (iteration 8, AC-L2.8): under Node, speech.listen is a
  // no-op and speech.recognitionSupported is false, so auto-listen would never
  // initiate. `deps.recognitionSupported` lets a test force recognition "on" so
  // the auto-listen *initiation* is observable via `handlers.onListen`.
  const forcedRecognition =
    typeof deps.recognitionSupported === "boolean"
      ? deps.recognitionSupported
      : null;
  const p = progress.load();
  progress.ensureDailyGoal(p);
  // Iteration 9 (D1 / AC-M1.5): drop any equipped Lalo item that is not
  // currently unlocked for this progress state, so a stale/invalid equip can
  // never render a locked item. The pure catalog is the source of truth.
  p.lalo = customize.sanitizeSelection(p, p.lalo);
  progress.save(p);

  // Apply the persisted reading-voice override so the very first read already
  // uses it (D3 / AC-K3.3). null = "Automática" → Spanish auto-pick.
  speech.setPreferredVoice(p.voicePref || null);

  // Kick off the CSV word-inventory load (AC-G4.1). Until it resolves the
  // embedded fallback is used (AC-G4.4); when it resolves we re-render so a
  // word level already on screen picks up the full, ordered inventory.
  words
    .loadInventory()
    .then(() => {
      // Every level is a word level now (D1); refresh an on-screen pool so it
      // picks up the full, ordered CSV inventory when it resolves.
      if (state.phase === "play" && currentLevelDef()) {
        state.pool = currentLevelDef().pool();
        render();
      }
    })
    .catch(() => {
      /* fallback inventory already in effect; never dead-end (AC-G4.4) */
    });

  const state = {
    progress: p,
    phase: "welcome", // welcome|onboarding|map|play|summary|stickers|dashboard
    levelId: null,
    pool: [],
    current: "", // current syllable, OR current word's `word` string
    currentWord: null, // word entry when in a word level
    previous: null,
    recognitionSupported:
      forcedRecognition === null ? speech.recognitionSupported : forcedRecognition,
    listening: false,
    // Auto-listen bookkeeping (AC-L2.6): a monotonically increasing token is
    // bumped on every presentation and on every navigation, so a stale
    // scheduled (re-)listen can detect it is obsolete and no-op.
    listenToken: 0,
    // per-level session counters
    levelCorrect: 0,
    levelStars: 0,
    // Effective per-session goal, computed from the live words-per-level
    // setting at openLevel() (iteration 8, D3 / AC-L3.3).
    levelGoal: 0,
    onboardingStep: 0,
    lastVerified: false, // whether last success was mic-verified
    // Iteration 9 (D3 / AC-M3): per-level word index drives the mode rotation;
    // `activeMode` + `modeOptions` are exposed to the UI for tap-based modes.
    wordIndex: 0,
    activeMode: "say-it",
    modeOptions: null, // { kind, options, ...mode-specific } or null for say-it
    // Iteration 9 (D2 / AC-M2.4): idle→sleep bookkeeping (token/cancel pattern).
    sleepToken: 0,
  };

  let advanceTimer = null;
  let sleepTimer = null;

  function view() {
    return {
      phase: state.phase,
      difficulty: state.progress.difficulty,
      veryYoung: state.progress.veryYoung,
      levelId: state.levelId,
      level: state.levelId ? levels.byId(state.levelId) : null,
      current: state.current,
      currentWord: state.currentWord,
      stars: state.progress.stars,
      streak: state.progress.streak,
      bestStreak: state.progress.bestStreak,
      recognitionSupported: state.recognitionSupported,
      listening: state.listening,
      onboardingStep: state.onboardingStep,
      lastVerified: state.lastVerified,
      map: levels.mapState(state.progress),
      stickers: rewards.stickerBook(state.progress.stickers),
      dailyGoal: state.progress.dailyGoal,
      levelCorrect: state.levelCorrect,
      levelStars: state.levelStars,
      levelGoal: state.levelGoal,
      autoModelRemaining: state.progress.autoModelRemaining,
      // Iteration 9: customized Lalo (D1), the growing garden (D4), the music
      // toggle (D8), and the active practice mode + its options (D3).
      lalo: state.progress.lalo,
      garden: garden.gardenState(state.progress),
      music: state.progress.music,
      activeMode: state.activeMode,
      modeOptions: state.modeOptions,
    };
  }

  function render() {
    handlers.onRender(view());
  }

  function save() {
    progress.save(state.progress);
  }

  // ---- Navigation -----------------------------------------------------------

  function start() {
    // First ever run → onboarding; otherwise straight to the map.
    if (!state.progress.onboardingDone) {
      state.phase = "onboarding";
      state.onboardingStep = 1;
      render();
    } else {
      goMap();
    }
  }

  function goMap() {
    clearTimeout(advanceTimer);
    cancelAutoListen(); // leaving play cancels any pending (re-)listen (AC-L2.6)
    cancelSleep(); // leaving play cancels the idle→sleep timer (AC-M2.4)
    state.phase = "map";
    state.levelId = null;
    render();
  }

  // ---- Auto-listen orchestration (iteration 8, D2 / AC-L2) ------------------

  /**
   * Invalidate any pending auto-listen (navigation / level open / reset /
   * phase leave). Bumping the token makes a stale scheduled callback a no-op
   * (AC-L2.6).
   */
  function cancelAutoListen() {
    state.listenToken += 1;
  }

  // ---- Lalo reactions + idle→sleep (iteration 9, D2 / AC-M2) ---------------

  /**
   * Request Lalo's one-shot "surprise" reaction (AC-M2.1b/2.3). Surfaced via the
   * optional `handlers.onReaction` seam so Node tests can observe it without a
   * DOM. Additive: it never changes the logical state nor the read→listen order.
   * @param {"surprise"} kind
   */
  function react(kind) {
    if (typeof handlers.onReaction === "function") handlers.onReaction(kind);
  }

  /** Wake Lalo from the sleeping pose and (re)arm the idle timer (AC-M2.4). */
  function wakeLalo() {
    if (typeof handlers.onWake === "function") handlers.onWake();
    scheduleSleep();
  }

  /** Invalidate any pending idle→sleep callback (navigation / interaction). */
  function cancelSleep() {
    state.sleepToken += 1;
    if (sleepTimer) {
      clearTimeout(sleepTimer);
      sleepTimer = null;
    }
  }

  /**
   * Arm a single idle→sleep timer for the current moment. The captured token is
   * compared at fire time so a later interaction/navigation cancels it. Fires
   * only while on the play screen (AC-M2.4). Bounded — no runaway timers.
   */
  function scheduleSleep() {
    cancelSleep();
    if (state.phase !== "play") return;
    const token = state.sleepToken;
    sleepTimer = setTimeout(() => {
      if (token !== state.sleepToken) return; // obsolete — cancelled
      if (state.phase !== "play") return;
      if (typeof handlers.onSleep === "function") handlers.onSleep();
    }, IDLE_SLEEP_MS);
  }

  /**
   * Open the mic by itself (no tap). Guarded so it only fires while playing,
   * recognition is supported, and we are not already listening (AC-L2.3). The
   * initiation is surfaced via the optional `handlers.onListen` seam so Node
   * tests can observe it without real audio (AC-L2.8). Reuses listenAttempt()
   * so leniency / denial / near-miss handling stays single-sourced (AC-L2.1).
   */
  function startAutoListen() {
    if (state.phase !== "play") return;
    if (!state.recognitionSupported) return;
    if (state.listening) return;
    if (typeof handlers.onListen === "function") handlers.onListen();
    listenAttempt();
  }

  /**
   * Schedule exactly one auto-listen for the current presentation/retry. The
   * captured token is compared at fire time so a navigation/new-word in the
   * meantime cancels this one (no stacking, no runaway — AC-L2.6).
   * @param {number} [delayMs]
   */
  function scheduleAutoListen(delayMs = 0) {
    if (state.phase !== "play" || !state.recognitionSupported) return;
    const token = state.listenToken;
    setTimeout(() => {
      if (token !== state.listenToken) return; // obsolete — cancelled
      startAutoListen();
    }, delayMs);
  }

  function goStickers() {
    state.phase = "stickers";
    render();
  }

  function goDashboard() {
    state.phase = "dashboard";
    render();
  }

  /** Open the Armario de Lalo (customization screen, D1). */
  function goWardrobe() {
    cancelSleep();
    state.phase = "wardrobe";
    render();
  }

  /** Open the Jardín de Lalo (growing collection, D4). */
  function goGarden() {
    cancelSleep();
    state.phase = "garden";
    render();
  }

  // ---- Onboarding (F1) ------------------------------------------------------

  function onboardingNext() {
    if (state.phase !== "onboarding") return;
    state.onboardingStep += 1;
    if (state.onboardingStep === 1) {
      audio.model("pato");
    }
    if (state.onboardingStep > 3) {
      finishOnboarding();
      return;
    }
    render();
  }

  function finishOnboarding() {
    state.progress.onboardingDone = true;
    save();
    goMap();
  }

  function skipOnboarding() {
    finishOnboarding();
  }

  // ---- Level play -----------------------------------------------------------

  function openLevel(levelId) {
    const def = levels.byId(levelId);
    if (!def) return;
    if (!levels.isUnlocked(state.progress, levelId)) return; // locked: ignore

    clearTimeout(advanceTimer);
    cancelAutoListen(); // drop any pending listen from a prior level (AC-L2.6)
    cancelSleep(); // reset the idle→sleep timer for the new level (AC-M2.4)
    state.levelId = levelId;
    state.phase = "play";
    state.pool = def.pool();
    state.current = "";
    state.currentWord = null;
    state.previous = null;
    state.levelCorrect = 0;
    state.levelStars = 0;
    state.wordIndex = 0; // restart the per-level mode rotation (D3)
    // Session goal honors the live adult setting (iteration 8, D3 / AC-L3.3).
    // Clamped to the pool so a thin band never dead-ends (AC-L3.4).
    state.levelGoal = levels.effectiveGoal(
      state.pool.length,
      state.progress.wordsPerLevel
    );
    // ensure a level record exists / is unlocked
    if (!state.progress.levels[levelId]) {
      state.progress.levels[levelId] = { unlocked: true, completed: false, bestStars: 0 };
    }
    save();
    // nextItem() presents the first word and auto-reads it (D4), setting the
    // mascot to "model". No standing prompt is pushed (D6).
    nextItem();
  }

  function currentLevelDef() {
    return state.levelId ? levels.byId(state.levelId) : null;
  }

  function nextItem() {
    clearTimeout(advanceTimer);
    cancelAutoListen(); // this presentation gets a fresh listen token (AC-L2.6)
    const next = pickRandom(state.pool, state.current || null);
    state.previous = state.current;
    state.current = next;
    state.currentWord = words.byWord(next);
    // record it was seen
    progress.recordSeen(state.progress, next);

    // Iteration 9 (D3 / AC-M3): choose this word's practice mode from the pure
    // rotation (very-young stays on the picture-based "say-it"), and prepare its
    // options for tap-based modes. The read→auto-listen path below runs for
    // "say-it"; tap modes complete via answerOption().
    state.activeMode = modes.pickMode(state.levelId, state.wordIndex, {
      veryYoung: state.progress.veryYoung,
    });
    state.modeOptions = buildModeOptions(state.activeMode, next);
    state.wordIndex += 1;

    save();
    render();

    // Iteration 9 (D2 / AC-M2.3): request Lalo's surprise reaction as the new
    // word appears, then (re)arm the idle→sleep timer. This is additive and must
    // not reorder/delay the auto-read → auto-listen sequence below.
    react("surprise");
    scheduleSleep();

    // Tap-based modes do not auto-read/auto-listen; the child reads the prompt
    // and taps an option (success via answerOption). We still model the prompt
    // word once (like a read) when auto-read is on, so the word is heard.
    if (state.activeMode !== "say-it") {
      if (state.progress.autoRead) {
        handlers.onMascot("model");
        duckForRead(audio.model(state.current));
      }
      return;
    }
    // Auto-read on display (iteration 6, D4), now gated by the adult setting
    // (iteration 7, D7 / AC-K7.3). When ON, every new word is modeled aloud as
    // soon as it appears — no tap, no throttle — with Lalo in "model". When
    // OFF, no word is spoken automatically and Lalo is not forced to "model";
    // the child can still hear it on demand (tap / Enter / Space / 'l'). The
    // read reuses speech.speak (via audio.model), which resolves safely and
    // cancels any in-flight utterance, so it never blocks/throws (AC-K6.2).
    //
    // Auto-listen (iteration 8, D2 / AC-L2): the mic opens by itself after the
    // word is presented. When auto-read is ON it is sequenced AFTER the read
    // resolves (so the mic never captures Lalo's TTS), with a bounded safety
    // timeout so a never-resolving read still opens the mic; when OFF it opens
    // immediately. The captured token is checked in scheduleAutoListen so a
    // navigation/new-word mid-read cancels this one.
    if (state.progress.autoRead) {
      handlers.onMascot("model");
      const token = state.listenToken;
      let fired = false;
      const openMic = () => {
        if (fired) return;
        fired = true;
        if (token !== state.listenToken) return; // superseded by a new word/nav
        scheduleAutoListen();
      };
      duckForRead(audio.model(state.current)).then(openMic, openMic);
      setTimeout(openMic, AUTO_LISTEN_SAFETY_MS); // safety net (AC-L2.2)
    } else {
      scheduleAutoListen(); // no read to wait for — open immediately (AC-L2.2)
    }
  }

  /**
   * Build the UI options for a tap-based mode (D3 / AC-M3). Returns null for the
   * say-it mode (no options). Pure aside from the option generators' randomness.
   * @param {string} mode
   * @param {string} targetWord
   */
  function buildModeOptions(mode, targetWord) {
    if (mode === "pick-word") {
      const pool = Array.isArray(state.pool) ? state.pool : [];
      return { kind: "pick-word", options: modes.buildOptions(targetWord, pool, 3) };
    }
    if (mode === "missing-syllable") {
      const entry = words.byWord(targetWord);
      const parts = entry && Array.isArray(entry.parts) ? entry.parts : [];
      // distractor syllables: parts of other pool words, flattened + unique.
      const otherParts = [];
      for (const w of state.pool) {
        if (w === targetWord) continue;
        const e = words.byWord(w);
        if (e && Array.isArray(e.parts)) otherParts.push(...e.parts);
      }
      const choice = modes.missingSyllableChoices(targetWord, parts, 3, otherParts);
      return { kind: "missing-syllable", ...choice };
    }
    return null;
  }

  /**
   * Duck the background music around a read, restoring it when the read
   * resolves. Returns the (possibly already-resolved) read promise so callers
   * can chain. When music is off / unavailable this is a harmless no-op.
   * @param {Promise<void>|void} readPromise
   * @returns {Promise<void>}
   */
  function duckForRead(readPromise) {
    if (state.progress.music) audio.duckMusic(true);
    const p = Promise.resolve(readPromise);
    const restore = () => {
      if (state.progress.music) audio.duckMusic(false);
    };
    p.then(restore, restore);
    return p;
  }

  /**
   * Handle a tap on a mode option (D3 / AC-M3.3/M3.4). A correct option
   * completes the word via the self-confirm success path (verified:false — no
   * mic match, so no mastery credit); a wrong option encourages + lets the child
   * retry (never a fail, never a dead-end). No-op outside a tap-based play mode.
   * @param {string} value the tapped option's value (a word, or a syllable)
   */
  function answerOption(value) {
    if (state.phase !== "play") return;
    if (!state.modeOptions) return; // say-it has no options
    wakeLalo();

    let correct = false;
    if (state.modeOptions.kind === "pick-word") {
      correct = String(value) === String(state.current);
    } else if (state.modeOptions.kind === "missing-syllable") {
      correct = String(value) === String(state.modeOptions.correct);
    }

    if (correct) {
      succeed({ verified: false });
    } else {
      handlers.onMascot("encourage");
      handlers.onFeedback("Casi… intenta otra vez 🙂", "retry");
      audio.model(state.current); // model the prompt again to help
      scheduleSleep();
    }
  }

  // ---- Speech / answering ---------------------------------------------------

  async function listenAttempt() {
    if (state.phase !== "play" || state.listening) return;
    if (!state.recognitionSupported) {
      // No recognition: the child completes the word by tapping the card or
      // pressing Enter/Space (AC-L1.3). Keep a gentle, button-free hint.
      handlers.onFeedback("Toca la tarjeta para continuar 👆", "neutral");
      return;
    }
    const token = state.listenToken; // this attempt belongs to the current word
    state.listening = true;
    wakeLalo(); // opening the mic is activity — wake + re-arm the idle timer
    render();
    handlers.onMascot("idle");
    handlers.onFeedback("Escuchando… 🎤", "neutral");

    // Duck the music for the whole recognition window so it never covers the
    // mic input (AC-M8.2). Restored once we have a result below.
    if (state.progress.music) audio.duckMusic(true);
    const result = await speech.listen(state.current);
    if (state.progress.music) audio.duckMusic(false);

    state.listening = false;
    render();

    // If the word changed / we navigated while listening, drop this result.
    if (token !== state.listenToken) return;

    if (result.denied) {
      // Mic denied: stop auto-re-opening the mic and fall back to the no-tap
      // tap/Enter success path (AC-L2.7 / AC-L1.3). No repeated prompts.
      state.recognitionSupported = false;
      cancelAutoListen();
      render();
      handlers.onFeedback("Toca la tarjeta para continuar 👆", "neutral");
      return;
    }

    if (result.outcome === "match") {
      succeed({ verified: true });
    } else if (result.outcome === "near") {
      // Gentle near-miss (F9.3): keep the same item, re-model, then re-open the
      // mic by itself so the child can try again with no tap (AC-L2.5). The
      // bounded retry delay spaces attempts (AC-L2.6).
      handlers.onMascot("encourage");
      handlers.onFeedback("Casi… escucha otra vez 👂", "near");
      duckForRead(audio.model(state.current));
      scheduleAutoListen(AUTO_LISTEN_RETRY_MS);
    } else {
      // Miss: encourage and re-open the mic without a tap (AC-L2.5).
      handlers.onMascot("encourage");
      handlers.onFeedback("Inténtalo otra vez 🙂", "retry");
      scheduleAutoListen(AUTO_LISTEN_RETRY_MS);
    }
  }

  /** Self-confirm fallback (adult-confirmed, NOT voice-verified — F9.2). */
  function confirmSaid() {
    if (state.phase !== "play") return;
    succeed({ verified: false });
  }

  function succeed({ verified }) {
    wakeLalo(); // a success is activity — wake Lalo + re-arm the idle timer
    const id = state.current;
    progress.recordAttempt(state.progress, id, { verified, correct: true });

    // stars + streak + daily goal
    const reward = rewards.onCorrect(countLevelCorrectAfter());
    state.progress.stars += reward.stars;
    state.levelStars += reward.stars;
    state.levelCorrect += 1;
    state.progress.streak += 1;
    if (state.progress.streak > state.progress.bestStreak) {
      state.progress.bestStreak = state.progress.streak;
    }
    progress.bumpDailyGoal(state.progress, 1);
    state.lastVerified = verified;
    save();

    const milestone = reward.milestone;
    celebrate.play({ milestone });
    // Improved success animation (D5 / AC-K5): let the UI pop the hero card in
    // step with the burst. Optional + short, well within ADVANCE_DELAY_MS, so
    // it never delays the auto-advance/read of the next word (AC-K5.3).
    if (typeof handlers.onSuccessPop === "function") handlers.onSuccessPop({ milestone });
    handlers.onMascot("cheer");
    const base = verified ? "¡Muy bien! 🎉" : "¡Listo! ✅";
    handlers.onFeedback(milestone ? "¡Increíble! 🌟🌟" : base, "success");
    render();

    // Completion uses the effective per-session goal (iteration 8, D3 /
    // AC-L3.3/L3.4) computed from the live words-per-level setting at
    // openLevel(), not the module-load constant.
    const done = state.levelGoal > 0 && state.levelCorrect >= state.levelGoal;

    advanceTimer = setTimeout(() => {
      if (done) {
        completeLevel();
      } else {
        // nextItem() auto-reads the new word and sets the mascot to "model"
        // (D4). No standing "Di la palabra" prompt anymore (D6 / AC-J6).
        nextItem();
      }
    }, ADVANCE_DELAY_MS);
  }

  /** running count of correct answers in this level AFTER the current one. */
  function countLevelCorrectAfter() {
    return state.levelCorrect + 1;
  }

  // ---- Level completion + summary (F11) -------------------------------------

  function completeLevel() {
    cancelAutoListen();
    const levelId = state.levelId;
    const already = [...state.progress.stickers];
    const { stickerId, isNew } = rewards.onLevelComplete(levelId, already);
    if (stickerId && isNew) state.progress.stickers.push(stickerId);
    levels.completeLevel(state.progress, levelId, state.levelStars);
    save();

    state.phase = "summary";
    state.summary = {
      levelId,
      stars: state.levelStars,
      stickerId,
      isNewSticker: isNew,
      nextLevelId: levels.nextUnlock(levelId),
    };
    handlers.onMascot("cheer");
    celebrate.playMilestone();
    render();
  }

  function summaryContinue() {
    state.summary = null;
    goMap();
  }

  // ---- Model / listen -------------------------------------------------------

  function listenToModel() {
    if (!state.current) return;
    wakeLalo();
    handlers.onMascot("model");
    duckForRead(audio.model(state.current));
  }

  // ---- Gesture intents (G3) -------------------------------------------------
  // Thin, named wrappers so the gesture recognizer in main.js expresses intent
  // ("tapCard", "swipeNext") rather than reaching into internals. Both no-op
  // outside the play phase so a stray gesture never misfires.

  /**
   * Tap on the card → read the current item aloud + mascot "model" (AC-G3.1).
   * On devices WITHOUT speech recognition this tap also counts as a self-confirm
   * success (AC-L1.3) so the child can complete a word with no "¡Lo dije!"
   * button and no dead-end. Recognition-capable devices only hear the word.
   */
  function tapCard() {
    if (state.phase !== "play") return;
    listenToModel();
    if (!state.recognitionSupported) {
      confirmSaid();
    }
  }

  /**
   * The screen's primary keyboard action (Enter / Space) during play. With
   * recognition, open the mic ("listen again"); without it, drive the AC-L1.3
   * no-recognition success path (model + self-confirm). Never dead-ends.
   */
  function primaryAction() {
    if (state.phase !== "play") return;
    if (state.recognitionSupported) {
      listenAttempt();
    } else {
      tapCard();
    }
  }

  /** Left swipe on the card → advance to the next item (AC-G3.2). */
  function swipeNext() {
    if (state.phase !== "play") return;
    skip();
  }

  /** Right swipe → repeat the current item (non-destructive, AC-G3.2). */
  function swipePrev() {
    if (state.phase !== "play") return;
    listenToModel();
  }

  /** Model a single part of the current word (word levels only). */
  function modelPart(index) {
    if (!state.currentWord) return;
    const part = state.currentWord.parts[index];
    if (part) {
      wakeLalo();
      handlers.onMascot("model");
      duckForRead(audio.model(part));
    }
  }

  // ---- Settings / dashboard controls ----------------------------------------

  function setDifficulty(difficulty) {
    state.progress.difficulty = difficulty === "normal" ? "normal" : "facil";
    save();
    render();
  }

  function setVeryYoung(on) {
    state.progress.veryYoung = Boolean(on);
    save();
    render();
  }

  /** Toggle the auto-read-on-display setting (D7 / AC-K7). Persists + applies. */
  function setAutoRead(on) {
    state.progress.autoRead = Boolean(on);
    save();
    render();
  }

  /**
   * Set the adult-chosen reading voice (D3 / AC-K3). `id` is a stable voiceId,
   * or null/"" for "Automática". Persists and applies to speech immediately so
   * the next read uses it. Never throws.
   */
  function setVoicePref(id) {
    const value = id ? String(id) : null;
    state.progress.voicePref = value;
    speech.setPreferredVoice(value);
    save();
    render();
  }

  /**
   * Set the adult-chosen words-per-level (iteration 8, D3 / AC-L3.2). Clamps to
   * the valid range, persists, and re-renders. Takes effect for the very next
   * level opened (its goal is computed at openLevel from this value).
   * @param {number} n
   */
  function setWordsPerLevel(n) {
    state.progress.wordsPerLevel = levels.clampWordsPerLevel(n);
    save();
    render();
  }

  function resetProgress() {
    cancelAutoListen();
    cancelSleep();
    audio.stopMusic(); // stop any background music on reset (AC-M8.3)
    state.progress = progress.reset();
    progress.ensureDailyGoal(state.progress);
    state.progress.lalo = customize.sanitizeSelection(state.progress, state.progress.lalo);
    save();
    if (typeof handlers.onLaloCustomization === "function") {
      handlers.onLaloCustomization(state.progress.lalo);
    }
    state.phase = "welcome";
    state.levelId = null;
    render();
  }

  // ---- Iteration 9: customization (D1), garden (D4), music (D8) -------------

  /**
   * Set the child's Lalo customization (D1 / AC-M1.5). Sanitizes against what is
   * unlocked (locked/unknown items dropped), persists, surfaces the new
   * selection to the UI so it re-renders everywhere, and re-renders the state.
   * @param {{color?: string, accessories?: string[]}} selection
   */
  function setLaloCustomization(selection) {
    state.progress.lalo = customize.sanitizeSelection(state.progress, selection);
    save();
    if (typeof handlers.onLaloCustomization === "function") {
      handlers.onLaloCustomization(state.progress.lalo);
    }
    render();
  }

  /** The current, sanitized Lalo selection. */
  function laloSelection() {
    return state.progress.lalo;
  }

  /** The derived garden state for the current progress (D4 / AC-M4). */
  function gardenState() {
    return garden.gardenState(state.progress);
  }

  /** The unlocked customization items for the current progress (for the armario). */
  function unlockedCustomization() {
    return customize.unlockedItems(state.progress);
  }

  /**
   * Toggle the background-music setting (D8 / AC-M8). Coerces to boolean,
   * persists, and applies: starts the gentle loop when turned on, stops it when
   * turned off. Never throws (audio is guarded). Starting is meaningful only
   * after a user gesture per autoplay policy — this is called from a click.
   * @param {boolean} on
   */
  function setMusicEnabled(on) {
    state.progress.music = Boolean(on);
    save();
    if (state.progress.music) {
      audio.startMusic();
    } else {
      audio.stopMusic();
    }
    render();
  }

  function skip() {
    if (state.phase !== "play") return;
    // nextItem() handles the auto-read + mascot "model" state (D4). No standing
    // instruction is pushed to the feedback line (D6 / AC-J6.2).
    nextItem();
  }

  // ---- Dashboard stats (computed from the mastery model) --------------------

  function dashboardStats() {
    // Words-only mastery denominator (D1): the set of inventory WORDS, not the
    // retired syllable pools. "dominadas" now counts words.
    const wordIds = [
      ...words.forLevel("palabras").map((w) => w.word),
      ...words.forLevel("palabras-3").map((w) => w.word),
      ...words.forLevel("palabras-4").map((w) => w.word),
    ];
    const { mastered, total } = progress.masteredCount(state.progress, wordIds);
    return {
      mastered,
      total,
      trouble: progress.troubleItems(state.progress, 2, 5),
      streak: state.progress.streak,
      bestStreak: state.progress.bestStreak,
      stars: state.progress.stars,
      stickers: state.progress.stickers.length,
      difficulty: state.progress.difficulty,
      veryYoung: state.progress.veryYoung,
      dailyGoal: state.progress.dailyGoal,
      noSpanishVoice: speech.noSpanishVoiceDetected(),
      // Iteration 7 settings for the adult panel (D3 / D7).
      autoRead: state.progress.autoRead,
      voicePref: state.progress.voicePref,
      availableVoices: speech.availableVoices(),
      // Iteration 8 (D3 / AC-L3.2): words-per-level for the Ajustes control.
      wordsPerLevel: state.progress.wordsPerLevel,
      // Iteration 9 (D8 / AC-M8): background-music toggle for the Ajustes panel.
      music: state.progress.music,
    };
  }

  return {
    state,
    view,
    render,
    start,
    goMap,
    goStickers,
    goDashboard,
    goWardrobe,
    goGarden,
    onboardingNext,
    skipOnboarding,
    openLevel,
    listenAttempt,
    confirmSaid,
    listenToModel,
    modelPart,
    skip,
    tapCard,
    primaryAction,
    swipeNext,
    swipePrev,
    setDifficulty,
    setVeryYoung,
    setAutoRead,
    setVoicePref,
    setWordsPerLevel,
    resetProgress,
    summaryContinue,
    dashboardStats,
    // Iteration 9
    answerOption,
    setLaloCustomization,
    laloSelection,
    gardenState,
    unlockedCustomization,
    setMusicEnabled,
  };
}
