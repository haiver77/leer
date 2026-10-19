# 1 — Specification: Syllable Reading Game for Kids ("Sílabas")

## Overview & Goals

A single-page web application that helps young children learning Spanish practice
reading by seeing a syllable (e.g. "Pa", "Se", "Te"), saying it aloud, and
receiving clear, joyful feedback when they pronounce it correctly. On success the
app celebrates and advances to the next randomly generated syllable.

**Problem solved:** early readers need low-friction, encouraging, repetitive
practice decoding Spanish syllables. The app provides an endless, self-paced,
reward-driven practice loop that a 4–7 year old can use with minimal adult help.

**Primary goal:** the child sees a syllable, repeats it, and — when recognized —
gets an obvious celebration and the next syllable appears automatically.

## Functional Specification

### User roles
- **Child (primary user)** — sees syllables, speaks them, receives feedback.
- **Parent/Teacher (secondary)** — may start the session and pick difficulty; no
  account needed.

### Core features
1. **Syllable display** — one large, high-contrast syllable shown center-screen,
   drawn from a generated pool (consonant + vowel, e.g. the matrix of
   {p,m,s,t,l,d,n,b,f,r,c} × {a,e,i,o,u}). First letter uppercase, rest lowercase
   (e.g. "Pa") as in the input example.
2. **Say-it interaction (speech)** — child taps a big "Hablar / 🎤" button and
   says the syllable. The app uses the browser Web Speech API
   (`SpeechRecognition`, `lang="es-ES"`) to capture and match the utterance.
3. **Correct-answer celebration** — on a match: a clear success effect (color
   burst / confetti, a happy sound, a checkmark or star animation) plays, then
   the app auto-advances to a new random syllable after a short delay.
4. **Retry on mismatch** — on no-match: gentle, non-punishing feedback ("Inténtalo
   otra vez 🙂") and the same syllable stays so the child can try again.
5. **Listen/model button** — a "Escuchar / 🔊" button uses speech synthesis
   (`SpeechSynthesis`, es voice) to pronounce the syllable so the child can hear
   the target first.
6. **Fallback "I said it" path** — when speech recognition is unavailable or
   denied (e.g. Safari/iOS, no mic permission), show a large "¡Lo dije! ✅" button
   that lets the child/adult self-confirm and advance, so the app is always
   usable.
7. **Session progress** — a simple streak/score counter ("⭐ x 5") and a subtle
   progress indication to keep motivation high. No failure states, no timers.
8. **Next/skip** — a small "Siguiente ➡️" control to move on manually.

### Difficulty (lightweight)
- **Fácil:** open syllables only (CV) from a core consonant set.
- **Normal:** full CV matrix.
- (Closed syllables / digraphs like "ch", "ll" are out of scope for iteration 1.)

### Key flow
1. App loads → welcome screen with a big "Empezar" button and difficulty toggle.
2. Child taps Empezar → first random syllable appears.
3. Child taps 🔊 (optional) to hear it, then taps 🎤 and says the syllable.
4. Match → celebration → streak++ → new random syllable after ~1.2 s.
5. No match → encouraging retry message → same syllable.
6. Loop continues indefinitely; child can stop anytime.

### Acceptance criteria (testable)
- AC1: On load, exactly one syllable from the active pool is displayed, large and
  centered.
- AC2: Tapping 🔊 plays spoken audio of the current syllable in Spanish.
- AC3: Tapping 🎤 requests mic and listens; a spoken match (case/accent-insensitive,
  normalized) triggers the celebration path.
- AC4: On a correct match, a visible celebration animation AND a success sound play,
  the streak counter increments, and a new, randomly chosen syllable appears within
  ~2 s.
- AC5: On a mismatch, an encouraging message appears and the same syllable remains.
- AC6: When `SpeechRecognition` is unsupported or mic is denied, the "¡Lo dije! ✅"
  self-confirm button is shown and advances on tap. App never dead-ends.
- AC7: No text input is required from the child; all primary actions are single large
  taps. All interactive targets ≥ 48×48 px.
- AC8: Works offline after first load except for voices that require network
  (graceful fallback if a voice is unavailable).

## Technical Specification

### Architecture
A static single-page app — no backend, no build server required to run. One HTML
document, one CSS file, a few small vanilla-JS modules loaded as ES modules. All
state is in memory (optionally persisted to `localStorage` for streak/difficulty).

### Components / modules
- `index.html` — markup + root containers (screen, syllable card, controls, score).
- `css/styles.css` — layout, theming (kid-friendly palette, large type), animations
  (celebration), responsive rules.
- `js/syllables.js` — syllable pool generation + random selection (no immediate
  repeats).
- `js/speech.js` — thin wrapper over Web Speech API: `speak(text)` (synthesis) and
  `listen()` (recognition) with capability detection + Spanish locale; normalization
  helper for matching (lowercase, strip accents/punctuation, trim).
- `js/celebrate.js` — success effects: confetti/star burst (canvas or CSS) + success
  sound (WebAudio or short asset) + optional haptics.
- `js/game.js` — state machine (welcome → playing), orchestrates display, speech,
  matching, scoring, and advancement.
- `js/main.js` — bootstrap/wiring and event listeners.

### Data model (in memory)
```
GameState {
  difficulty: "facil" | "normal"
  pool: string[]            // generated syllables for current difficulty
  current: string           // currently displayed syllable
  streak: number
  phase: "welcome" | "playing"
  speech: { recognitionSupported: bool, listening: bool }
}
```
Persisted (optional): `{ difficulty, bestStreak }` in `localStorage`.

### Key interfaces
- `syllables.generate(difficulty) -> string[]`
- `syllables.pickRandom(pool, exclude) -> string`
- `speech.speak(text): Promise<void>`
- `speech.listen(): Promise<{ transcript, matched: bool }>` (resolves on result/
  timeout/error)
- `speech.normalize(text) -> string`
- `celebrate.play()`
- `game` events: `onCorrect`, `onMismatch`, `onNext`

## Tech Stack Decision (binding on the Developer)

- **HTML5 + CSS3 + vanilla JavaScript (ES modules), no framework** — the input
  explicitly requires "javascript genérico, css y html"; a framework would violate
  the brief and add needless weight.
- **Web Speech API** (`SpeechRecognition` + `SpeechSynthesis`) — native browser
  speech-to-text and text-to-speech, zero dependencies, supports `es` locale.
- **Canvas 2D or CSS keyframes for confetti/celebration** — no animation library
  needed; keep it dependency-free.
- **Web Audio API (oscillator) or a tiny bundled sound file** for success chime —
  avoids external calls.
- **`localStorage`** for persisting difficulty and best streak — no backend.
- **No build step / no bundler** — plain static files served directly; optional
  lightweight dev server (`npx serve` / VS Code Live Server) only for local testing.
- **Deployment target:** any static host (GitHub Pages / Netlify / local file) — the
  `app/` folder is self-contained static assets.
- **Testing:** manual acceptance checks against AC1–AC8 plus a couple of pure-logic
  unit checks for `syllables` and `speech.normalize` (framework-free, e.g. a tiny
  `test.html` or Node `--test` if available). Formal test harness is optional this
  iteration.

## Non-Functional Requirements
- **Performance:** instant load; assets < ~200 KB total; no network dependency at
  runtime (except optional voices).
- **Accessibility:** large high-contrast text, ARIA labels on icon buttons, keyboard
  operable, respects `prefers-reduced-motion` (tone down celebration), color not the
  only success signal.
- **Responsiveness:** fluid layout for tablet and phone (portrait and landscape);
  touch-first with ≥48 px targets. Tablet is the expected primary device.
- **Robustness:** graceful degradation when speech APIs or mic are unavailable
  (fallback self-confirm). Clear, kid-safe copy in Spanish.
- **Privacy/safety:** no accounts, no data collection, no ads, no external tracking;
  audio processed in-browser only.

## Out of Scope (this iteration)
- Closed syllables, digraphs ("ch", "ll", "rr"), and full words/sentences.
- User accounts, cloud sync, multi-child profiles, analytics dashboards.
- Server-side speech scoring or phoneme-level pronunciation grading.
- Localization beyond Spanish; full WCAG audit; app-store/native packaging.
