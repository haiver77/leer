VERDICT: NEEDS_WORK
OVERALL: 7.5

# 3 — Customer Review & Requirements: "Lalo y las Sílabas" (iteration 2 → 3)

I reviewed the **actual iteration-2 build**, not the promises. I read the spec
(`2_specification.md`), the plan (`2_plan.md`), and the real code under `app/`:
`index.html`, `css/styles.css`, `sw.js`, `manifest.webmanifest`, and every JS
module (`game.js`, `main.js`, `progress.js`, `levels.js`, `rewards.js`,
`words.js`, `speech.js`, `mascot.js`, `art.js`, `audio.js`, `adultGate.js`,
`celebrate.js`, `syllables.js`). I re-ran the pure-logic suite myself:

```
node --test app/js/logic.test.js app/js/progress.test.js app/js/levels.test.js \
            app/js/rewards.test.js app/js/words.test.js app/js/adultGate.test.js
→ tests 53 | pass 53 | fail 0
```

**This is a large, genuine step up from iteration 1 (5.2 → 7.5).** Nearly every
gap I raised last round is actually addressed in code, not just documented:

- **Progression & world map (F2)** — real `levels.js` with an ordered staged
  path (6 consonant islands → mixed → words → digraphs → closed), unlock rules,
  `mapState`/`nextUnlock`/`completeLevel`, rendered as a locked/unlocked/
  completed grid with distinct non-text visuals + `≤1-tap` entry.
- **Per-syllable mastery (F4)** — real `progress.js` with `{seen, attempted,
  correct, verifiedCorrect, mastered, lastSeen}` per item, a `v1→v2` migration,
  mastery threshold, `masteredCount`, `troubleItems`, daily-goal date handling.
- **Reward system (F3)** — `rewards.js` stars-per-correct, milestone every 5,
  one sticker per level + milestone sticker, a real sticker book with
  earned/silhouette states.
- **Word building (F5)** — `words.js` 10-word CV+CV catalog, a word view with
  two tappable parts + assembled word + a matching inline-SVG picture.
- **Trustworthy speech (F9)** — `speech.classify()` separates `match`/`near`/
  `miss` with child leniency (close vowels, voicing pairs, digraph collapse);
  the mic path only awards a star on a real match; self-confirm is reserved for
  the no-mic/adult case and recorded distinctly; near-miss shows "casi…".
- **Mascot (F10)** — Lalo is a real inline-SVG character with `idle/cheer/
  encourage/model` states, CSS motion, and a reduced-motion static pose.
- **Onboarding (F1), parent dashboard behind an adult gate (F7), reduced
  clutter / one primary mic action (F8), end-of-level summary + daily goal
  (F11), very-young text-free mode (F12), delight variations (F14)** — all
  present and wired.
- **PWA (F13)** — a real `manifest.webmanifest`, a versioned cache-first `sw.js`
  with offline shell + stale-while-revalidate + navigation fallback, SVG app
  icons.

I am crediting all of that as real. I am **not** inflating for the honest
stubs, and I verified them: `app/audio/` ships no recorded clips (the `CLIPS`
registry is empty, so every item uses TTS), `app/fonts/` has only a README (no
`lalo-rounded.woff2`, so the `@font-face` falls back to the system stack), and
`app/icons/` has `icon.svg` + `icon-maskable.svg` but **no** `icon-192.png` /
`icon-512.png` (the manifest references them; they are documented drop-ins).
Those are fair, working degradations — but they are also exactly what still
separates this from a category-leading product.

As a demanding parent choosing between this and Lingokids / Khan Academy Kids /
Leo con Grin: I would now give it a real try. It has identity, a path, rewards,
and a reason to come back. It does **not yet** clear my bar for "polished,
competitive product I'd pay for and recommend" — the art is simple programmatic
SVG, the voice is robotic OS TTS (and missing entirely on many tablets), and
none of the speech / install / offline / visual promises are verified running
in a browser. Close, but not over the line.

## Scoring

| Dimension                     | Score (1-10) | Justification                 |
| ----------------------------- | ------------ | ----------------------------- |
| Business value                | 8            | Now a real learning product, not a toy: a staged arc toward actual reading (syllables → mixed → two-syllable words → digraphs/closed), genuine per-item mastery persisted in localStorage, a parent dashboard surfacing mastered X/Y + trouble syllables + streaks + stickers, a pressure-free daily goal, and a reward economy. This is the stuff that makes an adult keep and recommend it. Still capped by thin word content (10 words, a single word level) and TTS-only modeling that can be absent on real tablets, so the "learn to read" payoff is real but shallow. |
| Features / functionality      | 8            | Every feature I asked for (F1–F14) is implemented in code and wired through the state machine — not stubbed. Pure logic is solid and proven: 53/53 Node tests pass across syllables, speech.classify, progress/migration/mastery/trouble/daily-goal, levels unlock rules, rewards, words, and the adult gate. The honest gaps (no recorded clips, PNG icons + woff2 font as drop-ins) are graceful degradations with working fallbacks rather than missing capability. Held under 9 only because content is still small and the richest behaviors are browser-only and unproven here. |
| User experience (UX)          | 7            | Big improvement: first-run onboarding, exactly one dominant mic action with subordinate controls, a map reachable in ≤1 tap with replay, never-dead-end self-confirm, a "casi…" near-miss, and a very-young text-free mode. Three real UX concerns keep it at 7: (a) `autoModelRemaining` is a single lifetime budget of 3 total new items — not "the first few of early sessions per the spec intent," so a returning child gets no auto-model ever again; (b) the voiced onboarding, auto-model, and child-voice recognition accuracy are the heart of the flow and are entirely unverified in this run; (c) onboarding text advances but I can't confirm each step is actually voiced. |
| User interface (UI)           | 7            | A real leap from iteration 1's emoji-only look: a consistent inline-SVG mascot, island/word/sticker/icon art, a cohesive palette, rounded cards, feedback color-coding, and a polished responsive layout. It reads as a nicely designed indie kids' app. It is **not** category-leading UI: the illustrations are simple geometric programmatic SVG (flat shapes, no character richness or scenes), and the intended display font is only a fallback stack until a real `woff2` is dropped in — so typography is unintentional on most devices today. |
| Modern design standards       | 8            | Strong, current hygiene: installable PWA with a versioned cache-first service worker (offline shell, stale-while-revalidate, navigation fallback, cache-bump on activate), `prefers-reduced-motion` honored across every new animation incl. the mascot, `prefers-contrast`, ARIA + live region, visible focus, ≥56px targets, `dvh`, responsive portrait/landscape/phone, zero dependencies/build. Short of 9 because the PWA install + true offline + offline audio are unverified in this environment and the raster PNG icons aren't bundled, so real installability is asserted, not demonstrated. |
| Competitive / attractiveness  | 7            | It now has a hook: a named mascot (Lalo), a world/island framing, a map, collectible stickers, and milestone celebrations — it would no longer be dismissed in a 30-second browse, which is a real competitive gain. But head-to-head with Lingokids / Khan Academy Kids / Leo con Grin it still trails on the two things parents feel instantly: professional-grade illustration/animation and warm recorded human voice. Robotic TTS and geometric SVG are "clearly good for a free offline indie app," not "indistinguishable from the paid leaders." |
| **Overall (average)**         | **7.5**      | (8 + 8 + 7 + 7 + 8 + 7) / 6 = 7.5. Every dimension clears ≥7, but the overall is below the 8.0 gate. **NEEDS_WORK — continue the loop.** One more focused iteration on art fidelity, real voice, verified browser acceptance, and deeper content should clear it. |

Gate check: Overall ≥ 8.0 AND every dimension ≥ 7. Here every dimension is ≥ 7
(good — no weak spot remains) but Overall 7.5 < 8.0, so the solution does not
pass. This is a close, honest miss, not a rejection.

## What's excellent now (keep it — do not regress)

- Clean separation of **pure, tested logic** (`progress`, `levels`, `rewards`,
  `words`, `speech.classify`, `syllables`, `adultGate`) from browser-only modules
  (`mascot`, `art`, `audio`, `sw`) — 53/53 tests, every module `node --check`-clean.
- **Honest mastery**: only mic-verified matches count toward mastery; self-confirm
  advances but is recorded as adult-confirmed and visually separate (F9).
- **Never dead-ends**: mic-denied → self-confirm; missing clip → TTS; missing
  font → system stack; missing PNG → SVG icon. Graceful degradation everywhere.
- **Pressure-free**: no timers, no fail states, gentle retry + "casi…", daily
  goal that never penalizes a missed day.
- **Accessibility + PWA scaffolding** are genuinely good (reduced-motion,
  high-contrast, ARIA/live region, focus-visible, ≥56px, versioned SW, manifest).
- **Schema migration** v1→v2 preserving difficulty + best streak.

## Prioritized requirements for iteration 3 (grouped by dimension)

These are grounded in what I actually observed in the iteration-2 code. Fold them
into `3_specification.md`, carrying forward everything still valid from
`2_input.md` and `2_specification.md`. The theme: **move from "a real app" to "a
product indistinguishable from the paid leaders," and prove the browser-only
promises.**

### Competitive / market attractiveness (biggest lever — raise UI + competitive to 8+)
1. **Upgrade the illustration from geometric to characterful.** The current
   `art.js` word pictures and island/sticker art are simple flat primitives
   (ellipses/rects/paths). Enrich them to look designed: add depth (soft
   gradients/shadows already used for buttons, extend to art), consistent
   outlines, expressive faces on creatures, and small scene context for word
   pictures (e.g. the *pato* on water, the *sol* in a sky). Keep it inline SVG,
   dependency-free, offline — but make it read as a children's-book illustration,
   not a wireframe. This is the single biggest visual gap vs competitors.
2. **Give Lalo more life.** Lalo is well-built but minimal (one body, a few CSS
   keyframes). Add 1–2 more expressive reactions (e.g. a "thinking/listening"
   pose while the mic is live, a bigger milestone celebration pose), blinking,
   and per-screen placement that feels intentional. Still CSS-driven,
   reduced-motion-safe.

### User interface (UI)
3. **Ship the real display font.** The `@font-face` for "Lalo Rounded" currently
   resolves to the fallback stack because no `lalo-rounded.woff2` is bundled.
   Bundle an OFL rounded font (Baloo 2 / Fredoka), subset it, add it to
   `app/fonts/`, and add its path to the `sw.js` shell list so typography is
   intentional and cached offline. This is a known drop-in — do it.
4. **Bundle the raster PWA icons.** `manifest.webmanifest` references
   `icon-192.png` and `icon-512.png` but only the SVGs exist. Rasterize the SVG
   to the two PNG sizes (and a maskable PNG), drop them in `app/icons/`, and add
   them to the SW shell, so install is solid on every installer (not only
   Chromium SVG-`any`).

### Business value & Features (deepen content — raise business value to 9)
5. **Expand the word catalog and add a second word level.** 10 words in one
   "palabras" level is thin. Grow to ~24–30 CV+CV words from the introduced
   consonants and split into two progressive word levels (e.g. palabras 1 / 2),
   each with its own sticker, so the "learn to read words" arc has real depth.
   Keep `words.partsMatchWord` integrity + the introduced-consonants-only rule
   under test.
6. **Add a few CVC / three-syllable stepping stones.** You already have closed
   syllables (`Pan`, `Sol`, `Mar`…). Build a small set of simple whole words
   from them (e.g. 3-syllable `pelota`, `maleta`) as a capstone level so the
   path visibly reaches "real words," not just syllable drills.
7. **Surface mastery to the child, not only the parent.** The dashboard shows
   "mastered X/Y" to adults; give the child a gentle on-map progress cue
   (e.g. an island fills in / gains a star-count as its syllables are mastered)
   so progress is felt in the play surface, not just the gated panel.

### User experience (UX — raise to 8)
8. **Fix the auto-model budget to match the spec intent.** `autoModelRemaining`
   is a single lifetime counter (default 3) decremented on every new item ever.
   Make it "auto-model new/unseen items for the first few of each early session"
   (e.g. reset a small per-session budget, or auto-model the first time each
   specific item is seen) so a returning pre-reader still gets the model when
   they need it. Keep it configurable and still revert to tap-to-hear.
9. **Confirm (and, where thin, strengthen) the voiced experience.** Onboarding
   steps, button hints, and praise should all actually speak in Spanish via
   `audio.model` / `speech.speak`. In code today onboarding only sets text and
   models "Pa" on one step. Ensure every onboarding step is voiced, add the
   "tap-and-hear what this button does" voiced hints promised in F12, and voice
   the varied praise ("¡muy bien!", "¡excelente!").

### Modern design standards & trust (prove the browser-only promises — raise to 9)
10. **Verify speech accuracy in a real browser and tune it.** `speech.classify`
    is well-tested as pure logic, but real child-voice recognition (es-ES,
    5 alternatives, the leniency rules) has **never been run** here. Do an
    in-browser pass on a tablet: confirm matches fire for real kid utterances,
    tune the near/miss thresholds against actual mis-hearings, and document the
    result. The product's core promise ("checks the child actually read it")
    must be demonstrated, not only unit-tested.
11. **Verify PWA install + full offline + offline audio on a tablet.** Install to
    home screen, launch standalone, reload in airplane mode, confirm the shell
    loads and modeling still speaks (TTS offline, or bundled clips once added),
    and confirm a `CACHE_VERSION` bump updates an installed copy cleanly. Report
    what actually happened.
12. **Add at least a starter set of recorded human audio.** TTS alone is the
    single most "cheap" signal vs the paid leaders and is often missing on
    tablets. Bundle short recorded clips for the core syllables and the word
    catalog in `app/audio/`, register them in `audio.CLIPS`, and add them to the
    SW shell. The `model()` clip→TTS fallback is already built — just feed it.
    Even a small warm human-voice set materially lifts UX + competitiveness.

## Carried-forward constraints (still binding)

- **Vanilla HTML5 + CSS3 + JavaScript (ES modules), NO framework, NO bundler, NO
  build step.** All new art stays **inline SVG**; all new features stay
  dependency-free and buildless. (Original brief: "javascript genérico, css y
  html".)
- **Spanish-language, children ~4–7 (often pre-readers), tablet-first**, touch
  targets ≥56px, keyboard-reachable, visible focus.
- **Offline-first, static hosting, no backend, no accounts, no ads, no tracking,
  no external data collection** — all audio/speech processed in-browser; nothing
  leaves the device. (PWA needs HTTPS/localhost for the SW — a hosting note, not
  a new dependency.)
- **Pressure-free**: no fail states, no punishing timers; mismatches stay gentle;
  the daily goal never penalizes a missed day.
- **Core loop remains**: see a syllable → hear it (🔊) → say it (🎤) → clear
  celebration → next. All enhancements wrap this loop; they do not replace it.
- **Keep the always-usable fallback** when `SpeechRecognition`/mic/synthesis is
  unavailable (self-confirm path, TTS fallback, system-font fallback, SVG-icon
  fallback). Never dead-end.
- **Keep honest mastery** (mic-verified vs adult-confirmed separation) and the
  `silabas:v2` schema with v1 migration.
- **Keep the pure-logic Node `--test` suite green** (currently 53/53) and extend
  it to cover any new content (expanded words, new levels, auto-model session
  logic).

## Original idea (verbatim, for full context)

> Crea un single web page application que use javascript genérico, css y html, que
> sirva para aprender a leer, el publico objetivo es niños que están aprendiendo
> el espanól y aprendiendo a leer, por lo que el objetivo es que visualicen
> silabas como por ejemplo "Pa", "Se", "Te", etc, y el niño tiene que repetir la
> silaba adecuadamente, si así lo hace, entonces hay unos efectos claros de
> celebración y éxito y el sistema sigue con la siguiente silaba generada
> aleatoriamente.
