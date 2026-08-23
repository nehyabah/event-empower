import { CalendarClock, MapPin, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarEntry } from "@/services/api/calendarService";

interface NextEventCardProps {
  entry: CalendarEntry | null;
  isLoading?: boolean;
  /** Optional action rendered on the right (e.g. "Add to calendar"). */
  action?: React.ReactNode;
}

const SOURCE_LABELS: Record<string, string> = {
  wedding: "Wedding",
  planner_event: "Meeting",
  vendor_booking: "Booking",
  todo_due: "Task due",
  expense_due: "Payment due",
  rsvp_deadline: "RSVP deadline",
  workspace_event: "Shared event",
};

const formatTime = (time: string | null): string | null => {
  if (!time) return null;
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${suffix}`;
};

/** Whole days from today until the given date, ignoring clock time. */
const daysUntil = (date: string): number => {
  const target = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
};

const countdownLabel = (date: string): string => {
  const days = daysUntil(date);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 0) return "Past";
  if (days < 7) return `In ${days} days`;
  if (days < 30) return `In ${Math.round(days / 7)} week${days >= 14 ? "s" : ""}`;
  return `In ${Math.round(days / 30)} month${days >= 60 ? "s" : ""}`;
};

/** The single next thing on the schedule — the "what's coming up" answer. */
export const NextEventCard = ({ entry, isLoading, action }: NextEventCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="mt-3 h-6 w-48 rounded bg-muted animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!entry) {
    return (
      <Card>
        <CardContent className="p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Next event</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Nothing scheduled yet — add an event to see it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const time = formatTime(entry.start_time);
  const dateLabel = new Date(`${entry.date}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <Card className="border-primary/30">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Next event</p>
              <Badge variant="secondary" className="text-[10px]">
                {SOURCE_LABELS[entry.source] || "Event"}
              </Badge>
            </div>

            <h3 className="mt-2 text-lg font-medium truncate">{entry.title}</h3>

            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                {dateLabel}{time ? ` · ${time}` : ""}
              </p>
              {entry.location && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{entry.location}</span>
                </p>
              )}
              {entry.counterparty && (
                <p className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{entry.counterparty}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {countdownLabel(entry.date)}
            </span>
            {action}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextEventCard;
