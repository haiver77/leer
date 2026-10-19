# 2 — Specification: Spanish Reading Game for Kids ("Sílabas" → **"Lalo y las Sílabas"**)

Evolves `1_specification.md`. Iteration 1 shipped a clean, honest single drill
(see → hear → say → celebrate → next) with graceful speech fallback, a11y basics,
and localStorage for difficulty + best streak. **Everything in iteration 1 is
carried forward** and the new scope wraps *around* that core loop — it does not
replace it.

## Overview & Goals

Grow from "a tidy prototype of one drill" into a **real kids' reading product** a
parent would choose over Lingokids / Khan Academy Kids / Leo con Grin — while
staying 100% vanilla, buildless, offline-first, private, and free.

Iteration-2 ambition:
- A **named mascot + light world** gives identity and a reason to come back.
- A **learning arc**: syllables → two-syllable words (with a picture) → later
  levels (closed syllables, digraphs), surfaced as an unlockable **world map**.
- **Progress that means something**: per-syllable mastery persisted locally, a
  **reward system** (stars/stickers/badges + sticker book), and a gentle **daily
  goal** / end-of-level summary.
- A **trustworthy speech check** (voice-verified vs self-confirm clearly
  separated, child leniency, gentle "casi…").
- **Product-grade polish**: real inline-SVG illustrations + mascot, a real
  self-hosted kid font, an **installable PWA** with offline app-shell + bundled
  audio, and accessibility a non-reader can actually use.

**North-star still true:** the child sees a syllable, says it, gets obvious
celebration, and advances. No timers, no fail states, minimal adult help.

### Identity / hook (new)
- **App name:** "Lalo y las Sílabas" (working title). **Mascot:** *Lalo*, a
  friendly rounded animal/robot (final species chosen in art, kept simple as SVG).
- Light world framing: islands/islas the child travels with Lalo. No story text a
  pre-reader must read — the world is conveyed by art, mascot, and voice.

---

## Functional Specification

### User roles
- **Child (primary, ~4–7, often pre-reader)** — sees syllables/words, speaks them,
  collects rewards, travels the map. All primary actions are single large taps;
  no typing; meaning carried by voice + art + icon, not text.
- **Parent/Teacher (secondary)** — opens a gated dashboard, picks difficulty /
  very-young mode, reads session stats. No account.

### A. Carried forward from iteration 1 (keep — do not regress)
These remain and must keep passing.

1. **Syllable display** — one large, high-contrast syllable, title-cased ("Pa"),
   drawn from the active pool with no immediate repeats.
2. **Say-it (speech)** — big mic action uses Web Speech `SpeechRecognition`
   (`es-ES`, `maxAlternatives:5`) to capture + match the utterance.
3. **Celebration on match** — confetti/star burst (canvas), Web Audio chime,
   haptics; auto-advance after a short delay.
4. **Gentle retry on mismatch** — non-punishing message; same item stays.
5. **Listen/model (🔊)** — `SpeechSynthesis` es voice pronounces the target.
6. **Always-usable fallback** — when recognition/mic is unavailable or denied, a
   self-confirm path advances the child. App never dead-ends.
7. **Streak + best streak**, persisted in localStorage. No timers, no fail states.
8. **Difficulty** — Fácil (core consonants) / Normal (full CV matrix).
9. **a11y + responsiveness** — `prefers-reduced-motion`, `prefers-contrast`, ARIA
   labels, live-region feedback, focus-visible, ≥56px targets, tablet-first.

Carried-forward acceptance (abbrev.): AC1–AC8 from iteration 1 remain valid; AC3
is **tightened** by F9 below (voice-verified vs self-confirm).

### B. New features for iteration 2

#### F1 — First-run onboarding / tutorial (voiced)
A 2–3 step animated, **voiced-in-Spanish** demo on first launch, with Lalo guiding.
- Step 1: "Esta es tu sílaba" — the card appears, Lalo points, **model audio
  auto-plays**.
- Step 2: "Toca 🔊 para oírla" — highlights the listen action, plays it.
- Step 3: "Toca 🎤 y dila" — highlights the mic, shows a success mini-demo.
- **AC-F1.1:** On first ever run (no `onboardingDone` flag), onboarding plays
  automatically before the first level; each step is voiced in Spanish.
- **AC-F1.2:** Onboarding is skippable (adult) and never blocks; completing or
  skipping sets `onboardingDone=true` so it does not reappear.
- **AC-F1.3:** For the **first few new syllables** of a child's early sessions,
  model pronunciation **auto-plays** when a new item appears (configurable count,
  default 3), then reverts to tap-to-hear.

#### F2 — Progression & world map (levels / islands)
Replace the infinite flat drill with a **visible map** of levels the child unlocks.
- Staged path: per-consonant islands (e.g. *Isla de la P*, *Isla de la M*…) →
  **mixed syllables** → **two-syllable words** → later **closed syllables &
  digraphs** (ch, ll, rr, ñ-syllables ña/ñe, que/qui, gue/gui).
- Each level has a small goal (e.g. N correct / mastery threshold) and, on
  completion, unlocks the next node and a reward.
- **AC-F2.1:** The map shows locked + unlocked + completed nodes with distinct,
  non-text-dependent visuals (icon/art + mascot state).
- **AC-F2.2:** Completing a level unlocks exactly the next node and persists the
  unlock in localStorage; relaunch restores map state.
- **AC-F2.3:** A level is always reachable from the map in ≤1 tap; the child can
  replay completed levels (no lockout, no fail state).

#### F3 — Reward system (stars / stickers / badges + sticker book)
Rewards beyond a streak integer.
- **Stars** awarded per correct item; **milestone celebration every 5 correct**.
- **Stickers/badges** unlocked per level/milestone; collected in a revisitable
  **sticker book** screen.
- **AC-F3.1:** Each voice-verified (or adult-confirmed) correct answer awards ≥1
  star; totals persist in localStorage.
- **AC-F3.2:** Every 5th correct triggers an extra milestone celebration distinct
  from the per-item one.
- **AC-F3.3:** Finishing a level grants a sticker/badge that appears in the sticker
  book and persists across reloads.
- **AC-F3.4:** The sticker book is reachable from the map and shows earned vs
  not-yet-earned items (locked shown as silhouettes, no required reading).

#### F4 — Per-syllable mastery tracking (persisted)
Track learning, not just a best number.
- Per item record `{ seen, attempted, correct, verifiedCorrect, lastSeen }`;
  mastery = correct/verified count reaching a threshold (e.g. 3 verified).
- A simple indicator: "Dominaste 12 de 25 sílabas".
- **AC-F4.1:** Every attempt updates the item's counters in localStorage.
- **AC-F4.2:** An item flips to **mastered** at the threshold and the "X de Y"
  indicator reflects it.
- **AC-F4.3:** Mastery + counters survive reload and feed the parent dashboard.

#### F5 — Two-syllable word building (+ picture)
After syllables, build CV+CV words.
- Present two syllable tiles that combine into a word (e.g. **pa + to → "pato"**)
  shown with a **clear illustration** of the word's meaning.
- Child hears/says each syllable then the whole word; success celebrates the word.
- **AC-F5.1:** A word level shows two syllable parts and the assembled word with a
  matching inline-SVG picture.
- **AC-F5.2:** Saying the word (or, leniently, both parts) is accepted as correct
  via the same trustworthy speech path.
- **AC-F5.3:** Word content set launches with a small, curated CV+CV list whose
  syllables come from already-introduced consonants (e.g. pato, mesa, lupa, dedo…).

#### F6 — Syllable → image association
Connect sound + meaning for pre-readers.
- Each syllable/word pairs with a consistent inline-SVG cue (e.g. "Pa" → pato cue,
  "Ma" → mamá) shown near the card.
- **AC-F6.1:** The current item displays an associated illustration; where no
  1:1 image exists for a bare syllable, show the mascot or a neutral scene (never
  blank), so a pre-reader always has a non-text anchor.

#### F7 — Parent/Teacher dashboard (gated, no account)
Lightweight panel that makes an adult keep the app.
- **Adult gate:** a simple barrier a young child won't pass — e.g. "hold 3s" or a
  tiny arithmetic question ("¿Cuánto es 4 + 3?"). No PIN storage, no account.
- Shows: time practiced this session, syllables mastered (X/Y), **trouble
  syllables** (low correct ratio), current + best streak, stars/stickers earned.
- Controls surfaced here: difficulty, very-young (text-free) mode, reset progress.
- **AC-F7.1:** The dashboard is reachable only after passing the adult gate; a
  direct child tap does not open it.
- **AC-F7.2:** Stats shown are computed from the persisted mastery model (F4) and
  match reality (e.g. trouble syllables are those with lowest correct ratio).
- **AC-F7.3:** Reset progress clears localStorage progress (with a confirm) and
  returns to a clean first-run state.

#### F8 — Reduced button clutter (one primary action)
Redesign the game screen around **one obvious primary action**.
- Primary: the **mic** (or a big friendly Lalo/tap-to-speak target).
- Secondary controls (🔊 listen is semi-primary; skip, home/map, difficulty,
  dashboard) tucked into smaller, consistent, out-of-the-way spots.
- **AC-F8.1:** On the game screen there is exactly one visually dominant primary
  action; secondary controls are visibly subordinate (size/placement/weight).
- **AC-F8.2:** Listen/model remains one tap away; skip + back-to-map remain
  reachable but de-emphasized.

#### F9 — Trustworthy speech check
Make "success" mean the child actually said it (or be honest when it can't).
- **Voice-verified vs self-confirm are separated:** a star/mastery credit from the
  **mic path requires an actual match**. The **self-confirm** path is reserved for
  the no-mic/denied or adult case and is **visually distinct** (and may be marked
  as adult-confirmed, not voice-verified, in stats).
- **Child leniency:** keep multi-alternative capture; add phonetic/near-miss
  leniency (e.g. accept close vowels/voicing for young voices) and a short retry.
- **Gentle near-miss:** when close but not matched, show **"casi… escucha otra
  vez"** and auto-offer the model.
- **AC-F9.1:** A mic attempt only awards a star when an alternative actually
  matches under the lenient matcher; a silent/empty result never awards.
- **AC-F9.2:** Self-confirm still advances (never dead-ends) but is visually
  separated from the mic action and recorded distinctly (adult-confirmed) in F4/F7.
- **AC-F9.3:** A near-miss (close under leniency rules but not accepted) shows the
  "casi…" message and keeps the same item.
- **AC-F9.4:** The UI makes clear which successes were voice-verified (e.g. a mic
  check badge on the celebration) vs self-confirmed.

#### F10 — Mascot (Lalo) with reactions
A friendly inline-SVG character that reacts.
- States: **idle/encourage**, **success (cheer)**, **retry (gentle encourage)**,
  **model (mouth moves / "escucha")**.
- **AC-F10.1:** On correct → Lalo plays a cheer reaction alongside confetti+chime.
- **AC-F10.2:** On mismatch/near-miss → Lalo plays a gentle encourage (never sad
  or punishing).
- **AC-F10.3:** On model/listen → Lalo visibly "voices" the syllable (mouth/
  motion) in sync with audio; honors `prefers-reduced-motion` (swap motion for a
  static expressive pose).

#### F11 — End-of-level summary & gentle come-back loop
- Short celebratory summary ("¡Ganaste 5 estrellas! 🌟") + sticker earned at level
  end, then back to the map with the next node unlocked.
- A gentle **daily goal** (e.g. "practica hasta llenar la barra de hoy") with a
  friendly nudge on return — **no timers, no streakbreak guilt, no fail states**.
- **AC-F11.1:** Completing a level shows a summary of stars/stickers earned and the
  newly unlocked node, then returns to the map.
- **AC-F11.2:** A daily-goal indicator advances with practice and resets per
  calendar day (local date); never penalizes a missed day.

#### F12 — Product-grade accessibility
- Every **success/retry** signal is conveyed by **sound + animation + icon**
  simultaneously so a non-reader perceives outcome without reading.
- **Very-young / text-free mode** (toggle in dashboard): removes Spanish button
  text, relying on icons + voiced hints + mascot only.
- **Voiced button hints:** tap-and-hear on controls (press reads what it does).
- Verify large-text + contrast in both normal and high-contrast themes; keep full
  keyboard paths; `prefers-reduced-motion` across all new animations (map, mascot,
  rewards, transitions).
- **AC-F12.1:** With sound on, a correct answer is distinguishable from a retry via
  chime + mascot + icon alone (no text needed).
- **AC-F12.2:** Very-young mode hides all child-facing Spanish text while keeping
  the game fully playable via icons + voice.
- **AC-F12.3:** All new interactive targets ≥56px, keyboard-reachable, with ARIA
  labels and visible focus.

#### F13 — Installable PWA + offline audio
- `manifest.webmanifest` (name "Lalo y las Sílabas", icons 192/512 + maskable,
  `theme_color`, `background_color`, `display: standalone`, `orientation:
  portrait`, start_url).
- **Service worker** (`sw.js`) caches the **app shell** (HTML/CSS/JS/SVG/font/
  audio/icons) for true offline; cache-first for the shell with a versioned cache.
- **Own the audio:** bundle short syllable/word audio clips (or synthesize-once +
  cache) so **modeling works offline**; **TTS remains the fallback** when a clip
  is missing.
- **AC-F13.1:** The app is installable ("Add to Home Screen") on a tablet and
  launches standalone.
- **AC-F13.2:** After first load, the app opens and plays model audio **fully
  offline** (airplane mode) using bundled clips; missing clips fall back to TTS.
- **AC-F13.3:** A new deploy busts the old cache (cache version bump) without
  breaking an installed copy.

#### F14 — Delight (within constraints)
- Playful transitions between syllables, varied celebration moments, encouraging
  **voiced** praise ("¡muy bien!", "¡excelente!") — all respecting reduced-motion
  and dependency-free.
- **AC-F14.1:** At least 2–3 celebration variations rotate so success doesn't feel
  identical every time.

---

## Technical Specification

### Architecture
Still a **static SPA**: one `index.html`, one CSS file, small vanilla **ES
modules**, **no backend, no build step, no bundler**. All art is **inline SVG**.
New: a **service worker** + **manifest** for installable offline, bundled audio
assets, and a self-hosted font. State lives in memory and is persisted to
`localStorage`; screens are swapped by a small view/router in the game state
machine (welcome → onboarding → map → level(play) → summary → sticker book →
dashboard).

### Module breakdown
Carried forward (extended):
- `index.html` — adds containers for onboarding, map, sticker book, dashboard,
  mascot host, word view; links manifest; registers the service worker.
- `css/styles.css` — adds `@font-face` for the self-hosted kid font, map/reward/
  mascot/word styling, transitions, very-young-mode + high-contrast rules.
- `js/syllables.js` — keep CV generation + no-repeat pick; **extend** with closed
  syllables & digraphs (ch, ll, rr, ña/ñe, que/qui, gue/gui) as separate pools.
- `js/speech.js` — keep normalize + synthesis + recognition; **add** phonetic/
  near-miss leniency scoring and a `classify(target, transcript) → "match" |
  "near" | "miss"` helper (pure, unit-testable).
- `js/celebrate.js` — keep confetti/chime/haptics; **add** milestone variant +
  rotating celebration variations.
- `js/game.js` — expand the state machine for the new phases, level flow, word
  flow, reward awarding, mastery updates, onboarding gating, daily goal.
- `js/main.js` — wire new screens/controls; register the service worker.

New modules:
- `js/progress.js` — **mastery + persistence**: per-syllable/word records, mastery
  thresholds, stars/badges, level-unlock state, daily goal, difficulty, flags
  (onboardingDone, veryYoung). Single source of truth for localStorage (schema
  versioned, migration-tolerant). Pure-ish, unit-testable aggregation helpers
  (mastered count, trouble syllables).
- `js/levels.js` — level/world-map definitions (nodes, order, unlock rules, goal
  per node, which pool/mode each uses) + map state derivation. Pure, testable.
- `js/rewards.js` — reward rules (stars per correct, milestone every 5, sticker/
  badge per level) + sticker-book catalog. Pure, testable.
- `js/words.js` — two-syllable word catalog: `{ word, parts:[cv,cv], artId }`
  curated from introduced consonants. Pure, testable.
- `js/mascot.js` — Lalo as inline SVG with `setState("idle"|"cheer"|"encourage"
  |"model")`; CSS-driven motion, reduced-motion static poses.
- `js/art.js` — inline-SVG illustration registry (word pictures, syllable cues,
  map/island art, stickers, icons) returning SVG strings/nodes by id.
- `js/audio.js` — audio modeling: play bundled clip by id; fall back to
  `speech.speak` TTS when a clip is missing/offline-unavailable.
- `js/adultGate.js` — simple gate (hold-to-open or tiny math) protecting the
  dashboard. Pure check + minimal UI hook.
- `sw.js` (service worker, site root scope) — versioned cache of the app shell +
  assets; cache-first with network update; skipWaiting/clients.claim on activate.
- `manifest.webmanifest` — PWA metadata + icon references.

Assets:
- `app/audio/` — short syllable/word clips (own/bundled), small + preloaded via SW.
- `app/fonts/` — self-hosted rounded kid font (e.g. a Baloo-style OFL font) wired
  with `@font-face`, `font-display: swap`.
- `app/icons/` — PWA icons (192, 512, maskable) — may be SVG-sourced PNG or SVG.
- Illustrations/mascot/map/stickers are **inline SVG** (via `art.js`/`mascot.js`),
  not separate image files, to stay dependency-free and instantly offline.

### Data model (localStorage — schema `silabas:v2`, migrates from `v1`)
```
Progress {
  version: 2,
  difficulty: "facil" | "normal",
  veryYoung: boolean,
  onboardingDone: boolean,
  autoModelRemaining: number,          // new-item auto-play budget (default 3)
  streak: number,
  bestStreak: number,
  stars: number,
  items: {                             // per syllable AND per word
    [id: string]: {
      seen: number, attempted: number,
      correct: number, verifiedCorrect: number,   // verified = mic-matched
      mastered: boolean, lastSeen: number
    }
  },
  levels: {
    [levelId: string]: { unlocked: boolean, completed: boolean, bestStars: number }
  },
  stickers: string[],                  // earned sticker/badge ids
  dailyGoal: { date: "YYYY-MM-DD", progress: number, target: number }
}
```
- **Mastery:** `mastered = verifiedCorrect >= THRESHOLD` (e.g. 3); self-confirmed
  correct counts toward `correct`/stars but not `verifiedCorrect` (keeps mastery
  honest per F9).
- **Trouble syllables (dashboard):** items with attempts ≥ k and lowest
  correct/attempted ratio.
- **Daily goal:** compares `dailyGoal.date` to local today; new day → reset
  `progress`, keep streak/best. Never penalizes.
- Migration: on load, if stored `version < 2`, seed v2 from old `{difficulty,
  bestStreak}` (preserve best streak + difficulty), default the rest.

### Adult gate (how it works)
- Dashboard entry point is a small, low-salience control. Tapping it opens the
  gate overlay: either **press-and-hold 3s** or a **one-line arithmetic prompt**
  ("¿Cuánto es 4 + 3?") answered with number buttons. Correct/held → dashboard.
  Wrong/released early → close, no penalty. Nothing is stored; it's a friction
  barrier for young children, not security.

### Key interfaces (new/updated)
- `syllables.generate(poolId) -> string[]` (open CV, closed, digraphs…)
- `speech.classify(target, transcript) -> "match"|"near"|"miss"` (pure)
- `progress.recordAttempt(id, {verified:boolean, correct:boolean})`
- `progress.masteredCount(poolId) -> {mastered, total}`
- `progress.troubleItems(k) -> string[]`
- `levels.all()` / `levels.mapState(progress)` / `levels.nextUnlock(levelId)`
- `rewards.onCorrect(state)` / `rewards.onLevelComplete(levelId) -> stickerId`
- `words.forLevel(levelId) -> {word, parts, artId}[]`
- `audio.model(id) -> Promise<void>` (clip → TTS fallback)
- `mascot.setState(state)` / `art.svg(id) -> string`

### Testing
- Keep framework-free Node `--test` pure-logic suite; **extend** to cover:
  `syllables` (new pools), `speech.classify` (match/near/miss + leniency),
  `progress` (record/mastery/trouble/daily-goal/migration), `levels` (unlock
  rules), `rewards` (stars/milestone/sticker), `words` (catalog integrity).
- Manual acceptance against AC1–AC8 (carried) + AC-F1…F14.
- Manual PWA checks: installability, offline app-shell + offline model audio,
  cache-version bump.

---

## Tech Stack Decision (binding on the Developer)

- **HTML5 + CSS3 + vanilla JavaScript (ES modules). NO framework, NO bundler, NO
  build step.** The brief requires "javascript genérico, css y html".
- **All art = inline SVG** (mascot, illustrations, map, stickers, icons). No image
  libraries, no sprite deps.
- **Self-hosted display font via `@font-face`** (OFL rounded kid font bundled in
  `app/fonts/`, `font-display: swap`). No external font CDN.
- **PWA:** `manifest.webmanifest` + a **service worker** (`sw.js`) caching the app
  shell + assets for true offline. App icons bundled.
- **Audio:** bundle/own short syllable+word clips in `app/audio/`, cached by the
  SW for offline modeling; **Web Speech `SpeechSynthesis` TTS is the fallback**.
- **Speech recognition:** Web Speech `SpeechRecognition` (`es-ES`) as before, with
  always-usable self-confirm fallback.
- **Confetti/chime:** Canvas 2D + Web Audio (unchanged), dependency-free.
- **Persistence:** `localStorage` only (schema `silabas:v2`). No backend, no
  accounts, no network at runtime beyond optional OS voices.
- **Deployment:** any static host; `app/` is self-contained. (PWA needs HTTPS or
  localhost for the service worker — note for hosting, not a new dependency.)

---

## Non-Functional Requirements
- **Performance:** instant load; app shell small; lazy-init heavy bits (confetti
  canvas, audio context, map art) on demand; total shell ideally < ~600 KB incl.
  font + a handful of audio clips (clips kept short/compressed). 60fps-friendly
  animations; no runtime network dependency.
- **Accessibility (product grade):** success/retry perceivable by sound +
  animation + icon together; very-young text-free mode; voiced button hints; ARIA
  labels + live region; keyboard operable; visible focus; `prefers-reduced-motion`
  and `prefers-contrast` honored across all new UI; ≥56px targets.
- **Responsiveness:** tablet-first (portrait primary), works phone + landscape;
  `dvh` units; map/word/dashboard all fluid.
- **Privacy/safety:** no accounts, no ads, no tracking, no external data
  collection; audio/speech processed in-browser; nothing leaves the device.
- **Offline:** after first load, full app + model audio work offline via the SW
  cache; graceful TTS fallback when a clip is absent.
- **Robustness / pressure-free:** no fail states, no punishing timers; mismatches
  stay gentle; app never dead-ends when speech/mic/synthesis is unavailable.

---

## Out of Scope (iteration 2)
- Multi-child profiles / accounts / login; cloud sync or cross-device progress.
- Server-side or phoneme-level pronunciation scoring (speech stays client-side +
  lenient matching only).
- Full word *sentences* / reading comprehension beyond two-syllable (and a few
  simple CV+CV) words.
- Locales other than Spanish; full formal WCAG audit / certification.
- Native app-store packaging (PWA install only); analytics/telemetry of any kind.
- Professionally recorded voice-actor audio for every item (bundle a practical
  starter set + TTS fallback; a full recorded library can come later).
