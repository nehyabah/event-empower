/**
 * Per-element layout for the save-the-date card.
 *
 * Templates position everything for you, which falls apart on a heavily
 * decorated card: a long name runs into a corner flower and there is nothing
 * a couple can do about it. This lets each line — and the floral layer —
 * be nudged independently.
 *
 * Offsets are deltas from wherever the template put the element, expressed as
 * a percentage of the card. Keeping them as deltas rather than absolute
 * positions means an untouched card renders exactly as it always did, and a
 * template change does not strand the text somewhere arbitrary.
 */

export type CardElementId =
  | "header"
  | "script"
  | "name1"
  | "amp"
  | "name2"
  | "date"
  | "venue"
  | "footer"
  | "decor";

export interface ElementLayout {
  x: number;
  y: number;
  scale: number;
}

export type CardLayout = Partial<Record<CardElementId, ElementLayout>>;

export const ELEMENT_LABELS: Record<CardElementId, string> = {
  header: "“Save the date”",
  script: "“for the wedding of”",
  name1: "Bride's name",
  amp: "Ampersand",
  name2: "Groom's name",
  date: "Date",
  venue: "Venue",
  footer: "“Invitation to follow”",
  decor: "Flowers",
};

/** Movement is capped so an element cannot be dragged off the card. */
export const LIMIT = 34;
export const SCALE_MIN = 0.6;
export const SCALE_MAX = 1.6;

export const DEFAULT_ELEMENT: ElementLayout = { x: 0, y: 0, scale: 1 };

export const clampElement = (e: Partial<ElementLayout> | undefined): ElementLayout => ({
  x: Math.max(-LIMIT, Math.min(LIMIT, e?.x ?? 0)),
  y: Math.max(-LIMIT, Math.min(LIMIT, e?.y ?? 0)),
  scale: Math.max(SCALE_MIN, Math.min(SCALE_MAX, e?.scale ?? 1)),
});

/** How close a drag must get before it locks on, in card percent. */
export const SNAP_TOLERANCE = 1.6;

export interface SnapResult {
  x: number;
  y: number;
  /** Which guides to draw, so the lock-on is visible rather than mysterious. */
  guides: { vertical: boolean; horizontal: boolean };
}

/**
 * Pulls a dragged element onto the nearest meaningful line.
 *
 * Candidates are its own untouched position — by far the most useful, since
 * it is how a couple undoes a nudge — and the current offsets of the other
 * elements, so lines can be aligned with each other.
 */
export function snap(
  x: number,
  y: number,
  others: ElementLayout[]
): SnapResult {
  const xCandidates = [0, ...others.map((o) => o.x)];
  const yCandidates = [0, ...others.map((o) => o.y)];

  const nearest = (value: number, candidates: number[]) => {
    let best = value;
    let bestGap = SNAP_TOLERANCE;
    for (const c of candidates) {
      const gap = Math.abs(value - c);
      if (gap < bestGap) {
        bestGap = gap;
        best = c;
      }
    }
    return { value: best, snapped: best !== value || bestGap < SNAP_TOLERANCE };
  };

  const sx = nearest(x, xCandidates);
  const sy = nearest(y, yCandidates);

  return {
    x: sx.value,
    y: sy.value,
    guides: { vertical: sx.value !== x || x === 0, horizontal: sy.value !== y || y === 0 },
  };
}

/**
 * Compact encoding for the invitation link.
 *
 * A guest's link should stay short and readable, so only elements actually
 * moved are included, and each is `id:x,y,s` with trailing defaults dropped.
 */
export function encodeLayout(layout: CardLayout): string {
  const parts: string[] = [];
  for (const [id, e] of Object.entries(layout)) {
    if (!e) continue;
    const { x, y, scale } = clampElement(e);
    if (x === 0 && y === 0 && scale === 1) continue;
    const fields = [x.toFixed(1), y.toFixed(1)];
    if (scale !== 1) fields.push(scale.toFixed(2));
    parts.push(`${id}:${fields.join(",")}`);
  }
  return parts.join(";");
}

export function decodeLayout(encoded: string | null | undefined): CardLayout {
  if (!encoded) return {};
  const out: CardLayout = {};
  for (const part of encoded.split(";")) {
    const [id, values] = part.split(":");
    if (!id || !values) continue;
    if (!(id in ELEMENT_LABELS)) continue;
    const [x, y, s] = values.split(",").map(Number);
    out[id as CardElementId] = clampElement({
      x: Number.isFinite(x) ? x : 0,
      y: Number.isFinite(y) ? y : 0,
      scale: Number.isFinite(s) ? s : 1,
    });
  }
  return out;
}
