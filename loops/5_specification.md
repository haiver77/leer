# 5 — Specification: "Lalo y las Sílabas" — Words-Only, Guaranteed Spanish, Fewer Buttons, Richer Visuals

Evolves `4_specification.md`. Iteration 4 was approved at **8.0** (`FINAL_REVIEW.md`),
but the customer reopened the project with four binding demands in `5_input.md`.
This iteration **refactors the practice unit** (from mixed syllables+words to
**words only**), **hardens Spanish speech**, **cuts buttons**, and **elevates the
visuals**. Everything accepted in iterations 1–4 is carried forward unless this
document explicitly supersedes it; the superseded items are listed below so
nothing is silently dropped.

## Overview & Goals

1. **D1 — WORDS ONLY.** Stop practicing standalone syllables. Every practice item
   is a whole **word of ≥2 syllables**. The syllable breakdown stays, but only as
   a **within-word teaching aid** (the word shows its `pa-to` parts), never as a
   lone practice unit. The level map is reorganized around words while keeping the
   iteration-4 easiest-first pedagogy (consonant tier → open-CV before closed/
   cluster → 2 syllables before 3).
2. **D2 — Guaranteed Spanish TTS + recognition.** The app currently reads in
   English because, with no Spanish voice installed, `utterance.voice` stays null
   and the browser's default (English) voice wins despite `lang="es-ES"`, and the
   voice is picked before the async `voiceschanged` list is populated. Fix with a
   robust, awaited, re-picked **`pickSpanishVoice(voices)`** pure function + an
   adult-facing notice when no Spanish voice exists.
3. **D3 — Fewer buttons.** Remove the redundant 🔊 "Escuchar" button (tapping the
   card already reads the word). Keep only strictly-necessary play-screen controls;
   nothing removed may dead-end.
4. **D4 — Richer visual design.** Replace the flat, low-contrast look with a
   vibrant, higher-contrast, colorful, tastefully-animated kid UI — CSS-only, still
   honoring `prefers-reduced-motion` / `prefers-contrast: more` and ≥4.5:1 text
   contrast.

Non-goals unchanged: 100% vanilla, buildless, offline-first, private, free.

---

## Superseded from iterations 1–4 (explicit — not silently dropped)

The following previously-accepted scope is **intentionally retired** by D1
because standalone-syllable practice is no longer a goal:

- **Per-consonant syllable islands** `isla-p … isla-d` (iteration-1/2 map nodes).
- **`mixto`** mixed-syllable level.
- **`digrafos`** (special sounds) and **`cerradas`** (closed syllables) as
  *standalone syllable* practice levels.
- Any acceptance criterion that required practicing or scoring a **lone
  syllable** as the answer unit (e.g. the iteration-1 CV-matrix answer flow and
  the syllable-pool-based mastery denominator).
- `syllables.js` **as a practice-item source** (CV pools, `EXTRA_POOLS`,
  `generate()`), and the parts of `levels.js`/`game.js`/`main.js` that rendered
  and scored a single syllable.

What is **preserved from those systems**: the pedagogical *ordering rule*, the
consonant **tiers**, the digraph/closed-syllable concepts (now expressed through
*words* that contain them), and the mastery / dashboard / rewards / sticker
machinery (re-pointed at words). The digraph and closed-syllable *sounds* still
get taught — inside words like `gallo`, `perro`, `pastel`, `limón`.

---

## Functional Specification

### A. Carried forward (keep — do not regress)
All iteration 1–4 acceptance criteria that are **not** about lone-syllable
practice remain in force, re-pointed at words where needed. In particular:
the immersive hero card (G1), tap-to-hear + swipe-to-advance gestures (G3, H6),
keyboard parity (H6), world map with staged unlocks, rewards/sticker book,
mastery + adult dashboard with the educational-order explanation (G5), named
mascot Lalo, trustworthy speech (mic + lenient matching + self-confirm fallback +
model playback), onboarding, very-young text-free mode, adult gate, daily goal,
PWA / full offline, no dead-ends / no fail states, ≥56px targets, the
CSV-inventory + 2- & 3-syllable word levels (G4), the pedagogical-correctness
helpers and tests in `words.js` (H1/H2), content breadth + 100% art coverage
(H3), and no-clip-at-320px / short-landscape (H5). These are **tightened** by the
word-based refactor below and the four new AC groups; none of them is removed.

### B. New / changed features for iteration 5

#### AC-I1 — Words-only practice & word-based level map (D1)
The entire practice loop operates on words; there is no syllable-only level,
item, pool, or answer path.

- **AC-I1.1:** `levels.all()` contains **only word levels** (`type === "word"`).
  The ids `isla-p`, `isla-m`, `isla-s`, `isla-t`, `isla-l`, `isla-d`, `mixto`,
  `digrafos`, `cerradas` **no longer exist** in the level list. (Unit-tested in
  `levels.test.js`.)
- **AC-I1.2:** Every level's `pool()` returns **word strings** drawn from the CSV
  inventory (via `words.forLevel(...)`), never syllable tokens from
  `syllables.js`. `levels.js` no longer imports `syllables.js`.
- **AC-I1.3:** The new map preserves easiest-first order: word **families/tiers**
  are introduced in the iteration-4 order (consonant tier 1 → 2 → 3 → 4/digraph;
  within a tier open-CV words before closed/cluster words; all 2-syllable tiers
  before 3-syllable tiers). The ordering is **derivable** from the existing
  `expectedTierKey` in `words.js` so it is machine-checkable (AC-I1.7).
- **AC-I1.4:** In the play screen the practice unit is the **whole word**; the
  success condition is saying/confirming the *word* (not a syllable). The word
  still displays its syllable **parts** (`pa-to`) as a visual aid, and each part
  tile remains individually tappable to hear that syllable (teaching aid only —
  tapping a part never counts as the answer). (Carries the iteration-2 word-tile
  behaviour; supersedes lone-syllable answering.)
- **AC-I1.5:** The play prompt and feedback copy talk about **words** in every
  level (e.g. "Di la palabra 😊"); the `syllable`-vs-`word` branch in
  `game.js` (`isWordLevel()`, `itemPrompt()`) is removed — the only mode is word.
- **AC-I1.6:** Onboarding, the welcome subtitle, and the dashboard copy talk
  about **reading words** (syllables framed as the *parts of a word*), not about
  practicing syllables on their own. The theme name "Lalo y las Sílabas" stays
  (sílabas = the parts within the words). (Verified by copy review +
  `levels`/dashboard strings.)
- **AC-I1.7:** A test asserts the word-level map order is consistent with
  `expectedTierKey` (no higher-tier family before a strictly-lower-tier family;
  no 3-syllable tier before the 2-syllable tiers of the same family), i.e. the
  easiest-first pedagogy survives the reorg. FAILS if a digraph-word family or a
  3-syllable level is moved before the open-CV tier-1 words.

**New word-based level model (replacing the old chain).** Levels are grouped by
**consonant/sound family within a syllable-length band**, ordered easiest-first.
Concrete definition (ids are stable localStorage/unlock keys):

| order | id | title (ES) | source | notes |
|------|------|-----------|--------|-------|
| 1 | `pal-2-abiertas-1` | Palabras fáciles (m, p, l, s, t) | 2-syll, tier-1, open-CV | easiest zone |
| 2 | `pal-2-abiertas-2` | Más palabras (d, n, ñ) | 2-syll, tier-2, open-CV | |
| 3 | `pal-2-abiertas-3` | Palabras nuevas (b, c, f, g, j, r…) | 2-syll, tier-3, open-CV | |
| 4 | `pal-2-especiales` | Palabras con sonidos especiales | 2-syll, tier-4 / closed (`jamón`, `limón`, `pastel`, `gallo`, `pollo`, `perro`, `pozo`, `taza`) | digraph/closed words last |
| 5 | `pal-3-abiertas` | Palabras largas fáciles | 3-syll, tier 1–3, open-CV | all 2-syll bands precede 3-syll |
| 6 | `pal-3-especiales` | Palabras largas especiales | 3-syll, tier-4 / `z`/`ll` (`cereza`, `cabeza`, `zapato`, `semilla`, `gallina`) | final tier |

- Each level selects its words by filtering the ordered CSV inventory with the
  pure helpers already in `words.js` (`hardestConsonantTier`, `hasDigraph`,
  `hasClosedSyllable`) plus `syllableCount`, so the grouping is derived from data,
  not hand-listed in two places.
- `goal` per level = 5 (or `min(5, poolSize)` so a thin family never dead-ends).
- The map still renders staged unlocks, stars, badges exactly as before; only the
  node set changes. A level with an empty pool (should not happen) is skipped so
  the chain never breaks.

> Exact band membership is derived at runtime from the CSVs; the table is the
> reference. If a band would be empty it is dropped from the chain (keeps unlock
> continuity). The number/titles of nodes may be tuned in `5_plan.md` as long as
> AC-I1.1/I1.3/I1.7 hold.

#### AC-I2 — Guaranteed Spanish voice + recognition (D2)
Make Spanish TTS reliable and never silently read English; keep recognition in
`es-ES`; expose the selection logic as a **pure, exported, unit-tested** function.

- **AC-I2.1 (pure contract):** `speech.js` exports
  `pickSpanishVoice(voices) -> SpeechSynthesisVoice|null` — a **pure** function of
  a voices array (no browser globals), unit-testable in Node with plain objects.
  Preference order, strongly favouring Spanish:
  1. exact `es-ES`
  2. `es-MX`
  3. `es-US`
  4. `es-419`
  5. any other `es-*` (case/`-`/`_` insensitive, e.g. `es_AR`, `ES`)
  6. name contains `spanish`/`español` (case-insensitive)
  7. otherwise `null` (caller decides fallback).
  A `localService`/`default` voice within the same language bucket is preferred
  over a remote one as a stable tiebreak. (Unit-tested in
  `speech.test.js` / `logic.test.js`.)
- **AC-I2.2 (await the list):** Before the first `speak`, the app **awaits the
  voices list** — resolving when `speechSynthesis.getVoices()` is non-empty OR the
  `voiceschanged` event fires (whichever first), with a short timeout fallback so
  it never hangs. The voice is **re-picked on every `speak`** via
  `pickSpanishVoice(getVoices())`, not cached once at load (Chrome populates
  lazily).
- **AC-I2.3 (never silently English):** On every utterance `lang` is set to the
  chosen voice's lang when a Spanish voice exists, else kept `"es-ES"`. If
  `pickSpanishVoice` returns null, `utterance.voice` stays null, `lang="es-ES"` is
  still set (best effort), **and the app records "no Spanish voice available"** so
  the dashboard can warn (AC-I2.5) — the app does not pretend Spanish playback
  works.
- **AC-I2.4 (recognition stays Spanish):** `SpeechRecognition.lang` remains
  `"es-ES"` (unchanged). (Carried from prior iterations; re-asserted.)
- **AC-I2.5 (adult-facing notice):** When no `es-*` voice is detected, the **adult
  dashboard** shows a clear notice (e.g. "No se encontró una voz en español en
  este dispositivo. La lectura puede sonar en otro idioma. Instala una voz en
  español en los ajustes del sistema."). The notice is absent when a Spanish voice
  is present. Exposed via a testable predicate (e.g. `hasSpanishVoice(voices)` or
  the boolean surfaced by the speech module) so the branch is checkable.
- **AC-I2.6:** `speak()` still never throws and always resolves (keeps the
  no-dead-end guarantee), and `normalize`/`classify` (lenient matcher) are
  unchanged.

#### AC-I3 — Fewer buttons on the play screen (D3)
Remove redundant controls; keep only what is strictly necessary; no dead-ends.

- **AC-I3.1:** The dedicated **🔊 "Escuchar" button (`#listen-btn`) is removed**
  from the markup and its wiring in `main.js`. Hearing the word is done by
  **tapping the card** (pointer) or **Enter/Space** on the focused card (keyboard)
  — both already call the model-playback intent (`tapCard` → `listenToModel`).
- **AC-I3.2:** The play screen keeps **only**: the primary **🎤 "Hablar"** action
  (speak/mic); the **✅ "¡Lo dije!"** self-confirm *fallback*; and **🗺️ back-to-map**.
  Advancing to the next word is via **left-swipe** or the **→/ArrowRight**
  keyboard shortcut; a visible "Siguiente" button is **not** required on screen.
  (If usability testing in `5_plan.md` shows the next affordance is undiscoverable
  without a control, a single small "Siguiente" chip may remain — but the 🔊
  button does not return.)
- **AC-I3.3 (self-confirm only when needed):** The ✅ self-confirm control is the
  non-mic fallback. When recognition is supported it stays available but
  secondary; when recognition is unsupported/denied it becomes the primary path
  (as today). The mic button hides when recognition is unavailable — the user is
  never left without a way to answer.
- **AC-I3.4 (no dead-ends):** Every action formerly reached by a removed button is
  still reachable: hear-word = card tap / Enter / Space / the existing `l`
  shortcut; next = swipe / ArrowRight; hear-a-part = the per-part word tiles.
  Keyboard parity and gesture parity from H6 still hold.
- **AC-I3.5:** Onboarding copy that referenced the 🔊 button ("Toca 🔊 para
  oírla") is updated to the card-tap affordance ("Toca la tarjeta para oírla").

#### AC-I4 — Richer visual design (D4)
Elevate the look: more color, depth, contrast, and tasteful CSS-only motion,
without violating a11y.

- **AC-I4.1 (palette & contrast):** A more vibrant, higher-contrast palette
  (deeper background gradient, saturated accents, distinct per-family node
  colours). All text keeps **≥4.5:1** contrast against its background (large card
  text and body copy measured); the check is documented in `5_plan.md`.
- **AC-I4.2 (hero-card depth):** The hero card gains real depth: layered shadow,
  soft inner gradient, rounded accent border tinted by the current family theme
  (extending H4), and a subtle entrance animation when a new word appears.
- **AC-I4.3 (map-node polish):** Map nodes get colorful, per-family fills with
  depth (shadow/gradient), a clear locked/unlocked/completed visual language, and
  a gentle hover/press/pop animation.
- **AC-I4.4 (delightful animations, tasteful):** Add/keep CSS-only animations for:
  success feedback (card/stars pop), the mascot reactions, the confetti
  celebration, screen/card transitions, and a new-word entrance. Animations are
  short (≤600ms), non-blocking, and never gate progress.
- **AC-I4.5 (reduced-motion):** Under `prefers-reduced-motion: reduce` **all**
  non-essential animation (entrance, pops, gradient motion, mascot bounce) is
  disabled or reduced to a near-instant fade; the app stays fully usable and the
  reading flow still advances. (Carried + extended from prior iterations.)
- **AC-I4.6 (high-contrast):** Under `prefers-contrast: more` / forced-colors the
  richer treatment degrades to a solid, legible high-contrast card and nodes
  (no reliance on faint gradients for meaning); text stays ≥4.5:1.
- **AC-I4.7 (CSS-only / no deps):** All animation and depth are pure CSS
  (gradients, `box-shadow`, `transform`, `@keyframes`, `transition`); **no
  animation/JS library** is added. Tech stack unchanged.

---

## Pedagogical Order & Criteria (binding on content — restated)

Unchanged from iteration 4 and still machine-checked by `words.js` helpers; now it
*also* governs the word-based **level map** order (AC-I1.7), not just the CSV row
order.

**Consonant tiers** (hardest consonant in a word decides its tier):
`tier1 = m,p,l,s,t` · `tier2 = d,n,ñ` · `tier3 = f,b,v,c/k,g,j,r` ·
`tier4 (last) = digraphs ch,ll,rr and z,y,x,w`.

**Ordering:** (a) consonant tier, then (b) syllable type (all-open CV before
closed/inverse/cluster of the same count), then (c) 2 syllables before 3, then
(d) shorter/more common, then (e) alphabetical. Lower = earlier. Digraph/closed
words live in the tier-4/"especiales" bands, never the easy zone.

---

## Technical Specification

### Architecture (unchanged)
Static SPA: one `index.html`, one `css/styles.css`, small vanilla **ES modules**
in `js/`, **no backend, no build step, no bundler, all art inline SVG**, state in
`localStorage`, screens swapped by the `game.js` state machine, PWA via `sw.js` +
`manifest.webmanifest`, CSV inventory under `data/`. **No `app/` folder** — code
lives at the workspace root.

### Module changes

- **`js/levels.js`** — **remove** `isla-*`, `mixto`, `digrafos`, `cerradas`.
  **Remove the `import … from "./syllables.js"`.** Rebuild `buildLevels()` to emit
  the **word-based bands** (table in AC-I1). Each node `type:"word"`,
  `mode:"word"`, with a `pool()` that filters `words.forLevel("palabras")` /
  `words.forLevel("palabras-3")` by family (tier via `hardestConsonantTier`,
  closed/digraph via `hasClosedSyllable`/`hasDigraph`) and maps to `.word`. Keep
  `all/byId/firstLevelId/nextUnlock/isUnlocked/mapState/completeLevel` unchanged in
  shape. New `artId`s for the word islands (add to `art.js`). Skip any empty band.
- **`js/words.js`** — **no breaking change.** Reuse `forLevel`, `byWord`,
  `hardestConsonantTier`, `hasDigraph`, `hasClosedSyllable`, `expectedTierKey`,
  `isOrderedByRank`, `rowIntegrity`, `parseCsv`, `loadInventory`. Add a small
  helper if convenient (e.g. `forBand({count, tiers, closed})`) used by
  `levels.js`, pure and testable. Fallback `WORDS`/`WORDS_3` stay (offline/file://).
- **`js/game.js`** — collapse the syllable/word duality: remove `isWordLevel()`
  branching, the `syllable-card` path, and syllable-only prompts; the loop always
  loads words via the level `pool()` and resolves `currentWord` via `words.byWord`.
  `itemPrompt()` always returns the word prompt. `succeed()` scores the **word**.
  **Remove `import … from "./syllables.js"`** (its only remaining uses are the
  removed pools and `pickRandom`; keep a tiny local non-repeating picker, or
  import just `pickRandom` if retained — see below). Dashboard mastery denominator
  switches from `syllables.generate("all")` to the **set of inventory words**
  (`words.forLevel("palabras")` + `words.forLevel("palabras-3")` → `.word`), so
  "dominadas" counts words, and the dashboard label changes to **"Palabras
  dominadas"**.
- **`js/syllables.js`** — the CV/`EXTRA_POOLS`/`generate` practice pools are
  **superseded** (no longer a practice source). Keep only `pickRandom` (pure
  non-repeating selector) if `game.js` still uses it; otherwise the module may be
  reduced to `pickRandom` + `titleCase`. Do **not** delete the file if other
  modules import it; instead trim exports and update `sw.js`/tests. (Decision
  recorded here so the removal is explicit, not silent.)
- **`js/speech.js`** — **export** `pickSpanishVoice(voices)` as a **pure** function
  per AC-I2.1 (accepts an array, no window access). Add an internal
  `awaitVoices()` that resolves when `getVoices()` is non-empty or `voiceschanged`
  fires (with a timeout). `speak()` awaits voices, re-picks the voice each call,
  sets `utter.lang` to the picked voice's lang (else `"es-ES"`), and when no
  Spanish voice exists records the "no Spanish voice" state. Add an exported
  predicate `hasSpanishVoice(voices)` (pure) and a browser-side getter the
  dashboard reads for AC-I2.5. `SpeechRecognition.lang` stays `"es-ES"`.
  `normalize`/`classify`/`listen` behaviour unchanged.
- **`index.html`** — **remove** the `#listen-btn` (🔊) and its
  `.secondary-controls` placement; keep the mascot and (optionally) a single
  "Siguiente" chip per AC-I3.2. Remove the standalone `#syllable-card` element (or
  keep it `hidden` and unused) — the word view is the only card content. Add the
  dashboard **Spanish-voice notice** element (hidden by default). Update the
  welcome subtitle + onboarding demo copy to talk about **words** and **card-tap**.
  Update the dashboard "Sílabas dominadas" label to "Palabras dominadas" and the
  learning-order copy to describe word families.
- **`css/styles.css`** — richer palette + per-family theme variables; hero-card
  depth (layered shadow + inner gradient + accent border + entrance keyframe);
  colorful map-node styling with depth and state visuals; success/mascot/
  transition animations; strengthen `prefers-reduced-motion` and
  `prefers-contrast: more`/forced-colors fallbacks; verify ≥4.5:1 text contrast.
  Remove now-dead `.syllable-card`/`#listen-btn` rules or repurpose them.
- **`js/main.js`** — drop `listenBtn` lookup + its `click` wiring; drop the
  `syllable-card` rendering branch in `renderPlay` (always render the word view);
  render the dashboard Spanish-voice notice from the speech module's predicate;
  update `ONBOARDING_TEXT` to the card-tap wording; `CARD_THEMES` re-keyed to the
  new word-level ids. Gesture recognizer + keyboard handlers unchanged (card tap,
  swipe-next, Enter/Space, `l`, ArrowRight all still valid).
- **`js/rewards.js`** — `STICKER_CATALOG` **re-pointed** to the new word-level ids
  (`pal-2-abiertas-1` … `pal-3-especiales`); drop stickers tied to removed
  `isla-*`/`mixto`/`digrafos`/`cerradas` ids (or remap them to the nearest word
  band) so every level still grants a sticker and no catalog entry references a
  dead level. Keep the milestone sticker.
- **`sw.js`** — **bump `CACHE_VERSION`** to `lalo-silabas-v5.0.0` so the refactor
  ships offline. Update the `SHELL` list if `syllables.js` is trimmed/removed
  (keep it listed only if the file still exists and is imported). CSVs stay
  precached.

### New / changed pure contracts
```
// speech.js
pickSpanishVoice(voices: {lang:string,name?:string,localService?:boolean,default?:boolean}[])
  -> voice | null
  // preference: es-ES > es-MX > es-US > es-419 > any es-* > name~spanish/español > null
hasSpanishVoice(voices) -> boolean   // true iff some es-* (or name-matched) voice exists

// levels.js (data-derived bands; no second source of truth)
pool() per word level filters words.forLevel(count) by { tiers:Set<1..4>, closed:bool }
```
`pickSpanishVoice` + `hasSpanishVoice` are pure and unit-tested with plain voice
objects; the band filters reuse the already-tested `words.js` helpers.

### Data model — do the CSVs change?
**No schema change and no re-ranking required.** The existing
`words-2syllables.csv` (48 rows) and `words-3syllables.csv` (26 rows) are already
ordered easiest-first and carry `word,syllables,syllable_count,difficulty_rank,
emoji,art_id`. The word-based bands are derived from these rows at runtime by the
`words.js` helpers, so the levels inherit the correct order for free. (Optional:
a short comment-equivalent note in `5_plan.md` mapping rows → bands.) The CSVs
remain the single content source; the embedded fallbacks stay for offline/file://.

### How syllable breakdown remains a teaching aid
The word view keeps the **part tiles** (`pa` + `to`) and the whole word; each tile
is tappable to hear that syllable (model only). This is the *only* place syllables
appear, and it is explicitly a within-word aid — there is no level, pool, score,
or success condition built on a lone syllable (AC-I1.4). The dashboard explains
that words are split into syllables to help children decode them.

### Testing (Node `--test`, framework-free)
- **`levels.test.js`** — assert the new word-only chain: no `isla-*`/`mixto`/
  `digrafos`/`cerradas` ids (AC-I1.1); every level `type==="word"` and its `pool()`
  returns non-empty word strings present in the inventory (AC-I1.2); the band
  order is consistent with `expectedTierKey` and 2-syll bands precede 3-syll bands
  (AC-I1.3/I1.7); `nextUnlock`/`isUnlocked`/`completeLevel` still chain correctly.
- **`speech.test.js`** (or added to `logic.test.js`) — direct unit tests for
  `pickSpanishVoice(voices)`: prefers `es-ES` over `es-MX`/`en-US`; picks any
  `es-*` when no exact; name-matches "Spanish"/"español"; returns null when no
  Spanish voice; `localService` tiebreak. `hasSpanishVoice` true/false cases.
- **`words.test.js`** — keep all iteration-4 tests (helpers, ordering correctness,
  counts, art coverage). Add coverage for any new `forBand` helper.
- **`rewards.test.js`** — update expected sticker ids to the word-level ids; assert
  every non-milestone level in `levels.all()` has a sticker and no sticker points
  at a removed level.
- **`levels.test.js`/old syllable tests** — remove or rewrite assertions that
  depended on the retired syllable levels/pools (explicitly superseded).
- Browser-only (recorded in `5_plan.md` with evidence): Spanish playback actually
  sounds Spanish when a voice is installed + the dashboard notice when it is not
  (AC-I2.5); contrast ≥4.5:1 and reduced-motion/high-contrast fallbacks (AC-I4);
  the trimmed play screen has no dead-ends (AC-I3.4); gestures/keyboard parity
  (H6) still hold at 320px + short-landscape (H5).

### Persistence
`localStorage` schema stays `silabas:v2`. Progress keyed by level id: because the
level ids change, **old `isla-*` progress keys become inert** (ignored; unlock
starts from the new first level). This is acceptable for a kids' app and avoids a
migration; note it in `5_plan.md`. Only the SW `CACHE_VERSION` bumps.

---

## Tech Stack Decision (binding — UNCHANGED)
**No change in stack.** Vanilla **HTML5 + CSS3 + JavaScript (ES modules)**, **no
framework, no bundler, no build step, no runtime dependencies**, `localStorage`
only, **all art inline SVG**, offline-first **PWA** via `sw.js` +
`manifest.webmanifest`, served over http(s)/localhost. Specifically:
- **Word inventory = static CSV files** under `data/`, loaded via `fetch`, parsed
  by the existing hand-written parser in `words.js`. No CSV library.
- **Pedagogical correctness + word-band derivation = pure JS helpers + Node
  `--test`.** No validation/schema library.
- **Speech = Web Speech API** (synthesis + recognition), `es-ES`; voice selection
  is a **pure JS** function. No TTS/ASR library or service.
- **Gestures = native Pointer Events**; **layout + card depth + all animation =
  CSS only** (`clamp`, `dvh`/`dvw`, gradients, `box-shadow`, `transform`,
  `@keyframes`, `:focus-visible`, media queries). **No animation library.**
- CSV/art precached by the SW (bump `CACHE_VERSION`). **No `app/` folder; code at
  the workspace root.** Do not introduce frameworks, bundlers, runtime package
  managers, CSV/gesture/animation libraries, or a backend.

---

## Non-Functional Requirements
- **Words-only consistency:** no syllable-only level, item, pool, score, or
  success path anywhere; syllables appear solely as within-word part tiles.
- **Spanish correctness:** TTS prefers an installed Spanish voice, awaits the
  voice list, re-picks per utterance, never silently reads English (warns the
  adult when no Spanish voice exists); recognition stays `es-ES`.
- **Pedagogical correctness:** the easiest-first order is *derived and tested* for
  both the CSV rows and the new word-level map; digraph/closed words stay in the
  "especiales"/tier-4 bands.
- **Accessibility:** ≥4.5:1 text contrast on the richer palette; `prefers-reduced-
  motion` and `prefers-contrast: more`/forced-colors honored; card tap-to-hear
  reachable by keyboard (Enter/Space, visible focus) and the live region
  preserved; ≥56px targets; every action has a non-gesture equivalent; very-young
  text-free mode still playable; fewer buttons must not remove any path.
- **Performance / offline / privacy:** unchanged — tiny CSVs parsed once + cached
  in memory and by the SW; full offline after first load; CSS-only animation stays
  60fps-friendly and non-blocking; no accounts/ads/tracking; graceful `file://`
  fallback; no fail states, no dead-ends.

---

## Out of Scope (iteration 5)
- 4+ syllable words, sentences, or reading comprehension.
- Bundling or shipping a Spanish TTS voice / downloading voices in-app (we can
  only *prefer* an installed one and warn when none exists).
- Re-ranking or re-authoring the CSV inventory (reused as-is; schema unchanged).
- A visual/authoring editor, remote/server-hosted word lists, or any backend.
- Advanced gestures beyond tap + horizontal swipe.
- Automated end-to-end / visual-regression testing of the immersive layout,
  gestures, animation, contrast, or real TTS audio (verified manually in a browser
  with screenshots/notes in `5_plan.md`).
- Migrating old `isla-*` localStorage progress to the new level ids.
- Re-opening any iteration 1–4 scope **except** the explicitly superseded
  lone-syllable practice listed above; all other prior accepted features remain in
  force, re-pointed at words.
