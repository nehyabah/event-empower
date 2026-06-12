
import { useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Plus, ChevronLeft, ChevronRight, Loader2, Pencil, Trash2, X, Clock, MapPin, User, Calendar as CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { usePlannerEvents } from "@/hooks/usePlannerEvents";
import { usePlannerClients } from "@/hooks/usePlannerClients";
import { PlannerEvent } from "@/services/api/plannerService";

const PlannerCalendar = () => {
  const { toast } = useToast();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const { events, isLoading, error, upcomingEvents, eventsOnDate, createEvent, updateEvent, deleteEvent } = usePlannerEvents();
  const { clients, getClientName } = usePlannerClients();

  // Create/Edit dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PlannerEvent | null>(null);

  // View dialog state
  const [viewingEvent, setViewingEvent] = useState<PlannerEvent | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Delete confirmation state
  const [deletingEvent, setDeletingEvent] = useState<PlannerEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [eventForm, setEventForm] = useState({
    title: "",
    clientId: "none",
    eventDate: "",
    startTime: "",
    endTime: "",
    eventType: "meeting",
    location: "",
    description: "",
  });

  const canSubmit = useMemo(() => eventForm.title.trim() && eventForm.eventDate, [eventForm.title, eventForm.eventDate]);

  const resetForm = () => {
    setEventForm({
      title: "",
      clientId: "none",
      eventDate: "",
      startTime: "",
      endTime: "",
      eventType: "meeting",
      location: "",
      description: "",
    });
    setEditingEvent(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditDialog = (event: PlannerEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      clientId: event.client_id || "none",
      eventDate: event.event_date.split('T')[0],
      startTime: event.start_time || "",
      endTime: event.end_time || "",
      eventType: event.event_type,
      location: event.location || "",
      description: event.description || "",
    });
    setIsViewOpen(false);
    setIsCreateOpen(true);
  };

  const openViewDialog = (event: PlannerEvent) => {
    setViewingEvent(event);
    setIsViewOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingEvent) return;
    setIsDeleting(true);
    const success = await deleteEvent(deletingEvent.id);
    setIsDeleting(false);
    if (success) {
      setDeletingEvent(null);
      setIsViewOpen(false);
      setViewingEvent(null);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    const eventData = {
      title: eventForm.title.trim(),
      clientId: eventForm.clientId !== "none" ? eventForm.clientId : undefined,
      eventDate: eventForm.eventDate,
      startTime: eventForm.startTime || undefined,
      endTime: eventForm.endTime || undefined,
      eventType: eventForm.eventType as PlannerEvent["event_type"],
      location: eventForm.location.trim() || undefined,
      description: eventForm.description.trim() || undefined,
    };

    let success;
    if (editingEvent) {
      success = await updateEvent(editingEvent.id, eventData);
    } else {
      success = await createEvent(eventData);
    }

    setIsSubmitting(false);
    if (success) {
      setIsCreateOpen(false);
      resetForm();
    }
  };

  // Format time for display
  const formatTime = (timeStr: string | null): string => {
    if (!timeStr) return 'All Day';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "wedding": return "bg-pink-100 text-pink-800";
      case "meeting": return "bg-blue-100 text-blue-800";
      case "visit": return "bg-green-100 text-green-800";
      case "consultation": return "bg-purple-100 text-purple-800";
      case "rehearsal": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get past events
  const pastEvents = events.filter(e => {
    const eventDate = new Date(e.event_date);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return eventDate < todayStart;
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const eventsForDate = eventsOnDate(date);

      if (eventsForDate.length > 0) {
        toast({
          title: `Events on ${date.toLocaleDateString()}`,
          description: (
            <ul className="mt-2 space-y-1">
              {eventsForDate.map((event) => (
                <li key={event.id} className="text-sm">
                  {formatTime(event.start_time)} - {event.title}
                </li>
              ))}
            </ul>
          ),
        });
      } else {
        toast({
          title: "No events",
          description: `No events scheduled for ${date.toLocaleDateString()}`,
        });
      }
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const renderEventList = (eventList: PlannerEvent[]) => {
    const filteredEvents = selectedFilter
      ? eventList.filter(event => event.event_type === selectedFilter)
      : eventList;

    if (filteredEvents.length === 0) {
      return (
        <p className="text-center text-muted-foreground py-4">
          No events to show
        </p>
      );
    }

    return filteredEvents
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      .map((event) => {
        const eventDate = new Date(event.event_date);
        return (
          <div
            key={event.id}
            className="flex items-center p-3 hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
            onClick={() => openViewDialog(event)}
          >
            <div className="mr-3 flex-shrink-0">
              <div className="w-12 h-12 bg-primary/10 rounded-md flex flex-col items-center justify-center">
                <span className="text-xs font-medium">
                  {eventDate.toLocaleDateString('default', { month: 'short' })}
                </span>
                <span className="text-lg font-bold leading-none">{eventDate.getDate()}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{event.title}</h3>
              <p className="text-sm text-muted-foreground">{formatTime(event.start_time)}</p>
            </div>
            <Badge variant="secondary" className={`${getEventTypeColor(event.event_type)} ml-2`}>
              {event.event_type}
            </Badge>
          </div>
        );
      });
  };

  // Loading state
  if (isLoading) {
    return (
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
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 flex items-start justify-center">
          <div className="mt-16 max-w-md w-full text-center space-y-4 p-10 rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className="text-4xl">🗓️</div>
            <h2 className="text-xl font-serif font-medium">Calendar unavailable</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We couldn't load your calendar right now. Please try again in a moment.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-serif">Calendar</h1>
            <p className="text-muted-foreground">Manage your schedule and appointments</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium">
                  {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Calendar
                mode="single"
                className="rounded-md border shadow-sm"
                onSelect={handleDateSelect}
                selected={today}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <Tabs defaultValue="upcoming">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
                    <TabsTrigger value="past">Past ({pastEvents.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming" className="space-y-2 max-h-[400px] overflow-y-auto">
                    {renderEventList(upcomingEvents)}
                  </TabsContent>

                  <TabsContent value="past" className="space-y-2 max-h-[400px] overflow-y-auto">
                    {renderEventList(pastEvents)}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Quick Filters</h3>
                <div className="space-y-2">
                  <Button
                    variant={selectedFilter === null ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter(null)}
                  >
                    All Events
                  </Button>
                  <Button
                    variant={selectedFilter === "wedding" ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter("wedding")}
                  >
                    Weddings
                  </Button>
                  <Button
                    variant={selectedFilter === "meeting" ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter("meeting")}
                  >
                    Meetings
                  </Button>
                  <Button
                    variant={selectedFilter === "visit" ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter("visit")}
                  >
                    Venue Visits
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* View Event Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-xl">{viewingEvent?.title}</DialogTitle>
                <DialogDescription className="mt-1">
                  <Badge variant="secondary" className={`${getEventTypeColor(viewingEvent?.event_type || '')} mt-2`}>
                    {viewingEvent?.event_type}
                  </Badge>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {viewingEvent && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(viewingEvent.event_date)}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatTime(viewingEvent.start_time)}
                  {viewingEvent.end_time && ` - ${formatTime(viewingEvent.end_time)}`}
                </span>
              </div>

              {viewingEvent.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{viewingEvent.location}</span>
                </div>
              )}

              {viewingEvent.client_id && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{clients.find(c => c.id === viewingEvent.client_id)
                    ? getClientName(clients.find(c => c.id === viewingEvent.client_id)!)
                    : 'Client'}</span>
                </div>
              )}

              {viewingEvent.description && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewingEvent.description}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeletingEvent(viewingEvent)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
              <Button size="sm" onClick={() => viewingEvent && openEditDialog(viewingEvent)}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Event Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => {
        setIsCreateOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit event' : 'Add new event'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={eventForm.title}
                onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Venue walkthrough"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <Select
                value={eventForm.clientId}
                onValueChange={(value) => setEventForm((prev) => ({ ...prev, clientId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {getClientName(client)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Event type</label>
              <Select
                value={eventForm.eventType}
                onValueChange={(value) => setEventForm((prev) => ({ ...prev, eventType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Event type" />
                </SelectTrigger>
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
              <Input
                type="date"
                value={eventForm.eventDate}
                onChange={(e) => setEventForm((prev) => ({ ...prev, eventDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start time</label>
              <Input
                type="time"
                value={eventForm.startTime}
                onChange={(e) => setEventForm((prev) => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End time</label>
              <Input
                type="time"
                value={eventForm.endTime}
                onChange={(e) => setEventForm((prev) => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                value={eventForm.location}
                onChange={(e) => setEventForm((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Venue or address"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={eventForm.description}
                onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Add details..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!canSubmit || isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? "Saving..." : editingEvent ? "Update event" : "Create event"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlannerCalendar;
