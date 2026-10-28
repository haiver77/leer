// celebrate.js — success effects: canvas confetti/stars + Web Audio chime +
// optional haptics. Respects prefers-reduced-motion.

const COLORS = ["#ff5d8f", "#ffd166", "#06d6a0", "#4cc9f0", "#9b5de5", "#f15bb5"];

let canvas = null;
let ctx = null;
let audioCtx = null;

/** Lazily grab (or create) the full-screen confetti canvas. */
function getCanvas() {
  if (canvas) return canvas;
  canvas = document.getElementById("confetti-canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "confetti-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
  }
  ctx = canvas.getContext("2d");
  resize();
  window.addEventListener("resize", resize);
  return canvas;
}

function resize() {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Play a short, pleasant two-note success chime via Web Audio oscillators. */
function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const now = audioCtx.currentTime;
    // Two rising notes: C6 then E6 — bright and happy.
    const notes = [
      { freq: 1046.5, start: 0, dur: 0.18 },
      { freq: 1318.5, start: 0.12, dur: 0.28 },
    ];
    for (const n of notes) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.value = n.freq;
      gain.gain.setValueAtTime(0.0001, now + n.start);
      gain.gain.exponentialRampToValueAtTime(0.25, now + n.start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now + n.start);
      osc.stop(now + n.start + n.dur + 0.02);
    }
  } catch (_e) {
    /* audio is a bonus; never block the game */
  }
}

/** Launch a burst of confetti + stars. Accepts variation params. */
function burstConfetti(opts = {}) {
  getCanvas();
  const particles = [];
  const count = opts.count || 120;
  const spread = opts.spread || 1;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * (opts.originY || 0.35);

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (4 + Math.random() * 7) * spread;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: 6 + Math.random() * 8,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.3,
      star: Math.random() < 0.3,
      life: 1,
    });
  }

  const gravity = 0.18;
  let frames = 0;

  function drawStar(x, y, r, rot) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = rot + (i * 2 * Math.PI) / 5 - Math.PI / 2;
      ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
      const a2 = a + Math.PI / 5;
      ctx.lineTo(x + Math.cos(a2) * (r / 2), y + Math.sin(a2) * (r / 2));
    }
    ctx.closePath();
    ctx.fill();
  }

  function frame() {
    frames++;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let alive = false;
    for (const p of particles) {
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      p.life -= 0.012;
      if (p.life <= 0 || p.y > window.innerHeight + 40) continue;
      alive = true;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      if (p.star) {
        drawStar(p.x, p.y, p.size, p.rot);
      } else {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      }
      ctx.restore();
    }
    if (alive && frames < 240) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }
  requestAnimationFrame(frame);
}

/** Gentle haptic buzz on supported devices. */
function haptics() {
  try {
    if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
  } catch (_e) {
    /* ignore */
  }
}

/** Play a brighter, longer fanfare for milestones (3 rising notes). */
function playFanfare() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const now = audioCtx.currentTime;
    const notes = [
      { freq: 783.99, start: 0, dur: 0.16 }, // G5
      { freq: 1046.5, start: 0.12, dur: 0.16 }, // C6
      { freq: 1318.5, start: 0.24, dur: 0.34 }, // E6
    ];
    for (const n of notes) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.value = n.freq;
      gain.gain.setValueAtTime(0.0001, now + n.start);
      gain.gain.exponentialRampToValueAtTime(0.28, now + n.start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now + n.start);
      osc.stop(now + n.start + n.dur + 0.02);
    }
  } catch (_e) {
    /* audio is a bonus */
  }
}

// Rotating celebration variations (F14.1): vary origin + burst so success
// never feels identical. Each returns params for burstConfetti. Iteration 7
// (D5 / AC-K5) enriches the per-word burst (more particles + wider spread)
// while staying bounded/60fps-friendly; the milestone stays visibly bigger.
const VARIATIONS = [
  { originY: 0.35, count: 150, spread: 1.15 },
  { originY: 0.5, count: 120, spread: 1.45 },
  { originY: 0.25, count: 170, spread: 1 },
];
let variationIndex = 0;

/**
 * Play the full celebration. Honors prefers-reduced-motion by skipping the
 * confetti animation (sound + haptics still fire as non-motion feedback).
 *
 * @param {{milestone?: boolean}} [opts] milestone fires a bigger fanfare+burst
 */
export function play(opts = {}) {
  const milestone = Boolean(opts.milestone);
  if (milestone) {
    playFanfare();
  } else {
    playChime();
  }
  haptics();
  if (milestone) haptics();
  // The confetti layer needs a DOM (canvas). Skip it when there is none (e.g.
  // Node unit tests) or when reduced-motion is requested; sound + haptics above
  // already fired as the non-motion feedback.
  const hasDom = typeof document !== "undefined";
  if (hasDom && !prefersReducedMotion()) {
    const v = milestone
      ? { originY: 0.3, count: 220, spread: 1.4 }
      : VARIATIONS[variationIndex % VARIATIONS.length];
    variationIndex += 1;
    burstConfetti(v);
  }
}

/** Convenience: explicit milestone celebration. */
export function playMilestone() {
  play({ milestone: true });
}
