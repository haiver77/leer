# 7 — Plan: "Lalo y las Sílabas" — 10-Word Levels, Voice Picker, Visible Lalo, Better Celebrate, Configurable Auto-Read, Leaner Play UI

Implements `loops/7_specification.md` (AC-K1…AC-K8). All application code lives at
the workspace root; only this plan lives under `loops/`. Tech stack unchanged:
vanilla HTML/CSS/ES-module JS, no framework/bundler/deps, `localStorage`, PWA via
`sw.js` + `manifest.webmanifest`, Node's built-in test runner (no `package.json`).

---

## 1. Implementation plan (what changed, by file)

### AC-K1 — 10 words per level (D1)

**`js/levels.js`** — `goal: Math.min(5, poolSize)` → **`Math.min(10, poolSize)`**.
Nothing else in the level map changes. With the grown inventory (AC-K2) every
band's pool is ≥10, so every level goal is exactly 10.

### AC-K2 — More 2-syllable words (D2)

Before the change, the 2-syllable bands derived (via `words.forBand`) as:
`pal-2-abiertas-1` = 21, `pal-2-abiertas-2` = **8**, `pal-2-abiertas-3` = 14,
`pal-2-especiales` = **9**. Two bands were short of 10. The 3-syllable bands
(15 / 18 / 17) and `pal-4-abiertas` (12) already clear 10; only
`pal-4-especiales` (**9**) needed one more.

**`data/words-2syllables.csv`** — grown from 52 → **55 rows**, inserted at their
correct pedagogical ranks (not appended), then the whole file renumbered 1…55 so
`difficulty_rank` stays strictly ascending and `expectedTierKey`-consistent
(tier → open-before-closed → length → alphabetical):

| word  | syllables | count | emoji | art_id        | band → why here |
|-------|-----------|------:|-------|---------------|-----------------|
| nene  | ne-ne     | 2     | 👶    | word-nene     | tier-2 open (n) — alpha between `luna` and `nido` |
| nudo  | nu-do     | 2     | 🪢    | word-nudo     | tier-2 open (n/d) — alpha after `nina`, before `pino` |
| coche | co-che    | 2     | 🚗    | word-coche    | especiales (digraph `ch`) — in the tier-4/digraph tail |

`nene` + `nudo` lift `pal-2-abiertas-2` from 8 → **10**; `coche` lifts
`pal-2-especiales` from 9 → **10**.

**`data/words-4syllables.csv`** — grown from 21 → **22 rows** (AC-K2.6): one new
especiales word inserted at its rank, file renumbered 1…22:

| word        | syllables       | count | emoji | art_id            | band → why here |
|-------------|-----------------|------:|-------|-------------------|-----------------|
| mantequilla | man-te-qui-lla  | 4     | 🧈    | word-mantequilla  | especiales (closed `man` + digraph `ll`) — in the especiales tail, alpha before `maravilla` |

This lifts `pal-4-especiales` from 9 → **10**.

**`js/art.js`** — added four inline-SVG arts so coverage stays 100%:
`word-nene`, `word-nudo`, `word-coche` (2-syll) and `word-mantequilla` (4-syll).

**`js/words.js`** — expanded the embedded offline fallbacks so each 2-syllable
band stays non-empty **and ≥10** offline / from `file://` (AC-K2.5):
- `WORDS` grown 21 → **40** entries covering all four 2-syllable bands with ≥10
  each (tier-1 ≥10, tier-2 ≥10 incl. `nene`/`nudo`, tier-3 ≥10, especiales ≥10
  incl. `coche`), ordered easiest-first and rank-renumbered 1…40.
- `WORDS_4` grown 10 → **11** (added `mantequilla`) so the offline 4-syllable
  especiales band is also comfortably populated.
- `WORDS_3` left as-is (its three bands already had ≥10 from the live CSV; the
  fallback stays representative/non-empty, which is all AC-K2.5 requires for it).

### AC-K3 — Voice picker in the adult panel (D3)

**`js/speech.js`** — added pure, Node-testable voice helpers plus a persisted
override, without changing the existing cancel/await/no-throw behavior:
- `voiceId(voice)` → `voice.voiceURI || voice.name + "|" + voice.lang` (stable id
  used to persist and to match a stored preference).
- `resolveVoice(voices, preferredId)` → the preferred voice when present (matched
  by `voiceId`), else `pickSpanishVoice(voices)`, else `null`. Pure.
- `setPreferredVoice(id)` / `getPreferredVoice()` — a module-level preferred id
  the app sets from the persisted `voicePref`.
- `availableVoices()` → `{ id, label, lang }[]`, Spanish-first (reuses
  `spanishBucket` ordering, then name), for populating the `<select>`. Reads
  `getVoices()`; empty when synthesis is absent.
- `speak(text)` now resolves via `resolveVoice(getVoices(), getPreferredVoice())`
  and sets `utter.lang` to the resolved voice's lang (else `es-ES`). The "no
  Spanish voice" notice logic is unchanged.

**`index.html`** — the adult "Ajustes" section gains a labeled native
`<select id="voice-select">` ("Voz de lectura") with a first option
"Automática (recomendada)" (value `""`).

**`js/main.js`** — populates `#voice-select` from `game.dashboardStats()`
(`availableVoices`), re-populates on `voiceschanged`, preselects the persisted
`voicePref`, and on `change` calls `game.setVoicePref(value || null)`.

### AC-K4 — Lalo more visible on the play screen (D4)

**`index.html`** — the small `#game-mascot` chip was moved out of
`.secondary-controls` (below the mic) to a new **`#game-mascot` host inside the
`#card-host`** as a companion anchored to the card's top-right corner, still
`aria-hidden="true"` and non-interactive. `.secondary-controls` (which only held
the chip) is removed, eliminating the dead cluster below the mic.

**`js/main.js`** — the mascot host lookup for the play phase still resolves
`#game-mascot` (same id, new location), so `mountMascotFor("play")` is unchanged.

**`css/styles.css`** — new `.card-host .mascot-companion` placement: a larger
Lalo (`clamp(64px, 18vw, 104px)`) absolutely positioned at the card's top-right,
`pointer-events: none` so it never steals a tap, `z-index` above the card art but
it sits in the corner clear of the word/tiles. Responsive tweaks at 320px and
short-landscape shrink it and nudge it so it never overlaps the word or pushes
controls off-screen; `prefers-reduced-motion` keeps it a static pose (existing
mascot reduced-motion rules already cover the states).

### AC-K5 — Improved success animation (D5)

**`css/styles.css`** — added a short `word-pop` keyframe (scale 1 → ~1.12 → 1 with
a tiny rotate, ~600ms) and a `.word-view.word-pop` trigger class; a bigger
`cheer` jump for Lalo (existing `lalo-state-cheer`), all behind
`prefers-reduced-motion: reduce` (the whole block is skipped under reduce).

**`js/celebrate.js`** — `play()` now, for a non-milestone success, also triggers a
richer burst (slightly more particles + a wider shape mix) and calls an optional
`onPop` hook; milestone stays visibly bigger (unchanged bigger fanfare + 220
particles). Reduced-motion still skips all confetti/motion (sound + haptics only).

**`js/game.js`** — `succeed()` adds a `handlers.onSuccessPop?.()` call right after
`celebrate.play(...)` so the UI can pop the card. The pop + burst + Lalo cheer all
complete well inside `ADVANCE_DELAY_MS = 1200`, so auto-advance/read still fires on
time (AC-K5.3).

**`js/main.js`** — provides `onSuccessPop` → toggles `.word-pop` on `#word-view`
(reflow-restart like the entrance animation) so each success pops the card.

### AC-K6 — Confirm auto-advance + read-next (D6)

No behavioral change was required — the existing `succeed()` →
`setTimeout(ADVANCE_DELAY_MS)` → `nextItem()` path already auto-advances and
auto-reads. This iteration **locks** it with tests (see §4): a non-final success
advances exactly once and reads the next word exactly once; the 10th correct
answer runs `completeLevel()` and fires **no** stray auto-read.

### AC-K7 — Configurable auto-read (D7)

**`js/progress.js`** — `freshState()` gains `autoRead: true` and
`voicePref: null`; `migrate()` defaults both for older v2 blobs (missing keys
default via the existing `{ ...base, ...raw }` merge — explicit, no schema bump).

**`js/game.js`** — `nextItem()` gates the on-display read on
`state.progress.autoRead`: when on, it sets Lalo to `model` and calls
`audio.model(state.current)` (one read per new word, exactly as iteration 6); when
off, it does neither (the child can still tap the card / Enter / Space / `l`).
Added `setAutoRead(on)` (persist + `render()`) and `setVoicePref(id)` (persist +
`speech.setPreferredVoice(id)` + `render()`). On game creation the persisted
`voicePref` is applied via `speech.setPreferredVoice(...)`. `dashboardStats()`
now exposes `autoRead`, `voicePref`, and `availableVoices`.

**`index.html`** — adult "Ajustes" gains a labeled
`<input type="checkbox" id="autoread-toggle">` ("Leer la palabra
automáticamente"), default checked.

**`js/main.js`** — reflects the persisted `autoRead` in `renderDashboard()` and
wires `#autoread-toggle`'s `change` → `game.setAutoRead(e.target.checked)`.

### AC-K8 — Remove the empty control above "Hablar" (D8)

**`css/styles.css`** — `#feedback` now collapses to zero footprint when empty
(`.feedback:empty { min-height: 0; padding: 0; margin: 0; border: 0; }`) while
keeping its `role="status" aria-live="polite"` region (markup unchanged). When it
has content it animates back to its normal size; the mic row sits in a stable
flex column so a transient message does not shove the mic button under the
finger (the feedback line reserves its space via the surrounding layout, not a
standing min-height). The old `.secondary-controls` empty cluster is gone (D4).

### Offline / cache

**`sw.js`** — `CACHE_VERSION` bumped to **`lalo-silabas-v7.0.0`**. The precache
`SHELL` membership is unchanged (all three CSVs already listed); on next load the
SW `activate` deletes stale caches and `clients.claim()`s so the grown CSVs +
updated shell ship offline.

---

## 2. New 2-syllable words with ranks (reference)

After renumbering, the 2-syllable file is 55 rows. The three inserted rows and
their final ranks:

| final rank | word  | zone / tier |
|-----------:|-------|-------------|
| 26 | nene  | tier-2 open (between `luna` and `nido`) |
| 29 | nudo  | tier-2 open (between `nina` and `pino`) |
| 54 | coche | especiales (digraph `ch`, in the tier-4/digraph tail) |

4-syllable file is 22 rows; `mantequilla` lands in the especiales tail (closed +
`ll`) just before `maravilla`.

Exact ranks are verified at build time by the `difficulty_rank`-equals-row-order
test and the pedagogical-order test; see §4.

---

## 3. Deployment plan

- **Static hosting, unchanged.** Serve the workspace root over http(s)/localhost
  (or `file://` — the grown embedded fallbacks cover every band ≥10 offline). No
  build step.
- **Ship:** publish the updated `index.html`, `css/styles.css`, `js/*.js`,
  `data/*.csv`, `manifest.webmanifest`, `sw.js`.
- **Cache bust:** `CACHE_VERSION = lalo-silabas-v7.0.0` — the SW `activate`
  deletes stale caches and `clients.claim()`s; the shell + all three CSVs are
  re-precached.
- **Rollback:** revert to the previous commit and restore `CACHE_VERSION`
  `v6.0.0`; the two new settings default in place, no data migration.

---

## 4. Verification

### Automated (run from the workspace root)

```
node --test "js/*.test.js"
node --check js/words.js js/levels.js js/speech.js js/game.js js/progress.js js/celebrate.js js/main.js js/art.js sw.js
```

> Use the glob `node --test "js/*.test.js"` (framework-free, Node's built-in
> runner, no `package.json`). `node --test js/` is misread as a module path on
> newer Node.

Test changes (superseded tests updated explicitly, not deleted):
- **`levels.test.js`** — the old `goal in 1..5` bound is replaced by asserting
  **every band `goal === 10`** and **every `level.pool().length >= 10`**
  (AC-K1.2); unlock-chain / ordering tests unchanged.
- **`words.test.js`** — new per-band breadth test: each 2-syllable band
  (`forBand`) has **≥10** members; the whole grown 2-syllable file still passes
  `rowIntegrity`, rank order, `expectedTierKey` pedagogy, and 100% art coverage
  (incl. the new ids); the embedded `WORDS` fallback keeps each 2-syllable band
  non-empty and ≥10 (AC-K2.5). The ≥50 breadth minimum is raised to account for
  the grown file; the strict `rank === rowIndex+1` test covers the renumbering.
- **`speech.test.js`** — `voiceId` stability; `resolveVoice` (preferred-present →
  chosen; preferred-absent → Spanish auto; none → null); `availableVoices`
  Spanish-first ordering. Existing `pickSpanishVoice` tests unchanged.
- **`game.test.js`** — (a) auto-read ON → each new word fires exactly one
  `audio.model`-paired `onMascot("model")`; OFF → zero model per new word
  (AC-K7.3); (b) success micro-loop advances once and reads once (AC-K6.4) using
  a fake timer; (c) the 10th correct answer completes the level with no stray
  read (AC-K6.3); (d) no standing "Di la palabra" feedback (carried AC-J6.2).
- **`progress.test.js`** — `freshState()` has `autoRead === true` and
  `voicePref === null`; `migrate()` of an older v2 blob fills both without
  disturbing other fields.

Expected outcome: all suites pass; `node --check` on every changed module → OK.

### Browser-only (manual — cannot be auto-verified here)

- **Voice picker:** `#voice-select` lists real device voices (refreshing on
  `voiceschanged`); choosing one changes the spoken voice and persists across
  reload; "Automática" reverts to the Spanish auto-pick. The "no Spanish voice"
  notice still appears when none is installed.
- **Auto-read toggle:** turning `#autoread-toggle` off silences the on-display
  read live (the word still speaks on tap / Enter / Space / `l`); on restores it;
  the setting persists across reload.
- **Visible Lalo:** Lalo is a clearly visible companion by the card and reacts
  (idle/model/encourage/cheer) during play; it never overlaps the word/tiles/
  buttons/feedback or steals a tap, holds at 320px and in short-landscape, and is
  a static pose under reduced-motion.
- **Success animation:** the card pops + a richer burst + a bigger Lalo cheer on
  a correct answer, all ≤ ~1s and inside `ADVANCE_DELAY_MS`; the milestone is
  bigger; reduced-motion skips the motion/confetti.
- **Leaner UI:** no empty standing gap above "Hablar"; transient feedback appears
  and is announced without shoving the mic button under the finger.
- Contrast ≥4.5:1 and the reduced-motion / high-contrast / forced-colors
  fallbacks from earlier iterations still hold.

### Notes / decisions

- `localStorage` schema stays `silabas:v2`; the two new keys default in
  `freshState()`/`migrate()` — no version bump, no migration.
- The grown embedded fallbacks keep all nine bands ≥10 offline, so
  `buildLevels()`'s empty-band skip never fires with shipped content.
- No new runtime dependencies, no `app/` folder — code evolves in place at the
  workspace root, 100% within the vanilla/buildless/offline-first stack.
