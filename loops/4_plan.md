# 4 — Plan: Demonstrably-Correct Pedagogical Order + Richer Content & Hero Card

Implements `loops/4_specification.md` (iteration 4, a focused fix on the 7.8
iteration-3 build). Everything from iterations 1–3 is carried forward unchanged;
this iteration only tightens correctness/polish and adds the AC-H1…AC-H6 scope.
All application code lives at the workspace root (no `app/` folder).

---

## Implementation plan (what changed & why)

### P0 — Pedagogically-correct ordering + correctness test (H1/H2)

**`js/words.js` — four new exported, pure helpers.**
- `hardestConsonantTier(wordOrParts) -> 1|2|3|4`: scans consonants over an
  accent-free lowercase form (via the existing `stripAccents`). Digraphs
  `ch/ll/rr` are consumed as single **tier-4** units; `z/y/x/w` → tier 4;
  `f/b/v/c/k/g/j` and single `r` → tier 3; `d/n/ñ` → tier 2; `m/p/l/s/t` → tier 1;
  vowels ignored (so the `u` in `qu`/`gu` is skipped and those fold into the
  c/k/g family at tier 3). Returns the highest tier present (1 if none).
- `hasDigraph(wordOrParts) -> boolean`: `/ch|ll|rr/` on the normalized word.
- `hasClosedSyllable(parts) -> boolean`: for each hyphen-split part, collapses a
  digraph onset to one consonant then flags the part as closed when it ends in a
  consonant (inverse/closed) or carries a 2-consonant onset cluster (trabada).
  So `lla`/`rro` stay **open**, while `món`/`sol`/`nes`/`pla` are **closed**.
- `expectedTierKey(row) -> [tier, typeRank, length, word]`: derived from
  `word` + `syllables` (never from `difficulty_rank`) for order comparison.

The existing `parseCsv`, `rowIntegrity`, `isOrderedByRank`, `partsMatchWord`,
`forLevel`, `byWord`, `loadInventory` are untouched.

**`data/words-2syllables.csv` — re-audited, re-ranked, grown to 48 rows.**
Ordered strictly easiest-first by the rule: (a) hardest consonant tier, then
(b) syllable type (all-open CV before closed), then (c) length, then
(d) alphabetical. The **all-open zone runs by tier** — tier-1 (`m/p/l/s/t`:
`mamá…lupa`), tier-2 (`d/n/ñ`: `dado…niña`, with `pino` correctly moved into the
tier-2 group because of its `n`), tier-3 (`boca…rosa`), tier-4 z-words
(`pozo`, `taza`). Then the **closed zone** (`limón`, `pastel`, `jamón`) and the
**digraph tail last** (`gallo`, `pollo`, `perro`). `jamón` now sits after every
all-open CV word (was rank 28 in a mixed zone). `difficulty_rank` is
`1..48`, strictly ascending/unique, equal to row order.

**`data/words-3syllables.csv` — re-audited, re-ranked, grown to 26 rows.**
All-open by tier (`maleta…tomate` tier-1, `dedito/dominó/pepino/salada/salida`
tier-2, `banana…jirafa` tier-3, `cabeza/cereza/zapato` tier-4 z), then the
closed word `limones`, then the **digraph `ll` pair `semilla` + `gallina` as the
final two rows**. The iteration-3 blocker (`semilla` at rank 7) is gone;
`dinero` (`r`, tier 3) now sorts after `banana`/`camisa` as demanded.

**`js/words.js` fallbacks refreshed.** `WORDS`/`WORDS_3` mirror the easiest
corrected rows; both are all-open CV only (no digraph/closed word in the fallback
easy zone), re-ranked `1..n`.

### P1 — Content breadth + 100% art coverage (H3)
- 48 two-syllable rows (≥40) and 26 three-syllable rows (≥25), every row with a
  real `art_id`.
- **`js/art.js`** gained inline SVGs for every new word so **no word falls back
  to `cue-default`**: 2-syll — `mula, palo, pila, sala, seta, tapa, tomo, dama,
  duna, bote, cafe, cuna, jugo, rosa, pozo, pastel, limon, gallo, pollo, perro`;
  3-syll — `pelito, sopita, domino, salida, bonita, canela, conejo, fogata,
  gusano, jirafa, cereza, limones`. All keep the shared `0 0 100 100` viewBox and
  rounded high-contrast style. Coverage is asserted by a test (below).

### P2 — Hero card depth/richness (H4/H5) — `css/styles.css`
- `.syllable-card` and `.word-view` now render with a **soft inner radial
  highlight** over a **faint per-level tint** (`--card-tint`) and a **rounded
  accent border** (`--card-accent`), plus inset highlight/shadow for depth. Text
  stays `var(--ink)` at full contrast on top.
- Per-island/level theme: `js/main.js` `applyCardTheme(levelId)` sets
  `--card-tint`/`--card-accent` on `#card-host` in `renderPlay` (pale washes
  keyed by island/level; neutral default when unmatched). Custom props inherit to
  the card children.
- **`prefers-contrast: more`** falls back to a solid white card with a black
  border (keeps ≥4.5:1 for the large glyph). **`prefers-reduced-motion`** already
  disables the `pop` animation; the gradient/border are static (no motion), so
  richness degrades to a still card.
- **H5 no-clip:** card width stays `min(92vw, 70vh, 560px)` with the border
  inside that box (no overflow at 320px); a `max-width: 420px` block shrinks the
  item-art cue and tightens `.card-host` gap/padding; the existing
  short-landscape block keeps the card height-driven and the item-art small.

### P3 — Keyboard-reachable tap-to-hear + ARIA (H6)
- **`index.html`**: `#card-host` gains `tabindex="0"`, keeps `role="group"`, an
  updated `aria-label` ("Tócala o pulsa Enter para oírla…"), and
  `aria-keyshortcuts="Enter Space"`.
- **`css/styles.css`**: a visible `:focus-visible` ring (purple outline + glow)
  on the card when `#card-host` is keyboard-focused.
- **`js/main.js`**: a `keydown` handler on `#card-host` calls `game.tapCard()`
  (the same model-playback intent as a pointer tap) on **Enter/Space**, with
  `preventDefault` on Space so the page never scrolls, and ignores keys that
  originate on inner `button`s. The Pointer Events recognizer and all existing
  document-level keyboard paths are untouched.

### Offline — `sw.js`
Precached CSS/JS/CSV/art bytes changed, so `CACHE_VERSION` bumped
`lalo-silabas-v3.0.0` → `v4.0.0`. CSV files remain in the precached `SHELL`.

---

## Tests (extended `js/words.test.js`; all prior tests kept)
- **Helper unit tests (AC-H2.2):** `hardestConsonantTier` (tiers 1–4 incl.
  `mapa`=1, `dinero`=3, `semilla`=4, qu/gu=3), `hasDigraph("semilla")===true` /
  `hasDigraph("mapa")===false`, `hasClosedSyllable(["ja","món"])===true` /
  open CV + digraph-onset cases false, and `expectedTierKey` tuples.
- **CORRECTNESS test (AC-H2.1 / H1.1 / H1.2):** `assertPedagogicalOrder` over
  both shipped CSVs — no digraph word precedes a non-digraph word, no closed word
  precedes an all-open word of the same count, and consonant tier is
  non-decreasing within the all-open prefix. Plus an explicit check that
  `semilla`/`gallina` follow every non-digraph word. A guard test proves the
  check **fails** on the old `semilla`-too-early order.
- **Count test (AC-H3.1):** ≥40 two-syllable, ≥25 three-syllable.
- **Art-coverage test (AC-H3.2):** imports `art.js`; asserts `art.has(id)` for
  every CSV row and every `WORDS`/`WORDS_3` fallback entry (100%, no cue-default).
- **Rank test (AC-H1.4):** `difficulty_rank` strictly ascending, unique, equal to
  row order.
- Existing `isOrderedByRank` monotonic check kept (AC-H2.3).

---

## Deployment plan
- Static, buildless PWA — deploy the workspace root (`index.html`, `css/`, `js/`,
  `data/`, `icons/`, `manifest.webmanifest`, `sw.js`) to any static host over
  https/localhost. No build, bundler, package manager, or backend.
- On deploy, the bumped `CACHE_VERSION` (`v4.0.0`) makes the SW install a fresh
  cache and delete the stale one on activate, so the richer inventory/art/CSS is
  available offline after the next load.
- `file://` still works via the embedded `WORDS`/`WORDS_3` fallbacks (CSV `fetch`
  may be blocked); the fallback easy zone is all-open CV only.
- `localStorage` schema (`silabas:v2`) unchanged — no progress migration.

## Verification
- Commands run from the workspace root (Node's built-in runner, no package.json):
  - `node --check js/words.js` → OK
  - `node --check js/art.js` → OK
  - `node --check js/main.js` → OK
  - `node --check sw.js` → OK
  - `node --test "js/*.test.js"` → **78 passed, 0 failed** (includes all prior
    tests + the new helper/correctness/count/art-coverage/rank tests).
- Data spot-check script confirmed: 48 two-syllable rows, 26 three-syllable rows;
  `dinero` (idx 16) after `banana` (11) & `camisa` (13); `semilla`+`gallina` are
  the last two 3-syllable rows; `jamón` at row 45/48 (after all open words);
  **0 missing art ids** across both CSVs and both fallbacks.

### Browser-only checks (manual — to capture as evidence in review)
- **H4** card depth/contrast: hero card shows inner gradient + themed accent
  border; `prefers-contrast: more` falls back to a solid white/black-border card
  (≥4.5:1 for the large glyph); `prefers-reduced-motion` shows a static card.
- **H5** no-clip: at 320px portrait and in short-landscape the item-art cue and
  the bottom mascot stay fully visible, no horizontal scroll, the longest
  3-syllable word (`limones`) fits, and the card remains the largest element.
  (Capture 320px + landscape screenshots.)
- **H6.1/H6.3** keyboard: Tab reaches `#card-host` (visible focus ring);
  Enter/Space plays the current item (parity with tap); Space does not scroll;
  mic/next/back/self-confirm paths unaffected.
- **H6.2** gestures intact: tap vs left-swipe by distance/time, right-swipe =
  repeat (never an error), `touch-action: pan-y` still scrolls vertically, the
  first-use hint shows once and never blocks, reduced-motion still advances.

## Files changed
- `data/words-2syllables.csv` (re-ranked, 48 rows)
- `data/words-3syllables.csv` (re-ranked, 26 rows)
- `js/words.js` (4 new pure helpers; refreshed `WORDS`/`WORDS_3` fallbacks)
- `js/art.js` (32 new word SVGs → 100% coverage, no cue-default)
- `js/words.test.js` (helper/correctness/count/art-coverage/rank tests added)
- `js/main.js` (card keydown handler; per-level card theme)
- `index.html` (`#card-host` focusable + ARIA)
- `css/styles.css` (card depth, focus ring, high-contrast fallback, 320px no-clip)
- `sw.js` (`CACHE_VERSION` → `lalo-silabas-v4.0.0`)
- `loops/4_plan.md` (this file)
