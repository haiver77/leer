# 8 — Developer Plan: Auto‑Listen, No "¡Lo dije!", Configurable Words‑Per‑Level, +30 Words/Category

Implements `loops/8_specification.md` (AC‑L1..AC‑L4) over the existing vanilla,
buildless, offline‑first PWA at the workspace root. No framework, no bundler, no
new dependency. Tests stay Node's built‑in runner.

---

## Implementation plan (per file, mapped to ACs)

### AC‑L1 — Remove the "¡Lo dije!" button
- **index.html:** delete the `#confirm-btn` element from `.primary-action` so the
  mic (`#speak-btn`) is the single, centered primary action. No "Listo ✅"
  affordance is added — the chosen AC‑L1.3 mechanism is **(a) tap/Enter/Space =
  self‑confirm on unsupported devices**, so no new markup is needed.
- **js/main.js:** remove the `const confirmBtn = el("confirm-btn")` lookup and the
  `confirmBtn.addEventListener("click", …)` wiring. Remove the
  `confirmBtn.classList.toggle("is-primary", …)` line in `renderPlay()`. Rework the
  keyboard handler: `Enter` and `Space` now call a single `game.primaryAction()`
  intent (reads on recognition devices via listen, self‑confirms on unsupported
  devices) — no key path dead‑ends and none references the removed button.
- **js/game.js:** keep `confirmSaid()` exported and `succeed({verified:false})`
  unchanged (AC‑L1.2). Add the AC‑L1.3 hook: when `recognitionSupported === false`,
  `tapCard()` both models the word AND calls `confirmSaid()` so a tap/Enter/Space
  completes the word. Add `primaryAction()` used by the keyboard.
- **css/styles.css:** `.primary-action` already centers a column; with one child
  there is no gap. Leave `.btn-confirm` / `.btn-confirm.is-primary` rules inert
  (harmless dead CSS) — no element uses them now. No layout change needed beyond
  confirming the single centered mic.

### AC‑L2 — Auto‑listen after a word is presented
- **js/game.js:** add a bounded auto‑listen orchestration:
  - A **seam** `handlers.onListen` (optional) is invoked at the moment a listen is
    *initiated* so Node tests can observe initiation without real audio. Also add
    a test/opt dep `deps.recognitionSupported` so a Node test can force recognition
    "on" (real browser uses `speech.recognitionSupported`).
  - New internal `scheduleAutoListen()`:
    - returns early unless `state.phase === "play"`, `state.recognitionSupported`,
      and `!state.listening` (AC‑L2.3);
    - guards against stacking via a per‑presentation token `state.listenToken`
      (incremented on every present/navigation) so a stale scheduled callback is
      dropped (AC‑L2.6);
    - fires `handlers.onListen?.()` then `listenAttempt()` (reuse, not duplicate —
      AC‑L2.1).
  - In `nextItem()`: when `autoRead` ON, `await audio.model(word)` **then**
    `scheduleAutoListen()` (sequenced after the read — AC‑L2.2) guarded by a bounded
    safety timeout (`AUTO_LISTEN_SAFETY_MS`) so a never‑resolving read still opens
    the mic; when OFF, `scheduleAutoListen()` immediately (AC‑L2.2). This covers the
    first word of a level too (openLevel → nextItem) (AC‑L2.4).
  - On **near/miss** in `listenAttempt()`: after the encouragement (+ re‑model on
    near), re‑open the mic via `scheduleAutoListen()` — but only after the natural
    `speech.listen` resolution/`onend` (not a tight recursive loop), and gated by
    the same phase/token checks (AC‑L2.5/L2.6). A tiny `AUTO_LISTEN_RETRY_MS` delay
    spaces attempts.
  - **Cancellation:** `goMap()`, `openLevel()`, `resetProgress()` and any phase
    leave bump `state.listenToken`, so in‑flight scheduled re‑listens no‑op
    (AC‑L2.6).
  - **Mic denied:** unchanged behavior flips `recognitionSupported=false`; because
    `scheduleAutoListen()` checks that flag, it stops re‑opening and the AC‑L1.3
    tap/Enter path takes over (AC‑L2.7).
  - The ordering contract (`onMascot("model")` + `audio.model` **then** one
    `onListen`) is the testable seam (AC‑L2.8).
- **js/main.js:** `#speak-btn` still wired to `game.listenAttempt()` as the manual
  "listen again" (AC‑L2.9). Pass an `onListen` handler is **not** needed in main
  (browser auto‑listens for real); the seam is only consumed by tests.

### AC‑L3 — Configurable words per level
- **js/progress.js:** add `wordsPerLevel: 10` to `freshState()`. In `migrate()`
  fill + clamp it for older v2 states (missing → 10, out‑of‑range → clamped to
  5..20) without disturbing `autoRead`/`voicePref` (AC‑L3.1).
- **js/levels.js:** add pure `MIN_WORDS_PER_LEVEL = 5`, `MAX_WORDS_PER_LEVEL = 20`,
  `DEFAULT_WORDS_PER_LEVEL = 10`, `clampWordsPerLevel(n)` (coerce int, clamp,
  default on NaN), and `effectiveGoal(poolSize, wordsPerLevel) =
  Math.min(clampWordsPerLevel(wordsPerLevel), poolSize)`. Keep levels pure (no
  import of progress). The static `goal: Math.min(10, poolSize)` stays as a
  back‑compat default used by map rendering/tests, but the *session* goal is
  computed in game.js (AC‑L3.3).
- **js/game.js:** at `openLevel()` set `state.levelGoal =
  levels.effectiveGoal(state.pool.length, state.progress.wordsPerLevel)` and use
  `state.levelCorrect >= state.levelGoal` in the `done` check (AC‑L3.3/L3.4). Add
  `setWordsPerLevel(n)` → clamp (via `levels.clampWordsPerLevel`), persist, render.
  `dashboardStats()` exposes `wordsPerLevel`. `view()` exposes `levelGoal`.
- **index.html:** add a labeled `<select id="words-per-level">` ("Palabras por
  nivel") in the Ajustes section with values 5,10,15,20 (spanning the clamp range)
  using the existing `.field`/`.select` conventions.
- **js/main.js:** add `const wordsPerLevelSelect = el("words-per-level")`, wire its
  `change` → `game.setWordsPerLevel(Number(value))`, and in `renderDashboard()`
  reflect `stats.wordsPerLevel` onto the control.

### AC‑L4 — +30 words per category
- **data/words-2syllables.csv:** 55 → 85 (insert 30 at correct pedagogical ranks,
  renumber `difficulty_rank` strictly ascending 1..85).
- **data/words-3syllables.csv:** 50 → 80.
- **data/words-4syllables.csv:** 22 → 52 (both 4‑syll bands stay ≥10).
- Every new row: passes `rowIntegrity` (hyphen parts rejoin accent/case‑insens.;
  `syllable_count` == part count), `expectedTierKey`‑consistent placement
  (tier → open‑before‑closed → length → alphabetical), non‑empty emoji, resolving
  `art_id`. New `art_id`s added to **js/art.js** where no existing picture fits.
  Only taught‑letter words per tier; concrete common nouns; no duplicate `word`.
- **js/words.js:** grow embedded `WORDS` / `WORDS_3` / `WORDS_4` only enough that
  each band stays ≥10 offline (they already are ≥10 for 2‑ and 3‑syll; `WORDS_4`
  has 22 across two bands). Keep them valid + rank‑ordered.

### sw.js
- Bump `CACHE_VERSION` from `lalo-silabas-v7.0.0` → `lalo-silabas-v8.0.0`.

### Tests (extend)
- **levels.test.js:** `clampWordsPerLevel`/`effectiveGoal` behavior; every band
  pool ≥10. Keep existing goal‑is‑10 test (static default still 10).
- **words.test.js:** counts 85/80/52; integrity/rank/tier on every row; no dup
  `word`; 100% art coverage incl. new ids; band breadth ≥10; fallback ≥10.
- **game.test.js:** auto‑listen seam (ON → model+read then one `onListen`; OFF →
  zero reads + one `onListen`; first word auto‑listens); configurable goal (5
  completes after 5; above‑pool clamps); no `#confirm-btn` dependency + unsupported
  device completes via tap + `confirmSaid()` still works.
- **progress.test.js:** `freshState().wordsPerLevel === 10`; migrate fills/clamps.

---

## Deployment plan (local + PWA)

No build step. Serve the workspace root over http(s)/localhost so ES modules,
`fetch` of the CSVs, and the service worker all work:

```
# from the workspace root (any static server works); e.g. Python:
python -m http.server 8000
# then open http://localhost:8000/
```

- `file://` also runs (the embedded `WORDS*` fallbacks keep every band ≥10), but
  the SW + CSV `fetch` need http(s)/localhost.
- The SW (`sw.js`) precaches the shell + three CSVs; the `CACHE_VERSION` bump to
  `v8.0.0` invalidates the old cache on next load so the grown CSVs + updated
  shell ship offline after first load.

## Verification

Automated (run from the workspace root):
```
node --check js/main.js js/game.js js/levels.js js/progress.js js/words.js js/art.js js/speech.js js/audio.js sw.js
node --test "js/*.test.js"
```
Expected: syntax check clean; all tests pass (counts reported in the summary).

Browser‑only manual checks (per spec):
- New word: mic opens by itself after the read (auto‑read ON) / immediately (OFF),
  with no tap; it captures the child, not Lalo's TTS.
- Near/miss re‑opens the mic without a tap; a denied mic stops re‑opening and the
  session still completes (tap/Enter on the card).
- The "¡Lo dije!" button is gone and no gap remains above the mic.
- "Palabras por nivel" changes the next level's length live (set 5 → next level
  ends after 5 correct).
- The three grown CSVs load and play; offline/`file://` still playable.
- Contrast ≥4.5:1; `prefers-reduced-motion` / `prefers-contrast: more` /
  forced‑colors fallbacks still hold; ≥56px targets.
