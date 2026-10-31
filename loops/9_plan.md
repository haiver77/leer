# 9 — Implementation & Deployment Plan: "Lalo y las Sílabas" — appeal & long‑term interest

Developer plan for `loops/9_specification.md`. The stack is **unchanged**:
vanilla HTML5 + CSS3 + JavaScript ES modules, buildless, no bundler, no runtime
dependencies, `localStorage`‑only, all art inline SVG, offline‑first PWA via
`sw.js` + `manifest.webmanifest`. **The real code lives at the workspace root**
(`index.html`, `css/styles.css`, `js/*.js`, `data/*.csv`, `sw.js`, …). No `app/`
folder is created; existing files are evolved in place.

> **Baseline note (important).** The working tree arrived with an *unfinished,
> out‑of‑scope* expansion of `data/words-2syllables.csv` (new words such as
> `lata`, `lima`, `rulo`, `cono`, `beso`) that (a) violated the pedagogical
> order check (`rulo`/`cono`/`beso` sit after digraph words) and (b) lacked
> art entries, so the suite ran 117✓/2✗. Iteration 9 is explicitly *"no
> vocabulary growth"*, so that broken data edit was reverted to its committed
> state, restoring the documented **119‑test green baseline** before any
> iteration‑9 work. No vocabulary was added or changed this round.

---

## Concrete design decisions the spec left to the plan

### D3 — mini‑game mode(s) chosen + selection/rotation
Two new tap‑based modes are implemented over the **same vocabulary + inline‑SVG
art** (no new content):

1. **`pick-word` — "¿Cuál dice …?" / elegir la palabra correcta.** Show the
   current word's **art** (the dibujo) plus **3 word options** (the target + 2
   plausible distractors from the level pool). The child taps the matching
   word. Text‑dependent → **skipped in very‑young mode**.
2. **`missing-syllable` — "Completa la sílaba" .** Show the word with exactly
   **one syllable blanked** (`pe‑__‑ta`) and **3 syllable options** (the correct
   one + 2 distractors drawn from other words' syllables). The child taps the
   missing piece. Reuses the existing per‑word syllable split. Picture‑backed
   (art stays on the card) so it degrades acceptably but, being mildly
   text‑dependent, it is also **excluded in very‑young mode**.

The original **`say-it`** read‑and‑say mode (auto‑read → auto‑listen, AC‑L2)
remains the default and is **unchanged**.

**Selection / rotation (automatic, no reading required).** Mode is chosen by a
pure, deterministic rotation keyed by the **per‑word index within the level**
(`pickMode(levelId, index, prefs)` in `modes.js`):

- Rotation order: `say-it → pick-word → missing-syllable → say-it → …`
  (index % 3). This interleaves a spoken rep with two tap games so every third
  word keeps the mic/pronunciation practice that mastery depends on.
- **Very‑young mode** (`prefs.veryYoung === true`) collapses the rotation to a
  **picture‑safe** subset. Since both tap modes are text‑dependent, very‑young
  stays on **`say-it`** only (picture + spoken), guaranteeing a text‑free,
  always‑playable session (AC‑M3.6).
- A level's **first word is always `say-it`** (index 0) so a session always
  opens with the familiar read‑and‑say and a model read.
- There is **no child‑facing mode chooser** (keeps it reading‑free and
  frictionless); rotation is fully automatic. No `practiceMode` is persisted
  this round (the field stays omitted; `progress.js` tolerates it if present).

**Outcome mapping.** Tap modes complete a word via `succeed({verified:false})`
(self‑confirm‑style, like AC‑L1.3) — they do **not** grant mastery (mastery
stays mic‑verified only, AC‑M3.4). A **wrong** tap routes through the
encouragement path ("Casi… intenta otra vez"), never fails, never dead‑ends;
the child can tap again. `say-it` keeps `verified:true` on a mic match.

### D2 — idle → sleeping cadence
- **Idle timeout = 12 s** of no interaction while `phase === "play"` → Lalo
  enters the **sleeping/"esperando"** pose. Any tap, key, new word, success,
  near/miss, or navigation **wakes** him (reset/cancel). Chosen as a child‑
  friendly middle ground: long enough not to trigger mid‑read/mid‑think, short
  enough to feel alive during a pause.
- **Blink** is a continuous, CSS‑only loop on the resting (idle) pose
  (~every 4 s), needing no JS timer.
- **Surprise** fires for ~**900 ms** when a new word is presented, then settles
  back to the normal play state (`idle`, or `model` during the auto‑read). It is
  a one‑shot request issued alongside the model request in `nextItem()`; it adds
  **no** extra read or listen and never reorders the auto‑read → auto‑listen
  sequence (AC‑M2.3).
- The idle timer reuses the **token/cancel pattern** already used for
  auto‑listen (a monotonically increasing `sleepToken` invalidates stale
  callbacks), so there are no runaway timers and it never fires off the play
  screen (AC‑M2.4).

---

## Implementation plan (step by step, mapped to the spec)

### 1. New pure modules + unit tests (no DOM/storage)
- **`js/customize.js`** (D1 / AC‑M1): catalog of **color palettes** (body
  fill/stroke) and **accessory items** (each an inline‑SVG snippet drawn over
  the existing `mascot.js` `viewBox 0 0 120 120`), plus unlock rules anchored to
  existing signals (`progress.stars` milestones + `levels[...].completed`).
  Pure API: `defaultSelection()`, `unlockedItems(progress)`,
  `isUnlocked(progress, itemId)`, `sanitizeSelection(progress, selection)`,
  `allColors()`, `allAccessories()`, `colorById()`, `accessoryById()`. A **base
  set** (default color + 1–2 colors) is unlocked from first run so the armario
  is never empty. → `js/customize.test.js`.
- **`js/garden.js`** (D4 / AC‑M4): ordered garden catalog (element id → inline
  SVG `artId` + unlock anchored to **star milestones** via `MILESTONE_EVERY`
  and to `levelId` completion, mirroring `rewards.js`). Pure API:
  `gardenState(progress)` → `[{id, artId, label, unlocked}]` (ordered, only
  grows), `unlockedCount(progress)`, `GARDEN_CATALOG`. Because elements anchor
  to **total stars / milestones** that keep accruing, there is always something
  to earn **after 100 %** (AC‑M4.3). → `js/garden.test.js`.
- **`js/modes.js`** (D3 / AC‑M3): mode ids + pure option generation.
  `MODES`, `pickMode(levelId, index, prefs)` (deterministic rotation above),
  `buildOptions(targetWord, pool, n)` (N distinct, plausible, incl. the target,
  only from the pool, no dupes), `missingSyllableChoices(word, parts, n)`
  (blanks exactly one real syllable, offers the correct one + distinct
  distractors), `isTextMode(modeId)`. → `js/modes.test.js`.

### 2. `js/mascot.js` (D1 color/accessory layers + D2 reactions)
- Parameterize the body **color** (fill + stroke from a palette id) and render
  **accessory layers** over the same `viewBox`. Pure `markup(options)` returns
  the SVG string for a `{color, accessories}` selection (deterministic; unknown
  ids ignored). `applyCustomization(selection)` re‑renders the mounted host.
- Keep `STATES` = `["idle","cheer","encourage","model"]` and the `mount()` /
  `setState()` / `currentState()` API unchanged.
- Add additive behaviors: a **blink** CSS loop on idle; a one‑shot **surprise**
  (`surprise()` adds a transient `lalo-surprise` class and auto‑clears) ; and a
  **sleep/wake** pair (`sleep()` / `wake()` toggling `lalo-sleeping`). All
  motion is CSS; reduced‑motion shows static expressive poses.
- `markup(options)` is the single source welcome/map/summary/companion render
  from, so the customized Lalo appears everywhere (AC‑M1.5).
- Add `mascot.test.js` for `markup(options)` determinism + `STATES`.

### 3. `js/progress.js` (additive, clamped/validated in migrate)
- `freshState()` gains `lalo = customize.defaultSelection()` and
  `music = false`. (To keep `progress.js` free of a hard import cycle, the
  default `lalo` is the literal `{ color: "sky", accessories: [] }` that equals
  `customize.defaultSelection()`; a `progress.test.js` assertion pins them
  equal.)
- `migrate()` fills/validates `lalo` (object with a string `color` + string[]
  `accessories`, else default) and `music` (boolean, else false) for older v2
  blobs **without disturbing** `autoRead` / `voicePref` / `wordsPerLevel` / other
  fields. Invalid shapes fall back to defaults. (Dropping a *locked* equipped
  item is done at load time in `game.js` via `customize.sanitizeSelection`,
  since that needs the catalog; `migrate` only guarantees a structurally valid
  `lalo`.)

### 4. `js/audio.js` (D8 background music)
- Add a gentle **Web‑Audio background melody** generator reusing a lazily
  created `AudioContext`: `startMusic()`, `stopMusic()`, `duckMusic(on)`
  (lower gain while reads/listen happen), `isMusicPlaying()`. A soft looped
  arpeggio at low gain; starts only after a user gesture; no files, no library.
  All guarded so Node import stays a no‑op.

### 5. `js/game.js` (orchestration — D2/D3/D8)
- Load: after `progress.load()`, **sanitize** the stored `lalo` against
  `customize.unlockedItems(progress)` so a stale/locked equip never renders.
- `nextItem()`: compute the **active mode** via `modes.pickMode(levelId,
  index, {veryYoung})`; for tap modes, build options (`modes.buildOptions` /
  `modes.missingSyllableChoices`) and expose them on `view()`; request Lalo
  **surprise** (`handlers.onMascot`‑adjacent `onReaction("surprise")`) alongside
  the model request without changing the auto‑read → auto‑listen order; for
  `say-it` keep the existing auto‑read/auto‑listen path. Reset the sleep timer.
- **Idle→sleep**: `scheduleSleep()` / `cancelSleep()` (token pattern, 12 s),
  armed on each presentation + after feedback, cancelled on any interaction and
  on navigation; fires only in `phase === "play"`. `wakeLalo()` on any input.
- **Mode answer routing**: `answerOption(value)` → correct maps to
  `succeed({verified:false})`; wrong → encouragement + stay. `say-it` continues
  to use `listenAttempt()`/`confirmSaid()`.
- **Music (D8)**: `setMusicEnabled(bool)` (coerce + persist + apply);
  duck/pause around `audio.model(...)` reads and during the mic listen window,
  resume after. `view()` exposes `lalo`, `music`, and `activeMode` (+ its
  `options`); `dashboardStats()` exposes `music`.
- **Customization**: `setLaloCustomization(selection)` (sanitize via
  `customize` + persist + expose through `view().lalo`). `gardenState()` helper
  returns `garden.gardenState(progress)` for the garden screen.

### 6. `index.html`
- Map top bar: add `#map-wardrobe-btn` (🎨) and `#map-garden-btn` (🌱).
- New screens following the existing pattern: `#wardrobe-screen` (armario —
  `#wardrobe-preview` Lalo + `#wardrobe-colors` + `#wardrobe-accessories` grids
  + quiet back) and `#garden-screen` (`#garden-canvas` + accessible summary +
  quiet back).
- Game screen: a `data-theme` hook on `#game-screen` (set per band) + an
  optional ambient layer `#game-ambient` (decorative). A **mode‑options**
  container `#mode-options` inside the card, hidden in `say-it`.
- Adult Ajustes: add `#music-toggle` ("Música de fondo", default unchecked).
  (Voice preview needs no new markup.)

### 7. `js/main.js`
- Mount the **customized** Lalo on every screen (pass `view().lalo` into
  `mascot.applyCustomization`). Wire `#map-wardrobe-btn` / `#map-garden-btn`.
- Render the **armario**: color swatches + accessory tiles (locked ones as
  silhouettes reusing the sticker‑locked pattern), equip/remove →
  `game.setLaloCustomization(...)`, live preview via `mascot.markup`.
- Render the **garden** from `game.gardenState()` (inline SVG, `aria-hidden`
  art + an accessible "N elementos" summary).
- Render **mode options** (`#mode-options`) for tap modes and route taps to
  `game.answerOption(...)`; hide them in `say-it`.
- Set `#game-screen` `data-theme` from the band (D5) via a small **pure band→
  theme lookup** (every band maps to a theme; a tiny table in main.js).
- Wire `#voice-select` **change → preview** (D7): apply the chosen voice then
  `speech.speak("Lalo")`. Wire `#music-toggle` → `game.setMusicEnabled(...)` and
  reflect persisted `music` in `renderDashboard()`.
- The path/trail map (D6) is a CSS re‑presentation of the existing
  `#map-grid` nodes (a `.map-trail` modifier + connectors), preserving
  `role="list"`, node state markup, family colors, ≥56px targets, and keyboard
  order. No change to `levels.mapState()`.

### 8. `css/styles.css`
- Lalo **blink / surprise / sleeping** animations with reduced‑motion static
  fallbacks; accessory layers inherit the mascot sizing.
- Armario grid (swatches + accessory tiles + locked silhouette), garden layout,
  themed game backgrounds keyed by `#game-screen[data-theme]` (+ a text scrim
  so word/tiles stay ≥4.5:1), optional ambient (disabled under reduced motion),
  the `.map-trail` path styling, `#mode-options` tiles (≥56px, ≥4.5:1), and the
  music toggle.

### 9. `sw.js`
- Bump `CACHE_VERSION` → **`lalo-silabas-v9.0.0`** and add the new modules
  (`./js/customize.js`, `./js/garden.js`, `./js/modes.js`) to the precache
  `SHELL` list. No new data files.

---

## Deployment plan (local run + serve, exact commands)

The app is a static, buildless PWA — there is **nothing to compile or bundle**.

**Run locally (recommended — service worker + CSV fetch need http):**
```
# from the workspace root (any static server works); examples:
python -m http.server 8000
#   → open http://localhost:8000/
# or, with Node's one‑liner server:
npx --yes serve .
#   → open the printed http://localhost:3000/ (or similar)
```
Open the printed URL in a modern browser (Chromium/Edge/Safari/Firefox). The
service worker registers on first load and precaches the shell (`v9.0.0`), so a
second load works fully **offline**. Web Speech recognition/synthesis and
background music require a user gesture (tap "Empezar"/answer) per browser
autoplay/permission policy.

**`file://` fallback:** opening `index.html` directly still plays — the embedded
word fallback in `words.js` covers the CSV, and speech/music degrade gracefully.
(The SW and CSV fetch do not run under `file://`; that is expected.)

**Hosting target:** any static host (GitHub Pages, Netlify, S3+CloudFront, a
plain nginx). Deploy = copy the repository root as‑is to the web root. Because
`CACHE_VERSION` bumped to `v9.0.0`, returning visitors' service workers evict
the old cache and pick up the new shell + modules on next load.

**Environment:** none. No env vars, no accounts, no backend, no analytics.

---

## Verification

**Automated (run from the workspace root):**
```
# syntax‑check every changed module + the service worker
node --check js/customize.js
node --check js/garden.js
node --check js/modes.js
node --check js/mascot.js
node --check js/game.js
node --check js/audio.js
node --check js/progress.js
node --check sw.js

# full framework‑free unit suite (Node built‑in test runner)
node --test "js/*.test.js"
```
New/extended tests proving iteration‑9 logic:
- **`customize.test.js`** — `defaultSelection()` valid for first‑run; a base
  set is unlocked at first run; crossing a level/milestone unlocks the expected
  item(s); `sanitizeSelection` drops locked items; previously unlocked items
  never re‑lock.
- **`garden.test.js`** — first‑run base garden; a milestone/level reveals the
  expected element; already‑unlocked elements persist; ordered + stable.
- **`modes.test.js`** — `buildOptions` returns N distinct options incl. the
  target, no dupes, only from the pool; `missingSyllableChoices` blanks exactly
  one real syllable and offers the correct one; `pickMode` rotates
  deterministically and avoids text modes in very‑young.
- **`mascot.test.js`** — `markup(options)` is deterministic, includes the
  chosen color + accessory layers within the same `viewBox`, ignores unknown
  ids; `STATES` still includes the original 4.
- **`game.test.js`** (extended) — presenting a new word requests exactly one
  **surprise** reaction and adds no extra reads/listens; a tap‑mode correct
  option completes a word via `succeed()` and advances through the micro‑loop,
  wrong taps encourage without dead‑end; `setMusicEnabled` persists + reflects;
  `setLaloCustomization` sanitizes + persists; carried AC‑L1/L3/K6 checks hold.
- **`progress.test.js`** (extended) — `freshState().music === false` and
  `freshState().lalo` equals the default selection; `migrate()` fills/validates
  `lalo`/`music` for older v2 blobs without disturbing
  `autoRead`/`voicePref`/`wordsPerLevel`; an invalid stored `lalo` is replaced
  with the default.

**Expected result:** the existing 119 tests stay green and the new tests pass
(final count well above 119), `node --check` clean on all changed files.

**Browser‑only checks (manual — not automated this round, per spec):**
- The customized Lalo shows on welcome, map, companion, summary, and armario
  preview; equipping persists and re‑renders everywhere.
- Blink / surprise (on new word) / sleeping (after ~12 s idle) play and degrade
  to static poses under `prefers-reduced-motion`; Lalo never steals a tap.
- `pick-word` and `missing-syllable` play end‑to‑end, route correct taps
  through the micro‑loop, wrong taps encourage, never dead‑end; very‑young stays
  on the picture‑based `say-it`.
- The garden is visible to the child and grows with stars/stickers/levels;
  element art is decorative with an accessible count.
- Themed backgrounds keep ≥4.5:1 text contrast on every family (scrim behind
  the card text); ambient disabled under reduced motion.
- The path/trail map shows locked/unlocked/completed state, family colors,
  ≥56px targets, keyboard order, and is responsive + scrollable.
- The voice preview speaks a short word on `#voice-select` change (no autoplay
  on load); it no‑ops gracefully with no usable voice.
- Opt‑in background music starts after a gesture, ducks around reads and the
  mic window, never degrades recognition, and is default OFF.
- Offline/`file://` still playable; high‑contrast / forced‑colors fallbacks
  still hold.

**Environment limitation:** live audio (TTS/ASR/music), contrast, animation,
and layout are verified manually in a browser (headless automation of these is
out of scope per the spec); the pure logic behind each feature is covered by the
Node tests above.
