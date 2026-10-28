# 6 — Plan: "Lalo y las Sílabas" — Bigger Vocabulary, 4-Syllable Words, More Levels, Auto-Read, Swipe-to-Advance

Implements `loops/6_specification.md` (AC-J1…AC-J6). All application code lives at
the workspace root; only this plan lives under `loops/`. Tech stack unchanged:
vanilla HTML/CSS/ES-module JS, no framework/bundler/deps, `localStorage`, PWA via
`sw.js` + `manifest.webmanifest`, Node's built-in test runner (no `package.json`).

---

## 1. Implementation plan (what changed, by file)

### D1 — Bigger vocabulary (AC-J1)

**`data/words-2syllables.csv`** — grown from 48 → **52 rows**. Four words inserted
at their correct pedagogical ranks (not appended): `gota` (💧), `rama` (🌿),
`vaca` (🐮) in the tier-3 open zone; `chapa` (🔖, `ch` digraph) at the end of the
"especiales" tail. Ranks renumbered 1…52 so the file stays strictly ascending and
consistent with `expectedTierKey` (open tiers 1→2→3, then z / closed / digraph).

**`data/words-3syllables.csv`** — grown from 26 → **50 rows**. New open words at
correct ranks: tier-1 `pelusa`, `salita`, `patito`; tier-2 `muñeca`; tier-3
`bebida`, `cocina`, `gatito`, `maceta`, `nevera`, `ratita`, `sabana`, `venada`.
New especiales (closed/digraph/z): `manzana`, `pantera`, `pescado`, `tortuga`,
`botella`, `caballo`, `ballena`, `cuchara`, `guitarra`, `chaqueta`, `estrella`.
Ranks renumbered 1…50; order verified by the pedagogy test.

**`js/art.js`** — added inline-SVG art for every new word id so art coverage stays
100% (AC-J1.4): 2-syll `word-gota`, `word-rama`, `word-chapa`; 3-syll
`word-bebida`, `word-pescado`, `word-botella`, `word-caballo`, `word-ballena`,
`word-cuchara`, `word-muneca`, `word-tortuga`, `word-guitarra`, `word-chaqueta`,
`word-estrella`; plus all 4-syll art (below). (`word-vaca` already existed.)

### D2 — New 4-syllable word list (AC-J2)

**`data/words-4syllables.csv`** — **new** file, same schema, **21 rows**
(`syllable_count = 4`), ordered easiest-first. Final list + ranks:

| rank | word | syllables | zone |
|----:|------|-----------|------|
| 1 | tomatito | to-ma-ti-to | open tier-1 |
| 2 | pelotita | pe-lo-ti-ta | open tier-1 |
| 3 | maletita | ma-le-ti-ta | open tier-1 |
| 4 | limonada | li-mo-na-da | open tier-2 |
| 5 | patineta | pa-ti-ne-ta | open tier-2 |
| 6 | abanico | a-ba-ni-co | open tier-3 |
| 7 | caracola | ca-ra-co-la | open tier-3 |
| 8 | mariposa | ma-ri-po-sa | open tier-3 |
| 9 | mariquita | ma-ri-qui-ta | open tier-3 |
| 10 | panadera | pa-na-de-ra | open tier-3 |
| 11 | pelícano | pe-lí-ca-no | open tier-3 |
| 12 | telaraña | te-la-ra-ña | open tier-3 |
| 13 | calabaza | ca-la-ba-za | open tier-4 (z) |
| 14 | payasito | pa-ya-si-to | open tier-4 (y) |
| 15 | elefante | e-le-fan-te | especiales (closed) |
| 16 | escalera | es-ca-le-ra | especiales (closed) |
| 17 | campanita | cam-pa-ni-ta | especiales (closed) |
| 18 | bicicleta | bi-ci-cle-ta | especiales (cluster) |
| 19 | cocodrilo | co-co-dri-lo | especiales (cluster) |
| 20 | maravilla | ma-ra-vi-lla | especiales (digraph ll) |
| 21 | chocolate | cho-co-la-te | especiales (digraph ch) |

The order satisfies both `isOrderedByRank` and `assertPedagogicalOrder` (no
digraph before a non-digraph; no closed before an all-open word; tier
non-decreasing across the open prefix — the two tier-4 OPEN words `calabaza` and
`payasito` sit together at the end of the open prefix, before the closed/digraph
tail). Each row's `art_id` resolves in `art.js`; the three easiest words reuse
existing art (`word-tomate`, `word-pelota`, `word-maleta`), the rest add dedicated
SVGs (`word-limonada`, `word-patineta`, `word-abanico`, `word-caracola`,
`word-mariposa`, `word-mariquita`, `word-panadera`, `word-pelicano`,
`word-telarana`, `word-calabaza`, `word-payasito`, `word-elefante`,
`word-escalera`, `word-campanita`, `word-bicicleta`, `word-cocodrilo`,
`word-maravilla`, `word-chocolate`).

**`js/words.js`** — wired the 4-syllable list through the existing pipeline:
- Added embedded fallback **`WORDS_4`** (10 items, easiest-first) so the
  4-syllable bands play offline / from `file://` (AC-J2.3).
- Added a **`loaded4`** cache.
- `syllableCountForLevel("palabras-4") → 4`.
- `loadInventory()` now fetches `words-4syllables.csv` too and returns
  `{ two, three, four }`.
- `forLevel("palabras-4")` serves the count-4 inventory (live CSV or `WORDS_4`).
- `byWord()` searches `loaded4` / `WORDS_4` so a 4-syllable word resolves its
  parts/art/emoji (AC-J2.4).
- `isLoaded(4)` and `forBand({count:4,…})` handle count 4 (the tier/open/special
  filters are reused unchanged).

### D3 — More levels, exciting names, ordered 2→3→4 (AC-J3)

**`js/levels.js`** — expanded `WORD_BANDS` to the ordered **9-band** set. Band ids
(stable `localStorage`/unlock keys) and kid-facing Spanish titles:

| order | id | len | filter | title |
|------:|------|----|--------|-------|
| 1 | `pal-2-abiertas-1` | 2 | tier 1, open | **¡Primeros pasos!** |
| 2 | `pal-2-abiertas-2` | 2 | tier 2, open | **¡A rodar!** |
| 3 | `pal-2-abiertas-3` | 2 | tier 3, open | **¡Más aventuras!** |
| 4 | `pal-2-especiales` | 2 | tier 4 / closed / digraph | **¡Sonidos mágicos!** |
| 5 | `pal-3-abiertas-1` | 3 | tiers 1–2, open | **¡La jungla de sílabas!** |
| 6 | `pal-3-abiertas-2` | 3 | tier 3, open | **¡Palabras cohete!** |
| 7 | `pal-3-especiales` | 3 | tier 4 / z / ll / closed | **¡Tesoros escondidos!** |
| 8 | `pal-4-abiertas` | 4 | open (tiers 1–3) | **¡A despegar!** |
| 9 | `pal-4-especiales` | 4 | tier 4 / closed / digraph | **¡Campeones de 4 sílabas!** |

The 3-syllable section is split into two open bands (tiers 1–2, then tier 3) to
absorb the larger inventory; the z/closed/digraph words land in `pal-3-especiales`.
The 4-syllable section is open vs especiales (the tier-4 OPEN words `calabaza` /
`payasito` fall into especiales via the `special:true` filter so every 4-syllable
word is covered). `buildLevels()`, `all/byId/firstLevelId/nextUnlock/isUnlocked/
mapState/completeLevel` are unchanged in shape; `goal = min(5, poolSize)`; empty
bands are still skipped so the unlock chain never breaks.

**`js/art.js`** — added island art for the new bands: `island-words-3-1`,
`island-words-3-2`, `island-words-4-abi`, `island-words-4-esp`.

**`js/rewards.js`** — `STICKER_CATALOG` re-pointed to the 9 new band ids (one
sticker each) + the kept milestone sticker. New entries `stk-pal-3-1`,
`stk-pal-3-2`, `stk-pal-3-esp`, `stk-pal-4-abi`, `stk-pal-4-esp` reuse existing
sticker art (`sticker-palabras`, `sticker-t`, `sticker-palabras-3`,
`sticker-mixto`, `sticker-cerradas`). No entry points at a removed level id.

**`js/main.js`** — `CARD_THEMES` extended with the five new band ids
(`pal-3-abiertas-2`, `pal-4-abiertas`, `pal-4-especiales`, and updated keys) so
the hero card tints correctly; map nodes already carry `data-id` for per-family
colour. Dashboard copy unchanged except the 4-syllable learning-order note.

**`index.html`** — dashboard "Orden de aprendizaje" list gains a 4-syllable line
("Palabras de 4 sílabas al final, el gran reto…") and the ordering note now reads
"2 antes que 3 antes que 4".

### D4 — Auto-read on word display (AC-J4)

**`js/game.js`** — `nextItem()` now **always** models the current word on display:
after resolving `currentWord` and rendering, it sets the mascot to `"model"` and
calls `audio.model(state.current)` (whole word, AC-J4.5). This fires on the first
word of a level (via `openLevel → nextItem`) and on every subsequent new word
(via `skip()` / `swipeNext()` / post-success advance) — **one read per new word**,
no throttle. The old `autoModelRemaining`-gated early-model block was removed from
the per-word path. The read reuses `speech.speak` (through `audio.model`), which
resolves safely, cancels any in-flight utterance, and never throws/blocks
(AC-J4.3); the Spanish-voice selection + adult "no Spanish voice" notice from
iteration 5 still apply. The redundant `onMascot("model")` in `openLevel` was
dropped so exactly one model fires per new word (AC-J4.4). Re-renders that are not
new-word transitions (e.g. the CSV-load refresh) do **not** re-read.

### D5 — Remove the "Siguiente" button (AC-J5)

- **`index.html`** — removed `#next-btn` from `.secondary-controls` (only the
  mascot remains there).
- **`js/main.js`** — removed the `nextBtn` element lookup and its `click` wiring.
- Advancing stays via **left-swipe** (`game.swipeNext()`) and **`ArrowRight`**
  (keyboard) — both already implemented and unchanged. The first-use **gesture
  hint** ("👈 Desliza: siguiente") is kept so the affordance stays discoverable
  (AC-J5.3). The onboarding "Siguiente" button is a separate element and remains.
- **`css/styles.css`** — removed the now-dead `.chip-btn` rule and dropped
  `.chip-btn` from the shared `:focus-visible` selector list (AC-J5.4).

### D6 — Remove the "Di la palabra" text (AC-J6)

- **`index.html`** — the `#feedback` paragraph is now empty (still a live region
  with `role="status" aria-live="polite"`); no standing instruction.
- **`js/game.js`** — `itemPrompt()` deleted; the `onFeedback(itemPrompt(),
  "neutral")` calls on `openLevel` / `skip` / post-success were removed. The
  feedback line is reserved for transient status only ("Escuchando… 🎤", "Casi…
  👂", "Inténtalo otra vez 🙂", "¡Muy bien! 🎉", "¡Listo! ✅"). (The mic button's
  descriptive `aria-label` "di la palabra al micrófono" is a control label, not a
  standing prompt, and is unaffected — AC-J6.3.)

### Dashboard mastery denominator

**`js/game.js`** — `dashboardStats()` now counts the full inventory including
count-4 (`forLevel("palabras") + forLevel("palabras-3") + forLevel("palabras-4")`)
so "Palabras dominadas" reflects every word.

### Offline

**`sw.js`** — `CACHE_VERSION` bumped to **`lalo-silabas-v6.0.0`** and
`./data/words-4syllables.csv` added to the precached `SHELL` so the new list +
refactor ship offline. On next load the SW `activate` deletes stale caches and
`clients.claim()`s. Old `localStorage` keys for the renamed `pal-3-abiertas`
band become inert (ignored; unlock restarts from the first band if a key is
missing) — no migration, by design.

---

## 2. Row → band mapping (reference; derived at runtime from the CSVs)

Band membership is computed by `words.forBand(...)` from the shipped CSVs, so it
inherits the tested easiest-first pedagogy (length → tier → open-before-closed →
alphabetical). Empty bands are dropped. Representative words:

| band | source filter | example words |
|------|---------------|---------------|
| `pal-2-abiertas-1` | 2-syll, tier 1, open | mamá, masa, mesa, pato, sopa, tela, loma, lupa |
| `pal-2-abiertas-2` | 2-syll, tier 2, open | dado, dedo, duna, luna, nido, pino, niña |
| `pal-2-abiertas-3` | 2-syll, tier 3, open | boca, casa, café, foca, gato, gota, jugo, rama, rana, rosa, vaca |
| `pal-2-especiales` | 2-syll, tier 4 / closed / digraph | pozo, taza, limón, pastel, jamón, gallo, pollo, perro, chapa |
| `pal-3-abiertas-1` | 3-syll, tiers 1–2, open | maleta, paloma, pelota, sopita, tomate, dedito, pepino, muñeca |
| `pal-3-abiertas-2` | 3-syll, tier 3, open | banana, bebida, camisa, conejo, dinero, fogata, gusano, jirafa |
| `pal-3-especiales` | 3-syll, tier 4 / z / ll / closed | cabeza, cereza, zapato, limones, manzana, semilla, gallina, guitarra |
| `pal-4-abiertas` | 4-syll, open | tomatito, pelotita, limonada, mariposa, caracola, telaraña |
| `pal-4-especiales` | 4-syll, tier 4 / closed / digraph | calabaza, payasito, elefante, escalera, bicicleta, maravilla, chocolate |

---

## 3. Deployment plan

- **Static hosting, unchanged.** Serve the workspace root over http(s)/localhost
  (or `file://` — the embedded fallbacks cover all 9 bands offline, including the
  new 4-syllable bands via `WORDS_4`). No build step.
- **Ship:** publish the updated `index.html`, `css/styles.css`, `js/*.js`,
  `data/*.csv` (now three files), `manifest.webmanifest`, `sw.js`.
- **Cache bust:** `CACHE_VERSION = lalo-silabas-v6.0.0` — on next load the SW
  `activate` deletes stale caches and `clients.claim()`s; the shell + all three
  CSVs are re-precached.
- **Rollback:** revert to the previous commit and restore `CACHE_VERSION`
  `v5.0.0`; no data migration (progress keys are per-level; the renamed
  `pal-3-abiertas` key is simply ignored).

---

## 4. Verification

### Automated (run from the workspace root)

```
node --test "js/*.test.js"
node --check js/words.js js/levels.js js/game.js js/rewards.js js/main.js js/art.js sw.js
```

> Note: on newer Node, `node --test js/` is interpreted as a module path and
> fails to resolve. Use the glob `node --test "js/*.test.js"` (framework-free,
> Node's built-in runner, no `package.json`).

Outcomes:
- **`node --test "js/*.test.js"` → 102 tests, 102 pass, 0 fail.**
- **`node --check`** on every changed module → OK (no syntax errors).
- Extra cross-checks run during development (all passed):
  - every `levels.all()` band `artId` (9) and every `STICKER_CATALOG.artId` (10)
    resolves in `art.js`.
  - every CSV row + every embedded fallback entry (`WORDS`/`WORDS_3`/`WORDS_4`)
    resolves in `art.js` (100% art coverage).
  - no app file references `#next-btn` (play control) or `itemPrompt`; the only
    remaining "di la palabra" strings are the mic button's `aria-label`, the
    separate `#onboarding-next-btn`, and code comments.

Test changes (superseded tests updated explicitly, not deleted silently):
- **`words.test.js`** — breadth minimums raised to **≥50 / ≥50 / ≥20**; new
  `words-4syllables.csv` integrity + pedagogy test; `loadInventory` mocks now
  return all three CSVs and assert `res.four` + a 4-syllable `byWord`; `forBand`
  count-4 partition test; `WORDS_4` fallback-integrity test; art-coverage and
  `difficulty_rank` tests extended to the 4-syllable file; `WORDS_4` imported.
- **`levels.test.js`** — membership + ordering helpers extended to count-4
  (`inventoryWords`/`inventoryEntries`); the ordering test rewritten to assert
  **strict 2→3→4** non-decreasing length ordering (AC-J3.1) plus within-count
  open-before-especiales + non-decreasing tier; a new `pal-4-*`-exists test
  (AC-J3.2). The unlock-chain tests are unchanged and still pass end-to-end.
- **`rewards.test.js`** — added an AC-J3.6 test asserting every `pal-4-*` band
  has a sticker; the existing dynamic "every level has a sticker" / "no sticker
  points at a removed level" tests cover the renamed 3-syllable ids.
- **`game.test.js`** (new) — state-machine auto-read test: opening a level fires
  exactly one `onMascot("model")` (paired 1:1 with the `audio.model` auto-read),
  each `skip()`/ArrowRight fires exactly one more, and `onFeedback` is never asked
  to show a standing "Di la palabra" instruction (AC-J4.1/J4.4/J6.2). Runs in
  plain Node (progress falls back to in-memory; `speech.speak`/`audio.model` are
  no-ops without Web Speech/Audio).
- **`progress.test.js` / `speech.test.js` / `adultGate.test.js` /
  `logic.test.js`** — unchanged, still passing.

### Browser-only (cannot be auto-verified here — manual check in a browser)

Flagged per the spec; require a real browser/device:
- **AC-J4 auto-read actually speaks:** on a device with a Spanish voice, each new
  word is spoken aloud on display without a tap (and the adult "no Spanish voice"
  notice appears when none is installed). The state machine is unit-tested (one
  model call per new word, mascot enters "model"); the audio output + the
  `voiceschanged` timing need a browser. **Status: logic verified; audio to be
  confirmed manually.**
- **AC-J5 no "Siguiente" button / advance still works:** verify the play screen
  shows no next control, and swipe-left + `ArrowRight` advance; the gesture hint
  appears on first play. **Status: markup/wiring verified; hands-on pending.**
- **AC-J6 no "Di la palabra" text:** verify the feedback line starts empty and
  only shows transient status. **Status: verified in markup/logic; visual pending.**
- **Layout at scale:** the longer 9-node map and 4-syllable words (longer strings)
  should be eyeballed at 320px and in short-landscape; contrast ≥4.5:1 and the
  reduced-motion / high-contrast / forced-colors fallbacks from iteration 5 still
  hold. **Status: built on the iteration-5 responsive/contrast base; visual
  confirmation pending.**

### Notes / decisions
- `localStorage` schema unchanged (`silabas:v2`); the renamed `pal-3-abiertas`
  progress key is inert — no migration (acceptable for a kids' app).
- The embedded fallbacks (`WORDS`/`WORDS_3`/`WORDS_4`) keep all 9 bands non-empty
  offline, so `buildLevels()`'s empty-band skip never fires with shipped content.
- No new runtime dependencies, no `app/` folder — code evolves in place at the
  workspace root, 100% within the vanilla/buildless/offline-first stack.
