# 3 — Specification: "Lalo y las Sílabas" — Immersive Reading Card + Pedagogical Word Order

Evolves `2_specification.md`. Iteration 2 shipped the named mascot, world map,
rewards, mastery tracking, trustworthy speech, PWA shell, and the one-primary-
action game screen. **Everything accepted in iterations 1–2 is carried forward
unchanged** unless this document explicitly supersedes it. Iteration 3 is a
focused refinement of the **play screen** and the **word content**, not a
redesign of the product.

## Overview & Goals

Two customer demands drive this iteration (`3_input.md`):

1. **Better use of space while reading** — the Spanish word/syllable card is too
   small and surrounded by too many buttons and too much text. Make the card the
   hero: it should fill almost the whole screen, adapt to any device, keep only
   the strictly necessary controls, and add **touch gestures** (swipe left →
   next; tap the card → read it aloud).
2. **Pedagogically ordered practice words** — today's word list is ad hoc. Build
   a real **word inventory in data files** (CSV/text), one for 2-syllable words
   and one for 3-syllable words, ordered **easiest-first** by a researched
   Spanish syllable-learning sequence, and make the whole app follow an explicit
   educational order and criteria.

Non-goals stay the same: 100% vanilla, buildless, offline-first, private, free.

---

## Functional Specification

### A. Carried forward (keep — do not regress)
All iteration-1 (AC1–AC8) and iteration-2 (AC-F1…F14) acceptance criteria remain
valid. In particular the **one-primary-action** direction of F8, the trustworthy
speech of F9, mascot reactions (F10), rewards (F3), mastery (F4), map (F2),
dashboard (F7), and PWA/offline (F13) are unchanged. Iteration 3 tightens the
play-screen layout under F8 and replaces the word *content source*, not the word
*flow* (F5).

### B. New / changed features for iteration 3

#### G1 — Immersive, device-adaptive reading card
The play screen is restructured so the **current item (syllable card or word)
is the dominant element**, sized to fill most of the viewport on any device.

- The card scales fluidly with the viewport (phone portrait, tablet, landscape)
  using responsive units; the word/syllable text is as large as fits without
  clipping or horizontal scroll, down to the longest 3-syllable word.
- Decorative/secondary chrome (score header, item-art cue, mascot) is minimized
  or repositioned so it never competes with the card for space.
- **AC-G1.1:** On the play screen the card (syllable or whole word) is the single
  largest element and occupies the majority of the available content area across
  phone-portrait, tablet, and landscape without clipping or overflow.
- **AC-G1.2:** The longest supported word (a 3-syllable word) renders fully
  inside the card at a readable size with no horizontal scroll and no overlap
  with controls, at 320px-wide and up.
- **AC-G1.3:** `prefers-reduced-motion` and high-contrast still apply to the
  enlarged card; large-text/zoom does not break the layout.

#### G2 — Strictly-necessary controls only
Reduce the play screen to the minimum controls needed to play.

- **Kept on screen:** the primary **speak/mic** action; the **self-confirm**
  fallback (only when mic is unavailable/denied, per F9); **back-to-map**. Listen
  and Next become **gesture-first** (tap-to-hear, swipe-to-advance, see G3) with a
  small, de-emphasized visible affordance retained for discoverability and
  keyboard/accessibility parity.
- No control is removed that would create a dead-end or break an existing AC
  (self-confirm fallback, keyboard paths, and a reachable listen+next remain).
- **AC-G2.1:** The play screen shows no more than the essential controls: one
  dominant primary action plus a small, clearly subordinate cluster (listen,
  next, back) — visibly fewer/lighter than iteration 2.
- **AC-G2.2:** Every action still reachable in iteration 2 (listen, next/skip,
  self-confirm when needed, back-to-map) remains reachable in iteration 3 via a
  control and/or a gesture and/or a keyboard key; nothing dead-ends.

#### G3 — Touch gestures on the card
Add direct-manipulation gestures on the reading card.

- **Tap the card** → the system reads the current item aloud (same as the Listen/
  model action; mascot enters "model" state). A tap must not be interpreted as a
  swipe, and vice versa.
- **Swipe left on the card** → advance to the next item (same as Next/skip).
  Optionally **swipe right** → repeat/stay (no destructive action); if not
  implemented, swipe right is a no-op, never an error.
- Gestures are additive: pointer/mouse/keyboard paths all still work, so the game
  is fully playable without touch.
- A subtle first-use hint (voiced and/or iconographic, honoring very-young mode)
  teaches the two gestures; it never blocks play.
- **AC-G3.1:** A tap on the card triggers model playback of the current item
  (audio clip or TTS fallback) and the mascot "model" reaction.
- **AC-G3.2:** A left swipe on the card advances to the next item (no-repeat
  selection preserved); a tap and a swipe are disambiguated by movement/time
  thresholds so one gesture never fires the other.
- **AC-G3.3:** Gestures honor `prefers-reduced-motion` (advance still works;
  motion is reduced) and do not interfere with the mic, keyboard, or self-confirm
  paths. Pointer Events are used so mouse, touch, and pen all work.

#### G4 — Pedagogically ordered word inventory (data files)
Replace the hard-coded `WORDS` array with a **researched, ordered inventory**
stored in data files and loaded at runtime.

- Two inventory files:
  - `data/words-2syllables.csv` — all 2-syllable practice words.
  - `data/words-3syllables.csv` — all 3-syllable practice words (new content).
- Each file is **ordered easiest-first** by the difficulty criteria in
  "Pedagogical order & criteria" below (lowest `difficulty_rank` first).
- 3-syllable words are a **new level** that unlocks after the existing 2-syllable
  words level, keeping the staged map arc (F2) intact.
- The word flow (F5: show parts + whole, hear/say, celebrate) is unchanged; only
  the content source and ordering change, now covering 3 parts for 3-syllable
  words.
- **AC-G4.1:** Practice words are loaded from the data files (not a hard-coded
  list); the 2-syllable level draws from `words-2syllables.csv` and the new
  3-syllable level from `words-3syllables.csv`.
- **AC-G4.2:** Within each file, words appear in non-decreasing `difficulty_rank`
  order (easiest-first); an integrity check/test asserts the ordering and that
  each row's `syllables` join to `word` and `syllable_count` matches.
- **AC-G4.3:** A 3-syllable word level exists, unlocks after the 2-syllable word
  level, and presents three parts that combine into the whole word with a picture
  cue; saying the whole word (or, leniently, the parts) succeeds via the existing
  speech path.
- **AC-G4.4:** If a data file fails to load (e.g. opened from `file://`), the app
  falls back to a small bundled default set and never dead-ends; a note documents
  the HTTP-origin requirement.

#### G5 — Explicit educational order & criteria in the app
Surface the learning progression so it is intentional and visible.

- The map (F2) ordering reflects the syllable-learning sequence: easiest
  consonants' islands first, then mixed, then 2-syllable words, then 3-syllable
  words, then digraphs/closed/clusters later.
- A short, parent-facing explanation of the order/criteria appears in the adult
  dashboard (F7). No required reading for the child.
- **AC-G5.1:** The map node order and the word-file ordering both follow the
  documented easiest-first criteria (consonant difficulty, syllable type,
  syllable count).
- **AC-G5.2:** The adult dashboard shows a brief description of the educational
  order and criteria.

---

## Pedagogical Order & Criteria (research guidance — binding on content)

Spanish early-reading instruction (método silábico) introduces sounds in a
researched easiest-first order. The inventory and levels MUST follow it.

**1. Syllable type (easiest → hardest):**
1. Open **CV** syllables (consonant + vowel: `ma`, `pe`) — easiest, taught first.
2. **CV + CV** two-syllable words (`mamá`, `pato`).
3. Three-syllable CV words (`pelota`, `camisa`).
4. **Closed/inverse** syllables — CVC / VC (`pan`, `sol`, `al`, `es`).
5. **Consonant clusters / trabadas** (`bl, br, pl, pr, tr, cl, cr, dr, fl, fr, gl,
   gr`) and **diphthongs** (`ai, ei, au, ia, ie, ue…`) — last.

**2. Consonant introduction order (most frequent / easiest first):**
1. **m, p, l, s, t** — earliest (high frequency, simple articulation; `m`/`p`/`l`
   are classic first letters).
2. **d, n, ñ** — next.
3. **f, b, v, c/k, g, j, r/rr, ll, ch, z, y, x, w** — progressively harder
   (digraphs `ch/ll/rr`, variable sounds `c/g`, `r` vs `rr`, and rare `x/w/k`
   last).

**3. Vowels:** all five vowels are available from the start (they are introduced
before/with the first consonants); vowel difficulty does not reorder words.

**4. Ranking rule for a word's `difficulty_rank`:** combine (a) the hardest
consonant it contains (by the order above), (b) its syllable count (2 before 3),
and (c) its syllable types (all-open before any closed/cluster/diphthong). Lower
rank = easier = earlier in the file. Ties broken by shorter/common words first.

Seed examples (ordered): 2-syll `mamá, papá, mapa, pala, masa, pelo, pato, mesa,
lupa, dedo, loma, tela, sopa, dado` … → 3-syll `pelota, maleta, pelota, camisa,
paloma, tomate, pepino, banana, cabeza` … (exact final lists live in the data
files, easiest-first).

---

## Technical Specification

### Architecture
Unchanged: a **static SPA** — one `index.html`, one CSS file, small vanilla **ES
modules**, **no backend, no build step, no bundler, all art inline SVG**, state in
`localStorage`, screens swapped by the `game.js` state machine, PWA via `sw.js` +
`manifest.webmanifest`. Iteration 3 adds **data files + a tiny loader** and a
**gesture handler**, and restyles the play screen.

### Module changes

Extended existing modules:
- `js/words.js` — stop hard-coding `WORDS`. Add an async **loader** that fetches +
  parses the CSV inventory files and exposes words by syllable count. Keep pure,
  synchronous helpers (`partsMatchWord`, parse, order-check) unit-testable in
  Node; keep a small **embedded fallback** list for `file://`/offline-first paint
  and for `AC-G4.4`. New/updated interface:
  - `parseCsv(text) -> rows[]` (pure).
  - `forLevel(levelId) -> {word, parts, artId, syllableCount, rank}[]` now served
    from loaded data (2- and 3-syllable), falling back to the embedded set.
  - `loadInventory({fetchImpl}) -> Promise<void>` loads both CSVs once at startup.
  - `isOrderedByRank(rows) -> boolean` + `rowIntegrity(row) -> boolean` (pure,
    for tests/AC-G4.2).
- `js/levels.js` — add a **3-syllable word level** node after `palabras`
  (e.g. `palabras-3`), before `digrafos`; its `pool()` returns 3-syllable words.
  Map order already encodes the educational sequence (G5); confirm/adjust the
  ordering to match the criteria. `nextUnlock`/`isUnlocked`/`mapState` unchanged
  in shape.
- `js/game.js` — support word items with **2 or 3 parts** (word flow generalizes
  from `parts[0..1]` to `parts[0..n]`); wire gesture intents (`tapCard` →
  `listenToModel`, `swipeNext` → `skip`) through existing methods. Kick off
  `words.loadInventory()` during init; render once loaded.
- `js/main.js` — attach a **Pointer-Events gesture recognizer** to the card host
  (tap vs horizontal swipe via distance/time thresholds); route tap → model,
  swipe-left → next. Render N word tiles (2 or 3). Show the first-use gesture
  hint. Register nothing new for the SW.
- `index.html` — restructure the game screen so the card is the hero: make the
  card host the flexible, dominant region; move score/art/mascot to compact,
  non-competing spots; generalize `word-view` to render 2–3 parts; keep a small
  listen/next affordance for discoverability + a11y; keep ARIA/live region.
- `css/styles.css` — new immersive play layout: the card uses large fluid sizing
  (viewport-relative, `clamp`, `dvh`/`dvw`, container-query-friendly) to fill the
  content area; auto-shrink font for long 3-syllable words (fit without overflow);
  de-emphasize secondary controls further; keep reduced-motion + high-contrast +
  ≥56px targets; style the gesture hint.
- `sw.js` — **add the two CSV data files** (and any new art) to the precache list
  and **bump `CACHE_VERSION`** so the inventory is available offline (AC-F13.2/3).
- `js/art.js` — add picture cues for the new 3-syllable words (inline SVG).

No new runtime dependencies. No framework. No bundler.

### Data model — word inventory file format (CSV)
Plain UTF-8 CSV, one header row, comma-separated, **ordered easiest-first**
(ascending `difficulty_rank`). One file per syllable count.

Columns:
| column          | type    | notes                                                        |
| --------------- | ------- | ------------------------------------------------------------ |
| `word`          | string  | the target word, lowercase, with accents (e.g. `mamá`)       |
| `syllables`     | string  | parts separated by `-` (e.g. `ma-má`, `pe-lo-ta`)            |
| `syllable_count`| integer | 2 or 3; must equal the number of `syllables` parts           |
| `difficulty_rank`| integer | ascending across the file; lower = easier/earlier            |
| `emoji`         | string  | optional emoji/picture cue (e.g. `🦆`)                        |
| `art_id`        | string  | optional inline-SVG id in `art.js` (e.g. `word-pato`)        |

Example `data/words-2syllables.csv`:
```csv
word,syllables,syllable_count,difficulty_rank,emoji,art_id
mamá,ma-má,2,1,👩,word-mama
papá,pa-pá,2,2,👨,word-papa
mapa,ma-pa,2,3,🗺️,word-mapa
pato,pa-to,2,8,🦆,word-pato
mesa,me-sa,2,10,🍽️,word-mesa
```
Example `data/words-3syllables.csv`:
```csv
word,syllables,syllable_count,difficulty_rank,emoji,art_id
pelota,pe-lo-ta,3,1,⚽,word-pelota
maleta,ma-le-ta,3,2,🧳,word-maleta
camisa,ca-mi-sa,3,6,👕,word-camisa
banana,ba-na-na,3,9,🍌,word-banana
```

**Loading:** at startup `words.loadInventory()` `fetch`es both files (relative
URLs, same origin), parses with `parseCsv`, maps rows to `{word, parts, artId,
syllableCount, rank}` (parts derived from `syllables.split("-")`, title-cased for
display), and caches them. On fetch/parse failure it logs and keeps the embedded
fallback set (AC-G4.4). Files are precached by the SW for offline use.

### Persistence
`localStorage` schema is **unchanged** (`silabas:v2`). The new word levels add
level records + per-word item records through the existing `progress.js` paths;
no schema bump needed. (SW `CACHE_VERSION` bumps — that is cache, not storage.)

### Gesture handling (how it works)
- Attach `pointerdown`/`pointermove`/`pointerup` to the card element.
- On `pointerdown` record start x/y/time. On `pointerup`:
  - If total movement < ~10px and elapsed < ~300ms → **tap** → model the item.
  - Else if horizontal movement < −50px (left) and mostly horizontal → **swipe
    left** → next item.
  - Right swipe → repeat/no-op.
- Pointer Events cover mouse, touch, pen. `touch-action: pan-y` on the card lets
  vertical page scroll through while capturing horizontal swipes.

### Testing
Extend the framework-free Node `--test` suite:
- `words.test.js` — `parseCsv` (header, rows, quoting, trailing newline);
  `rowIntegrity` (parts join to word, `syllable_count` matches); `isOrderedByRank`
  (ascending); embedded-fallback integrity; 2- vs 3-syllable partitioning.
- `levels.test.js` — new `palabras-3` node present, ordered after `palabras` and
  before `digrafos`; unlock chain intact.
- Pure gesture-threshold helper (if extracted) unit-tested; the DOM wiring stays
  manual/browser.
Manual/browser checks (not Node-assertable): immersive card sizing across
devices (AC-G1.*), tap-to-hear + swipe-to-next (AC-G3.*), control reduction
(AC-G2.*), 3-part word play (AC-G4.3), offline CSV via SW, dashboard order text.

---

## Tech Stack Decision (binding on the Developer)

**No change in stack.** Keep the existing **vanilla HTML5 + CSS3 + JavaScript
(ES modules), no framework, no bundler, no build step, dependency-free,
offline-first, `localStorage` only, all art inline SVG, PWA via `sw.js` +
`manifest.webmanifest`.** Specifically for iteration 3:

- **Word inventory = static CSV files** under `data/`, loaded at runtime via
  `fetch` and parsed by a tiny hand-written CSV parser in `js/words.js`. No CSV
  library, no JSON build step, no data framework.
- **Gestures = native Pointer Events** on the card element with distance/time
  thresholds. No gesture/touch library (no Hammer.js or similar).
- **Immersive layout = CSS only** (fluid viewport units, `clamp`, `dvh`/`dvw`,
  flexbox; container queries acceptable where supported with a graceful
  fallback). No layout framework.
- CSV files are added to the **service-worker precache** (bump `CACHE_VERSION`)
  so the inventory works offline; TTS/synthesis and recognition behavior
  unchanged. App still runs from any static host over HTTP(S)/localhost.

Do not introduce frameworks, bundlers, package managers at runtime, CSV/gesture
libraries, or a backend.

---

## Non-Functional Requirements
- **Responsiveness:** the reading card is device-adaptive and dominant on
  phone-portrait, tablet, and landscape; long 3-syllable words fit without
  overflow from 320px up; `dvh`/`dvw` + `clamp` + fluid font sizing; no horizontal
  scroll.
- **Touch support:** tap-to-hear and swipe-to-advance via Pointer Events; tap vs
  swipe reliably disambiguated; mouse/pen/keyboard parity preserved; `touch-action`
  keeps vertical scrolling usable.
- **Accessibility:** enlarged card keeps high-contrast + reduced-motion support,
  ARIA labels, live-region feedback, visible focus, ≥56px targets; every gesture
  has a non-gesture equivalent (button/keyboard) so touch is never required;
  very-young (text-free) mode still playable.
- **Performance:** CSV files are tiny; parsed once at startup and cached in memory
  + SW; no runtime network dependency after first load; 60fps-friendly card
  transitions; instant load preserved.
- **Privacy/offline/robustness:** unchanged — no accounts/ads/tracking, nothing
  leaves the device; full offline after first load incl. the CSV inventory via the
  SW; graceful fallback when a data file can't be fetched; no fail states, no
  dead-ends.

---

## Out of Scope (iteration 3)
- 4+ syllable words, sentences, or reading comprehension.
- A visual/authoring editor for the word inventory (files are edited by hand).
- Server-hosted or remotely-updatable word lists; any backend or network sync.
- Advanced gestures beyond tap + horizontal swipe (pinch, long-press menus, drag-
  and-drop syllable assembly).
- Automated end-to-end/visual regression testing of the immersive layout or
  gestures (verified manually in a browser).
- Carrying none of iteration 1–2 scope backward — all prior accepted scope
  remains in force; nothing here removes it.
