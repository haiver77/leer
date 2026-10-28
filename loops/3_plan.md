# 3 — Implementation Plan: "Lalo y las Sílabas" — Immersive Card + Pedagogical Words

Developer output for iteration 3. Implements `3_specification.md`, evolving the
iteration-1/2 code **in place** at the workspace root (no `app/` folder). Every
accepted behavior from iterations 1–2 (mascot, world map, rewards, mastery,
trustworthy speech, PWA/offline, self-confirm fallback, keyboard paths,
very-young mode, adult gate) is carried forward unchanged.

Tech stack is unchanged and binding: **vanilla HTML5 + CSS3 + JS ES modules,
no framework, no bundler, no build step, dependency-free, offline-first,
`localStorage` only, all art inline SVG, PWA via `sw.js` + manifest.** Iteration 3
adds **static CSV data files + a tiny hand-written loader**, a **native Pointer
Events gesture recognizer**, and a **CSS-only immersive play layout**. No new
runtime dependency, no CSV/gesture library.

---

## 1. Implementation plan — build steps & file → feature map

### G4/G5 — Pedagogically-ordered word inventory in data files

- **`data/words-2syllables.csv`** (new) — 29 two-syllable words, columns
  `word,syllables,syllable_count,difficulty_rank,emoji,art_id`, UTF-8, header
  row, **ordered easiest-first by ascending `difficulty_rank`**. Ordering follows
  the spec's Spanish syllable-learning sequence: consonant order `m,p,l,s,t →
  d,n,ñ → f,b,v,c/k,g,j,r…`, all-open CV syllables first, shorter/common words
  earliest. (AC-G4.1, AC-G4.2, AC-G5.1)
- **`data/words-3syllables.csv`** (new) — 14 three-syllable words, same columns
  and ordering rule; new content (`maleta, paloma, pelota, …, zapato`). (AC-G4.1,
  AC-G4.3)
- **`js/words.js`** (rewritten in place, same exports + new ones):
  - `parseCsv(text)` — pure, hand-written CSV parser (header row → row objects;
    handles trailing newline, CRLF, blank lines, quoted fields with `""`).
  - `rowIntegrity(row)` — pure: parts join to word (accent/case-insensitive) and
    `syllable_count` equals the number of `-`-separated parts. (AC-G4.2)
  - `isOrderedByRank(rows)` — pure: non-decreasing `difficulty_rank`/`rank`.
    (AC-G4.2)
  - `loadInventory({fetchImpl})` — async; `fetch`es + parses both CSVs once at
    startup, maps rows to `{word,parts,artId,emoji,syllableCount,rank}`, caches
    them. Any fetch/parse failure keeps the embedded fallback. (AC-G4.1, AC-G4.4)
  - `forLevel(levelId)` — serves loaded data (`palabras` → 2-syll, `palabras-3`
    → 3-syll), falling back to embedded `WORDS`/`WORDS_3` for `file://`/offline
    first paint. Returns defensive copies. (AC-G4.1, AC-G4.4)
  - Embedded fallbacks `WORDS` (2-syll) and `WORDS_3` (3-syll); `byWord`,
    `partsMatchWord` kept (now accent-aware). Existing callers keep working.
- **`js/levels.js`** — added a **`palabras-3`** word node right after `palabras`
  and before `digrafos`; its `pool()` returns 3-syllable words via
  `wordsForLevel("palabras-3")`. Titles clarified ("Palabras de 2/3 sílabas").
  Unlock chain shape (`nextUnlock`/`isUnlocked`/`mapState`) unchanged, so the map
  order now encodes the full easiest-first arc. (AC-G4.3, AC-G5.1)
- **`js/game.js`** — the word flow already generalises over `parts[0..n]`
  (`byWord`, `modelPart(index)`), so 3-part words work with no flow change.
  `createGame` now kicks off `words.loadInventory()` during init and re-renders a
  live word level once the inventory resolves. Added thin gesture-intent wrappers
  `tapCard()` → model, `swipeNext()` → skip, `swipePrev()` → repeat (all no-op
  outside play). (AC-G4.1, AC-G4.3, AC-G3.1, AC-G3.2)
- **`js/art.js`** — added inline-SVG picture cues for every new `art_id`
  (2- and 3-syllable words), the `island-words-3` map node, and the
  `sticker-palabras-3` sticker. (AC-G4.3)
- **`js/rewards.js`** — added the `stk-palabras-3` sticker linked to the new
  level so every level still grants a sticker. (F3 carried forward)
- **`index.html`** dashboard — added an **"Orden de aprendizaje"** section with a
  brief parent-facing description of the educational order & criteria. (AC-G5.2)

### G1/G2/G3 — Immersive play screen + gestures

- **`index.html`** play screen restructured: a compact top bar (quiet back +
  small score), a new **`#card-host`** hero region that holds the syllable card /
  word view and fills the content area, and a compact bottom cluster
  (`.play-bottom`) with the mic primary action + a small listen/mascot/next row.
  `#word-parts` now renders 2 **or** 3 tiles. Added a non-blocking
  `#gesture-hint`. (AC-G1.1, AC-G2.1)
- **`css/styles.css`** immersive layout (CSS only): `.screen.game` is a full
  `100dvh` flex column; `.card-host` is `flex: 1 1 auto; min-height: 0;
  touch-action: pan-y`; `.syllable-card` sized `min(92vw, 70vh, 560px)` with font
  `clamp(5rem, min(40vw,34vh), 16rem)`; `.word-view` fills the host and its
  whole-word font auto-shrinks for 3-part words (`[data-parts="3"]`) so the
  longest word fits with no overflow at 320px+. Landscape override sizes the card
  off height. Reduced-motion, high-contrast, ≥56px targets, visible focus, ARIA,
  and the live region are all retained; the gesture hint honors very-young mode
  and reduced-motion. (AC-G1.1, AC-G1.2, AC-G1.3, AC-G2.1)
- **`js/main.js`** — renders N word tiles (`renderWordParts`, each tile stops
  propagation so its own tap still models that part). Attaches a **Pointer
  Events** recognizer to `#card-host`: `pointerdown/move/up/cancel` with
  thresholds **tap = <10px & <300ms → `game.tapCard()`**, **left swipe = dx<−50px
  & mostly horizontal → `game.swipeNext()`**, right swipe → `game.swipePrev()`
  (repeat, non-destructive). Mouse/touch/pen all covered by Pointer Events;
  keyboard (`l`/`Space`/`Enter`/`→`) and all buttons remain for full parity. A
  first-use hint shows on the first play entry and is dismissed on first
  interaction (persisted under `silabas:gestureHintSeen`, separate from the
  unchanged `silabas:v2` schema). (AC-G2.2, AC-G3.1, AC-G3.2, AC-G3.3)

### Offline

- **`sw.js`** — added `./data/words-2syllables.csv` and
  `./data/words-3syllables.csv` to the precache `SHELL` and bumped
  `CACHE_VERSION` to `lalo-silabas-v3.0.0`. New art is inline in the already-cached
  `art.js`. (AC-F13.2/3)

---

## 2. Deployment plan

Unchanged from iteration 2: a **buildless static PWA**. It MUST be served over
**http(s) or localhost**, not `file://`, because the word inventory is fetched
from `data/*.csv` (opening `index.html` directly triggers the embedded fallback
via AC-G4.4, so the app still runs — just without the full CSV inventory).

### Local serve (dev)
```sh
# from the workspace root
npx serve .            # or:  python -m http.server 8000
# open http://localhost:8000
```
`localhost` is a secure context, so the service worker + install prompt work in
dev. (For this environment I used a tiny Node `http` server to confirm the CSVs
serve with `Content-Type: text/csv` — see Verification.)

### Static host (prod)
Deploy the workspace root (`index.html`, `css/`, `js/`, `data/`, `icons/`,
`manifest.webmanifest`, `sw.js`) to any static host (GitHub Pages, Netlify,
Cloudflare Pages, S3+CloudFront). **HTTPS is required** for the service worker +
PWA install (every modern host provides it). `start_url`/`scope` are relative, so
it works from a domain root or a sub-path. No backend, env vars, or build step.

### PWA / cache busting
`CACHE_VERSION` was bumped to `v3.0.0`; on activate the SW deletes stale caches
and `clients.claim()`s, so an installed copy updates cleanly and the CSV
inventory is available offline after first load.

---

## 3. Verification

Environment: Node **v24.16.0**, Windows. No `package.json` — the project uses
Node's built-in test runner. On Node 24 a directory arg is rejected, so the
suite is run with a glob.

### Automated tests (ran; all green)
```sh
node --test "js/*.test.js"
```
**Result: 64 tests, 64 pass, 0 fail** (up from 53). New/updated coverage:
- `words.test.js` — `parseCsv` (header/rows/trailing newline, CRLF + blank lines
  + quoted/`""` fields, non-string → `[]`); `rowIntegrity` (parts-join + count,
  rejects mismatches); `isOrderedByRank` (ascending, raw + mapped, rejects
  descending); the **shipped CSV files** (≥20 two-syll / ≥12 three-syll, every
  row has integrity, correct count, `word-*` art id, both ordered easiest-first,
  disjoint by count); **embedded fallback** `WORDS`/`WORDS_3` integrity + order
  (AC-G4.4); `forLevel` defensive copy + `byWord` accent/case normalisation;
  `loadInventory` with an **injected fetch** (parses + serves) and the
  fetch-failure fallback path.
- `levels.test.js` — updated order assertion to `… → palabras → palabras-3 →
  digrafos → …`; new test that `palabras-3` is a `word` level immediately after
  `palabras`, has a non-empty pool, and the **unlock chain is intact**
  (`nextUnlock("palabras") === "palabras-3"`, `nextUnlock("palabras-3") ===
  "digrafos"`, completing `palabras` unlocks `palabras-3` but not `digrafos`).

### Static checks (ran; all clean)
```sh
node --check <each module> + sw.js      # 14 files, all "ok"
node -e "JSON.parse(manifest.webmanifest)"   # manifest OK
# module smoke: game.js imports; palabras-3 pool len 6; forLevel('palabras-3')[0] = maleta Ma-Le-Ta
# order: isla-p > … > mixto > palabras > palabras-3 > digrafos > cerradas
```

### HTTP serve check (ran; all 200)
Served the workspace root over a local Node HTTP server and fetched key assets —
`/`, `/index.html`, `/data/words-2syllables.csv` (text/csv), 
`/data/words-3syllables.csv` (text/csv), `/js/main.js`, `/manifest.webmanifest` —
**all 200 with correct content types**, confirming the CSV inventory loads over
HTTP (the requirement that distinguishes served vs `file://`).

### Manual / browser-only (not Node-assertable)
These need Web APIs, rendering, install, or touch and must be checked in a
browser (carried-forward speech/celebration/PWA items from iteration 2 plus the
new iteration-3 surface):
- **Immersive card (AC-G1.*)**: card is the dominant element and fills the
  content area on phone-portrait, tablet, and landscape; the longest 3-syllable
  word renders fully with no overflow / horizontal scroll at 320px+; reduced-
  motion / high-contrast / zoom still apply.
- **Control reduction (AC-G2.*)**: one dominant mic + a small listen/next/back
  cluster; every iteration-2 action still reachable via control, gesture, or key.
- **Gestures (AC-G3.*)**: tap the card → model + mascot "model"; left swipe →
  next (no-repeat preserved); tap vs swipe disambiguated; right swipe = repeat
  (no-op-safe); mouse/pen parity; `touch-action: pan-y` keeps vertical scroll;
  first-use hint shows once and never blocks play.
- **3-part word play (AC-G4.3)**: `palabras-3` presents three tiles + the whole
  word with a picture; saying the whole word (or leniently the parts) succeeds.
- **Offline CSV (AC-F13.2/3)**: full offline after first load incl. the inventory
  via the SW; `CACHE_VERSION` bump updates a cleanly installed copy.
- **Dashboard order text (AC-G5.2)**: the "Orden de aprendizaje" section reads
  correctly.

### Suggested manual script (tablet + phone, Chromium)
1. Serve over `http://localhost`; open the app, finish/skip onboarding → map.
2. Play a syllable island: confirm the card is the hero and fills the screen;
   **tap the card** → it reads aloud + Lalo models; **swipe left** → next item;
   the first-use hint appears once then disappears.
3. Complete through "Palabras de 2 sílabas" to unlock **"Palabras de 3 sílabas"**;
   open it, confirm 3 tiles + whole word + picture, and that long words fit with
   no overflow at a narrow width (DevTools 320px).
4. Rotate to landscape and shrink the window — card still dominant, nothing
   clipped, controls reachable.
5. Toggle very-young mode — hint shows icons only, labels hidden, still playable.
6. ⚙️ → adult gate → dashboard → read "Orden de aprendizaje".
7. Install; reload offline (airplane mode) — shell + CSV inventory load from
   cache; redeploy with a bumped `CACHE_VERSION` and confirm the update.
