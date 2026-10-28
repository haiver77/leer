# 5 — Plan: "Lalo y las Sílabas" — Words-Only, Guaranteed Spanish, Fewer Buttons, Richer Visuals

Implements `loops/5_specification.md` (AC-I1…AC-I4). All application code lives at
the workspace root; only this plan lives under `loops/`. Tech stack unchanged:
vanilla HTML/CSS/ES-module JS, no framework/bundler/deps, `localStorage`, PWA via
`sw.js` + `manifest.webmanifest`, Node's built-in test runner (no `package.json`).

---

## 1. Implementation plan (what changed, by file)

### D1 — Words-only practice & word-based level map

**`js/words.js`**
- Added a pure, data-derived band selector **`forBand({count, tiers, special})`**
  built on the existing tested helpers (`hardestConsonantTier`, `hasDigraph`,
  `hasClosedSyllable`). `special:false` → open-CV, non-digraph, non-tier-4 words
  of the given tiers; `special:true` → the "especiales" set (tier-4 / digraph /
  closed); `special:undefined` → tier filter only. This keeps the band
  definition in one place (used by `levels.js`), reusing the H2 ordering logic.
- Expanded the embedded fallbacks (`WORDS` 2-syll, `WORDS_3` 3-syll) so **every
  one of the 6 bands is non-empty even offline / `file://`** (tier-1/2/3 open +
  especiales for 2-syll; open + especiales for 3-syll). Fallback integrity
  (parts join to word, ordered by rank) preserved — verified by `words.test.js`.

**`js/levels.js`**
- **Removed** `isla-p/m/s/t/l/d`, `mixto`, `digrafos`, `cerradas`, the
  `CONSONANT_ISLANDS` table, and the **`import … from "./syllables.js"`**.
- Rebuilt `buildLevels()` to emit the 6 word bands (all `type:"word"`,
  `mode:"word"`), each with a `pool()` that calls `forBand(spec).map(w => w.word)`
  at call-time (so a late CSV load is reflected). Band order (easiest-first):
  `pal-2-abiertas-1` → `pal-2-abiertas-2` → `pal-2-abiertas-3` →
  `pal-2-especiales` → `pal-3-abiertas` → `pal-3-especiales`.
  `goal = min(5, poolSize)`. **Empty bands are skipped** so the unlock chain never
  breaks. `all/byId/firstLevelId/nextUnlock/isUnlocked/mapState/completeLevel`
  are unchanged in shape.
- New `artId`s per island, added to `art.js`.

**`js/game.js`**
- Removed the `import * as syllables`; added a tiny local non-repeating
  `pickRandom(pool, exclude)` so the loop no longer depends on `syllables.js`.
- Removed `isWordLevel()`; `itemPrompt()` always returns **"Di la palabra 😊"**;
  `nextItem()` always resolves `currentWord` via `words.byWord(next)`. `succeed()`
  scores the word (unchanged shape). The load-inventory re-render no longer gates
  on word-vs-syllable.
- Dashboard mastery denominator switched from `syllables.generate("all")` to the
  **set of inventory WORDS** (`words.forLevel("palabras") + forLevel("palabras-3")
  → .word`). Added `noSpanishVoice` to `dashboardStats()` (from `speech`).
- Onboarding model word changed `"Pa"` → `"pato"`.

**`js/syllables.js`**
- Trimmed to the two still-useful pure helpers **`pickRandom` + `titleCase`**.
  The CV matrix / `EXTRA_POOLS` / `generate()` practice pools are removed
  (superseded). The file still exists as a valid module so its pure logic stays
  testable; it is **no longer imported by any app-shell module** (only by
  `logic.test.js`).

**`index.html`**
- Removed the standalone `#syllable-card` play element — the **word view is the
  only card content**. Onboarding demo now shows a word (`pato`) via `.word-demo`.
- Welcome subtitle → "Toca la palabra, dila en voz alta y ¡celebra con Lalo!".
- Dashboard: "Sílabas dominadas" → **"Palabras dominadas"**; "Sílabas difíciles" →
  "Palabras difíciles"; the learning-order copy rewritten to describe **word
  families** (and that syllables are only the parts of a word).

**`js/main.js`**
- Dropped the `syllableCard` lookup + the syllable render branch in `renderPlay`
  (always renders the word view). Added a `replayNewWordEntrance()` that toggles
  `.word-enter` so the CSS entrance animation replays per new word.
- `ONBOARDING_TEXT` re-worded to card-tap ("Toca la tarjeta para oírla"); demo
  text now "pato". `CARD_THEMES` re-keyed to the new word-level ids. Map nodes get
  a `data-id` for per-family colour.

**`js/rewards.js`**
- `STICKER_CATALOG` re-pointed to the 6 new word-level ids + the kept milestone
  sticker. No entry references a removed level (reuses existing sticker art).

### D2 — Guaranteed Spanish TTS + recognition

**`js/speech.js`**
- Exported pure **`pickSpanishVoice(voices)`** (array in, no browser globals):
  preference `es-ES > es-MX > es-US > es-419 > any es-* (case/-/_ insensitive) >
  name~spanish/español > null`, with `localService`/`default` as an in-bucket
  tiebreak. Exported pure **`hasSpanishVoice(voices)`**.
- Added internal **`awaitVoices()`** (resolves on non-empty `getVoices()` OR
  `voiceschanged`, with a 1.5s timeout fallback). `speak()` is now async: it
  **awaits voices, re-picks per call**, sets `utter.lang` to the picked voice's
  lang (else `"es-ES"`), records a "no Spanish voice" flag when none exists, and
  still **never throws / always resolves**. Exported `noSpanishVoiceDetected()`
  for the dashboard. `SpeechRecognition.lang` stays `"es-ES"`; `normalize`,
  `classify`, `listen` unchanged.
- Dashboard notice (`#voice-notice`) added to `index.html` (hidden by default)
  and driven from `speech.noSpanishVoiceDetected()` in `renderDashboard`.

### D3 — Fewer buttons

- Removed `#listen-btn` (🔊 Escuchar) from `index.html` and its `click` wiring +
  element lookup in `main.js`. Play screen keeps only 🎤 Hablar (primary),
  ✅ ¡Lo dije! (self-confirm fallback), 🗺️ back-to-map, and a small "Siguiente"
  chip (allowed). Hear-word remains reachable via **card tap / Enter / Space / the
  `l` key / per-part tiles**; advance via **left-swipe / ArrowRight / the chip**.
  Onboarding 🔊 copy replaced with the card-tap affordance. No dead-ends.

### D4 — Richer visual design (CSS-only)

**`css/styles.css`**
- More vibrant, higher-contrast palette: deeper 3-stop background gradient
  (`--bg-top/--bg-mid/--bg-bottom`), saturated accents, darker ink. Darkened
  `--success`/`--near`/`--retry` so white text on them clears 4.5:1.
- Hero card (`.word-view`): layered shadows (`--shadow-deep` + accent ring),
  soft inner gradient over the family tint, a thicker **accent border tinted by
  the current family** (`--card-accent`/`--card-tint` set from `main.js`), and a
  **new-word entrance** keyframe (`word-enter`, ≤420ms). `.word-whole` and
  `.word-tile` now pick up the family accent with depth + hover/press.
- Map nodes: colourful **per-family** gradient fills (`--node-accent` per id),
  depth (shadow + ring + inner highlight), clear locked/unlocked/completed states,
  and gentle hover-lift / press / `node-pop` entrance.
- Short (<600ms) CSS animations for success feedback (`feedback-pop`), card
  entrance, map-node pop; existing mascot/confetti/screen transitions kept.
- **`prefers-reduced-motion`** strengthened to disable ALL the new entrance/pop/
  hover motion. **`prefers-contrast: more`** and **`forced-colors`** degrade the
  card, word tiles/whole, map nodes, and voice notice to solid, legible,
  high-contrast surfaces (no meaning carried by gradients). Dead `.syllable-card`
  / `#listen-btn` rules removed; landscape rules re-pointed to `.word-view`.

### Offline

- `sw.js` `CACHE_VERSION` bumped to **`lalo-silabas-v5.0.0`**. `./js/syllables.js`
  removed from the `SHELL` precache list (trimmed, no longer imported by the app).
  CSVs stay precached. Old `isla-*` `localStorage` progress keys become inert
  (ignored; unlock restarts from the new first level) — no migration, by design.

---

## 2. Row → band mapping (reference; derived at runtime from the CSVs)

| band | source filter | example words (from the shipped CSVs) |
|------|---------------|---------------------------------------|
| `pal-2-abiertas-1` | 2-syll, tier 1, open | mamá, mapa, mesa, pato, sopa, tela, loma, lupa |
| `pal-2-abiertas-2` | 2-syll, tier 2, open | dedo, dado, nido, luna, duna, niña, pino |
| `pal-2-abiertas-3` | 2-syll, tier 3, open | boca, casa, gato, rana, café, foca, jugo, rosa |
| `pal-2-especiales` | 2-syll, tier 4 / closed / digraph | taza, pozo, limón, pastel, jamón, gallo, pollo, perro |
| `pal-3-abiertas` | 3-syll, tiers 1–3, open | maleta, paloma, pelota, tomate, banana, camisa, conejo |
| `pal-3-especiales` | 3-syll, tier 4 / z / ll | cabeza, cereza, zapato, limones, semilla, gallina |

Order is derived purely from `words.js` helpers, so it inherits the tested
easiest-first pedagogy (tier → open-before-closed → 2-syll before 3-syll).

---

## 3. Deployment plan

- **Static hosting, unchanged.** Serve the workspace root over http(s)/localhost
  (or `file://` — the embedded fallback covers all 6 bands offline). No build step.
- **Ship:** publish the updated `index.html`, `css/styles.css`, `js/*.js`,
  `data/*.csv`, `manifest.webmanifest`, `sw.js`.
- **Cache bust:** `CACHE_VERSION = lalo-silabas-v5.0.0` — on next load the SW
  `activate` deletes stale caches and `clients.claim()`s, so installed copies pick
  up the refactor. CSVs + shell are re-precached; `syllables.js` is dropped from
  the shell list.
- **Rollback:** revert to the previous commit and restore `CACHE_VERSION`
  `v4.0.0`; no data migration is involved (progress keys are per-level and the old
  `isla-*` keys are simply ignored).

---

## 4. Verification

### Automated (run from the workspace root)

Commands:
```
node --test "js/*.test.js"
node --check js/words.js js/levels.js js/syllables.js js/speech.js js/game.js js/rewards.js js/art.js js/main.js sw.js
```

Outcomes:
- **`node --test "js/*.test.js"` → 93 tests, 93 pass, 0 fail.**
- **`node --check`** on every changed module → OK (no syntax errors).
- Extra cross-checks run during development (all passed):
  - every `levels.all()` level `artId` resolves in `art.js`; every
    `STICKER_CATALOG.artId` resolves.
  - every `main.js` `el("…")` id (56 of them) exists in `index.html`.
  - no app file references `#listen-btn`, `syllable-card`, `isla-*`, `EXTRA_POOLS`,
    `cvPool`, or `generate(` (only `logic.test.js` imports `syllables.js`, and only
    `pickRandom`/`titleCase`).

Test changes (superseded tests updated explicitly, not deleted silently):
- **`levels.test.js`** — rewritten for the word-only chain: asserts no
  `isla-*/mixto/digrafos/cerradas` ids (AC-I1.1); every level `type==="word"` with
  a non-empty pool of inventory words (AC-I1.2); band order consistent with
  `expectedTierKey`, 2-syll before 3-syll, open families easiest-first
  (AC-I1.3/I1.7); full unlock chain intact.
- **`speech.test.js`** (new) — `pickSpanishVoice` preference order, any-`es-*`
  fallback, name-match, null when none, `localService`/`default` tiebreak (never
  overriding a better bucket); `hasSpanishVoice` true/false.
- **`logic.test.js`** — removed the superseded `generate/cvPool/EXTRA_POOLS`
  tests; kept a `pickRandom` + `titleCase` test and the unchanged
  `normalize`/`classify` matcher tests.
- **`words.test.js`** — kept all iteration-4 tests; added `forBand` coverage
  (open-tier filter, especiales filter, open∪especiales = inventory & disjoint,
  defaults, 3-syll-only), loading the real CSVs first so bands are full.
- **`rewards.test.js`** — asserts every level has a sticker, no sticker points at a
  removed level, every non-milestone sticker points at a live level, milestone kept.
- **`progress.test.js` / `adultGate.test.js`** — unchanged (no touched signatures),
  still passing.

### Browser-only (cannot be auto-verified here — manual check in a browser)

These require a real browser / device and are flagged per the spec:
- **AC-I2 real TTS:** that Spanish playback actually *sounds* Spanish when an
  `es-*` voice is installed, and that the adult-dashboard notice appears when none
  is installed. The selection + predicate logic is unit-tested; the audio output
  and the voice-list timing (`voiceschanged`) need a browser. **Status: logic
  verified; audio/notice to be confirmed manually (e.g. disable Spanish voices in
  the OS to see the notice; install one to hear Spanish).**
- **AC-I4 contrast feel / animation / layout:** ≥4.5:1 contrast was targeted by
  construction (dark ink `#141a3a` on white ≈ 16:1; white on `--success #04b488`,
  `--near #c25c00`, `--retry #b3560a`, `--accent #ff2d78`, `--next #2f49d8` each
  ≥4.5:1; family node/card text is dark ink on light tint or white on a saturated
  accent). A formal contrast-ratio sweep + the reduced-motion / high-contrast /
  forced-colors fallbacks and the ≤600ms animations should be eyeballed in a
  browser. **Status: built to spec; visual confirmation + a contrast-tool pass
  pending.**
- **AC-I3 no dead-ends & H5/H6 parity:** the trimmed play screen at 320px /
  short-landscape, and keyboard (Enter/Space/`l`/ArrowRight) + gesture (tap /
  left-swipe) parity, should be exercised on-device. **Status: wiring verified
  (all element ids present, handlers intact); hands-on check pending.**

### Notes / decisions
- `localStorage` schema unchanged (`silabas:v2`); old `isla-*` progress keys are
  inert — no migration (acceptable for a kids' app).
- `color-mix(...)` and `forced-colors`/system colours are used in CSS — these are
  native CSS features, **not** a library, so the "no deps" rule holds. On engines
  without `color-mix`, the border/fill simply fall back to the solid accent.
- The embedded fallback was expanded so all 6 bands work offline; this keeps
  `buildLevels()`'s empty-band skip from ever firing with the shipped content.
