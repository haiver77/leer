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

  // ---- iteration-3 additions (2-syllable) ----
  "word-mama": svgEl(
    "mamá",
    `<circle cx="50" cy="40" r="16" fill="#ffd1b3"/>
     <path d="M30 40 q20 -26 40 0 q-4 -14 -20 -14 t-20 14" fill="#8d5524"/>
     <path d="M30 78 q20 -26 40 0 z" fill="#ff5d8f"/>`
  ),
  "word-masa": svgEl(
    "masa",
    `<ellipse cx="50" cy="56" rx="30" ry="16" fill="#f3d9a4"/>
     <ellipse cx="50" cy="52" rx="30" ry="14" fill="#f7e7c2"/>
     <circle cx="42" cy="50" r="2" fill="#e0b870"/><circle cx="58" cy="54" r="2" fill="#e0b870"/>`
  ),
  "word-puma": svgEl(
    "puma",
    `<ellipse cx="50" cy="56" rx="22" ry="16" fill="#d8a46b"/>
     <path d="M34 44 l-4 -10 8 6 M66 44 l4 -10 -8 6" fill="#d8a46b"/>
     <circle cx="43" cy="52" r="2.5" fill="#1d2b53"/><circle cx="57" cy="52" r="2.5" fill="#1d2b53"/>
     <path d="M46 60 q4 4 8 0" stroke="#1d2b53" stroke-width="2" fill="none"/>`
  ),
  "word-papa": svgEl(
    "papá",
    `<circle cx="50" cy="42" r="16" fill="#ffd1b3"/>
     <path d="M34 36 q16 -14 32 0 v-4 q-16 -12 -32 0z" fill="#3b2a1a"/>
     <path d="M30 80 q20 -24 40 0 z" fill="#4361ee"/>`
  ),
  "word-pala": svgEl(
    "pala",
    `<rect x="46" y="26" width="8" height="40" fill="#b07a3c"/>
     <path d="M36 62 h28 v10 a14 14 0 0 1 -28 0z" fill="#9aa0ad"/>`
  ),
  "word-pino": svgEl(
    "pino",
    `<path d="M50 20 l16 26 h-32z M50 36 l20 30 h-40z" fill="#2d6a4f"/>
     <rect x="46" y="64" width="8" height="14" fill="#8d5524"/>`
  ),
  "word-sapo": svgEl(
    "sapo",
    `<ellipse cx="50" cy="58" rx="26" ry="18" fill="#6aa84f"/>
     <circle cx="38" cy="42" r="8" fill="#6aa84f"/><circle cx="62" cy="42" r="8" fill="#6aa84f"/>
     <circle cx="38" cy="42" r="3" fill="#1d2b53"/><circle cx="62" cy="42" r="3" fill="#1d2b53"/>
     <path d="M40 60 q10 8 20 0" stroke="#2d6a4f" stroke-width="3" fill="none"/>`
  ),
  "word-luna": svgEl(
    "luna",
    `<path d="M62 24 a28 28 0 1 0 0 52 a22 22 0 0 1 0 -52z" fill="#ffe066"/>
     <circle cx="44" cy="40" r="3" fill="#e0b800"/><circle cx="40" cy="54" r="2" fill="#e0b800"/>`
  ),
  "word-taza": svgEl(
    "taza",
    `<path d="M30 42 h32 v16 a16 16 0 0 1 -32 0z" fill="#ef476f"/>
     <path d="M62 46 q12 2 0 14" stroke="#ef476f" stroke-width="4" fill="none"/>
     <path d="M40 34 q3 -6 0 -10 M50 34 q3 -6 0 -10" stroke="#bbb" stroke-width="2" fill="none"/>`
  ),
  "word-nido": svgEl(
    "nido",
    `<path d="M26 56 q24 16 48 0 q-4 10 -24 10 t-24 -10z" fill="#9c6b3c"/>
     <ellipse cx="42" cy="54" rx="6" ry="5" fill="#fff"/><ellipse cx="54" cy="56" rx="6" ry="5" fill="#fff"/>`
  ),
  "word-nube": svgEl(
    "nube",
    `<ellipse cx="42" cy="54" rx="16" ry="12" fill="#eaf2ff"/>
     <ellipse cx="60" cy="52" rx="14" ry="11" fill="#eaf2ff"/>
     <ellipse cx="52" cy="60" rx="22" ry="10" fill="#dfeaff"/>`
  ),
  "word-nina": svgEl(
    "niña",
    `<circle cx="50" cy="42" r="15" fill="#ffd1b3"/>
     <path d="M35 42 q15 -24 30 0 q2 10 -2 16 l-6 -14 -14 0 -6 14 q-4 -6 -2 -16z" fill="#6b4226"/>
     <path d="M34 80 q16 -22 32 0z" fill="#ffb3c1"/>`
  ),
  "word-foca": svgEl(
    "foca",
    `<ellipse cx="50" cy="58" rx="28" ry="16" fill="#8a94a6"/>
     <circle cx="70" cy="46" r="11" fill="#8a94a6"/>
     <circle cx="73" cy="44" r="2.5" fill="#1d2b53"/>
     <circle cx="79" cy="48" r="2" fill="#1d2b53"/>`
  ),
  "word-boca": svgEl(
    "boca",
    `<path d="M26 46 q24 -14 48 0 q-24 26 -48 0z" fill="#ef476f"/>
     <path d="M26 46 q24 10 48 0" stroke="#fff" stroke-width="4" fill="none"/>`
  ),
  "word-vaca": svgEl(
    "vaca",
    `<ellipse cx="50" cy="54" rx="24" ry="18" fill="#fff" stroke="#1d2b53" stroke-width="2"/>
     <ellipse cx="40" cy="48" rx="7" ry="5" fill="#1d2b53"/><ellipse cx="62" cy="58" rx="8" ry="6" fill="#1d2b53"/>
     <circle cx="43" cy="68" r="2.5" fill="#ffb3c1"/><circle cx="57" cy="68" r="2.5" fill="#ffb3c1"/>`
  ),
  "word-casa": svgEl(
    "casa",
    `<rect x="30" y="48" width="40" height="28" fill="#ffd166"/>
     <path d="M26 48 l24 -20 24 20z" fill="#ef476f"/>
     <rect x="44" y="58" width="12" height="18" fill="#8d5524"/>`
  ),
  "word-gato": svgEl(
    "gato",
    `<circle cx="50" cy="54" r="18" fill="#9aa0ad"/>
     <path d="M36 42 l-4 -12 10 8 M64 42 l4 -12 -10 8" fill="#9aa0ad"/>
     <circle cx="44" cy="52" r="2.5" fill="#1d2b53"/><circle cx="56" cy="52" r="2.5" fill="#1d2b53"/>
     <path d="M50 58 v4 M42 60 h8 M58 60 h-8" stroke="#1d2b53" stroke-width="1.5"/>`
  ),
  "word-jamon": svgEl(
    "jamón",
    `<path d="M34 40 q22 -14 32 4 q10 18 -8 30 q-20 10 -30 -8 q-6 -16 6 -26z" fill="#ef7a85"/>
     <rect x="30" y="34" width="10" height="8" rx="3" fill="#fff"/>`
  ),
  "word-rana": svgEl(
    "rana",
    `<ellipse cx="50" cy="58" rx="26" ry="16" fill="#52b788"/>
     <circle cx="40" cy="42" r="8" fill="#52b788"/><circle cx="60" cy="42" r="8" fill="#52b788"/>
     <circle cx="40" cy="42" r="3" fill="#1d2b53"/><circle cx="60" cy="42" r="3" fill="#1d2b53"/>
     <path d="M40 62 q10 6 20 0" stroke="#2d6a4f" stroke-width="3" fill="none"/>`
  ),

  // ---- iteration-3 additions (3-syllable) ----
  "word-maleta": svgEl(
    "maleta",
    `<rect x="26" y="40" width="48" height="34" rx="5" fill="#4361ee"/>
     <rect x="42" y="32" width="16" height="10" rx="3" fill="none" stroke="#4361ee" stroke-width="4"/>
     <line x1="26" y1="56" x2="74" y2="56" stroke="#fff" stroke-width="3"/>`
  ),
  "word-paloma": svgEl(
    "paloma",
    `<ellipse cx="46" cy="54" rx="22" ry="13" fill="#eaf2ff"/>
     <circle cx="68" cy="44" r="9" fill="#eaf2ff"/>
     <circle cx="71" cy="42" r="2" fill="#1d2b53"/>
     <path d="M76 44 l8 -2 -4 6z" fill="#ffd166"/>
     <path d="M30 52 q10 -14 24 -6 q-8 10 -24 6z" fill="#dfeaff"/>`
  ),
  "word-pelota": svgEl(
    "pelota",
    `<circle cx="50" cy="52" r="26" fill="#fff" stroke="#1d2b53" stroke-width="3"/>
     <path d="M50 52 l0 -26 M50 52 l24 10 M50 52 l-24 10" stroke="#1d2b53" stroke-width="3"/>
     <polygon points="50,44 58,50 55,60 45,60 42,50" fill="#1d2b53"/>`
  ),
  "word-pepino": svgEl(
    "pepino",
    `<path d="M32 70 q-6 -34 36 -40 q6 6 -2 12 q-30 6 -24 30 q-4 2 -10 -2z" fill="#52b788"/>
     <ellipse cx="46" cy="50" rx="18" ry="7" fill="#74c69d" transform="rotate(-40 46 50)"/>`
  ),
  "word-salada": svgEl(
    "salada",
    `<path d="M24 50 a26 18 0 0 0 52 0z" fill="#90be6d"/>
     <circle cx="40" cy="48" r="5" fill="#52b788"/><circle cx="56" cy="46" r="6" fill="#74c69d"/>
     <circle cx="50" cy="52" r="4" fill="#ef476f"/>`
  ),
  "word-tomate": svgEl(
    "tomate",
    `<circle cx="50" cy="56" r="22" fill="#ef233c"/>
     <path d="M50 34 l-6 -8 M50 34 l6 -8 M50 34 l0 -10" stroke="#52b788" stroke-width="3"/>
     <path d="M42 36 q8 6 16 0" stroke="#52b788" stroke-width="4" fill="none"/>`
  ),
  "word-semilla": svgEl(
    "semilla",
    `<path d="M50 72 v-20" stroke="#6aa84f" stroke-width="4"/>
     <path d="M50 54 q-16 -4 -16 -16 q16 0 16 16z" fill="#74c69d"/>
     <path d="M50 50 q14 -4 14 -14 q-14 0 -14 14z" fill="#52b788"/>
     <ellipse cx="50" cy="76" rx="12" ry="4" fill="#8d5524"/>`
  ),
  "word-dedito": svgEl(
    "dedito",
    `<rect x="42" y="26" width="16" height="42" rx="8" fill="#ffd1b3"/>
     <rect x="40" y="22" width="20" height="10" rx="5" fill="#fff"/>`
  ),
  "word-dinero": svgEl(
    "dinero",
    `<rect x="24" y="38" width="52" height="30" rx="4" fill="#2d6a4f"/>
     <circle cx="50" cy="53" r="10" fill="#95d5b2"/>
     <text x="50" y="58" font-size="12" text-anchor="middle" fill="#2d6a4f">$</text>`
  ),
  "word-banana": svgEl(
    "banana",
    `<path d="M28 44 q6 30 40 30 q10 0 8 -6 q-28 2 -36 -26 q-4 -2 -12 2z" fill="#ffd60a"/>
     <path d="M66 70 l6 4" stroke="#8d6e00" stroke-width="3"/>`
  ),
  "word-camisa": svgEl(
    "camisa",
    `<path d="M34 34 l16 -6 16 6 10 8 -8 10 -4 -4 v24 h-28 v-24 l-4 4 -8 -10z" fill="#4cc9f0"/>
     <path d="M50 28 l-6 8 6 6 6 -6z" fill="#fff"/>`
  ),
  "word-cabeza": svgEl(
    "cabeza",
    `<circle cx="50" cy="48" r="20" fill="#ffd1b3"/>
     <path d="M30 46 q20 -28 40 0 q-4 -16 -20 -16 t-20 16z" fill="#6b4226"/>
     <circle cx="43" cy="48" r="2.5" fill="#1d2b53"/><circle cx="57" cy="48" r="2.5" fill="#1d2b53"/>
     <path d="M44 58 q6 4 12 0" stroke="#1d2b53" stroke-width="2" fill="none"/>`
  ),
  "word-gallina": svgEl(
    "gallina",
    `<ellipse cx="50" cy="58" rx="22" ry="17" fill="#fff8e1"/>
     <circle cx="66" cy="44" r="10" fill="#fff8e1"/>
     <path d="M66 34 q4 -8 8 -4 q-2 6 -8 6z" fill="#ef476f"/>
     <path d="M74 46 l8 2 -8 4z" fill="#ffd166"/>
     <circle cx="68" cy="42" r="2" fill="#1d2b53"/>`
  ),
  "word-zapato": svgEl(
    "zapato",
    `<path d="M24 58 q0 -14 18 -14 q6 8 22 8 q14 0 14 10 v6 h-54z" fill="#4361ee"/>
     <path d="M24 64 h54" stroke="#2a3b9a" stroke-width="3"/>`
  ),

  // ---- iteration-4 additions (2-syllable) ----
  "word-mula": svgEl(
    "mula",
    `<ellipse cx="48" cy="58" rx="24" ry="15" fill="#b08968"/>
     <circle cx="70" cy="46" r="11" fill="#b08968"/>
     <path d="M64 38 l-2 -10 6 8 M76 38 l2 -10 -6 8" fill="#9c6b3c"/>
     <circle cx="72" cy="45" r="2" fill="#1d2b53"/>
     <path d="M30 70 v8 M40 72 v8" stroke="#6b4226" stroke-width="3"/>`
  ),
  "word-palo": svgEl(
    "palo",
    `<rect x="46" y="20" width="8" height="60" rx="4" fill="#9c6b3c"/>
     <path d="M46 28 l-8 -6 M54 34 l8 -6" stroke="#6b4226" stroke-width="3"/>`
  ),
  "word-pila": svgEl(
    "pila",
    `<rect x="38" y="26" width="24" height="48" rx="5" fill="#ffd166"/>
     <rect x="44" y="20" width="12" height="8" rx="2" fill="#1d2b53"/>
     <path d="M50 38 l-5 12 h10 l-5 12" stroke="#1d2b53" stroke-width="3" fill="none"/>`
  ),
  "word-sala": svgEl(
    "sala",
    `<rect x="24" y="48" width="52" height="22" rx="6" fill="#9b5de5"/>
     <rect x="24" y="40" width="12" height="18" rx="4" fill="#7b3fc5"/>
     <rect x="64" y="40" width="12" height="18" rx="4" fill="#7b3fc5"/>
     <rect x="28" y="70" width="6" height="8" fill="#5a2e94"/><rect x="66" y="70" width="6" height="8" fill="#5a2e94"/>`
  ),
  "word-seta": svgEl(
    "seta",
    `<path d="M26 50 a24 18 0 0 1 48 0 z" fill="#ef476f"/>
     <circle cx="40" cy="44" r="3" fill="#fff"/><circle cx="56" cy="46" r="3" fill="#fff"/>
     <rect x="44" y="50" width="12" height="24" rx="4" fill="#ffe8d6"/>`
  ),
  "word-tapa": svgEl(
    "tapa",
    `<ellipse cx="50" cy="52" rx="28" ry="12" fill="#9aa0ad"/>
     <ellipse cx="50" cy="48" rx="28" ry="12" fill="#c3c9d6"/>
     <circle cx="50" cy="40" r="5" fill="#6b7280"/>`
  ),
  "word-tomo": svgEl(
    "tomo",
    `<rect x="30" y="26" width="40" height="50" rx="4" fill="#ef476f"/>
     <rect x="30" y="26" width="10" height="50" fill="#c92a4e"/>
     <line x1="46" y1="36" x2="64" y2="36" stroke="#fff" stroke-width="3"/>
     <line x1="46" y1="46" x2="64" y2="46" stroke="#fff" stroke-width="3"/>`
  ),
  "word-dama": svgEl(
    "dama",
    `<circle cx="50" cy="40" r="15" fill="#ffd1b3"/>
     <path d="M34 40 q16 -26 32 0 q0 12 -4 18 l-4 -16 -16 0 -4 16 q-4 -6 -4 -18z" fill="#3b2a1a"/>
     <path d="M32 80 q18 -22 36 0z" fill="#9b5de5"/>`
  ),
  "word-duna": svgEl(
    "duna",
    `<path d="M14 70 q22 -18 44 -4 q14 -10 28 2 l0 8 h-72z" fill="#e9c46a"/>
     <path d="M14 70 q22 -10 44 -2" stroke="#d4a94a" stroke-width="3" fill="none"/>
     <circle cx="76" cy="30" r="8" fill="#ffd166"/>`
  ),
  "word-bote": svgEl(
    "bote",
    `<path d="M24 54 h52 l-8 16 h-36z" fill="#ef476f"/>
     <rect x="48" y="30" width="4" height="24" fill="#8d5524"/>
     <path d="M52 32 l16 8 -16 6z" fill="#fff"/>`
  ),
  "word-cafe": svgEl(
    "café",
    `<path d="M30 42 h32 v14 a16 16 0 0 1 -32 0z" fill="#6b4226"/>
     <path d="M62 46 q12 2 0 14" stroke="#6b4226" stroke-width="4" fill="none"/>
     <path d="M40 34 q3 -6 0 -10 M50 34 q3 -6 0 -10" stroke="#bbb" stroke-width="2" fill="none"/>`
  ),
  "word-cuna": svgEl(
    "cuna",
    `<path d="M26 44 a24 16 0 0 0 48 0 v18 h-48z" fill="#f4a261"/>
     <rect x="24" y="42" width="52" height="5" rx="2" fill="#e76f51"/>
     <ellipse cx="50" cy="44" rx="16" ry="6" fill="#ffe8d6"/>`
  ),
  "word-jugo": svgEl(
    "jugo",
    `<path d="M36 30 h28 l-4 46 h-20z" fill="#ff8c42"/>
     <rect x="36" y="30" width="28" height="8" fill="#ffb37a"/>
     <rect x="56" y="18" width="4" height="20" fill="#06d6a0"/>`
  ),
  "word-rosa": svgEl(
    "rosa",
    `<circle cx="50" cy="44" r="14" fill="#ff5d8f"/>
     <circle cx="50" cy="44" r="7" fill="#ff8fb0"/>
     <path d="M50 58 v18 M50 66 l-10 -4 M50 70 l10 -4" stroke="#2d6a4f" stroke-width="3" fill="none"/>`
  ),
  "word-pozo": svgEl(
    "pozo",
    `<rect x="32" y="50" width="36" height="26" rx="3" fill="#8a94a6"/>
     <path d="M30 50 h40 l-4 -8 h-32z" fill="#9c6b3c"/>
     <rect x="48" y="34" width="4" height="12" fill="#6b4226"/>
     <ellipse cx="50" cy="58" rx="12" ry="5" fill="#4cc9f0"/>`
  ),
  "word-pastel": svgEl(
    "pastel",
    `<path d="M28 50 h44 v22 h-44z" fill="#ffd6e7"/>
     <path d="M28 50 a22 10 0 0 1 44 0z" fill="#fff0f5"/>
     <rect x="28" y="60" width="44" height="4" fill="#ff8fb0"/>
     <path d="M50 50 v-10 M50 40 l-5 -5 M50 40 l5 -5" stroke="#ef476f" stroke-width="3" fill="none"/>
     <circle cx="50" cy="33" r="3" fill="#ffd166"/>`
  ),
  "word-limon": svgEl(
    "limón",
    `<ellipse cx="50" cy="52" rx="24" ry="18" fill="#ffd60a"/>
     <path d="M26 52 h48" stroke="#e8c200" stroke-width="2"/>
     <path d="M50 34 l0 -8 6 4" stroke="#52b788" stroke-width="3" fill="none"/>`
  ),
  "word-gallo": svgEl(
    "gallo",
    `<ellipse cx="48" cy="58" rx="20" ry="16" fill="#ef476f"/>
     <circle cx="64" cy="44" r="10" fill="#ef476f"/>
     <path d="M62 34 q4 -10 8 -4 q4 -8 2 2 q6 -4 0 6z" fill="#e5383b"/>
     <path d="M72 46 l8 2 -8 4z" fill="#ffd166"/>
     <circle cx="66" cy="42" r="2" fill="#1d2b53"/>
     <path d="M30 58 q-10 8 -2 16" stroke="#1d2b53" stroke-width="3" fill="none"/>`
  ),
  "word-pollo": svgEl(
    "pollo",
    `<ellipse cx="50" cy="56" rx="20" ry="17" fill="#ffd166"/>
     <circle cx="50" cy="38" r="12" fill="#ffd166"/>
     <path d="M50 34 l8 2 -8 4z" fill="#ff8c42"/>
     <circle cx="46" cy="36" r="2" fill="#1d2b53"/><circle cx="54" cy="36" r="2" fill="#1d2b53"/>
     <path d="M44 72 v4 M56 72 v4" stroke="#ff8c42" stroke-width="3"/>`
  ),
  "word-perro": svgEl(
    "perro",
    `<ellipse cx="50" cy="56" rx="20" ry="16" fill="#b08968"/>
     <circle cx="50" cy="44" r="14" fill="#c69c6d"/>
     <path d="M36 34 q-8 4 -4 16 l8 -6z M64 34 q8 4 4 16 l-8 -6z" fill="#8d5524"/>
     <circle cx="45" cy="44" r="2.5" fill="#1d2b53"/><circle cx="55" cy="44" r="2.5" fill="#1d2b53"/>
     <ellipse cx="50" cy="50" rx="4" ry="3" fill="#1d2b53"/>`
  ),

  // ---- iteration-4 additions (3-syllable) ----
  "word-pelito": svgEl(
    "pelito",
    `<circle cx="50" cy="56" r="18" fill="#ffd1b3"/>
     <path d="M30 52 q20 -32 40 0 q-6 -16 -20 -16 t-20 16z" fill="#c97b3c"/>
     <path d="M32 50 q6 -10 0 -18 M68 50 q-6 -10 0 -18" stroke="#c97b3c" stroke-width="4" fill="none"/>`
  ),
  "word-sopita": svgEl(
    "sopita",
    `<path d="M26 50 a24 18 0 0 0 48 0 z" fill="#ff8c42"/>
     <ellipse cx="50" cy="50" rx="27" ry="7" fill="#ffb37a"/>
     <circle cx="44" cy="52" r="3" fill="#ffd166"/><circle cx="58" cy="54" r="3" fill="#90be6d"/>
     <path d="M46 30 q4 -8 0 -12 M56 30 q4 -8 0 -12" stroke="#fff" stroke-width="3" fill="none"/>`
  ),
  "word-domino": svgEl(
    "dominó",
    `<rect x="36" y="24" width="28" height="52" rx="5" fill="#fff" stroke="#1d2b53" stroke-width="3"/>
     <line x1="36" y1="50" x2="64" y2="50" stroke="#1d2b53" stroke-width="3"/>
     <circle cx="50" cy="37" r="4" fill="#1d2b53"/>
     <circle cx="44" cy="62" r="3.5" fill="#1d2b53"/><circle cx="56" cy="62" r="3.5" fill="#1d2b53"/>`
  ),
  "word-salida": svgEl(
    "salida",
    `<rect x="34" y="28" width="32" height="48" rx="3" fill="#52b788"/>
     <rect x="38" y="32" width="24" height="40" rx="2" fill="#95d5b2"/>
     <circle cx="58" cy="52" r="3" fill="#2d6a4f"/>
     <path d="M20 52 h14 l-5 -5 M34 52 l-5 5" stroke="#fff" stroke-width="3" fill="none"/>`
  ),
  "word-bonita": svgEl(
    "bonita",
    `<path d="M50 72 l-14 -14 a9 9 0 0 1 14 -11 a9 9 0 0 1 14 11z" fill="#ff5d8f"/>
     <circle cx="50" cy="26" r="4" fill="#ffd166"/>`
  ),
  "word-canela": svgEl(
    "canela",
    `<rect x="40" y="24" width="8" height="52" rx="4" fill="#8d5524" transform="rotate(-8 44 50)"/>
     <rect x="52" y="24" width="8" height="52" rx="4" fill="#a0632e" transform="rotate(8 56 50)"/>`
  ),
  "word-conejo": svgEl(
    "conejo",
    `<ellipse cx="50" cy="60" rx="18" ry="15" fill="#eaeaea"/>
     <circle cx="50" cy="46" r="12" fill="#eaeaea"/>
     <ellipse cx="44" cy="28" rx="4" ry="12" fill="#eaeaea"/><ellipse cx="56" cy="28" rx="4" ry="12" fill="#eaeaea"/>
     <ellipse cx="44" cy="28" rx="2" ry="8" fill="#ffb3c1"/><ellipse cx="56" cy="28" rx="2" ry="8" fill="#ffb3c1"/>
     <circle cx="46" cy="46" r="2" fill="#1d2b53"/><circle cx="54" cy="46" r="2" fill="#1d2b53"/>`
  ),
  "word-fogata": svgEl(
    "fogata",
    `<path d="M50 28 q14 16 6 30 q-2 8 -12 8 q-12 0 -10 -12 q2 -6 8 -8 q-4 -10 8 -18z" fill="#ff8c42"/>
     <path d="M50 44 q6 8 2 16 q-6 2 -8 -4 q0 -6 6 -12z" fill="#ffd166"/>
     <path d="M30 72 l40 0 M36 72 l-6 6 M64 72 l6 6" stroke="#8d5524" stroke-width="4"/>`
  ),
  "word-gusano": svgEl(
    "gusano",
    `<circle cx="32" cy="58" r="9" fill="#90be6d"/>
     <circle cx="44" cy="56" r="9" fill="#74c69d"/>
     <circle cx="56" cy="56" r="9" fill="#90be6d"/>
     <circle cx="68" cy="54" r="10" fill="#74c69d"/>
     <circle cx="71" cy="51" r="2" fill="#1d2b53"/>
     <path d="M68 44 v-6 M74 44 v-6" stroke="#2d6a4f" stroke-width="2"/>`
  ),
  "word-jirafa": svgEl(
    "jirafa",
    `<rect x="44" y="30" width="10" height="36" fill="#ffd166"/>
     <ellipse cx="49" cy="70" rx="18" ry="10" fill="#ffd166"/>
     <circle cx="49" cy="28" r="9" fill="#ffd166"/>
     <circle cx="60" cy="46" r="3" fill="#c97b3c"/><circle cx="46" cy="54" r="3" fill="#c97b3c"/>
     <circle cx="47" cy="27" r="1.6" fill="#1d2b53"/>`
  ),
  "word-cereza": svgEl(
    "cereza",
    `<circle cx="40" cy="62" r="10" fill="#e5383b"/>
     <circle cx="60" cy="64" r="10" fill="#c92a4e"/>
     <path d="M40 52 q6 -22 14 -28 M60 54 q-2 -20 -6 -30" stroke="#52b788" stroke-width="3" fill="none"/>
     <path d="M50 24 q6 -4 10 0" stroke="#52b788" stroke-width="3" fill="none"/>`
  ),
  "word-limones": svgEl(
    "limones",
    `<ellipse cx="38" cy="56" rx="18" ry="14" fill="#ffd60a"/>
     <ellipse cx="62" cy="50" rx="16" ry="13" fill="#ffe14d"/>
     <path d="M38 40 l0 -6 5 3 M62 36 l0 -6 5 3" stroke="#52b788" stroke-width="3" fill="none"/>`
  ),

  // ---- iteration-6 additions (2-syllable) ----
  "word-gota": svgEl(
    "gota",
    `<path d="M50 26 q16 22 16 34 a16 16 0 0 1 -32 0 q0 -12 16 -34z" fill="#4cc9f0"/>
     <ellipse cx="44" cy="54" rx="4" ry="6" fill="#bdeafd"/>`
  ),
  "word-rama": svgEl(
    "rama",
    `<path d="M30 74 q10 -30 40 -40" stroke="#8d5524" stroke-width="5" fill="none"/>
     <path d="M48 52 q-10 -6 -16 -2 M58 44 q-2 -12 -8 -16 M60 50 q10 -4 16 0" stroke="#6b4226" stroke-width="3" fill="none"/>
     <circle cx="34" cy="48" r="4" fill="#52b788"/><circle cx="50" cy="28" r="4" fill="#52b788"/><circle cx="76" cy="50" r="4" fill="#52b788"/>`
  ),
  "word-chapa": svgEl(
    "chapa",
    `<circle cx="50" cy="50" r="24" fill="#ef476f"/>
     <circle cx="50" cy="50" r="24" fill="none" stroke="#c92a4e" stroke-width="3" stroke-dasharray="4 4"/>
     <circle cx="50" cy="50" r="6" fill="#fff"/>`
  ),

  // ---- iteration-7 additions (2-syllable) ----
  "word-nene": svgEl(
    "nene",
    `<circle cx="50" cy="46" r="16" fill="#ffd1b3"/>
     <path d="M40 34 q10 -8 20 0 q-2 -8 -10 -8 t-10 8z" fill="#8d5524"/>
     <circle cx="44" cy="46" r="2.5" fill="#1d2b53"/><circle cx="56" cy="46" r="2.5" fill="#1d2b53"/>
     <path d="M44 54 q6 4 12 0" stroke="#1d2b53" stroke-width="2" fill="none"/>
     <circle cx="42" cy="52" r="2" fill="#ffb3c1"/><circle cx="58" cy="52" r="2" fill="#ffb3c1"/>
     <path d="M34 80 q16 -16 32 0z" fill="#4cc9f0"/>`
  ),
  "word-nudo": svgEl(
    "nudo",
    `<path d="M32 42 q18 -6 22 10 q4 14 -14 14 q-14 0 -8 -14 q6 -12 28 -4 q14 6 8 20" fill="none" stroke="#b07a3c" stroke-width="7" stroke-linecap="round"/>`
  ),
  "word-coche": svgEl(
    "coche",
    `<path d="M22 58 h56 l-6 -14 q-2 -4 -6 -4 h-30 q-4 0 -6 4z" fill="#ef476f"/>
     <rect x="20" y="56" width="60" height="12" rx="4" fill="#e5383b"/>
     <path d="M34 50 h14 v-8 h-10z M52 42 h12 l6 8 h-18z" fill="#cfe0ff"/>
     <circle cx="34" cy="70" r="7" fill="#1d2b53"/><circle cx="66" cy="70" r="7" fill="#1d2b53"/>`
  ),

  // ---- iteration-6 additions (3-syllable) ----
  "word-bebida": svgEl(
    "bebida",
    `<path d="M36 34 h28 l-4 42 h-20z" fill="#ff5d8f"/>
     <rect x="36" y="34" width="28" height="7" fill="#ff8fb0"/>
     <rect x="56" y="20" width="4" height="22" fill="#06d6a0"/>
     <circle cx="58" cy="20" r="4" fill="#ffd166"/>`
  ),
  "word-pescado": svgEl(
    "pescado",
    `<ellipse cx="46" cy="52" rx="24" ry="14" fill="#4cc9f0"/>
     <path d="M70 52 l16 -10 v20z" fill="#4cc9f0"/>
     <circle cx="34" cy="48" r="3" fill="#1d2b53"/>
     <path d="M40 52 q8 -6 16 0" stroke="#2a9fd0" stroke-width="2" fill="none"/>`
  ),
  "word-botella": svgEl(
    "botella",
    `<path d="M44 24 h12 v10 q8 6 8 16 v26 h-28 v-26 q0 -10 8 -16z" fill="#52b788"/>
     <rect x="44" y="20" width="12" height="6" rx="2" fill="#2d6a4f"/>
     <rect x="38" y="54" width="24" height="12" fill="#fff" opacity="0.6"/>`
  ),
  "word-caballo": svgEl(
    "caballo",
    `<path d="M30 74 v-18 q0 -20 20 -24 q14 -2 18 8 l-4 10 q-10 -8 -18 -2 q-8 6 -8 22z" fill="#b08968"/>
     <path d="M62 40 l6 -10 2 10z" fill="#8d5524"/>
     <circle cx="60" cy="42" r="2" fill="#1d2b53"/>
     <path d="M34 74 v6 M48 72 v8" stroke="#6b4226" stroke-width="3"/>`
  ),
  "word-ballena": svgEl(
    "ballena",
    `<path d="M24 56 q22 -20 48 -6 q6 4 8 -2 q2 10 -8 12 q-24 10 -48 -4z" fill="#4361ee"/>
     <circle cx="34" cy="52" r="2.5" fill="#fff"/>
     <path d="M70 44 q4 -10 8 -4 q-2 6 -8 6z" fill="#8fb3ff"/>`
  ),
  "word-cuchara": svgEl(
    "cuchara",
    `<ellipse cx="50" cy="34" rx="12" ry="16" fill="#c3c9d6"/>
     <ellipse cx="50" cy="34" rx="8" ry="11" fill="#9aa0ad"/>
     <rect x="47" y="46" width="6" height="32" rx="3" fill="#c3c9d6"/>`
  ),
  "word-muneca": svgEl(
    "muñeca",
    `<circle cx="50" cy="40" r="16" fill="#ffd1b3"/>
     <path d="M34 38 q16 -22 32 0 q2 -14 -16 -14 t-16 14z" fill="#ffb703"/>
     <circle cx="44" cy="40" r="2.5" fill="#1d2b53"/><circle cx="56" cy="40" r="2.5" fill="#1d2b53"/>
     <path d="M38 76 q12 -18 24 0z" fill="#ff5d8f"/>
     <circle cx="44" cy="46" r="2" fill="#ffb3c1"/><circle cx="56" cy="46" r="2" fill="#ffb3c1"/>`
  ),
  "word-tortuga": svgEl(
    "tortuga",
    `<ellipse cx="50" cy="56" rx="24" ry="17" fill="#43aa8b"/>
     <path d="M50 42 v28 M30 56 h40 M36 46 l28 20 M64 46 l-28 20" stroke="#2d6a4f" stroke-width="2"/>
     <circle cx="76" cy="52" r="7" fill="#74c69d"/>
     <circle cx="78" cy="50" r="1.6" fill="#1d2b53"/>
     <path d="M34 72 l-4 6 M66 72 l4 6" stroke="#74c69d" stroke-width="4"/>`
  ),
  "word-guitarra": svgEl(
    "guitarra",
    `<circle cx="46" cy="60" r="18" fill="#c97b3c"/>
     <circle cx="46" cy="60" r="6" fill="#6b4226"/>
     <rect x="58" y="24" width="7" height="34" rx="2" fill="#8d5524" transform="rotate(30 61 40)"/>
     <path d="M40 46 l24 -14 M44 52 l24 -14" stroke="#e0b870" stroke-width="1.5"/>`
  ),
  "word-chaqueta": svgEl(
    "chaqueta",
    `<path d="M34 34 l16 -6 16 6 8 10 v30 h-16 v-24 h-16 v24 h-16 v-30z" fill="#9b5de5"/>
     <path d="M50 28 v40" stroke="#6a3fb0" stroke-width="2"/>
     <circle cx="48" cy="48" r="1.6" fill="#ffd166"/><circle cx="48" cy="56" r="1.6" fill="#ffd166"/>`
  ),
  "word-estrella": svgEl("estrella", starPath(50, 50, 28, "#ffd166")),

  // ---- iteration-6 additions (4-syllable) ----
  "word-limonada": svgEl(
    "limonada",
    `<path d="M34 36 h32 l-5 40 h-22z" fill="#fff6c2"/>
     <path d="M34 36 h32 l-1 8 h-30z" fill="#ffe14d"/>
     <circle cx="46" cy="56" r="5" fill="#ffd60a"/>
     <rect x="58" y="22" width="4" height="22" fill="#52b788"/>`
  ),
  "word-patineta": svgEl(
    "patineta",
    `<rect x="24" y="48" width="52" height="8" rx="4" fill="#ef476f"/>
     <path d="M24 56 q-6 6 0 10 M76 56 q6 6 0 10" stroke="#9aa0ad" stroke-width="3" fill="none"/>
     <circle cx="34" cy="68" r="5" fill="#1d2b53"/><circle cx="66" cy="68" r="5" fill="#1d2b53"/>`
  ),
  "word-abanico": svgEl(
    "abanico",
    `<path d="M50 72 l-26 -34 a32 32 0 0 1 52 0z" fill="#ff8fb0"/>
     <path d="M50 72 l0 -42 M50 72 l-13 -20 M50 72 l13 -20" stroke="#ef476f" stroke-width="2"/>
     <circle cx="50" cy="72" r="4" fill="#8d5524"/>`
  ),
  "word-caracola": svgEl(
    "caracola",
    `<path d="M62 40 a22 22 0 1 1 -22 30 a14 14 0 1 0 14 -20 a8 8 0 1 1 -8 10" fill="none" stroke="#ff8c42" stroke-width="6"/>
     <circle cx="62" cy="40" r="4" fill="#ffd166"/>`
  ),
  "word-mariposa": svgEl(
    "mariposa",
    `<path d="M50 50 q-24 -24 -24 -2 q0 18 24 8z" fill="#ff5d8f"/>
     <path d="M50 50 q24 -24 24 -2 q0 18 -24 8z" fill="#ffb703"/>
     <path d="M50 50 q-18 10 -14 24 q10 2 14 -14z" fill="#f15bb5"/>
     <path d="M50 50 q18 10 14 24 q-10 2 -14 -14z" fill="#ffd166"/>
     <rect x="48" y="34" width="4" height="34" rx="2" fill="#3b2a1a"/>`
  ),
  "word-mariquita": svgEl(
    "mariquita",
    `<circle cx="50" cy="54" r="22" fill="#ef233c"/>
     <path d="M50 32 v44" stroke="#1d2b53" stroke-width="2"/>
     <circle cx="40" cy="48" r="3" fill="#1d2b53"/><circle cx="60" cy="48" r="3" fill="#1d2b53"/>
     <circle cx="42" cy="62" r="3" fill="#1d2b53"/><circle cx="58" cy="62" r="3" fill="#1d2b53"/>
     <path d="M38 34 a14 14 0 0 1 24 0z" fill="#1d2b53"/>`
  ),
  "word-panadera": svgEl(
    "panadera",
    `<circle cx="50" cy="46" r="15" fill="#ffd1b3"/>
     <path d="M32 42 q0 -16 18 -16 t18 16 q0 -4 -4 -6 h-28 q-4 2 -4 6z" fill="#fff"/>
     <path d="M30 42 h40 v4 h-40z" fill="#eee"/>
     <circle cx="44" cy="46" r="2.5" fill="#1d2b53"/><circle cx="56" cy="46" r="2.5" fill="#1d2b53"/>
     <path d="M34 78 q16 -18 32 0z" fill="#4cc9f0"/>`
  ),
  "word-pelicano": svgEl(
    "pelícano",
    `<circle cx="42" cy="40" r="11" fill="#eaf2ff"/>
     <ellipse cx="54" cy="62" rx="20" ry="13" fill="#eaf2ff"/>
     <path d="M44 44 l18 6 -4 12 q-10 2 -14 -6z" fill="#ffb703"/>
     <circle cx="40" cy="38" r="2" fill="#1d2b53"/>`
  ),
  "word-telarana": svgEl(
    "telaraña",
    `<g stroke="#8a94a6" stroke-width="2" fill="none">
       <path d="M50 20 v60 M20 50 h60 M28 28 l44 44 M72 28 l-44 44"/>
       <path d="M50 32 l12 12 -12 12 -12 -12z"/>
       <path d="M50 24 l18 18 -18 18 -18 -18z"/>
     </g>`
  ),
  "word-calabaza": svgEl(
    "calabaza",
    `<ellipse cx="50" cy="56" rx="26" ry="20" fill="#ff8c42"/>
     <path d="M38 40 q12 36 0 36 M50 38 v38 M62 40 q-12 36 0 36" stroke="#e0501f" stroke-width="2" fill="none"/>
     <rect x="47" y="30" width="6" height="10" fill="#52b788"/>`
  ),
  "word-payasito": svgEl(
    "payasito",
    `<circle cx="50" cy="52" r="20" fill="#fff"/>
     <circle cx="50" cy="56" r="5" fill="#ef233c"/>
     <circle cx="42" cy="48" r="3" fill="#1d2b53"/><circle cx="58" cy="48" r="3" fill="#1d2b53"/>
     <path d="M40 62 q10 10 20 0" stroke="#ef233c" stroke-width="3" fill="none"/>
     <path d="M30 40 l12 6 -12 6z M70 40 l-12 6 12 6z" fill="#4cc9f0"/>`
  ),
  "word-elefante": svgEl(
    "elefante",
    `<ellipse cx="46" cy="54" rx="24" ry="20" fill="#9aa0ad"/>
     <path d="M38 60 q-4 18 -2 22 q4 2 6 -2 q-2 -12 2 -20z" fill="#9aa0ad"/>
     <path d="M26 50 q-10 4 -14 -4" stroke="#9aa0ad" stroke-width="7" fill="none"/>
     <circle cx="34" cy="48" r="2.5" fill="#1d2b53"/>
     <path d="M58 40 q16 -8 20 0 q-10 4 -20 2z" fill="#b6bccb"/>`
  ),
  "word-escalera": svgEl(
    "escalera",
    `<rect x="34" y="20" width="6" height="60" rx="2" fill="#c97b3c"/>
     <rect x="60" y="20" width="6" height="60" rx="2" fill="#c97b3c"/>
     <rect x="34" y="32" width="32" height="5" fill="#8d5524"/>
     <rect x="34" y="46" width="32" height="5" fill="#8d5524"/>
     <rect x="34" y="60" width="32" height="5" fill="#8d5524"/>`
  ),
  "word-campanita": svgEl(
    "campanita",
    `<path d="M50 24 q18 2 18 26 q0 10 6 16 h-48 q6 -6 6 -16 q0 -24 18 -26z" fill="#ffd166"/>
     <rect x="46" y="20" width="8" height="6" rx="3" fill="#e8a900"/>
     <circle cx="50" cy="72" r="5" fill="#e8a900"/>`
  ),
  "word-bicicleta": svgEl(
    "bicicleta",
    `<circle cx="32" cy="60" r="14" fill="none" stroke="#1d2b53" stroke-width="4"/>
     <circle cx="68" cy="60" r="14" fill="none" stroke="#1d2b53" stroke-width="4"/>
     <path d="M32 60 l14 -20 h14 M46 40 l10 20 M60 40 h8" stroke="#ef476f" stroke-width="3" fill="none"/>`
  ),
  "word-cocodrilo": svgEl(
    "cocodrilo",
    `<path d="M20 58 q28 -10 56 -2 q8 2 4 10 q-30 8 -60 0z" fill="#52b788"/>
     <path d="M24 56 l6 -4 6 4 6 -4 6 4 6 -4 6 4" stroke="#2d6a4f" stroke-width="2" fill="none"/>
     <circle cx="66" cy="52" r="3" fill="#1d2b53"/>`
  ),
  "word-maravilla": svgEl(
    "maravilla",
    `${starPath(50, 44, 20, "#ffd166")}
     <circle cx="28" cy="30" r="4" fill="#4cc9f0"/><circle cx="74" cy="34" r="4" fill="#ff5d8f"/>
     <circle cx="70" cy="68" r="3" fill="#06d6a0"/><circle cx="30" cy="66" r="3" fill="#9b5de5"/>`
  ),
  "word-chocolate": svgEl(
    "chocolate",
    `<rect x="30" y="30" width="40" height="40" rx="4" fill="#6b4226"/>
     <path d="M50 30 v40 M30 50 h40" stroke="#3b2414" stroke-width="3"/>
     <path d="M40 40 h4 M56 40 h4 M40 60 h4 M56 60 h4" stroke="#8d5524" stroke-width="3"/>`
  ),
  "word-mantequilla": svgEl(
    "mantequilla",
    `<path d="M28 54 l12 -10 h32 v22 h-44z" fill="#ffd166"/>
     <path d="M28 54 h44 v12 h-44z" fill="#ffe08a"/>
     <path d="M40 44 h32 l-4 -6 h-24z" fill="#fff3c4"/>
     <rect x="34" y="58" width="16" height="4" fill="#e8a900"/>`
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
  // iteration-5 word islands (one per word band, colourful per-family fills)
  "island-words-2-1": islandArt("palabras fáciles", "#ff5d8f"),
  "island-words-2-2": islandArt("más palabras", "#4cc9f0"),
  "island-words-2-3": islandArt("palabras nuevas", "#06d6a0"),
  "island-words-2-esp": islandArt("sonidos especiales", "#ffb703"),
  "island-words-3": islandArt("palabras largas", "#ee6c4d"),
  "island-words-3-esp": islandArt("palabras largas especiales", "#9b5de5"),
  // iteration-6: split 3-syllable band + new 4-syllable islands (AC-J3)
  "island-words-3-1": islandArt("palabras largas fáciles", "#ee6c4d"),
  "island-words-3-2": islandArt("palabras largas nuevas", "#f3722c"),
  "island-words-4-abi": islandArt("palabras gigantes", "#277da1"),
  "island-words-4-esp": islandArt("campeones de 4 sílabas", "#3a0ca3"),
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
  "sticker-palabras-3": stickerArt("Trofeo", `<path d="M38 36 h24 v8 a12 12 0 0 1 -24 0z" fill="#ffd166"/><path d="M38 40 h-8 a6 6 0 0 0 8 8 M62 40 h8 a6 6 0 0 1 -8 8" stroke="#ffd166" stroke-width="3" fill="none"/><rect x="46" y="54" width="8" height="10" fill="#ffd166"/><rect x="40" y="64" width="20" height="6" rx="2" fill="#e8a900"/>`, "#ee6c4d"),
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

// ---- Jardín de Lalo elements (iteration 9, D4 / AC-M4) ----------------------
// Small decorative inline-SVG scenes that fill the child's garden as they earn
// stars/stickers/levels. Share the 0 0 100 100 viewBox so they tile cleanly.

const GARDEN_ART = {
  "garden-sprout": svgEl("Brote", `<path d="M50 78 v-20" stroke="#2d6a4f" stroke-width="4"/><path d="M50 60 q-14 -4 -16 -18 q14 2 16 18 M50 64 q14 -4 16 -18 q-14 2 -16 18" fill="#52b788"/>`),
  "garden-flower-red": svgEl("Flor roja", `<path d="M50 80 v-24" stroke="#2d6a4f" stroke-width="4"/><g fill="#ef476f"><circle cx="50" cy="40" r="8"/><circle cx="40" cy="48" r="8"/><circle cx="60" cy="48" r="8"/><circle cx="44" cy="34" r="8"/><circle cx="56" cy="34" r="8"/></g><circle cx="50" cy="42" r="6" fill="#ffd166"/>`),
  "garden-flower-blue": svgEl("Flor azul", `<path d="M50 80 v-24" stroke="#2d6a4f" stroke-width="4"/><g fill="#4cc9f0"><circle cx="50" cy="40" r="8"/><circle cx="40" cy="48" r="8"/><circle cx="60" cy="48" r="8"/><circle cx="44" cy="34" r="8"/><circle cx="56" cy="34" r="8"/></g><circle cx="50" cy="42" r="6" fill="#ffd166"/>`),
  "garden-tree": svgEl("Árbol", `<rect x="46" y="54" width="8" height="26" fill="#8d5524"/><circle cx="50" cy="42" r="20" fill="#52b788"/><circle cx="36" cy="48" r="12" fill="#52b788"/><circle cx="64" cy="48" r="12" fill="#52b788"/>`),
  "garden-bush": svgEl("Arbusto", `<circle cx="40" cy="60" r="14" fill="#40916c"/><circle cx="56" cy="58" r="16" fill="#52b788"/><circle cx="62" cy="64" r="10" fill="#40916c"/>`),
  "garden-star": svgEl("Estrella", starPath(50, 50, 22, "#ffd166")),
  "garden-butterfly": svgEl("Mariposa", `<line x1="50" y1="40" x2="50" y2="62" stroke="#1d2b53" stroke-width="3"/><g fill="#b892ff"><ellipse cx="40" cy="46" rx="10" ry="8"/><ellipse cx="60" cy="46" rx="10" ry="8"/><ellipse cx="42" cy="58" rx="8" ry="7"/><ellipse cx="58" cy="58" rx="8" ry="7"/></g>`),
  "garden-mushroom": svgEl("Seta", `<rect x="46" y="54" width="8" height="22" rx="3" fill="#ffe8d6"/><path d="M30 54 a20 14 0 0 1 40 0 z" fill="#ef476f"/><circle cx="42" cy="48" r="3" fill="#fff"/><circle cx="56" cy="50" r="2.5" fill="#fff"/>`),
  "garden-pond": svgEl("Estanque", `<ellipse cx="50" cy="60" rx="30" ry="16" fill="#4cc9f0"/><ellipse cx="50" cy="56" rx="24" ry="10" fill="#8ad7f5"/><path d="M38 58 q6 -4 12 0 M54 60 q6 -4 12 0" stroke="#fff" stroke-width="2" fill="none"/>`),
  "garden-rainbow": svgEl("Arcoíris", `<path d="M20 70 a30 30 0 0 1 60 0" fill="none" stroke="#ef476f" stroke-width="5"/><path d="M28 70 a22 22 0 0 1 44 0" fill="none" stroke="#ffd166" stroke-width="5"/><path d="M36 70 a14 14 0 0 1 28 0" fill="none" stroke="#4cc9f0" stroke-width="5"/>`),
  "garden-sun": svgEl("Sol", `<circle cx="50" cy="50" r="16" fill="#ffd166"/><g stroke="#ffba08" stroke-width="4"><line x1="50" y1="18" x2="50" y2="28"/><line x1="50" y1="72" x2="50" y2="82"/><line x1="18" y1="50" x2="28" y2="50"/><line x1="72" y1="50" x2="82" y2="50"/><line x1="28" y1="28" x2="34" y2="34"/><line x1="66" y1="66" x2="72" y2="72"/><line x1="72" y1="28" x2="66" y2="34"/><line x1="34" y1="66" x2="28" y2="72"/></g>`),
  "garden-trophy": svgEl("Trofeo dorado", `<path d="M38 32 h24 v10 a12 12 0 0 1 -24 0z" fill="#ffd166"/><path d="M38 36 h-8 a6 6 0 0 0 8 8 M62 36 h8 a6 6 0 0 1 -8 8" stroke="#ffd166" stroke-width="3" fill="none"/><rect x="46" y="52" width="8" height="12" fill="#ffd166"/><rect x="38" y="64" width="24" height="7" rx="2" fill="#e8a900"/>`),
};

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
  ...GARDEN_ART,
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
