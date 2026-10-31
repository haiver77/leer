# 8 — Specification: "Lalo y las Sílabas" — Auto‑Listen, No "¡Lo dije!", Configurable Words‑Per‑Level, +30 Words Per Category

Evolves `7_specification.md`. Iteration 7 shipped 10‑word levels, an adult voice
picker, a persisted auto‑read toggle, a visible Lalo companion by the card, an
improved success animation, a confirmed success→advance→read micro‑loop, and the
removal of the empty spacer above "Hablar". Iteration 8 takes four binding
demands from `8_input.md`:

1. **D1 — Remove the "¡Lo dije!" button.** The self‑confirm button
   ("Lo dije" / `#confirm-btn`) is removed from the play screen.
2. **D2 — Auto‑listen.** As soon as a word is presented — and *after* it is read
   aloud when auto‑read is configured on — the app **automatically starts
   listening** for the child to read the word, with no tap on the "Hablar" mic
   button required.
3. **D3 — Configurable words per level.** The number of words in a level/session
   becomes **adult‑configurable** in the settings ("Ajustes") section and is
   persisted. It replaces the hard‑coded `min(10, poolSize)` goal.
4. **D4 — +30 words per category.** Add **30 more words to each** of the three
   syllable categories (2‑, 3‑, and 4‑syllable), grown by the existing
   pedagogical rules.

Everything accepted in iterations 1–7 is carried forward unless this document
explicitly supersedes it. This iteration **does not touch the tech stack** (it
stays a vanilla, buildless, offline‑first PWA), **does not re‑open** the
words‑only decision (iter 5) or the 2→3→4 syllable map (iter 6), and keeps the
voice picker, the auto‑read toggle, the visible Lalo, and the improved
celebration from iteration 7.

---

## Overview & Goals

Lalo is a free, private, offline‑first Spanish word‑reading game for young
children: a child sees a word, hears it, says it into the mic, and celebrates
with the mascot Lalo. Iteration 8 removes the last piece of friction in the core
loop — the child (or a watching adult) no longer has to press any button to be
heard. A word appears, Lalo reads it (if configured), and the mic opens *on its
own* so the child just reads back. It also hands the adult control over how long
a session is, and it meaningfully enlarges the vocabulary so sessions feel fresh.

Non‑goals unchanged: 100% vanilla, buildless, offline‑first, private, free, no
backend, no accounts, no tracking.

---

## Superseded / changed from iteration 7 (explicit — not silently dropped)

- **Self‑confirm "¡Lo dije!" button (`#confirm-btn`).** Removed from the play
  screen UI (D1 / AC‑L1). The *underlying* self‑confirm success path
  (`confirmSaid()` → `succeed({ verified:false })`) is **retained in code** as the
  non‑mic fallback so devices **without** speech recognition still complete words
  and never dead‑end — it is simply no longer surfaced as a standing button on
  the play screen (see AC‑L1.3 for how no‑recognition devices succeed).
- **Mic is tapped to listen.** Previously the child tapped "Hablar"
  (`listenAttempt()`) to start recognition. Now, on every new word, the app
  **auto‑starts** listening after presentation (and after the optional auto‑read
  finishes), without a tap (D2 / AC‑L2). The "Hablar" button **remains** as an
  explicit "listen again" control for retries, but it is no longer the only way
  to be heard.
- **Per‑level goal `min(10, poolSize)` (hard‑coded in `levels.js`).** Replaced by
  `Math.min(wordsPerLevel, poolSize)` where `wordsPerLevel` is a **persisted
  adult setting** (default **10**, preserving iteration‑7 behavior) (D3 / AC‑L3).
- **Vocabulary size.** Each of the three CSV categories grows by **+30 rows**
  (D4 / AC‑L4): 2‑syllable 55→85, 3‑syllable 50→80, 4‑syllable 22→52.

Everything else from iterations 1–7 remains in force: words‑only practice, the
per‑word syllable part tiles, guaranteed Spanish TTS + the adult "no Spanish
voice" notice, the adult voice picker (D3/iter7), the auto‑read toggle
(D7/iter7), lenient `es-ES` recognition, keyboard + gesture parity (tap = read,
left‑swipe / `ArrowRight` = next, right‑swipe = repeat), the 2→3→4 world map with
staged unlocks, rewards/sticker book, mastery + adult dashboard, onboarding,
very‑young text‑free mode, adult gate, daily goal, the visible Lalo companion by
the card, the improved success animation, full offline PWA, no dead‑ends / no
fail states, ≥56px targets, ≥4.5:1 contrast, and reduced‑motion / high‑contrast
fallbacks.

---

## Functional Specification

### A. Roles & key flows (carried forward, with the new auto‑listen loop)

- **Child (primary):** picks an unlocked island on the map, plays a session,
  **just reads each word aloud when the mic opens by itself**, and celebrates.
  Never sees settings; never hits a dead‑end or fail state.
- **Adult (secondary):** passes the adult gate to reach the dashboard, reviews
  mastery/trouble words, chooses the reading voice (iter7), toggles auto‑read
  (iter7), and now also **sets how many words a level has** (D3), alongside the
  existing difficulty / very‑young / reset controls.

**Play flow (updated for iteration 8):**
open level → first word shown (Lalo companion visible) →
*(if auto‑read on)* read aloud with Lalo in `model` →
**app auto‑starts the mic** (Lalo `idle`, feedback "Escuchando… 🎤") →
child says the word → on success Lalo `cheer` + improved celebration →
after `ADVANCE_DELAY_MS` the app **auto‑advances** to the next word, **reads it**
(if auto‑read on), and **auto‑starts the mic again** →
repeat until **`wordsPerLevel`** correct (default 10) → summary + sticker → map.

On a **near‑miss / miss** the child stays on the same word; Lalo encourages,
optionally re‑models, and the app **re‑opens the mic** so the child can try again
without any tap (AC‑L2.5). On a device **without speech recognition**, the app
auto‑completes the word via the retained self‑confirm path so play still
advances (AC‑L1.3) — there is no visible "¡Lo dije!" button to press.

### B. Carried‑forward acceptance criteria (keep — do not regress)

All iteration 1–7 acceptance criteria this document does not explicitly supersede
remain in force, including: words‑only practice (no lone‑syllable path); the part
tiles; guaranteed Spanish TTS + the adult notice; the adult **voice picker**
(AC‑K3) and **auto‑read toggle** (AC‑K7); lenient recognition; keyboard + gesture
parity; the ordered 2→3→4 map with staged unlocks; stickers; dashboard mastery;
the **visible Lalo companion** (AC‑K4) and its reactive states; the **improved
success animation** (AC‑K5); the success→advance→read micro‑loop (AC‑K6); the
collapsed/transient `#feedback` region (AC‑K8); offline; and all `words.js`
pedagogical‑order helpers and their tests.

### C. New / changed features for iteration 8

#### AC‑L1 — Remove the "¡Lo dije!" button (D1)
- **AC‑L1.1:** The `#confirm-btn` ("✅ ¡Lo dije!") element is **removed from
  `index.html`** play‑screen markup. No standing self‑confirm button appears
  during play. Its `main.js` click wiring is removed (no dangling listener).
- **AC‑L1.2:** `game.confirmSaid()` and the `succeed({ verified:false })` path
  are **kept in `game.js`** (still exported) so the non‑mic success route exists
  for AC‑L1.3; only the UI affordance is gone. No mastery/stars/streak/daily‑goal
  behavior changes.
- **AC‑L1.3 (no dead‑end on unsupported devices):** When
  `recognitionSupported === false`, the app must still let the child finish a
  word without a hidden button. The chosen mechanism (tuned in `8_plan.md`) is
  one of: (a) on such devices, tapping the card / pressing Enter/Space **counts
  as a self‑confirm success** in addition to modeling the word, or (b) a clearly
  labeled on‑card "Listo ✅" affordance shown **only** when recognition is
  unavailable. Either way: (i) recognition‑capable devices never see it, and
  (ii) a recognition‑less device can always complete the session. This is
  unit‑tested at the state‑machine level (unsupported → a success path reachable
  without `#confirm-btn`).
- **AC‑L1.4:** Removing the button must not leave an empty gap or break the
  `.primary-action` layout (reconcile with AC‑K8's leaner play UI); the mic
  stays the single, centered primary action.

#### AC‑L2 — Auto‑listen after a word is presented (D2)
- **AC‑L2.1:** When a new word is presented in `nextItem()`, the app
  **automatically starts a listen attempt** — the child does not tap "Hablar".
  Listening is driven through the existing `listenAttempt()` (reused, not
  duplicated) so leniency, denial handling, near/miss classification, and the
  self‑confirm fallback are unchanged.
- **AC‑L2.2 (ordering with auto‑read):** When **auto‑read is ON** (AC‑K7), the
  auto‑listen starts **after the word has been read aloud** — i.e. it is
  sequenced after `audio.model(word)` resolves (or after a bounded safety
  timeout), so the mic does not capture Lalo's own TTS. When **auto‑read is
  OFF**, the mic auto‑starts **immediately** on presentation (no read to wait
  for). This read→then‑listen sequencing is the testable contract (see AC‑L2.8).
- **AC‑L2.3:** Auto‑listen only fires while `state.phase === "play"`, only when
  `recognitionSupported === true`, and only when not already `state.listening`.
  On unsupported devices it does **not** fire (the AC‑L1.3 path covers those).
- **AC‑L2.4 (first word of a level):** Opening a level presents word 1, reads it
  if configured, then auto‑listens — the very first word also opens the mic with
  no tap.
- **AC‑L2.5 (retry without a tap):** On a **near‑miss or miss**, after the
  encouragement + optional re‑model, the app **re‑opens the mic automatically**
  (bounded; see AC‑L2.6) so the child can try the same word again without any
  tap. Near‑miss still re‑models the word first; miss just re‑listens.
- **AC‑L2.6 (no runaway loop / safety):** Auto‑listen never stacks or recurses
  uncontrollably. It is scheduled once per presentation/retry, is cancelled on
  navigation (back to map, level open, reset) and when the phase leaves `play`,
  and respects a bounded retry cadence so a persistently silent child does not
  trigger an infinite immediate re‑listen storm (e.g. re‑listen after the normal
  recognition timeout/`onend`, not instantly in a tight loop). The exact cadence
  + any small inter‑attempt delay are tuned in `8_plan.md`.
- **AC‑L2.7 (mic denied):** If the mic permission is **denied**
  (`result.denied`), auto‑listen stops re‑opening the mic (as today it flips
  `recognitionSupported = false`), and the AC‑L1.3 no‑recognition success path
  takes over — no dead‑end, no repeated permission prompts.
- **AC‑L2.8 (testable sequence):** A state‑machine test asserts, for a new word
  with auto‑read ON: exactly one `onMascot("model")` + one `audio.model` read,
  **then** exactly one listen attempt is initiated; with auto‑read OFF: zero
  auto‑read and exactly one listen attempt initiated. Because `speech.listen`
  resolves to a no‑op `{supported:false}` under Node, the test observes the
  *initiation* (e.g. via a seam/spy around the listen call) rather than real
  audio — the plan defines the seam so this is Node‑testable without a browser.
- **AC‑L2.9:** The "Hablar" mic button **remains** and still works as an explicit
  "listen again" trigger (`listenAttempt()`), for a child/adult who wants to
  re‑open the mic manually. Keyboard parity (Space) for manual listen is
  unchanged.

#### AC‑L3 — Configurable words per level (D3)
- **AC‑L3.1:** A new persisted setting **`wordsPerLevel`** (integer) is added to
  the `progress` state, default **10** (preserves iteration‑7 behavior and
  first‑run). It is bounded to a sensible range (suggested **5–20**, tuned in
  `8_plan.md`) and clamped on write so a bad value can never dead‑end a level.
- **AC‑L3.2:** The adult "Ajustes" section gains a labeled control to set the
  words per level (Spanish label, e.g. "Palabras por nivel") — a native
  `<select>` of allowed values or a `<input type="number">`/stepper with min/max.
  It reflects the persisted value and writing it persists immediately.
- **AC‑L3.3:** `levels.js` computes each level's `goal` as
  **`Math.min(wordsPerLevel, poolSize)`**. Because levels are built once at module
  load, the goal must track the *current* setting at session start — the chosen
  mechanism (tuned in `8_plan.md`) is either (a) `buildLevels()`/`goal` reads the
  setting at call‑time (e.g. `goal()` becomes a function or `mapState`/`openLevel`
  recompute it from the live setting), or (b) `game.js` passes the effective goal
  into the session. The binding requirement: **changing `wordsPerLevel` in the
  settings changes how many correct answers end the very next level opened**, with
  no reload, and is unit‑tested.
- **AC‑L3.4:** The completion check in `game.js`
  (`state.levelCorrect >= def.goal`) uses the effective per‑session goal; stars,
  streak, daily‑goal, and sticker logic fire per correct answer exactly as today
  — only the number of answers to finish a level changes. A session **never
  dead‑ends**: if `wordsPerLevel` exceeds a thin band's pool, `goal` is clamped to
  `poolSize` (the `min(...)` guard).
- **AC‑L3.5:** The daily‑goal target (`DEFAULT_DAILY_TARGET`) is **independent**
  of `wordsPerLevel` and is unchanged this iteration (out of scope to couple
  them).

#### AC‑L4 — +30 words per category (D4)
Add **30 new rows to each** CSV so breadth and session variety grow. Final
counts: **2‑syllable 85**, **3‑syllable 80**, **4‑syllable 52**.
- **AC‑L4.1:** `data/words-2syllables.csv` gains **30** rows (55 → 85);
  `data/words-3syllables.csv` gains **30** (50 → 80);
  `data/words-4syllables.csv` gains **30** (22 → 52).
- **AC‑L4.2:** Every new row passes the existing `rowIntegrity` check
  (hyphen‑split `syllables` joins accent/case‑insensitively to `word`;
  `syllable_count` equals the part count), keeps each file ordered by
  non‑decreasing `difficulty_rank` (`isOrderedByRank`), and is consistent with
  `expectedTierKey` (tier → open‑before‑closed → length → alphabetical). New rows
  are inserted at their correct pedagogical rank and the file renumbered to stay
  strictly ascending — **not** blindly appended. (Unit‑tested in `words.test.js`.)
- **AC‑L4.3:** Every new row has a non‑empty `emoji` and an `art_id` that
  **resolves in `art.js`** (100% art coverage preserved) — reusing an existing
  art id or adding a new one in `art.js`.
- **AC‑L4.4:** New words are age‑appropriate, concrete, common Spanish nouns
  (animals, food, toys, body, home, nature), using only taught letters/sounds for
  their tier so the tier model is not broken, and they are **distinct** from the
  existing inventory (no duplicate `word`).
- **AC‑L4.5 (per‑band breadth still holds):** Each band derived by
  `words.forBand(...)` keeps **≥10** words so a default (10‑word) session is
  always reachable with no immediate‑repeat dead‑ends. Because `wordsPerLevel` can
  be raised (AC‑L3), raising it above a band's pool is safely clamped (AC‑L3.4) —
  the inventory does **not** have to guarantee ≥20 per band. A test asserts every
  band pool `.length >= 10`.
- **AC‑L4.6 (offline fallback grows too):** The embedded `WORDS` / `WORDS_3` /
  `WORDS_4` fallbacks in `words.js` are expanded enough that **offline / `file://`**
  every band stays non‑empty and ≥10 (so `buildLevels()`'s empty‑band skip never
  fires and a default session is playable from the fallback alone). They need not
  mirror the full CSV, only keep each band ≥10.
- **AC‑L4.7:** The 4‑syllable additions keep **both** 4‑syllable bands
  (`pal-4-abiertas`, `pal-4-especiales`) at ≥10 each after the split (22→52 gives
  ample room); new "especiales" (digraph/closed/tier‑4) rows land in the
  especiales zone by the ordering rule, new open rows in the abiertas zone.

---

## Pedagogical Order & Criteria (binding on content — carried forward)

Unchanged from iterations 4–7, still machine‑checked by `words.js` helpers and
now applied to the **90 new rows** (30 per category).

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

- **`data/words-2syllables.csv`** — +30 rows (55→85), inserted at correct
  pedagogical ranks and the file renumbered to stay ascending and
  `expectedTierKey`‑consistent. Schema unchanged
  (`word,syllables,syllable_count,difficulty_rank,emoji,art_id`).
- **`data/words-3syllables.csv`** — +30 rows (50→80), same rules.
- **`data/words-4syllables.csv`** — +30 rows (22→52), same rules; both
  4‑syllable bands stay ≥10 (AC‑L4.7).
- **Embedded fallbacks** `WORDS` / `WORDS_3` / `WORDS_4` (`words.js`) — expanded
  only enough to keep every band ≥10 offline (AC‑L4.6).
- **`progress` state (`progress.js`)** gains one persisted setting:
  - `wordsPerLevel: number` (default `10`, clamped to the allowed range) — the
    words‑per‑level control (D3 / AC‑L3).
  It is added to `freshState()` and filled/clamped by `migrate()` for older v2
  states. `localStorage` key stays `silabas:v2` (no version bump). The iter‑7
  keys (`autoRead`, `voicePref`) are unchanged.

### Module changes

- **`js/levels.js`** — the per‑level `goal` must honor the live `wordsPerLevel`
  setting rather than a literal `10` (AC‑L3.3). Preferred approach: expose the
  effective goal at call‑time — e.g. a pure `effectiveGoal(poolSize, wordsPerLevel)`
  helper (`Math.min(clamp(wordsPerLevel), poolSize)`), with `mapState` / the game
  reading the current setting when opening a level. Band specs, ids, titles,
  unlock chain, `buildLevels()`/`all`/`byId`/`firstLevelId`/`nextUnlock`/
  `isUnlocked`/`completeLevel` are otherwise unchanged. Keep levels pure/testable
  (pass `wordsPerLevel` in, don't import `progress`).
- **`js/game.js`** —
  - **Auto‑listen (AC‑L2):** after `nextItem()` presents a word, schedule a
    listen attempt. When auto‑read is ON, chain it after `audio.model(...)`
    resolves (await / `.then`) with a bounded safety timeout; when OFF, start it
    immediately. Reuse `listenAttempt()`. Guard with phase/`recognitionSupported`/
    `listening` checks and a cancel on navigation (AC‑L2.3/L2.6). On near/miss,
    re‑open the mic after the encouragement/re‑model (AC‑L2.5), respecting the
    bounded cadence. Introduce a tiny **seam** (e.g. an injectable
    `startListening` or a counter) so the *initiation* is observable in Node tests
    (AC‑L2.8).
  - **Effective goal (AC‑L3):** compute the session goal from
    `levels.effectiveGoal(poolSize, state.progress.wordsPerLevel)` at
    `openLevel()` (store it on `state`, e.g. `state.levelGoal`) and use it in the
    `done` check, instead of reading `def.goal` as a constant. `view()` /
    `dashboardStats()` expose it where the UI needs it.
  - **Settings (AC‑L3.2):** add `setWordsPerLevel(n)` that clamps, persists, and
    `render()`s. `dashboardStats()` exposes `wordsPerLevel`.
  - **Self‑confirm retained (AC‑L1.2):** keep `confirmSaid()` exported; no change
    to `succeed()`. Add the AC‑L1.3 no‑recognition success hook (e.g. in
    `tapCard()` when unsupported, or a dedicated path) per the plan.
- **`index.html`** —
  - **Remove `#confirm-btn`** from the play screen (D1 / AC‑L1). Keep the mic
    (`#speak-btn`) as the sole primary action; reconcile `.primary-action` layout
    so no gap remains (AC‑L1.4).
  - **Adult "Ajustes"** gains a **words‑per‑level control** (`#words-per-level`,
    labeled "Palabras por nivel"), placed with the difficulty / very‑young /
    auto‑read / voice / reset controls (D3).
  - If AC‑L1.3 chooses a visible "Listo ✅" affordance for unsupported devices,
    add it hidden‑by‑default and shown only when recognition is unavailable.
- **`js/main.js`** —
  - Remove the `#confirm-btn` lookup + click wiring. Update the keyboard handler
    so **Enter** no longer maps to a now‑absent confirm button: on
    recognition‑capable devices Enter/Space/tap behave per existing read/listen
    semantics; on unsupported devices they drive the AC‑L1.3 success path. (Tuned
    in `8_plan.md`; no key path may dead‑end.)
  - Wire `#words-per-level` → `game.setWordsPerLevel(value)` and reflect the
    persisted value in `renderDashboard()`.
  - No change to the voice picker / auto‑read toggle wiring (iter7).
- **`css/styles.css`** — adjust `.primary-action` now that it holds a single
  button (center the mic, remove confirm‑specific styles or leave them inert);
  style the new words‑per‑level control (and the optional "Listo" affordance) to
  the existing form‑control conventions, ≥56px targets, ≥4.5:1 contrast.
- **`js/progress.js`** — add `wordsPerLevel` (default 10) to `freshState()`;
  `migrate()` fills + **clamps** it for older/invalid v2 states (AC‑L3.1).
- **`js/speech.js`** — unchanged (auto‑listen reuses `listen()`; no new speech
  logic). The sequencing lives in `game.js`.
- **`js/audio.js`** — unchanged (still models a whole word via clip→TTS; its
  promise is awaited by the auto‑listen sequencing).
- **`js/art.js`** — add any new `art_id`s referenced by the 90 new rows that do
  not reuse an existing id (AC‑L4.3).
- **`sw.js`** — **bump `CACHE_VERSION`** to `lalo-silabas-v8.0.0` so the updated
  shell, the three grown CSVs, and JS ship offline. Precache membership unchanged
  (all three CSVs already listed).

### New / changed pure contracts
```
// levels.js — goal now honors the adult setting (clamped to the pool)
clampWordsPerLevel(n)                         -> int in [MIN..MAX]   // e.g. 5..20
effectiveGoal(poolSize, wordsPerLevel)        -> Math.min(clampWordsPerLevel(wordsPerLevel), poolSize)

// game.js
setWordsPerLevel(n: number)                   // clamp + persist + render
// session goal stored at openLevel(): state.levelGoal = effectiveGoal(pool.length, progress.wordsPerLevel)
// auto-listen seam (name tuned in plan): startListening() invoked after
//   present (+ after read when autoRead), observable for AC-L2.8 tests

// progress.js — new persisted field (default + clamp)
freshState().wordsPerLevel = 10
```
All new logic reuses existing patterns; **no new library**.

### Testing (Node `--test`, framework‑free; run from workspace root)
```
node --test "js/*.test.js"
node --check js/*.js sw.js
```
- **`levels.test.js`** — `effectiveGoal`/`clampWordsPerLevel` behave (clamps
  below min/above max; `min(setting, poolSize)`); every band pool `.length >= 10`
  (AC‑L4.5). Existing ordering/unlock‑chain tests unchanged.
- **`words.test.js`** — breadth: each band partition (`forBand`) ≥10;
  `rowIntegrity`, rank ordering, and `expectedTierKey` consistency on **every** row
  of all three grown CSVs; **no duplicate `word`** across the inventory; 100% art
  coverage incl. new ids; embedded fallbacks keep each band ≥10 (AC‑L4.5/L4.6).
- **`game.test.js`** —
  - (a) **Auto‑listen sequence** (AC‑L2.8): new word with auto‑read ON → one
    `onMascot("model")` + one `audio.model`, **then** one listen initiation; with
    auto‑read OFF → zero reads + one listen initiation; first word of a level also
    auto‑listens (AC‑L2.4).
  - (b) **Configurable goal** (AC‑L3): with `wordsPerLevel = 5`, a level completes
    after 5 correct (not 10); with 10, after 10; a value above a pool clamps to the
    pool and still completes (no dead‑end).
  - (c) **No `#confirm-btn` dependency** (AC‑L1): a success path is reachable
    without the removed button; on a simulated unsupported device the AC‑L1.3 path
    completes a word; `confirmSaid()` still succeeds when called.
  - (d) Carried: the success micro‑loop advances once + reads next once (AC‑K6);
    the final correct answer completes the level with no stray read; no standing
    "Di la palabra" feedback.
- **`progress.test.js`** — `freshState().wordsPerLevel === 10`; `migrate()` of an
  older v2 blob fills/clamps it (missing → 10; out‑of‑range → clamped) without
  disturbing `autoRead`/`voicePref`/other fields.
- **Browser‑only (recorded in `8_plan.md`):** on a new word the mic opens by
  itself after the read (no tap) and captures the child, not Lalo's TTS;
  near/miss re‑opens the mic without a tap; a denied mic stops re‑opening and the
  session still completes; the "¡Lo dije!" button is gone and no gap remains; the
  words‑per‑level setting changes the next level's length live; the three grown
  CSVs load and play; offline/`file://` still playable; contrast ≥4.5:1 and the
  reduced‑motion/high‑contrast/forced‑colors fallbacks still hold.

### Persistence
`localStorage` schema stays `silabas:v2`. One new key (`wordsPerLevel`, default
10, clamped) is added to the progress object and defaulted/clamped by `migrate()`
— no version bump, no migration. Only `CACHE_VERSION` bumps (to `v8.0.0`). An
out‑of‑range or missing `wordsPerLevel` falls back to the clamp/default.

---

## Tech Stack Decision (binding — UNCHANGED)
**No change in stack.** Vanilla **HTML5 + CSS3 + JavaScript (ES modules)**, **no
framework, no bundler, no build step, no runtime dependencies**, `localStorage`
only, **all art inline SVG**, offline‑first **PWA** via `sw.js` +
`manifest.webmanifest`, served over http(s)/localhost (with a `file://`
fallback). Specifically:
- **Word inventory = static CSV files** under `data/` (three: 2‑, 3‑, 4‑syllable,
  now 85 / 80 / 52 rows), loaded via `fetch`, parsed by the existing hand‑written
  parser in `words.js`. No CSV library.
- **Pedagogical correctness + band derivation = pure JS helpers + Node `--test`.**
  No validation/schema library.
- **Speech = Web Speech API** (synthesis + recognition), `es-ES`; the voice
  picker/override (iter7) and the new **auto‑listen** are pure orchestration over
  `speech.listen` / `speech.speak` in `game.js`. No TTS/ASR library or service.
- **Settings (auto‑read toggle, voice preference, words‑per‑level) =
  `localStorage`** via the existing `progress.js`. No settings/state library.
- **Gestures = native Pointer Events**; **layout + card depth + mascot + all
  animation (incl. the celebration) = CSS + Canvas + Web Audio only**. No
  gesture/animation/confetti library.
- CSV/art precached by the SW (bump `CACHE_VERSION`). **No `app/` folder; code at
  the workspace root.** Do not introduce frameworks, bundlers, runtime package
  managers, CSV/gesture/animation libraries, or a backend.

---

## Non‑Functional Requirements
- **Frictionless core loop:** the child is heard with **zero taps** — the mic
  opens by itself on each word (after the read, when auto‑read is on) and re‑opens
  for retries; no standing "¡Lo dije!" button clutters the play screen.
- **No dead‑ends, ever:** recognition‑less devices still complete words (retained
  self‑confirm path, no visible button); a denied mic degrades gracefully; a
  `wordsPerLevel` larger than a band's pool is clamped; the auto‑listen loop is
  bounded and cannot runaway or recurse.
- **Adult control:** session length is adult‑configurable and persisted (default
  10, bounded 5–20), alongside the iteration‑7 voice and auto‑read controls, with
  safe clamping.
- **Vocabulary breadth & correctness:** +30 words per category (final 85 / 80 /
  52); all rows pass integrity + ordering + tier checks; no duplicate words; 100%
  art coverage; words child‑appropriate, concrete, common; every band ≥10.
- **Accessibility:** ≥4.5:1 text contrast; `prefers-reduced-motion` and
  `prefers-contrast: more` / forced‑colors honored; ≥56px targets; the `#feedback`
  live region preserved and announcing "Escuchando… 🎤" when the mic auto‑opens;
  the words‑per‑level control is a proper labeled form control; removing
  `#confirm-btn` does not remove any keyboard‑reachable success path; very‑young
  text‑free mode still playable; Lalo stays decorative/`aria-hidden`.
- **Performance / offline / privacy:** unchanged — small CSVs (now a bit larger)
  parsed once + cached in memory and by the SW; full offline after first load;
  CSS/Canvas animation stays 60fps‑friendly; no accounts/ads/tracking; graceful
  `file://` fallback; no fail states.

---

## Out of Scope (iteration 8)
- 5+ syllable words, sentences, phrases, or reading comprehension.
- Bundling/shipping or downloading a Spanish TTS voice in‑app (the iter‑7 voice
  picker only chooses among installed voices; the "no Spanish voice" notice
  still applies).
- Per‑word or per‑level voice overrides, voice rate/pitch sliders, or exposing the
  recognition locale to adults.
- Configurable auto‑listen *timeouts/sensitivity*, VAD, or continuous
  always‑listening dictation — auto‑listen reuses the existing single‑utterance
  `speech.listen` with its current timeout; only *who triggers it* changes.
- Coupling the daily‑goal target to `wordsPerLevel`, or per‑band word‑count
  overrides (one global `wordsPerLevel` this iteration).
- A visual/authoring editor, remote/server‑hosted word lists, or any backend.
- Advanced gestures beyond tap + horizontal swipe; new mascot characters.
- Recorded audio clips (TTS remains the auto‑read source; clips stay a future
  drop‑in via `audio.js` + `sw.js`).
- Automated end‑to‑end / visual‑regression testing of the live mic auto‑open,
  real TTS/ASR audio, contrast, or layout (verified manually in a browser with
  notes in `8_plan.md`).
- A `localStorage` schema‑version bump or progress migration (the new setting
  defaults/clamps in place).
