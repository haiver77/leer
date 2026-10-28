// mascot.js — Lalo, a friendly rounded inline-SVG character with reactive
// states. Motion is CSS-driven (see styles.css), and prefers-reduced-motion
// swaps motion for a static expressive pose.
//
// Usage:
//   import { mount, setState } from "./mascot.js";
//   mount(document.getElementById("mascot-host"));
//   setState("cheer");

export const STATES = ["idle", "cheer", "encourage", "model"];

let hostEl = null;

/** Lalo's inline SVG. Parts carry classes so CSS can animate them per-state. */
const LALO_SVG = `
<svg class="lalo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Lalo, tu amigo">
  <title>Lalo</title>
  <ellipse class="lalo-shadow" cx="60" cy="110" rx="34" ry="6" fill="rgba(0,0,0,0.18)"/>
  <g class="lalo-body">
    <!-- body -->
    <rect x="30" y="40" width="60" height="60" rx="26" fill="#4cc9f0"/>
    <rect x="30" y="40" width="60" height="60" rx="26" fill="none" stroke="#2f9fd0" stroke-width="3"/>
    <!-- tummy -->
    <ellipse cx="60" cy="78" rx="20" ry="16" fill="#eaf7ff"/>
    <!-- ears / antennae -->
    <g class="lalo-ears">
      <line x1="44" y1="40" x2="40" y2="22" stroke="#2f9fd0" stroke-width="4"/>
      <circle cx="40" cy="20" r="5" fill="#ff5d8f"/>
      <line x1="76" y1="40" x2="80" y2="22" stroke="#2f9fd0" stroke-width="4"/>
      <circle cx="80" cy="20" r="5" fill="#ffd166"/>
    </g>
    <!-- eyes -->
    <g class="lalo-eyes">
      <circle cx="50" cy="60" r="7" fill="#fff"/>
      <circle cx="70" cy="60" r="7" fill="#fff"/>
      <circle class="lalo-pupil" cx="50" cy="61" r="3.2" fill="#1d2b53"/>
      <circle class="lalo-pupil" cx="70" cy="61" r="3.2" fill="#1d2b53"/>
    </g>
    <!-- cheeks -->
    <circle cx="42" cy="72" r="4" fill="#ff9bb6" opacity="0.8"/>
    <circle cx="78" cy="72" r="4" fill="#ff9bb6" opacity="0.8"/>
    <!-- mouth (class switches shape via CSS/state) -->
    <path class="lalo-mouth" d="M50 78 q10 8 20 0" fill="none" stroke="#1d2b53" stroke-width="3" stroke-linecap="round"/>
    <!-- arms -->
    <path class="lalo-arm lalo-arm-left" d="M30 66 q-12 2 -14 14" fill="none" stroke="#2f9fd0" stroke-width="6" stroke-linecap="round"/>
    <path class="lalo-arm lalo-arm-right" d="M90 66 q12 2 14 14" fill="none" stroke="#2f9fd0" stroke-width="6" stroke-linecap="round"/>
  </g>
</svg>`;

/**
 * Mount Lalo into a host element (idempotent). Safe no-op outside the browser.
 * @param {HTMLElement} host
 */
export function mount(host) {
  if (!host) return;
  hostEl = host;
  hostEl.innerHTML = LALO_SVG;
  hostEl.classList.add("mascot-host");
  setState("idle");
}

/**
 * Switch Lalo's reaction. Applies a `lalo-state-*` class the CSS animates.
 * Unknown states fall back to "idle". Safe no-op if not mounted.
 * @param {"idle"|"cheer"|"encourage"|"model"} state
 */
export function setState(state) {
  if (!hostEl) return;
  const next = STATES.includes(state) ? state : "idle";
  for (const s of STATES) hostEl.classList.remove(`lalo-state-${s}`);
  hostEl.classList.add(`lalo-state-${next}`);
  hostEl.dataset.state = next;
}

/** Current state (or null if unmounted). Mostly for tests/debug. */
export function currentState() {
  return hostEl ? hostEl.dataset.state || "idle" : null;
}

/** The raw SVG markup, for environments that want to render it directly. */
export function markup() {
  return LALO_SVG;
}
