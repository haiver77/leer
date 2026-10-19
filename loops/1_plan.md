# 1 — Implementation Plan: Syllable Reading Game ("Sílabas")

This plan implements `loops/1_specification.md` exactly. Tech stack is binding:
HTML5 + CSS3 + vanilla JavaScript (ES modules), no framework, Web Speech API,
Canvas confetti, Web Audio chime, `localStorage`, no build step. Deployment
target: any static host.

## 1. Project Structure (under `app/`)

```
app/
  index.html            # markup: welcome screen + game screen, root containers
  css/
    styles.css          # layout, kid palette, large type, celebration keyframes, responsive, a11y
  js/
    syllables.js        # pool generation + non-repeating random selection
    speech.js           # Web Speech wrapper: speak(), listen(), capability detection, normalize()
    celebrate.js        # canvas confetti/stars + Web Audio success chime + haptics
    game.js             # state machine welcome -> playing; orchestration, scoring, advancement
    main.js             # bootstrap + DOM wiring + event listeners
```

Pure static assets, self-contained, no runtime network dependency except
optional TTS voices.

## 2. Module → Feature → Acceptance Criteria mapping

| Module | Responsibility | Spec features | Acceptance criteria |
| ------ | -------------- | ------------- | ------------------- |
| `syllables.js` | `generate(difficulty)`, `pickRandom(pool, exclude)` | Syllable display, difficulty, no immediate repeats | AC1, AC4 |
| `speech.js` | `speak(text)`, `listen()`, `recognitionSupported`, `normalize(text)` | Listen button, say-it interaction, matching, fallback detection | AC2, AC3, AC6, AC8 |
| `celebrate.js` | `play()` confetti + chime + haptics; respects `prefers-reduced-motion` | Celebration | AC4 |
| `game.js` | state machine, orchestration, streak, retry, auto-advance | All flows, retry, scoring | AC3, AC4, AC5, AC6 |
| `main.js` | wiring, event listeners, keyboard support | Welcome screen, controls | AC7 |
| `index.html` | containers, large centered card, buttons, ARIA | Display, controls, score | AC1, AC7 |
| `styles.css` | large type, high contrast, ≥48px targets, responsive, reduced-motion | NFRs | AC7 |

### How each AC is satisfied
- **AC1** — `game.start()` calls `syllables.pickRandom` and renders exactly one
  syllable into the large centered `.syllable-card`.
- **AC2** — 🔊 Escuchar calls `speech.speak(current)` with an `es` voice.
- **AC3** — 🎤 Hablar calls `speech.listen()`; transcript normalized via
  `speech.normalize` and compared to normalized syllable → celebration path.
- **AC4** — on match: `celebrate.play()` (visible confetti/stars + oscillator
  chime), `streak++`, auto-advance via `setTimeout(~1200ms)` to a new random,
  non-repeating syllable.
- **AC5** — on mismatch: show "Inténtalo otra vez 🙂", keep same syllable.
- **AC6** — if `SpeechRecognition` unsupported or mic denied, hide/disable 🎤 and
  surface the always-present "¡Lo dije! ✅" self-confirm button; never dead-ends.
- **AC7** — no text input anywhere; all primary actions are single large taps;
  CSS enforces `min-width/height: 48px` (buttons sized larger, ~64px+).
- **AC8** — works from `file://` or static host after first load; if no `es`
  voice is present, `speak()` fails gracefully without breaking the loop.

## 3. Deployment Plan

### Run locally
No build step. Because the app uses ES modules, it must be served over HTTP
(ES module imports are blocked on `file://` in most browsers). Options:

```bash
# Option A — Node "serve" (zero install with npx)
npx serve app
# then open the printed URL, e.g. http://localhost:3000

# Option B — Python built-in server
cd app && python -m http.server 8000
# open http://localhost:8000

# Option C — VS Code: install "Live Server" extension,
# right-click app/index.html -> "Open with Live Server"
```

### Deploy to a static host
GitHub Pages (project site):
```bash
git add app && git commit -m "Sílabas app"
git push origin main
# In GitHub: Settings -> Pages -> Source: deploy from branch,
# branch: main, folder: /app  (or move app/ contents to /docs)
```

Netlify (drag-and-drop or CLI):
```bash
npm i -g netlify-cli
netlify deploy --dir=app --prod
```

Any static host works because `app/` is pure static files. Set the publish
directory to `app`.

## 4. Verification Plan

### Automated logic checks (Node, framework-free)
`speech.js` and `syllables.js` keep their pure logic exportable so Node can test
them. Run (use the glob form; some Node versions reject a bare directory):

```bash
node --test "app/js/**/*.test.js"
```

This exercises:
- `syllables.generate("facil")` and `generate("normal")` produce the expected
  pools (CV only, uppercase-first, correct sizes).
- `syllables.pickRandom(pool, exclude)` never returns the excluded value over
  many iterations (no immediate repeats) and always returns a pool member.
- `speech.normalize` lowercases, strips accents/punctuation/whitespace
  (e.g. "¡Pá!" → "pa", " Se " → "se", "TÉ." → "te").

> `SpeechRecognition` / `SpeechSynthesis` cannot run headless in Node — they are
> browser-only. Those paths are verified manually in a browser (below).

### Manual browser checks (map to AC1–AC8)
- **AC1** — load served page, tap Empezar → exactly one large centered syllable.
- **AC2** — tap 🔊 → hear the syllable spoken in Spanish.
- **AC3** — tap 🎤, allow mic, say the syllable → celebration triggers.
- **AC4** — on success: confetti + chime, streak increments, new syllable within ~2s.
- **AC5** — say something wrong → "Inténtalo otra vez 🙂", same syllable stays.
- **AC6** — in Safari/iOS or with mic denied → "¡Lo dije! ✅" visible and advances.
- **AC7** — inspect: no text inputs; measure targets ≥ 48px; keyboard Tab/Enter works.
- **AC8** — reload offline (after first load) → UI still works; no `es` voice →
  speak fails silently, game still playable.

### Accessibility spot-checks
- Icon buttons have `aria-label`; live region announces feedback.
- `prefers-reduced-motion: reduce` tones down/disables confetti.
- Success is signaled by text + icon + sound, not color alone.
