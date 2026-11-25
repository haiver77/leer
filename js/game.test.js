// game.test.js — state-machine checks for the auto-read loop (iteration 6 D4 /
// iteration 7 D7), the success micro-loop (AC-K6), the configurable auto-read
// toggle (AC-K7), and the removal of the standing "Di la palabra" prompt
// (AC-J6, carried forward).
//
// These run in plain Node: progress.js falls back to an in-memory state when
// localStorage is absent, and speech.speak / audio.model resolve to no-ops when
// the Web Speech / Audio APIs are unavailable, so createGame is safe here. We
// observe behavior through the public handler surface:
//   - each new word fires exactly one onMascot("model") (paired 1:1 with the
//     audio.model auto-read inside nextItem) WHEN auto-read is on, and
//   - onFeedback is never asked to show a standing "Di la palabra" instruction.

import { test, mock } from "node:test";
import assert from "node:assert/strict";

import { createGame } from "./game.js";

/** Build a game with recording handlers. */
function makeGame() {
  const events = { mascot: [], feedback: [], renders: 0, pops: 0, reactions: [] };
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
    onSuccessPop: () => {
      events.pops += 1;
    },
    onReaction: (kind) => {
      events.reactions.push(kind);
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

// ---- AC-K7: configurable auto-read ----------------------------------------

test("AC-K7.3: auto-read OFF fires zero model/auto-read per new word", () => {
  const { game, events } = makeGame();
  const firstLevel = game.view().map[0].id;

  game.setAutoRead(false); // turn the on-display read OFF
  events.mascot.length = 0; // ignore any model from before the toggle

  game.openLevel(firstLevel);
  assert.equal(modelCount(events), 0, "no auto-read on the first word when OFF");

  game.skip();
  game.skip();
  assert.equal(modelCount(events), 0, "no auto-read on subsequent words when OFF");
  assert.ok(game.state.current, "a word is still presented (child can tap to hear)");
});

test("AC-K7.3/K7.4: toggling auto-read ON again restores one read per new word", () => {
  const { game, events } = makeGame();
  const firstLevel = game.view().map[0].id;

  game.setAutoRead(false);
  game.openLevel(firstLevel);
  events.mascot.length = 0;

  game.setAutoRead(true); // back ON, effective immediately for the next word
  game.skip();
  assert.equal(modelCount(events), 1, "the next word reads once after re-enabling");
});

// ---- AC-K6: success micro-loop (advance once + read once) ------------------

test("AC-K6.4: a non-final success advances once and reads the next word once", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const { game, events } = makeGame();
    const firstLevel = game.view().map[0].id;

    game.openLevel(firstLevel); // first word read (model #1)
    assert.equal(modelCount(events), 1);
    const renBefore = events.renders;

    game.confirmSaid(); // self-confirm a correct answer (non-final)
    assert.equal(game.state.levelCorrect, 1, "one correct recorded");
    // No advance yet — it is scheduled after ADVANCE_DELAY_MS.
    assert.equal(modelCount(events), 1, "no new-word read before the delay elapses");

    mock.timers.tick(1200); // ADVANCE_DELAY_MS

    assert.equal(game.state.phase, "play", "still playing (not complete)");
    assert.equal(
      modelCount(events),
      2,
      "exactly one more read fired for the advanced-to word"
    );
    assert.ok(events.renders > renBefore, "the advance re-rendered");
  } finally {
    mock.timers.reset();
  }
});

test("AC-K6.3: the 10th correct answer completes the level with no stray read", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const { game, events } = makeGame();
    const firstLevel = game.view().map[0].id;
    const goal = game.view().map[0].goal;
    assert.equal(goal, 10, "the level goal is 10 (AC-K1)");

    game.openLevel(firstLevel); // first word read (model #1)
    const readsAfterOpen = modelCount(events);

    // Answer the first 9 correctly, each advancing + reading the next word.
    for (let i = 0; i < 9; i++) {
      game.confirmSaid();
      mock.timers.tick(1200);
      assert.equal(game.state.phase, "play", `still playing after ${i + 1} correct`);
    }
    // 9 advances → 9 extra reads on top of the first word.
    const readsBefore10th = modelCount(events);
    assert.equal(readsBefore10th, readsAfterOpen + 9);

    // The 10th correct answer should complete the level (no advance, no read).
    game.confirmSaid();
    assert.equal(game.state.levelCorrect, 10, "10 correct recorded");
    mock.timers.tick(1200); // the scheduled callback runs completeLevel()

    assert.equal(game.state.phase, "summary", "level completed → summary");
    assert.equal(
      modelCount(events),
      readsBefore10th,
      "no stray auto-read fired after the final correct answer (AC-K6.3)"
    );
  } finally {
    mock.timers.reset();
  }
});

// ===========================================================================
// Iteration 9 — reactions (D2), mode variety (D3), music (D8), customization (D1)
// ===========================================================================

test("AC-M2.3: presenting a new word requests exactly one surprise reaction", () => {
  const { game, events } = makeGame();
  const firstLevel = game.view().map[0].id;

  game.openLevel(firstLevel);
  assert.equal(
    events.reactions.filter((r) => r === "surprise").length,
    1,
    "one surprise on the first word"
  );
  // ...and no extra reads/listens were added by the reaction (AC-L2 unchanged):
  // the first word still auto-reads exactly once.
  assert.equal(modelCount(events), 1, "still exactly one model (auto-read) for the first word");

  game.skip(); // next word
  assert.equal(
    events.reactions.filter((r) => r === "surprise").length,
    2,
    "a second surprise on the next word"
  );
});

test("only the read-and-say repetition mode remains on every word", () => {
  const { game } = makeGame();
  const firstLevel = game.view().map[0].id;

  game.openLevel(firstLevel);
  for (let i = 0; i < 5; i++) {
    assert.equal(game.view().activeMode, "say-it", `word ${i} is say-it`);
    assert.equal(game.view().modeOptions, null, `word ${i} exposes no tap options`);
    game.skip();
  }
});

test("the removed tap-mode API (answerOption) is no longer exposed", () => {
  const { game } = makeGame();
  assert.equal(typeof game.answerOption, "undefined", "answerOption is gone");
});

test("AC-M8.1: setMusicEnabled coerces, persists, and is reflected", () => {
  const { game } = makeGame();
  assert.equal(game.view().music, false, "music is OFF by default");
  game.setMusicEnabled(true);
  assert.equal(game.view().music, true, "music turned on");
  assert.equal(game.dashboardStats().music, true, "dashboard reflects music on");
  game.setMusicEnabled(0); // coerced to false
  assert.equal(game.view().music, false, "music turned off (coerced)");
});

test("AC-M1.5: setLaloCustomization sanitizes locked items + persists the clean selection", () => {
  const { game } = makeGame();
  // try to equip a locked color (grape needs 25 stars) at first run
  game.setLaloCustomization({ color: "grape", accessories: ["glasses"] });
  const sel = game.view().lalo;
  assert.notEqual(sel.color, "grape", "locked color was dropped");
  assert.ok(!sel.accessories.includes("glasses"), "locked accessory dropped");
  assert.equal(typeof sel.color, "string");
});

// ===========================================================================
// Motivación durante la práctica: elogio adaptativo, combo, "juntos", barra
// de progreso y voz opcional de elogios.
// ===========================================================================

/** Game with recognition forced ON (Node's speech.listen resolves a miss). */
const micGames = [];
/** Leave play on every mic game so no pending auto-listen keeps re-arming. */
function stopMicGames() {
  while (micGames.length) micGames.pop().goMap();
}

function makeMicGame() {
  const events = { mascot: [], feedback: [], renders: 0 };
  const game = createGame(
    {
      onRender: () => {
        events.renders += 1;
      },
      onFeedback: (msg, kind) => events.feedback.push({ msg, kind }),
      onMascot: (s) => events.mascot.push(s),
    },
    { recognitionSupported: true }
  );
  micGames.push(game);
  return { game, events };
}

const lastFeedback = (events) => events.feedback[events.feedback.length - 1];

test("first-try success shows a praise phrase (never the old fixed text only) and counts a combo", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const { game, events } = makeGame();
    game.openLevel(game.view().map[0].id);
    game.confirmSaid();
    assert.equal(lastFeedback(events).kind, "success");
    assert.ok(lastFeedback(events).msg.length > 0);
    assert.equal(game.view().combo, 1);
    assert.equal(game.view().comboTier, 0);
  } finally {
    stopMicGames();
    mock.timers.reset();
  }
});

test("combo grows with consecutive successes and reaches tier 1 at 3", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const { game } = makeGame();
    game.openLevel(game.view().map[0].id);
    for (let i = 0; i < 3; i += 1) {
      game.confirmSaid();
      mock.timers.tick(1200);
    }
    assert.equal(game.view().combo, 3);
    assert.equal(game.view().comboTier, 1);
  } finally {
    stopMicGames();
    mock.timers.reset();
  }
});

test("a miss gently breaks the combo, never the lifetime streak, and re-listens", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const { game, events } = makeMicGame();
    game.openLevel(game.view().map[0].id);
    game.confirmSaid();
    mock.timers.tick(1200);
    const streakBefore = game.state.progress.streak;
    assert.equal(game.view().combo, 1);

    await game.listenAttempt(); // Node: resolves a miss
    assert.equal(game.view().combo, 0, "combo reset on a miss");
    assert.equal(game.state.progress.streak, streakBefore, "lifetime streak untouched");
    assert.equal(lastFeedback(events).kind, "retry");
    assert.equal(game.state.missesOnCurrent, 1);
  } finally {
    stopMicGames(); // cancel pending auto-listen so no real timer loops on
    mock.timers.reset();
  }
});

test("after 2 misses Lalo models the word and says 'juntos'; a later success is 'recovered'", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const { game, events } = makeMicGame();
    game.openLevel(game.view().map[0].id);
    events.mascot.length = 0;

    await game.listenAttempt();
    await game.listenAttempt();
    assert.equal(game.state.missesOnCurrent, 2);
    assert.ok(/junt/i.test(lastFeedback(events).msg), `got: ${lastFeedback(events).msg}`);
    assert.ok(events.mascot.includes("model"), "Lalo modeled the word");

    game.confirmSaid();
    assert.equal(lastFeedback(events).kind, "success");
    const recoveredPhrases = [
      "¡Lo lograste! 💪",
      "¡Seguiste y lo lograste! 🌟",
      `¡${game.state.current}! ¡Eres valiente! 💪`,
      "¡Ahora sí! 🎉",
      "¡Qué bien insistes! 👏",
    ];
    assert.ok(
      recoveredPhrases.includes(lastFeedback(events).msg) ||
        /Racha de/.test(lastFeedback(events).msg),
      `unexpected praise: ${lastFeedback(events).msg}`
    );
  } finally {
    stopMicGames();
    mock.timers.reset();
  }
});

test("repeated misses never master a word (mastery needs verified successes)", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const { game } = makeMicGame();
    game.openLevel(game.view().map[0].id);
    const id = game.state.current;
    await game.listenAttempt();
    await game.listenAttempt();
    await game.listenAttempt();
    game.confirmSaid(); // unverified
    const rec = game.state.progress.items[id];
    assert.equal(rec.verifiedCorrect, 0);
    assert.equal(rec.mastered, false);
  } finally {
    stopMicGames();
    mock.timers.reset();
  }
});

test("a word that just reached mastery gets the 'mastered' praise", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const { game, events } = makeGame();
    game.openLevel(game.view().map[0].id);
    const id = game.state.current;
    game.state.progress.items[id].verifiedCorrect = 3; // threshold reached
    game.state.progress.items[id].mastered = false; // ...but not flipped yet
    game.confirmSaid();
    assert.equal(game.state.progress.items[id].mastered, true);
    const mastered = [
      "¡Ya la dominas! 🏆",
      `¡${id} es tuya! 🏆`,
      "¡Palabra dominada! 🌟",
      "¡Eres un campeón! 🏆",
    ];
    // day-streak text may take priority only when the daily goal is hit now.
    assert.ok(
      mastered.includes(lastFeedback(events).msg) || /Racha de/.test(lastFeedback(events).msg),
      `got: ${lastFeedback(events).msg}`
    );
  } finally {
    stopMicGames();
    mock.timers.reset();
  }
});

test("progress bar data: levelGoal dots, levelCorrect filled, reset on a new level", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const { game } = makeGame();
    game.setWordsPerLevel(5);
    const first = game.view().map[0].id;
    game.openLevel(first);
    assert.equal(game.view().levelGoal, 5);
    assert.equal(game.view().levelCorrect, 0);
    game.confirmSaid();
    mock.timers.tick(1200);
    assert.equal(game.view().levelCorrect, 1);
    game.setWordsPerLevel(12);
    game.openLevel(first);
    assert.equal(game.view().levelGoal, 12);
    assert.equal(game.view().levelCorrect, 0);
    assert.equal(game.view().combo, 0, "combo resets with the level");
  } finally {
    stopMicGames();
    mock.timers.reset();
  }
});

test("praiseVoice is OFF by default and toggles via setPraiseVoice", () => {
  const { game } = makeGame();
  assert.equal(game.dashboardStats().praiseVoice, false);
  game.setPraiseVoice(true);
  assert.equal(game.dashboardStats().praiseVoice, true);
  game.setPraiseVoice(0);
  assert.equal(game.dashboardStats().praiseVoice, false);
});

test("voice OFF: success advances on the normal timer (nothing is spoken/awaited)", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const { game } = makeGame();
    game.openLevel(game.view().map[0].id);
    const before = game.state.current;
    game.confirmSaid();
    mock.timers.tick(1200);
    assert.notEqual(game.state.current, before, "advanced to a new word");
  } finally {
    stopMicGames();
    mock.timers.reset();
  }
});

test("voice ON without TTS available: still advances (no hang) after the praise resolves", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const { game } = makeGame();
    game.setPraiseVoice(true);
    game.openLevel(game.view().map[0].id);
    const before = game.state.current;
    game.confirmSaid();
    mock.timers.tick(1200);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    assert.notEqual(game.state.current, before, "advanced after the (no-op) praise");
  } finally {
    stopMicGames();
    mock.timers.reset();
  }
});

test("voice ON: leaving the level while praise is pending never advances a stale screen", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const { game } = makeGame();
    game.setPraiseVoice(true);
    game.openLevel(game.view().map[0].id);
    game.confirmSaid();
    game.goMap(); // navigate away before the advance fires
    mock.timers.tick(1200);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(game.state.phase, "map", "still on the map");
  } finally {
    stopMicGames();
    mock.timers.reset();
  }
});

test("gardenState exposes an ordered, flagged garden for the current progress", () => {
  const { game } = makeGame();
  const g = game.gardenState();
  assert.ok(Array.isArray(g) && g.length > 0);
  assert.equal(typeof g[0].unlocked, "boolean");
  assert.equal(typeof g[0].artId, "string");
});
