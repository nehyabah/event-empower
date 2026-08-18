import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MonthCalendar from "./MonthCalendar";
import NextEventCard from "./NextEventCard";
import CalendarSyncCard from "./CalendarSyncCard";
import { useCalendar } from "@/hooks/useCalendar";
import { CalendarEntry } from "@/services/api/calendarService";

const SOURCE_LABELS: Record<string, string> = {
  wedding: "Wedding",
  planner_event: "Planner",
  vendor_booking: "Vendor",
  todo_due: "Task",
  expense_due: "Payment",
  rsvp_deadline: "RSVP",
};

const SOURCE_BADGES: Record<string, string> = {
  wedding: "bg-pink-100 text-pink-800",
  planner_event: "bg-blue-100 text-blue-800",
  vendor_booking: "bg-violet-100 text-violet-800",
  todo_due: "bg-emerald-100 text-emerald-800",
  expense_due: "bg-amber-100 text-amber-900",
  rsvp_deadline: "bg-rose-100 text-rose-800",
};

const formatTime = (time: string | null): string => {
  if (!time) return "All day";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

/**
 * The couple's calendar.
 *
 * Everything their planner shares, every vendor booking against their event,
 * their own task and payment deadlines, and the wedding day itself — one view,
 * kept in sync without a page reload.
 */
export const ClientCalendarTab = () => {
  const {
    entries, upcoming, nextEvent, feedUrl, webcalUrl,
    isLoading, error, month, setMonth, applyFeedUrls,
  } = useCalendar();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewing, setViewing] = useState<CalendarEntry | null>(null);

  const dayEntries = useMemo(
    () => (selectedDate ? entries.filter((e) => e.date === selectedDate) : []),
    [entries, selectedDate],
  );

  // With a day picked, show that day; otherwise the next things coming up.
  const listed = selectedDate ? dayEntries : upcoming.slice(0, 8);

  if (error) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <p className="text-sm text-muted-foreground">
            We couldn't load your calendar just now. It will retry automatically.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardContent className="p-4 sm:p-5">
          {isLoading ? (
            <div className="flex h-[480px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <MonthCalendar
              month={month}
              onMonthChange={setMonth}
              entries={entries}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onSelectEntry={(gridEntry) => {
                setSelectedDate(gridEntry.date);
                setViewing(entries.find((e) => e.id === gridEntry.id) || null);
              }}
            />
          )}
        </CardContent>
      </Card>

      <div className="space-y-5">
        <NextEventCard entry={nextEvent} isLoading={isLoading} />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              {selectedDate
                ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-GB", {
                    weekday: "long", day: "numeric", month: "long",
                  })
                : "Coming up"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {listed.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {selectedDate ? "Nothing on this day." : "Nothing scheduled yet."}
              </p>
            ) : (
              listed.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setViewing(entry)}
                  className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md bg-primary/10">
                    <span className="text-[10px] font-medium uppercase">
                      {new Date(`${entry.date}T00:00:00`).toLocaleDateString("en-GB", { month: "short" })}
                    </span>
                    <span className="text-sm font-bold leading-none">
                      {new Date(`${entry.date}T00:00:00`).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{entry.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatTime(entry.start_time)}
                      {entry.counterparty ? ` · ${entry.counterparty}` : ""}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`shrink-0 text-[10px] ${SOURCE_BADGES[entry.source] || ""}`}
                  >
                    {SOURCE_LABELS[entry.source] || "Event"}
                  </Badge>
                </button>
              ))
            )}

            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="w-full pt-1 text-xs text-muted-foreground underline underline-offset-4"
              >
                Show what's coming up instead
              </button>
            )}
          </CardContent>
        </Card>

        <CalendarSyncCard feedUrl={feedUrl} webcalUrl={webcalUrl} onRotated={applyFeedUrls} />
      </div>

      {/* Detail popover-in-place, kept simple since entries are read-only here */}
      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setViewing(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-background p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Badge variant="secondary" className={SOURCE_BADGES[viewing.source] || ""}>
              {SOURCE_LABELS[viewing.source] || "Event"}
            </Badge>
            <h3 className="mt-3 text-lg font-medium">{viewing.title}</h3>
            <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <p>
                {new Date(`${viewing.date}T00:00:00`).toLocaleDateString("en-GB", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
                {viewing.start_time ? ` · ${formatTime(viewing.start_time)}` : ""}
              </p>
              {viewing.location && <p>{viewing.location}</p>}
              {viewing.counterparty && <p>{viewing.counterparty}</p>}
              {viewing.description && (
                <p className="whitespace-pre-wrap pt-2 text-foreground">{viewing.description}</p>
              )}
            </div>
            <button
              onClick={() => setViewing(null)}
              className="mt-5 w-full rounded-md border px-4 py-2 text-sm hover:bg-muted"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientCalendarTab;
