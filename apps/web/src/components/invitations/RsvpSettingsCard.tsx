import { useCallback, useEffect, useState } from "react";
import { buildInvitationLink } from "@/lib/invitationLink";
import { toast } from "sonner";
import {
  BellRing, CalendarClock, Check, Copy, ExternalLink, Loader2, Lock, Send, Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  userService, UserEvent, GuestReminderSettings, ReminderFrequency, ReminderChannel,
  ReminderScheduleMode, ReminderDate,
} from "@/services/api/userService";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { toDateInput, formatDateOnly, daysUntilDate } from "@/lib/dates";

const FREQUENCIES: Array<{ value: ReminderFrequency; label: string }> = [
  { value: "daily", label: "Every day" },
  { value: "every_3_days", label: "Every 3 days" },
  { value: "weekly", label: "Every week" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Every month" },
];

const CHANNELS: Array<{ value: ReminderChannel; label: string }> = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "both", label: "Email + SMS" },
];

const toInputValue = (value: string | null): string => toDateInput(value) ?? "";

const formatDate = (value: string | null): string | null => formatDateOnly(value);

/**
 * RSVP deadline, link sharing and the guest-reminder schedule.
 *
 * These belong together: the deadline is what the reminders count down to, and
 * it is what closes the public link.
 */
export const RsvpSettingsCard = () => {
  const [event, setEvent] = useState<UserEvent | null>(null);
  const [settings, setSettings] = useState<GuestReminderSettings | null>(null);
  const [dates, setDates] = useState<ReminderDate[]>([]);
  const [newDate, setNewDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingDeadline, setIsSavingDeadline] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const [deadline, setDeadline] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const [eventData, reminderData] = await Promise.all([
        userService.getUserEvent(),
        userService.getReminderSettings(),
      ]);
      setEvent(eventData);
      setSettings(reminderData.settings);
      setDates(reminderData.dates || []);
      setDeadline(toInputValue(eventData?.rsvp_deadline ?? null));
      setMessage(eventData?.rsvp_message ?? "");
    } catch {
      // Leave whatever is on screen; the page still works without this panel.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useAutoRefresh(load, { intervalMs: 60_000 });

  // The card is the invitation, so this shares the card. It used to hand out
  // /rsvp/<code>, a bare form with none of the design on it — a different
  // experience from the link the Card tab copied, for the same invitation.
  const rsvpUrl = event?.rsvp_code
    ? buildInvitationLink(event.rsvp_code)
    : null;

  const saveDeadline = async () => {
    setIsSavingDeadline(true);
    try {
      const updated = await userService.updateUserEvent({
        rsvpDeadline: deadline || null,
        rsvpMessage: message.trim() || null,
      });
      setEvent(updated);
      toast.success("RSVP settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSavingDeadline(false);
    }
  };

  const toggleClosed = async (closed: boolean) => {
    try {
      const updated = await userService.updateUserEvent({ rsvpClosed: closed });
      setEvent(updated);
      toast.success(closed ? "RSVPs closed" : "RSVPs reopened");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const patchSettings = async (input: Parameters<typeof userService.updateReminderSettings>[0]) => {
    try {
      const updated = await userService.updateReminderSettings(input);
      setSettings(updated);
      if (updated.dates) setDates(updated.dates);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update reminders");
    }
  };

  const addDate = async () => {
    if (!newDate) return;
    if (dates.some((d) => d.send_on === newDate)) {
      toast.info("That date is already on the list");
      return;
    }
    const next = [...dates.map((d) => d.send_on), newDate].sort();
    setNewDate("");
    await patchSettings({ dates: next });
  };

  const removeDate = async (send_on: string) => {
    await patchSettings({ dates: dates.filter((d) => d.send_on !== send_on).map((d) => d.send_on) });
  };

  const mode: ReminderScheduleMode = settings?.schedule_mode ?? "recurring";
  const today = toDateInput(new Date()) ?? "";

  const sendNow = async () => {
    setIsSending(true);
    try {
      const result = await userService.sendRemindersNow();
      if (result.reason) toast.info(result.reason);
      else if (result.sent === 0) toast.info("No reminders were sent — everyone has been contacted recently.");
      else toast.success(`Sent ${result.sent} reminder${result.sent === 1 ? "" : "s"}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reminders");
    } finally {
      setIsSending(false);
    }
  };

  const copyLink = async () => {
    if (!rsvpUrl) return;
    try {
      await navigator.clipboard.writeText(rsvpUrl);
      setCopied(true);
      toast.success("Invitation link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Compared as whole local days: a deadline of today is still open.
  const daysLeft = daysUntilDate(event?.rsvp_deadline ?? null);
  const deadlinePassed = daysLeft !== null && daysLeft < 0;
  const isClosed = Boolean(event?.rsvp_closed) || deadlinePassed;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ── RSVP link + deadline ─────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            RSVP link &amp; deadline
          </CardTitle>
          <CardDescription>
            Share one link with your guests. After the deadline it stops accepting
            responses and explains why.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {rsvpUrl && (
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md border bg-muted/50 px-3 py-2 text-xs">
                {rsvpUrl}
              </code>
              <Button size="sm" variant="outline" onClick={copyLink} className="shrink-0">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
              <Button size="sm" variant="outline" asChild className="shrink-0">
                <a href={rsvpUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="rsvp-deadline">Respond by</Label>
            <Input
              id="rsvp-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {deadline
                ? `The link closes at the end of ${formatDate(deadline)}.`
                : "No deadline — the link stays open indefinitely."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rsvp-message">Note for guests (optional)</Label>
            <Textarea
              id="rsvp-message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Dress code, parking, anything they should know…"
            />
          </div>

          <Button size="sm" onClick={saveDeadline} disabled={isSavingDeadline}>
            {isSavingDeadline ? "Saving…" : "Save"}
          </Button>

          <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
            <div className="space-y-0.5">
              <p className="flex items-center gap-2 text-sm font-medium">
                {isClosed ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                {isClosed ? "RSVPs are closed" : "RSVPs are open"}
              </p>
              <p className="text-xs text-muted-foreground">
                {deadlinePassed && !event?.rsvp_closed
                  ? "The deadline has passed. Clear or extend it to reopen."
                  : "Close early, or reopen for a late guest."}
              </p>
            </div>
            <Switch
              checked={!event?.rsvp_closed}
              onCheckedChange={(open) => toggleClosed(!open)}
              aria-label="RSVPs open"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Reminders ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BellRing className="h-4 w-4 text-primary" />
            Guest reminders
          </CardTitle>
          <CardDescription>
            Automatically nudge guests who haven't responded yet.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Send reminders automatically</p>
              <p className="text-xs text-muted-foreground">
                {settings?.enabled && settings.next_send_at
                  ? `Next batch ${new Date(settings.next_send_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short",
                    })}`
                  : "Currently off"}
              </p>
            </div>
            <Switch
              checked={Boolean(settings?.enabled)}
              onCheckedChange={(enabled) => patchSettings({ enabled })}
            />
          </div>

          {/* Repeat on a cadence, or name the days yourself */}
          <div className="space-y-2">
            <Label>Schedule</Label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: "recurring" as const,    label: "Repeat",       hint: "Every few days" },
                { value: "custom_dates" as const, label: "Pick dates",   hint: "Specific days" },
              ]).map((m) => {
                const on = mode === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => patchSettings({ scheduleMode: m.value })}
                    aria-pressed={on}
                    className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                      on ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <span className="block text-sm font-medium">{m.label}</span>
                    <span className="block text-xs text-muted-foreground">{m.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {mode === "custom_dates" && (
            <div className="space-y-2">
              <Label>Send on these days</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  min={today}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
                <Button size="sm" variant="outline" onClick={addDate} disabled={!newDate} className="shrink-0">
                  Add
                </Button>
              </div>

              {dates.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No dates yet — add the days you want reminders to go out.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {dates.map((d) => (
                    <li
                      key={d.id || d.send_on}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <span className="text-sm">{formatDateOnly(d.send_on)}</span>
                      <span className="flex items-center gap-2">
                        {d.sent_at ? (
                          <Badge variant="secondary" className="text-[10px]">Sent</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">Scheduled</Badge>
                        )}
                        {/* A day already fulfilled stays on the list as a record. */}
                        {!d.sent_at && (
                          <button
                            onClick={() => removeDate(d.send_on)}
                            className="text-xs text-muted-foreground hover:text-destructive"
                            aria-label={`Remove ${d.send_on}`}
                          >
                            Remove
                          </button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {mode === "recurring" && (
              <>
                <div className="space-y-2">
                  <Label>How often</Label>
                  <Select
                    value={settings?.frequency ?? "weekly"}
                    onValueChange={(v) => patchSettings({ frequency: v as ReminderFrequency })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder-start">Start on</Label>
                  <Input
                    id="reminder-start"
                    type="date"
                    min={today}
                    value={toDateInput(settings?.start_date ?? null) ?? ""}
                    onChange={(e) => patchSettings({ startDate: e.target.value || null })}
                  />
                  <p className="text-xs text-muted-foreground">Leave blank to begin right away.</p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Send by</Label>
              <Select
                value={settings?.channel ?? "email"}
                onValueChange={(v) => patchSettings({ channel: v as ReminderChannel })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-message">Personal note (optional)</Label>
            <Textarea
              id="reminder-message"
              rows={2}
              defaultValue={settings?.custom_message ?? ""}
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (value !== (settings?.custom_message ?? "")) {
                  patchSettings({ customMessage: value || null });
                }
              }}
              placeholder="We'd love to have you there…"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={sendNow} disabled={isSending}>
              {isSending ? (
                <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Sending…</>
              ) : (
                <><Send className="mr-1.5 h-3.5 w-3.5" />Send reminders now</>
              )}
            </Button>
            {settings?.last_sent_at && (
              <Badge variant="secondary" className="text-[11px]">
                Last sent {new Date(settings.last_sent_at).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short",
                })}
              </Badge>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Only guests still marked pending or maybe are contacted, and nobody is
            emailed twice within one cycle.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RsvpSettingsCard;
