// art-words-extra.js — inline-SVG pictures for the iteration-10 vocabulary
// expansion (40 two-syllable + 50 three-syllable words). Same conventions as
// art.js (shared 0 0 100 100 viewBox, accessible <title>, simple rounded
// shapes). Kept in its own module so art.js stays readable; art.js spreads
// EXTRA_WORD_ART into its registry. Pure (string in → string out).

const W = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"';

function svgEl(title, inner) {
  return `<svg ${W} role="img" aria-label="${title}"><title>${title}</title>${inner}</svg>`;
}

/** Build a { "word-<id>": svg } entry. */
function w(id, title, inner) {
  return [`word-${id}`, svgEl(title, inner)];
}

const ENTRIES = [
  // ============================ 2 syllables ============================
  w("oso", "oso",
    `<circle cx="32" cy="32" r="10" fill="#8d5524"/><circle cx="68" cy="32" r="10" fill="#8d5524"/>
     <circle cx="50" cy="52" r="26" fill="#a9713a"/><ellipse cx="50" cy="62" rx="12" ry="9" fill="#e0b98a"/>
     <circle cx="41" cy="46" r="3" fill="#1d2b53"/><circle cx="59" cy="46" r="3" fill="#1d2b53"/>
     <ellipse cx="50" cy="58" rx="4" ry="3" fill="#1d2b53"/>`),
  w("moto", "moto",
    `<circle cx="28" cy="68" r="12" fill="none" stroke="#1d2b53" stroke-width="5"/>
     <circle cx="74" cy="68" r="12" fill="none" stroke="#1d2b53" stroke-width="5"/>
     <path d="M28 68 l16 -24 h18 l12 24" stroke="#ef476f" stroke-width="6" fill="none" stroke-linejoin="round"/>
     <rect x="40" y="38" width="20" height="8" rx="4" fill="#1d2b53"/>
     <path d="M62 44 l8 -10 h8" stroke="#1d2b53" stroke-width="4" fill="none"/>`),
  w("mano", "mano",
    `<rect x="32" y="48" width="36" height="32" rx="12" fill="#ffcf9f"/>
     <rect x="32" y="22" width="7" height="34" rx="3.5" fill="#ffcf9f"/><rect x="42" y="16" width="7" height="40" rx="3.5" fill="#ffcf9f"/>
     <rect x="52" y="18" width="7" height="38" rx="3.5" fill="#ffcf9f"/><rect x="62" y="26" width="7" height="30" rx="3.5" fill="#ffcf9f"/>
     <path d="M34 62 q-12 -6 -14 -18 q8 0 16 10z" fill="#ffcf9f"/>`),
  w("mono", "mono",
    `<circle cx="26" cy="50" r="9" fill="#8d5524"/><circle cx="74" cy="50" r="9" fill="#8d5524"/>
     <circle cx="50" cy="48" r="26" fill="#8d5524"/><ellipse cx="50" cy="56" rx="17" ry="14" fill="#e0ac69"/>
     <circle cx="42" cy="46" r="3" fill="#1d2b53"/><circle cx="58" cy="46" r="3" fill="#1d2b53"/>
     <path d="M43 62 q7 6 14 0" stroke="#1d2b53" stroke-width="2.5" fill="none"/>`),
  w("pina", "piña",
    `<ellipse cx="50" cy="60" rx="20" ry="26" fill="#f4a300"/>
     <path d="M36 48 l28 24 M64 48 l-28 24 M34 62 l24 20 M66 62 l-24 20" stroke="#c77f00" stroke-width="2"/>
     <path d="M50 34 q-14 -8 -12 -22 q8 6 12 14 q4 -8 12 -14 q2 14 -12 22z" fill="#52b788"/>`),
  w("uva", "uva",
    `<g fill="#7b2cbf"><circle cx="38" cy="46" r="9"/><circle cx="56" cy="46" r="9"/><circle cx="47" cy="60" r="9"/><circle cx="65" cy="60" r="9"/><circle cx="56" cy="74" r="9"/></g>
     <path d="M50 36 q-2 -10 6 -14" stroke="#6b4226" stroke-width="3" fill="none"/>
     <path d="M52 28 q12 -8 20 2 q-10 6 -20 -2z" fill="#52b788"/>`),
  w("ojo", "ojo",
    `<path d="M12 50 q38 -34 76 0 q-38 34 -76 0z" fill="#fff" stroke="#1d2b53" stroke-width="3"/>
     <circle cx="50" cy="50" r="14" fill="#4361ee"/><circle cx="50" cy="50" r="7" fill="#1d2b53"/><circle cx="45" cy="45" r="3" fill="#fff"/>`),
  w("lobo", "lobo",
    `<path d="M26 20 l12 20 h-20z M74 20 l-12 20 h20z" fill="#6c757d"/>
     <path d="M22 40 q28 -18 56 0 l-6 26 q-22 18 -44 0z" fill="#8d99ae"/>
     <path d="M38 62 q12 18 24 0 q-12 6 -24 0z" fill="#e9ecef"/>
     <circle cx="40" cy="48" r="3" fill="#1d2b53"/><circle cx="60" cy="48" r="3" fill="#1d2b53"/>
     <ellipse cx="50" cy="62" rx="5" ry="3.5" fill="#1d2b53"/>`),
  w("pavo", "pavo",
    `<g fill="#ee6c4d"><ellipse cx="50" cy="30" rx="10" ry="22" transform="rotate(-50 50 56)"/><ellipse cx="50" cy="30" rx="10" ry="22" transform="rotate(-25 50 56)"/>
     <ellipse cx="50" cy="30" rx="10" ry="22"/><ellipse cx="50" cy="30" rx="10" ry="22" transform="rotate(25 50 56)"/><ellipse cx="50" cy="30" rx="10" ry="22" transform="rotate(50 50 56)"/></g>
     <ellipse cx="50" cy="62" rx="18" ry="16" fill="#8d5524"/><circle cx="50" cy="46" r="8" fill="#a9713a"/>
     <path d="M50 48 l6 4 -6 2z" fill="#ffd166"/><circle cx="48" cy="44" r="1.8" fill="#1d2b53"/>`),
  w("loro", "loro",
    `<path d="M34 78 q-8 -30 8 -52 q22 -6 28 16 q2 22 -14 36z" fill="#52b788"/>
     <circle cx="52" cy="36" r="12" fill="#ef476f"/><path d="M60 34 q14 2 10 14 q-8 -2 -10 -8z" fill="#ffd166"/>
     <circle cx="52" cy="34" r="3" fill="#fff"/><circle cx="52" cy="34" r="1.6" fill="#1d2b53"/>
     <path d="M40 78 l-4 10 M52 80 l0 10" stroke="#ff8c42" stroke-width="3"/>`),
  w("pera", "pera",
    `<path d="M50 28 q-10 16 -22 26 q-8 24 22 26 q30 -2 22 -26 q-12 -10 -22 -26z" fill="#b5e48c"/>
     <path d="M50 28 q2 -10 8 -14" stroke="#6b4226" stroke-width="3" fill="none"/>
     <path d="M54 20 q10 -6 16 2 q-8 4 -16 -2z" fill="#52b788"/>`),
  w("vela", "vela",
    `<rect x="38" y="42" width="24" height="38" rx="3" fill="#fff3c4"/>
     <path d="M38 52 q4 6 8 0 q4 8 8 0 q4 6 8 0 v-10 h-24z" fill="#ffe08a"/>
     <path d="M50 40 v-6" stroke="#1d2b53" stroke-width="2.5"/>
     <path d="M50 34 q-9 -10 0 -22 q9 12 0 22z" fill="#ff8c42"/><path d="M50 32 q-4 -5 0 -10 q4 5 0 10z" fill="#ffd166"/>`),
  w("bici", "bici",
    `<circle cx="26" cy="64" r="15" fill="none" stroke="#1d2b53" stroke-width="4"/><circle cx="74" cy="64" r="15" fill="none" stroke="#1d2b53" stroke-width="4"/>
     <path d="M26 64 l16 -26 h20 l12 26 M42 38 l12 26 h-28 M62 38 l-6 -8 h-8" stroke="#ef476f" stroke-width="4" fill="none" stroke-linejoin="round"/>
     <rect x="38" y="30" width="14" height="5" rx="2" fill="#1d2b53"/>`),
  w("cama", "cama",
    `<rect x="14" y="52" width="72" height="16" rx="4" fill="#4361ee"/><rect x="14" y="36" width="8" height="42" rx="3" fill="#8d5524"/>
     <rect x="78" y="44" width="8" height="34" rx="3" fill="#8d5524"/><rect x="24" y="44" width="22" height="10" rx="5" fill="#fff"/>
     <rect x="24" y="52" width="54" height="8" fill="#90caf9"/>`),
  w("bota", "bota",
    `<path d="M34 20 h22 v32 q18 4 26 14 v14 h-48z" fill="#8d5524"/><rect x="34" y="20" width="22" height="8" fill="#6b4226"/>
     <rect x="34" y="72" width="48" height="8" rx="2" fill="#3b2414"/>`),
  w("hoja", "hoja",
    `<path d="M20 78 q-4 -50 56 -56 q4 52 -56 56z" fill="#52b788"/>
     <path d="M20 78 q22 -20 44 -42" stroke="#2d6a4f" stroke-width="3" fill="none"/>`),
  w("queso", "queso",
    `<path d="M14 58 L86 40 V74 H14z" fill="#ffd166"/><path d="M14 58 L86 40 L72 30 L22 46z" fill="#ffe08a"/>
     <circle cx="36" cy="66" r="5" fill="#e8a900"/><circle cx="58" cy="58" r="4" fill="#e8a900"/><circle cx="72" cy="66" r="3.5" fill="#e8a900"/>`),
  w("nieve", "nieve",
    `<g stroke="#4cc9f0" stroke-width="5" stroke-linecap="round" fill="none"><path d="M50 16 v68 M20 33 l60 34 M80 33 l-60 34"/><path d="M42 22 l8 8 8 -8 M42 78 l8 -8 8 8"/></g>`),
  w("huevo", "huevo",
    `<path d="M50 18 q24 0 26 40 q0 22 -26 22 q-26 0 -26 -22 q2 -40 26 -40z" fill="#fff3e0" stroke="#e0c9a6" stroke-width="3"/>
     <ellipse cx="42" cy="40" rx="5" ry="8" fill="#fff" opacity="0.7"/>`),
  w("cielo", "cielo",
    `<rect x="10" y="14" width="80" height="72" rx="10" fill="#8ad7f5"/><circle cx="66" cy="36" r="12" fill="#ffd166"/>
     <g fill="#fff"><circle cx="34" cy="58" r="10"/><circle cx="46" cy="52" r="13"/><circle cx="60" cy="60" r="10"/><rect x="26" y="58" width="42" height="12" rx="6"/></g>`),
  w("pulpo", "pulpo",
    `<path d="M26 50 a24 24 0 0 1 48 0 v6 h-48z" fill="#ef476f"/>
     <path d="M26 56 q-6 20 -12 22 M36 56 q-2 20 -4 28 M46 56 q0 18 0 26 M56 56 q2 18 4 26 M66 56 q2 20 6 28 M74 56 q6 14 12 18" stroke="#ef476f" stroke-width="6" fill="none" stroke-linecap="round"/>
     <circle cx="42" cy="46" r="4" fill="#fff"/><circle cx="58" cy="46" r="4" fill="#fff"/><circle cx="42" cy="47" r="2" fill="#1d2b53"/><circle cx="58" cy="47" r="2" fill="#1d2b53"/>`),
  w("tarta", "tarta",
    `<ellipse cx="50" cy="68" rx="36" ry="12" fill="#c97b3c"/>
     <path d="M14 60 a36 14 0 0 1 72 0 v8 a36 12 0 0 1 -72 0z" fill="#e0a458"/>
     <ellipse cx="50" cy="58" rx="30" ry="9" fill="#ef476f"/><circle cx="40" cy="56" r="3" fill="#fff"/><circle cx="58" cy="60" r="3" fill="#fff"/>`),
  w("diente", "diente",
    `<path d="M28 28 q10 -10 22 -4 q12 -6 22 4 q6 20 -2 34 q-4 20 -10 20 q-6 0 -6 -18 q-2 -8 -4 0 q0 18 -6 18 q-6 0 -10 -20 q-8 -14 -6 -34z" fill="#fff" stroke="#9aa5b1" stroke-width="3"/>`),
  w("cerdo", "cerdo",
    `<path d="M26 28 l6 14 l-14 -4z M74 28 l-6 14 l14 -4z" fill="#f4a3b8"/>
     <circle cx="50" cy="54" r="28" fill="#ffb3c7"/><ellipse cx="50" cy="62" rx="14" ry="10" fill="#ff8fb0"/>
     <circle cx="45" cy="62" r="2.5" fill="#c9184a"/><circle cx="55" cy="62" r="2.5" fill="#c9184a"/>
     <circle cx="38" cy="46" r="3" fill="#1d2b53"/><circle cx="62" cy="46" r="3" fill="#1d2b53"/>`),
  w("barco", "barco",
    `<path d="M14 58 h72 l-12 20 h-48z" fill="#ef476f"/><rect x="48" y="22" width="3" height="36" fill="#6b4226"/>
     <path d="M52 24 l26 28 h-26z" fill="#fff"/><path d="M46 30 l-18 22 h18z" fill="#ffd166"/>
     <path d="M10 84 q10 -6 20 0 t20 0 t20 0 t20 0" stroke="#4cc9f0" stroke-width="3" fill="none"/>`),
  w("mango", "mango",
    `<path d="M50 24 q28 -4 30 30 q0 26 -30 24 q-24 -4 -24 -26 q2 -24 24 -28z" fill="#ff9f1c"/>
     <path d="M66 36 q8 10 4 24" stroke="#ef476f" stroke-width="6" fill="none" opacity="0.6"/>
     <path d="M50 24 q4 -8 12 -10 q-2 8 -12 10z" fill="#52b788"/>`),
  w("guante", "guante",
    `<path d="M30 80 v-28 q0 -26 20 -28 q20 2 20 28 v28z" fill="#4cc9f0"/><path d="M30 52 q-14 -2 -14 -14 q10 0 16 8z" fill="#4cc9f0"/>
     <rect x="28" y="70" width="44" height="12" rx="3" fill="#0ea5d8"/>`),
  w("libro", "libro",
    `<rect x="26" y="20" width="46" height="62" rx="4" fill="#4361ee"/><rect x="26" y="20" width="8" height="62" rx="3" fill="#2b3fb3"/>
     <rect x="40" y="32" width="26" height="6" rx="2" fill="#fff"/><rect x="40" y="44" width="20" height="4" rx="2" fill="#cfe0ff"/>
     <rect x="72" y="22" width="4" height="58" fill="#cfe0ff"/>`),
  w("tigre", "tigre",
    `<circle cx="30" cy="30" r="9" fill="#ff9f1c"/><circle cx="70" cy="30" r="9" fill="#ff9f1c"/><circle cx="50" cy="52" r="28" fill="#ff9f1c"/>
     <ellipse cx="50" cy="62" rx="14" ry="11" fill="#fff3d6"/>
     <path d="M26 44 h10 M24 54 h10 M74 44 h-10 M76 54 h-10 M50 26 v10 M42 28 v6 M58 28 v6" stroke="#1d2b53" stroke-width="3.5" stroke-linecap="round"/>
     <circle cx="40" cy="48" r="3" fill="#1d2b53"/><circle cx="60" cy="48" r="3" fill="#1d2b53"/><ellipse cx="50" cy="58" rx="4" ry="3" fill="#1d2b53"/>`),
  w("fresa", "fresa",
    `<path d="M50 84 q-30 -20 -26 -38 q4 -14 26 -12 q22 -2 26 12 q4 18 -26 38z" fill="#ef233c"/>
     <path d="M50 36 q-14 -2 -16 -12 q8 2 16 6 q8 -4 16 -6 q-2 10 -16 12z" fill="#52b788"/>
     <g fill="#ffd166"><circle cx="40" cy="52" r="2"/><circle cx="56" cy="50" r="2"/><circle cx="48" cy="62" r="2"/><circle cx="62" cy="64" r="2"/><circle cx="38" cy="68" r="2"/></g>`),
  w("puerta", "puerta",
    `<rect x="26" y="14" width="48" height="72" rx="4" fill="#c97b3c"/><rect x="34" y="24" width="14" height="22" rx="2" fill="#a05a28"/>
     <rect x="52" y="24" width="14" height="22" rx="2" fill="#a05a28"/><rect x="34" y="52" width="32" height="26" rx="2" fill="#a05a28"/>
     <circle cx="62" cy="50" r="3" fill="#ffd166"/>`),
  w("melon", "melón",
    `<path d="M14 40 a36 36 0 0 0 72 0z" fill="#52b788"/><path d="M20 40 a30 30 0 0 0 60 0z" fill="#ffe8a3"/><path d="M26 40 a24 24 0 0 0 48 0z" fill="#ffb347"/>
     <g fill="#6b4226"><circle cx="42" cy="50" r="2"/><circle cx="52" cy="56" r="2"/><circle cx="60" cy="49" r="2"/></g>`),
  w("reloj", "reloj",
    `<circle cx="50" cy="52" r="32" fill="#fff" stroke="#4361ee" stroke-width="6"/>
     <path d="M50 52 v-18 M50 52 l14 8" stroke="#1d2b53" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="52" r="3" fill="#ef476f"/>
     <circle cx="32" cy="18" r="8" fill="#ef476f"/><circle cx="68" cy="18" r="8" fill="#ef476f"/>`),
  w("nariz", "nariz",
    `<path d="M50 20 q-6 24 -12 38 q-10 10 0 18 q12 6 24 0 q10 -8 0 -18 q-6 -14 -12 -38z" fill="#ffcf9f" stroke="#e0a370" stroke-width="3"/>
     <ellipse cx="42" cy="68" rx="4" ry="3" fill="#c97b3c"/><ellipse cx="58" cy="68" rx="4" ry="3" fill="#c97b3c"/>`),
  w("playa", "playa",
    `<rect x="10" y="14" width="80" height="40" fill="#8ad7f5"/><circle cx="72" cy="30" r="10" fill="#ffd166"/>
     <rect x="10" y="48" width="80" height="14" fill="#4cc9f0"/><path d="M10 62 h80 v26 h-80z" fill="#f4e2a1"/>
     <path d="M36 76 v-30" stroke="#6b4226" stroke-width="3"/><path d="M22 46 a14 12 0 0 1 28 0z" fill="#ef476f"/>`),
  w("leche", "leche",
    `<path d="M28 24 h44 l-6 58 h-32z" fill="#e8f1ff" stroke="#4361ee" stroke-width="3"/>
     <path d="M31 42 h38 l-3 40 h-32z" fill="#fff"/><path d="M31 42 h38" stroke="#4361ee" stroke-width="2"/>`),
  w("silla", "silla",
    `<rect x="34" y="14" width="34" height="38" rx="4" fill="#c97b3c"/><rect x="30" y="50" width="42" height="10" rx="3" fill="#a05a28"/>
     <rect x="32" y="60" width="6" height="26" fill="#a05a28"/><rect x="64" y="60" width="6" height="26" fill="#a05a28"/>`),
  w("burro", "burro",
    `<path d="M30 10 l8 30 h-14z M70 10 l-8 30 h14z" fill="#8d99ae"/>
     <path d="M26 40 q24 -14 48 0 l-4 34 q-20 14 -40 0z" fill="#adb5bd"/><ellipse cx="50" cy="68" rx="16" ry="12" fill="#f1f3f5"/>
     <circle cx="40" cy="48" r="3" fill="#1d2b53"/><circle cx="60" cy="48" r="3" fill="#1d2b53"/>
     <circle cx="44" cy="68" r="2" fill="#6c757d"/><circle cx="56" cy="68" r="2" fill="#6c757d"/>`),
  w("gorro", "gorro",
    `<path d="M22 60 a28 30 0 0 1 56 0z" fill="#ef476f"/><rect x="18" y="58" width="64" height="16" rx="6" fill="#ffd166"/>
     <circle cx="50" cy="26" r="8" fill="#fff"/><path d="M30 58 v16 M42 58 v16 M54 58 v16 M66 58 v16" stroke="#e8a900" stroke-width="2"/>`),
  w("zorro", "zorro",
    `<path d="M22 18 l20 24 h-24z M78 18 l-20 24 h24z" fill="#e8590c"/><path d="M18 40 q32 -14 64 0 l-32 44z" fill="#ff8c42"/>
     <path d="M34 62 q16 12 32 0 l-16 22z" fill="#fff"/><circle cx="40" cy="50" r="3" fill="#1d2b53"/><circle cx="60" cy="50" r="3" fill="#1d2b53"/>
     <circle cx="50" cy="76" r="4" fill="#1d2b53"/>`),

  w("carta", "carta",
    `<rect x="14" y="28" width="72" height="48" rx="5" fill="#fff" stroke="#4361ee" stroke-width="4"/>
     <path d="M14 32 l36 26 36 -26" stroke="#4361ee" stroke-width="4" fill="none" stroke-linejoin="round"/>
     <circle cx="72" cy="66" r="5" fill="#ef476f"/>`),
  w("falda", "falda",
    `<rect x="34" y="16" width="32" height="10" rx="3" fill="#8d5524"/><path d="M34 26 h32 l18 56 h-68z" fill="#ef476f"/>
     <path d="M42 30 l-10 52 M50 30 v52 M58 30 l10 52" stroke="#c9184a" stroke-width="2"/>`),

  // ============================ 3 syllables ============================
  w("paleta", "paleta",
    `<rect x="46" y="62" width="8" height="26" rx="3" fill="#e0b98a"/><path d="M32 62 v-30 a18 18 0 0 1 36 0 v30z" fill="#ff5d8f"/>
     <path d="M32 46 h36 v16 h-36z" fill="#ffd166"/><path d="M40 28 q4 -8 10 -8" stroke="#fff" stroke-width="3" fill="none" opacity="0.7"/>`),
  w("palito", "palito",
    `<rect x="18" y="46" width="64" height="8" rx="4" fill="#e0b98a" transform="rotate(-30 50 50)"/>
     <rect x="18" y="46" width="64" height="8" rx="4" fill="#c99a63" transform="rotate(25 50 50)"/>`),
  w("sapito", "sapito",
    `<ellipse cx="50" cy="62" rx="26" ry="18" fill="#6bbf59"/><circle cx="38" cy="42" r="10" fill="#6bbf59"/><circle cx="62" cy="42" r="10" fill="#6bbf59"/>
     <circle cx="38" cy="42" r="5" fill="#fff"/><circle cx="62" cy="42" r="5" fill="#fff"/><circle cx="38" cy="43" r="2.5" fill="#1d2b53"/><circle cx="62" cy="43" r="2.5" fill="#1d2b53"/>
     <path d="M38 66 q12 8 24 0" stroke="#2d6a4f" stroke-width="3" fill="none"/><circle cx="30" cy="58" r="3" fill="#4c9a3f"/><circle cx="68" cy="56" r="3" fill="#4c9a3f"/>`),
  w("mesita", "mesita",
    `<rect x="24" y="44" width="52" height="10" rx="4" fill="#e0a458"/><rect x="30" y="54" width="6" height="26" fill="#c97b3c"/>
     <rect x="64" y="54" width="6" height="26" fill="#c97b3c"/><circle cx="50" cy="38" r="6" fill="#ef476f"/><path d="M50 32 v-6" stroke="#52b788" stroke-width="3"/>`),
  w("mamita", "mamita",
    `<circle cx="50" cy="38" r="16" fill="#ffcf9f"/><path d="M32 40 q0 -26 18 -26 q18 0 18 26 q-4 -12 -18 -12 q-14 0 -18 12z" fill="#6b4226"/>
     <circle cx="44" cy="40" r="2" fill="#1d2b53"/><circle cx="56" cy="40" r="2" fill="#1d2b53"/><path d="M44 47 q6 5 12 0" stroke="#c9184a" stroke-width="2.5" fill="none"/>
     <path d="M30 86 q0 -26 20 -26 q20 0 20 26z" fill="#ef476f"/><path d="M50 78 l-6 -6 a3.5 3.5 0 0 1 6 -4 a3.5 3.5 0 0 1 6 4z" fill="#fff"/>`),
  w("papito", "papito",
    `<circle cx="50" cy="38" r="16" fill="#ffcf9f"/><path d="M34 36 q2 -20 16 -20 q14 0 16 20 q-8 -8 -16 -8 q-8 0 -16 8z" fill="#3b2414"/>
     <circle cx="44" cy="40" r="2" fill="#1d2b53"/><circle cx="56" cy="40" r="2" fill="#1d2b53"/><path d="M44 47 q6 5 12 0" stroke="#c9184a" stroke-width="2.5" fill="none"/>
     <path d="M30 86 q0 -26 20 -26 q20 0 20 26z" fill="#4361ee"/>`),
  w("patata", "patata",
    `<path d="M22 54 q-4 -26 26 -28 q32 0 30 28 q0 22 -28 24 q-26 -2 -28 -24z" fill="#c69c6d"/>
     <g fill="#8d6e3f"><circle cx="40" cy="46" r="3"/><circle cx="58" cy="56" r="3"/><circle cx="48" cy="64" r="2.5"/><circle cx="64" cy="42" r="2.5"/></g>`),
  w("moneda", "moneda",
    `<circle cx="50" cy="50" r="30" fill="#ffd166" stroke="#e8a900" stroke-width="5"/><circle cx="50" cy="50" r="21" fill="none" stroke="#e8a900" stroke-width="2.5"/>
     <text x="50" y="60" font-size="28" font-weight="bold" text-anchor="middle" fill="#e8a900">$</text>`),
  w("semana", "semana",
    `<rect x="16" y="22" width="68" height="60" rx="8" fill="#fff" stroke="#4361ee" stroke-width="4"/><rect x="16" y="22" width="68" height="16" rx="6" fill="#4361ee"/>
     <g fill="#4361ee"><circle cx="32" cy="50" r="4"/><circle cx="44" cy="50" r="4"/><circle cx="56" cy="50" r="4"/><circle cx="68" cy="50" r="4"/><circle cx="32" cy="64" r="4"/><circle cx="44" cy="64" r="4"/><circle cx="56" cy="64" r="4"/></g>
     <rect x="30" y="14" width="5" height="14" rx="2" fill="#1d2b53"/><rect x="65" y="14" width="5" height="14" rx="2" fill="#1d2b53"/>`),
  w("manana", "mañana",
    `<rect x="10" y="14" width="80" height="70" rx="8" fill="#ffd6a5"/><circle cx="50" cy="64" r="20" fill="#ffd166"/>
     <g stroke="#ff8c42" stroke-width="4" stroke-linecap="round"><path d="M50 30 v8 M24 40 l6 6 M76 40 l-6 6 M16 62 h8 M76 62 h8"/></g>
     <path d="M10 64 h80 v12 a8 8 0 0 1 -8 8 h-64 a8 8 0 0 1 -8 -8z" fill="#52b788"/>`),
  w("panuelo", "pañuelo",
    `<path d="M18 30 l64 -6 l4 56 l-62 6z" fill="#cfe0ff" stroke="#4361ee" stroke-width="3"/>
     <path d="M26 40 l48 -4 M28 56 l48 -4 M30 72 l48 -4" stroke="#4361ee" stroke-width="2" stroke-dasharray="4 4"/>`),
  w("pinata", "piñata",
    `<path d="M50 4 v14" stroke="#1d2b53" stroke-width="3"/>
     <polygon points="50,20 58.2,38.7 78.5,40.7 63.3,54.3 67.6,74.3 50,64 32.4,74.3 36.7,54.3 21.5,40.7 41.8,38.7" fill="#ff5d8f"/>
     <circle cx="50" cy="50" r="6" fill="#ffd166"/><circle cx="36" cy="44" r="3" fill="#4cc9f0"/><circle cx="64" cy="44" r="3" fill="#06d6a0"/>
     <path d="M30 86 l6 -8 M70 86 l-6 -8 M50 90 v-8" stroke="#ffd166" stroke-width="3" stroke-linecap="round"/>`),
  w("sonido", "sonido",
    `<path d="M16 40 h16 l22 -18 v56 l-22 -18 h-16z" fill="#4361ee"/>
     <path d="M62 38 q10 12 0 24 M72 28 q18 22 0 44" stroke="#4361ee" stroke-width="5" fill="none" stroke-linecap="round"/>`),
  w("nenita", "nenita",
    `<circle cx="50" cy="52" r="26" fill="#ffcf9f"/><path d="M26 46 q2 -28 24 -28 q22 0 24 28 q-10 -14 -24 -14 q-14 0 -24 14z" fill="#8d5524"/>
     <path d="M50 22 l-10 -8 v14z M50 22 l10 -8 v14z" fill="#ff5d8f"/><circle cx="50" cy="22" r="3" fill="#ef476f"/>
     <circle cx="42" cy="54" r="3" fill="#1d2b53"/><circle cx="58" cy="54" r="3" fill="#1d2b53"/><path d="M44 64 q6 5 12 0" stroke="#c9184a" stroke-width="2.5" fill="none"/>
     <circle cx="36" cy="62" r="4" fill="#ff9aa2" opacity="0.6"/><circle cx="64" cy="62" r="4" fill="#ff9aa2" opacity="0.6"/>`),
  w("lunita", "lunita",
    `<path d="M62 18 a34 34 0 1 0 14 56 a28 28 0 0 1 -14 -56z" fill="#ffd166"/><circle cx="34" cy="52" r="2.5" fill="#e8a900"/>
     <path d="M80 24 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" fill="#ffd166"/>`),
  w("amigo", "amigo",
    `<circle cx="32" cy="40" r="14" fill="#ffcf9f"/><circle cx="68" cy="40" r="14" fill="#e0ac69"/>
     <path d="M18 36 q2 -18 14 -18 q12 0 14 18 q-6 -8 -14 -8 q-8 0 -14 8z" fill="#3b2414"/><path d="M54 34 q2 -16 14 -16 q12 0 14 16 q-6 -6 -14 -6 q-8 0 -14 6z" fill="#6b4226"/>
     <circle cx="28" cy="42" r="1.8" fill="#1d2b53"/><circle cx="36" cy="42" r="1.8" fill="#1d2b53"/><circle cx="64" cy="42" r="1.8" fill="#1d2b53"/><circle cx="72" cy="42" r="1.8" fill="#1d2b53"/>
     <path d="M28 48 q4 4 8 0 M64 48 q4 4 8 0" stroke="#c9184a" stroke-width="2" fill="none"/>
     <path d="M22 86 q0 -22 10 -22 q10 0 10 22z" fill="#ef476f"/><path d="M58 86 q0 -22 10 -22 q10 0 10 22z" fill="#4361ee"/>
     <path d="M42 74 h16" stroke="#ffcf9f" stroke-width="5" stroke-linecap="round"/>`),
  w("abuelo", "abuelo",
    `<circle cx="50" cy="48" r="24" fill="#ffcf9f"/><path d="M26 46 q0 -26 24 -26 q24 0 24 26 q-6 -14 -24 -14 q-18 0 -24 14z" fill="#e9ecef"/>
     <circle cx="26" cy="50" r="6" fill="#e9ecef"/><circle cx="74" cy="50" r="6" fill="#e9ecef"/>
     <circle cx="41" cy="50" r="6" fill="none" stroke="#1d2b53" stroke-width="2"/><circle cx="59" cy="50" r="6" fill="none" stroke="#1d2b53" stroke-width="2"/>
     <path d="M47 50 h6" stroke="#1d2b53" stroke-width="2"/><path d="M36 66 q14 14 28 0 q-14 4 -28 0z" fill="#e9ecef"/>`),
  w("abeja", "abeja",
    `<ellipse cx="48" cy="58" rx="24" ry="17" fill="#ffd166"/><path d="M40 42 v32 M54 42 v32 M66 46 v24" stroke="#1d2b53" stroke-width="6"/>
     <ellipse cx="42" cy="38" rx="12" ry="8" fill="#cfe0ff" opacity="0.85" transform="rotate(-25 42 38)"/>
     <ellipse cx="58" cy="36" rx="12" ry="8" fill="#cfe0ff" opacity="0.85" transform="rotate(25 58 36)"/>
     <circle cx="26" cy="54" r="3" fill="#1d2b53"/><path d="M72 58 l10 4" stroke="#1d2b53" stroke-width="3"/>`),
  w("cometa", "cometa",
    `<path d="M50 12 l24 30 l-24 34 l-24 -34z" fill="#ef476f"/><path d="M50 12 v64 M26 42 h48" stroke="#fff" stroke-width="2.5"/>
     <path d="M50 76 q-10 8 0 14 q10 4 6 -6" stroke="#1d2b53" stroke-width="2.5" fill="none"/>
     <path d="M44 82 l-6 -3 v6z M56 86 l6 -3 v6z" fill="#ffd166"/>`),
  w("camino", "camino",
    `<rect x="10" y="14" width="80" height="34" fill="#8ad7f5"/><rect x="10" y="48" width="80" height="38" fill="#90be6d"/>
     <path d="M44 48 h12 l22 38 h-56z" fill="#6c757d"/><path d="M50 52 v6 M50 64 v8 M50 78 v6" stroke="#fff" stroke-width="3"/>`),
  w("cadena", "cadena",
    `<g fill="none" stroke="#6c757d" stroke-width="7"><rect x="12" y="38" width="30" height="24" rx="12"/><rect x="36" y="38" width="30" height="24" rx="12" stroke="#adb5bd"/><rect x="60" y="38" width="28" height="24" rx="12"/></g>`),
  w("corona", "corona",
    `<path d="M16 70 l-4 -38 22 20 16 -28 16 28 22 -20 -4 38z" fill="#ffd166" stroke="#e8a900" stroke-width="3" stroke-linejoin="round"/>
     <rect x="16" y="70" width="68" height="10" rx="3" fill="#e8a900"/><circle cx="50" cy="56" r="4" fill="#ef476f"/>
     <circle cx="30" cy="60" r="3" fill="#4cc9f0"/><circle cx="70" cy="60" r="3" fill="#4cc9f0"/>`),
  w("gorila", "gorila",
    `<circle cx="24" cy="48" r="8" fill="#343a40"/><circle cx="76" cy="48" r="8" fill="#343a40"/>
     <path d="M26 44 q0 -28 24 -28 q24 0 24 28 v14 q0 24 -24 24 q-24 0 -24 -24z" fill="#495057"/><ellipse cx="50" cy="62" rx="18" ry="16" fill="#adb5bd"/>
     <circle cx="41" cy="46" r="3" fill="#fff"/><circle cx="59" cy="46" r="3" fill="#fff"/><circle cx="41" cy="46" r="1.5" fill="#1d2b53"/><circle cx="59" cy="46" r="1.5" fill="#1d2b53"/>
     <circle cx="45" cy="58" r="2" fill="#343a40"/><circle cx="55" cy="58" r="2" fill="#343a40"/><path d="M43 69 q7 5 14 0" stroke="#343a40" stroke-width="2.5" fill="none"/>`),
  w("helado", "helado",
    `<path d="M34 54 l16 34 l16 -34z" fill="#e0a458"/><path d="M40 60 l10 20 M50 56 v30 M60 60 l-10 20" stroke="#c97b3c" stroke-width="1.5"/>
     <circle cx="50" cy="40" r="18" fill="#ff8fb0"/><circle cx="36" cy="48" r="10" fill="#ffe08a"/><circle cx="64" cy="48" r="10" fill="#b5e48c"/>
     <circle cx="50" cy="20" r="4" fill="#ef233c"/>`),
  w("oveja", "oveja",
    `<path d="M38 76 v10 M62 76 v10" stroke="#343a40" stroke-width="5" stroke-linecap="round"/>
     <g fill="#fff" stroke="#cfd8dc" stroke-width="2"><circle cx="34" cy="46" r="14"/><circle cx="50" cy="38" r="15"/><circle cx="66" cy="46" r="14"/><circle cx="40" cy="60" r="14"/><circle cx="60" cy="60" r="14"/></g>
     <ellipse cx="50" cy="56" rx="12" ry="14" fill="#343a40"/><circle cx="45" cy="52" r="2" fill="#fff"/><circle cx="55" cy="52" r="2" fill="#fff"/>`),
  w("juguete", "juguete",
    `<circle cx="30" cy="30" r="10" fill="#b8793f"/><circle cx="70" cy="30" r="10" fill="#b8793f"/><circle cx="50" cy="54" r="26" fill="#d9a066"/>
     <ellipse cx="50" cy="62" rx="12" ry="9" fill="#f4d9b0"/><circle cx="41" cy="48" r="3" fill="#1d2b53"/><circle cx="59" cy="48" r="3" fill="#1d2b53"/>
     <ellipse cx="50" cy="58" rx="4" ry="3" fill="#1d2b53"/><path d="M36 82 l14 -6 14 6 -14 6z" fill="#ef476f"/>`),
  w("vecino", "vecino",
    `<rect x="10" y="48" width="34" height="32" fill="#ffb703"/><path d="M6 50 l21 -24 l21 24z" fill="#ef476f"/><rect x="22" y="62" width="10" height="18" fill="#8d5524"/>
     <rect x="56" y="40" width="34" height="40" fill="#4cc9f0"/><path d="M52 42 l21 -24 l21 24z" fill="#4361ee"/><rect x="68" y="62" width="10" height="18" fill="#1d2b53"/>
     <rect x="62" y="48" width="8" height="8" fill="#fff"/>`),
  w("regalo", "regalo",
    `<rect x="20" y="42" width="60" height="42" rx="3" fill="#ef476f"/><rect x="16" y="32" width="68" height="14" rx="3" fill="#ff8fb0"/>
     <rect x="45" y="32" width="10" height="52" fill="#ffd166"/><path d="M50 32 q-18 -22 -22 -8 q0 10 22 8z M50 32 q18 -22 22 -8 q0 10 -22 8z" fill="#ffd166"/>`),
  w("familia", "familia",
    `<circle cx="28" cy="26" r="8" fill="#ffcf9f"/><path d="M18 74 q0 -34 10 -34 q10 0 10 34z" fill="#4361ee"/>
     <circle cx="72" cy="26" r="8" fill="#ffcf9f"/><path d="M62 74 q0 -34 10 -34 q10 0 10 34z" fill="#ef476f"/>
     <circle cx="44" cy="46" r="6" fill="#ffcf9f"/><path d="M37 78 q0 -24 7 -24 q7 0 7 24z" fill="#ffd166"/>
     <circle cx="56" cy="46" r="6" fill="#ffcf9f"/><path d="M49 78 q0 -24 7 -24 q7 0 7 24z" fill="#52b788"/>`),
  w("pijama", "pijama",
    `<path d="M34 16 l-20 14 8 14 10 -6 v42 h36 v-42 l10 6 8 -14 -20 -14 q-16 10 -32 0z" fill="#4cc9f0"/><path d="M50 26 v58" stroke="#0ea5d8" stroke-width="2"/>
     <g fill="#fff"><circle cx="36" cy="46" r="3"/><circle cx="64" cy="50" r="3"/><circle cx="38" cy="66" r="3"/><circle cx="62" cy="70" r="3"/></g>`),
  w("sirena", "sirena",
    `<circle cx="50" cy="26" r="12" fill="#ffcf9f"/>
     <path d="M36 28 q-4 -22 14 -22 q18 0 14 22 q-4 -10 -14 -10 q-10 0 -14 10z M36 28 q-6 20 2 30 M64 28 q6 20 -2 30" fill="#ef476f" stroke="#ef476f" stroke-width="2"/>
     <rect x="40" y="38" width="20" height="18" rx="6" fill="#ffcf9f"/><path d="M40 52 q-2 22 10 32 q12 -10 10 -32z" fill="#06d6a0"/>
     <path d="M50 84 l-14 8 4 -12z M50 84 l14 8 -4 -12z" fill="#06b47f"/>`),
  w("tijera", "tijera",
    `<circle cx="30" cy="72" r="10" fill="none" stroke="#ef476f" stroke-width="5"/><circle cx="70" cy="72" r="10" fill="none" stroke="#ef476f" stroke-width="5"/>
     <path d="M36 64 L70 14 M64 64 L30 14" stroke="#adb5bd" stroke-width="6" stroke-linecap="round"/><circle cx="50" cy="40" r="3" fill="#495057"/>`),
  w("pirata", "pirata",
    `<path d="M10 62 q40 -60 80 0 q-40 -10 -80 0z" fill="#1d2b53"/><path d="M10 62 q40 12 80 0 q-6 14 -40 14 q-34 0 -40 -14z" fill="#343a40"/>
     <circle cx="50" cy="42" r="9" fill="#fff"/><circle cx="46" cy="41" r="2" fill="#1d2b53"/><circle cx="54" cy="41" r="2" fill="#1d2b53"/>
     <path d="M38 56 l24 10 M62 56 l-24 10" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`),
  w("campana", "campana",
    `<path d="M24 70 q4 -10 4 -26 q0 -22 22 -24 q22 2 22 24 q0 16 4 26z" fill="#ffd166" stroke="#e8a900" stroke-width="3"/>
     <circle cx="50" cy="16" r="4" fill="#e8a900"/><circle cx="50" cy="78" r="7" fill="#e8a900"/><rect x="20" y="68" width="60" height="6" rx="3" fill="#e8a900"/>`),
  w("ventana", "ventana",
    `<rect x="18" y="14" width="64" height="72" rx="4" fill="#8d5524"/><rect x="25" y="21" width="23" height="28" fill="#8ad7f5"/><rect x="52" y="21" width="23" height="28" fill="#8ad7f5"/>
     <rect x="25" y="53" width="23" height="26" fill="#8ad7f5"/><rect x="52" y="53" width="23" height="26" fill="#8ad7f5"/>
     <path d="M28 44 l8 -10 M55 44 l8 -10" stroke="#fff" stroke-width="2.5"/>`),
  w("bandera", "bandera",
    `<rect x="24" y="12" width="5" height="76" rx="2" fill="#6b4226"/><path d="M29 16 h50 l-10 14 10 14 h-50z" fill="#ef476f"/><circle cx="42" cy="30" r="6" fill="#fff"/>`),
  w("montana", "montaña",
    `<rect x="8" y="14" width="84" height="72" rx="8" fill="#cfe9ff"/><path d="M8 86 L42 32 L64 62 L74 50 L92 86z" fill="#6c757d"/>
     <path d="M42 32 l-10 16 l6 -4 l4 6 l6 -6 l4 4z" fill="#fff"/><circle cx="76" cy="26" r="7" fill="#ffd166"/>`),
  w("sombrero", "sombrero",
    `<ellipse cx="50" cy="66" rx="40" ry="12" fill="#e0a458"/><path d="M28 66 q-2 -36 22 -36 q24 0 22 36z" fill="#e0a458"/>
     <path d="M28 62 q22 8 44 0 v-8 q-22 8 -44 0z" fill="#ef476f"/>`),
  w("escuela", "escuela",
    `<rect x="14" y="40" width="72" height="42" fill="#ef476f"/><path d="M10 42 l40 -24 l40 24z" fill="#c9184a"/><rect x="42" y="58" width="16" height="24" fill="#ffd166"/>
     <rect x="22" y="50" width="12" height="12" fill="#fff"/><rect x="66" y="50" width="12" height="12" fill="#fff"/><circle cx="50" cy="38" r="5" fill="#fff"/>
     <path d="M50 18 v-8 h10 v5 h-10" stroke="#1d2b53" stroke-width="2" fill="#4361ee"/>`),
  w("cuaderno", "cuaderno",
    `<rect x="24" y="14" width="52" height="72" rx="4" fill="#4cc9f0"/><rect x="34" y="24" width="38" height="56" rx="2" fill="#fff"/>
     <g fill="#1d2b53"><circle cx="30" cy="28" r="2.5"/><circle cx="30" cy="42" r="2.5"/><circle cx="30" cy="56" r="2.5"/><circle cx="30" cy="70" r="2.5"/></g>
     <path d="M40 36 h26 M40 46 h26 M40 56 h26 M40 66 h16" stroke="#8ad7f5" stroke-width="2.5"/>`),
  w("payaso", "payaso",
    `<path d="M24 40 q-10 -8 -2 -20 q10 4 14 16z M76 40 q10 -8 2 -20 q-10 4 -14 16z" fill="#ff5d8f"/><circle cx="50" cy="52" r="28" fill="#fff3e0"/>
     <circle cx="40" cy="46" r="4" fill="#1d2b53"/><circle cx="60" cy="46" r="4" fill="#1d2b53"/><circle cx="50" cy="56" r="7" fill="#ef233c"/>
     <path d="M36 66 q14 14 28 0" stroke="#ef233c" stroke-width="4" fill="none"/><path d="M34 24 l16 -16 16 16z" fill="#4361ee"/>`),
  w("ayuda", "ayuda",
    `<path fill-rule="evenodd" d="M50 18 a32 32 0 1 0 0.1 0z M50 36 a14 14 0 1 1 -0.1 0z" fill="#ef476f"/>
     <g fill="#fff"><rect x="44" y="18" width="12" height="18"/><rect x="44" y="64" width="12" height="18"/><rect x="18" y="44" width="18" height="12"/><rect x="64" y="44" width="18" height="12"/></g>`),
  w("cazuela", "cazuela",
    `<path d="M22 44 h56 v22 q0 16 -16 16 h-24 q-16 0 -16 -16z" fill="#adb5bd"/><rect x="14" y="48" width="12" height="6" rx="3" fill="#6c757d"/>
     <rect x="74" y="48" width="12" height="6" rx="3" fill="#6c757d"/><ellipse cx="50" cy="44" rx="28" ry="6" fill="#e07a5f"/>
     <path d="M40 34 q4 -6 0 -12 M52 34 q4 -6 0 -12 M62 34 q4 -6 0 -12" stroke="#cfd8dc" stroke-width="3" fill="none"/>`),
  w("galleta", "galleta",
    `<circle cx="50" cy="50" r="32" fill="#d9a066"/>
     <g fill="#6b4226"><circle cx="38" cy="40" r="4"/><circle cx="60" cy="36" r="4"/><circle cx="52" cy="54" r="4"/><circle cx="36" cy="62" r="4"/><circle cx="66" cy="62" r="4"/></g>`),
  w("mochila", "mochila",
    `<rect x="26" y="24" width="48" height="60" rx="16" fill="#4361ee"/><path d="M38 24 q12 -16 24 0" stroke="#1d2b53" stroke-width="5" fill="none"/>
     <rect x="34" y="52" width="32" height="24" rx="6" fill="#2b3fb3"/><rect x="44" y="60" width="12" height="4" rx="2" fill="#ffd166"/>
     <path d="M34 38 h32" stroke="#cfe0ff" stroke-width="3"/>`),
  w("camello", "camello",
    `<circle cx="38" cy="38" r="12" fill="#d9a066"/><circle cx="60" cy="38" r="12" fill="#d9a066"/><ellipse cx="50" cy="56" rx="34" ry="16" fill="#d9a066"/>
     <path d="M76 58 l12 -34" stroke="#d9a066" stroke-width="12" stroke-linecap="round"/><circle cx="88" cy="22" r="8" fill="#d9a066"/><circle cx="90" cy="20" r="2" fill="#1d2b53"/>
     <path d="M26 66 v20 M42 70 v16 M60 70 v16 M72 66 v20" stroke="#b8793f" stroke-width="6" stroke-linecap="round"/>`),
  w("carrito", "carrito",
    `<path d="M10 20 h14 l10 42 h42 l8 -30 h-56" fill="#ffd166" stroke="#e8a900" stroke-width="4" stroke-linejoin="round"/>
     <circle cx="40" cy="76" r="7" fill="#1d2b53"/><circle cx="68" cy="76" r="7" fill="#1d2b53"/><path d="M36 42 h42" stroke="#e8a900" stroke-width="3"/>`),
  w("cochino", "cochino",
    `<ellipse cx="48" cy="56" rx="30" ry="20" fill="#ffb3c7"/><circle cx="76" cy="48" r="14" fill="#ffb3c7"/><ellipse cx="88" cy="52" rx="6" ry="5" fill="#ff8fb0"/>
     <path d="M70 36 l6 -10 6 10z" fill="#ff8fb0"/><circle cx="78" cy="44" r="2.5" fill="#1d2b53"/>
     <path d="M26 74 v10 M42 76 v10 M58 76 v10 M70 70 v14" stroke="#ff8fb0" stroke-width="6" stroke-linecap="round"/>
     <path d="M18 52 q-6 -6 0 -12 q6 4 0 10" stroke="#ff8fb0" stroke-width="3" fill="none"/>
     <circle cx="40" cy="50" r="4" fill="#8d5524" opacity="0.7"/><circle cx="56" cy="62" r="5" fill="#8d5524" opacity="0.7"/>`),
  w("perrito", "perrito",
    `<path d="M22 30 q-12 20 -2 36 q10 -4 12 -22z M78 30 q12 20 2 36 q-10 -4 -12 -22z" fill="#8d5524"/><circle cx="50" cy="48" r="26" fill="#d9a066"/>
     <ellipse cx="50" cy="58" rx="14" ry="11" fill="#f4d9b0"/><circle cx="40" cy="44" r="3" fill="#1d2b53"/><circle cx="60" cy="44" r="3" fill="#1d2b53"/>
     <ellipse cx="50" cy="55" rx="5" ry="3.5" fill="#1d2b53"/><path d="M46 66 q4 12 8 0z" fill="#ef476f"/>`),
  w("lechuga", "lechuga",
    `<circle cx="50" cy="54" r="30" fill="#80b918"/><path d="M26 54 q10 -14 24 -4 q14 -10 24 4 q-6 22 -24 26 q-18 -4 -24 -26z" fill="#aacc00"/>
     <path d="M50 30 v50 M38 44 q12 6 12 20 M62 44 q-12 6 -12 20" stroke="#55a630" stroke-width="2.5" fill="none"/>`),
];

/** @type {Record<string, string>} */
export const EXTRA_WORD_ART = Object.fromEntries(ENTRIES);
