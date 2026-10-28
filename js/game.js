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

const ADVANCE_DELAY_MS = 1200;

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
export function createGame(handlers) {
  const p = progress.load();
  progress.ensureDailyGoal(p);
  progress.save(p);

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
    recognitionSupported: speech.recognitionSupported,
    listening: false,
    // per-level session counters
    levelCorrect: 0,
    levelStars: 0,
    onboardingStep: 0,
    lastVerified: false, // whether last success was mic-verified
  };

  let advanceTimer = null;

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
      autoModelRemaining: state.progress.autoModelRemaining,
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
    state.phase = "map";
    state.levelId = null;
    render();
  }

  function goStickers() {
    state.phase = "stickers";
    render();
  }

  function goDashboard() {
    state.phase = "dashboard";
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
    state.levelId = levelId;
    state.phase = "play";
    state.pool = def.pool();
    state.current = "";
    state.currentWord = null;
    state.previous = null;
    state.levelCorrect = 0;
    state.levelStars = 0;
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
    const next = pickRandom(state.pool, state.current || null);
    state.previous = state.current;
    state.current = next;
    state.currentWord = words.byWord(next);
    // record it was seen
    progress.recordSeen(state.progress, next);
    save();
    render();
    // Auto-read on display (iteration 6, D4 / AC-J4): every new word is modeled
    // aloud as soon as it appears — no tap, no throttle. speech.speak (via
    // audio.model) resolves safely and cancels any in-flight utterance, so this
    // never blocks, throws, or dead-ends (AC-J4.3). One read per new word.
    handlers.onMascot("model");
    audio.model(state.current);
  }

  // ---- Speech / answering ---------------------------------------------------

  async function listenAttempt() {
    if (state.phase !== "play" || state.listening) return;
    if (!state.recognitionSupported) {
      handlers.onFeedback('Usa el botón "¡Lo dije! ✅"', "neutral");
      return;
    }
    state.listening = true;
    render();
    handlers.onMascot("idle");
    handlers.onFeedback("Escuchando… 🎤", "neutral");

    const result = await speech.listen(state.current);

    state.listening = false;
    render();

    if (result.denied) {
      state.recognitionSupported = false;
      render();
      handlers.onFeedback('Sin micrófono. Usa "¡Lo dije! ✅" 👍', "neutral");
      return;
    }

    if (result.outcome === "match") {
      succeed({ verified: true });
    } else if (result.outcome === "near") {
      // Gentle near-miss (F9.3): keep the same item, offer the model.
      handlers.onMascot("encourage");
      handlers.onFeedback("Casi… escucha otra vez 👂", "near");
      audio.model(state.current);
    } else {
      handlers.onMascot("encourage");
      handlers.onFeedback("Inténtalo otra vez 🙂", "retry");
    }
  }

  /** Self-confirm fallback (adult-confirmed, NOT voice-verified — F9.2). */
  function confirmSaid() {
    if (state.phase !== "play") return;
    succeed({ verified: false });
  }

  function succeed({ verified }) {
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
    handlers.onMascot("cheer");
    const base = verified ? "¡Muy bien! 🎉" : "¡Listo! ✅";
    handlers.onFeedback(milestone ? "¡Increíble! 🌟🌟" : base, "success");
    render();

    const def = currentLevelDef();
    const done = def && state.levelCorrect >= def.goal;

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
    handlers.onMascot("model");
    audio.model(state.current);
  }

  // ---- Gesture intents (G3) -------------------------------------------------
  // Thin, named wrappers so the gesture recognizer in main.js expresses intent
  // ("tapCard", "swipeNext") rather than reaching into internals. Both no-op
  // outside the play phase so a stray gesture never misfires.

  /** Tap on the card → read the current item aloud + mascot "model" (AC-G3.1). */
  function tapCard() {
    if (state.phase !== "play") return;
    listenToModel();
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
      handlers.onMascot("model");
      audio.model(part);
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

  function resetProgress() {
    state.progress = progress.reset();
    progress.ensureDailyGoal(state.progress);
    save();
    state.phase = "welcome";
    state.levelId = null;
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
    onboardingNext,
    skipOnboarding,
    openLevel,
    listenAttempt,
    confirmSaid,
    listenToModel,
    modelPart,
    skip,
    tapCard,
    swipeNext,
    swipePrev,
    setDifficulty,
    setVeryYoung,
    resetProgress,
    summaryContinue,
    dashboardStats,
  };
}
