# 7 — Specification: "Lalo y las Sílabas" — 10‑Word Levels, Voice Picker, Visible Lalo, Better Celebrate, Configurable Auto‑Read, Leaner Play UI

Evolves `6_specification.md`. Iteration 6 shipped a bigger vocabulary (≥50 two‑,
≥50 three‑, ≥20 four‑syllable words), a 2→3→4 syllable map, auto‑read on display,
removal of the "Siguiente" button, and removal of the standing "Di la palabra"
prompt. Iteration 7 takes eight binding demands from `7_input.md`:

1. **D1 — 10 words per level.** Every level/session goal becomes **10 words**
   (today `goal = min(5, poolSize)`).
2. **D2 — More 2‑syllable words.** Grow the 2‑syllable inventory so every
   2‑syllable band comfortably supports a 10‑word session.
3. **D3 — Voice picker in the adult panel.** Let an adult **choose the TTS voice**
   used for reading, from the adult settings; **persist** the choice.
4. **D4 — Lalo more visible.** Reposition the Lalo mascot on the play screen so
   the child sees it clearly.
5. **D5 — Better success animation.** Improve the celebration played when a word
   is pronounced correctly.
6. **D6 — Confirm auto‑advance + read.** After a correct pronunciation the app
   must automatically advance to the next word **and read it aloud there** — this
   iteration confirms and tests that behavior end‑to‑end.
7. **D7 — Configurable auto‑read.** Make the auto‑read‑on‑word‑display behavior a
   **toggle** in the adult settings; persist it.
8. **D8 — Remove the empty control above "Hablar".** The empty element reserving
   space directly above the mic ("Hablar") button is removed.

Everything accepted in iterations 1–6 is carried forward unless this document
explicitly supersedes it. This iteration **does not touch the tech stack** (it
stays a vanilla, buildless, offline‑first PWA) and **does not re‑open** the
words‑only decision (iter 5) or the 2→3→4 map (iter 6).

---

## Overview & Goals

Lalo is a free, private, offline‑first Spanish word‑reading game for young
children: a child sees a word, hears it, says it into the mic, and celebrates
with the mascot Lalo. Iteration 7 lengthens each session to a satisfying 10
words, hands adults real control over *which* voice reads and *whether* words
auto‑read, makes Lalo a visible companion during play, upgrades the win moment,
and trims one last piece of dead UI above the primary action.

Non‑goals unchanged: 100% vanilla, buildless, offline‑first, private, free, no
backend, no accounts, no tracking.

---

## Superseded from iteration 6 (explicit — not silently dropped)

- **Per‑level goal `min(5, poolSize)`** → replaced by **`min(10, poolSize)`**
  (D1). With the grown inventory every shipped band has ≥10 words, so in practice
  the goal is 10 everywhere; the `min(…, poolSize)` guard is kept only so a
  hypothetically thin band can never dead‑end.
- **Always‑on auto‑read (AC‑J4).** The iteration‑6 auto‑read remains the default
  but is now **gated by a persisted adult setting** (D7). When the setting is on
  (default), behavior is exactly as in iteration 6; when off, no word is spoken
  automatically on display (the child still hears the word by tapping the card /
  Enter / Space / `l`, and near‑miss modeling is unaffected).
- **Fixed Spanish‑voice auto‑selection (AC‑I2).** `pickSpanishVoice` stays the
  **fallback/default**, but an adult may now **override** it by choosing a
  specific installed voice, which is **persisted** and used by `speech.speak`
  (D3). The "no Spanish voice" notice logic is unchanged.
- **Play‑screen layout above the mic.** The empty `#feedback` live region that
  reserved ~2.2em of blank space directly above "Hablar" is restructured so it
  no longer occupies standing empty space when idle (D8). It remains a live
  region for transient status (it is not deleted — see AC‑K8).
- **Mascot position on the play screen.** The small Lalo in `.secondary-controls`
  **below** the mic buttons is repositioned to be more prominent/visible (D4).

Everything else from iterations 1–6 remains in force: words‑only practice, the
per‑word syllable part tiles, guaranteed Spanish TTS + the adult "no Spanish
voice" notice, lenient `es-ES` recognition, the self‑confirm fallback, keyboard +
gesture parity (tap = read, left‑swipe / `ArrowRight` = next, right‑swipe =
repeat), the 2→3→4 world map with staged unlocks, rewards/sticker book, mastery +
adult dashboard, onboarding, very‑young text‑free mode, adult gate, daily goal,
full offline PWA, no dead‑ends / no fail states, ≥56px targets, ≥4.5:1 contrast,
and reduced‑motion / high‑contrast fallbacks.

---

## Functional Specification

### A. Roles & key flows (carried forward)

- **Child (primary):** picks an unlocked island on the map, plays a session, says
  each word aloud, and celebrates. Never sees settings; never hits a dead‑end or
  fail state.
- **Adult (secondary):** passes the adult gate to reach the dashboard, reviews
  mastery/trouble words, and now also **chooses the reading voice** (D3) and
  **toggles auto‑read** (D7), alongside the existing difficulty / very‑young /
  reset controls.

**Play flow (updated):** open level → first word shown → (if auto‑read on) read
aloud with Lalo in "model" → child taps 🎤 (or "¡Lo dije!") → on success Lalo
celebrates with the improved animation (D5) → after a short delay the app
**auto‑advances** to the next word and **reads it** (D6) → repeat until **10**
correct (D1) → summary + sticker → map.

### B. Carried‑forward acceptance criteria (keep — do not regress)

All iteration 1–6 acceptance criteria this document does not explicitly supersede
remain in force: words‑only practice (no lone‑syllable path), the part tiles,
guaranteed Spanish TTS + adult notice, lenient recognition, self‑confirm, keyboard
+ gesture parity, the 2→3→4 ordered map with staged unlocks, stickers, dashboard
mastery, offline, and all `words.js` pedagogical‑order helpers and their tests.

### C. New / changed features for iteration 7

#### AC‑K1 — 10 words per level (D1)
- **AC‑K1.1:** In `levels.js`, each level's `goal` is computed as
  **`Math.min(10, poolSize)`** (was `min(5, …)`). (Unit‑tested in `levels.test.js`.)
- **AC‑K1.2:** With the shipped inventory, **every** band's pool has **≥10**
  words, so every level's goal is exactly **10**. A test asserts
  `every(level.pool().length >= 10)` and `every(level.goal === 10)`.
- **AC‑K1.3:** A session ends (→ summary, completes the level, unlocks the next)
  only after **10** correct answers, driven by the existing
  `state.levelCorrect >= def.goal` check in `game.js` — no other completion path
  changes. The daily‑goal, stars, streak, and sticker logic are unchanged aside
  from firing 10× per level instead of 5×.
- **AC‑K1.4:** No immediate repeats within a session is still honored
  (`pickRandom(pool, exclude)`); pools ≥10 make this comfortable. Because words
  are drawn with replacement, a 10‑word session may repeat a word after others
  have been shown — acceptable for drill and unchanged in mechanism.

#### AC‑K2 — More 2‑syllable words (D2)
- **AC‑K2.1:** `data/words-2syllables.csv` grows so that **each 2‑syllable band**
  (`pal-2-abiertas-1/2/3`, `pal-2-especiales`) derives a pool of **≥10** words via
  `words.forBand(...)`. (Verified by AC‑K1.2's per‑band ≥10 test, which will fail
  if any band is short.)
- **AC‑K2.2:** Every new row passes the existing `rowIntegrity` check (hyphen‑split
  `syllables` joins accent/case‑insensitively to `word`; `syllable_count` equals
  the part count), is ordered by non‑decreasing `difficulty_rank`
  (`isOrderedByRank`), and is consistent with `expectedTierKey` (tier → open‑
  before‑closed → length → alphabetical). New rows are inserted at their correct
  pedagogical rank, not appended. (Unit‑tested in `words.test.js`.)
- **AC‑K2.3:** Every new row has a non‑empty `emoji` and an `art_id` that
  **resolves in `art.js`** (100% art coverage preserved); new words reuse an
  existing art id or add one.
- **AC‑K2.4:** New words are age‑appropriate, concrete, common Spanish nouns
  (animals, food, toys, body, home), using only taught letters/sounds for their
  tier so the tier model is not broken.
- **AC‑K2.5:** The embedded offline fallback `WORDS` in `words.js` is expanded so
  that **offline / `file://`** each 2‑syllable band is still non‑empty and large
  enough that `buildLevels()`'s empty‑band skip never fires and sessions remain
  playable (ideally ≥10 per band from the fallback too; at minimum non‑empty).
- **AC‑K2.6:** The 3‑ and 4‑syllable inventories already satisfy ≥10 per band
  from iteration 6; if any 3‑ or 4‑syllable band falls below 10 under the new
  goal, it is topped up by the same rules (so AC‑K1.2 holds for the whole map).

#### AC‑K3 — Voice picker in the adult panel (D3)
Let an adult choose which installed TTS voice reads words; persist and apply it.
- **AC‑K3.1:** The adult dashboard "Ajustes" section gains a **voice selector**
  (a native `<select>` labeled in Spanish, e.g. "Voz de lectura") listing the
  device's available speech‑synthesis voices. Each option shows a human‑readable
  label (voice name + language tag). A first option **"Automática (recomendada)"**
  represents "let the app pick the best Spanish voice" (the iteration‑5 default).
- **AC‑K3.2:** The list is populated from the browser's voices and **refreshes on
  `voiceschanged`** (voices load lazily in Chrome). If no voices are available the
  selector shows only "Automática" and is effectively inert (no dead‑end).
- **AC‑K3.3:** The chosen voice is **persisted** in `localStorage` (a stable
  identifier — `voiceURI` preferred, with `name`+`lang` as a fallback key) and
  reloaded on next launch. "Automática" persists as an explicit "no override"
  value.
- **AC‑K3.4:** `speech.speak(text)` uses the **persisted chosen voice** when it is
  set and still present on the device; otherwise it falls back to
  `pickSpanishVoice(getVoices())` (current behavior). `utter.lang` follows the
  chosen voice's `lang` (else `es-ES`). A pure resolver function
  (`resolveVoice(voices, preferredId) → voice|null`) is added and **unit‑tested
  in Node** (chosen‑present → chosen; chosen‑absent → Spanish auto; none → null).
- **AC‑K3.5:** Changing the voice is **safe and non‑blocking** — it never throws,
  never dead‑ends, and an in‑flight utterance is cancelled per existing behavior.
  Selecting a voice may optionally speak a short preview word (e.g. "hola") so the
  adult hears it; the preview must also degrade safely if synthesis is absent.
- **AC‑K3.6:** The "no Spanish voice" notice (AC‑I2.5) is unchanged. If an adult
  deliberately selects a **non‑Spanish** voice, the app honors the choice (adult
  override) but the notice may still inform them no Spanish voice was detected.

#### AC‑K4 — Lalo more visible on the play screen (D4)
- **AC‑K4.1:** On the play screen, Lalo is repositioned so it is **clearly
  visible to the child during play** — no longer a small element tucked below the
  mic buttons. Target placement: a persistent, reasonably sized Lalo **near the
  reading card** (e.g. a companion beside/above the card, or a larger fixed
  corner presence) rather than a `clamp(48px,12vw,72px)` chip at the bottom.
- **AC‑K4.2:** Lalo's **reactive states still work** in the new position: `idle`
  (breathing), `model` (talking while a word reads), `encourage` (near‑miss), and
  the improved `cheer` (success, D5). The `onMascot(...)` wiring and
  `mascot.setState(...)` contract are unchanged.
- **AC‑K4.3:** Repositioning **must not** overlap or obscure the word, the part
  tiles, the mic/confirm buttons, or the feedback line, and must not steal taps
  intended for the card or buttons (Lalo is `aria-hidden` decorative and
  non‑interactive). It must not reintroduce the empty control removed in D8.
- **AC‑K4.4:** The new placement is **responsive** — it holds at 320px width and
  in short‑landscape without pushing the card, buttons, or feedback off‑screen,
  and it respects very‑young mode and `prefers-reduced-motion` (static expressive
  pose instead of motion).
- **AC‑K4.5:** Lalo remains **decorative** (`aria-hidden="true"`, no tab stop); it
  conveys no information that is not also available as text/audio, so screen‑reader
  and keyboard flows are unaffected.

#### AC‑K5 — Improved success animation (D5)
Make the correct‑pronunciation celebration more delightful without hurting
performance or accessibility.
- **AC‑K5.1:** On a correct answer the app plays an **enhanced** celebration:
  keep the confetti/stars burst + chime, and add at least one new layer of
  polish — e.g. a **card "pop"/bounce** on the hero card, a brighter Lalo `cheer`
  (bigger wave/jump), and/or a richer particle burst (shapes/colors/scale). The
  exact mix is tuned in `7_plan.md`.
- **AC‑K5.2:** The milestone celebration (`playMilestone` / every‑Nth success)
  stays **visibly bigger** than the per‑word one, preserving the existing
  escalation.
- **AC‑K5.3:** The animation is **short and non‑blocking** (≤ ~1s of main
  emphasis; total effect well within the existing `ADVANCE_DELAY_MS = 1200` so
  auto‑advance still fires on time — see AC‑K6). It must not delay or block the
  auto‑read of the next word.
- **AC‑K5.4:** **`prefers-reduced-motion`** is honored: the motion/confetti layer
  is skipped and replaced by the existing non‑motion feedback (sound + haptics +
  a static success state), exactly as the current `celebrate.js` does. No new
  animation bypasses this guard.
- **AC‑K5.5:** The celebration stays **CSS/Canvas/Web‑Audio only** — no animation
  library, no new dependency — and remains 60fps‑friendly (particle counts and
  durations bounded as today).

#### AC‑K6 — Confirm auto‑advance + read‑next (D6)
This confirms (and locks with a test) the iteration‑6 behavior under the new
10‑word goal.
- **AC‑K6.1:** After a correct answer (mic‑verified or self‑confirmed), if the
  session is **not** complete (`levelCorrect < goal`), the app **automatically
  advances** to the next word after `ADVANCE_DELAY_MS` via `nextItem()` — no tap
  required.
- **AC‑K6.2:** The newly presented word is **read aloud right there** when
  auto‑read is enabled (AC‑K7): `nextItem()` sets Lalo to `model` and calls
  `audio.model(state.current)`, exactly **one read per new word**.
- **AC‑K6.3:** If the answer **completes** the level (`levelCorrect === goal`,
  now 10), the app goes to the summary instead of advancing — no stray extra word
  or read fires. (Unit‑tested in `game.test.js`: after the 10th correct answer,
  `completeLevel()` runs and no further `audio.model` auto‑read is triggered.)
- **AC‑K6.4:** A state‑machine test asserts the full micro‑loop: a non‑final
  success → exactly one advance → exactly one new‑word read + one `onMascot("model")`;
  and that no standing "Di la palabra" instruction is emitted on advance (carried
  from AC‑J6.2).

#### AC‑K7 — Configurable auto‑read (D7)
- **AC‑K7.1:** The adult dashboard "Ajustes" section gains an **auto‑read toggle**
  (Spanish label, e.g. "Leer la palabra automáticamente"), default **ON**
  (preserves iteration‑6 behavior for existing users and first‑run).
- **AC‑K7.2:** The setting is **persisted** in `localStorage` (added to the
  `progress` state, default `true`) and reloaded on next launch; `migrate()`
  fills the default for older saved states so no migration breaks.
- **AC‑K7.3:** When **ON**, `nextItem()` auto‑reads every new word exactly as in
  iteration 6 (AC‑K6.2). When **OFF**, `nextItem()` **does not** call
  `audio.model` on display and **does not** force Lalo into `model` for the
  auto‑read; the child can still hear the word on demand (tap card / Enter /
  Space / `l`), and near‑miss modeling + the "¡Lo dije!" flow are unaffected.
  (Unit‑tested: toggle off → zero auto‑read calls per new word; toggle on → one.)
- **AC‑K7.4:** The toggle change takes effect **immediately** for the next word
  (no reload needed) and never blocks, throws, or dead‑ends.

#### AC‑K8 — Remove the empty control above "Hablar" (D8)
- **AC‑K8.1:** The empty element that reserves standing blank space directly above
  the "Hablar" mic button (the idle `#feedback` live region with its
  `min-height: 2.2em`, which has shown no standing text since iteration 6's D6) is
  restructured so it **no longer occupies visible empty space when there is no
  message** — e.g. it collapses to zero height / is visually hidden until it has
  content, then expands for transient status ("Escuchando… 🎤", "¡Muy bien! 🎉").
- **AC‑K8.2:** `#feedback` is **not deleted**: it remains a `role="status"
  aria-live="polite"` live region so transient status/encouragement is still
  announced to assistive tech. Only its *empty standing footprint* is removed.
- **AC‑K8.3:** When a transient message appears, it is still clearly visible
  (styling/contrast unchanged) and does not cause a jarring layout jump that
  shifts the mic button under the user's finger mid‑tap (reserve space via a
  transition or a stable container, tuned in `7_plan.md`).
- **AC‑K8.4:** No other truly empty, space‑only control remains between the hero
  card and the "Hablar" button. (If the restructure interacts with the mascot
  move in D4, the two are reconciled so neither leaves a blank gap.)

---

## Pedagogical Order & Criteria (binding on content — carried forward)

Unchanged from iterations 4–6, still machine‑checked by `words.js` helpers and
now applied to the additional 2‑syllable rows.

**Consonant tiers** (hardest consonant decides the tier):
`tier1 = m,p,l,s,t` · `tier2 = d,n,ñ` · `tier3 = f,b,v,c/k,g,j,r` ·
`tier4 (last) = digraphs ch,ll,rr and z,y,x,w`.

**Ordering within and across bands:** (a) syllable count — **2 before 3 before 4**
(top‑level map order), then (b) consonant tier, then (c) syllable type (all‑open
CV before closed/inverse/cluster), then (d) shorter/more common, then (e)
alphabetical. Digraph/closed words stay in each length band's "especiales" zone.

---

## Technical Specification

### Architecture (unchanged)
Static SPA: one `index.html`, one `css/styles.css`, small vanilla **ES modules**
in `js/`, **no backend, no build step, no bundler, all art inline SVG**, state in
`localStorage`, screens swapped by the `game.js` state machine, PWA via `sw.js` +
`manifest.webmanifest`, CSV inventory under `data/`. **No `app/` folder** — code
lives at the workspace root.

### Data model

- **`data/words-2syllables.csv`** (D2) — add rows so each 2‑syllable band yields
  ≥10 words via `forBand`, inserted at their correct pedagogical ranks and the
  whole file renumbered to stay strictly ascending and `expectedTierKey`‑
  consistent. Schema unchanged
  (`word,syllables,syllable_count,difficulty_rank,emoji,art_id`).
- **`data/words-3syllables.csv` / `data/words-4syllables.csv`** — only touched if
  a band is below 10 under the new goal (AC‑K2.6); otherwise unchanged.
- **Embedded fallbacks** `WORDS` (and `WORDS_3`/`WORDS_4` if topped up) expand so
  every band stays non‑empty/playable offline (AC‑K2.5).
- **`progress` state (`progress.js`)** gains two persisted settings:
  - `autoRead: boolean` (default `true`) — the auto‑read toggle (D7 / AC‑K7).
  - `voicePref: string|null` (default `null` = "Automática") — the chosen voice's
    stable id (`voiceURI`, or a `name|lang` composite as fallback) (D3 / AC‑K3).
  Both are added to `freshState()` and filled by `migrate()` for older v2 states
  (no schema‑version bump needed; missing keys default). `localStorage` key stays
  `silabas:v2`.

### Module changes

- **`js/levels.js`** — change `goal: Math.min(5, poolSize)` →
  `Math.min(10, poolSize)` (AC‑K1.1). Band specs, ids, titles, unlock chain, and
  `buildLevels()`/`all`/`byId`/`firstLevelId`/`nextUnlock`/`isUnlocked`/`mapState`/
  `completeLevel` are otherwise unchanged.
- **`js/speech.js`** —
  - Add a pure, Node‑testable **`resolveVoice(voices, preferredId)`** that returns
    the preferred voice when present, else `pickSpanishVoice(voices)`, else null.
  - Add a tiny **voice‑id helper** (`voiceId(v) → v.voiceURI || v.name+"|"+v.lang`)
    used both to persist and to match a stored preference. Export for testing.
  - `speak(text)` resolves the voice via `resolveVoice(getVoices(), preferredId)`
    where `preferredId` comes from a module‑level setter the app calls with the
    persisted `voicePref`. Add `setPreferredVoice(id)` / `getPreferredVoice()`.
    `utter.lang` follows the resolved voice (else `es-ES`). No change to the
    cancel/await/`voiceschanged`/no‑throw behavior (AC‑K3.4/K3.5).
  - Add a read helper for the UI to enumerate voices
    (`availableVoices() → {id,label,lang}[]`, sorted Spanish‑first) for the
    `<select>` (AC‑K3.1/K3.2). It may reuse `awaitVoices()`/`getVoices()`.
- **`js/game.js`** —
  - Gate the auto‑read in `nextItem()` on `state.progress.autoRead` (AC‑K7.3):
    only set Lalo to `model` + call `audio.model(state.current)` when enabled; the
    rest of `nextItem()` (pick, record‑seen, render) is unchanged.
  - Add setters `setAutoRead(on)` and `setVoicePref(id)` that update + persist
    `state.progress` and (for voice) call `speech.setPreferredVoice(id)`; both
    `render()` after. On game creation, apply the persisted `voicePref` to
    `speech.setPreferredVoice(...)` so the first read already uses it.
  - Confirm/keep the success→advance→read micro‑loop (AC‑K6) — the existing
    `succeed()` / `ADVANCE_DELAY_MS` / `nextItem()` path already implements it;
    this iteration adds the locking tests (AC‑K6.3/K6.4) and ensures the 10th
    success completes the level with no stray read.
  - `dashboardStats()` exposes the new settings (`autoRead`, `voicePref`,
    available voices via `speech.availableVoices()`) so the dashboard can render
    the controls.
- **`index.html`** —
  - **Adult "Ajustes"** gains: a **voice `<select>`** (`#voice-select`, labeled)
    and an **auto‑read toggle** (`#autoread-toggle`), placed with the existing
    difficulty / very‑young / reset controls (D3, D7).
  - **Play screen (D8):** restructure so the idle `#feedback` reserves no standing
    empty space (collapsed/hidden until it has content) while remaining a live
    region (AC‑K8). Remove any remaining purely‑empty spacer above `.primary-action`.
  - **Mascot (D4):** move/relabel the play‑screen Lalo host so it renders near the
    card (markup move + CSS), still `aria-hidden`. (`#game-mascot` id may be kept
    or renamed; `main.js` host lookup updated to match.)
- **`js/main.js`** —
  - Wire `#voice-select` → `game.setVoicePref(e.target.value)` (with `""`/`auto`
    meaning "Automática" → null) and populate its options from
    `speech.availableVoices()`, refreshing on `voiceschanged`. Preselect the
    persisted value.
  - Wire `#autoread-toggle` → `game.setAutoRead(e.target.checked)` and reflect the
    persisted value in `renderDashboard()`.
  - Update the mascot host lookup/mount for the new play‑screen position (D4).
  - Keyboard + gesture recognizer unchanged.
- **`css/styles.css`** —
  - New‑position mascot sizing/placement for the play screen (D4), with
    responsive + reduced‑motion handling (AC‑K4.4).
  - `#feedback` collapses when empty (e.g. `:empty { min-height:0; padding:0; }`
    or a hidden‑until‑content pattern) and animates back when populated, without a
    layout jump under the mic (AC‑K8.1/K8.3).
  - Enhanced success animation: a card pop/bounce keyframe + a stronger `cheer`,
    all behind `prefers-reduced-motion` (AC‑K5).
- **`js/celebrate.js`** — enrich `play()` / `burstConfetti()` (and/or add a card
  "pop" hook the game triggers on success) per AC‑K5, preserving the
  reduced‑motion guard and bounded particle counts. Milestone stays bigger.
- **`js/mascot.js`** — unchanged in contract; may gain a slightly bigger `cheer`
  motion (CSS‑side) for D5. States/`setState` API unchanged.
- **`js/audio.js`** — unchanged (already models a whole word via clip→TTS).
- **`js/progress.js`** — add `autoRead` + `voicePref` to `freshState()`; ensure
  `migrate()` defaults them for older states.
- **`sw.js`** — **bump `CACHE_VERSION`** to `lalo-silabas-v7.0.0` so the updated
  shell, CSVs, and JS ship offline; precache list unchanged in membership (all
  three CSVs already listed).

### New / changed pure contracts
```
// levels.js — every band goal is now min(10, poolSize); shipped bands = 10
level.goal = Math.min(10, level.pool().length)

// speech.js (new, Node-testable)
voiceId(voice)                       -> string           // voiceURI || name+"|"+lang
resolveVoice(voices, preferredId)    -> voice | null      // preferred→spanish-auto→null
setPreferredVoice(id) / getPreferredVoice()
availableVoices()                    -> {id,label,lang}[] // Spanish-first, for the <select>

// game.js
setAutoRead(on: boolean)             // persist + apply to nextItem() auto-read
setVoicePref(id: string|null)        // persist + speech.setPreferredVoice(id)

// progress.js — new persisted fields (defaults)
freshState().autoRead  = true
freshState().voicePref = null   // "Automática"
```
All new logic reuses existing patterns; no new library.

### Testing (Node `--test`, framework‑free; run from workspace root)
```
node --test "js/*.test.js"
node --check js/*.js sw.js
```
- **`levels.test.js`** — assert every band `goal === 10` and every
  `level.pool().length >= 10` (AC‑K1.2); the 10‑word completion is exercised via
  the game test. Existing ordering/unlock‑chain tests unchanged.
- **`words.test.js`** — breadth: each 2‑syllable band partition (`forBand`) has
  ≥10 members; `rowIntegrity`, rank ordering, and `expectedTierKey` consistency on
  every row of the grown 2‑syllable file; 100% art coverage incl. new ids; the
  embedded `WORDS` fallback keeps each 2‑syllable band non‑empty (AC‑K2.5).
- **`speech.test.js`** — `voiceId` stability; `resolveVoice` (preferred‑present →
  chosen; preferred‑absent → Spanish auto; none → null); `availableVoices` is
  Spanish‑first and includes an "Automática" sentinel option (or the UI adds it).
  Existing `pickSpanishVoice` / `normalize` / `classify` tests unchanged.
- **`game.test.js`** — (a) auto‑read ON → each new word fires exactly one
  `audio.model` + one `onMascot("model")`; OFF → zero auto‑read per new word
  (AC‑K7.3); (b) success micro‑loop advances once and reads the next word once
  (AC‑K6.4); (c) the 10th correct answer completes the level with no stray read
  (AC‑K6.3); (d) no standing "Di la palabra" feedback (carried AC‑J6.2).
- **`progress.test.js`** — `freshState()` has `autoRead === true` and
  `voicePref === null`; `migrate()` of an older v2 blob fills both defaults
  without disturbing other fields.
- **Browser‑only (recorded in `7_plan.md`):** the voice `<select>` lists real
  device voices and switching actually changes the spoken voice and persists
  across reload; auto‑read toggle silences/enables the on‑display read live; Lalo
  is clearly visible and reactive during play at 320px and short‑landscape; the
  success animation looks improved and honors reduced‑motion; no empty gap remains
  above "Hablar" and transient feedback shows without a layout jump; contrast
  ≥4.5:1 and the reduced‑motion/high‑contrast/forced‑colors fallbacks still hold.

### Persistence
`localStorage` schema stays `silabas:v2`. Two new keys (`autoRead`, `voicePref`)
are added to the existing progress object and defaulted by `migrate()` — no
version bump, no migration. Only `CACHE_VERSION` bumps (to `v7.0.0`). A persisted
`voicePref` that no longer matches any installed voice falls back to the Spanish
auto‑pick (AC‑K3.4).

---

## Tech Stack Decision (binding — UNCHANGED)
**No change in stack.** Vanilla **HTML5 + CSS3 + JavaScript (ES modules)**, **no
framework, no bundler, no build step, no runtime dependencies**, `localStorage`
only, **all art inline SVG**, offline‑first **PWA** via `sw.js` +
`manifest.webmanifest`, served over http(s)/localhost (with a `file://`
fallback). Specifically:
- **Word inventory = static CSV files** under `data/` (three: 2‑, 3‑, 4‑syllable),
  loaded via `fetch`, parsed by the existing hand‑written parser in `words.js`.
  No CSV library.
- **Pedagogical correctness + band derivation = pure JS helpers + Node `--test`.**
  No validation/schema library.
- **Speech = Web Speech API** (synthesis + recognition), `es-ES`; voice selection
  and the new adult voice override are pure JS over `getVoices()`
  (`resolveVoice`/`pickSpanishVoice`). No TTS/ASR library or service.
- **Settings (auto‑read toggle, voice preference) = `localStorage`** via the
  existing `progress.js`. No settings/state library.
- **Gestures = native Pointer Events**; **layout + card depth + mascot + all
  animation (incl. the improved celebration) = CSS + Canvas + Web Audio only**.
  No gesture/animation/confetti library.
- CSV/art precached by the SW (bump `CACHE_VERSION`). **No `app/` folder; code at
  the workspace root.** Do not introduce frameworks, bundlers, runtime package
  managers, CSV/gesture/animation libraries, or a backend.

---

## Non‑Functional Requirements
- **Session length:** every level is a satisfying **10‑word** session, with pools
  guaranteed ≥10 so the goal is always reachable and never dead‑ends.
- **Vocabulary breadth & correctness:** the 2‑syllable inventory is large enough
  that every 2‑syllable band yields ≥10 words; all rows pass integrity + ordering
  checks; 100% art coverage; words are child‑appropriate, concrete, common.
- **Adult control:** the reading voice and the auto‑read behavior are
  **adult‑configurable and persisted**, with safe fallbacks (chosen voice absent
  → Spanish auto; synthesis absent → silent, app still usable).
- **Delight:** the success moment is noticeably improved yet short (≤ ~1s
  emphasis, inside `ADVANCE_DELAY_MS`), 60fps‑friendly, and never blocks the
  auto‑advance/read of the next word.
- **Visibility of Lalo:** Lalo is a clearly visible, reactive companion on the
  play screen without obscuring the word, controls, or feedback, and without
  stealing taps.
- **Leaner UI:** no empty, space‑only control remains above "Hablar"; transient
  feedback still appears and is announced, without a layout jump under the mic.
- **Accessibility:** ≥4.5:1 text contrast; `prefers-reduced-motion` and
  `prefers-contrast: more` / forced‑colors honored (incl. the new animation and
  mascot position); ≥56px targets; the `#feedback` live region preserved; every
  action has a non‑gesture, keyboard‑reachable equivalent; the voice `<select>`
  and auto‑read toggle are proper labeled form controls; very‑young text‑free
  mode still playable; Lalo stays decorative/`aria-hidden`.
- **Performance / offline / privacy:** unchanged — small CSVs parsed once + cached
  in memory and by the SW; full offline after first load; CSS/Canvas animation
  stays 60fps‑friendly; no accounts/ads/tracking; graceful `file://` fallback; no
  fail states, no dead‑ends.

---

## Out of Scope (iteration 7)
- 5+ syllable words, sentences, phrases, or reading comprehension.
- Bundling/shipping or downloading a Spanish TTS voice in‑app (the voice picker
  only chooses among voices already installed on the device; the "no Spanish
  voice" notice still applies).
- Per‑word or per‑level voice overrides, voice rate/pitch sliders, or exposing the
  recognition locale to adults (reading voice only, this iteration).
- A visual/authoring editor, remote/server‑hosted word lists, or any backend.
- Advanced gestures beyond tap + horizontal swipe; new mascot characters.
- Recorded audio clips (TTS remains the auto‑read source; clips stay a future
  drop‑in via `audio.js` + `sw.js`).
- Automated end‑to‑end / visual‑regression testing of the immersive layout,
  mascot position, animation, contrast, real TTS audio, or the live voice `<select>`
  (verified manually in a browser with notes in `7_plan.md`).
- A `localStorage` schema‑version bump or progress migration (the two new settings
  default in place).
