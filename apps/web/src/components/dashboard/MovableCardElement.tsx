import { useCallback, useEffect, useRef, useState } from "react";
import {
  CardElementId,
  ElementLayout,
  LIMIT,
  clampElement,
  snap,
} from "@/lib/cardLayout";

/**
 * One directly-manipulable piece of the card.
 *
 * Wraps an element without changing how it is laid out: the template still
 * decides where things sit, and this applies a transform on top. So an
 * untouched card is pixel-identical to before, and a couple who drags one
 * line does not disturb the rest.
 */

interface MovableCardElementProps {
  id: CardElementId;
  layout: ElementLayout;
  /** Offsets of the other elements, so this one can snap into line with them. */
  peers: ElementLayout[];
  editable: boolean;
  selected: boolean;
  onSelect: (id: CardElementId) => void;
  onChange: (id: CardElementId, next: ElementLayout) => void;
  /** The card, for converting pixel movement into card percentages. */
  cardRef: React.RefObject<HTMLDivElement>;
  className?: string;
  children: React.ReactNode;
}

const MovableCardElement = ({
  id,
  layout,
  peers,
  editable,
  selected,
  onSelect,
  onChange,
  cardRef,
  className = "",
  children,
}: MovableCardElementProps) => {
  const [dragging, setDragging] = useState(false);
  const [guides, setGuides] = useState({ vertical: false, horizontal: false });
  const start = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  const begin = (clientX: number, clientY: number) => {
    if (!editable) return;
    start.current = { px: clientX, py: clientY, x: layout.x, y: layout.y };
    setDragging(true);
    onSelect(id);
  };

  const move = useCallback(
    (clientX: number, clientY: number) => {
      const s = start.current;
      const box = cardRef.current;
      if (!s || !box) return;

      // Percentages of the card, so a position set on a laptop still holds
      // when the same card is rendered small on a guest's phone.
      const rawX = s.x + ((clientX - s.px) / box.offsetWidth) * 100;
      const rawY = s.y + ((clientY - s.py) / box.offsetHeight) * 100;

      const snapped = snap(
        Math.max(-LIMIT, Math.min(LIMIT, rawX)),
        Math.max(-LIMIT, Math.min(LIMIT, rawY)),
        peers
      );
      setGuides(snapped.guides);
      onChange(id, clampElement({ x: snapped.x, y: snapped.y, scale: layout.scale }));
    },
    [cardRef, id, layout.scale, onChange, peers]
  );

  const end = useCallback(() => {
    start.current = null;
    setDragging(false);
    setGuides({ vertical: false, horizontal: false });
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => move(e.clientX, e.clientY);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", end);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", end);
    };
  }, [dragging, move, end]);

  // Arrow keys give precision a drag cannot, and make this reachable without
  // a pointer at all.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!editable || !selected) return;
    const step = e.shiftKey ? 2 : 0.5;
    const nudge: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const delta = nudge[e.key];
    if (!delta) return;
    e.preventDefault();
    e.stopPropagation();
    onChange(id, clampElement({ x: layout.x + delta[0], y: layout.y + delta[1], scale: layout.scale }));
  };

  // A caller that positions this itself — the floral layer passes
  // "absolute inset-0" — must not be overridden. Tailwind emits .relative
  // after .absolute, so hardcoding relative wins on specificity order and
  // silently collapses that layer, which is how the flowers went missing.
  const alreadyPositioned = /\b(absolute|fixed|sticky|relative)\b/.test(className);

  const interactive = editable
    ? `${dragging ? "cursor-grabbing" : "cursor-grab"} rounded transition-shadow ${
        selected ? "ring-1 ring-current/40 ring-offset-1" : "hover:ring-1 hover:ring-current/20"
      }`
    : "";

  return (
    <div
      className={`${alreadyPositioned ? "" : "relative"} ${className} ${interactive}`}
      style={{
        transform: `translate(${layout.x}%, ${layout.y}%) scale(${layout.scale})`,
        // Follows the pointer exactly while dragging; eases when nudged from
        // the keyboard or a control, so small adjustments read clearly.
        transition: dragging ? "none" : "transform 160ms ease-out",
      }}
      tabIndex={editable ? 0 : undefined}
      onKeyDown={onKeyDown}
      onMouseDown={(e) => {
        if (!editable) return;
        // The card itself drags to flip; without this, moving a line would
        // be read as a flip gesture.
        e.stopPropagation();
        e.preventDefault();
        begin(e.clientX, e.clientY);
      }}
      onTouchStart={(e) => {
        if (!editable) return;
        e.stopPropagation();
        begin(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchMove={(e) => {
        if (!dragging) return;
        e.stopPropagation();
        move(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchEnd={end}
    >
      {children}

      {/* Shown only while a drag is locked on, so the snap is visible rather
          than a mysterious jump. */}
      {dragging && guides.vertical && (
        <span className="pointer-events-none absolute left-1/2 -top-[40vh] h-[80vh] w-px bg-current/30" />
      )}
      {dragging && guides.horizontal && (
        <span className="pointer-events-none absolute top-1/2 -left-[40vw] w-[80vw] h-px bg-current/30" />
      )}
    </div>
  );
};

export default MovableCardElement;
