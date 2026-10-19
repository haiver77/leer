VERDICT: NEEDS_WORK
OVERALL: 5.2

# 2 — Customer Review & Requirements: Syllable Reading Game ("Sílabas")

I reviewed the actual build — not the promises. The spec (`1_specification.md`),
the plan (`1_plan.md`), and the real code under `app/` (`index.html`,
`css/styles.css`, `js/syllables.js`, `js/speech.js`, `js/celebrate.js`,
`js/game.js`, `js/main.js`, `js/logic.test.js`) were all inspected. The 10 pure
logic unit tests pass (`node --test app/js/logic.test.js` → 10/10).

As a demanding customer buying a reading product for my 5-year-old, this is a
clean, honest **prototype of a single drill** — not a product I would choose over
Lingokids, Khan Academy Kids, ABC Kids, or Leo con Grin. It does the one loop it
promises, and the engineering is tidy (graceful speech fallback, reduced-motion
support, ARIA labels, ≥56px targets, no-repeat randomization). But it stops at
the minimum: no onboarding, no progression, no real reward system, no character,
thin content, and a speech-check that a self-confirm button lets anyone bypass.
It does not pass the quality gate.

## Scoring

| Dimension                     | Score (1-10) | Justification                 |
| ----------------------------- | ------------ | ----------------------------- |
| Business value                | 6            | Solves a real need (low-friction Spanish syllable practice) and is genuinely free/offline/private with no accounts — good. But value is capped: it only drills isolated CV syllables with no path toward actual reading (words, sentences), no progress persistence beyond a best-streak number, and nothing for the parent/teacher who decides whether to keep using it. It's a nice toy, not yet a learning product someone would rely on or recommend. |
| Features / functionality      | 5            | Core loop works and the fallbacks are thoughtful (self-confirm when mic denied, TTS model button, skip, difficulty toggle). But the feature set is bare: no onboarding/tutorial, no levels or progression, no rewards/collectibles, no words after syllables, no syllable→image association, no closed syllables/digraphs (ch, ll, rr), content is only 25 (fácil) / 55 (normal) items. Crucially the "¡Lo dije! ✅" button and the loose matcher mean success is trivially gamed, so the central promise — *checking* the child actually read it — is weak and unproven for children's voices. |
| User experience (UX)          | 5            | For a 4-7 year old the flow has real friction: the child is dropped onto a syllable with zero demo of what to do or what the buttons mean (icons + Spanish text a pre-reader can't read). Four similar buttons compete for attention. There is no "great job, here's your reward" arc, no sense of moving forward, no reason to come back tomorrow. Reduced-motion and keyboard support are nice, but the experience is designed for an adult who already understands it, not an independent small child. |
| User interface (UI)           | 5            | Clean, consistent, high-contrast, large type, decent palette — competent but generic. It looks like a well-made CSS demo, not a kids' app: no illustrations, no mascot, no scene/background art, flat emoji as the only imagery, a plain white square for the syllable. Nothing memorable or delightful. The "Baloo 2" font is referenced but not actually loaded (no @font-face / web-font link), so most devices fall back to Comic Sans/system fonts. |
| Modern design standards       | 6            | Good hygiene: responsive (portrait/landscape/phone), `dvh` units, `prefers-reduced-motion`, `prefers-contrast`, ARIA labels, live region, focus-visible rings, no framework bloat. But it misses modern app-standard expectations for this category: not installable (no PWA manifest / service worker / offline caching / app icon), no real font loading, no analytics-free telemetry of learning for the parent, and accessibility is spot-level rather than audited (icon-only meaning, color+emoji feedback that a pre-reader still can't parse). |
| Competitive / attractiveness  | 4            | Head-to-head with Lingokids, Khan Academy Kids, ABC Kids, Leo con Grin or Pleasant/Monster-style phonics apps, this would not get picked. Those have characters, stories, worlds, rewards, voice modeling, and polished art. Here there is no hook, no personality, no reason to choose it beyond "free and offline." A parent browsing for 30 seconds sees a plain blue screen with a letter pair and moves on. |
| **Overall (average)**         | **5.2**      | (6 + 5 + 5 + 5 + 6 + 4) / 6 = 5.17 → **5.2**. Below the gate (needs Overall ≥ 8.0 AND every dimension ≥ 7). Continue the loop. |

## What's already good (keep it — do not regress)

- Dependency-free vanilla HTML/CSS/JS, no build step, truly static and offline-first.
- Graceful speech degradation: TTS model button, mic-denied → self-confirm, never dead-ends (AC6).
- `prefers-reduced-motion` + `prefers-contrast` honored; ARIA labels, live-region feedback, focus-visible; ≥56px tap targets.
- No-immediate-repeat randomization; accent/punctuation-insensitive matching; 10 passing pure logic tests.
- localStorage persistence of difficulty + best streak.
- Kid-friendly palette, large centered syllable, confetti + Web Audio chime + haptics on success.

## Prioritized requirements for iteration 2 (grouped by dimension)

These are the gaps I actually observed. Treat them as new/updated requirements the
Architect must fold into `2_specification.md`, carrying forward everything still
valid from `1_input.md` and `1_specification.md`.

### Business value (lift toward a real learning product)
1. **Progress that persists and means something.** Track per-syllable mastery
   (seen / attempted / correct) in localStorage, not just a best-streak integer.
   Show a simple "you've mastered 12 of 25 sílabas" indicator.
2. **A learning arc toward actual reading.** Add a staged path: syllables →
   two-syllable words (e.g. "pa"+"to" → "pato") → short words with a picture.
   Reading isolated syllables forever has limited educational payoff.
3. **Parent/Teacher dashboard (lightweight, no account).** A gated (e.g. hold-to-
   open or simple math gate) panel showing per-session stats: time practiced,
   syllables mastered, trouble syllables, current streak/best. This is what makes
   an adult keep and recommend the app.

### Features / functionality
4. **Onboarding / tutorial.** A first-run 2-3 step animated demo (voiced in
   Spanish) showing: this is your syllable → tap 🔊 to hear it → tap 🎤 and say it.
   Auto-play the model pronunciation on each new syllable the first few times.
5. **Progression & levels / world map.** Replace the infinite flat random drill
   with a visible progress map of levels/islands the child unlocks (e.g. "Isla de
   la P", then mixed, then words). Give goals and a sense of advancement.
6. **Reward system beyond a streak number.** Collectible stars/stickers/badges,
   an unlockable element per level, celebratory milestones (every 5 correct), and
   a "sticker book" the child can revisit. Kids need visible, accumulating rewards.
7. **Expand & structure content.** Add closed syllables and digraphs (ch, ll, rr,
   ñ-syllables like "ña/ñe", que/qui, gue/gui) as later levels; add a words mode
   (CV+CV words) with matching pictures. Current 25/55 items is too thin.
8. **Visual syllable→image association.** Pair syllables/words with a clear
   illustration (e.g. "Pa" → picture of "pato" cue, "Ma" → "mamá") so meaning and
   sound connect — a pre-reader can't rely on text alone.
9. **Make the speech check trustworthy (or honest about itself).** The loose
   matcher + always-available self-confirm means "success" can be noise or a tap.
   Options: require the mic path to actually match before awarding a star (reserve
   self-confirm for the adult/no-mic case and visually separate it), tune
   recognition for children (multiple alternatives already captured — add
   phonetic leniency and a short retry), and show a gentle "casi… escucha otra
   vez" when close. At minimum, make clear which successes were voice-verified.

### User experience (UX)
10. **Design for an independent pre-reader.** Icons alone aren't enough and the
    Spanish button labels can't be read by the target child — add voiced button
    hints (tap-and-hear) and an always-available "listen to the syllable" that
    fires automatically on new syllables early on.
11. **Reduce button clutter.** Four competing buttons is a lot for a 5-year-old.
    Lead with one obvious primary action (the mic / big friendly character), and
    tuck secondary controls (skip, home, difficulty) into smaller, consistent spots.
12. **Session shape & "come back" loop.** Add a short celebratory end-of-level
    summary ("¡Ganaste 5 estrellas!") and a gentle daily goal so there's a reason
    to return. No timers, no fail states — keep it pressure-free.

### User interface (UI)
13. **Give it a face: a mascot/character.** A friendly animal/robot that reacts
    (cheers on success, encourages on retry, models the mouth/sound). This is the
    single biggest driver of attachment for ages 4-7 and is completely absent.
14. **Real illustration & scene art, not just emoji.** Add simple, consistent
    vector illustrations (inline SVG so it stays dependency-free and offline):
    backgrounds, the syllable card as an object, reward stickers, level map art.
15. **Actually load the display font.** `Baloo 2` is referenced but never loaded;
    add a bundled/`@font-face` rounded kid font (or self-hosted) so typography is
    intentional on every device instead of falling back to Comic Sans.

### Modern design standards
16. **Make it an installable PWA.** Add a `manifest.webmanifest` (name, icons,
    theme, display standalone, portrait), a service worker that caches the app
    shell for true offline, and app icons. Tablet users should be able to "Add to
    Home Screen" and run it like an app — table stakes for this category.
17. **Preload/own the audio.** Don't rely solely on an OS `es` TTS voice (often
    missing on tablets). Bundle short recorded syllable audio (or synthesize once
    and cache) so modeling always works offline, with TTS as fallback.
18. **Tighten accessibility to product grade.** Ensure every success/retry signal
    is conveyed by sound + animation + icon in a way a non-reader perceives;
    verify large-text and contrast in both themes; keep keyboard paths. Consider a
    very-young-child mode that removes text entirely.

### Competitive / market attractiveness
19. **Create a hook and identity.** Name + mascot + a tiny bit of story/world so
    it's memorable. Right now it's indistinguishable from a tech demo.
20. **Match category polish.** Benchmark against Lingokids / Khan Academy Kids /
    ABC Kids / Leo con Grin: characters, worlds, rewards, voice modeling, art. The
    bar for a parent to choose this is "feels like a real kids' app in 30 seconds."
21. **Add light delight.** Playful transitions between syllables, mascot reactions,
    varied celebration moments, and encouraging voiced praise — within the existing
    dependency-free, reduced-motion-respecting constraints.

## Carried-forward constraints (still binding)

- **Vanilla HTML5 + CSS3 + JavaScript (ES modules), NO framework** — the original
  brief requires "javascript genérico, css y html". New art must be inline SVG;
  new features must stay dependency-free and buildless.
- **Spanish-language, children ~4-7, tablet-first**, touch targets ≥48px (currently 56px).
- **Offline-first, static hosting, no backend, no accounts, no ads, no tracking,
  no external data collection** — all audio/speech processed in-browser.
- **Pressure-free**: no fail states, no punishing timers; mismatches stay gentle.
- **Core loop remains**: see a syllable → hear it (🔊) → say it (🎤) → celebration →
  next. Enhancements wrap around this loop; they do not replace it.
- **Keep the always-usable fallback** when `SpeechRecognition`/mic is unavailable.

## Original idea (verbatim, for full context)

> Crea un single web page application que use javascript genérico, css y html, que
> sirva para aprender a leer, el publico objetivo es niños que están aprendiendo
> el espanól y aprendiendo a leer, por lo que el objetivo es que visualicen
> silabas como por ejemplo "Pa", "Se", "Te", etc, y el niño tiene que repetir la
> silaba adecuadamente, si así lo hace, entonces hay unos efectos claros de
> celebración y éxito y el sistema sigue con la siguiente silaba generada
> aleatoriamente.
