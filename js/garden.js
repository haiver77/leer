// garden.js — "Jardín de Lalo": a persistent, growing collection the child
// fills by earning stars / stickers / completed levels (iteration 9, D4 /
// AC-M4). Pure + testable: a catalog (element id → inline-SVG artId + an unlock
// rule anchored to existing progress signals) and a pure derivation of which
// elements are unlocked for a given state. No DOM, no storage.
//
// Elements are anchored to STAR MILESTONES (which keep accruing via total
// stars) and to LEVEL completion / STICKER counts, so there is always something
// left to earn even after the whole map is complete (AC-M4.3): replaying levels
// still accrues stars that unlock the remaining star-anchored elements.

import { MILESTONE_EVERY } from "./rewards.js";

/**
 * Ordered garden catalog. `unlock` specs:
 *   { base:true }            always present (the modest first-run base)
 *   { stars:N }              total stars >= N
 *   { level:"id" }           that level is completed
 *   { stickers:N }           at least N stickers earned
 * Order is "grows from base → bigger rewards"; the derived list preserves it.
 * @type {Array<{id:string,artId:string,label:string,unlock:object}>}
 */
export const GARDEN_CATALOG = [
  // base — a modest garden from the very first run (AC-M4.4)
  { id: "sprout", artId: "garden-sprout", label: "Brote", unlock: { base: true } },
  { id: "bush", artId: "garden-bush", label: "Arbusto", unlock: { base: true } },
  // star milestones (MILESTONE_EVERY = 5): keep accruing forever (AC-M4.3)
  { id: "flower-red", artId: "garden-flower-red", label: "Flor roja", unlock: { stars: MILESTONE_EVERY * 1 } },
  { id: "flower-blue", artId: "garden-flower-blue", label: "Flor azul", unlock: { stars: MILESTONE_EVERY * 2 } },
  { id: "mushroom", artId: "garden-mushroom", label: "Seta", unlock: { stars: MILESTONE_EVERY * 4 } },
  { id: "butterfly", artId: "garden-butterfly", label: "Mariposa", unlock: { stars: MILESTONE_EVERY * 6 } },
  { id: "tree", artId: "garden-tree", label: "Árbol", unlock: { stars: MILESTONE_EVERY * 9 } },
  { id: "pond", artId: "garden-pond", label: "Estanque", unlock: { stars: MILESTONE_EVERY * 12 } },
  { id: "sun", artId: "garden-sun", label: "Sol", unlock: { stars: MILESTONE_EVERY * 16 } },
  { id: "rainbow", artId: "garden-rainbow", label: "Arcoíris", unlock: { stars: MILESTONE_EVERY * 20 } },
  // level completion
  { id: "star", artId: "garden-star", label: "Estrella", unlock: { level: "pal-2-abiertas-1" } },
  // sticker count (the big finale)
  { id: "trophy", artId: "garden-trophy", label: "Trofeo", unlock: { stickers: 8 } },
];

/**
 * Whether one element's unlock spec is satisfied by progress. Pure.
 * @param {object} progress
 * @param {object} unlock
 * @returns {boolean}
 */
function unlockMatches(progress, unlock) {
  if (!unlock) return false;
  if (unlock.base) return true;
  if (typeof unlock.stars === "number") {
    if (Number((progress && progress.stars) || 0) >= unlock.stars) return true;
  }
  if (typeof unlock.level === "string") {
    const lv = progress && progress.levels && progress.levels[unlock.level];
    if (lv && lv.completed) return true;
  }
  if (typeof unlock.stickers === "number") {
    const n = Array.isArray(progress && progress.stickers)
      ? progress.stickers.length
      : 0;
    if (n >= unlock.stickers) return true;
  }
  return false;
}

/**
 * Derive the ordered garden state for a progress object. Every catalog element
 * is returned (in catalog order) with an `unlocked` flag. Pure + stable:
 * already-unlocked elements stay unlocked as progress only grows (AC-M4.2/4.4).
 * @param {object} progress
 * @returns {Array<{id:string, artId:string, label:string, unlocked:boolean}>}
 */
export function gardenState(progress) {
  return GARDEN_CATALOG.map((e) => ({
    id: e.id,
    artId: e.artId,
    label: e.label,
    unlocked: unlockMatches(progress, e.unlock),
  }));
}

/**
 * Count unlocked garden elements for a progress state. Pure.
 * @param {object} progress
 * @returns {number}
 */
export function unlockedCount(progress) {
  return GARDEN_CATALOG.reduce(
    (n, e) => n + (unlockMatches(progress, e.unlock) ? 1 : 0),
    0
  );
}

/** Total number of garden elements in the catalog. */
export function totalCount() {
  return GARDEN_CATALOG.length;
}
