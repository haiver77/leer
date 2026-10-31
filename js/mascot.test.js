// mascot.test.js — pure-markup checks for Lalo's customizable SVG (iteration 9,
// D1). The DOM-dependent mount/setState/surprise/sleep paths are browser-only;
// here we cover the pure markup(options) builder and the STATES set.

import { test } from "node:test";
import assert from "node:assert/strict";

import { STATES, markup } from "./mascot.js";
import { COLORS, ACCESSORIES, defaultSelection } from "./customize.js";

test("STATES still includes the original four reactions", () => {
  for (const s of ["idle", "cheer", "encourage", "model"]) {
    assert.ok(STATES.includes(s), `STATES includes ${s}`);
  }
});

test("markup() is deterministic for a given selection", () => {
  const sel = { color: "mint", accessories: ["bow", "hat"] };
  assert.equal(markup(sel), markup(sel));
});

test("markup() uses the same viewBox (0 0 120 120) regardless of options", () => {
  assert.ok(markup(defaultSelection()).includes('viewBox="0 0 120 120"'));
  assert.ok(markup({ color: "rose", accessories: ["crown"] }).includes('viewBox="0 0 120 120"'));
});

test("AC-M1.2: the chosen color's fill + stroke appear in the body markup", () => {
  const sun = COLORS.find((c) => c.id === "sun");
  const svg = markup({ color: "sun", accessories: [] });
  assert.ok(svg.includes(sun.fill), "body fill applied");
  assert.ok(svg.includes(sun.stroke), "body stroke applied");
});

test("AC-M1.2: equipped accessory layers are included", () => {
  const hat = ACCESSORIES.find((a) => a.id === "hat");
  const svg = markup({ color: "sky", accessories: ["hat"] });
  assert.ok(svg.includes("lalo-acc-hat"), "hat accessory layer rendered");
  assert.ok(svg.includes(hat.markup), "exact hat markup present");
});

test("unknown color falls back to default; unknown accessories are ignored", () => {
  const def = defaultSelection();
  const defColor = COLORS.find((c) => c.id === def.color);
  const svg = markup({ color: "nope", accessories: ["ghost", "bow"] });
  assert.ok(svg.includes(defColor.fill), "falls back to the default color fill");
  assert.ok(svg.includes("lalo-acc-bow"), "the known accessory still renders");
  assert.ok(!svg.includes("ghost"), "the unknown accessory id is absent");
});

test("no accessories → no accessory layers", () => {
  const svg = markup({ color: "sky", accessories: [] });
  assert.ok(!svg.includes("lalo-acc"), "no accessory layer markup when none equipped");
});
