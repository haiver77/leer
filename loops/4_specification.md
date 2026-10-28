# 4 — Specification: "Lalo y las Sílabas" — Demonstrably-Correct Pedagogical Order + Richer Content & Hero Card

Evolves `3_specification.md`. Iteration 3 scored **7.8 (NEEDS_WORK)** — all six
dimensions ≥ 7, but overall below the 8.0 gate. The customer flagged **one
blocker** (the pedagogical ordering is not demonstrably correct: a digraph word
`semilla` sits at rank 7, and tests only check that ranks are *monotonic*, never
that they follow the stated criteria) plus a few focused polish items. This
iteration is a **tight refinement**, not a redesign. **Everything accepted in
iterations 1–3 is carried forward unchanged** unless this document explicitly
supersedes it.

## Overview & Goals

1. **P0 — Make the pedagogical order demonstrably correct** (the blocker). Fix
   the digraph-too-early defect, re-audit both CSV files so `difficulty_rank`
   reflects the documented consonant-tier → syllable-type → length rule, move
   closed-syllable words after the all-open zone, and add a **correctness test**
   (not just a monotonic-rank test) backed by new pure helpers in `words.js`.
2. **P1 — Grow content breadth & richness**: ~40+ two-syllable and ~25+
   three-syllable words, still strictly easiest-first, every word with a **real
   inline-SVG `art_id`** (no word falls back to `cue-default`), guarded by a test.
3. **P2 — UI polish**: give the hero card subtle depth/richness (inner gradient /
   accent border / faint per-island theme) without breaking high-contrast or
   reduced-motion; guarantee nothing clips at 320px and in short-landscape.
4. **P3 — A11y & gesture robustness**: make the card's tap-to-hear reachable by
   keyboard (focusable `#card-host` + Enter/Space + ARIA), keep all browser-only
   gesture criteria.

Non-goals unchanged: 100% vanilla, buildless, offline-first, private, free.

---

## Functional Specification

### A. Carried forward (keep — do not regress)
All iteration-1 (AC1–AC8), iteration-2 (AC-F1…F14), and iteration-3 (AC-G1…G5)
acceptance criteria remain in force. In particular: the immersive hero card
(G1), strictly-necessary controls (G2), tap/swipe gestures (G3), CSV inventory +
3-syllable level (G4), explicit educational order in the dashboard (G5), named
mascot Lalo, world map with staged unlocks, rewards/sticker book, mastery +
adult dashboard, trustworthy speech (mic + lenient matching + self-confirm
fallback + model playback), onboarding, very-young text-free mode, adult gate,
daily goal, PWA/full offline, keyboard parity, no dead-ends / no fail states.
Iteration 4 **tightens correctness and polish** inside G4/G1 and **adds** AC-H*
below; it removes nothing.

### B. New / changed features for iteration 4

#### H1 — Pedagogically-correct CSV ordering (P0, the blocker)
The `difficulty_rank` sequence in **both** CSV files MUST be the *result* of the
documented ranking rule, not hand-assigned numbers that merely ascend.

Ranking key per word, applied in order (lower = easier = earlier):
1. **Hardest consonant tier** present in the word:
   - **tier 1**: `m, p, l, s, t`
   - **tier 2**: `d, n, ñ`
   - **tier 3**: `f, b, v, c/k, g, j, r` (single `r`)
   - **tier 4 (last)**: digraphs `ch, ll, rr` and the rare/variable `z, y, x, w`
     (and `rr`), introduced after everything else.
2. **Syllable type**: all-open **CV** before any **closed/inverse (CVC/VC)** or
   **cluster/trabada** of the same syllable count.
3. **Length / commonality**: shorter and more common first.
4. Stable tiebreak: alphabetical.

Specific corrections demanded and applied:
- **`semilla` (`se-mi-lla`, `ll`) and `gallina` (`ga-lli-na`, `ll`) move to the
  END** of `words-3syllables.csv` — digraph words come last. The former rank-7
  `semilla` defect is gone.
- **`dinero` (`di-ne-ro`, single `r`, tier 3)** sorts **after** `banana`
  (`ba-na-na`, tier 2) and `camisa` (`ca-mi-sa`, tier 3 `c` but all-open and more
  common) per the tier rule — tier-1/2 all-open words precede `r`-words.
- **`jamón` (`ja-món`, closed `món`)** in the 2-syllable file sorts **after all
  all-open CV words**; the "easy zone" stays strictly all-open CV. The choice is
  documented in a CSV comment-equivalent note and in the dashboard order text.

- **AC-H1.1:** In `words-3syllables.csv`, **no digraph word (`ll/ch/rr`)
  precedes any non-digraph word**; `semilla` and `gallina` are at/after all
  non-digraph words.
- **AC-H1.2:** In each file, **no closed-syllable word precedes an all-open-CV
  word of the same syllable count** (e.g. `jamón` after every all-open 2-syll
  word).
- **AC-H1.3:** In each file, a word whose hardest consonant is a higher tier does
  not appear before a word whose hardest consonant is a strictly lower tier,
  except where syllable-type/length tiebreaks are explicitly documented; the
  machine-derived `expectedTierKey` order is consistent with the file order.
- **AC-H1.4:** `difficulty_rank` remains strictly ascending and unique within
  each file, and equals the file row order (so monotonic-rank AND correctness
  checks agree).

#### H2 — Correctness test + new pure helpers in `words.js` (P0)
Add pure, Node-testable helpers so "pedagogical order" is machine-checkable:
- `hardestConsonantTier(wordOrParts) -> 1|2|3|4` — scans the word's consonants
  (treating digraphs `ch/ll/rr` as single units and `z/y/x/w` as tier 4) and
  returns the hardest (highest) tier present.
- `hasDigraph(wordOrParts) -> boolean` — true if the word contains `ch`, `ll`, or
  `rr`.
- `hasClosedSyllable(parts) -> boolean` — true if any syllable is not a bare
  open **CV/V** form (i.e. ends in a consonant → closed/inverse, or carries a
  consonant cluster). Pure, operates on the hyphen-split parts.
- `expectedTierKey(row) -> comparable key` — derives `[consonantTier,
  syllableTypeRank, length, word]` from the row's `word` + `syllables` so two
  rows can be compared without reading `difficulty_rank`.

- **AC-H2.1:** A new test in `words.test.js` builds `expectedTierKey` for every
  row of each shipped CSV and asserts the file order is **consistent** with the
  derived key — at minimum: no digraph word precedes a non-digraph word, and no
  closed-syllable word precedes an all-open word of the same syllable count. This
  test FAILS on the old `semilla`-at-7 data and PASSES on the corrected data.
- **AC-H2.2:** `hardestConsonantTier`, `hasDigraph`, `hasClosedSyllable`, and
  `expectedTierKey` are exported, pure, and unit-tested directly (e.g.
  `hasDigraph("semilla") === true`, `hasClosedSyllable(["ja","món"]) === true`,
  `hardestConsonantTier("dinero") === 3`, `hardestConsonantTier("mapa") === 1`).
- **AC-H2.3:** The existing `isOrderedByRank` monotonic check is **kept** and the
  new correctness check is **added** (both run); neither replaces the other.

#### H3 — Content breadth & full art coverage (P1)
Grow the inventory while keeping it strictly easiest-first and fully illustrated.
- `words-2syllables.csv`: **≥ 40** rows. `words-3syllables.csv`: **≥ 25** rows.
- Every row has a non-empty `art_id` that resolves to a **real inline SVG in
  `art.js`** — no word may fall back to `cue-default`.
- New words are placed by the H1 ranking rule (new digraph/closed words go to the
  tier-4 / closed tail, not the easy zone).
- **AC-H3.1:** `parseCsv(words-2syllables.csv).length >= 40` and
  `parseCsv(words-3syllables.csv).length >= 25`.
- **AC-H3.2:** A test imports `art.js` and asserts `art.has(row.art_id) === true`
  for **every** row in both CSV files and for every embedded fallback entry
  (`WORDS`, `WORDS_3`) — i.e. art coverage is 100%, guaranteeing no `cue-default`.
- **AC-H3.3:** Every new row still passes `rowIntegrity` (parts join to word,
  `syllable_count` matches) and the H1/H2 ordering checks.

#### H4 — Hero card depth/richness (P2)
Give the hero card visual delight without harming contrast or motion rules.
- Add a subtle treatment: a **soft inner gradient** and/or a **rounded accent
  border**, optionally tinted by the **current island/level theme color** (faint,
  behind the text). The syllable/word text stays maximum-contrast on top.
- **AC-H4.1:** The hero card renders with a non-flat treatment (inner gradient
  and/or accent border and/or faint themed background), visibly richer than a
  plain white block.
- **AC-H4.2:** Text-to-background contrast on the card still meets the existing
  high-contrast requirement (≥ 4.5:1 for the large text); `prefers-contrast:
  more` and high-contrast mode keep a solid, legible card.
- **AC-H4.3:** `prefers-reduced-motion` disables any animated/gradient motion;
  the richness degrades to a static, still-delightful card.

#### H5 — No clipping at 320px / short-landscape (P2)
- At **320px width** and in **short-landscape** viewports, the item-art cue and
  the bottom mascot never clip or overlap the card, and the card remains the
  single largest element.
- **AC-H5.1:** At 320px wide (portrait) the card dominates; item-art and mascot
  are fully visible, no horizontal scroll, longest 3-syll word fits.
- **AC-H5.2:** In short-landscape the item-art cue shrinks/relocates and the
  mascot stays within bounds; the card still dominates (browser-verified; capture
  320px + landscape screenshots as evidence in `4_plan.md`).

#### H6 — Keyboard-reachable tap-to-hear on the card (P3)
Make the card's tap-to-hear action reachable and discoverable by keyboard, in
addition to the existing document-level keydown paths.
- `#card-host` becomes focusable (`tabindex="0"`), with **Enter/Space** invoking
  the same model-playback action as a tap, and a **visible focus ring**.
- ARIA: keep `role="group"` with the descriptive `aria-label`; the actionable
  nature is conveyed (e.g. the host or an inner control exposes the "read aloud"
  affordance to AT), and the live region still announces feedback.
- **AC-H6.1:** Tabbing reaches `#card-host`; pressing **Enter or Space** on it
  triggers model playback of the current item (parity with tap) and shows a
  visible focus indicator.
- **AC-H6.2:** All browser-only gesture criteria from G3 still hold: tap vs
  left-swipe disambiguation by distance/time thresholds, right-swipe =
  repeat/no-op (never an error), `touch-action: pan-y` still allows vertical
  scroll, the first-use hint shows once and never blocks, and reduced-motion
  still advances. (Browser-verified; note results in `4_plan.md`.)
- **AC-H6.3:** Space on the focused card does not scroll the page (the handler
  calls `preventDefault`); keyboard parity does not disable the mic, next, back,
  or self-confirm paths.

---

## Pedagogical Order & Criteria (binding on content — restated + corrected)

Unchanged in spirit from iteration 3; this iteration makes it **machine-checked**
(H2) rather than hand-asserted.

**Consonant tiers** (hardest consonant in a word decides its tier):
`tier1 = m,p,l,s,t` · `tier2 = d,n,ñ` · `tier3 = f,b,v,c/k,g,j,r` ·
`tier4 (last) = digraphs ch,ll,rr and z,y,x,w`.

**Ordering within a file:** (a) consonant tier, then (b) syllable type (all-open
CV before any closed/inverse/cluster of the same count), then (c) shorter/more
common, then (d) alphabetical tiebreak. Lower `difficulty_rank` = earlier.

### Corrected target order (reference — final lists live in the CSVs)
Two-syllable (easy all-open tier-1/2 CV first → tier-3 → closed/tier-4 last;
closed `jamón` after all all-open words):
`mamá, mapa, masa, mesa, pala, papá, pelo, pino, pato, puma, sala, sapo, sopa,
loma, lupa, luna, mula, pila, sala, sola, tela, tapa, taza, toma, dado, dedo,
nido, nube, niña, dama, dona, foca, boca, vaca, café, casa, gato, jugo, rana,
rosa, jamón …` — with every added word honoring the tier/type rule; **no digraph
or closed word in the easy zone**.

Three-syllable (all-open tier-1/2 → tier-3 single-`r`/`c`/`g`/`j` → tier-4
`z/y` → **digraphs `ll` last**):
`maleta, paloma, pelota, pepino, salada, tomate, dedito, banana, camisa, pelota,
cabeza, zapato, dinero … , semilla, gallina` — i.e. `semilla` and `gallina`
(both `ll`) are the final two entries, after `dinero` (`r`, tier 3) and `zapato`
(`z`, tier 4) which themselves follow the tier-1/2 all-open words.

---

## Technical Specification

### Architecture (unchanged)
Static SPA: one `index.html`, one `css/styles.css`, small vanilla **ES modules**
in `js/`, **no backend, no build step, no bundler, all art inline SVG**, state in
`localStorage`, screens swapped by the `game.js` state machine, PWA via `sw.js` +
`manifest.webmanifest`, CSV inventory under `data/`. **No `app/` folder** — code
lives at the workspace root. Iteration 4 touches content (CSV/art), adds pure
helpers + tests in `words.js`, and polishes CSS/markup for the card.

### Module changes
- **`data/words-2syllables.csv`** — re-audited and **re-ranked** per H1; grown to
  **≥ 40** rows, each with a real `art_id`; closed-syllable words (e.g. `jamón`)
  moved to the tail after the all-open zone. `difficulty_rank` ascending/unique.
- **`data/words-3syllables.csv`** — re-audited and **re-ranked** per H1; **move
  `semilla` and `gallina` (digraph `ll`) to the end**; `dinero` after
  `banana`/`camisa`; grown to **≥ 25** rows, each with a real `art_id`.
- **`js/words.js`** — add exported pure helpers `hardestConsonantTier`,
  `hasDigraph`, `hasClosedSyllable`, `expectedTierKey` (data model: operate on
  `word` + hyphen-split `syllables`/`parts`, accent-insensitive via the existing
  `stripAccents`). Keep `parseCsv`, `rowIntegrity`, `isOrderedByRank`,
  `partsMatchWord`, `forLevel`, `byWord`, `loadInventory` as-is. Refresh the
  embedded `WORDS`/`WORDS_3` fallbacks so their order/art also satisfy H1/H3
  (fallbacks mirror the easiest corrected rows; digraph/closed words are not in
  the fallback easy zone).
- **`js/art.js`** — add inline-SVG entries for **every new word's `art_id`** so
  coverage is 100% (H3.2). No word may resolve to `cue-default`. Keep the shared
  `0 0 100 100` viewBox, high-contrast, rounded style.
- **`index.html`** — `#card-host` gains `tabindex="0"`; keep `role="group"` +
  `aria-label`; ensure the actionable "read aloud" affordance is exposed to AT
  (H6). No structural redesign.
- **`css/styles.css`** — enrich `.card`/`.syllable-card`/`.word-view`
  background with a soft inner gradient + rounded accent border, optionally
  themed by a CSS custom property set per island/level (faint). Add a visible
  `:focus-visible` ring on `.card-host`. Ensure `prefers-contrast: more` and
  high-contrast fall back to a solid legible card, and `prefers-reduced-motion`
  stops any gradient/border animation. Tighten the item-art cue and mascot sizing
  so nothing clips at 320px / short-landscape (H5).
- **`js/main.js`** — add an `Enter`/`Space` keydown handler on the focused
  `#card-host` that calls the same model-playback intent as `tapCard`
  (`preventDefault` on Space to avoid page scroll). Gesture recognizer unchanged.
- **`sw.js`** — if any new art/data bytes change precached assets, **bump
  `CACHE_VERSION`** so the richer inventory is available offline. CSV files remain
  precached.

### New pure helpers — data model & contracts
```
hardestConsonantTier(wordOrParts) -> 1|2|3|4
  // digraphs ch/ll/rr counted as single tier-4 units; z/y/x/w tier-4;
  // f/b/v/c/k/g/j/r tier-3; d/n/ñ tier-2; m/p/l/s/t tier-1; vowels ignored.
hasDigraph(wordOrParts) -> boolean          // contains ch | ll | rr
hasClosedSyllable(parts) -> boolean          // any part not a bare open CV/V
expectedTierKey(row) -> [tier, typeRank, length, word]  // for order comparison
```
Comparison semantics: for rows A before B in a file, `expectedTierKey(A)` must be
`<=` `expectedTierKey(B)` under lexicographic comparison of the key tuple, with
the documented exceptions encoded in `typeRank`/`length`. The correctness test
asserts this holds for the whole file (and in particular the two binding
minimums: digraph-after-non-digraph, closed-after-open-same-count).

### Testing (Node `--test`, framework-free)
- **`words.test.js`** — **add**: direct unit tests for the four new helpers
  (H2.2); a **correctness test** over both shipped CSVs using `expectedTierKey`
  (H2.1) asserting file order is consistent with derived tiers, no digraph before
  non-digraph, no closed before open-of-same-count; a **count test** (≥40 / ≥25,
  H3.1); an **art-coverage test** importing `art.js` and asserting
  `has(art_id)` for every CSV row and every fallback entry (H3.2). **Keep** all
  existing passing tests (parseCsv, rowIntegrity, isOrderedByRank, fallback
  integrity, forLevel/byWord, loadInventory).
- **`levels.test.js`** — unchanged (level chain intact).
- Browser-only (recorded in `4_plan.md` with evidence): card depth/contrast
  (H4), no-clip at 320px + short-landscape (H5), keyboard Enter/Space on card
  (H6.1), and the G3 gesture criteria (H6.2).

### Persistence
`localStorage` schema **unchanged** (`silabas:v2`). Content/art/CSS changes do not
touch stored progress. Only the SW `CACHE_VERSION` bumps (cache, not storage).

---

## Tech Stack Decision (binding — UNCHANGED)
**No change in stack.** Vanilla **HTML5 + CSS3 + JavaScript (ES modules)**, **no
framework, no bundler, no build step, no runtime dependencies**, `localStorage`
only, **all art inline SVG**, offline-first **PWA** via `sw.js` +
`manifest.webmanifest`, served over http(s)/localhost. Specifically:
- **Word inventory = static CSV files** under `data/`, loaded via `fetch` and
  parsed by the existing hand-written parser in `words.js`. No CSV library.
- **Pedagogical correctness = pure JS helpers + Node `--test`**. No validation
  library, no schema framework.
- **Gestures = native Pointer Events**; **layout/card depth = CSS only** (fluid
  units, `clamp`, `dvh`/`dvw`, gradients, `:focus-visible`). No gesture/animation
  library.
- CSV/art precached by the SW (bump `CACHE_VERSION`). **No `app/` folder; code at
  the workspace root.** Do not introduce frameworks, bundlers, runtime package
  managers, CSV/gesture libraries, or a backend.

---

## Non-Functional Requirements
- **Pedagogical correctness:** the easiest-first order is *derivable and tested*,
  not hand-asserted; digraphs and closed syllables provably come after the easy
  all-open zone; regressions are caught by the correctness test.
- **Content completeness:** ≥40 two-syll / ≥25 three-syll words, 100% art
  coverage (no `cue-default` fallback for any practice word).
- **Responsiveness:** hero card dominant and non-clipping from 320px up and in
  short-landscape; long 3-syll words fit without overflow; no horizontal scroll.
- **Accessibility:** card tap-to-hear reachable by keyboard (focusable host,
  Enter/Space, visible focus), ARIA + live region preserved; high-contrast and
  `prefers-contrast: more` keep the richer card legible (≥4.5:1 large text);
  `prefers-reduced-motion` honored; ≥56px targets; every gesture has a non-gesture
  equivalent; very-young text-free mode still playable.
- **Performance/offline/privacy:** unchanged — tiny CSV parsed once and cached in
  memory + SW; full offline after first load; no accounts/ads/tracking; graceful
  `file://` fallback; no fail states, no dead-ends.

---

## Out of Scope (iteration 4)
- 4+ syllable words, sentences, or reading comprehension.
- A visual/authoring editor or remote/server-hosted word lists; any backend.
- Advanced gestures beyond tap + horizontal swipe (pinch, long-press, drag-assemble).
- Automated end-to-end / visual-regression testing of the immersive layout,
  gestures, or card depth (verified manually in a browser with screenshots).
- Re-tuning speech recognition/synthesis behavior (unchanged from prior iterations).
- Removing or regressing any iteration 1–3 accepted scope — all prior accepted
  features remain in force; nothing here drops them.
