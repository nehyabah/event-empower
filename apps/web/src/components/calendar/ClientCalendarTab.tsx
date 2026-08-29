import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MonthCalendar from "./MonthCalendar";
import NextEventCard from "./NextEventCard";
import CalendarSyncCard from "./CalendarSyncCard";
import { useCalendar } from "@/hooks/useCalendar";
import { CalendarEntry } from "@/services/api/calendarService";
import AddWorkspaceEventDialog from "./AddWorkspaceEventDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AgendaList from "./AgendaList";
import { cn } from "@/lib/utils";

const SOURCE_LABELS: Record<string, string> = {
  wedding: "Wedding",
  planner_event: "Planner",
  vendor_booking: "Vendor",
  todo_due: "Task",
  expense_due: "Payment",
  rsvp_deadline: "RSVP",
  workspace_event: "Shared",
};

const SOURCE_BADGES: Record<string, string> = {
  wedding: "bg-pink-100 text-pink-800",
  planner_event: "bg-blue-100 text-blue-800",
  vendor_booking: "bg-violet-100 text-violet-800",
  todo_due: "bg-emerald-100 text-emerald-800",
  expense_due: "bg-amber-100 text-amber-900",
  rsvp_deadline: "bg-rose-100 text-rose-800",
  workspace_event: "bg-indigo-100 text-indigo-800",
};

/** Solid fills for the agenda's accent bar; the badge tints are too pale at 4px. */
const SOURCE_ACCENTS: Record<string, string> = {
  wedding: "bg-pink-500",
  planner_event: "bg-blue-500",
  vendor_booking: "bg-violet-500",
  todo_due: "bg-emerald-500",
  expense_due: "bg-amber-500",
  rsvp_deadline: "bg-rose-500",
  workspace_event: "bg-indigo-500",
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
    isLoading, error, month, setMonth, applyFeedUrls, refresh,
  } = useCalendar();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewing, setViewing] = useState<CalendarEntry | null>(null);
  // Day the user clicked "add" on; also drives the dialog being open.
  const [addingOn, setAddingOn] = useState<string | null>(null);
  // Below lg the month grid gives each day about 43px, which is not enough to
  // show anything but a dot. The running list is the default there; the grid
  // stays one tap away. Ignored from lg up, where both would fit but the grid
  // is the better read.
  const [mobileView, setMobileView] = useState<"agenda" | "month">("agenda");

  const todayKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

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
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="min-w-0 space-y-4 lg:col-span-2">
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <div className="inline-flex rounded-lg border bg-muted/40 p-0.5">
            {(["agenda", "month"] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setMobileView(view)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  mobileView === view
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {view}
              </button>
            ))}
          </div>
          {mobileView === "agenda" && (
            <Button size="sm" variant="outline" onClick={() => setAddingOn(todayKey)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add
            </Button>
          )}
        </div>

        {mobileView === "agenda" && (
          <div className="lg:hidden">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <AgendaList
                entries={upcoming}
                labels={SOURCE_LABELS}
                accents={SOURCE_ACCENTS}
                onSelectEntry={(gridEntry) =>
                  setViewing(entries.find((e) => e.id === gridEntry.id) || null)
                }
              />
            )}
          </div>
        )}

      <Card className={cn(mobileView === "agenda" && "hidden lg:block")}>
        <CardContent className="p-4 sm:p-5">
          {isLoading ? (
            <div className="flex h-[320px] sm:h-[480px] items-center justify-center">
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
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        {/* On a phone, tapping a day should put that day's events directly
            beneath the calendar. On a wide screen the sidebar reads better
            with what is coming up at the top, so the order swaps back. */}
        <div className={cn("order-2 lg:order-1", mobileView === "agenda" && "hidden lg:block")}>
          <NextEventCard entry={nextEvent} isLoading={isLoading} />
        </div>

        <Card className={cn("order-1 lg:order-2", mobileView === "agenda" && "hidden lg:block")}>
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
            {selectedDate && (
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setAddingOn(selectedDate)}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add event on this day
              </Button>
            )}

            {listed.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {selectedDate ? "Nothing on this day." : "Pick a day to add an event."}
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

        <div className="order-3">
          <CalendarSyncCard feedUrl={feedUrl} webcalUrl={webcalUrl} onRotated={applyFeedUrls} />
        </div>
      </div>

      <AddWorkspaceEventDialog
        open={!!addingOn}
        onOpenChange={(o) => !o && setAddingOn(null)}
        date={addingOn}
        onCreated={refresh}
      />

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
