// adultGate.js — a tiny friction barrier protecting the parent dashboard from
// young children. Not security: either a simple arithmetic question or a
// press-and-hold. Nothing is stored.
//
// The challenge generator + answer check are PURE and unit-testable. The
// `open()` helper is a minimal browser UI hook built on them.

/** How long the press-and-hold alternative must be held (ms). */
export const HOLD_MS = 2000;

/**
 * Generate a simple arithmetic challenge a young child can't easily solve but
 * an adult answers instantly. Pure (optionally seeded via rng for tests).
 * @param {() => number} [rng] 0..1 random source
 * @returns {{a: number, b: number, prompt: string, answer: number}}
 */
export function makeChallenge(rng = Math.random) {
  const a = 2 + Math.floor(rng() * 7); // 2..8
  const b = 2 + Math.floor(rng() * 7); // 2..8
  return { a, b, prompt: `¿Cuánto es ${a} + ${b}?`, answer: a + b };
}

/**
 * Check a submitted answer against a challenge. Pure. Accepts numbers or
 * numeric strings; ignores surrounding whitespace.
 * @param {{answer: number}} challenge
 * @param {number|string} submitted
 * @returns {boolean}
 */
export function checkAnswer(challenge, submitted) {
  if (!challenge) return false;
  const n = typeof submitted === "string" ? Number(submitted.trim()) : submitted;
  return Number.isFinite(n) && n === challenge.answer;
}

/**
 * A set of number-button choices for the arithmetic gate: the correct answer
 * plus a few near distractors, shuffled. Pure (seedable).
 * @param {{answer: number}} challenge
 * @param {() => number} [rng]
 * @returns {number[]}
 */
export function answerChoices(challenge, rng = Math.random) {
  const set = new Set([challenge.answer]);
  while (set.size < 4) {
    const delta = Math.ceil(rng() * 4) * (rng() < 0.5 ? -1 : 1);
    const cand = challenge.answer + delta;
    if (cand > 0) set.add(cand);
  }
  const arr = [...set];
  // Fisher–Yates shuffle.
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Minimal browser UI hook: show an arithmetic gate overlay and resolve true on
 * a correct answer, false on cancel. Expects an overlay element with a prompt
 * target and a choices container (ids below). Falls back to a window.prompt if
 * the overlay isn't present, so the dashboard is still reachable.
 *
 * @param {{
 *   overlay?: HTMLElement,
 *   promptEl?: HTMLElement,
 *   choicesEl?: HTMLElement,
 *   cancelEl?: HTMLElement,
 * }} [ui]
 * @returns {Promise<boolean>}
 */
export function open(ui = {}) {
  const challenge = makeChallenge();

  // No overlay wired → degrade to a native prompt (still gated, never blocks).
  if (!ui.overlay || !ui.promptEl || !ui.choicesEl) {
    if (typeof window !== "undefined" && typeof window.prompt === "function") {
      const ans = window.prompt(challenge.prompt);
      return Promise.resolve(checkAnswer(challenge, ans));
    }
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const { overlay, promptEl, choicesEl, cancelEl } = ui;
    promptEl.textContent = challenge.prompt;
    choicesEl.innerHTML = "";

    const close = (result) => {
      overlay.hidden = true;
      choicesEl.innerHTML = "";
      if (cancelEl) cancelEl.onclick = null;
      resolve(result);
    };

    for (const choice of answerChoices(challenge)) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gate-choice btn";
      btn.textContent = String(choice);
      btn.setAttribute("aria-label", `Responder ${choice}`);
      btn.onclick = () => close(checkAnswer(challenge, choice));
      choicesEl.appendChild(btn);
    }

    if (cancelEl) cancelEl.onclick = () => close(false);
    overlay.hidden = false;
    const first = choicesEl.querySelector("button");
    if (first) first.focus();
  });
}
