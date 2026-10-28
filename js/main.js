// main.js — bootstrap: wires the DOM to the expanded game state machine,
// mounts Lalo, renders every screen, registers the service worker, and links
// the adult gate to the dashboard.

import { createGame } from "./game.js";
import * as mascot from "./mascot.js";
import * as art from "./art.js";
import * as levels from "./levels.js";
import * as adultGate from "./adultGate.js";

const el = (id) => document.getElementById(id);

// ---- Screens ----
const screens = {
  welcome: el("welcome-screen"),
  onboarding: el("onboarding-screen"),
  map: el("map-screen"),
  play: el("game-screen"),
  summary: el("summary-screen"),
  stickers: el("stickers-screen"),
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
const dailyFill = el("daily-goal-fill");

const itemArt = el("item-art");
const syllableCard = el("syllable-card");
const wordView = el("word-view");
const wordPart0 = el("word-part-0");
const wordPart1 = el("word-part-1");
const wordWhole = el("word-whole");
const feedback = el("feedback");
const starsValue = el("stars-value");
const speakBtn = el("speak-btn");
const confirmBtn = el("confirm-btn");
const listenBtn = el("listen-btn");
const nextBtn = el("next-btn");
const backBtn = el("back-btn");

const summaryStars = el("summary-stars");
const summarySticker = el("summary-sticker");
const summaryUnlock = el("summary-unlock");
const summaryContinueBtn = el("summary-continue-btn");

const stickerGrid = el("sticker-grid");
const stickersBackBtn = el("stickers-back-btn");

const dashBackBtn = el("dashboard-back-btn");
const dashMastered = el("dash-mastered");
const dashStars = el("dash-stars");
const dashStreak = el("dash-streak");
const dashBest = el("dash-best");
const dashStickers = el("dash-stickers");
const dashTrouble = el("dash-trouble");
const diffFacil = el("diff-facil");
const diffNormal = el("diff-normal");
const veryYoungToggle = el("veryyoung-toggle");
const resetBtn = el("reset-btn");

// Adult gate overlay
const gateOverlay = el("gate-overlay");
const gatePrompt = el("gate-prompt");
const gateChoices = el("gate-choices");
const gateCancel = el("gate-cancel");

// ---- Mascot: a single logical Lalo; we remount into the active screen host ----
let activeMascotState = "idle";
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
    mascot.mount(host);
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
});

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
    case "dashboard":
      renderDashboard();
      break;
    default:
      break;
  }
}

const ONBOARDING_TEXT = {
  1: "Esta es tu sílaba. Mírala bien.",
  2: "Toca 🔊 para oírla.",
  3: "Toca 🎤 y dila tú.",
};

function renderOnboarding(view) {
  onbText.textContent = ONBOARDING_TEXT[view.onboardingStep] || "";
  onbDemo.textContent = "Pa";
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

  // art cue for the current item
  const def = view.level;
  const isWord = def && def.type === "word";
  const cueId = isWord && view.currentWord ? view.currentWord.artId : "cue-default";
  itemArt.innerHTML = art.svg(cueId);

  if (isWord && view.currentWord) {
    syllableCard.hidden = true;
    wordView.hidden = false;
    wordPart0.textContent = view.currentWord.parts[0];
    wordPart1.textContent = view.currentWord.parts[1];
    wordWhole.textContent = view.currentWord.word;
    wordWhole.setAttribute("aria-label", `Palabra: ${view.currentWord.word}`);
  } else {
    syllableCard.hidden = false;
    wordView.hidden = true;
    if (view.current) {
      syllableCard.textContent = view.current;
      syllableCard.setAttribute("aria-label", `Sílaba: ${view.current}`);
    }
  }

  // Mic vs self-confirm (never dead-end). Mic is primary; confirm is secondary.
  speakBtn.hidden = !view.recognitionSupported;
  speakBtn.classList.toggle("is-listening", view.listening);
  speakBtn.setAttribute("aria-pressed", String(view.listening));
  confirmBtn.classList.toggle("is-primary", !view.recognitionSupported);
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

function renderDashboard() {
  const stats = game.dashboardStats();
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

speakBtn.addEventListener("click", () => game.listenAttempt());
confirmBtn.addEventListener("click", () => game.confirmSaid());
listenBtn.addEventListener("click", () => game.listenToModel());
nextBtn.addEventListener("click", () => game.skip());
backBtn.addEventListener("click", () => game.goMap());

wordPart0.addEventListener("click", () => game.modelPart(0));
wordPart1.addEventListener("click", () => game.modelPart(1));

summaryContinueBtn.addEventListener("click", () => game.summaryContinue());
stickersBackBtn.addEventListener("click", () => game.goMap());

dashBackBtn.addEventListener("click", () => game.goMap());
diffFacil.addEventListener("click", () => game.setDifficulty("facil"));
diffNormal.addEventListener("click", () => game.setDifficulty("normal"));
veryYoungToggle.addEventListener("change", (e) => game.setVeryYoung(e.target.checked));
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
      e.preventDefault();
      if (game.state.recognitionSupported) game.listenAttempt();
      else game.confirmSaid();
      break;
    case "Enter":
      game.confirmSaid();
      break;
    case "ArrowRight":
      game.skip();
      break;
    default:
      break;
  }
});

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
