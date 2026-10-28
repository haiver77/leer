# 6 — Specification: "Lalo y las Sílabas" — Bigger Vocabulary, 4‑Syllable Words, More Levels, Auto‑Read, Swipe‑to‑Advance

Evolves `5_specification.md`. Iteration 5 shipped a words‑only map, guaranteed
Spanish TTS, fewer buttons, and a richer visual design. Iteration 6 takes six
binding demands from `6_input.md`: **more vocabulary**, **more exciting levels
ordered 2→3→4 syllables**, a **new 4‑syllable word list**, **auto‑read on card
display**, **remove the "Siguiente" button** (advance by dragging the card
left), and **remove the "Di la palabra" text**.

Everything accepted in iterations 1–5 is carried forward unless this document
explicitly supersedes it. This iteration **does not touch the tech stack** (it
stays a vanilla, buildless, offline‑first PWA) and **does not re‑open** the
words‑only decision from iteration 5.

---

## Overview & Goals

1. **D1 — Bigger vocabulary.** Grow the CSV inventory to **≥50 two‑syllable
   words** and **≥50 three‑syllable words** (from the current 48 and 26), all
   still ordered easiest‑first and schema‑compatible with the existing loader.
2. **D2 — New 4‑syllable word list.** Add `data/words-4syllables.csv` (same
   schema) with a solid base of 4‑syllable words, loaded by the same pipeline.
3. **D3 — More levels with exciting names, ordered by syllable length.** Expand
   Lalo's map so it **first** covers all 2‑syllable words, **then** all
   3‑syllable words, **then** the new 4‑syllable words. Level titles get more
   playful, "exciting" Spanish names while keeping the easiest‑first pedagogy
   within each length band.
3. **D4 — Auto‑read on display.** As soon as a word appears on the play card,
   the system **reads it aloud automatically** (TTS), without a tap.
4. **D5 — Remove "Siguiente" button.** The on‑screen next button is removed; the
   user advances by **dragging the card to the left** (left‑swipe), which the
   app already supports.
5. **D6 — Remove "Di la palabra" text.** The feedback line no longer shows the
   "Di la palabra 😊" prompt — it is unnecessary clutter.

Non‑goals unchanged: 100% vanilla, buildless, offline‑first, private, free, no
backend, no accounts, no tracking.

---

## Superseded from iteration 5 (explicit — not silently dropped)

- **The on‑screen "Siguiente" chip (`#next-btn`)** that iteration 5 kept "for
  discoverability" is **removed** (D5). Advancing is by left‑swipe (pointer) or
  `ArrowRight` (keyboard) — both already implemented. The gesture first‑use hint
  stays so the swipe affordance remains discoverable.
- **The "Di la palabra 😊" feedback prompt** (`itemPrompt()` and the static
  copy in `index.html`) is **removed** (D6). The feedback line is only used for
  live status ("Escuchando…", "¡Muy bien!", "Inténtalo otra vez"), never for a
  standing instruction.
- **The 6‑band map** from iteration 5 is **replaced** by a larger ordered set
  that adds a 4‑syllable band (and may split long bands); the easiest‑first
  pedagogy and the data‑derived band model are preserved (D3).

Everything else from iterations 1–5 remains in force: the immersive hero card,
tap‑to‑hear + swipe gestures, keyboard parity, world map with staged unlocks,
rewards/sticker book, mastery + adult dashboard, named mascot Lalo, trustworthy
speech (Spanish voice selection, lenient matching, self‑confirm fallback, model
playback), onboarding, very‑young text‑free mode, adult gate, daily goal, full
offline PWA, no dead‑ends / no fail states, ≥56px targets, ≥4.5:1 contrast,
reduced‑motion / high‑contrast fallbacks, and all `words.js` pedagogical‑order
helpers and tests.

---

## Functional Specification

### A. Carried forward (keep — do not regress)
All iteration 1–5 acceptance criteria that this document does not explicitly
supersede remain in force, re‑pointed at the expanded inventory and map where
needed. In particular: words‑only practice (no lone‑syllable level/item/pool/
answer), the per‑word syllable **part tiles** as a within‑word teaching aid,
guaranteed Spanish TTS + the adult "no Spanish voice" notice, lenient
recognition in `es-ES`, the self‑confirm fallback, keyboard + gesture parity,
staged unlocks, stickers, dashboard mastery, and offline.

### B. New / changed features for iteration 6

#### AC‑J1 — Bigger vocabulary (D1)
- **AC‑J1.1:** `data/words-2syllables.csv` contains **≥50** valid rows (today:
  48). `data/words-3syllables.csv` contains **≥50** valid rows (today: 26).
- **AC‑J1.2:** Every new row passes the existing `rowIntegrity` check: the
  hyphen‑split `syllables` join (accent/case‑insensitively) to `word`, and
  `syllable_count` equals the number of parts. (Unit‑tested in `words.test.js`.)
- **AC‑J1.3:** Each file stays ordered by non‑decreasing `difficulty_rank`
  (`isOrderedByRank`) **and** the row order is consistent with the pedagogical
  key `expectedTierKey` (consonant tier → open‑before‑closed → length →
  alphabetical). New rows are inserted at their correct pedagogical position,
  not appended blindly. (Unit‑tested.)
- **AC‑J1.4:** Every row has a non‑empty `emoji` and an `art_id`, and **every
  `art_id` resolves in `art.js`** (100% art coverage, carried from H3). New
  words either reuse an existing art id or add one to `art.js`.
- **AC‑J1.5:** New words are age‑appropriate, concrete, common Spanish nouns a
  young child recognizes (animals, food, toys, body, home). No accents/letters
  outside the taught set that would break the tier model.

#### AC‑J2 — 4‑syllable word list (D2)
- **AC‑J2.1:** A new `data/words-4syllables.csv` exists with the **same header
  and schema** as the 2‑ and 3‑syllable files
  (`word,syllables,syllable_count,difficulty_rank,emoji,art_id`) and a solid
  base of 4‑syllable words (target **≥20**; fewer only if genuinely limited by
  child‑appropriate vocabulary, but no fewer than 12).
- **AC‑J2.2:** Every 4‑syllable row passes `rowIntegrity` with
  `syllable_count === 4`, is ordered by `difficulty_rank`, and is consistent
  with `expectedTierKey`. (Unit‑tested.)
- **AC‑J2.3:** The loader reads this file through the same pipeline: `words.js`
  gains a loaded cache for count‑4, `loadInventory` fetches all three CSVs, and
  `forLevel("palabras-4")` / `forBand({count:4,…})` return the 4‑syllable items.
  A small **embedded fallback** (`WORDS_4`) keeps the 4‑syllable levels playable
  offline / from `file://` (carried pattern from `WORDS` / `WORDS_3`).
- **AC‑J2.4:** `syllableCountForLevel` (and any count→file mapping) handles
  `"palabras-4"` → count 4, and `byWord` searches the count‑4 pool too, so a
  4‑syllable word resolves its parts/art/emoji like any other.

#### AC‑J3 — More levels, exciting names, ordered 2→3→4 (D3)
The map grows so it **first** covers 2‑syllable words, **then** 3‑syllable,
**then** 4‑syllable. Levels are still data‑derived bands over the CSV inventory
via `words.forBand(...)`, and the easiest‑first order within each length band is
preserved.

- **AC‑J3.1:** `levels.all()` lists the bands in strict length order: **all
  2‑syllable bands, then all 3‑syllable bands, then all 4‑syllable bands**. A
  test asserts no higher‑count band precedes a lower‑count band (extends the
  iteration‑5 `expectedTierKey`/count ordering check, now covering count 4).
- **AC‑J3.2:** At least one **new 4‑syllable band** (`pal-4-*`) is added, with a
  `pool()` drawn from `words.forBand({count:4,…})`. The 3‑syllable section is
  expanded enough to absorb the larger 3‑syllable inventory without any single
  band's pool becoming unwieldy (split into open / especiales as needed).
- **AC‑J3.3:** Level **titles are exciting, playful Spanish names** (kid‑facing),
  e.g. "¡A despegar!", "Palabras cohete", "La jungla de sílabas", "Campeones de
  4 sílabas" — while the dashboard keeps the plain pedagogical explanation. The
  exact titles may be tuned in `6_plan.md` as long as they are kid‑friendly,
  distinct, and in Spanish.
- **AC‑J3.4:** Every band still has `type:"word"`, `mode:"word"`,
  `goal = min(5, poolSize)`, a non‑empty `pool()` of inventory words, a resolved
  `artId` (new 4‑syllable island art added to `art.js`), and an empty band is
  skipped so the unlock chain never breaks.
- **AC‑J3.5:** Unlock chaining (`firstLevelId`, `nextUnlock`, `isUnlocked`,
  `completeLevel`, `mapState`) still works across the longer chain; the first
  2‑syllable band is always unlocked and completion unlocks the next band in
  order, ending on the last 4‑syllable band.
- **AC‑J3.6:** Every non‑milestone band has a sticker in `rewards.STICKER_CATALOG`
  and **no sticker points at a removed/renamed level id** (new `pal-4-*` and any
  new 3‑syllable band get catalog entries; the milestone sticker is kept). Card
  themes in `main.js` (`CARD_THEMES`) cover the new band ids.

> Reference band set (ids are stable localStorage/unlock keys; final titles in
> `6_plan.md`):
>
> | order | id | length | source filter |
> |------|------|--------|---------------|
> | 1 | `pal-2-abiertas-1` | 2 | tier 1, open |
> | 2 | `pal-2-abiertas-2` | 2 | tier 2, open |
> | 3 | `pal-2-abiertas-3` | 2 | tier 3, open |
> | 4 | `pal-2-especiales` | 2 | tier 4 / closed / digraph |
> | 5 | `pal-3-abiertas-1` | 3 | tiers 1–2, open |
> | 6 | `pal-3-abiertas-2` | 3 | tier 3, open |
> | 7 | `pal-3-especiales` | 3 | tier 4 / z / ll / closed |
> | 8 | `pal-4-abiertas` | 4 | tiers 1–3, open |
> | 9 | `pal-4-especiales` | 4 | tier 4 / closed |
>
> Band membership is derived at runtime from the CSVs; empty bands are dropped.
> The 3‑syllable split (rows 5–6) and whether the 4‑syllable section needs an
> "especiales" band (row 9) may be tuned in `6_plan.md` based on the actual
> inventory, as long as AC‑J3.1 (2→3→4 order) and AC‑J3.4 hold.

#### AC‑J4 — Auto‑read on word display (D4)
As soon as a new word is shown on the play card, the app reads it aloud.

- **AC‑J4.1:** When a new word is presented (`nextItem()` in `game.js`, including
  the first word on entering a level), the app automatically models the word via
  `audio.model(word)` → `speech.speak` (TTS). The read fires **every** time a new
  word appears, not only the first few (this supersedes the iteration‑1/2
  `autoModelRemaining` throttle for the per‑word auto‑read).
- **AC‑J4.2:** The auto‑read is **not gated behind a tap**; the word is spoken on
  display. Tapping the card (or Enter/Space/`l`) still replays the word
  (carried), and tapping a part tile still speaks that part (carried).
- **AC‑J4.3:** Auto‑read must **never block, throw, or dead‑end** — it reuses
  `speech.speak` which already resolves safely and cancels any in‑flight
  utterance. If no Spanish voice exists it degrades per AC‑I2 (iteration 5) and
  the adult notice still applies; if synthesis is unavailable the app stays fully
  usable and simply reads nothing.
- **AC‑J4.4:** The auto‑read respects the existing model/mascot behavior
  (mascot shows the "model" state while reading). It does not re‑read on an
  unrelated re‑render — only on an actual new‑word transition. (Tested at the
  state‑machine level: `nextItem` triggers exactly one model call per new word.)
- **AC‑J4.5:** The auto‑read uses the **whole word**, matching what is displayed
  (not the individual parts).

#### AC‑J5 — Remove the "Siguiente" button (D5)
- **AC‑J5.1:** The `#next-btn` element is **removed** from `index.html` and its
  `click` wiring + element lookup are removed from `main.js`.
- **AC‑J5.2:** Advancing to the next word remains available via **left‑swipe**
  (drag the card left → `game.swipeNext()`) and **`ArrowRight`** (keyboard). The
  right‑swipe "repeat" and card‑tap "read" gestures are unchanged.
- **AC‑J5.3 (no dead‑end / discoverable):** The first‑use **gesture hint**
  ("👈 Desliza: siguiente") stays and still appears on first play so the swipe
  affordance is discoverable without the button. Keyboard users keep `ArrowRight`.
- **AC‑J5.4:** No remaining markup, CSS, or copy references a visible "Siguiente"
  next control on the play screen (the onboarding "Siguiente" button is a
  separate element and may remain). Dead `.chip-btn`/`#next-btn` CSS is removed
  or repurposed.

#### AC‑J6 — Remove the "Di la palabra" text (D6)
- **AC‑J6.1:** The static "Di la palabra 😊" text in the `#feedback` element in
  `index.html` is removed (empty/neutral initial state, or a brief non‑imperative
  placeholder that is cleared on first render).
- **AC‑J6.2:** `game.js` no longer emits "Di la palabra 😊" as a standing prompt:
  `itemPrompt()` is removed (or returns empty) and the `handlers.onFeedback(...)`
  calls that previously pushed the prompt on `openLevel`/`nextItem`/after success
  no longer set that instruction. The feedback line is reserved for transient
  status/encouragement ("Escuchando… 🎤", "Casi… 👂", "Inténtalo otra vez 🙂",
  "¡Muy bien! 🎉"). The live region stays for accessibility announcements.
- **AC‑J6.3:** No other UI copy reintroduces a standing "Di la palabra"
  instruction. Onboarding step 3 ("Toca 🎤 y dila tú.") is unaffected.

---

## Pedagogical Order & Criteria (binding on content — restated + extended)

Unchanged rules from iterations 4–5, now extended to the 4‑syllable band and the
larger inventory, still machine‑checked by `words.js` helpers.

**Consonant tiers** (hardest consonant in a word decides its tier):
`tier1 = m,p,l,s,t` · `tier2 = d,n,ñ` · `tier3 = f,b,v,c/k,g,j,r` ·
`tier4 (last) = digraphs ch,ll,rr and z,y,x,w`.

**Ordering within and across bands:** (a) **syllable count — 2 before 3 before
4** (this governs the top‑level map order), then (b) consonant tier, then (c)
syllable type (all‑open CV before closed/inverse/cluster), then (d) shorter/more
common, then (e) alphabetical. Digraph/closed words stay in each length band's
"especiales" zone, never the easy zone.

---

## Technical Specification

### Architecture (unchanged)
Static SPA: one `index.html`, one `css/styles.css`, small vanilla **ES modules**
in `js/`, **no backend, no build step, no bundler, all art inline SVG**, state in
`localStorage`, screens swapped by the `game.js` state machine, PWA via `sw.js` +
`manifest.webmanifest`, CSV inventory under `data/`. **No `app/` folder** — code
lives at the workspace root.

### Data model — CSV changes
- **`data/words-2syllables.csv`** — append ≥2 rows to reach **≥50**, each
  inserted at its correct pedagogical rank (renumber `difficulty_rank` so the
  file stays ordered). Schema unchanged.
- **`data/words-3syllables.csv`** — add rows to reach **≥50** (from 26), inserted
  at correct ranks. Schema unchanged.
- **`data/words-4syllables.csv`** — **new** file, same schema, ≥20 rows
  (`syllable_count = 4`), ordered easiest‑first by `difficulty_rank` consistent
  with `expectedTierKey`. Examples of child‑appropriate 4‑syllable words:
  `mariposa` (ma‑ri‑po‑sa), `elefante` (e‑le‑fan‑te), `chocolate`
  (cho‑co‑la‑te), `escalera` (es‑ca‑le‑ra), `bicicleta` (bi‑ci‑cle‑ta),
  `tobogán`, `pelícano`, `cocodrilo`, `caracola`, `telaraña`, `dinosaurio`,
  `calabaza`, `payasito`, `tomatito`, `campanita`. Final list + ranks in
  `6_plan.md`; each row's `art_id` must resolve in `art.js` (add new ids as
  needed).
- All three CSVs remain the single content source; embedded fallbacks stay for
  offline/`file://` and are expanded so **every band is non‑empty offline**,
  including the new 4‑syllable band(s).

### Module changes
- **`js/words.js`**
  - Add a loaded cache + fallback for count‑4: a `WORDS_4` embedded array (same
    item shape), a `loaded4` cache, `syllableCountForLevel("palabras-4") → 4`,
    `loadInventory` fetches `words-4syllables.csv` and returns `{two,three,four}`,
    `forLevel("palabras-4")` serves it, and `byWord` searches `loaded4`/`WORDS_4`.
  - `forBand` already keys off `spec.count`; extend the count map so
    `count:4 → "palabras-4"`. The tier/open/especiales filters are unchanged
    (they reuse `hardestConsonantTier`/`hasDigraph`/`hasClosedSyllable`).
  - All pure helpers (`parseCsv`, `rowIntegrity`, `isOrderedByRank`,
    `expectedTierKey`, `hardestConsonantTier`, …) are reused as‑is.
- **`js/levels.js`** — expand `WORD_BANDS` to the ordered set in AC‑J3 (add
  `pal-4-*`, optionally split the 3‑syllable section). Each new band is
  `{ count, tiers?, special? }` passed to `forBand`. `buildLevels()`,
  `all/byId/firstLevelId/nextUnlock/isUnlocked/mapState/completeLevel` are
  unchanged in shape. New `artId`s per island.
- **`js/game.js`**
  - **Auto‑read (D4):** in `nextItem()`, after resolving `currentWord`, always
    call `audio.model(state.current)` and set the mascot to "model". Remove the
    `autoModelRemaining`‑gated throttle for the per‑word read (the dashboard
    counter may stay for other purposes or be retired — decide in `6_plan.md` —
    but auto‑read no longer depends on it). Ensure a single read per new word.
  - **Remove the standing prompt (D6):** delete `itemPrompt()` (or make it return
    `""`); drop the `onFeedback(itemPrompt(), "neutral")` calls on
    `openLevel`/`skip`/post‑success so no "Di la palabra" instruction is pushed.
    Keep the transient feedback for listening/near/retry/success.
  - Dashboard mastery denominator extends to include count‑4 words
    (`forLevel("palabras-4")`) so "Palabras dominadas" counts the full inventory.
- **`index.html`**
  - Remove `#next-btn` (and tidy `.secondary-controls` to keep only the mascot).
  - Remove the static "Di la palabra 😊" text inside `#feedback` (leave it empty
    or neutral; it is still a live region).
  - Keep the gesture hint, card host, mic + confirm buttons, back‑to‑map.
- **`js/main.js`**
  - Drop the `nextBtn` lookup + its `click` wiring.
  - Add `CARD_THEMES` entries + map `data-id` colours for the new band ids.
  - Keyboard (`ArrowRight` = next, Enter/Space, `l`) and the pointer gesture
    recognizer (tap/left‑swipe/right‑swipe) are unchanged.
  - Dashboard "Palabras dominadas" wording unchanged; the learning‑order copy
    gains a line noting 4‑syllable words come last.
- **`js/rewards.js`** — add stickers for the new band ids (`pal-4-*` and any new
  3‑syllable band); keep one sticker per non‑milestone band + the milestone
  sticker; no entry points at a removed id.
- **`js/audio.js`** — unchanged (already models a whole word via clip→TTS).
- **`js/speech.js`** — unchanged (the iteration‑5 Spanish‑voice logic and the
  safe, non‑throwing `speak` already satisfy AC‑J4.3).
- **`sw.js`** — **bump `CACHE_VERSION`** to `lalo-silabas-v6.0.0` and add
  `./data/words-4syllables.csv` to the precached `SHELL` so the new list and the
  refactor ship offline.

### New / changed pure contracts
```
// words.js
syllableCountForLevel("palabras-4") -> 4
forLevel("palabras-4")  -> Item[]          // count-4 inventory (CSV or WORDS_4 fallback)
forBand({count:4, tiers?, special?}) -> Item[]   // reuses existing filters
loadInventory() -> Promise<{two:Item[], three:Item[], four:Item[]}>
byWord(word)    -> Item|null               // now also searches the count-4 pool

// levels.js — data-derived bands; map order is strictly 2-syll → 3-syll → 4-syll
```
All new logic reuses the already‑tested pure helpers; no new library.

### Testing (Node `--test`, framework‑free)
- **`words.test.js`** — assert counts (≥50 two‑, ≥50 three‑, ≥20 four‑syllable
  via loaded CSVs); `rowIntegrity` on every row of all three files; ordering by
  rank and consistency with `expectedTierKey` per file; `forBand({count:4,…})`
  returns count‑4 items; `byWord` resolves a 4‑syllable word; 100% art coverage
  across all three inventories.
- **`levels.test.js`** — assert the longer chain: every level `type:"word"` with
  a non‑empty pool of inventory words; **strict 2→3→4 length ordering**
  (no higher‑count band before a lower‑count one); within a length band the
  easiest‑first order still holds; a `pal-4-*` band exists; the unlock chain
  (`firstLevelId/nextUnlock/isUnlocked/completeLevel`) is intact end‑to‑end.
- **`game` auto‑read** — a state‑machine test (with stubbed `audio`/`speech`)
  asserting `nextItem()` triggers exactly one word‑model call per new word, and
  that no standing "Di la palabra" string is emitted as feedback (AC‑J4.4/J6.2).
- **`rewards.test.js`** — every band has a sticker; no sticker points at a
  removed/renamed level id; milestone kept.
- **Browser‑only (recorded in `6_plan.md`):** auto‑read actually speaks on a real
  device with a Spanish voice (and the adult notice appears when none exists);
  the play screen has no "Siguiente" button and no "Di la palabra" text; swipe‑
  left and `ArrowRight` advance; the longer map scrolls/lays out at 320px and in
  short‑landscape; contrast ≥4.5:1 and reduced‑motion/high‑contrast fallbacks
  still hold.

### Persistence
`localStorage` schema stays `silabas:v2`. New band ids simply add new per‑level
keys; old progress for renamed/removed 3‑syllable band ids becomes inert
(ignored; unlock starts from the new first level if a key is missing). No
migration — acceptable for a kids' app. Only `CACHE_VERSION` bumps.

---

## Tech Stack Decision (binding — UNCHANGED)
**No change in stack.** Vanilla **HTML5 + CSS3 + JavaScript (ES modules)**, **no
framework, no bundler, no build step, no runtime dependencies**, `localStorage`
only, **all art inline SVG**, offline‑first **PWA** via `sw.js` +
`manifest.webmanifest`, served over http(s)/localhost (with a `file://`
fallback). Specifically:
- **Word inventory = static CSV files** under `data/` (now three: 2‑, 3‑, and
  **4‑syllable**), loaded via `fetch`, parsed by the existing hand‑written parser
  in `words.js`. No CSV library.
- **Pedagogical correctness + word‑band derivation = pure JS helpers + Node
  `--test`.** No validation/schema library.
- **Speech = Web Speech API** (synthesis + recognition), `es-ES`; voice selection
  is a pure JS function (unchanged). Auto‑read reuses `speech.speak`. No TTS/ASR
  library or service.
- **Gestures = native Pointer Events** (left‑swipe to advance); **layout + card
  depth + all animation = CSS only**. No gesture/animation library.
- CSV/art precached by the SW (bump `CACHE_VERSION`, add the new CSV). **No
  `app/` folder; code at the workspace root.** Do not introduce frameworks,
  bundlers, runtime package managers, CSV/gesture/animation libraries, or a
  backend.

---

## Non‑Functional Requirements
- **Vocabulary breadth & correctness:** ≥50 two‑, ≥50 three‑, and a solid base of
  four‑syllable words; every row passes integrity + ordering checks; 100% art
  coverage; words are child‑appropriate, concrete, common Spanish nouns.
- **Pedagogy:** the easiest‑first order is derived and tested for CSV rows and
  the map; the map strictly covers 2‑syllable, then 3‑syllable, then 4‑syllable
  words; digraph/closed words stay in each band's "especiales" zone.
- **Immediate feedback:** a new word is read aloud automatically on display,
  reliably, without blocking or dead‑ending; Spanish‑voice handling from
  iteration 5 still applies (adult notice when none exists).
- **Fewer controls, no dead‑ends:** the "Siguiente" button and the "Di la
  palabra" text are gone, but advancing (swipe‑left / `ArrowRight`) and hearing
  the word (auto‑read / card tap / Enter/Space / `l`) remain fully reachable by
  both pointer and keyboard; the gesture hint keeps swipe discoverable.
- **Accessibility:** ≥4.5:1 text contrast; `prefers-reduced-motion` and
  `prefers-contrast: more` / forced‑colors honored; ≥56px targets; the feedback
  live region preserved; every action has a non‑gesture equivalent; very‑young
  text‑free mode still playable. Auto‑read must not trap focus or interrupt the
  live‑region announcements.
- **Performance / offline / privacy:** unchanged — three small CSVs parsed once +
  cached in memory and by the SW; full offline after first load; CSS‑only
  animation stays 60fps‑friendly; no accounts/ads/tracking; graceful `file://`
  fallback; no fail states, no dead‑ends.

---

## Out of Scope (iteration 6)
- 5+ syllable words, sentences, phrases, or reading comprehension.
- Bundling/shipping or downloading a Spanish TTS voice in‑app (still only prefer
  an installed one and warn when none exists).
- Re‑opening the iteration‑5 words‑only decision or any retired lone‑syllable
  practice.
- A visual/authoring editor, remote/server‑hosted word lists, or any backend.
- Advanced gestures beyond tap + horizontal swipe.
- Recorded audio clips (TTS remains the auto‑read source; clips stay a future
  drop‑in via `audio.js` + `sw.js`).
- Automated end‑to‑end / visual‑regression testing of the immersive layout,
  gestures, animation, contrast, or real TTS audio (verified manually in a
  browser with notes in `6_plan.md`).
- Migrating old progress keys for renamed/removed band ids.
