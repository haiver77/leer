VERDICT: NEEDS_WORK
OVERALL: 7.8

Iteration 3 is a strong, mature refinement that substantially delivers both
customer demands: the reading card is now the immersive hero of the play screen
with real touch gestures, and the word list has become a researched,
easiest-first CSV inventory with a new 3-syllable level and a parent-facing
rationale. The engineering is clean and honest — vanilla, buildless,
offline-first, 64/64 tests green, graceful `file://` fallback, keyboard/gesture
parity. It falls just short of approval for one concrete reason that lands
exactly on the dimension the customer asked us to fix: the pedagogical ordering
has a real defect (a digraph word, `semilla` with `ll`, sits at rank 7 of 14 in
the 3-syllable list, ahead of simpler words), contradicting the app's own
documented "digraphs come last" rule — and the tests only check that ranks are
monotonic, never that the ranks themselves follow the stated criteria. Fix the
ordering correctness (and guard it with a test), tighten a couple of smaller
pedagogical inconsistencies, and this crosses the line.

| Dimension                     | Score (1-10) | Justification                                                                                                                                                                                                 |
| ----------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Business value                | 8            | Solves a real, specific problem (early Spanish reading via método silábico) with measurable progression, mastery, and a now-explicit learning order. The ordering defect slightly undercuts the core promise. |
| Features / functionality      | 7            | Card/gestures/controls and the CSV inventory + 3-syllable level all present and wired correctly; unlock chain intact. Held back by the pedagogical ordering error in the 3-syllable file (`semilla` too early). |
| User experience (UX)          | 8            | Tap-to-hear, swipe-to-advance, one dominant action, keyboard parity, non-blocking first-use hint, no dead-ends, lenient speech. Can't browser-verify gesture feel here, but the flow design is sound.          |
| User interface (UI)           | 8            | Immersive card fills the viewport with fluid `clamp`/`dvh` sizing and a landscape override; controls de-emphasized and consistent. Polished, though the hero card is visually plain (solid white, no depth cue). |
| Modern design standards       | 8            | Pointer Events, `touch-action: pan-y`, `prefers-reduced-motion`, high-contrast, ≥56px targets, visible focus, ARIA + live region, PWA/offline with versioned precache. Strong; minor a11y gaps noted below.     |
| Competitive / attractiveness  | 7            | Free, private, offline, no ads — genuinely attractive vs app-store competitors, and the immersive card is a real step up. Still reads as a well-built indie app; content breadth and visual richness trail leaders. |
| **Overall (average)**         | **7.8**      | Both iteration-3 demands largely met; one pedagogical-correctness defect and a few polish items keep it below the 8.0 + all-≥7 gate.                                                                            |

The gate requires Overall ≥ 8.0 AND every dimension ≥ 7. Scores are all ≥ 7,
but the overall (7.8) is below 8.0 — NEEDS_WORK. The gap is small and almost
entirely about getting the pedagogical ordering demonstrably right.

---

## Prioritized, actionable recommendations for iteration 4

### P0 — Pedagogical ordering correctness (Features / Business value) — the one blocker
This is the demand the customer raised; it must be demonstrably correct, not
just monotonic by an arbitrary hand-assigned rank.

1. **Fix the digraph-too-early defect.** In `data/words-3syllables.csv`,
   `semilla` (`se-mi-lla`, digraph `ll`) is ranked **7 of 14**, ahead of
   all-simple-consonant words like `banana` (10) and `camisa` (11). The app's
   own dashboard text and `3_specification.md` state digraphs (`ll, ch, rr`) are
   introduced **last**. Move every digraph word (`semilla`, `gallina`) to the
   end of its file, after all open-CV / simpler-consonant words. The same rule
   applies if any 2-syllable digraph words are added later.
2. **Re-audit both files against the stated rule** and fix smaller
   inconsistencies, e.g. `dinero` (single `r`, tier-3 consonant) at rank 9 sits
   ahead of `banana` (rank 10, only tier-1/2 consonants); `banana`/`camisa`
   should precede `r`-words. Make the final `difficulty_rank` sequence actually
   reflect: (a) hardest consonant tier, then (b) syllable type (all-open before
   any closed/cluster), then (c) shorter/more-common first.
3. **Note closed syllables explicitly.** `jamón` (`ja-món`, closed `món`) appears
   in the "2-syllable" progression though closed syllables are slated for later;
   either justify it (it is last at rank 28) or move it after the all-open words
   and document the choice. Keep the easy zone strictly all-open CV.
4. **Add a correctness test, not just an ordering test.** Current tests assert
   `isOrderedByRank` (ranks are non-decreasing) but never check the ranks are
   pedagogically valid, which is why the `ll`-at-7 defect passed. Add a pure test
   that derives each word's expected difficulty tier from its hardest consonant +
   syllable types and asserts the file order is consistent with that derivation
   (at minimum: no digraph word precedes a non-digraph word; no closed-syllable
   word precedes an all-open word of the same syllable count). This makes
   "pedagogical order" machine-checkable and prevents regressions.

### P1 — Content breadth & richness (Features / Competitive)
5. Grow the inventory. 29 two-syllable and 14 three-syllable words is thin for
   repeated play; a child will cycle through quickly. Target ~40+ and ~25+
   respectively, still strictly ordered, with picture cues (`art_id`) for every
   new word (confirm `art.js` has an SVG for each; words without art fall back to
   `cue-default`, which reads as unfinished).
6. Consider a short per-word "listen to the whole word, then each part" guided
   first-touch on the 3-syllable level so three parts don't overwhelm the
   youngest users.

### P2 — UI polish (UI / Competitive)
7. The hero card is a flat solid-white block. Give it a subtle depth/texture
   treatment (soft inner gradient, rounded accent border, or a faint themed
   background per island) so the "hero" reads as delightful, not plain — this is
   what separates it visually from competitors.
8. The small item-art cue above the card and the mascot in the bottom cluster
   compete a little on very short landscape; verify in-browser that at 320px and
   in short-landscape nothing clips and the card still dominates (AC-G1.1/G1.2 —
   browser-only, so please capture a screenshot at 320px and in landscape as
   evidence next round).

### P3 — Accessibility & gesture robustness (Modern design standards)
9. `#card-host` has `cursor: pointer` and `role="group"` but is not itself
   keyboard-focusable; tapping is mouse/touch only. The keyboard paths exist via
   document-level keydown, which is fine, but consider making the card's
   tap-to-hear reachable by making the card (or its syllable/word) a real button
   or adding `tabindex` + Enter/Space handling on the host for parity and
   discoverability.
10. Verify in a browser (and report) the gesture acceptance criteria that cannot
    be auto-checked here: tap vs left-swipe disambiguation, right-swipe =
    repeat/no-op, `touch-action: pan-y` still allowing vertical scroll, the
    first-use hint showing once and never blocking, and reduced-motion still
    advancing. These are implemented correctly in code; please confirm behavior
    on a real touch device and note the result in `4_plan.md` verification.

---

## Carried-forward context (still in force from 3_input.md and earlier)

The original iteration-3 customer demands remain the yardstick and are now
*almost* met — do not regress them:

**A. Better use of space while reading (met, keep):**
- The word/syllable card must dominate the screen, adaptive to the device. ✅ done
  via the immersive `card-host` layout — keep it.
- Only strictly-necessary buttons on the play screen. ✅ done (dominant mic +
  small listen/next/back + self-confirm fallback) — keep it.
- Touch gestures: tap the card to hear it, swipe left to advance. ✅ implemented
  via Pointer Events — keep it, and confirm in-browser (P3.10).

**B. Pedagogically ordered word inventory (partially met — the P0 focus):**
- Word inventory in CSV/text files, one for 2-syllable and one for 3-syllable
  words. ✅ `data/words-2syllables.csv`, `data/words-3syllables.csv` exist and
  load at runtime — keep it.
- Ordered easiest-first by a researched Spanish syllable-learning sequence. ⚠️
  largely done but **not fully correct** — fix per P0 (digraphs last, consonant
  tiers respected, correctness test).
- Overall educational order & criteria made explicit in the app. ✅ dashboard
  "Orden de aprendizaje" section + map ordering — keep it; make sure the data
  actually matches what that section promises.

**Carried forward from iterations 1–2 (accepted scope — must not regress):**
named mascot (Lalo) with reactions, world map with staged unlocks, rewards /
sticker book, mastery tracking + adult dashboard with trouble syllables,
trustworthy speech (mic + lenient matching + self-confirm fallback + model
playback), onboarding, very-young (text-free) mode, adult gate, daily goal,
PWA + full offline via service worker, keyboard parity, no dead-ends / no fail
states, 100% vanilla / buildless / dependency-free / private / free.

**Constraints (unchanged, binding):** vanilla HTML/CSS/JS ES modules, no
framework, no bundler, no build step, no runtime dependencies, `localStorage`
only, all art inline SVG, offline-first PWA, served over http(s)/localhost (CSV
fetch falls back to the embedded set on `file://`). Do not introduce frameworks,
bundlers, CSV/gesture libraries, or a backend.

The loop continues to iteration 4. The remaining work is small and focused:
get the pedagogical ordering demonstrably correct (with a test), add a little
content and visual richness, and confirm the browser-only gesture/layout
criteria with evidence.
