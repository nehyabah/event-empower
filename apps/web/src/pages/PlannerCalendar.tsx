
import { useMemo, useState } from "react";
import useApproval from "@/hooks/useApproval";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Plus, Loader2, Pencil, Trash2,
  Clock, MapPin, User, Calendar as CalendarIcon, Heart, CheckSquare,
} from "lucide-react";
import MonthCalendar from "@/components/calendar/MonthCalendar";
import CalendarSyncCard from "@/components/calendar/CalendarSyncCard";
import AddWorkspaceEventDialog from "@/components/calendar/AddWorkspaceEventDialog";
import { useCalendar } from "@/hooks/useCalendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { usePlannerEvents } from "@/hooks/usePlannerEvents";
import { usePlannerClients } from "@/hooks/usePlannerClients";
import { PlannerEvent, CalendarWeddingDate, CalendarTodoDueDate } from "@/services/api/plannerService";

// ── Types for unified event list ──────────────────────────────────────────────

type CalendarEntry =
  | { kind: "event"; data: PlannerEvent }
  | { kind: "wedding"; data: CalendarWeddingDate }
  | { kind: "todo"; data: CalendarTodoDueDate };

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatTime = (timeStr: string | null): string => {
  if (!timeStr) return "All day";
  const [hours, minutes] = timeStr.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

const getEventTypeColor = (type: string) => {
  switch (type) {
    case "wedding":      return "bg-pink-100 text-pink-800";
    case "meeting":      return "bg-blue-100 text-blue-800";
    case "visit":        return "bg-green-100 text-green-800";
    case "consultation": return "bg-purple-100 text-purple-800";
    case "rehearsal":    return "bg-orange-100 text-orange-800";
    default:             return "bg-gray-100 text-gray-800";
  }
};

const entryDate = (entry: CalendarEntry): string => {
  if (entry.kind === "event")   return entry.data.event_date.split("T")[0];
  if (entry.kind === "wedding") return entry.data.event_date;
  return entry.data.due_date;
};

/** Stable id for an entry, so a grid chip maps back to its source record. */
const entryKey = (entry: CalendarEntry): string => {
  if (entry.kind === "event")   return `event-${entry.data.id}`;
  if (entry.kind === "wedding") return `wedding-${entry.data.client_id}-${entry.data.event_date}`;
  return `todo-${entry.data.client_id}-${entry.data.due_date}-${entry.data.item_text}`;
};

// ── Component ─────────────────────────────────────────────────────────────────

const PlannerCalendar = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [addingOn, setAddingOn] = useState<string | null>(null);

  // Feed URLs for the "sync to Google/Apple" panel.
  const { feedUrl, webcalUrl, applyFeedUrls } = useCalendar();

  const {
    events, weddingDates, todoDueDates,
    isLoading, error,
    upcomingEvents, fetchEvents,
    createEvent, updateEvent, deleteEvent,
  } = usePlannerEvents();

  const { clients, getClientName } = usePlannerClients();

  // Create/Edit dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PlannerEvent | null>(null);

  // View dialog
  const [viewingEntry, setViewingEntry] = useState<CalendarEntry | null>(null);

  // Delete confirmation
  const [deletingEvent, setDeletingEvent] = useState<PlannerEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [eventForm, setEventForm] = useState({
    title: "", clientId: "none", eventDate: "", startTime: "",
    endTime: "", eventType: "meeting", location: "", description: "",
    visibleToClient: true,
  });

  const { blocked } = useApproval();
  const canSubmit = useMemo(
    () => eventForm.title.trim() && eventForm.eventDate,
    [eventForm.title, eventForm.eventDate],
  );

  const resetForm = () => {
    setEventForm({
      title: "", clientId: "none", eventDate: "", startTime: "", endTime: "",
      eventType: "meeting", location: "", description: "", visibleToClient: true,
    });
    setEditingEvent(null);
  };

  const openCreateDialog = () => {
    resetForm();
    // Prefill with whichever day is selected on the grid.
    if (selectedDay) setEventForm(p => ({ ...p, eventDate: selectedDay }));
    setIsCreateOpen(true);
  };

  const openEditDialog = (event: PlannerEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      clientId: event.client_id || "none",
      eventDate: event.event_date.split("T")[0],
      startTime: event.start_time || "",
      endTime: event.end_time || "",
      eventType: event.event_type,
      location: event.location || "",
      description: event.description || "",
      visibleToClient: event.visible_to_client ?? true,
    });
    setViewingEntry(null);
    setIsCreateOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingEvent) return;
    setIsDeleting(true);
    const success = await deleteEvent(deletingEvent.id);
    setIsDeleting(false);
    if (success) { setDeletingEvent(null); setViewingEntry(null); }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    const payload = {
      title: eventForm.title.trim(),
      clientId: eventForm.clientId !== "none" ? eventForm.clientId : undefined,
      eventDate: eventForm.eventDate,
      startTime: eventForm.startTime || undefined,
      endTime: eventForm.endTime || undefined,
      eventType: eventForm.eventType as PlannerEvent["event_type"],
      location: eventForm.location.trim() || undefined,
      description: eventForm.description.trim() || undefined,
      visibleToClient: eventForm.visibleToClient,
    };
    const result = editingEvent ? await updateEvent(editingEvent.id, payload) : await createEvent(payload);
    setIsSubmitting(false);
    if (result) { setIsCreateOpen(false); resetForm(); }
  };

  // Every entry, regardless of date — the month grid needs past months too.
  const allEntries: CalendarEntry[] = useMemo(() => [
    ...events.map(e => ({ kind: "event" as const, data: e })),
    ...weddingDates.map(w => ({ kind: "wedding" as const, data: w })),
    ...todoDueDates.map(t => ({ kind: "todo" as const, data: t })),
  ], [events, weddingDates, todoDueDates]);

  // Flattened into the shape the month grid draws, keyed so a chip click can
  // be mapped back to the original entry.
  const gridEntries = useMemo(() => allEntries.map(entry => ({
    id: entryKey(entry),
    title:
      entry.kind === "event"   ? entry.data.title :
      entry.kind === "wedding" ? `${entry.data.client_name}'s wedding` :
                                 entry.data.item_text,
    date: entryDate(entry),
    start_time: entry.kind === "event" ? entry.data.start_time : null,
    source:
      entry.kind === "event"   ? "planner_event" :
      entry.kind === "wedding" ? "wedding" : "todo_due",
  })), [allEntries]);

  // Combine all entries into a unified upcoming list
  const allUpcomingEntries: CalendarEntry[] = useMemo(() => {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const entries: CalendarEntry[] = [
      ...upcomingEvents.map(e => ({ kind: "event" as const, data: e })),
      ...weddingDates
        .filter(w => new Date(w.event_date) >= todayStart)
        .map(w => ({ kind: "wedding" as const, data: w })),
      ...todoDueDates
        .filter(t => new Date(t.due_date) >= todayStart)
        .map(t => ({ kind: "todo" as const, data: t })),
    ];
    return entries.sort((a, b) => new Date(entryDate(a)).getTime() - new Date(entryDate(b)).getTime());
  }, [upcomingEvents, weddingDates, todoDueDates]);

  const pastEvents = events.filter(e => {
    const d = new Date(e.event_date); const t = new Date(); t.setHours(0, 0, 0, 0); return d < t;
  });

  const filteredUpcoming = selectedFilter
    ? allUpcomingEntries.filter(e => {
        if (selectedFilter === "wedding_date") return e.kind === "wedding";
        if (selectedFilter === "todo_due")     return e.kind === "todo";
        return e.kind === "event" && e.data.event_type === selectedFilter;
      })
    : allUpcomingEntries;

  const renderEntry = (entry: CalendarEntry, idx: number) => {
    const dateStr = entryDate(entry);
    const date = new Date(dateStr);

    return (
      <div
        key={idx}
        className="flex items-center p-3 hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
        onClick={() => setViewingEntry(entry)}
      >
        <div className="mr-3 flex-shrink-0">
          <div className="w-12 h-12 bg-primary/10 rounded-md flex flex-col items-center justify-center">
            <span className="text-xs font-medium">{date.toLocaleDateString("default", { month: "short" })}</span>
            <span className="text-lg font-bold leading-none">{date.getDate()}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {entry.kind === "event" && (
            <>
              <h3 className="font-medium truncate">{entry.data.title}</h3>
              <p className="text-sm text-muted-foreground">{formatTime(entry.data.start_time)}</p>
            </>
          )}
          {entry.kind === "wedding" && (
            <>
              <h3 className="font-medium truncate flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                {entry.data.client_name}&apos;s wedding
              </h3>
              <p className="text-sm text-muted-foreground">Client wedding day</p>
            </>
          )}
          {entry.kind === "todo" && (
            <>
              <h3 className="font-medium truncate flex items-center gap-1">
                <CheckSquare className="h-3.5 w-3.5 text-green-600 shrink-0" />
                {entry.data.item_text}
              </h3>
              <p className="text-sm text-muted-foreground truncate">{entry.data.client_name} · {entry.data.list_title}</p>
            </>
          )}
        </div>
        {entry.kind === "event" && (
          <Badge variant="secondary" className={`${getEventTypeColor(entry.data.event_type)} ml-2 shrink-0`}>
            {entry.data.event_type}
          </Badge>
        )}
        {entry.kind === "wedding" && (
          <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100 ml-2 shrink-0">Wedding</Badge>
        )}
        {entry.kind === "todo" && (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 ml-2 shrink-0">Task</Badge>
        )}
      </div>
    );
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </main>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 flex items-start justify-center">
        <div className="mt-16 max-w-md w-full text-center space-y-4 p-10 rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="text-4xl">🗓️</div>
          <h2 className="text-xl font-serif font-medium">Calendar unavailable</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">We couldn't load your calendar right now. Please try again in a moment.</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Try again</Button>
        </div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-serif">Calendar</h1>
            <p className="text-muted-foreground">Your events, client weddings, and shared to-do deadlines</p>
          </div>
          <div className="flex gap-2">
            <Button disabled={blocked} variant="outline" onClick={() => setAddingOn(selectedDay || new Date().toISOString().split("T")[0])}>
              <Plus className="mr-2 h-4 w-4" />
              Shared event
            </Button>
            <Button disabled={blocked} onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Month grid — fills the panel with the month's actual entries */}
          <Card className="md:col-span-2">
            <CardContent className="p-4 sm:p-5">
              <MonthCalendar
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                entries={gridEntries}
                selectedDate={selectedDay}
                onSelectDate={setSelectedDay}
                onSelectEntry={(gridEntry) => {
                  const entry = allEntries.find(e => entryKey(e) === gridEntry.id);
                  if (entry) setViewingEntry(entry);
                }}
              />
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-200 inline-block" />My events</span>
                <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-pink-500" />Client weddings</span>
                <span className="flex items-center gap-1"><CheckSquare className="h-3 w-3 text-green-600" />Todo due dates</span>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <Tabs defaultValue="upcoming">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="upcoming">Upcoming ({filteredUpcoming.length})</TabsTrigger>
                    <TabsTrigger value="past">Past ({pastEvents.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upcoming" className="space-y-1 sm:max-h-[400px] sm:overflow-y-auto">
                    {filteredUpcoming.length === 0
                      ? <p className="text-center text-muted-foreground py-4">No upcoming events</p>
                      : filteredUpcoming.map((e, i) => renderEntry(e, i))}
                  </TabsContent>
                  <TabsContent value="past" className="space-y-1 sm:max-h-[400px] sm:overflow-y-auto">
                    {pastEvents.length === 0
                      ? <p className="text-center text-muted-foreground py-4">No past events</p>
                      : pastEvents
                          .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
                          .map((e, i) => renderEntry({ kind: "event", data: e }, i))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Quick Filters</h3>
                <div className="space-y-2">
                  {[
                    { label: "All", value: null },
                    { label: "Weddings", value: "wedding" },
                    { label: "Meetings", value: "meeting" },
                    { label: "Venue Visits", value: "visit" },
                    { label: "Client Weddings", value: "wedding_date" },
                    { label: "Todo Due Dates", value: "todo_due" },
                  ].map(f => (
                    <Button
                      key={String(f.value)}
                      variant={selectedFilter === f.value ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedFilter(f.value)}
                    >
                      {f.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <CalendarSyncCard
              feedUrl={feedUrl}
              webcalUrl={webcalUrl}
              onRotated={applyFeedUrls}
            />
          </div>
        </div>
      </main>

      <AddWorkspaceEventDialog
        open={!!addingOn}
        onOpenChange={(o) => !o && setAddingOn(null)}
        date={addingOn}
        onCreated={fetchEvents}
      />

      {/* View Entry Dialog */}
      <Dialog open={!!viewingEntry} onOpenChange={(open) => !open && setViewingEntry(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            {viewingEntry?.kind === "event" && (
              <>
                <DialogTitle className="text-xl">{viewingEntry.data.title}</DialogTitle>
                <DialogDescription>
                  <Badge variant="secondary" className={`${getEventTypeColor(viewingEntry.data.event_type)} mt-2`}>
                    {viewingEntry.data.event_type}
                  </Badge>
                </DialogDescription>
              </>
            )}
            {viewingEntry?.kind === "wedding" && (
              <DialogTitle className="text-xl flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                {viewingEntry.data.client_name}&apos;s Wedding
              </DialogTitle>
            )}
            {viewingEntry?.kind === "todo" && (
              <DialogTitle className="text-xl flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-green-600" />
                {viewingEntry.data.item_text}
              </DialogTitle>
            )}
          </DialogHeader>

          {viewingEntry && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(entryDate(viewingEntry))}</span>
              </div>

              {viewingEntry.kind === "event" && (
                <>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatTime(viewingEntry.data.start_time)}
                      {viewingEntry.data.end_time && ` - ${formatTime(viewingEntry.data.end_time)}`}
                    </span>
                  </div>
                  {viewingEntry.data.location && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{viewingEntry.data.location}</span>
                    </div>
                  )}
                  {viewingEntry.data.client_id && (
                    <div className="flex items-center gap-3 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{clients.find(c => c.id === viewingEntry.data.client_id)
                        ? getClientName(clients.find(c => c.id === viewingEntry.data.client_id)!)
                        : "Client"}</span>
                    </div>
                  )}
                  {viewingEntry.data.description && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewingEntry.data.description}</p>
                    </div>
                  )}
                </>
              )}

              {viewingEntry.kind === "wedding" && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Client: {viewingEntry.data.client_name}</span>
                </div>
              )}

              {viewingEntry.kind === "todo" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{viewingEntry.data.client_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckSquare className="h-4 w-4" />
                    <span>List: {viewingEntry.data.list_title}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            {viewingEntry?.kind === "event" ? (
              <>
                <Button disabled={blocked} variant="destructive" size="sm" onClick={() => setDeletingEvent(viewingEntry.data)}>
                  <Trash2 className="h-4 w-4 mr-1" />Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setViewingEntry(null)}>Close</Button>
                  <Button disabled={blocked} size="sm" onClick={() => viewingEntry && openEditDialog(viewingEntry.data)}>
                    <Pencil className="h-4 w-4 mr-1" />Edit
                  </Button>
                </div>
              </>
            ) : (
              <Button variant="outline" size="sm" className="ml-auto" onClick={() => setViewingEntry(null)}>Close</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Event Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit event" : "Add new event"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={eventForm.title} onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))} placeholder="Venue walkthrough" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <Select value={eventForm.clientId} onValueChange={v => setEventForm(p => ({ ...p, clientId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No client</SelectItem>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{getClientName(c)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Event type</label>
              <Select value={eventForm.eventType} onValueChange={v => setEventForm(p => ({ ...p, eventType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="visit">Venue visit</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="rehearsal">Rehearsal</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Event date</label>
              <Input type="date" value={eventForm.eventDate} onChange={e => setEventForm(p => ({ ...p, eventDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start time</label>
              <Input type="time" value={eventForm.startTime} onChange={e => setEventForm(p => ({ ...p, startTime: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End time</label>
              <Input type="time" value={eventForm.endTime} onChange={e => setEventForm(p => ({ ...p, endTime: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Location</label>
              <Input value={eventForm.location} onChange={e => setEventForm(p => ({ ...p, location: e.target.value }))} placeholder="Venue or address" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={eventForm.description} onChange={e => setEventForm(p => ({ ...p, description: e.target.value }))} placeholder="Add details..." />
            </div>

            {/* Calendar sync to the client */}
            <div className="sm:col-span-2 flex items-start justify-between gap-4 rounded-lg border p-3">
              <div className="space-y-0.5">
                <label htmlFor="visible-to-client" className="text-sm font-medium">
                  Share with client
                </label>
                <p className="text-xs text-muted-foreground">
                  {eventForm.clientId === "none"
                    ? "Assign a client first for this to have any effect."
                    : "The client sees this on their own calendar and ICS feed."}
                </p>
              </div>
              <Switch
                id="visible-to-client"
                checked={eventForm.visibleToClient}
                onCheckedChange={v => setEventForm(p => ({ ...p, visibleToClient: v }))}
                disabled={eventForm.clientId === "none"}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button disabled={blocked || !canSubmit || isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? "Saving..." : editingEvent ? "Update event" : "Create event"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingEvent} onOpenChange={(open) => !open && setDeletingEvent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingEvent?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlannerCalendar;
