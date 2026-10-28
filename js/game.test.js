// game.test.js — state-machine checks for iteration-6 auto-read (D4 / AC-J4)
// and the removal of the standing "Di la palabra" prompt (D6 / AC-J6).
//
// These run in plain Node: progress.js falls back to an in-memory state when
// localStorage is absent, and speech.speak / audio.model resolve to no-ops when
// the Web Speech / Audio APIs are unavailable, so createGame is safe here. We
// observe behavior through the public handler surface:
//   - each new word fires exactly one onMascot("model") (paired 1:1 with the
//     audio.model auto-read inside nextItem), and
//   - onFeedback is never asked to show a standing "Di la palabra" instruction.

import { test } from "node:test";
import assert from "node:assert/strict";

import { createGame } from "./game.js";

/** Build a game with recording handlers. */
function makeGame() {
  const events = { mascot: [], feedback: [], renders: 0 };
  const game = createGame({
    onRender: () => {
      events.renders += 1;
    },
    onFeedback: (msg, kind) => {
      events.feedback.push({ msg, kind });
    },
    onMascot: (state) => {
      events.mascot.push(state);
    },
  });
  return { game, events };
}

const modelCount = (events) => events.mascot.filter((s) => s === "model").length;
const feedbackText = (events) => events.feedback.map((f) => f.msg).join(" | ");

test("AC-J4.4: opening a level auto-reads the first word exactly once", () => {
  const { game, events } = makeGame();
  const firstLevel = game.view().map[0].id;

  game.openLevel(firstLevel);

  assert.equal(game.state.phase, "play", "we are on the play screen");
  assert.ok(game.state.current, "a word is presented");
  assert.equal(
    modelCount(events),
    1,
    "exactly one model (auto-read) fired for the first word"
  );
});

test("AC-J4.1/J4.4: each new word (skip/ArrowRight) auto-reads exactly once more", () => {
  const { game, events } = makeGame();
  const firstLevel = game.view().map[0].id;

  game.openLevel(firstLevel);
  const afterOpen = modelCount(events);
  assert.equal(afterOpen, 1);

  game.skip(); // left-swipe / ArrowRight path → next word
  assert.equal(modelCount(events), 2, "a second auto-read fired on the next word");

  game.skip();
  assert.equal(modelCount(events), 3, "a third auto-read fired on the next word");
});

test("AC-J6.2: no standing 'Di la palabra' prompt is ever emitted as feedback", () => {
  const { game, events } = makeGame();
  const firstLevel = game.view().map[0].id;

  game.openLevel(firstLevel);
  game.skip();
  game.skip();

  const text = feedbackText(events);
  assert.ok(
    !/di la palabra/i.test(text),
    `feedback must not contain a standing "Di la palabra" prompt (saw: "${text}")`
  );
});

test("auto-read sets the mascot to the 'model' state (AC-J4.4)", () => {
  const { game, events } = makeGame();
  const firstLevel = game.view().map[0].id;
  game.openLevel(firstLevel);
  assert.ok(events.mascot.includes("model"), "mascot entered the model state while reading");
});
