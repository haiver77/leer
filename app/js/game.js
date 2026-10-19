// game.js — expanded state machine orchestrating the iteration-2 experience:
//   welcome → onboarding → map → play (syllable | word) → summary →
//   sticker book → dashboard.
// Delegates persistence + mastery to progress.js, level rules to levels.js,
// rewards to rewards.js, speech leniency to speech.js, audio to audio.js.

import * as syllables from "./syllables.js";
import * as speech from "./speech.js";
import * as celebrate from "./celebrate.js";
import * as progress from "./progress.js";
import * as levels from "./levels.js";
import * as rewards from "./rewards.js";
import * as words from "./words.js";
import * as audio from "./audio.js";

const ADVANCE_DELAY_MS = 1200;

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
      audio.model("Pa");
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
    nextItem();
    handlers.onFeedback(itemPrompt(), "neutral");
    handlers.onMascot("idle");
  }

  function currentLevelDef() {
    return state.levelId ? levels.byId(state.levelId) : null;
  }

  function isWordLevel() {
    const def = currentLevelDef();
    return def && def.type === "word";
  }

  function itemPrompt() {
    return isWordLevel() ? "Di la palabra 😊" : "Di la sílaba que ves 😊";
  }

  function nextItem() {
    clearTimeout(advanceTimer);
    const next = syllables.pickRandom(state.pool, state.current || null);
    state.previous = state.current;
    state.current = next;
    if (isWordLevel()) {
      state.currentWord = words.byWord(next);
    } else {
      state.currentWord = null;
    }
    // record it was seen
    progress.recordSeen(state.progress, next);
    // early auto-model for the first few new items (F1.3)
    if (state.progress.autoModelRemaining > 0) {
      state.progress.autoModelRemaining -= 1;
      handlers.onMascot("model");
      audio.model(next);
    }
    save();
    render();
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
        nextItem();
        handlers.onMascot("idle");
        handlers.onFeedback(itemPrompt(), "neutral");
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
    nextItem();
    handlers.onFeedback(itemPrompt(), "neutral");
  }

  // ---- Dashboard stats (computed from the mastery model) --------------------

  function dashboardStats() {
    const allIds = syllables.generate("all");
    const { mastered, total } = progress.masteredCount(state.progress, allIds);
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
    setDifficulty,
    setVeryYoung,
    resetProgress,
    summaryContinue,
    dashboardStats,
  };
}
