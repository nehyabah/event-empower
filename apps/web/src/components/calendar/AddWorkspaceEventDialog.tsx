import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  workspaceEventService, WorkspaceContext, WorkspaceEventType,
  WORKSPACE_EVENT_TYPES,
} from "@/services/api/workspaceEventService";
import { formatDateOnly } from "@/lib/dates";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Day that was clicked, as YYYY-MM-DD. */
  date: string | null;
  /** Called after a successful save so the calendar can refresh. */
  onCreated?: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  client: "Couple",
  planner: "Planner",
  vendor: "Vendor",
  admin: "Admin",
};

/**
 * Add an event to a wedding's shared calendar and tag the people involved.
 *
 * Tagged people see it on their own calendar and ICS feed. Available to every
 * role — the couple, their planner, and vendors on the roster all schedule
 * against the same wedding.
 */
export const AddWorkspaceEventDialog = ({ open, onOpenChange, date, onCreated }: Props) => {
  const [contexts, setContexts] = useState<WorkspaceContext[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [eventId, setEventId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<WorkspaceEventType>("meeting");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [tagged, setTagged] = useState<Set<string>>(new Set());

  // Load the weddings this user can schedule against, and who is on each.
  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    workspaceEventService.getContexts()
      .then((list) => {
        setContexts(list);
        // With a single workspace (the common case for a couple) preselect it.
        if (list.length > 0) setEventId((prev) => prev || list[0].event_id);
      })
      .catch(() => toast.error("Couldn't load your workspace"))
      .finally(() => setIsLoading(false));
  }, [open]);

  // Reset the form each time the dialog opens on a new day.
  useEffect(() => {
    if (!open) return;
    setTitle(""); setEventType("meeting");
    setStartTime(""); setEndTime("");
    setLocation(""); setDescription("");
    setTagged(new Set());
  }, [open, date]);

  const active = useMemo(
    () => contexts.find((c) => c.event_id === eventId) || null,
    [contexts, eventId],
  );

  const togglePerson = (userId: string) => {
    setTagged((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!date) return;
    if (!title.trim()) { toast.error("Give the event a title"); return; }
    if (!eventId) { toast.error("Pick which wedding this is for"); return; }

    setIsSaving(true);
    try {
      await workspaceEventService.create({
        eventId,
        title: title.trim(),
        eventDate: date,
        startTime: startTime || null,
        endTime: endTime || null,
        location: location.trim() || null,
        description: description.trim() || null,
        eventType,
        participantIds: [...tagged],
      });
      toast.success(
        tagged.size > 0
          ? `Event added and ${tagged.size} ${tagged.size === 1 ? "person" : "people"} tagged`
          : "Event added",
      );
      onOpenChange(false);
      onCreated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add event");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add event</DialogTitle>
          <DialogDescription>
            {date ? formatDateOnly(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : ""}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : contexts.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">
            There's no wedding workspace linked to your account yet, so there's
            nothing to add an event to.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Only worth choosing when the user works on several weddings. */}
            {contexts.length > 1 && (
              <div className="space-y-2 sm:col-span-2">
                <Label>Wedding</Label>
                <Select value={eventId} onValueChange={(v) => { setEventId(v); setTagged(new Set()); }}>
                  <SelectTrigger><SelectValue placeholder="Select a wedding" /></SelectTrigger>
                  <SelectContent>
                    {contexts.map((c) => (
                      <SelectItem key={c.event_id} value={c.event_id}>
                        {c.couple_names}{c.event_date ? ` · ${c.event_date}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="we-title">Title</Label>
              <Input
                id="we-title"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Cake tasting"
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={eventType} onValueChange={(v) => setEventType(v as WorkspaceEventType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WORKSPACE_EVENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="we-location">Location</Label>
              <Input
                id="we-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Venue or address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="we-start">Start time</Label>
              <Input id="we-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="we-end">End time</Label>
              <Input id="we-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>

            {/* Tagging */}
            <div className="space-y-2 sm:col-span-2">
              <Label className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                Tag people
                {tagged.size > 0 && (
                  <span className="text-xs font-normal text-muted-foreground">
                    · {tagged.size} selected
                  </span>
                )}
              </Label>

              {!active || active.people.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nobody else is connected to this wedding yet.
                </p>
              ) : (
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {active.people.map((p) => {
                    const on = tagged.has(p.user_id);
                    return (
                      <button
                        key={p.user_id}
                        type="button"
                        onClick={() => togglePerson(p.user_id)}
                        aria-pressed={on}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                          on ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            on ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                          }`}
                        >
                          {on && <Check className="h-3 w-3" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{p.name || p.email || "Unnamed"}</span>
                          <span className="block text-[11px] text-muted-foreground">
                            {ROLE_LABELS[p.user_type] || p.user_type}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Tagged people see this on their own calendar and can subscribe to it.
              </p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="we-notes">Notes</Label>
              <Textarea
                id="we-notes"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Anything worth remembering…"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading || contexts.length === 0}>
            {isSaving ? "Saving…" : "Add event"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddWorkspaceEventDialog;
