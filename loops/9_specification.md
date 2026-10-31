# 9 — Specification: "Lalo y las Sílabas" — Más llamativa e interesante (personaje, variedad y motivación a largo plazo)

Evolves `8_specification.md`. Iterations 1–8 shipped a functional, polished,
offline‑first, accessible Spanish word‑reading game (Customer Review 8.5/10):
words‑only practice with per‑word syllable tiles, a 2→3→4 world map with staged
unlocks, guaranteed Spanish TTS + adult voice picker + auto‑read toggle, lenient
`es-ES` auto‑listen (no‑tap mic), configurable words‑per‑level, rewards/sticker
book, mastery + adult dashboard, onboarding, very‑young text‑free mode, adult
gate, daily goal, a visible reactive Lalo companion, an improved celebration,
and a grown vocabulary (85 / 80 / 52 words).

Iteration 9 is **purely about appeal and long‑term interest for 3–6 year‑olds** —
turning "a correct practice tool" into "something the child wants to come back
to". It takes eight demands from `9_input.md`, grouped and prioritized. **D1, D2,
D3 are mandatory this round; D4–D8 are included and specified, with D7/D8 lowest
priority.**

Everything accepted in iterations 1–8 is carried forward unless this document
explicitly supersedes it. This iteration **does not change the tech stack** (it
stays vanilla, buildless, offline‑first PWA), **does not change the pedagogy or
learning order** (whole words; syllables only as decoding aid), and **does not
grow the vocabulary** (grown in iter 8). All existing a11y constraints hold
(≥56px targets, ≥4.5:1 contrast, `prefers-reduced-motion` / `prefers-contrast` /
`forced-colors`).

---

## Overview & Goals

Lalo is a free, private, offline‑first Spanish word‑reading game for young
children. By iteration 8 the core loop is frictionless and correct. Iteration 9
adds the three pillars of long‑term stickiness for small children:

1. **Ownership of the character** — the child personalizes Lalo (color +
   accessories) and unlocks more items by playing (D1), and Lalo feels alive
   (blinks, reacts to new words, dozes when idle) (D2).
2. **Variety of play** — at least one new mini‑game mode over the same words/art,
   so sessions do not feel identical (D3).
3. **Something that grows** — a visible, persistent "Jardín de Lalo" that fills
   up with what the child earns, giving a reason to return even after the map is
   complete (D4).

Secondary polish makes the world feel richer: themed backgrounds per word family
(D5), a path‑style map (D6), a voice preview in the adult panel (D7), and
optional soft background music (D8).

Non‑goals unchanged: 100% vanilla, buildless, offline‑first, private, free, no
backend, no accounts, no tracking, no new vocabulary, no pedagogy change.

---

## Superseded / changed from iteration 8 (explicit — not silently dropped)

- **Lalo mascot is static per state (4 states).** Lalo gains personalization
  layers (color + accessory SVG layers over the same `viewBox`) and new reactive
  states (blink, surprise on new word, sleeping/idle‑waiting). The 4 existing
  states (idle/cheer/encourage/model) remain and keep their meaning (D1/D2).
- **Single global background gradient on the game screen.** Replaced by a
  per‑word‑family themed background/scene, still ≥4.5:1 text contrast (D5).
- **Map is a grid of buttons (`.map-grid`).** Re‑presented as a path/trail Lalo
  walks along, preserving every node's locked/unlocked/completed state, family
  colors, ≥56px targets, and keyboard order (D6).
- **Only one practice mode ("mira la palabra y dila").** At least one additional
  mode is added (D3), without breaking the success→advance→read micro‑loop.
- **Voice picker (`#voice-select`) had no preview (AC‑K3.5 left unwired).** Now
  previews a short sample word in the chosen voice on change (D7).

Everything else from iterations 1–8 remains in force: words‑only practice; the
per‑word syllable part tiles; guaranteed Spanish TTS + the adult "no Spanish
voice" notice; the adult voice picker; the auto‑read toggle; the no‑tap
auto‑listen loop and its retained self‑confirm fallback (no `#confirm-btn`);
configurable words‑per‑level (5–20, default 10); lenient `es-ES` recognition;
keyboard + gesture parity (tap = read, left‑swipe / `ArrowRight` = next,
right‑swipe = repeat); the 2→3→4 unlock chain; rewards/sticker book; dashboard
mastery; onboarding; very‑young text‑free mode; adult gate; daily goal; the
grown vocabulary (85/80/52); full offline PWA; no dead‑ends / no fail states;
reduced‑motion / high‑contrast / forced‑colors fallbacks.

---

## Functional Specification

### A. Roles & key flows

- **Child (primary):** picks an unlocked node on Lalo's path, plays a session
  that may use one of several mini‑game modes over the same words/art, earns
  stars/stickers, watches the Jardín de Lalo grow, and **dresses up Lalo** in the
  armario. Never sees settings; never hits a dead‑end or fail state. No reading
  required to personalize (icon/tap driven; very‑young mode compatible).
- **Adult (secondary):** passes the adult gate to reach the dashboard; keeps all
  iter‑7/8 controls (difficulty, very‑young, auto‑read, voice, words‑per‑level,
  reset) and gains **voice preview on selection** (D7) and a **background‑music
  toggle** (D8, default OFF).

**New map entry points (map top bar):** alongside "Álbum de pegatinas" (🏅) and
"Para adultos" (⚙️), add a **"Armario de Lalo"** button (D1) and the **Jardín de
Lalo** either as its own entry or integrated into the path/overview (D4).

### B. Carried‑forward acceptance criteria (keep — do not regress)

All iteration 1–8 acceptance criteria this document does not explicitly supersede
remain in force, including: words‑only practice; the part tiles; guaranteed
Spanish TTS + adult notice; the voice picker (AC‑K3) and auto‑read toggle
(AC‑K7); the no‑tap auto‑listen loop (AC‑L2) and retained self‑confirm fallback
with no `#confirm-btn` (AC‑L1); configurable words‑per‑level (AC‑L3); lenient
recognition; keyboard + gesture parity; the ordered 2→3→4 map with staged
unlocks; stickers; dashboard mastery; the visible Lalo companion (AC‑K4); the
improved success animation (AC‑K5); the success→advance→read micro‑loop (AC‑K6);
the collapsed/transient `#feedback` region (AC‑K8); the +30/category vocabulary
(AC‑L4); offline; and all `words.js` / `levels.js` pure helpers and their tests.

### C. New / changed features for iteration 9

#### AC‑M1 — Personalizar a Lalo (colección) (D1) — MANDATORY
- **AC‑M1.1 (armario screen):** A new **"Armario de Lalo"** screen is reachable
  from a new icon button in the map top bar (`#map-wardrobe-btn`, 🎨/👕), next to
  stickers and adults. It has a quiet back‑to‑map control, follows the existing
  screen/header conventions, and is keyboard‑navigable.
- **AC‑M1.2 (customizable aspects):** The child can change at minimum **Lalo's
  body color** and add **accessories** (e.g. sombrero, gafas, lazo, capa).
  Accessories are additional inline‑SVG layers drawn over the **same `viewBox`
  (0 0 120 120)** as the existing `LALO_SVG` in `js/mascot.js`; color is applied
  by parameterizing the body fill/stroke. Options render as tappable swatches /
  icon tiles (no text required; very‑young compatible).
- **AC‑M1.3 (unlock by progress):** Color and accessory items are **unlocked by
  progress** — completing levels and/or crossing star milestones grants new
  items. A small, pure catalog maps items → unlock conditions (reusing existing
  signals: `progress.levels[...]completed`, `progress.stars`, star milestones).
  A base set is **unlocked from first run** so the armario is never empty.
- **AC‑M1.4 (locked = silhouette):** Locked items appear as a **silhouette/locked
  tile**, consistent with how unearned stickers render today (`rewards.js` /
  sticker grid pattern). Locked tiles are not selectable; an optional subtle hint
  (icon only) may indicate how to unlock, with no dead‑end.
- **AC‑M1.5 (persist + apply everywhere):** The child's chosen color + equipped
  accessories **persist** via `progress.js` and the customized Lalo appears on
  **every screen where Lalo shows** (welcome, map/path, game companion, summary,
  armature preview). Equipping/removing persists immediately.
- **AC‑M1.6 (pure + testable):** The item catalog and "which items are unlocked
  for a given progress state" and "is this selection valid (only unlocked items
  equippable)" are **pure functions** (no DOM/storage), unit‑tested. The default
  equipped set is valid against a first‑run state.
- **AC‑M1.7 (no regression):** The game‑screen companion stays decorative
  (`aria-hidden`, `pointer-events:none`) even when customized; customization
  never changes hit targets, never covers word/tiles/buttons/feedback.

#### AC‑M2 — Lalo con más vida y reacciones (D2) — MANDATORY
- **AC‑M2.1 (extended states):** `js/mascot.js` gains at least three behaviors
  beyond the 4 existing states: **(a) random blink** while at rest, **(b) a
  surprise/curiosity reaction when a new word is presented**, and **(c) a
  sleeping/"esperando" pose after a period of no interaction**. The original
  `STATES` (idle/cheer/encourage/model) and their meanings are unchanged; the new
  behaviors are additive (e.g. new state classes `blink`/`surprise`/`sleeping`
  and/or a CSS blink loop on the idle pose).
- **AC‑M2.2 (CSS‑driven + reduced motion):** All new animation is **CSS‑driven**
  (as today) and **degrades to a static expressive pose** under
  `prefers-reduced-motion` (blink loop stops, sleeping is shown as a calm static
  pose, surprise is a static expressive frame). No JS animation loops for motion.
- **AC‑M2.3 (surprise on new word):** When a new word is presented (`nextItem()`
  in `game.js`), Lalo briefly plays the **surprise** reaction, then settles into
  its normal play behavior and the existing read→auto‑listen sequence (AC‑L2) is
  **unchanged** — the reaction must not delay or break auto‑read/auto‑listen
  ordering. Testable at the state‑machine level: presenting a new word triggers
  one surprise reaction request before/alongside the model request, without
  adding extra reads or listens.
- **AC‑M2.4 (idle → sleeping):** After a tunable idle period (no tap / key /
  mic result; cadence tuned in `9_plan.md`) with the child on the play screen,
  Lalo transitions to the **sleeping** pose; any interaction (tap, key, new word,
  success) wakes him. The idle timer is cancelled on navigation and never fires
  outside `phase === "play"`. Bounded — no runaway timers (reuse the token/cancel
  pattern already used for auto‑listen).
- **AC‑M2.5 (no stolen taps / no obscuring):** Lalo keeps `aria-hidden` +
  `pointer-events:none` on the game companion; new reactions never steal a tap
  meant for the card and never cover the word, tiles, buttons, or feedback.

#### AC‑M3 — Variedad de mini‑juegos (modos de práctica) (D3) — MANDATORY
- **AC‑M3.1 (≥1 new mode):** Add **at least one** additional practice mode over
  the **same vocabulary + art** (no new content). Implement **one or two** of:
  - **Emparejar palabra ↔ dibujo** — show the word and several art tiles; the
    child taps the dibujo that matches (or vice‑versa).
  - **Elegir la palabra correcta** — show a dibujo and 2–3 words; the child taps
    the correct word.
  - **Completar la sílaba que falta** — show the word with one empty syllable
    (`pa‑__`) and 2–3 syllable options; the child taps the correct one (reuses
    the existing per‑word syllable split).
  The chosen mode(s) are recorded in `9_plan.md`.
- **AC‑M3.2 (mode selection):** Mode selection is **child‑appropriate** — either
  a simple, icon‑based chooser suitable for 3–6 year‑olds, **or** automatic
  alternation within a level to give variety. The default behavior (which, and
  how chosen/rotated) is recorded in `9_plan.md`; it must not require reading.
- **AC‑M3.3 (micro‑loop intact):** A new mode's success still flows through the
  existing **success → advance → read** micro‑loop (AC‑K6) and the reward path
  (stars/streak/daily‑goal/stickers) fires per correct answer exactly as today.
  The read‑and‑say mode and auto‑listen loop (AC‑L2) remain available/unchanged.
- **AC‑M3.4 (success/outcome mapping):** Each mode defines a clear correct/near/
  miss outcome that maps onto the existing `succeed()` / encouragement paths
  (tap‑based modes use `verified:false` self‑confirm‑style success since there is
  no mic match; the say‑it mode keeps `verified:true` on mic match). Mastery
  semantics (verified‑correct for mastery) are **unchanged**.
- **AC‑M3.5 (a11y + no dead‑ends):** New modes honor keyboard operation, ≥56px
  targets, ≥4.5:1 contrast, read‑aloud of the prompt word, and never dead‑end
  (always a way to progress; wrong taps encourage + retry, never fail). The
  option generation (distractors) is **pure + testable**: given a target word
  and a pool, it returns N distinct, plausible, non‑duplicate options including
  the correct one.
- **AC‑M3.6 (very‑young mode):** In very‑young (text‑free) mode, text‑dependent
  modes (e.g. "elegir la palabra correcta") either adapt to art‑only or are
  skipped in favor of a picture‑based mode, so the mode set is always playable
  without text.

#### AC‑M4 — Jardín de Lalo: progreso acumulativo que crece (D4)
- **AC‑M4.1 (visible to the child):** A persistent **"Jardín de Lalo"** is
  visible to the **child** (not only in the adult dashboard) — reachable from the
  map (own entry and/or shown on the path overview) — that **fills with elements**
  (árboles, estrellas, flores, objetos) as the child earns stars/stickers/levels.
- **AC‑M4.2 (grows with earnings, persistent):** The garden's contents are
  **derived from persistent progress** (stars, stickers earned, levels
  completed) via a **pure catalog + rule** (reusing `js/rewards.js` — anchor
  garden elements to star milestones and/or `levelId` completion, mirroring the
  sticker catalog pattern). It persists across sessions and only grows.
- **AC‑M4.3 (reason to return past 100%):** Because elements are anchored to
  **star milestones** (which keep accruing via `MILESTONE_EVERY` / total stars),
  there remains something to earn **after the map is fully completed** — replaying
  levels still accrues stars that can unlock remaining garden elements.
- **AC‑M4.4 (pure + testable):** "Which garden elements are unlocked for a given
  progress state" is a **pure function** over `{ stars, stickers, levels }`,
  unit‑tested (first‑run shows a modest base; crossing a milestone/level reveals
  the expected element; already‑unlocked elements never disappear).
- **AC‑M4.5 (a11y):** Garden art is inline SVG, decorative where appropriate
  (`aria-hidden`) with an accessible summary label (e.g. "Jardín de Lalo: N
  elementos"); animation (if any) respects `prefers-reduced-motion`.

#### AC‑M5 — Fondos / escenas temáticas por familia de palabras (D5)
- **AC‑M5.1 (themed backgrounds):** The game screen's single background gradient
  is replaced by a **per‑word‑family themed background** (e.g. playa, bosque,
  espacio) chosen from the current level's band/family. Families already carry a
  color in the map/cards; this extends that theme system to the play background.
- **AC‑M5.2 (contrast preserved):** Text (word, tiles, feedback) keeps **≥4.5:1
  contrast** over every themed background (verified; a scrim/overlay behind text
  is acceptable). The theme map (band → theme) is a small pure lookup, testable
  for completeness (every band maps to a defined theme).
- **AC‑M5.3 (optional ambient, reduced‑motion off):** Optional subtle ambient
  elements (drifting clouds, floating particles) may be added **purely in
  CSS/inline SVG**; they are **disabled** under `prefers-reduced-motion` and never
  capture pointer events or obscure content.

#### AC‑M6 — El mapa como camino (D6)
- **AC‑M6.1 (path layout):** "El mapa de Lalo" is re‑presented as a **sendero /
  camino** of connected nodes (a trail) rather than a plain grid, so progress
  reads at a glance. Lalo (the customized one) is shown at the current position
  on the path.
- **AC‑M6.2 (state preserved):** Each node still shows its
  **locked / unlocked / completed** state (and best stars), keeps **family
  colors**, ≥56px touch targets, the `role="list"` semantics (or an equivalent
  accessible structure), and **current keyboard navigation order** (first→last).
  `levels.mapState()` remains the single source of node state; only the rendering
  changes (no change to unlock logic).
- **AC‑M6.3 (responsive):** The path layout is responsive (phone portrait →
  tablet/desktop) and scrollable when it exceeds the viewport; no node becomes
  unreachable by pointer or keyboard.

#### AC‑M7 — Preview de voz en el panel de adultos (D7)
- **AC‑M7.1:** Selecting a voice in `#voice-select` **plays a short sample word**
  in that voice (wiring the long‑planned AC‑K3.5). The sample is a single short
  Spanish word (e.g. "hola"/"Lalo") spoken via the existing `speech.speak` with
  the newly chosen voice applied first.
- **AC‑M7.2:** The preview fires on the picker's change (adult‑initiated), does
  not auto‑play on load, is interruptible, and does not disturb game audio
  (dashboard is not the play screen). If no usable voice, it no‑ops gracefully
  (the existing "no Spanish voice" notice still applies).

#### AC‑M8 — Música de fondo opcional (D8)
- **AC‑M8.1:** Add a **soft optional background melody** generated with **Web
  Audio** (same stack as current SFX in `js/audio.js` / `js/celebrate.js`), with
  an **adult‑panel toggle** (`#music-toggle`, "Música de fondo"), **default OFF**,
  persisted via `progress.js`.
- **AC‑M8.2 (non‑interference):** The music **must not interfere** with read‑aloud
  TTS or speech recognition — it ducks/pauses during `audio.model(...)` reads and
  while the mic is listening (auto‑listen), then resumes; it never plays over the
  recognition window. Default‑OFF guarantees zero impact unless the adult opts in.
- **AC‑M8.3 (a11y/perf):** Low, gentle volume; starts only after a user gesture
  (autoplay policy); stops on reset; light enough to stay 60fps‑friendly; honored
  only while the app is foregrounded.

---

## Pedagogical Order & Criteria (binding on content — carried forward, UNCHANGED)

Unchanged from iterations 4–8 and **not re‑opened**: whole‑word practice;
syllables only as a decoding aid; the consonant tiers; the 2→3→4 ordering; the
digraph/closed "especiales" zones; all machine‑checked by `words.js` helpers.
**No vocabulary is added or reordered this iteration.**

---

## Technical Specification

### Architecture (unchanged)
Static SPA: one `index.html`, one `css/styles.css`, small vanilla **ES modules**
in `js/`, **no backend, no build step, no bundler, all art inline SVG**, state in
`localStorage`, screens swapped by the `game.js` state machine, PWA via `sw.js` +
`manifest.webmanifest`, CSV inventory under `data/`. **No `app/` folder — the
real code lives at the workspace root** and is evolved in place.

### Data model (`js/progress.js`)
`localStorage` key stays **`silabas:v2`** (no version bump; defaults/clamps in
place, as iter 8). `freshState()` gains, and `migrate()` fills/validates for
older v2 blobs (missing → default, invalid → clamped, preserving
`autoRead`/`voicePref`/`wordsPerLevel` and all existing fields):
- **`lalo`** — the child's customization, e.g.
  `{ color: <paletteId>, accessories: [<accessoryId>, ...] }`. Defaults to the
  base color + no accessories. On load, any equipped item not currently unlocked
  for the state is dropped (validated against the pure catalog) so a stale/invalid
  equip can never render a locked item.
- **`garden`** — optional cache of discovered garden element ids (the garden can
  also be fully **derived** from `{stars, stickers, levels}` at render time; the
  plan picks derive‑only vs. cached — pure rule is the source of truth either
  way; AC‑M4.2/M4.4).
- **`music`** (boolean, default **false**) — background‑music toggle (D8 / AC‑M8).
- **`practiceMode`** (optional) — if a persisted/default mode preference is
  chosen in `9_plan.md` (vs. auto‑rotation), stored here; otherwise omitted.

No per‑item record change. New fields are additive and clamped/validated.

### Module map — each demand → real root files

- **`js/mascot.js`** (D1 color/accessory layers + D2 reactions):
  - Parameterize the body color (accept a palette id / fill+stroke) and render
    **accessory SVG layers** over the same `viewBox`. Add a pure
    `markup(options)` / `applyCustomization({color, accessories})` so welcome,
    map, summary, and the game companion all render the customized Lalo
    (AC‑M1.5). Keep `mount()/setState()` API.
  - Extend states/behaviors: **blink** (CSS loop on idle), **surprise**,
    **sleeping** (AC‑M2.1). Keep the 4 existing states. Expose helpers to request
    the surprise reaction and the sleep/wake transition; motion lives in CSS.
- **`js/customize.js`** (NEW, pure — D1): the **customization catalog** (color
  palettes + accessory items with inline‑SVG snippets) and pure rules:
  `unlockedItems(progress)`, `isUnlocked(progress, itemId)`,
  `sanitizeSelection(progress, selection)` (drop locked), `defaultSelection()`.
  No DOM/storage. Unit‑tested (`customize.test.js`).
- **`js/garden.js`** (NEW, pure — D4): the **garden catalog** (element id → art +
  unlock condition anchored to star milestones / levelIds, reusing the
  `rewards.js` pattern) and `gardenState(progress)` → ordered
  `{id, artId, unlocked}` list. No DOM/storage. Unit‑tested (`garden.test.js`).
  May live inside `rewards.js` instead if the plan prefers; keep it pure either
  way (reuse `MILESTONE_EVERY`, `STICKER_CATALOG`, star totals).
- **`js/modes.js`** (NEW, pure — D3): practice‑mode definitions + pure option
  generation: `buildOptions(targetWord, pool, n)` → N distinct plausible options
  incl. the correct one; `missingSyllableChoices(word, parts, n)` for the
  fill‑the‑syllable mode; `pickMode(levelId, index, prefs)` for selection/
  rotation. No DOM. Unit‑tested (`modes.test.js`).
- **`js/game.js`** (orchestration — D2/D3/D8):
  - On `nextItem()`, request Lalo **surprise** (AC‑M2.3) before/with the model
    request, without altering the auto‑read → auto‑listen sequence (AC‑L2).
  - Manage the **idle→sleeping** timer with the existing token/cancel pattern
    (AC‑M2.4), active only in `phase === "play"`.
  - Add **mode handling**: when a level session uses a tap‑based mode, present
    options (from `modes.js`), route a correct tap through `succeed(...)` and
    wrong taps through the encouragement path; keep the say‑it mode's auto‑listen
    path. Expose the active mode + its options in `view()` for rendering.
  - **Music (D8):** on read start / mic listen, **duck/pause** the music track;
    resume after; honor the `music` setting; add `setMusicEnabled(bool)` (clamp +
    persist + apply). Add `setLaloCustomization(selection)` (sanitize + persist +
    re‑render). `view()`/`dashboardStats()` expose `lalo`, `garden`, `music`, and
    the active mode where the UI needs them.
- **`js/audio.js`** (D8): add a gentle **Web Audio background‑melody** generator
  (loop of soft tones), with start/stop/duck controls, reusing the existing
  AudioContext. No library. Ducking is driven by `game.js` around reads/listen.
- **`index.html`** (D1/D4/D5/D6/D7/D8):
  - Map top bar: add `#map-wardrobe-btn` (🎨) and a Jardín entry
    (`#map-garden-btn`, 🌱) — or integrate the garden into the path overview.
  - New screens: `#wardrobe-screen` (armario) and `#garden-screen` (jardín),
    following the existing screen/header pattern.
  - Game screen: themed‑background hook (a `data-theme`/class on
    `#game-screen` set per band) + optional ambient layer (AC‑M5).
  - Map screen: path/trail container replacing/augmenting `#map-grid` (AC‑M6),
    preserving `role="list"` semantics and node markup for state.
  - Adult "Ajustes": keep all existing controls; add **`#music-toggle`** (D8).
    (Voice preview D7 needs no new markup — it's wiring on `#voice-select`.)
  - Mode UI: an options container inside/near the card for tap‑based modes
    (`#mode-options`), hidden in the say‑it mode.
- **`js/main.js`** (wiring): mount the customized Lalo on every screen; wire
  `#map-wardrobe-btn`/`#map-garden-btn` navigation; render the armario (swatches
  + accessory tiles with locked silhouettes) → `game.setLaloCustomization(...)`;
  render the garden from `garden.gardenState(...)`; render the path map from
  `view().map`; render mode options and route taps; wire `#voice-select`
  **change → preview** (D7) and `#music-toggle` → `game.setMusicEnabled(...)`
  (D8), reflecting persisted values in `renderDashboard()`.
- **`css/styles.css`**: styles for the armario grid (swatches, accessory tiles,
  locked silhouette reusing the sticker‑locked pattern), the garden, the themed
  game backgrounds (+ text scrim for contrast) and optional ambient (reduced‑
  motion off), the path/trail map, the mode‑options tiles (≥56px, ≥4.5:1), the
  music toggle, and the new Lalo blink/surprise/sleeping animations with
  reduced‑motion static fallbacks.
- **`sw.js`**: **bump `CACHE_VERSION`** to `lalo-silabas-v9.0.0` so the updated
  shell, CSS, and new JS modules (`customize.js`, `garden.js`, `modes.js`) are
  precached and shipped offline. Add the new JS modules to the precache list; no
  new data files.

### New / changed pure contracts (illustrative)
```
// customize.js
defaultSelection()                                  -> { color, accessories:[] }
unlockedItems(progress)                             -> { colors:[ids], accessories:[ids] }
isUnlocked(progress, itemId)                        -> boolean
sanitizeSelection(progress, selection)              -> selection with only unlocked items

// garden.js (or in rewards.js)
gardenState(progress)                               -> [{ id, artId, unlocked }]  // ordered, grows

// modes.js
buildOptions(targetWord, pool, n)                   -> [words]   // n distinct, incl. target
missingSyllableChoices(word, parts, n)              -> { blankIndex, options[] }
pickMode(levelId, index, prefs)                     -> modeId

// game.js
setLaloCustomization(selection)                     // sanitize + persist + render
setMusicEnabled(bool)                               // clamp + persist + apply
// view() now also exposes: lalo, garden, music, activeMode (+ its options)

// progress.js — additive, clamped/validated in migrate()
freshState().lalo   = { color: <base>, accessories: [] }
freshState().music  = false
```
All new logic reuses existing patterns. **No new runtime library.**

### Testing (Node `--test`, framework‑free; run from workspace root)
```
node --test "js/*.test.js"
node --check js/*.js sw.js
```
- **`customize.test.js`** (NEW): `defaultSelection()` is valid for a first‑run
  state; a base set is unlocked at first run; crossing a level/milestone unlocks
  the expected item(s); `sanitizeSelection` drops locked items; previously
  unlocked items never re‑lock.
- **`garden.test.js`** (NEW): first‑run shows the base garden; a milestone/level
  reveals the expected element; already‑unlocked elements persist; the derived
  list is ordered and stable.
- **`modes.test.js`** (NEW): `buildOptions` returns N distinct options including
  the target with no duplicates and only from the pool; `missingSyllablechoices`
  blanks exactly one real syllable and offers the correct one; `pickMode`
  rotates/selects deterministically; very‑young mode avoids text‑only modes.
- **`mascot.test.js`** (NEW or folded into existing tests): `markup(options)` is
  deterministic for a given selection and includes the chosen color + accessory
  layers within the same `viewBox`; unknown items are ignored; the state set
  still includes the original 4.
- **`game.test.js`** (extend): (a) presenting a new word requests exactly one
  **surprise** reaction and does **not** add extra reads/listens (AC‑L2/K6
  unchanged); (b) a tap‑based mode's correct option completes a word through
  `succeed()` and advances via the micro‑loop, wrong taps encourage without
  dead‑end; (c) `setMusicEnabled` persists + reflects; (d) `setLaloCustomization`
  sanitizes + persists; carried: configurable goal (AC‑L3), no `#confirm-btn`
  dependency (AC‑L1), success micro‑loop (AC‑K6).
- **`progress.test.js`** (extend): `freshState().music === false` and
  `freshState().lalo` is the default selection; `migrate()` fills/validates
  `lalo`/`music` for older v2 blobs without disturbing
  `autoRead`/`voicePref`/`wordsPerLevel`/other fields; an invalid equipped item
  in a stored `lalo` is dropped on migrate.
- **Browser‑only (recorded in `9_plan.md`):** the customized Lalo shows on all
  screens and the armario locks/unlocks correctly; blink/surprise/sleeping play
  and degrade under reduced motion; the new mode(s) play end‑to‑end with the
  micro‑loop and never dead‑end; the garden grows and is visible to the child;
  themed backgrounds keep ≥4.5:1 text contrast on every family; the path map
  shows state, is keyboard‑navigable and responsive; the voice preview speaks on
  change; background music (opt‑in) ducks around reads/listen and never degrades
  recognition; offline/`file://` still playable; reduced‑motion/high‑contrast/
  forced‑colors fallbacks still hold.

### Persistence
`localStorage` schema stays `silabas:v2` (no version bump). New additive keys
(`lalo`, `music`, optional `garden`/`practiceMode`) default + validate/clamp in
`migrate()`. Only `CACHE_VERSION` bumps (to `v9.0.0`). Any invalid/missing new
value falls back to its default; a locked equipped item is dropped on load.

---

## Tech Stack Decision (binding — UNCHANGED)
**No change in stack.** Vanilla **HTML5 + CSS3 + JavaScript (ES modules)**, **no
framework, no bundler, no build step, no runtime dependencies**, `localStorage`
only, **all art inline SVG**, offline‑first **PWA** via `sw.js` +
`manifest.webmanifest`, served over http(s)/localhost (with a `file://`
fallback). Specifically for this iteration:
- **Lalo customization + accessories = inline SVG layers** over the existing
  `mascot.js` `viewBox`; the catalog + unlock rules are **pure JS + Node `--test`**.
  No icon/asset library.
- **New mini‑game modes = pure JS option generation** over the existing CSV
  words + inline‑SVG art; rendered with the existing DOM/CSS. No game engine.
- **Jardín de Lalo = pure JS catalog** derived from existing
  stars/stickers/levels (reusing `rewards.js`), rendered as inline SVG. No new
  store.
- **Themed backgrounds + ambient + path map + Lalo reactions = CSS + inline SVG
  only.** No animation/particle/map library; all motion gated by
  `prefers-reduced-motion`.
- **Voice preview = Web Speech API** via the existing `speech.speak`. No service.
- **Background music = Web Audio** via the existing AudioContext in `audio.js`.
  No audio library, no audio files.
- **Settings (music, customization) = `localStorage`** via `progress.js`. No
  state library.
- New JS modules precached by the SW (bump `CACHE_VERSION`). **No `app/` folder;
  code at the workspace root.** Do not introduce frameworks, bundlers, runtime
  package managers, game/animation/audio libraries, or a backend.

---

## Non‑Functional Requirements
- **Appeal & retention (the point of this round):** the child owns a character
  they build up (D1), that feels alive (D2); sessions vary (D3); and something
  visibly grows over time (D4) — with richer scenes (D5), a readable journey
  (D6), and optional ambience (D8). Everything is reachable without reading.
- **No dead‑ends, ever:** new modes always offer a way forward (wrong taps
  encourage + retry, never fail); the armario is never empty (base items from
  first run) and locked items are non‑selectable silhouettes; the garden only
  grows; music is opt‑in and default OFF.
- **Accessibility (carried forward, binding):** ≥56px touch targets; **≥4.5:1
  text contrast on every themed background** (scrim allowed); `prefers-reduced-
  motion` disables blink/ambient/particles and shows static expressive poses;
  `prefers-contrast: more` / forced‑colors honored; keyboard parity across the
  armario, modes, path map, and dashboard; Lalo companion stays
  decorative/`aria-hidden`/`pointer-events:none`; new screens have accessible
  headings/labels; very‑young text‑free mode remains fully playable (picture‑based
  modes; icon‑only customization).
- **Audio behavior:** background music (when enabled) ducks/pauses around
  read‑aloud and the recognition window so it never interferes with TTS or ASR;
  starts only after a user gesture; low volume.
- **Performance / offline / privacy (unchanged):** inline SVG + CSS animation
  stay 60fps‑friendly; no new data files; full offline after first load via the
  SW (`v9.0.0`); no accounts/ads/tracking; graceful `file://` fallback; no fail
  states; no new runtime dependencies.

---

## Out of Scope (iteration 9)
- Any backend, account, analytics, tracking, remote/cloud sync of customization
  or progress.
- Any framework/bundler/language change; any new runtime library (game engine,
  animation/particle/audio/asset library).
- Any pedagogy or learning‑order change; any vocabulary growth or reordering
  (vocabulary was grown in iteration 8).
- 5+ syllable words, sentences, phrases, or reading comprehension.
- A full character‑builder beyond color + a small accessory set (no body shape
  morphing, no animated custom rigs, no user‑uploaded assets).
- Trading/sharing customization or garden, social features, leaderboards.
- Downloadable/recorded TTS voices or custom music tracks/files (music is
  Web‑Audio‑generated; TTS remains device voices as in iter 7).
- Rate/pitch sliders, per‑word/level voice overrides, or exposing the recognition
  locale.
- A `localStorage` schema‑version bump or progress migration (new keys default/
  validate in place).
- Automated end‑to‑end / visual‑regression testing of live audio (music/TTS/
  recognition), contrast, animation, or layout (verified manually in a browser
  with notes in `9_plan.md`).
