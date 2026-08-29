import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MonthCalendarEntry } from "./MonthCalendar";

interface AgendaListProps {
  /** Already sorted, today onward. */
  entries: MonthCalendarEntry[];
  onSelectEntry?: (entry: MonthCalendarEntry) => void;
  /** Source label/colour maps, shared with the grid so nothing drifts. */
  labels: Record<string, string>;
  /** Accent bar fills, one per source. */
  accents: Record<string, string>;
  className?: string;
}

const formatTime = (time?: string | null): string => {
  if (!time) return "All day";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "pm" : "am"}`;
};

/** Local YYYY-MM-DD, matching MonthCalendar — toISOString shifts the day. */
const toKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/** "Today" and "Tomorrow" read faster than a date anyone has to decode. */
const dayHeading = (key: string): string => {
  const now = new Date();
  const todayKey = toKey(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const date = new Date(`${key}T00:00:00`);
  const full = date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  if (key === todayKey) return `Today · ${full}`;
  if (key === toKey(tomorrow)) return `Tomorrow · ${full}`;
  return full;
};

/**
 * The schedule as a running list, newest day first.
 *
 * A month grid needs roughly 90px per column to say anything useful. On a
 * phone seven columns leave about 43px each, so every entry collapses to a
 * coloured dot and the grid becomes a thing you look at rather than read.
 * This is the same data in the shape a narrow screen can actually carry, and
 * it is what the calendar opens on below lg — the grid is still a tap away
 * for anyone who wants to see the shape of the month.
 */
export const AgendaList = ({ entries, onSelectEntry, labels, accents, className }: AgendaListProps) => {
  const groups = useMemo(() => {
    const map = new Map<string, MonthCalendarEntry[]>();
    for (const entry of entries) {
      const list = map.get(entry.date);
      if (list) list.push(entry);
      else map.set(entry.date, [entry]);
    }
    // entries arrive sorted, so insertion order is already chronological.
    return Array.from(map.entries());
  }, [entries]);

  if (groups.length === 0) {
    return (
      <div className={cn("rounded-lg border border-dashed px-4 py-10 text-center", className)}>
        <CalendarDays className="mx-auto mb-2 h-6 w-6 text-muted-foreground/60" />
        <p className="text-sm text-muted-foreground">Nothing scheduled yet.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Switch to Month and tap a day to add something.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-5", className)}>
      {groups.map(([key, dayEntries]) => (
        <div key={key}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {dayHeading(key)}
          </h3>
          <div className="space-y-1.5">
            {dayEntries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelectEntry?.(entry)}
                className="flex w-full items-stretch gap-3 rounded-lg border bg-card p-3 text-left transition-colors active:bg-muted/50"
              >
                <span
                  aria-hidden
                  className={cn(
                    "w-1 shrink-0 rounded-full",
                    (entry.source && accents[entry.source]) || "bg-muted-foreground/40",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{entry.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {formatTime(entry.start_time)}
                    {entry.source && labels[entry.source] ? ` · ${labels[entry.source]}` : ""}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgendaList;
