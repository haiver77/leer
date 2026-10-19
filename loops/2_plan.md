# 2 — Implementation Plan: "Lalo y las Sílabas"

Developer output for iteration 2. Implements `2_specification.md`, evolving the
iteration-1 code **in place**. The iteration-1 core loop (see → hear → say →
celebrate → next, with graceful speech fallback and localStorage) is carried
forward intact and now sits inside a level/map/reward/mascot/PWA shell.

Tech stack is unchanged and binding: **vanilla HTML5 + CSS3 + JS ES modules, no
framework, no bundler, no build step, dependency-free, offline-first,
localStorage only, no backend/accounts/ads/tracking. All art = inline SVG.**

---

## 1. Module → Feature → Acceptance-Criteria mapping

### New pure-logic modules (unit-tested)

| Module          | Responsibility                                                                 | Features / AC |
| --------------- | ------------------------------------------------------------------------------ | ------------- |
| `js/progress.js`| `silabas:v2` schema + v1 migration; per-item records; stars/stickers/levels; dailyGoal; flags (onboardingDone, veryYoung, autoModelRemaining). Pure helpers: `recordAttempt`, `masteredCount`, `troubleItems`, daily-goal date handling, `migrate`. localStorage access guarded. | F4 (AC-F4.1–4.3), F3 persistence (AC-F3.1/3.3), F7 stats source (AC-F7.2), F11 daily goal (AC-F11.2), F1 flags (AC-F1.2/1.3), F9 honest mastery (AC-F9.2) |
| `js/levels.js`  | Ordered node defs (per-consonant islands → mixed → words → digraphs → closed), unlock rules, goal/pool/mode per node; `mapState`, `nextUnlock`, `isUnlocked`, `completeLevel`. Pure. | F2 (AC-F2.1–2.3) |
| `js/rewards.js` | Stars per correct, milestone every 5, sticker/badge per level, sticker-book catalog; `onCorrect`, `onLevelComplete`, `stickerBook`. Pure. | F3 (AC-F3.1–3.4) |
| `js/words.js`   | Curated CV+CV two-syllable catalog `{word, parts, artId}` from introduced consonants (pato, mesa, lupa, dedo…); integrity helper. Pure. | F5 (AC-F5.1–5.3) |
| `js/adultGate.js`| Arithmetic challenge generator + answer check + choices; minimal overlay hook. Pure core. | F7 gate (AC-F7.1) |

### New browser modules (manually verified)

| Module          | Responsibility                                                                 | Features / AC |
| --------------- | ------------------------------------------------------------------------------ | ------------- |
| `js/mascot.js`  | Lalo as inline SVG; `setState("idle"\|"cheer"\|"encourage"\|"model")`; CSS motion; reduced-motion static pose. | F10 (AC-F10.1–10.3) |
| `js/art.js`     | Inline-SVG registry: word pictures, syllable cue fallback, island/map nodes, stickers, icons; `svg(id)` with neutral fallback (never blank). | F2 art, F3 sticker art, F6 (AC-F6.1) |
| `js/audio.js`   | `model(id)`: play bundled clip if present, else `speech.speak` TTS fallback. Clip registry empty now → TTS; real clips are a drop-in. | F13 offline audio (AC-F13.2 TTS path), F1 model audio |
| `sw.js`         | Versioned cache-first app-shell SW; real file list; `skipWaiting` + `clients.claim`; stale-while-revalidate; nav fallback. | F13 (AC-F13.1–13.3) |
| `manifest.webmanifest` | Name "Lalo y las Sílabas", icons 192/512 + maskable, theme/bg color, standalone, portrait, start_url ".". | F13 (AC-F13.1) |

### Extended existing modules

| Module             | Change                                                                 | Features / AC |
| ------------------ | ---------------------------------------------------------------------- | ------------- |
| `js/speech.js`     | Added pure `classify(target, transcript) → "match"\|"near"\|"miss"` with child leniency (close vowels e/i, o/u; voicing p/b, t/d, c/g; l/r, m/n swaps; digraph collapsing; phrase tokenisation). `listen()` now reports `outcome`. `normalize/speak/listen` kept. | F9 (AC-F9.1/9.3), carried AC3 tightened |
| `js/syllables.js`  | Kept CV `generate`/`pickRandom` (backwards compatible). Added `cvPool`, `EXTRA_POOLS` (ch, ll, rr, ña/ñe…, que/qui, gue/gui, closed) as separate named pools, `generate(poolId)` and `generate("all")`. | F2 pools, carried AC1 |
| `js/celebrate.js`  | Kept confetti/chime/haptics. Added `milestone` variant (3-note fanfare + bigger burst) and 2–3 rotating burst variations. | F3 milestone (AC-F3.2), F14 (AC-F14.1), F12 sound+motion |
| `js/game.js`       | Rewrote the state machine: welcome → onboarding → map → play (syllable\|word) → summary → stickers → dashboard. Wires mascot reactions, reward awarding, mastery updates via progress.js, onboarding gating + early auto-model, trustworthy speech (verified vs self-confirm; near-miss "casi…"), level completion + summary, daily goal, very-young + difficulty + reset. | F1, F2, F3, F4, F5, F7, F8, F9, F10, F11, F12, F14 |
| `js/main.js`       | Rewrote DOM wiring for all screens; mounts Lalo per screen; renders map/stickers/dashboard/word/summary; adult-gate → dashboard; keyboard shortcuts; **registers the service worker**. | all UI-facing features |
| `index.html`       | Added screens for onboarding, map, word view, summary, sticker book, dashboard, mascot hosts, adult-gate overlay; linked manifest + icons; kept ARIA/live region; de-emphasised secondary controls. | F1, F2, F3, F5, F7, F8, F11, F12 |
| `css/styles.css`   | Added `@font-face` ("Lalo Rounded") with graceful system fallback; styles for map/rewards/mascot/word/dashboard/onboarding; transitions; very-young + high-contrast + reduced-motion rules; ≥56px targets; primary-mic / subordinate-secondary layout. | F8, F10, F12, F14 |

### Carried-forward acceptance (AC1–AC8)
- **AC1** syllable display — `syllables.generate`/`pickRandom` + `.syllable-card` (now title-cased, high-contrast, no immediate repeat).
- **AC2** listen/model — `audio.model` → clip/TTS via `listen-btn`.
- **AC3** say-it match — `speech.listen` + `classify` (tightened by F9: mic match only).
- **AC4** celebration + advance — `celebrate.play` + `ADVANCE_DELAY_MS` auto-advance.
- **AC5** gentle retry — `"Inténtalo otra vez"`, same item stays.
- **AC6** always-usable fallback — `confirm-btn` self-confirm; mic denial switches to self-confirm, never dead-ends.
- **AC7** streak/best — persisted in `progress` (`streak`/`bestStreak`), now plus stars.
- **AC8** difficulty — Fácil/Normal in the dashboard; pools respect it.
- **a11y** — reduced-motion, high-contrast, ARIA, live region, focus-visible, ≥56px, tablet-first — all retained + extended.

### Assets / drop-ins
- `icons/icon.svg`, `icons/icon-maskable.svg` — working PWA icons. `icon-192.png`/`icon-512.png` referenced; **documented drop-in** in `icons/README.md` (this env can't emit binary PNGs; SVG `any` icon installs on Chromium).
- `fonts/README.md` — `@font-face` wired to `lalo-rounded.woff2`; **graceful fallback** to Baloo 2 / Comic Sans / system when absent; documented drop-in.
- `audio/` — no recorded clips bundled yet; `audio.js` `CLIPS` registry is empty so every item uses TTS, exactly per spec ("recorded clips are a drop-in later"). Add files + register + list in `sw.js` to go offline-audio.

---

## 2. Deployment plan

### Local serve (dev)
PWA + ES modules need an HTTP origin (not `file://`). Any static server works:

```sh
# from the app/ folder
npx serve .            # or:  python -m http.server 8000
# open http://localhost:8000
```

`localhost` is a secure context, so the service worker + install prompt work in dev.

### Static host (prod)
`app/` is fully self-contained static assets. Deploy the folder to any static
host (GitHub Pages, Netlify, Cloudflare Pages, S3+CloudFront, etc.).

- **HTTPS is required** for the service worker + PWA install (every modern host
  provides it). This is a hosting note, not a new dependency.
- `start_url` / `scope` are `"."` (relative), so the app works whether served
  from a domain root or a sub-path (e.g. `/lalo/`).
- No backend, no env vars, no build step.

### PWA / cache busting
- Bump `CACHE_VERSION` in `sw.js` on each deploy. On activate the SW deletes
  stale caches and `clients.claim()`s, so an installed copy updates cleanly
  (AC-F13.3) without breaking offline (AC-F13.2).

---

## 3. Verification plan

### Automated (Node `--test`, this environment, Node v24)
Run:
```sh
node --test "app/js/**/*.test.js"
```
**Result: 53 tests, 53 pass, 0 fail.** Also `node --check` on every module +
`sw.js`, and a manifest JSON parse — all clean. `game.js` imports cleanly under
Node (browser-touching modules are guarded).

Unit coverage by file:
- `logic.test.js` — `syllables` (facil/normal/cvPool/extra pools/`all`/pickRandom) + `speech.classify` (match / close-vowel match / voicing-near / miss / empty-miss / phrase / digraph / word) + `normalize`.
- `progress.test.js` — `freshState`, `migrate` (v1 / null / partial-v2), `recordSeen`, `recordAttempt` (verified→mastery, self-confirm excluded, miss), `masteredCount`, `troubleItems` (ratio + k threshold), `localDateKey`, `ensureDailyGoal` (reset on new day / keep same day), `bumpDailyGoal` (cap).
- `levels.test.js` — order, non-empty pools + goals, `byId`/`firstLevelId`, `nextUnlock`, `isUnlocked`, `completeLevel` (unlock exactly next, best-stars), `mapState`.
- `rewards.test.js` — stars/milestone, every-level-has-sticker, catalog uniqueness, grant-once, `stickerBook` earned/not.
- `words.test.js` — catalog integrity, parts-join-to-word, introduced-consonants-only, spec examples present, defensive copy, unique ids.
- `adultGate.test.js` — challenge build, answer check (number/string/garbage), choices (contains answer, 4 unique positives).

### Manual / browser-only (must be checked in a browser; NOT covered by Node)
These depend on Web APIs, install, cache, or visual rendering and cannot be
asserted in this Node environment:
- **Speech**: `SpeechRecognition` mic capture + match/near/miss behaviour, `SpeechSynthesis` TTS modeling and voiced onboarding/praise (AC2, AC3, AC-F1.1, AC-F9.1, AC-F9.3, AC-F9.4).
- **Celebration visuals / mascot motion**: confetti, Web Audio chime/fanfare, haptics, Lalo cheer/encourage/model + reduced-motion static pose (AC4, AC-F10.1–10.3, AC-F12.1, AC-F14.1).
- **PWA**: installability / standalone launch (AC-F13.1), **full offline** after first load incl. model audio via TTS (AC-F13.2), cache-version bump on redeploy (AC-F13.3).
- **UI/UX acceptance**: one-primary-action layout + subordinate secondaries (AC-F8.1/8.2), map locked/unlocked/completed visuals + ≤1-tap reach + replay (AC-F2.1–2.3), sticker book silhouettes (AC-F3.4), summary + daily-goal bar (AC-F11.1/11.2), very-young text-free mode (AC-F12.2), ≥56px / keyboard / focus / high-contrast / contrast themes (AC7, AC-F12.3), word view picture + parts (AC-F5.1), adult gate blocks a child tap (AC-F7.1), reset returns to first-run (AC-F7.3).
- **Font**: confirm the `@font-face` fallback renders (and the woff2 drop-in loads once added).

### Suggested manual script (tablet, Chromium)
1. First launch → onboarding auto-plays 3 voiced steps → map appears.
2. Open Isla de la P; hear auto-model on first items; say a syllable (verified) → star + Lalo cheer; try a near sound → "casi…"; deny mic → self-confirm path.
3. Hit the level goal → summary (stars + sticker + unlock) → map shows next node unlocked + first completed.
4. Open sticker book (earned vs silhouette). Open words level; play `pato`.
5. Tap ⚙️ → adult gate → dashboard: mastered X/Y, trouble syllables, toggle very-young + difficulty, reset.
6. Install to home screen; reload in airplane mode (offline shell + TTS); redeploy with bumped `CACHE_VERSION` and confirm update.
