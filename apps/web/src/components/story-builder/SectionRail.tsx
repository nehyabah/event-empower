import { CheckCircle2, Circle, Eye, EyeOff, GripVertical, ChevronRight } from "lucide-react";
import { SectionContext, SECTION_BY_ID, SectionId } from "@/lib/storySections";

/**
 * The list of sections, in page order.
 *
 * Content, order and visibility were previously three different UIs — you
 * edited the Timeline's content in a modal but reordered it in a settings
 * sheet. They live together here, because they are all facts about the same
 * section.
 */

interface SectionRailProps {
  order: string[];
  hidden: string[];
  ctx: SectionContext;
  activeId: SectionId | null;
  onSelect: (id: SectionId) => void;
  onToggleHidden: (id: SectionId) => void;
  onReorder: (next: string[]) => void;
}

const SectionRail = ({
  order,
  hidden,
  ctx,
  activeId,
  onSelect,
  onToggleHidden,
  onReorder,
}: SectionRailProps) => {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  };

  return (
    <div className="divide-y rounded-xl border bg-card overflow-hidden">
      {order.map((id, index) => {
        const def = SECTION_BY_ID[id];
        if (!def) return null;

        const isHidden = hidden.includes(id);
        const complete = def.isComplete(ctx);
        const active = activeId === id;

        return (
          <div
            key={id}
            className={`flex items-start gap-2 p-3 transition-colors ${
              active ? "bg-primary/5" : "hover:bg-muted/50"
            } ${isHidden ? "opacity-55" : ""}`}
          >
            {/* Keyboard-and-touch reordering. Drag alone would be unusable on
                a phone, where HTML5 drag events never fire. */}
            <div className="flex flex-col shrink-0 -my-1">
              <button
                type="button"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
                className="p-0.5 text-muted-foreground disabled:opacity-25 hover:text-foreground"
                aria-label={`Move ${def.label} up`}
              >
                <GripVertical className="h-3 w-3 rotate-90" />
              </button>
              <span className="text-[10px] text-center text-muted-foreground tabular-nums">
                {index + 1}
              </span>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                disabled={index === order.length - 1}
                className="p-0.5 text-muted-foreground disabled:opacity-25 hover:text-foreground"
                aria-label={`Move ${def.label} down`}
              >
                <GripVertical className="h-3 w-3 rotate-90" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onSelect(def.id)}
              className="flex-1 min-w-0 text-left"
            >
              <div className="flex items-center gap-1.5">
                {complete ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
                ) : (
                  <Circle
                    className={`h-3.5 w-3.5 shrink-0 ${
                      def.important && !isHidden ? "text-amber-500" : "text-muted-foreground/40"
                    }`}
                  />
                )}
                <span className="text-sm font-medium truncate">{def.label}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {isHidden ? "Hidden from guests" : complete ? def.blurb : def.emptyHint}
              </p>
            </button>

            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => onToggleHidden(def.id)}
                className="p-1.5 text-muted-foreground hover:text-foreground"
                aria-label={isHidden ? `Show ${def.label}` : `Hide ${def.label}`}
                title={isHidden ? "Show on your site" : "Hide from guests"}
              >
                {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <ChevronRight
                className={`h-4 w-4 text-muted-foreground/50 ${active ? "rotate-90" : ""} transition-transform`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SectionRail;
