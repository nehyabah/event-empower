import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Minimal shape a calendar entry needs to be drawn. */
export interface MonthCalendarEntry {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  start_time?: string | null;
  /** Drives the chip colour. */
  source?: string | null;
}

interface MonthCalendarProps {
  month: Date;
  onMonthChange: (date: Date) => void;
  entries: MonthCalendarEntry[];
  selectedDate?: string | null;
  onSelectDate?: (date: string) => void;
  onSelectEntry?: (entry: MonthCalendarEntry) => void;
  /** Chips shown per day before collapsing into "+N more". */
  maxPerDay?: number;
  className?: string;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Chip colours by entry source, falling back to a neutral tone. */
const SOURCE_STYLES: Record<string, string> = {
  wedding: "bg-pink-100 text-pink-800 hover:bg-pink-200",
  planner_event: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  vendor_booking: "bg-violet-100 text-violet-800 hover:bg-violet-200",
  todo_due: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  expense_due: "bg-amber-100 text-amber-900 hover:bg-amber-200",
  rsvp_deadline: "bg-rose-100 text-rose-800 hover:bg-rose-200",
  workspace_event: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
};

/** Dot fills: the chip backgrounds are ~100-weight and vanish at 6px. */
const DOT_STYLES: Record<string, string> = {
  wedding: "bg-pink-500",
  planner_event: "bg-blue-500",
  vendor_booking: "bg-violet-500",
  todo_due: "bg-emerald-500",
  expense_due: "bg-amber-500",
  rsvp_deadline: "bg-rose-500",
  workspace_event: "bg-indigo-500",
};

const dotStyle = (source?: string | null) =>
  (source && DOT_STYLES[source]) || "bg-muted-foreground";

const chipStyle = (source?: string | null) =>
  (source && SOURCE_STYLES[source]) || "bg-muted text-foreground hover:bg-muted/80";

/** Local YYYY-MM-DD — never toISOString, which shifts the day in most zones. */
const toKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatTime = (time?: string | null): string => {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? "pm" : "am";
  const hour12 = hour % 12 || 12;
  return m === "00" ? `${hour12}${suffix}` : `${hour12}:${m}${suffix}`;
};

/**
 * A full month grid that fills its container.
 *
 * A plain date-picker leaves most of the panel blank; this draws six equal
 * week rows with the day's entries inside each cell, so the space carries
 * information instead of sitting empty.
 */
export const MonthCalendar = ({
  month,
  onMonthChange,
  entries,
  selectedDate,
  onSelectDate,
  onSelectEntry,
  maxPerDay = 3,
  className,
}: MonthCalendarProps) => {
  // Group once per entry list so each cell is a cheap lookup.
  const entriesByDay = useMemo(() => {
    const map = new Map<string, MonthCalendarEntry[]>();
    for (const entry of entries) {
      const list = map.get(entry.date);
      if (list) list.push(entry);
      else map.set(entry.date, [entry]);
    }
    // Timed entries first, in clock order; all-day entries after.
    for (const list of map.values()) {
      list.sort((a, b) => (a.start_time || "99:99").localeCompare(b.start_time || "99:99"));
    }
    return map;
  }, [entries]);

  // Always six rows so the grid height never jumps between months.
  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    // Monday-based offset: JS getDay() is Sunday-based.
    const offset = (first.getDay() + 6) % 7;

    const start = new Date(first);
    start.setDate(start.getDate() - offset);

    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [month]);

  const todayKey = toKey(new Date());
  const shiftMonth = (delta: number) =>
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + delta, 1));

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium">
          {month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onMonthChange(new Date())}
            className="h-8 text-xs"
          >
            Today
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => shiftMonth(-1)} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => shiftMonth(1)} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 border-t border-l rounded-t-md overflow-hidden">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="border-r border-b bg-muted/50 px-2 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day[0]}</span>
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 border-l rounded-b-md overflow-hidden">
        {days.map((date) => {
          const key = toKey(date);
          const dayEntries = entriesByDay.get(key) || [];
          const inMonth = date.getMonth() === month.getMonth();
          const isToday = key === todayKey;
          const isSelected = key === selectedDate;
          const overflow = dayEntries.length - maxPerDay;

          return (
            <div
              key={key}
              onClick={() => onSelectDate?.(key)}
              className={cn(
                "border-r border-b min-h-[58px] sm:min-h-[110px] p-1 sm:p-1.5 flex flex-col gap-1 transition-colors",
                onSelectDate && "cursor-pointer hover:bg-muted/40",
                !inMonth && "bg-muted/20",
                isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/40",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    !inMonth && "text-muted-foreground/50",
                    isToday &&
                      "flex h-5 w-5 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground",
                  )}
                >
                  {date.getDate()}
                </span>
                {overflow > 0 && (
                  <span className="text-[10px] text-muted-foreground">{dayEntries.length}</span>
                )}
              </div>

              {/* Below sm a cell is ~53px wide, so a text chip truncates to two
                  or three characters and tells you nothing. Dots show that something
                  is on and what kind; the day's detail sits in the panel below, which
                  tapping the day fills. */}
              <div className="flex flex-wrap gap-1 sm:hidden">
                {dayEntries.slice(0, 4).map((entry) => (
                  <span
                    key={entry.id}
                    title={entry.title}
                    className={cn("h-1.5 w-1.5 rounded-full", dotStyle(entry.source))}
                  />
                ))}
                {dayEntries.length > 4 && (
                  <span className="text-[9px] leading-none text-muted-foreground">
                    +{dayEntries.length - 4}
                  </span>
                )}
              </div>

              <div className="hidden sm:flex flex-col gap-0.5 min-w-0">
                {dayEntries.slice(0, maxPerDay).map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={(e) => {
                      // Don't also trigger the day's own click handler.
                      e.stopPropagation();
                      onSelectEntry?.(entry);
                    }}
                    title={entry.title}
                    className={cn(
                      "truncate rounded px-1.5 py-0.5 text-left text-[11px] leading-tight transition-colors",
                      chipStyle(entry.source),
                    )}
                  >
                    {entry.start_time && (
                      <span className="mr-1 font-medium opacity-70">{formatTime(entry.start_time)}</span>
                    )}
                    {entry.title}
                  </button>
                ))}

                {overflow > 0 && (
                  <span className="px-1.5 text-[10px] text-muted-foreground">+{overflow} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthCalendar;
