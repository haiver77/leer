// words.js — pedagogically-ordered word inventory loaded from CSV data files.
//
// Iteration 3 replaces the hard-coded `WORDS` array as the primary content
// source with two CSV files under /data (2- and 3-syllable words), ordered
// easiest-first by `difficulty_rank`. A small embedded fallback set keeps the
// app playable from file:// or before the inventory finishes loading (AC-G4.4).
//
// Pure, synchronous helpers (parseCsv, rowIntegrity, isOrderedByRank,
// partsMatchWord, byWord) are unit-testable under Node. The async loader
// (loadInventory) is only exercised in the browser / with an injected fetch.
//
// Each inventory item exposed to the game: { word, parts, artId, emoji,
//   syllableCount, rank }. `parts` are title-cased syllables that lowercase-
//   concatenate to the accent-free word.

/**
 * Embedded fallback catalog (two-syllable), used when the CSV files cannot be
 * fetched (file:// origin, offline before first SW cache, or parse failure).
 * Kept small but complete so the word level is never a dead-end (AC-G4.4).
 * @type {Array<{word: string, parts: string[], artId: string, emoji: string, syllableCount: number, rank: number}>}
 */
export const WORDS = [
  // Mirrors data/words-2syllables.csv (easiest-first) so every 2-syllable unit is >=9 words offline / file://.
  { word: "oso", parts: ["O", "So"], artId: "word-oso", emoji: "🐻", syllableCount: 2, rank: 1 },
  { word: "mamá", parts: ["Ma", "Má"], artId: "word-mama", emoji: "👩", syllableCount: 2, rank: 2 },
  { word: "masa", parts: ["Ma", "Sa"], artId: "word-masa", emoji: "🍞", syllableCount: 2, rank: 3 },
  { word: "mesa", parts: ["Me", "Sa"], artId: "word-mesa", emoji: "🍽️", syllableCount: 2, rank: 4 },
  { word: "mapa", parts: ["Ma", "Pa"], artId: "word-mapa", emoji: "🗺️", syllableCount: 2, rank: 5 },
  { word: "mula", parts: ["Mu", "La"], artId: "word-mula", emoji: "🐴", syllableCount: 2, rank: 6 },
  { word: "pala", parts: ["Pa", "La"], artId: "word-pala", emoji: "🪏", syllableCount: 2, rank: 7 },
  { word: "palo", parts: ["Pa", "Lo"], artId: "word-palo", emoji: "🥢", syllableCount: 2, rank: 8 },
  { word: "papá", parts: ["Pa", "Pá"], artId: "word-papa", emoji: "👨", syllableCount: 2, rank: 9 },
  { word: "pato", parts: ["Pa", "To"], artId: "word-pato", emoji: "🦆", syllableCount: 2, rank: 10 },
  { word: "pelo", parts: ["Pe", "Lo"], artId: "word-pelo", emoji: "💇", syllableCount: 2, rank: 11 },
  { word: "pila", parts: ["Pi", "La"], artId: "word-pila", emoji: "🔋", syllableCount: 2, rank: 12 },
  { word: "puma", parts: ["Pu", "Ma"], artId: "word-puma", emoji: "🐆", syllableCount: 2, rank: 13 },
  { word: "sala", parts: ["Sa", "La"], artId: "word-sala", emoji: "🛋️", syllableCount: 2, rank: 14 },
  { word: "sapo", parts: ["Sa", "Po"], artId: "word-sapo", emoji: "🐸", syllableCount: 2, rank: 15 },
  { word: "seta", parts: ["Se", "Ta"], artId: "word-seta", emoji: "🍄", syllableCount: 2, rank: 16 },
  { word: "sopa", parts: ["So", "Pa"], artId: "word-sopa", emoji: "🍲", syllableCount: 2, rank: 17 },
  { word: "tapa", parts: ["Ta", "Pa"], artId: "word-tapa", emoji: "🫙", syllableCount: 2, rank: 18 },
  { word: "tela", parts: ["Te", "La"], artId: "word-tela", emoji: "🧵", syllableCount: 2, rank: 19 },
  { word: "tomo", parts: ["To", "Mo"], artId: "word-tomo", emoji: "📚", syllableCount: 2, rank: 20 },
  { word: "loma", parts: ["Lo", "Ma"], artId: "word-loma", emoji: "⛰️", syllableCount: 2, rank: 21 },
  { word: "lupa", parts: ["Lu", "Pa"], artId: "word-lupa", emoji: "🔍", syllableCount: 2, rank: 22 },
  { word: "moto", parts: ["Mo", "To"], artId: "word-moto", emoji: "🏍️", syllableCount: 2, rank: 23 },
  { word: "dado", parts: ["Da", "Do"], artId: "word-dado", emoji: "🎲", syllableCount: 2, rank: 24 },
  { word: "dama", parts: ["Da", "Ma"], artId: "word-dama", emoji: "👩", syllableCount: 2, rank: 25 },
  { word: "dedo", parts: ["De", "Do"], artId: "word-dedo", emoji: "👆", syllableCount: 2, rank: 26 },
  { word: "duna", parts: ["Du", "Na"], artId: "word-duna", emoji: "🏜️", syllableCount: 2, rank: 27 },
  { word: "luna", parts: ["Lu", "Na"], artId: "word-luna", emoji: "🌙", syllableCount: 2, rank: 28 },
  { word: "nene", parts: ["Ne", "Ne"], artId: "word-nene", emoji: "👶", syllableCount: 2, rank: 29 },
  { word: "nido", parts: ["Ni", "Do"], artId: "word-nido", emoji: "🪹", syllableCount: 2, rank: 30 },
  { word: "niña", parts: ["Ni", "Ña"], artId: "word-nina", emoji: "👧", syllableCount: 2, rank: 31 },
  { word: "nudo", parts: ["Nu", "Do"], artId: "word-nudo", emoji: "🪢", syllableCount: 2, rank: 32 },
  { word: "pino", parts: ["Pi", "No"], artId: "word-pino", emoji: "🌲", syllableCount: 2, rank: 33 },
  { word: "mano", parts: ["Ma", "No"], artId: "word-mano", emoji: "🤚", syllableCount: 2, rank: 34 },
  { word: "mono", parts: ["Mo", "No"], artId: "word-mono", emoji: "🐵", syllableCount: 2, rank: 35 },
  { word: "piña", parts: ["Pi", "Ña"], artId: "word-pina", emoji: "🍍", syllableCount: 2, rank: 36 },
  { word: "ojo", parts: ["O", "Jo"], artId: "word-ojo", emoji: "👁️", syllableCount: 2, rank: 37 },
  { word: "uva", parts: ["U", "Va"], artId: "word-uva", emoji: "🍇", syllableCount: 2, rank: 38 },
  { word: "boca", parts: ["Bo", "Ca"], artId: "word-boca", emoji: "👄", syllableCount: 2, rank: 39 },
  { word: "bote", parts: ["Bo", "Te"], artId: "word-bote", emoji: "🛶", syllableCount: 2, rank: 40 },
  { word: "café", parts: ["Ca", "Fé"], artId: "word-cafe", emoji: "☕", syllableCount: 2, rank: 41 },
  { word: "casa", parts: ["Ca", "Sa"], artId: "word-casa", emoji: "🏠", syllableCount: 2, rank: 42 },
  { word: "cuna", parts: ["Cu", "Na"], artId: "word-cuna", emoji: "🛏️", syllableCount: 2, rank: 43 },
  { word: "foca", parts: ["Fo", "Ca"], artId: "word-foca", emoji: "🦭", syllableCount: 2, rank: 44 },
  { word: "gato", parts: ["Ga", "To"], artId: "word-gato", emoji: "🐱", syllableCount: 2, rank: 45 },
  { word: "gota", parts: ["Go", "Ta"], artId: "word-gota", emoji: "💧", syllableCount: 2, rank: 46 },
  { word: "jugo", parts: ["Ju", "Go"], artId: "word-jugo", emoji: "🧃", syllableCount: 2, rank: 47 },
  { word: "nube", parts: ["Nu", "Be"], artId: "word-nube", emoji: "☁️", syllableCount: 2, rank: 48 },
  { word: "rama", parts: ["Ra", "Ma"], artId: "word-rama", emoji: "🌿", syllableCount: 2, rank: 49 },
  { word: "rana", parts: ["Ra", "Na"], artId: "word-rana", emoji: "🐸", syllableCount: 2, rank: 50 },
  { word: "rosa", parts: ["Ro", "Sa"], artId: "word-rosa", emoji: "🌹", syllableCount: 2, rank: 51 },
  { word: "vaca", parts: ["Va", "Ca"], artId: "word-vaca", emoji: "🐮", syllableCount: 2, rank: 52 },
  { word: "bici", parts: ["Bi", "Ci"], artId: "word-bici", emoji: "🚲", syllableCount: 2, rank: 53 },
  { word: "bota", parts: ["Bo", "Ta"], artId: "word-bota", emoji: "🥾", syllableCount: 2, rank: 54 },
  { word: "cama", parts: ["Ca", "Ma"], artId: "word-cama", emoji: "🛏️", syllableCount: 2, rank: 55 },
  { word: "hoja", parts: ["Ho", "Ja"], artId: "word-hoja", emoji: "🍃", syllableCount: 2, rank: 56 },
  { word: "lobo", parts: ["Lo", "Bo"], artId: "word-lobo", emoji: "🐺", syllableCount: 2, rank: 57 },
  { word: "loro", parts: ["Lo", "Ro"], artId: "word-loro", emoji: "🦜", syllableCount: 2, rank: 58 },
  { word: "pavo", parts: ["Pa", "Vo"], artId: "word-pavo", emoji: "🦃", syllableCount: 2, rank: 59 },
  { word: "pera", parts: ["Pe", "Ra"], artId: "word-pera", emoji: "🍐", syllableCount: 2, rank: 60 },
  { word: "vela", parts: ["Ve", "La"], artId: "word-vela", emoji: "🕯️", syllableCount: 2, rank: 61 },
  { word: "cielo", parts: ["Cie", "Lo"], artId: "word-cielo", emoji: "🌤️", syllableCount: 2, rank: 62 },
  { word: "huevo", parts: ["Hue", "Vo"], artId: "word-huevo", emoji: "🥚", syllableCount: 2, rank: 63 },
  { word: "nieve", parts: ["Nie", "Ve"], artId: "word-nieve", emoji: "❄️", syllableCount: 2, rank: 64 },
  { word: "queso", parts: ["Que", "So"], artId: "word-queso", emoji: "🧀", syllableCount: 2, rank: 65 },
  { word: "pozo", parts: ["Po", "Zo"], artId: "word-pozo", emoji: "🕳️", syllableCount: 2, rank: 66 },
  { word: "taza", parts: ["Ta", "Za"], artId: "word-taza", emoji: "☕", syllableCount: 2, rank: 67 },
  { word: "pulpo", parts: ["Pul", "Po"], artId: "word-pulpo", emoji: "🐙", syllableCount: 2, rank: 68 },
  { word: "pastel", parts: ["Pas", "Tel"], artId: "word-pastel", emoji: "🍰", syllableCount: 2, rank: 69 },
  { word: "limón", parts: ["Li", "Món"], artId: "word-limon", emoji: "🍋", syllableCount: 2, rank: 70 },
  { word: "melón", parts: ["Me", "Lón"], artId: "word-melon", emoji: "🍈", syllableCount: 2, rank: 71 },
  { word: "diente", parts: ["Dien", "Te"], artId: "word-diente", emoji: "🦷", syllableCount: 2, rank: 72 },
  { word: "barco", parts: ["Bar", "Co"], artId: "word-barco", emoji: "🚢", syllableCount: 2, rank: 73 },
  { word: "carta", parts: ["Car", "Ta"], artId: "word-carta", emoji: "✉️", syllableCount: 2, rank: 74 },
  { word: "cerdo", parts: ["Cer", "Do"], artId: "word-cerdo", emoji: "🐷", syllableCount: 2, rank: 75 },
  { word: "falda", parts: ["Fal", "Da"], artId: "word-falda", emoji: "👗", syllableCount: 2, rank: 76 },
  { word: "fresa", parts: ["Fre", "Sa"], artId: "word-fresa", emoji: "🍓", syllableCount: 2, rank: 77 },
  { word: "jamón", parts: ["Ja", "Món"], artId: "word-jamon", emoji: "🍖", syllableCount: 2, rank: 78 },
  { word: "libro", parts: ["Li", "Bro"], artId: "word-libro", emoji: "📖", syllableCount: 2, rank: 79 },
  { word: "mango", parts: ["Man", "Go"], artId: "word-mango", emoji: "🥭", syllableCount: 2, rank: 80 },
  { word: "reloj", parts: ["Re", "Loj"], artId: "word-reloj", emoji: "⏰", syllableCount: 2, rank: 81 },
  { word: "tarta", parts: ["Tar", "Ta"], artId: "word-tarta", emoji: "🥧", syllableCount: 2, rank: 82 },
  { word: "tigre", parts: ["Ti", "Gre"], artId: "word-tigre", emoji: "🐯", syllableCount: 2, rank: 83 },
  { word: "guante", parts: ["Guan", "Te"], artId: "word-guante", emoji: "🧤", syllableCount: 2, rank: 84 },
  { word: "puerta", parts: ["Puer", "Ta"], artId: "word-puerta", emoji: "🚪", syllableCount: 2, rank: 85 },
  { word: "nariz", parts: ["Na", "Riz"], artId: "word-nariz", emoji: "👃", syllableCount: 2, rank: 86 },
  { word: "playa", parts: ["Pla", "Ya"], artId: "word-playa", emoji: "🏖️", syllableCount: 2, rank: 87 },
  { word: "coche", parts: ["Co", "Che"], artId: "word-coche", emoji: "🚗", syllableCount: 2, rank: 88 },
  { word: "gallo", parts: ["Ga", "Llo"], artId: "word-gallo", emoji: "🐓", syllableCount: 2, rank: 89 },
  { word: "pollo", parts: ["Po", "Llo"], artId: "word-pollo", emoji: "🍗", syllableCount: 2, rank: 90 },
  { word: "perro", parts: ["Pe", "Rro"], artId: "word-perro", emoji: "🐶", syllableCount: 2, rank: 91 },
  { word: "chapa", parts: ["Cha", "Pa"], artId: "word-chapa", emoji: "🔖", syllableCount: 2, rank: 92 },
  { word: "burro", parts: ["Bu", "Rro"], artId: "word-burro", emoji: "🫏", syllableCount: 2, rank: 93 },
  { word: "gorro", parts: ["Go", "Rro"], artId: "word-gorro", emoji: "🧢", syllableCount: 2, rank: 94 },
  { word: "leche", parts: ["Le", "Che"], artId: "word-leche", emoji: "🥛", syllableCount: 2, rank: 95 },
  { word: "silla", parts: ["Si", "Lla"], artId: "word-silla", emoji: "🪑", syllableCount: 2, rank: 96 },
  { word: "zorro", parts: ["Zo", "Rro"], artId: "word-zorro", emoji: "🦊", syllableCount: 2, rank: 97 },
];

/**
 * Embedded fallback catalog (three-syllable). Mirrors the easiest few rows of
 * data/words-3syllables.csv so the 3-syllable level works offline / file://.
 * @type {Array<{word: string, parts: string[], artId: string, emoji: string, syllableCount: number, rank: number}>}
 */
// Mirrors data/words-3syllables.csv so every 3-syllable band is >=10 offline /
// from file:// (AC-K2.5 / AC-K2.6) and so levels.js freezes goal === 10 for the
// 3-syllable bands even before the live CSV loads.
export const WORDS_3 = [
  // Mirrors data/words-3syllables.csv (easiest-first).
  { word: "maleta", parts: ["Ma", "Le", "Ta"], artId: "word-maleta", emoji: "🧳", syllableCount: 3, rank: 1 },
  { word: "paloma", parts: ["Pa", "Lo", "Ma"], artId: "word-paloma", emoji: "🕊️", syllableCount: 3, rank: 2 },
  { word: "pelito", parts: ["Pe", "Li", "To"], artId: "word-pelito", emoji: "💇", syllableCount: 3, rank: 3 },
  { word: "pelota", parts: ["Pe", "Lo", "Ta"], artId: "word-pelota", emoji: "⚽", syllableCount: 3, rank: 4 },
  { word: "pelusa", parts: ["Pe", "Lu", "Sa"], artId: "word-pelito", emoji: "🧶", syllableCount: 3, rank: 5 },
  { word: "pesita", parts: ["Pe", "Si", "Ta"], artId: "word-pelito", emoji: "🏋️", syllableCount: 3, rank: 6 },
  { word: "salita", parts: ["Sa", "Li", "Ta"], artId: "word-salida", emoji: "🚪", syllableCount: 3, rank: 7 },
  { word: "sopita", parts: ["So", "Pi", "Ta"], artId: "word-sopita", emoji: "🍲", syllableCount: 3, rank: 8 },
  { word: "tomate", parts: ["To", "Ma", "Te"], artId: "word-tomate", emoji: "🍅", syllableCount: 3, rank: 9 },
  { word: "patito", parts: ["Pa", "Ti", "To"], artId: "word-pato", emoji: "🐥", syllableCount: 3, rank: 10 },
  { word: "mamita", parts: ["Ma", "Mi", "Ta"], artId: "word-mamita", emoji: "👩", syllableCount: 3, rank: 11 },
  { word: "mesita", parts: ["Me", "Si", "Ta"], artId: "word-mesita", emoji: "🪑", syllableCount: 3, rank: 12 },
  { word: "paleta", parts: ["Pa", "Le", "Ta"], artId: "word-paleta", emoji: "🍭", syllableCount: 3, rank: 13 },
  { word: "palito", parts: ["Pa", "Li", "To"], artId: "word-palito", emoji: "🥢", syllableCount: 3, rank: 14 },
  { word: "papito", parts: ["Pa", "Pi", "To"], artId: "word-papito", emoji: "👨", syllableCount: 3, rank: 15 },
  { word: "patata", parts: ["Pa", "Ta", "Ta"], artId: "word-patata", emoji: "🥔", syllableCount: 3, rank: 16 },
  { word: "sapito", parts: ["Sa", "Pi", "To"], artId: "word-sapito", emoji: "🐸", syllableCount: 3, rank: 17 },
  { word: "dedito", parts: ["De", "Di", "To"], artId: "word-dedito", emoji: "👆", syllableCount: 3, rank: 18 },
  { word: "dominó", parts: ["Do", "Mi", "Nó"], artId: "word-domino", emoji: "🁢", syllableCount: 3, rank: 19 },
  { word: "pepino", parts: ["Pe", "Pi", "No"], artId: "word-pepino", emoji: "🥒", syllableCount: 3, rank: 20 },
  { word: "salada", parts: ["Sa", "La", "Da"], artId: "word-salada", emoji: "🥗", syllableCount: 3, rank: 21 },
  { word: "salida", parts: ["Sa", "Li", "Da"], artId: "word-salida", emoji: "🚪", syllableCount: 3, rank: 22 },
  { word: "lunita", parts: ["Lu", "Ni", "Ta"], artId: "word-lunita", emoji: "🌙", syllableCount: 3, rank: 23 },
  { word: "mañana", parts: ["Ma", "Ña", "Na"], artId: "word-manana", emoji: "🌅", syllableCount: 3, rank: 24 },
  { word: "moneda", parts: ["Mo", "Ne", "Da"], artId: "word-moneda", emoji: "🪙", syllableCount: 3, rank: 25 },
  { word: "nenita", parts: ["Ne", "Ni", "Ta"], artId: "word-nenita", emoji: "👧", syllableCount: 3, rank: 26 },
  { word: "piñata", parts: ["Pi", "Ña", "Ta"], artId: "word-pinata", emoji: "🪅", syllableCount: 3, rank: 27 },
  { word: "semana", parts: ["Se", "Ma", "Na"], artId: "word-semana", emoji: "📅", syllableCount: 3, rank: 28 },
  { word: "sonido", parts: ["So", "Ni", "Do"], artId: "word-sonido", emoji: "🔊", syllableCount: 3, rank: 29 },
  { word: "pañuelo", parts: ["Pa", "Ñue", "Lo"], artId: "word-panuelo", emoji: "🤧", syllableCount: 3, rank: 30 },
  { word: "abeja", parts: ["A", "Be", "Ja"], artId: "word-abeja", emoji: "🐝", syllableCount: 3, rank: 31 },
  { word: "amigo", parts: ["A", "Mi", "Go"], artId: "word-amigo", emoji: "🤝", syllableCount: 3, rank: 32 },
  { word: "oveja", parts: ["O", "Ve", "Ja"], artId: "word-oveja", emoji: "🐑", syllableCount: 3, rank: 33 },
  { word: "muñeca", parts: ["Mu", "Ñe", "Ca"], artId: "word-muneca", emoji: "🪆", syllableCount: 3, rank: 34 },
  { word: "banana", parts: ["Ba", "Na", "Na"], artId: "word-banana", emoji: "🍌", syllableCount: 3, rank: 35 },
  { word: "bebida", parts: ["Be", "Bi", "Da"], artId: "word-bebida", emoji: "🥤", syllableCount: 3, rank: 36 },
  { word: "bonita", parts: ["Bo", "Ni", "Ta"], artId: "word-bonita", emoji: "🌸", syllableCount: 3, rank: 37 },
  { word: "camisa", parts: ["Ca", "Mi", "Sa"], artId: "word-camisa", emoji: "👕", syllableCount: 3, rank: 38 },
  { word: "canela", parts: ["Ca", "Ne", "La"], artId: "word-canela", emoji: "🟤", syllableCount: 3, rank: 39 },
  { word: "cocina", parts: ["Co", "Ci", "Na"], artId: "word-conejo", emoji: "🍳", syllableCount: 3, rank: 40 },
  { word: "conejo", parts: ["Co", "Ne", "Jo"], artId: "word-conejo", emoji: "🐰", syllableCount: 3, rank: 41 },
  { word: "dinero", parts: ["Di", "Ne", "Ro"], artId: "word-dinero", emoji: "💰", syllableCount: 3, rank: 42 },
  { word: "fogata", parts: ["Fo", "Ga", "Ta"], artId: "word-fogata", emoji: "🔥", syllableCount: 3, rank: 43 },
  { word: "gatito", parts: ["Ga", "Ti", "To"], artId: "word-gato", emoji: "🐱", syllableCount: 3, rank: 44 },
  { word: "gusano", parts: ["Gu", "Sa", "No"], artId: "word-gusano", emoji: "🐛", syllableCount: 3, rank: 45 },
  { word: "jirafa", parts: ["Ji", "Ra", "Fa"], artId: "word-jirafa", emoji: "🦒", syllableCount: 3, rank: 46 },
  { word: "maceta", parts: ["Ma", "Ce", "Ta"], artId: "word-maleta", emoji: "🪴", syllableCount: 3, rank: 47 },
  { word: "nevera", parts: ["Ne", "Ve", "Ra"], artId: "word-salida", emoji: "🧊", syllableCount: 3, rank: 48 },
  { word: "ratita", parts: ["Ra", "Ti", "Ta"], artId: "word-rana", emoji: "🐭", syllableCount: 3, rank: 49 },
  { word: "sabana", parts: ["Sa", "Ba", "Na"], artId: "word-cuna", emoji: "🛏️", syllableCount: 3, rank: 50 },
  { word: "venada", parts: ["Ve", "Na", "Da"], artId: "word-salida", emoji: "🦌", syllableCount: 3, rank: 51 },
  { word: "abuelo", parts: ["A", "Bue", "Lo"], artId: "word-abuelo", emoji: "👴", syllableCount: 3, rank: 52 },
  { word: "cadena", parts: ["Ca", "De", "Na"], artId: "word-cadena", emoji: "⛓️", syllableCount: 3, rank: 53 },
  { word: "camino", parts: ["Ca", "Mi", "No"], artId: "word-camino", emoji: "🛤️", syllableCount: 3, rank: 54 },
  { word: "cometa", parts: ["Co", "Me", "Ta"], artId: "word-cometa", emoji: "🪁", syllableCount: 3, rank: 55 },
  { word: "corona", parts: ["Co", "Ro", "Na"], artId: "word-corona", emoji: "👑", syllableCount: 3, rank: 56 },
  { word: "gorila", parts: ["Go", "Ri", "La"], artId: "word-gorila", emoji: "🦍", syllableCount: 3, rank: 57 },
  { word: "helado", parts: ["He", "La", "Do"], artId: "word-helado", emoji: "🍦", syllableCount: 3, rank: 58 },
  { word: "pijama", parts: ["Pi", "Ja", "Ma"], artId: "word-pijama", emoji: "🛌", syllableCount: 3, rank: 59 },
  { word: "pirata", parts: ["Pi", "Ra", "Ta"], artId: "word-pirata", emoji: "🏴‍☠️", syllableCount: 3, rank: 60 },
  { word: "regalo", parts: ["Re", "Ga", "Lo"], artId: "word-regalo", emoji: "🎁", syllableCount: 3, rank: 61 },
  { word: "sirena", parts: ["Si", "Re", "Na"], artId: "word-sirena", emoji: "🧜‍♀️", syllableCount: 3, rank: 62 },
  { word: "tijera", parts: ["Ti", "Je", "Ra"], artId: "word-tijera", emoji: "✂️", syllableCount: 3, rank: 63 },
  { word: "vecino", parts: ["Ve", "Ci", "No"], artId: "word-vecino", emoji: "🏘️", syllableCount: 3, rank: 64 },
  { word: "familia", parts: ["Fa", "Mi", "Lia"], artId: "word-familia", emoji: "👨‍👩‍👧", syllableCount: 3, rank: 65 },
  { word: "juguete", parts: ["Ju", "Gue", "Te"], artId: "word-juguete", emoji: "🧸", syllableCount: 3, rank: 66 },
  { word: "ayuda", parts: ["A", "Yu", "Da"], artId: "word-ayuda", emoji: "🆘", syllableCount: 3, rank: 67 },
  { word: "cabeza", parts: ["Ca", "Be", "Za"], artId: "word-cabeza", emoji: "🗣️", syllableCount: 3, rank: 68 },
  { word: "cereza", parts: ["Ce", "Re", "Za"], artId: "word-cereza", emoji: "🍒", syllableCount: 3, rank: 69 },
  { word: "zapato", parts: ["Za", "Pa", "To"], artId: "word-zapato", emoji: "👟", syllableCount: 3, rank: 70 },
  { word: "payaso", parts: ["Pa", "Ya", "So"], artId: "word-payaso", emoji: "🤡", syllableCount: 3, rank: 71 },
  { word: "cazuela", parts: ["Ca", "Zue", "La"], artId: "word-cazuela", emoji: "🍲", syllableCount: 3, rank: 72 },
  { word: "limones", parts: ["Li", "Mo", "Nes"], artId: "word-limones", emoji: "🍋", syllableCount: 3, rank: 73 },
  { word: "montaña", parts: ["Mon", "Ta", "Ña"], artId: "word-montana", emoji: "⛰️", syllableCount: 3, rank: 74 },
  { word: "bandera", parts: ["Ban", "De", "Ra"], artId: "word-bandera", emoji: "🚩", syllableCount: 3, rank: 75 },
  { word: "campana", parts: ["Cam", "Pa", "Na"], artId: "word-campana", emoji: "🔔", syllableCount: 3, rank: 76 },
  { word: "escuela", parts: ["Es", "Cue", "La"], artId: "word-escuela", emoji: "🏫", syllableCount: 3, rank: 77 },
  { word: "pantera", parts: ["Pan", "Te", "Ra"], artId: "word-puma", emoji: "🐆", syllableCount: 3, rank: 78 },
  { word: "pescado", parts: ["Pes", "Ca", "Do"], artId: "word-pescado", emoji: "🐟", syllableCount: 3, rank: 79 },
  { word: "tortuga", parts: ["Tor", "Tu", "Ga"], artId: "word-tortuga", emoji: "🐢", syllableCount: 3, rank: 80 },
  { word: "ventana", parts: ["Ven", "Ta", "Na"], artId: "word-ventana", emoji: "🪟", syllableCount: 3, rank: 81 },
  { word: "cuaderno", parts: ["Cua", "Der", "No"], artId: "word-cuaderno", emoji: "📓", syllableCount: 3, rank: 82 },
  { word: "sombrero", parts: ["Som", "Bre", "Ro"], artId: "word-sombrero", emoji: "👒", syllableCount: 3, rank: 83 },
  { word: "manzana", parts: ["Man", "Za", "Na"], artId: "word-banana", emoji: "🍎", syllableCount: 3, rank: 84 },
  { word: "semilla", parts: ["Se", "Mi", "Lla"], artId: "word-semilla", emoji: "🌱", syllableCount: 3, rank: 85 },
  { word: "gallina", parts: ["Ga", "Lli", "Na"], artId: "word-gallina", emoji: "🐔", syllableCount: 3, rank: 86 },
  { word: "botella", parts: ["Bo", "Te", "Lla"], artId: "word-botella", emoji: "🍾", syllableCount: 3, rank: 87 },
  { word: "caballo", parts: ["Ca", "Ba", "Llo"], artId: "word-caballo", emoji: "🐴", syllableCount: 3, rank: 88 },
  { word: "ballena", parts: ["Ba", "Lle", "Na"], artId: "word-ballena", emoji: "🐋", syllableCount: 3, rank: 89 },
  { word: "cuchara", parts: ["Cu", "Cha", "Ra"], artId: "word-cuchara", emoji: "🥄", syllableCount: 3, rank: 90 },
  { word: "camello", parts: ["Ca", "Me", "Llo"], artId: "word-camello", emoji: "🐫", syllableCount: 3, rank: 91 },
  { word: "carrito", parts: ["Ca", "Rri", "To"], artId: "word-carrito", emoji: "🛒", syllableCount: 3, rank: 92 },
  { word: "cochino", parts: ["Co", "Chi", "No"], artId: "word-cochino", emoji: "🐖", syllableCount: 3, rank: 93 },
  { word: "galleta", parts: ["Ga", "Lle", "Ta"], artId: "word-galleta", emoji: "🍪", syllableCount: 3, rank: 94 },
  { word: "lechuga", parts: ["Le", "Chu", "Ga"], artId: "word-lechuga", emoji: "🥬", syllableCount: 3, rank: 95 },
  { word: "mochila", parts: ["Mo", "Chi", "La"], artId: "word-mochila", emoji: "🎒", syllableCount: 3, rank: 96 },
  { word: "perrito", parts: ["Pe", "Rri", "To"], artId: "word-perrito", emoji: "🐕", syllableCount: 3, rank: 97 },
  { word: "guitarra", parts: ["Gui", "Ta", "Rra"], artId: "word-guitarra", emoji: "🎸", syllableCount: 3, rank: 98 },
  { word: "chaqueta", parts: ["Cha", "Que", "Ta"], artId: "word-chaqueta", emoji: "🧥", syllableCount: 3, rank: 99 },
  { word: "estrella", parts: ["Es", "Tre", "Lla"], artId: "word-estrella", emoji: "⭐", syllableCount: 3, rank: 100 },
];

/**
 * Embedded fallback catalog (four-syllable, iteration 6 / AC-J2.3). Mirrors the
 * easiest rows of data/words-4syllables.csv so the 4-syllable levels work
 * offline / from file://.
 * @type {Array<{word: string, parts: string[], artId: string, emoji: string, syllableCount: number, rank: number}>}
 */
// Mirrors data/words-4syllables.csv so both 4-syllable bands are >=10 offline /
// from file:// and so levels.js freezes goal === 10 for them before the live
// CSV loads (AC-K2.5 / AC-K2.6).
export const WORDS_4 = [
  { word: "tomatito", parts: ["To", "Ma", "Ti", "To"], artId: "word-tomate", emoji: "🍅", syllableCount: 4, rank: 1 },
  { word: "pelotita", parts: ["Pe", "Lo", "Ti", "Ta"], artId: "word-pelota", emoji: "⚽", syllableCount: 4, rank: 2 },
  { word: "maletita", parts: ["Ma", "Le", "Ti", "Ta"], artId: "word-maleta", emoji: "🧳", syllableCount: 4, rank: 3 },
  { word: "limonada", parts: ["Li", "Mo", "Na", "Da"], artId: "word-limonada", emoji: "🍹", syllableCount: 4, rank: 4 },
  { word: "patineta", parts: ["Pa", "Ti", "Ne", "Ta"], artId: "word-patineta", emoji: "🛹", syllableCount: 4, rank: 5 },
  { word: "abanico", parts: ["A", "Ba", "Ni", "Co"], artId: "word-abanico", emoji: "🪭", syllableCount: 4, rank: 6 },
  { word: "caracola", parts: ["Ca", "Ra", "Co", "La"], artId: "word-caracola", emoji: "🐚", syllableCount: 4, rank: 7 },
  { word: "mariposa", parts: ["Ma", "Ri", "Po", "Sa"], artId: "word-mariposa", emoji: "🦋", syllableCount: 4, rank: 8 },
  { word: "mariquita", parts: ["Ma", "Ri", "Qui", "Ta"], artId: "word-mariquita", emoji: "🐞", syllableCount: 4, rank: 9 },
  { word: "panadera", parts: ["Pa", "Na", "De", "Ra"], artId: "word-panadera", emoji: "👩", syllableCount: 4, rank: 10 },
  { word: "pelícano", parts: ["Pe", "Lí", "Ca", "No"], artId: "word-pelicano", emoji: "🦩", syllableCount: 4, rank: 11 },
  { word: "telaraña", parts: ["Te", "La", "Ra", "Ña"], artId: "word-telarana", emoji: "🕸️", syllableCount: 4, rank: 12 },
  { word: "calabaza", parts: ["Ca", "La", "Ba", "Za"], artId: "word-calabaza", emoji: "🎃", syllableCount: 4, rank: 13 },
  { word: "payasito", parts: ["Pa", "Ya", "Si", "To"], artId: "word-payasito", emoji: "🤡", syllableCount: 4, rank: 14 },
  { word: "elefante", parts: ["E", "Le", "Fan", "Te"], artId: "word-elefante", emoji: "🐘", syllableCount: 4, rank: 15 },
  { word: "escalera", parts: ["Es", "Ca", "Le", "Ra"], artId: "word-escalera", emoji: "🪜", syllableCount: 4, rank: 16 },
  { word: "campanita", parts: ["Cam", "Pa", "Ni", "Ta"], artId: "word-campanita", emoji: "🔔", syllableCount: 4, rank: 17 },
  { word: "bicicleta", parts: ["Bi", "Ci", "Cle", "Ta"], artId: "word-bicicleta", emoji: "🚲", syllableCount: 4, rank: 18 },
  { word: "cocodrilo", parts: ["Co", "Co", "Dri", "Lo"], artId: "word-cocodrilo", emoji: "🐊", syllableCount: 4, rank: 19 },
  { word: "mantequilla", parts: ["Man", "Te", "Qui", "Lla"], artId: "word-mantequilla", emoji: "🧈", syllableCount: 4, rank: 20 },
  { word: "maravilla", parts: ["Ma", "Ra", "Vi", "Lla"], artId: "word-maravilla", emoji: "✨", syllableCount: 4, rank: 21 },
  { word: "chocolate", parts: ["Cho", "Co", "La", "Te"], artId: "word-chocolate", emoji: "🍫", syllableCount: 4, rank: 22 },
];

// Loaded inventory (filled by loadInventory). Null until a load is attempted.
let loaded2 = null;
let loaded3 = null;
let loaded4 = null;

/** Map a level id to the syllable count it practises. */
function syllableCountForLevel(levelId) {
  if (levelId === "palabras-4") return 4;
  if (levelId === "palabras-3") return 3;
  return 2;
}

/**
 * Title-case a single syllable, preserving accents (e.g. "má" -> "Má").
 * @param {string} s
 * @returns {string}
 */
function titleCaseSyllable(s) {
  if (!s) return s;
  return s.charAt(0).toLocaleUpperCase("es") + s.slice(1);
}

/**
 * Strip Spanish accents for comparison / keying (má -> ma, niño -> nino).
 * @param {string} s
 * @returns {string}
 */
function stripAccents(s) {
  return String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u0303\u0308]/g, "")
    .normalize("NFC");
}

// ---- Pedagogical ordering helpers (iteration 4, H2) -----------------------
// Pure, accent-insensitive helpers that make the "easiest-first" order
// machine-checkable. They operate on a word string OR an array of hyphen parts.

/** Spanish vowels (accent already stripped before these are consulted). */
const VOWELS = new Set(["a", "e", "i", "o", "u"]);

/**
 * Normalize a word-or-parts argument into a lowercase, accent-free word string.
 * Accepts "mapa", ["Ma","Pa"], or "ma-pa".
 * @param {string|string[]} wordOrParts
 * @returns {string}
 */
function toWordString(wordOrParts) {
  const raw = Array.isArray(wordOrParts)
    ? wordOrParts.join("")
    : String(wordOrParts || "").replace(/-/g, "");
  return stripAccents(raw).toLowerCase();
}

/**
 * The hardest (highest) consonant tier present in a word. Digraphs ch/ll/rr are
 * single tier-4 units; z,y,x,w are tier-4; f,b,v,c,k,g,j and single r are
 * tier-3; d,n,ñ are tier-2; m,p,l,s,t are tier-1; vowels are ignored. "qu"/"gu"
 * fold into the c/k/g family (tier-3). Returns 1 when no consonant is present.
 * Pure, accent-insensitive.
 * @param {string|string[]} wordOrParts
 * @returns {1|2|3|4}
 */
export function hardestConsonantTier(wordOrParts) {
  const w = toWordString(wordOrParts);
  let tier = 1;
  const bump = (t) => {
    if (t > tier) tier = t;
  };
  for (let i = 0; i < w.length; i++) {
    const ch = w[i];
    const two = w.slice(i, i + 2);
    // Digraphs are single tier-4 units; consume both letters.
    if (two === "ch" || two === "ll" || two === "rr") {
      bump(4);
      i++;
      continue;
    }
    if (VOWELS.has(ch)) continue; // vowels ignored (incl. the u in qu/gu)
    if (ch === "ñ") {
      bump(2);
      continue;
    }
    if ("zyxw".includes(ch)) {
      bump(4);
      continue;
    }
    if ("fbvckgjr".includes(ch)) {
      // single r reaches here (rr already consumed above as tier 4)
      bump(3);
      continue;
    }
    if ("dn".includes(ch)) {
      bump(2);
      continue;
    }
    if ("mplst".includes(ch)) {
      bump(1);
      continue;
    }
    // any other letter (accents already stripped): treat as tier 3, cautious.
    bump(3);
  }
  return tier;
}

/**
 * Whether a word contains a Spanish digraph ch, ll, or rr. Pure,
 * accent-insensitive.
 * @param {string|string[]} wordOrParts
 * @returns {boolean}
 */
export function hasDigraph(wordOrParts) {
  const w = toWordString(wordOrParts);
  return /ch|ll|rr/.test(w);
}

/**
 * Whether any syllable is NOT a bare open CV/V form — i.e. it ends in a
 * consonant (closed/inverse) or carries a consonant cluster (trabada). The
 * digraphs ch/ll/rr count as a single onset consonant, so "lla" stays open.
 * Operates on the hyphen-split parts (array, or a hyphenated string). Pure.
 * @param {string|string[]} parts
 * @returns {boolean}
 */
export function hasClosedSyllable(parts) {
  const list = Array.isArray(parts)
    ? parts
    : String(parts || "").split("-");
  for (const partRaw of list) {
    const p = stripAccents(String(partRaw).trim()).toLowerCase();
    if (!p) continue;
    // Collapse digraphs to a single placeholder consonant so the onset of e.g.
    // "lla"/"cha" is treated as one consonant, not a cluster.
    const s = p.replace(/ch|ll|rr/g, "c");
    // Must end in a vowel to be open (CV / V / CCV-with-vowel-end is allowed
    // only when the vowel is final; a trailing consonant => closed).
    const last = s[s.length - 1];
    if (!VOWELS.has(last)) return true; // ends in a consonant → closed/inverse
    // Detect an onset cluster: two consonants in a row before the vowel core.
    if (/[^aeiou]{2}/.test(s)) return true; // trabada (e.g. "pla", "tre")
  }
  return false;
}

/** Rank for syllable type: 0 = all-open CV/V, 1 = has a closed/cluster part. */
function syllableTypeRank(parts) {
  return hasClosedSyllable(parts) ? 1 : 0;
}

/**
 * Derive a comparable ordering key from a row's word + syllables, independent
 * of difficulty_rank: [consonantTier, syllableTypeRank, length, word]. Used by
 * the correctness test to verify the file order follows the pedagogical rule.
 * Accepts a raw CSV row ({word, syllables}) or a mapped item ({word, parts}).
 * Pure.
 * @param {{word?: string, syllables?: string, parts?: string[]}} row
 * @returns {[number, number, number, string]}
 */
export function expectedTierKey(row) {
  const word = String((row && row.word) || "");
  const parts = row && Array.isArray(row.parts)
    ? row.parts
    : String((row && row.syllables) || "").split("-");
  const tier = hardestConsonantTier(word);
  const typeRank = syllableTypeRank(parts);
  const length = stripAccents(word).length;
  const key = stripAccents(word).toLowerCase();
  return [tier, typeRank, length, key];
}

/**
 * Parse CSV text into an array of row objects keyed by the header row.
 * Pure. Handles a trailing newline, CRLF, blank lines, and simple
 * double-quoted fields (with "" escaping). No external dependency.
 * @param {string} text
 * @returns {Array<Record<string, string>>}
 */
export function parseCsv(text) {
  if (typeof text !== "string") return [];
  const lines = splitCsvLines(text).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = parseCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const row = {};
    for (let c = 0; c < header.length; c++) {
      row[header[c]] = cells[c] !== undefined ? cells[c] : "";
    }
    rows.push(row);
  }
  return rows;
}

/** Split CSV text into logical lines, respecting quoted newlines. */
function splitCsvLines(text) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      cur += ch;
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && text[i + 1] === "\n") i++; // consume CRLF pair
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.length > 0) out.push(cur);
  return out;
}

/** Parse a single CSV line into an array of cells. */
function parseCsvLine(line) {
  const cells = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      cells.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

/**
 * Validate a parsed CSV row (AC-G4.2): the syllable parts join to the word and
 * `syllable_count` matches the number of parts. Comparison ignores accents and
 * case. Pure.
 * @param {Record<string,string>} row
 * @returns {boolean}
 */
export function rowIntegrity(row) {
  if (!row || typeof row.word !== "string" || typeof row.syllables !== "string") {
    return false;
  }
  const parts = row.syllables.split("-").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return false;
  const count = Number(row.syllable_count);
  if (!Number.isInteger(count) || count !== parts.length) return false;
  const joined = stripAccents(parts.join("")).toLowerCase();
  const word = stripAccents(row.word).toLowerCase();
  return joined === word;
}

/**
 * Whether rows are ordered by non-decreasing `difficulty_rank` (AC-G4.2).
 * Accepts either raw CSV rows (`difficulty_rank`) or mapped items (`rank`).
 * Pure.
 * @param {Array<Record<string, any>>} rows
 * @returns {boolean}
 */
export function isOrderedByRank(rows) {
  if (!Array.isArray(rows)) return false;
  let prev = -Infinity;
  for (const r of rows) {
    const rank = Number(r.difficulty_rank !== undefined ? r.difficulty_rank : r.rank);
    if (!Number.isFinite(rank)) return false;
    if (rank < prev) return false;
    prev = rank;
  }
  return true;
}

/**
 * Map a parsed CSV row into a game inventory item.
 * @param {Record<string,string>} row
 * @returns {{word: string, parts: string[], artId: string, emoji: string, syllableCount: number, rank: number}}
 */
function rowToItem(row) {
  const parts = row.syllables
    .split("-")
    .map((p) => p.trim())
    .filter(Boolean)
    .map(titleCaseSyllable);
  return {
    word: row.word,
    parts,
    artId: row.art_id || "",
    emoji: row.emoji || "",
    syllableCount: Number(row.syllable_count) || parts.length,
    rank: Number(row.difficulty_rank) || 0,
  };
}

/**
 * Load both CSV inventory files once at startup and cache them. On any fetch
 * or parse failure the embedded fallback stays in effect (AC-G4.4). Safe to
 * call more than once (later calls re-fetch and refresh the cache).
 * @param {{fetchImpl?: typeof fetch, base?: string}} [opts]
 * @returns {Promise<{two: object[], three: object[], four: object[]}>}
 */
export async function loadInventory(opts = {}) {
  const fetchImpl =
    opts.fetchImpl || (typeof fetch === "function" ? fetch.bind(globalThis) : null);
  const base = opts.base || "./data/";
  if (!fetchImpl) {
    // No fetch available (e.g. plain Node without the flag): keep fallbacks.
    return {
      two: forLevel("palabras"),
      three: forLevel("palabras-3"),
      four: forLevel("palabras-4"),
    };
  }

  const two = await loadOne(fetchImpl, `${base}words-2syllables.csv`);
  const three = await loadOne(fetchImpl, `${base}words-3syllables.csv`);
  const four = await loadOne(fetchImpl, `${base}words-4syllables.csv`);

  if (two && two.length) loaded2 = two;
  if (three && three.length) loaded3 = three;
  if (four && four.length) loaded4 = four;

  return {
    two: forLevel("palabras"),
    three: forLevel("palabras-3"),
    four: forLevel("palabras-4"),
  };
}

/** Fetch + parse a single CSV file into items; returns null on any failure. */
async function loadOne(fetchImpl, url) {
  try {
    const res = await fetchImpl(url);
    if (!res || !res.ok) return null;
    const text = await res.text();
    const rows = parseCsv(text).filter(rowIntegrity);
    if (!rows.length) return null;
    return rows.map(rowToItem);
  } catch (_e) {
    return null;
  }
}

/** Whether the live inventory has been loaded for a given count. */
export function isLoaded(syllableCount = 2) {
  if (syllableCount === 4) return Boolean(loaded4);
  if (syllableCount === 3) return Boolean(loaded3);
  return Boolean(loaded2);
}

/**
 * Return the word list for a word level. Served from the loaded CSV inventory
 * when available, otherwise from the embedded fallback (AC-G4.1/G4.4). Returns
 * a defensive copy so callers can't mutate the cache.
 * @param {string} [levelId]
 * @returns {Array<{word: string, parts: string[], artId: string, emoji: string, syllableCount: number, rank: number}>}
 */
export function forLevel(levelId = "palabras") {
  const count = syllableCountForLevel(levelId);
  const live = count === 4 ? loaded4 : count === 3 ? loaded3 : loaded2;
  const fallback = count === 4 ? WORDS_4 : count === 3 ? WORDS_3 : WORDS;
  const source = live && live.length ? live : fallback;
  return source.map((w) => ({ ...w, parts: [...w.parts] }));
}

/**
 * Look up a word entry by its word string across both inventories (and the
 * embedded fallbacks). Accent/case-insensitive.
 * @param {string} word
 * @returns {object|null}
 */
export function byWord(word) {
  const key = stripAccents(String(word)).toLowerCase();
  const pools = [loaded2, loaded3, loaded4, WORDS, WORDS_3, WORDS_4];
  for (const pool of pools) {
    if (!pool) continue;
    const found = pool.find((w) => stripAccents(w.word).toLowerCase() === key);
    if (found) return { ...found, parts: [...found.parts] };
  }
  return null;
}

/**
 * Filter a word level's inventory into a pedagogical "band" (iteration 5, D1).
 * Pure selector built on the already-tested helpers (`hardestConsonantTier`,
 * `hasDigraph`, `hasClosedSyllable`). Used by `levels.js` so the word-based
 * level map is derived from the CSV data, not hand-listed twice.
 *
 * @param {{count?: number, tiers?: Iterable<number>, special?: boolean}} spec
 *   count   2 (default) or 3 — which inventory to draw from.
 *   tiers   consonant tiers to include (1..4). Defaults to all tiers.
 *   kind    "closed" → closed/cluster words without a digraph; "digraph" →
 *           digraph words plus open tier-4 (z/y) words. closed ∪ digraph ==
 *           special:true. Takes precedence over `special`.
 *   chunk   {i, of} → the i-th (0-based) of `of` contiguous near-equal parts of
 *           the selection (rank order preserved).
 *   special when true  → keep only "especiales": tier-4 (digraph/z/y/x/w) OR
 *                        closed-syllable words (the hard zone).
 *           when false → keep only the "easy" open-CV, non-digraph words of the
 *                        requested tiers.
 *           when undefined → no special/open filtering (tier filter only).
 * @returns {Array<{word: string, parts: string[], artId: string, emoji: string, syllableCount: number, rank: number}>}
 */
export function forBand(spec = {}) {
  const count = spec.count === 4 ? 4 : spec.count === 3 ? 3 : 2;
  const levelId =
    count === 4 ? "palabras-4" : count === 3 ? "palabras-3" : "palabras";
  const tierSet = spec.tiers ? new Set([...spec.tiers]) : null;
  const items = forLevel(levelId);
  const selected = items.filter((it) => {
    const tier = hardestConsonantTier(it.parts);
    if (tierSet && !tierSet.has(tier)) return false;
    if (spec.kind === "closed") {
      // "cerradas": closed / cluster syllables without a ch/ll/rr digraph.
      return hasClosedSyllable(it.parts) && !hasDigraph(it.parts);
    }
    if (spec.kind === "digraph") {
      // "dígrafos": any ch/ll/rr word, plus open tier-4 (z/y/x/w) words.
      return (
        hasDigraph(it.parts) ||
        (tier === 4 && !hasClosedSyllable(it.parts))
      );
    }
    if (spec.special === true) {
      // "especiales": the hard words — tier-4 (digraph/z/y/x/w) or closed.
      return tier === 4 || hasDigraph(it.parts) || hasClosedSyllable(it.parts);
    }
    if (spec.special === false) {
      // "fáciles": open-CV, non-digraph, non-tier-4 words only.
      return tier !== 4 && !hasDigraph(it.parts) && !hasClosedSyllable(it.parts);
    }
    return true;
  });
  return applyChunk(selected, spec.chunk);
}

/**
 * Take the i-th (0-based) of `of` contiguous, near-equal parts of an already
 * ordered list. Parts never overlap and their union is the whole list; earlier
 * parts get the extra item when the length doesn't divide evenly. Pure.
 * @param {Array} list
 * @param {{i: number, of: number}} [chunk]
 * @returns {Array}
 */
function applyChunk(list, chunk) {
  if (!chunk || !Number.isInteger(chunk.of) || chunk.of < 2) return list;
  const n = list.length;
  const base = Math.floor(n / chunk.of);
  const extra = n % chunk.of;
  const i = Math.max(0, Math.min(chunk.of - 1, chunk.i | 0));
  const start = i * base + Math.min(i, extra);
  const size = base + (i < extra ? 1 : 0);
  return list.slice(start, start + size);
}

/**
 * Validate that an entry's parts concatenate to its word (accent/case
 * insensitive). Exposed for tests / integrity checks.
 * @param {{word: string, parts: string[]}} entry
 * @returns {boolean}
 */
export function partsMatchWord(entry) {
  if (!entry || !Array.isArray(entry.parts)) return false;
  const joined = stripAccents(entry.parts.join("")).toLowerCase();
  return joined === stripAccents(String(entry.word)).toLowerCase();
}
