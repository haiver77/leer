// customize.js — Lalo's customization catalog + pure unlock rules (iteration 9,
// D1 / AC-M1). No DOM, no storage: catalog data + pure functions over a plain
// progress state object, so everything here is unit-testable under Node.
//
// Colors parameterize Lalo's body fill/stroke; accessories are inline-SVG
// snippets drawn OVER the existing mascot viewBox (0 0 120 120) in mascot.js.
// Items unlock from existing progress signals (total stars crossing milestones,
// and completed levels), with a base set unlocked from first run so the armario
// is never empty (AC-M1.3).

/**
 * Body color palettes. `id` is the stable persisted value. `fill` is the body
 * rectangle fill; `stroke` its outline; `label` is a short child-friendly name.
 * `unlock` is a predicate spec consumed by isUnlocked (see unlockMatches).
 * @type {Array<{id:string,label:string,fill:string,stroke:string,unlock:object}>}
 */
export const COLORS = [
  // base set (unlocked from first run)
  { id: "sky", label: "Celeste", fill: "#4cc9f0", stroke: "#2f9fd0", unlock: { base: true } },
  { id: "mint", label: "Menta", fill: "#52d9a3", stroke: "#2fa878", unlock: { base: true } },
  { id: "sun", label: "Sol", fill: "#ffd166", stroke: "#e0a81f", unlock: { base: true } },
  // unlocked by stars
  { id: "rose", label: "Rosa", fill: "#ff8fab", stroke: "#e85d84", unlock: { stars: 10 } },
  { id: "grape", label: "Uva", fill: "#b892ff", stroke: "#8a5cf0", unlock: { stars: 25 } },
  { id: "coral", label: "Coral", fill: "#ff8c5a", stroke: "#e0632b", unlock: { stars: 50 } },
  // unlocked by a completed level
  { id: "lime", label: "Lima", fill: "#c7e94c", stroke: "#8fb400", unlock: { level: "pal-2-abiertas-2" } },
  { id: "aqua", label: "Agua", fill: "#38e0d0", stroke: "#12a99b", unlock: { stars: 80 } },
];

/**
 * Accessory items. Each `markup` is the inline-SVG snippet layered over the
 * mascot viewBox (0 0 120 120); it must reference coordinates in that space.
 * One accessory per "slot" is not enforced here (the child may equip several);
 * the UI/rendering simply stacks them in catalog order.
 * @type {Array<{id:string,label:string,markup:string,unlock:object}>}
 */
export const ACCESSORIES = [
  {
    id: "bow",
    label: "Lazo",
    // a little bow between the antennae
    markup:
      '<g class="lalo-acc lalo-acc-bow"><path d="M60 30 l-10 -6 0 12 z" fill="#ff5d8f"/><path d="M60 30 l10 -6 0 12 z" fill="#ff5d8f"/><circle cx="60" cy="30" r="3.5" fill="#ff2d78"/></g>',
    unlock: { base: true },
  },
  {
    id: "glasses",
    label: "Gafas",
    markup:
      '<g class="lalo-acc lalo-acc-glasses"><circle cx="50" cy="60" r="9" fill="none" stroke="#1d2b53" stroke-width="2.5"/><circle cx="70" cy="60" r="9" fill="none" stroke="#1d2b53" stroke-width="2.5"/><line x1="59" y1="60" x2="61" y2="60" stroke="#1d2b53" stroke-width="2.5"/></g>',
    unlock: { stars: 15 },
  },
  {
    id: "hat",
    label: "Sombrero",
    markup:
      '<g class="lalo-acc lalo-acc-hat"><rect x="40" y="28" width="40" height="7" rx="3" fill="#3a0ca3"/><rect x="48" y="14" width="24" height="16" rx="4" fill="#5a2be0"/></g>',
    unlock: { stars: 30 },
  },
  {
    id: "cape",
    label: "Capa",
    markup:
      '<g class="lalo-acc lalo-acc-cape"><path d="M30 46 q-14 24 -4 50 l12 -4 q-6 -22 2 -44 z" fill="#ef476f" opacity="0.92"/></g>',
    unlock: { level: "pal-2-especiales" },
  },
  {
    id: "crown",
    label: "Corona",
    markup:
      '<g class="lalo-acc lalo-acc-crown"><path d="M44 28 l4 -12 6 8 6 -10 6 10 6 -8 4 12 z" fill="#ffd166" stroke="#e0a81f" stroke-width="1.5"/></g>',
    unlock: { stars: 60 },
  },
  {
    id: "scarf",
    label: "Bufanda",
    markup:
      '<g class="lalo-acc lalo-acc-scarf"><rect x="40" y="88" width="40" height="8" rx="4" fill="#06d6a0"/><rect x="54" y="92" width="8" height="16" rx="3" fill="#06d6a0"/></g>',
    unlock: { level: "pal-3-abiertas-1" },
  },
];

/** The default equipped selection (first-run): base color, no accessories. */
export function defaultSelection() {
  return { color: "sky", accessories: [] };
}

/** Look up a color palette entry by id (or null). */
export function colorById(id) {
  return COLORS.find((c) => c.id === id) || null;
}

/** Look up an accessory entry by id (or null). */
export function accessoryById(id) {
  return ACCESSORIES.find((a) => a.id === id) || null;
}

/** All color ids. */
export function allColors() {
  return COLORS.map((c) => c.id);
}

/** All accessory ids. */
export function allAccessories() {
  return ACCESSORIES.map((a) => a.id);
}

/**
 * Whether a single catalog item's `unlock` spec is satisfied by progress.
 * Supported spec keys: `base:true` (always), `stars:N` (total stars >= N),
 * `level:id` (that level is completed). Pure.
 * @param {object} progress
 * @param {object} unlock
 * @returns {boolean}
 */
function unlockMatches(progress, unlock) {
  if (!unlock) return false;
  if (unlock.base) return true;
  if (typeof unlock.stars === "number") {
    const stars = Number((progress && progress.stars) || 0);
    if (stars >= unlock.stars) return true;
  }
  if (typeof unlock.level === "string") {
    const lv = progress && progress.levels && progress.levels[unlock.level];
    if (lv && lv.completed) return true;
  }
  return false;
}

/**
 * Whether a given item id (color OR accessory) is unlocked for this progress.
 * Unknown ids are not unlocked. Pure.
 * @param {object} progress
 * @param {string} itemId
 * @returns {boolean}
 */
export function isUnlocked(progress, itemId) {
  const c = colorById(itemId);
  if (c) return unlockMatches(progress, c.unlock);
  const a = accessoryById(itemId);
  if (a) return unlockMatches(progress, a.unlock);
  return false;
}

/**
 * The unlocked colors + accessories for a given progress state. Pure.
 * @param {object} progress
 * @returns {{colors: string[], accessories: string[]}}
 */
export function unlockedItems(progress) {
  return {
    colors: COLORS.filter((c) => unlockMatches(progress, c.unlock)).map((c) => c.id),
    accessories: ACCESSORIES.filter((a) => unlockMatches(progress, a.unlock)).map((a) => a.id),
  };
}

/**
 * Sanitize an equipped selection against what is unlocked for this progress:
 * - an unlocked color is kept; otherwise falls back to the default color when
 *   that is unlocked (it always is — base), else the first unlocked color.
 * - accessories are filtered to the unlocked, known, de-duplicated set
 *   (preserving catalog order for stable rendering).
 * Never returns a selection containing a locked or unknown item. Pure.
 * @param {object} progress
 * @param {object} selection {color, accessories}
 * @returns {{color:string, accessories:string[]}}
 */
export function sanitizeSelection(progress, selection) {
  const unlocked = unlockedItems(progress);
  const unlockedColors = unlocked.colors;
  const unlockedAcc = new Set(unlocked.accessories);

  // color
  let color = selection && typeof selection.color === "string" ? selection.color : null;
  if (!color || !unlockedColors.includes(color)) {
    const def = defaultSelection().color;
    color = unlockedColors.includes(def) ? def : unlockedColors[0] || def;
  }

  // accessories: keep only unlocked + known, de-duped, in catalog order
  const requested = Array.isArray(selection && selection.accessories)
    ? selection.accessories
    : [];
  const requestedSet = new Set(requested.filter((id) => unlockedAcc.has(id)));
  const accessories = ACCESSORIES.map((a) => a.id).filter((id) => requestedSet.has(id));

  return { color, accessories };
}
