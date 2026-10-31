// main.js — bootstrap: wires the DOM to the expanded game state machine,
// mounts Lalo, renders every screen, registers the service worker, and links
// the adult gate to the dashboard.

import { createGame } from "./game.js";
import * as mascot from "./mascot.js";
import * as art from "./art.js";
import * as levels from "./levels.js";
import * as adultGate from "./adultGate.js";
import * as customize from "./customize.js";
import * as speech from "./speech.js";

const el = (id) => document.getElementById(id);

// ---- Screens ----
const screens = {
  welcome: el("welcome-screen"),
  onboarding: el("onboarding-screen"),
  map: el("map-screen"),
  play: el("game-screen"),
  summary: el("summary-screen"),
  stickers: el("stickers-screen"),
  wardrobe: el("wardrobe-screen"),
  garden: el("garden-screen"),
  dashboard: el("dashboard-screen"),
};

// ---- Mascot hosts (one per screen that shows Lalo) ----
const mascotHosts = [
  el("welcome-mascot"),
  el("onboarding-mascot"),
  el("game-mascot"),
  el("summary-mascot"),
];

// ---- Controls ----
const startBtn = el("start-btn");
const welcomeDashBtn = el("welcome-dashboard-btn");

const onbNextBtn = el("onboarding-next-btn");
const onbSkipBtn = el("onboarding-skip-btn");
const onbText = el("onboarding-text");
const onbDemo = el("onboarding-demo");

const mapGrid = el("map-grid");
const mapStickersBtn = el("map-stickers-btn");
const mapDashBtn = el("map-dashboard-btn");
const mapWardrobeBtn = el("map-wardrobe-btn");
const mapGardenBtn = el("map-garden-btn");
const dailyFill = el("daily-goal-fill");

// Mode options (D3), themed background (D5)
const modeOptions = el("mode-options");
const gameScreen = el("game-screen");

// Armario de Lalo (D1)
const wardrobeBackBtn = el("wardrobe-back-btn");
const wardrobePreview = el("wardrobe-preview");
const wardrobeColors = el("wardrobe-colors");
const wardrobeAccessories = el("wardrobe-accessories");

// Jardín de Lalo (D4)
const gardenBackBtn = el("garden-back-btn");
const gardenCanvas = el("garden-canvas");
const gardenSummary = el("garden-summary");

// Música de fondo (D8)
const musicToggle = el("music-toggle");

const itemArt = el("item-art");
const cardHost = el("card-host");
const wordView = el("word-view");
const wordParts = el("word-parts");
const wordWhole = el("word-whole");
const gestureHint = el("gesture-hint");
const feedback = el("feedback");
const starsValue = el("stars-value");
const speakBtn = el("speak-btn");
const backBtn = el("back-btn");

const summaryStars = el("summary-stars");
const summarySticker = el("summary-sticker");
const summaryUnlock = el("summary-unlock");
const summaryContinueBtn = el("summary-continue-btn");

const stickerGrid = el("sticker-grid");
const stickersBackBtn = el("stickers-back-btn");

const dashBackBtn = el("dashboard-back-btn");
const voiceNotice = el("voice-notice");
const dashMastered = el("dash-mastered");
const dashStars = el("dash-stars");
const dashStreak = el("dash-streak");
const dashBest = el("dash-best");
const dashStickers = el("dash-stickers");
const dashTrouble = el("dash-trouble");
const diffFacil = el("diff-facil");
const diffNormal = el("diff-normal");
const veryYoungToggle = el("veryyoung-toggle");
const autoReadToggle = el("autoread-toggle");
const voiceSelect = el("voice-select");
const wordsPerLevelSelect = el("words-per-level");
const resetBtn = el("reset-btn");

// Adult gate overlay
const gateOverlay = el("gate-overlay");
const gatePrompt = el("gate-prompt");
const gateChoices = el("gate-choices");
const gateCancel = el("gate-cancel");

// ---- Mascot: a single logical Lalo; we remount into the active screen host ----
let activeMascotState = "idle";
// The customized Lalo selection, kept in sync via the game's onLaloCustomization
// handler so every mount renders the child's chosen color + accessories (D1 /
// AC-M1.5).
let laloSelection = customize.defaultSelection();
function mountMascotFor(phase) {
  const host =
    phase === "welcome"
      ? el("welcome-mascot")
      : phase === "onboarding"
      ? el("onboarding-mascot")
      : phase === "play"
      ? el("game-mascot")
      : phase === "summary"
      ? el("summary-mascot")
      : null;
  if (host) {
    mascot.mount(host, laloSelection);
    mascot.setState(activeMascotState);
  }
}

const game = createGame({
  onRender: renderView,
  onFeedback: setFeedback,
  onMascot: (s) => {
    activeMascotState = s;
    mascot.setState(s);
  },
  // Improved success animation (D5 / AC-K5): pop the hero card in step with the
  // confetti burst + Lalo cheer. CSS-only, reflow-restart like the entrance
  // animation, honored-by prefers-reduced-motion in styles.css.
  onSuccessPop: () => replaySuccessPop(),
  // Iteration 9 (D2 / AC-M2): Lalo reactions driven by the state machine.
  onReaction: (kind) => {
    if (kind === "surprise") mascot.surprise();
  },
  onSleep: () => mascot.sleep(),
  onWake: () => mascot.wake(),
  // Iteration 9 (D1 / AC-M1.5): keep the shared selection in sync + re-render
  // the mounted Lalo so the customization shows everywhere immediately.
  onLaloCustomization: (sel) => {
    laloSelection = sel;
    mascot.applyCustomization(sel);
  },
});

// Seed the selection from persisted progress so the very first mount already
// shows the child's customized Lalo (AC-M1.5).
laloSelection = game.laloSelection();

// Retrigger the success "pop" on the hero card (AC-K5.1). Toggling the class
// with a forced reflow restarts the CSS keyframe on every correct answer.
function replaySuccessPop() {
  if (!wordView) return;
  wordView.classList.remove("word-pop");
  void wordView.offsetWidth; // force reflow so the animation can restart
  wordView.classList.add("word-pop");
}

function setFeedback(message, kind) {
  feedback.textContent = message;
  feedback.dataset.kind = kind || "neutral";
}

// ---- Rendering ----

function showScreen(phase) {
  for (const [name, node] of Object.entries(screens)) {
    if (node) node.hidden = name !== phase;
  }
  mountMascotFor(phase);
}

function applyVeryYoung(on) {
  document.body.classList.toggle("very-young", Boolean(on));
}

function renderView(view) {
  applyVeryYoung(view.veryYoung);
  showScreen(view.phase);
  maybeShowGestureHint(view.phase);

  switch (view.phase) {
    case "onboarding":
      renderOnboarding(view);
      break;
    case "map":
      renderMap(view);
      break;
    case "play":
      renderPlay(view);
      break;
    case "summary":
      renderSummary();
      break;
    case "stickers":
      renderStickers(view);
      break;
    case "wardrobe":
      renderWardrobe(view);
      break;
    case "garden":
      renderGarden(view);
      break;
    case "dashboard":
      renderDashboard();
      break;
    default:
      break;
  }
}

const ONBOARDING_TEXT = {
  1: "Esta es tu palabra. Mírala bien.",
  2: "Toca la tarjeta para oírla.",
  3: "Toca 🎤 y dila tú.",
};

function renderOnboarding(view) {
  onbText.textContent = ONBOARDING_TEXT[view.onboardingStep] || "";
  onbDemo.textContent = "pato";
}

function renderMap(view) {
  // daily goal bar
  const g = view.dailyGoal || { progress: 0, target: 10 };
  const pct = g.target ? Math.round((g.progress / g.target) * 100) : 0;
  dailyFill.style.width = `${Math.min(100, pct)}%`;
  el("daily-goal").setAttribute("aria-label", `Meta de hoy: ${g.progress} de ${g.target}`);

  mapGrid.innerHTML = "";
  for (const node of view.map) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "map-node";
    btn.setAttribute("role", "listitem");
    btn.dataset.state = node.completed ? "completed" : node.unlocked ? "unlocked" : "locked";
    btn.dataset.id = node.id; // per-family colour hook (D4 / AC-I4.3)
    btn.disabled = !node.unlocked;

    const badge = node.completed
      ? art.svg("icon-check")
      : !node.unlocked
      ? art.svg("icon-lock")
      : "";
    btn.innerHTML = `
      <span class="map-node-art">${art.svg(node.artId)}</span>
      <span class="map-node-title">${escapeHtml(node.title)}</span>
      <span class="map-node-badge" aria-hidden="true">${badge}</span>
    `;
    btn.setAttribute(
      "aria-label",
      `${node.title}${node.completed ? ", completado" : node.unlocked ? "" : ", bloqueado"}`
    );
    if (node.unlocked) btn.addEventListener("click", () => game.openLevel(node.id));
    mapGrid.appendChild(btn);
  }
}

function renderPlay(view) {
  starsValue.textContent = String(view.stars);

  // art cue for the current word (words-only; D1)
  const def = view.level;
  const cueId = view.currentWord ? view.currentWord.artId : "cue-default";
  itemArt.innerHTML = art.svg(cueId);

  // Per-family theme behind the hero card (H4 + AC-I4.2). The accent tints the
  // card's border + depth; text stays on top at max contrast.
  applyCardTheme(def && def.id);

  // The word view is the only card content now (D1). Mark a fresh word so the
  // CSS entrance animation (AC-I4.2) can replay on each new item.
  if (view.currentWord) {
    // In the missing-syllable mode, blank one syllable tile + mask the whole
    // word so the child supplies the piece (D3 / AC-M3.1).
    const ms = view.modeOptions && view.modeOptions.kind === "missing-syllable"
      ? view.modeOptions.blankIndex
      : -1;
    renderWordParts(view.currentWord.parts, ms);
    const whole =
      ms >= 0
        ? view.currentWord.parts
            .map((p, i) => (i === ms ? "__" : p.toLowerCase()))
            .join("-")
        : view.currentWord.word;
    const changed = wordWhole.textContent !== whole;
    wordWhole.textContent = whole;
    wordWhole.setAttribute(
      "aria-label",
      ms >= 0 ? "Completa la sílaba que falta" : `Palabra: ${view.currentWord.word}`
    );
    // Scale font to the syllable count so 2- and 3-part words both fit (G1.2).
    wordView.dataset.parts = String(view.currentWord.parts.length);
    if (changed) replayNewWordEntrance();
  }

  // Per-family THEMED BACKGROUND (D5 / AC-M5): set a data-theme on the game
  // screen from the current band. Text stays on a scrim at ≥4.5:1 (CSS).
  if (gameScreen) gameScreen.dataset.theme = themeForLevel(def && def.id);

  // Mini-game MODE OPTIONS (D3 / AC-M3): render tap tiles for the active mode,
  // or hide the container for the say-it read-and-say mode.
  renderModeOptions(view);

  // The mic is the single primary action (iteration 8, D1 / AC-L1): the old
  // "¡Lo dije!" button is gone. It auto-opens on each word (AC-L2) and stays as
  // a manual "listen again" trigger. On devices without recognition the mic is
  // hidden and the child completes a word by tapping the card (AC-L1.3).
  // In a tap-based mode the mic is hidden (the child answers by tapping).
  const tapMode = Boolean(view.modeOptions);
  speakBtn.hidden = tapMode || !view.recognitionSupported;
  speakBtn.classList.toggle("is-listening", view.listening);
  speakBtn.setAttribute("aria-pressed", String(view.listening));
}

// Per-band theme lookup (D5 / AC-M5.2). Every band maps to a defined theme so
// the themed background is always set. Falls back to a neutral theme.
const LEVEL_THEMES = {
  "pal-2-abiertas-1": "meadow",
  "pal-2-abiertas-2": "sky",
  "pal-2-abiertas-3": "forest",
  "pal-2-especiales": "sunset",
  "pal-3-abiertas-1": "jungle",
  "pal-3-abiertas-2": "desert",
  "pal-3-especiales": "twilight",
  "pal-4-abiertas": "sea",
  "pal-4-especiales": "space",
};
function themeForLevel(levelId) {
  if (!levelId) return "meadow";
  if (LEVEL_THEMES[levelId]) return LEVEL_THEMES[levelId];
  const prefix = Object.keys(LEVEL_THEMES).find((k) => levelId.startsWith(k));
  return prefix ? LEVEL_THEMES[prefix] : "meadow";
}

// Render the tap-mode option tiles (pick-word / missing-syllable). Hidden for
// say-it. Each tile is a ≥56px button routing to game.answerOption(...).
function renderModeOptions(view) {
  if (!modeOptions) return;
  const mo = view.modeOptions;
  if (!mo) {
    modeOptions.hidden = true;
    modeOptions.innerHTML = "";
    modeOptions.dataset.kind = "";
    return;
  }
  modeOptions.hidden = false;
  modeOptions.dataset.kind = mo.kind;
  modeOptions.innerHTML = "";

  if (mo.kind === "pick-word") {
    modeOptions.setAttribute("aria-label", "¿Cuál es la palabra?");
    for (const w of mo.options) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mode-tile mode-tile-word";
      btn.textContent = w;
      btn.setAttribute("aria-label", `Palabra: ${w}`);
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        game.answerOption(w);
      });
      modeOptions.appendChild(btn);
    }
  } else if (mo.kind === "missing-syllable") {
    modeOptions.setAttribute("aria-label", "Completa la sílaba que falta");
    for (const s of mo.options) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mode-tile mode-tile-syllable";
      btn.textContent = s;
      btn.setAttribute("aria-label", `Sílaba: ${s}`);
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        game.answerOption(s);
      });
      modeOptions.appendChild(btn);
    }
  }
}

// Retrigger the new-word entrance animation by toggling a class (AC-I4.2). The
// browser restarts the CSS keyframe when the class is removed then re-added.
function replayNewWordEntrance() {
  if (!wordView) return;
  wordView.classList.remove("word-enter");
  // force reflow so the animation can restart
  void wordView.offsetWidth;
  wordView.classList.add("word-enter");
}

// Faint per-island/level card theme (H4). Keyed by level id prefix; the tint is
// a pale wash (never near the ink) and the accent is a bolder border colour.
// Falls back to the neutral default declared in CSS when no theme matches.
const CARD_THEMES = {
  // 2-syllable bands
  "pal-2-abiertas-1": { tint: "#ffe3ee", accent: "#ff2d78" },
  "pal-2-abiertas-2": { tint: "#e0f4fd", accent: "#0ea5d8" },
  "pal-2-abiertas-3": { tint: "#dcf7ef", accent: "#06b47f" },
  "pal-2-especiales": { tint: "#fff1cf", accent: "#f08a00" },
  // 3-syllable bands (split open into two + especiales)
  "pal-3-abiertas-1": { tint: "#ffe6db", accent: "#e0501f" },
  "pal-3-abiertas-2": { tint: "#ffeccf", accent: "#f3722c" },
  "pal-3-especiales": { tint: "#efe3fb", accent: "#8338ec" },
  // 4-syllable bands (the big finale)
  "pal-4-abiertas": { tint: "#d9eef5", accent: "#277da1" },
  "pal-4-especiales": { tint: "#e4ddf6", accent: "#3a0ca3" },
};

function applyCardTheme(levelId) {
  if (!cardHost) return;
  let theme = null;
  if (levelId) {
    // exact match first, then prefix match (e.g. any "pal-2-*")
    theme =
      CARD_THEMES[levelId] ||
      Object.entries(CARD_THEMES).find(([k]) => levelId.startsWith(k))?.[1] ||
      null;
  }
  if (theme) {
    cardHost.style.setProperty("--card-tint", theme.tint);
    cardHost.style.setProperty("--card-accent", theme.accent);
  } else {
    cardHost.style.removeProperty("--card-tint");
    cardHost.style.removeProperty("--card-accent");
  }
}

// Render N word tiles (2 or 3), each tappable to hear that part. When
// `blankIndex` >= 0 (missing-syllable mode, D3) that tile renders as an empty
// slot the child fills by tapping an option.
function renderWordParts(parts, blankIndex = -1) {
  wordParts.innerHTML = "";
  parts.forEach((part, i) => {
    if (i > 0) {
      const plus = document.createElement("span");
      plus.className = "word-plus";
      plus.setAttribute("aria-hidden", "true");
      plus.textContent = "+";
      wordParts.appendChild(plus);
    }
    if (i === blankIndex) {
      const slot = document.createElement("span");
      slot.className = "word-tile word-tile-blank";
      slot.setAttribute("aria-label", `Parte ${i + 1}: por completar`);
      slot.textContent = "?";
      wordParts.appendChild(slot);
      return;
    }
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "word-tile";
    btn.textContent = part;
    btn.setAttribute("aria-label", `Escuchar parte ${i + 1}: ${part}`);
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // don't let the card's tap gesture also fire
      game.modelPart(i);
    });
    wordParts.appendChild(btn);
  });
}

function renderSummary() {
  const s = game.state.summary;
  if (!s) return;
  summaryStars.textContent = `🌟 x ${s.stars}`;
  if (s.stickerId) {
    const stk = art.svg(stickerArtId(s.stickerId));
    summarySticker.innerHTML = stk;
    summarySticker.hidden = false;
  } else {
    summarySticker.hidden = true;
  }
  summaryUnlock.hidden = !s.nextLevelId;
  if (s.nextLevelId) {
    const next = levels.byId(s.nextLevelId);
    summaryUnlock.textContent = next ? `¡Desbloqueaste: ${next.title}!` : "¡Nuevo nivel!";
  }
}

function stickerArtId(stickerId) {
  // sticker ids map to art ids "sticker-*"; rewards catalog uses artId already,
  // but summary only has the sticker id, so derive via the stickers view.
  const found = game.view().stickers.find((x) => x.id === stickerId);
  return found ? found.artId : "sticker-milestone";
}

function renderStickers(view) {
  stickerGrid.innerHTML = "";
  for (const s of view.stickers) {
    const cell = document.createElement("div");
    cell.className = "sticker-cell";
    cell.setAttribute("role", "listitem");
    cell.dataset.earned = String(s.earned);
    cell.innerHTML = `
      <span class="sticker-art">${art.svg(s.artId)}</span>
      <span class="sticker-name">${escapeHtml(s.title)}</span>
    `;
    cell.setAttribute("aria-label", `${s.title}${s.earned ? ", ganada" : ", por ganar"}`);
    stickerGrid.appendChild(cell);
  }
}

// ---- Armario de Lalo (D1 / AC-M1) ----
function renderWardrobe(view) {
  // live preview of the current (customized) Lalo
  if (wardrobePreview) {
    mascot.mount(wardrobePreview, view.lalo);
    mascot.setState("idle");
  }
  const unlocked = game.unlockedCustomization();
  const unlockedColors = new Set(unlocked.colors);
  const unlockedAcc = new Set(unlocked.accessories);
  const sel = view.lalo;

  // Colors: tappable swatches; locked ones are non-selectable silhouettes.
  if (wardrobeColors) {
    wardrobeColors.innerHTML = "";
    for (const c of customize.COLORS) {
      const isUnlocked = unlockedColors.has(c.id);
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "wardrobe-tile wardrobe-color";
      tile.setAttribute("role", "listitem");
      tile.dataset.locked = String(!isUnlocked);
      tile.dataset.selected = String(sel.color === c.id);
      tile.disabled = !isUnlocked;
      tile.style.setProperty("--swatch", c.fill);
      tile.innerHTML = `<span class="swatch" aria-hidden="true"></span>`;
      tile.setAttribute(
        "aria-label",
        `${c.label}${!isUnlocked ? ", bloqueado" : sel.color === c.id ? ", elegido" : ""}`
      );
      tile.setAttribute("aria-pressed", String(sel.color === c.id));
      if (isUnlocked) {
        tile.addEventListener("click", () =>
          game.setLaloCustomization({ color: c.id, accessories: sel.accessories })
        );
      }
      wardrobeColors.appendChild(tile);
    }
  }

  // Accessories: toggle on/off; locked ones are silhouettes.
  if (wardrobeAccessories) {
    wardrobeAccessories.innerHTML = "";
    for (const a of customize.ACCESSORIES) {
      const isUnlocked = unlockedAcc.has(a.id);
      const equipped = sel.accessories.includes(a.id);
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "wardrobe-tile wardrobe-accessory";
      tile.setAttribute("role", "listitem");
      tile.dataset.locked = String(!isUnlocked);
      tile.dataset.selected = String(equipped);
      tile.disabled = !isUnlocked;
      // show the accessory snippet on a neutral mascot-space mini SVG
      tile.innerHTML = `
        <span class="wardrobe-acc-art" aria-hidden="true">
          <svg viewBox="0 0 120 120"><rect x="30" y="40" width="60" height="60" rx="26" fill="#e7eefc"/>${a.markup}</svg>
        </span>
        <span class="wardrobe-acc-label">${escapeHtml(a.label)}</span>`;
      tile.setAttribute(
        "aria-label",
        `${a.label}${!isUnlocked ? ", bloqueado" : equipped ? ", puesto" : ""}`
      );
      tile.setAttribute("aria-pressed", String(equipped));
      if (isUnlocked) {
        tile.addEventListener("click", () => {
          const next = equipped
            ? sel.accessories.filter((id) => id !== a.id)
            : [...sel.accessories, a.id];
          game.setLaloCustomization({ color: sel.color, accessories: next });
        });
      }
      wardrobeAccessories.appendChild(tile);
    }
  }
}

// ---- Jardín de Lalo (D4 / AC-M4) ----
function renderGarden(view) {
  if (!gardenCanvas) return;
  const g = view.garden || [];
  const unlocked = g.filter((e) => e.unlocked).length;
  if (gardenSummary) {
    gardenSummary.textContent = `Jardín de Lalo: ${unlocked} de ${g.length} elementos`;
  }
  gardenCanvas.setAttribute("aria-label", `Jardín de Lalo: ${unlocked} elementos`);
  gardenCanvas.innerHTML = "";
  for (const e of g) {
    const cell = document.createElement("div");
    cell.className = "garden-cell";
    cell.setAttribute("role", "listitem");
    cell.dataset.unlocked = String(e.unlocked);
    cell.innerHTML = `<span class="garden-art" aria-hidden="true">${art.svg(e.artId)}</span>`;
    cell.setAttribute("aria-label", e.unlocked ? e.label : `${e.label}, por descubrir`);
    gardenCanvas.appendChild(cell);
  }
}

function renderDashboard() {
  const stats = game.dashboardStats();
  // Spanish-voice notice (AC-I2.5): visible only when no Spanish voice exists.
  if (voiceNotice) voiceNotice.hidden = !stats.noSpanishVoice;
  dashMastered.textContent = `${stats.mastered}/${stats.total}`;
  dashStars.textContent = String(stats.stars);
  dashStreak.textContent = String(stats.streak);
  dashBest.textContent = String(stats.bestStreak);
  dashStickers.textContent = String(stats.stickers);
  dashTrouble.textContent = stats.trouble.length ? stats.trouble.join("  ") : "Ninguna todavía 👍";

  diffFacil.setAttribute("aria-pressed", String(stats.difficulty === "facil"));
  diffNormal.setAttribute("aria-pressed", String(stats.difficulty === "normal"));
  diffFacil.classList.toggle("is-active", stats.difficulty === "facil");
  diffNormal.classList.toggle("is-active", stats.difficulty === "normal");
  veryYoungToggle.checked = Boolean(stats.veryYoung);

  // Auto-read toggle (D7 / AC-K7) reflects the persisted setting.
  if (autoReadToggle) autoReadToggle.checked = Boolean(stats.autoRead);

  // Background-music toggle (D8 / AC-M8) reflects the persisted setting.
  if (musicToggle) musicToggle.checked = Boolean(stats.music);

  // Words-per-level control (iteration 8, D3 / AC-L3.2) reflects the persisted
  // value. The select offers values across the clamp range (5..20).
  if (wordsPerLevelSelect && stats.wordsPerLevel != null) {
    wordsPerLevelSelect.value = String(stats.wordsPerLevel);
  }

  // Voice picker (D3 / AC-K3): (re)populate from the device voices and
  // preselect the persisted choice. "Automática" is the empty-value sentinel.
  populateVoiceOptions(stats.availableVoices || [], stats.voicePref || "");
}

/**
 * Fill #voice-select with the device voices (Spanish-first), keeping the
 * "Automática" option first, then select the persisted preference. Safe no-op
 * if the control is absent. Called on dashboard render and on `voiceschanged`.
 */
function populateVoiceOptions(voices, preferredId) {
  if (!voiceSelect) return;
  voiceSelect.innerHTML = "";
  const auto = document.createElement("option");
  auto.value = "";
  auto.textContent = "Automática (recomendada)";
  voiceSelect.appendChild(auto);
  for (const v of voices) {
    const opt = document.createElement("option");
    opt.value = v.id;
    opt.textContent = v.label;
    voiceSelect.appendChild(opt);
  }
  // Preselect the persisted value when it still matches an installed voice,
  // else fall back to "Automática" (AC-K3.4).
  const has = voices.some((v) => v.id === preferredId);
  voiceSelect.value = preferredId && has ? preferredId : "";
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

// ---- Adult gate → dashboard ----
async function openDashboardGated() {
  const ok = await adultGate.open({
    overlay: gateOverlay,
    promptEl: gatePrompt,
    choicesEl: gateChoices,
    cancelEl: gateCancel,
  });
  if (ok) game.goDashboard();
}

// ---- Event wiring ----
startBtn.addEventListener("click", () => game.start());
welcomeDashBtn.addEventListener("click", openDashboardGated);

onbNextBtn.addEventListener("click", () => game.onboardingNext());
onbSkipBtn.addEventListener("click", () => game.skipOnboarding());

mapStickersBtn.addEventListener("click", () => game.goStickers());
mapDashBtn.addEventListener("click", openDashboardGated);
if (mapWardrobeBtn) mapWardrobeBtn.addEventListener("click", () => game.goWardrobe());
if (mapGardenBtn) mapGardenBtn.addEventListener("click", () => game.goGarden());
if (wardrobeBackBtn) wardrobeBackBtn.addEventListener("click", () => game.goMap());
if (gardenBackBtn) gardenBackBtn.addEventListener("click", () => game.goMap());

speakBtn.addEventListener("click", () => game.listenAttempt());
backBtn.addEventListener("click", () => game.goMap());

summaryContinueBtn.addEventListener("click", () => game.summaryContinue());
stickersBackBtn.addEventListener("click", () => game.goMap());

dashBackBtn.addEventListener("click", () => game.goMap());
diffFacil.addEventListener("click", () => game.setDifficulty("facil"));
diffNormal.addEventListener("click", () => game.setDifficulty("normal"));
veryYoungToggle.addEventListener("change", (e) => game.setVeryYoung(e.target.checked));
if (autoReadToggle) {
  autoReadToggle.addEventListener("change", (e) => game.setAutoRead(e.target.checked));
}
if (voiceSelect) {
  // "" (Automática) maps to null; any other value is a stable voiceId.
  voiceSelect.addEventListener("change", (e) => {
    const id = e.target.value || null;
    game.setVoicePref(id);
    // Voice PREVIEW (iteration 9, D7 / AC-M7): speak a short sample word in the
    // newly chosen voice. Fires only on the adult-initiated change (never on
    // load); interruptible via speech.speak's cancel; no-ops gracefully when no
    // usable voice exists.
    speech.setPreferredVoice(id);
    speech.speak("Lalo");
  });
}
if (musicToggle) {
  // Background music (iteration 9, D8 / AC-M8). The toggle is a user gesture, so
  // turning it ON may legally start the AudioContext per autoplay policy.
  musicToggle.addEventListener("change", (e) => game.setMusicEnabled(e.target.checked));
}
if (wordsPerLevelSelect) {
  // Words-per-level (iteration 8, D3 / AC-L3.2): persist + clamp via the game.
  wordsPerLevelSelect.addEventListener("change", (e) =>
    game.setWordsPerLevel(Number(e.target.value))
  );
}
// Voices load lazily in Chrome; refresh the picker options when they arrive, but
// only while the dashboard is on screen (re-reads the persisted preference).
if (typeof window !== "undefined" && window.speechSynthesis) {
  const onVoicesChanged = () => {
    if (game.state.phase !== "dashboard") return;
    const stats = game.dashboardStats();
    populateVoiceOptions(stats.availableVoices || [], stats.voicePref || "");
  };
  try {
    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
  } catch (_e) {
    window.speechSynthesis.onvoiceschanged = onVoicesChanged;
  }
}
resetBtn.addEventListener("click", () => {
  if (window.confirm("¿Borrar todo el progreso? No se puede deshacer.")) {
    game.resetProgress();
  }
});

// Keyboard shortcuts while playing (buttons keep native activation).
document.addEventListener("keydown", (e) => {
  if (game.state.phase !== "play") return;
  const tag = (e.target && e.target.tagName) || "";
  if (tag === "BUTTON" || tag === "INPUT") return;
  switch (e.key) {
    case "l":
    case "L":
      game.listenToModel();
      break;
    case " ":
    case "Enter":
      // Single primary action (iteration 8, AC-L1): no "¡Lo dije!" button to
      // trigger. On recognition devices this re-opens the mic ("listen again");
      // on unsupported devices it drives the no-recognition success path. No
      // key path dead-ends.
      e.preventDefault();
      game.primaryAction();
      break;
    case "ArrowRight":
      game.skip();
      break;
    default:
      break;
  }
});

// ---- Gesture recognizer on the reading card (G3) ----
// Native Pointer Events (mouse, touch, pen). Tap = read aloud; left swipe =
// next. Disambiguated by distance + time thresholds so one never fires the
// other. `touch-action: pan-y` (set in CSS) keeps vertical page scroll usable.
const TAP_MAX_MOVE = 10; // px — within this radius it's a tap, not a swipe
const TAP_MAX_TIME = 300; // ms — longer than this is not a tap
const SWIPE_MIN_X = 50; // px — horizontal travel needed to count as a swipe

let gesture = null;

function onPointerDown(e) {
  // Ignore gestures that start on an interactive child (word tiles) so their
  // own click still works; the card itself captures everything else.
  if (e.target.closest("button")) return;
  gesture = {
    id: e.pointerId,
    x0: e.clientX,
    y0: e.clientY,
    t0: performance.now(),
    moved: false,
  };
}

function onPointerMove(e) {
  if (!gesture || e.pointerId !== gesture.id) return;
  const dx = e.clientX - gesture.x0;
  const dy = e.clientY - gesture.y0;
  if (Math.abs(dx) > TAP_MAX_MOVE || Math.abs(dy) > TAP_MAX_MOVE) {
    gesture.moved = true;
  }
}

function onPointerUp(e) {
  if (!gesture || e.pointerId !== gesture.id) return;
  const dx = e.clientX - gesture.x0;
  const dy = e.clientY - gesture.y0;
  const dt = performance.now() - gesture.t0;
  const dist = Math.hypot(dx, dy);
  gesture = null;

  markGestureSeen(); // any real interaction dismisses the first-use hint

  // Tap: small movement, short time → read the current item aloud (AC-G3.1).
  if (dist < TAP_MAX_MOVE && dt < TAP_MAX_TIME) {
    game.tapCard();
    return;
  }
  // Swipe: mostly horizontal, past the threshold (AC-G3.2).
  if (Math.abs(dx) > SWIPE_MIN_X && Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) game.swipeNext(); // left → next
    else game.swipePrev(); // right → repeat (non-destructive)
  }
}

function onPointerCancel(e) {
  if (gesture && e.pointerId === gesture.id) gesture = null;
}

// Keyboard parity for the card's tap-to-hear (AC-H6.1/H6.3): Enter or Space on
// the focused #card-host triggers the same model playback as a tap. Space is
// prevented from scrolling the page. This is additive — the Pointer Events
// gesture recognizer and all existing document-level keyboard paths still work.
function onCardHostKeydown(e) {
  if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
  if (e.target.closest("button")) return; // let inner controls handle their own keys
  if (e.key === " " || e.key === "Spacebar") e.preventDefault(); // no page scroll
  markGestureSeen();
  game.tapCard(); // same model-playback intent as a tap
}

if (cardHost) {
  cardHost.addEventListener("pointerdown", onPointerDown);
  cardHost.addEventListener("pointermove", onPointerMove);
  cardHost.addEventListener("pointerup", onPointerUp);
  cardHost.addEventListener("pointercancel", onPointerCancel);
  cardHost.addEventListener("keydown", onCardHostKeydown);
}

// ---- First-use gesture hint (never blocks play) ----
const GESTURE_HINT_KEY = "silabas:gestureHintSeen";

function gestureHintSeen() {
  try {
    return localStorage.getItem(GESTURE_HINT_KEY) === "1";
  } catch (_e) {
    return false;
  }
}

function markGestureSeen() {
  if (!gestureHint || gestureHint.hidden) return;
  gestureHint.hidden = true;
  try {
    localStorage.setItem(GESTURE_HINT_KEY, "1");
  } catch (_e) {
    /* storage disabled — the hint simply shows again next time */
  }
}

function maybeShowGestureHint(phase) {
  if (!gestureHint) return;
  if (phase === "play" && !gestureHintSeen()) {
    gestureHint.hidden = false;
  } else {
    gestureHint.hidden = true;
  }
}

// ---- Service worker registration (PWA / offline) ----
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      /* offline support is a bonus; the app still runs */
    });
  });
}

// Initial paint.
game.render();
