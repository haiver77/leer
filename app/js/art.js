// art.js — inline-SVG illustration registry. Returns SVG markup strings by id.
//
// Dependency-free, instantly offline. Covers: word pictures, map/island nodes,
// stickers, and icons. Every SVG is simple, rounded, high-contrast, and uses a
// shared 0 0 100 100 viewBox so it scales cleanly in any container.
//
// This module is pure (string in → string out) and safe to import in Node,
// though it's primarily consumed by the browser UI.

const W = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"';

/** Wrap inner markup in a standard square SVG with an accessible title. */
function svgEl(title, inner) {
  return `<svg ${W} role="img" aria-label="${title}"><title>${title}</title>${inner}</svg>`;
}

// ---- Word pictures (simple emblematic scenes) -------------------------------

const WORD_ART = {
  "word-pato": svgEl(
    "pato",
    `<ellipse cx="46" cy="64" rx="30" ry="20" fill="#ffd166"/>
     <circle cx="70" cy="40" r="16" fill="#ffd166"/>
     <circle cx="76" cy="36" r="3" fill="#1d2b53"/>
     <path d="M84 40 l14 -3 -2 8 z" fill="#ff8c42"/>
     <path d="M20 66 q-8 6 -2 12" stroke="#e8a900" stroke-width="4" fill="none"/>`
  ),
  "word-mesa": svgEl(
    "mesa",
    `<rect x="18" y="40" width="64" height="12" rx="4" fill="#c97b3c"/>
     <rect x="24" y="52" width="8" height="30" fill="#a05a28"/>
     <rect x="68" y="52" width="8" height="30" fill="#a05a28"/>`
  ),
  "word-lupa": svgEl(
    "lupa",
    `<circle cx="42" cy="42" r="24" fill="none" stroke="#4361ee" stroke-width="7"/>
     <circle cx="42" cy="42" r="18" fill="#cfe0ff"/>
     <rect x="58" y="58" width="28" height="10" rx="5" transform="rotate(45 62 62)" fill="#4361ee"/>`
  ),
  "word-dedo": svgEl(
    "dedo",
    `<rect x="40" y="28" width="20" height="46" rx="10" fill="#ffd1b3"/>
     <rect x="38" y="24" width="24" height="12" rx="6" fill="#fff"/>`
  ),
  "word-mapa": svgEl(
    "mapa",
    `<rect x="18" y="26" width="64" height="48" rx="4" fill="#eaf7d0"/>
     <path d="M30 34 q20 10 40 2 M26 50 q24 12 48 -2" stroke="#6aa84f" stroke-width="3" fill="none"/>
     <path d="M60 40 l6 6 -6 6 -6 -6 z" fill="#ff5d8f"/>`
  ),
  "word-sopa": svgEl(
    "sopa",
    `<path d="M24 50 a26 20 0 0 0 52 0 z" fill="#ff8c42"/>
     <ellipse cx="50" cy="50" rx="30" ry="8" fill="#ffb37a"/>
     <path d="M44 30 q4 -8 0 -14 M56 30 q4 -8 0 -14" stroke="#fff" stroke-width="3" fill="none"/>`
  ),
  "word-dado": svgEl(
    "dado",
    `<rect x="28" y="28" width="44" height="44" rx="10" fill="#fff" stroke="#1d2b53" stroke-width="3"/>
     <circle cx="42" cy="42" r="4" fill="#1d2b53"/>
     <circle cx="58" cy="58" r="4" fill="#1d2b53"/>
     <circle cx="50" cy="50" r="4" fill="#1d2b53"/>`
  ),
  "word-pelo": svgEl(
    "pelo",
    `<circle cx="50" cy="56" r="20" fill="#ffd1b3"/>
     <path d="M30 50 q20 -34 40 0 q-20 -10 -40 0" fill="#6b4226"/>`
  ),
  "word-loma": svgEl(
    "loma",
    `<path d="M14 72 q20 -30 40 -6 q16 -20 32 6 z" fill="#6aa84f"/>
     <circle cx="74" cy="30" r="9" fill="#ffd166"/>`
  ),
  "word-tela": svgEl(
    "tela",
    `<rect x="22" y="30" width="56" height="40" rx="6" fill="#9b5de5"/>
     <path d="M22 40 q14 8 28 0 t28 0 M22 54 q14 8 28 0 t28 0" stroke="#fff" stroke-width="3" fill="none"/>`
  ),
};

// ---- Island / map node art --------------------------------------------------

function islandArt(label, fill) {
  return svgEl(
    `isla ${label}`,
    `<ellipse cx="50" cy="74" rx="34" ry="12" fill="#f4e2a1"/>
     <path d="M30 74 q20 -40 40 0 z" fill="${fill}"/>
     <circle cx="50" cy="40" r="4" fill="#fff"/>`
  );
}

const ISLAND_ART = {
  "island-p": islandArt("P", "#ff5d8f"),
  "island-m": islandArt("M", "#4cc9f0"),
  "island-s": islandArt("S", "#06d6a0"),
  "island-t": islandArt("T", "#ffd166"),
  "island-l": islandArt("L", "#9b5de5"),
  "island-d": islandArt("D", "#f15bb5"),
  "island-mixed": islandArt("mezcla", "#4361ee"),
  "island-words": islandArt("palabras", "#ff8c42"),
  "island-digraphs": islandArt("sonidos", "#43aa8b"),
  "island-closed": islandArt("cerradas", "#6a4c93"),
};

// ---- Sticker art ------------------------------------------------------------

function stickerArt(title, emojiPath, fill) {
  return svgEl(
    title,
    `<circle cx="50" cy="50" r="38" fill="${fill}"/>
     <circle cx="50" cy="50" r="38" fill="none" stroke="#fff" stroke-width="4"/>
     ${emojiPath}`
  );
}

const STICKER_ART = {
  "sticker-p": stickerArt("Pingüino", `<ellipse cx="50" cy="54" rx="16" ry="22" fill="#1d2b53"/><ellipse cx="50" cy="58" rx="9" ry="16" fill="#fff"/><path d="M46 40 l8 0 -4 6 z" fill="#ff8c42"/>`, "#4cc9f0"),
  "sticker-m": stickerArt("Mono", `<circle cx="50" cy="52" r="18" fill="#8d5524"/><circle cx="50" cy="56" r="11" fill="#e0ac69"/><circle cx="42" cy="48" r="3" fill="#1d2b53"/><circle cx="58" cy="48" r="3" fill="#1d2b53"/>`, "#ffd166"),
  "sticker-s": stickerArt("Sol", `<circle cx="50" cy="50" r="16" fill="#ffd166"/><g stroke="#ffd166" stroke-width="4"><line x1="50" y1="20" x2="50" y2="30"/><line x1="50" y1="70" x2="50" y2="80"/><line x1="20" y1="50" x2="30" y2="50"/><line x1="70" y1="50" x2="80" y2="50"/></g>`, "#ff8c42"),
  "sticker-t": stickerArt("Tortuga", `<ellipse cx="50" cy="54" rx="22" ry="16" fill="#43aa8b"/><circle cx="74" cy="50" r="7" fill="#43aa8b"/><path d="M40 54 h20 M50 46 v16" stroke="#2d6a4f" stroke-width="2"/>`, "#06d6a0"),
  "sticker-l": stickerArt("León", `<circle cx="50" cy="52" r="20" fill="#ff8c42"/><circle cx="50" cy="52" r="13" fill="#ffd166"/><circle cx="44" cy="50" r="2.5" fill="#1d2b53"/><circle cx="56" cy="50" r="2.5" fill="#1d2b53"/>`, "#ffba08"),
  "sticker-d": stickerArt("Dinosaurio", `<path d="M30 60 q6 -26 24 -24 q18 2 16 22 z" fill="#6aa84f"/><circle cx="42" cy="44" r="2.5" fill="#1d2b53"/><path d="M30 60 l-6 6 M70 58 l6 6" stroke="#4c7a2f" stroke-width="3"/>`, "#90be6d"),
  "sticker-mixto": stickerArt("Arcoíris", `<path d="M26 64 a24 24 0 0 1 48 0" fill="none" stroke="#ff5d8f" stroke-width="5"/><path d="M32 64 a18 18 0 0 1 36 0" fill="none" stroke="#ffd166" stroke-width="5"/><path d="M38 64 a12 12 0 0 1 24 0" fill="none" stroke="#06d6a0" stroke-width="5"/>`, "#4cc9f0"),
  "sticker-palabras": stickerArt("Estrella", starPath(50, 50, 22, "#fff"), "#4361ee"),
  "sticker-digrafos": stickerArt("Cohete", `<path d="M50 24 q12 10 10 34 l-20 0 q-2 -24 10 -34z" fill="#fff"/><circle cx="50" cy="46" r="5" fill="#4cc9f0"/><path d="M40 58 l-8 10 8 -2z M60 58 l8 10 -8 -2z" fill="#ff5d8f"/>`, "#f15bb5"),
  "sticker-cerradas": stickerArt("Corona", `<path d="M30 62 l-2 -22 12 12 10 -18 10 18 12 -12 -2 22z" fill="#ffd166" stroke="#e8a900" stroke-width="2"/>`, "#9b5de5"),
  "sticker-milestone": stickerArt("Medalla", `<circle cx="50" cy="52" r="16" fill="#ffd166" stroke="#e8a900" stroke-width="3"/>${starPath(50, 52, 9, "#fff")}`, "#ff5d8f"),
};

function starPath(cx, cy, r, fill) {
  let pts = "";
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    pts += `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r} `;
    const a2 = a + Math.PI / 5;
    pts += `${cx + Math.cos(a2) * (r / 2)},${cy + Math.sin(a2) * (r / 2)} `;
  }
  return `<polygon points="${pts.trim()}" fill="${fill}"/>`;
}

// ---- Icons (de-emphasised secondary controls) -------------------------------

const ICON_ART = {
  "icon-lock": svgEl("Bloqueado", `<rect x="34" y="46" width="32" height="26" rx="5" fill="#8a8fa3"/><path d="M40 46 v-8 a10 10 0 0 1 20 0 v8" fill="none" stroke="#8a8fa3" stroke-width="5"/>`),
  "icon-check": svgEl("Completado", `<circle cx="50" cy="50" r="30" fill="#06d6a0"/><path d="M36 52 l10 10 20 -24" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`),
  "icon-mic": svgEl("Micrófono", `<rect x="42" y="24" width="16" height="30" rx="8" fill="#fff"/><path d="M34 48 a16 16 0 0 0 32 0 M50 64 v10" stroke="#fff" stroke-width="4" fill="none"/>`),
  "icon-speaker": svgEl("Escuchar", `<path d="M30 42 h12 l14 -12 v40 l-14 -12 h-12z" fill="#fff"/><path d="M64 40 q8 10 0 20" stroke="#fff" stroke-width="4" fill="none"/>`),
  "cue-default": svgEl("sílaba", `<circle cx="50" cy="50" r="30" fill="#cfe0ff"/><text x="50" y="62" font-size="34" text-anchor="middle" fill="#4361ee">★</text>`),
};

const REGISTRY = {
  ...WORD_ART,
  ...ISLAND_ART,
  ...STICKER_ART,
  ...ICON_ART,
};

/**
 * Return SVG markup for an id, or a neutral fallback cue when unknown (so a
 * pre-reader never sees a blank). Pure.
 * @param {string} id
 * @returns {string} SVG markup
 */
export function svg(id) {
  return REGISTRY[id] || ICON_ART["cue-default"];
}

/** Whether an art id exists (not counting the fallback). */
export function has(id) {
  return Object.prototype.hasOwnProperty.call(REGISTRY, id);
}

/** All registered art ids (for tests / preloading). */
export function ids() {
  return Object.keys(REGISTRY);
}
