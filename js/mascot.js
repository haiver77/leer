// mascot.js — Lalo, a friendly rounded inline-SVG character with reactive
// states, a customizable body color + accessory layers (iteration 9, D1), and
// extra "alive" behaviors (blink / surprise / sleeping — D2). Motion is
// CSS-driven (see styles.css); prefers-reduced-motion swaps motion for static
// expressive poses.
//
// Usage:
//   import { mount, setState, applyCustomization, surprise, sleep, wake } from "./mascot.js";
//   mount(document.getElementById("mascot-host"), { color: "sky", accessories: ["bow"] });
//   setState("cheer");

import * as customize from "./customize.js";

export const STATES = ["idle", "cheer", "encourage", "model"];

let hostEl = null;
let currentSelection = customize.defaultSelection();
let surpriseTimer = null;

/**
 * Build Lalo's inline SVG for a given customization selection. PURE: no DOM,
 * deterministic for a selection, so it can be rendered directly and unit-tested.
 * The body color is parameterized (fill/stroke from the palette) and accessory
 * layers are drawn over the SAME viewBox (0 0 120 120). Unknown ids are ignored
 * (falls back to the default color; unknown accessories are skipped).
 *
 * @param {{color?: string, accessories?: string[]}} [options]
 * @returns {string} SVG markup
 */
export function markup(options = {}) {
  const def = customize.defaultSelection();
  const color =
    customize.colorById(options && options.color) ||
    customize.colorById(def.color) || { fill: "#4cc9f0", stroke: "#2f9fd0" };

  const accIds = Array.isArray(options && options.accessories)
    ? options.accessories
    : [];
  const accLayers = accIds
    .map((id) => customize.accessoryById(id))
    .filter(Boolean)
    .map((a) => a.markup)
    .join("");

  return `
<svg class="lalo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Lalo, tu amigo">
  <title>Lalo</title>
  <ellipse class="lalo-shadow" cx="60" cy="110" rx="34" ry="6" fill="rgba(0,0,0,0.18)"/>
  <g class="lalo-body">
    <!-- body (color parameterized, D1) -->
    <rect x="30" y="40" width="60" height="60" rx="26" fill="${color.fill}"/>
    <rect x="30" y="40" width="60" height="60" rx="26" fill="none" stroke="${color.stroke}" stroke-width="3"/>
    <!-- tummy -->
    <ellipse cx="60" cy="78" rx="20" ry="16" fill="#eaf7ff"/>
    <!-- ears / antennae -->
    <g class="lalo-ears">
      <line x1="44" y1="40" x2="40" y2="22" stroke="${color.stroke}" stroke-width="4"/>
      <circle cx="40" cy="20" r="5" fill="#ff5d8f"/>
      <line x1="76" y1="40" x2="80" y2="22" stroke="${color.stroke}" stroke-width="4"/>
      <circle cx="80" cy="20" r="5" fill="#ffd166"/>
    </g>
    <!-- eyes -->
    <g class="lalo-eyes">
      <circle cx="50" cy="60" r="7" fill="#fff"/>
      <circle cx="70" cy="60" r="7" fill="#fff"/>
      <circle class="lalo-pupil" cx="50" cy="61" r="3.2" fill="#1d2b53"/>
      <circle class="lalo-pupil" cx="70" cy="61" r="3.2" fill="#1d2b53"/>
      <!-- eyelids used by blink + sleeping (CSS-driven, D2) -->
      <rect class="lalo-lid lalo-lid-left" x="43" y="53" width="14" height="0" fill="${color.fill}"/>
      <rect class="lalo-lid lalo-lid-right" x="63" y="53" width="14" height="0" fill="${color.fill}"/>
    </g>
    <!-- cheeks -->
    <circle cx="42" cy="72" r="4" fill="#ff9bb6" opacity="0.8"/>
    <circle cx="78" cy="72" r="4" fill="#ff9bb6" opacity="0.8"/>
    <!-- mouth (class switches shape via CSS/state) -->
    <path class="lalo-mouth" d="M50 78 q10 8 20 0" fill="none" stroke="#1d2b53" stroke-width="3" stroke-linecap="round"/>
    <!-- sleeping Zzz (shown only in the sleeping state via CSS, D2) -->
    <text class="lalo-zzz" x="86" y="40" font-size="14" fill="#1d2b53">z</text>
    <!-- arms -->
    <path class="lalo-arm lalo-arm-left" d="M30 66 q-12 2 -14 14" fill="none" stroke="${color.stroke}" stroke-width="6" stroke-linecap="round"/>
    <path class="lalo-arm lalo-arm-right" d="M90 66 q12 2 14 14" fill="none" stroke="${color.stroke}" stroke-width="6" stroke-linecap="round"/>
    <!-- accessory layers (D1), drawn last so they sit on top -->
    ${accLayers}
  </g>
</svg>`;
}

/**
 * Mount Lalo into a host element (idempotent). Safe no-op outside the browser.
 * @param {HTMLElement} host
 * @param {{color?: string, accessories?: string[]}} [selection] optional initial customization
 */
export function mount(host, selection) {
  if (!host) return;
  hostEl = host;
  if (selection) currentSelection = normalizeSelection(selection);
  hostEl.innerHTML = markup(currentSelection);
  hostEl.classList.add("mascot-host");
  setState("idle");
}

/** Normalize an arbitrary selection into {color, accessories[]}. */
function normalizeSelection(selection) {
  const def = customize.defaultSelection();
  return {
    color: selection && typeof selection.color === "string" ? selection.color : def.color,
    accessories: Array.isArray(selection && selection.accessories)
      ? [...selection.accessories]
      : [],
  };
}

/**
 * Re-render the mounted Lalo with a new customization selection (D1 / AC-M1.5).
 * Preserves the current reaction state. Safe no-op if not mounted.
 * @param {{color?: string, accessories?: string[]}} selection
 */
export function applyCustomization(selection) {
  currentSelection = normalizeSelection(selection);
  if (!hostEl) return;
  const keep = hostEl.dataset.state || "idle";
  const sleeping = hostEl.classList.contains("lalo-sleeping");
  hostEl.innerHTML = markup(currentSelection);
  hostEl.classList.add("mascot-host");
  setState(keep);
  if (sleeping) hostEl.classList.add("lalo-sleeping");
}

/** The currently applied customization selection (copy). */
export function selection() {
  return normalizeSelection(currentSelection);
}

/**
 * Switch Lalo's reaction. Applies a `lalo-state-*` class the CSS animates.
 * Unknown states fall back to "idle". Switching states wakes Lalo (clears the
 * sleeping pose) so a play action always shows an awake, reactive Lalo. Safe
 * no-op if not mounted.
 * @param {"idle"|"cheer"|"encourage"|"model"} state
 */
export function setState(state) {
  if (!hostEl) return;
  const next = STATES.includes(state) ? state : "idle";
  for (const s of STATES) hostEl.classList.remove(`lalo-state-${s}`);
  hostEl.classList.add(`lalo-state-${next}`);
  hostEl.dataset.state = next;
  // Any explicit reaction wakes Lalo.
  hostEl.classList.remove("lalo-sleeping");
}

/** Current state (or null if unmounted). Mostly for tests/debug. */
export function currentState() {
  return hostEl ? hostEl.dataset.state || "idle" : null;
}

/**
 * Play a one-shot "surprise / curiosity" reaction (D2 / AC-M2.1b), e.g. when a
 * new word is presented. Adds a transient `lalo-surprise` class (CSS animates
 * it) and auto-clears after `ms`. Additive — does not change the logical state,
 * so the read→listen sequence is unaffected (AC-M2.3). Safe no-op if unmounted.
 * @param {number} [ms]
 */
export function surprise(ms = 900) {
  if (!hostEl) return;
  hostEl.classList.remove("lalo-sleeping"); // waking up to be curious
  hostEl.classList.add("lalo-surprise");
  clearTimeout(surpriseTimer);
  surpriseTimer = setTimeout(() => {
    if (hostEl) hostEl.classList.remove("lalo-surprise");
  }, ms);
}

/** Put Lalo into the sleeping / "esperando" pose (D2 / AC-M2.1c). */
export function sleep() {
  if (!hostEl) return;
  hostEl.classList.add("lalo-sleeping");
}

/** Wake Lalo from the sleeping pose (any interaction). */
export function wake() {
  if (!hostEl) return;
  hostEl.classList.remove("lalo-sleeping");
}

/** Whether Lalo is currently in the sleeping pose. */
export function isSleeping() {
  return hostEl ? hostEl.classList.contains("lalo-sleeping") : false;
}
