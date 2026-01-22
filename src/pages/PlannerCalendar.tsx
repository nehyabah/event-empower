
import { useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePlannerEvents } from "@/hooks/usePlannerEvents";
import { usePlannerClients } from "@/hooks/usePlannerClients";
import { PlannerEvent } from "@/services/api/plannerService";

const PlannerCalendar = () => {
  const { toast } = useToast();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const { events, isLoading, error, upcomingEvents, eventsOnDate, createEvent } = usePlannerEvents();
  const { clients, getClientName } = usePlannerClients();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    clientId: "none",
    eventDate: "",
    startTime: "",
    endTime: "",
    eventType: "meeting",
    location: "",
    description: "",
  });

  const canSubmit = useMemo(() => newEvent.title.trim() && newEvent.eventDate, [newEvent.title, newEvent.eventDate]);

  // Format time for display
  const formatTime = (timeStr: string | null): string => {
    if (!timeStr) return 'All Day';
    // timeStr is in HH:MM:SS format
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
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
          <div key={event.id} className="flex items-center p-3 hover:bg-muted/50 rounded-md transition-colors">
            <div className="mr-3 flex-shrink-0">
              <div className="w-12 h-12 bg-primary/10 rounded-md flex flex-col items-center justify-center">
                <span className="text-xs font-medium">
                  {eventDate.toLocaleDateString('default', { month: 'short' })}
                </span>
                <span className="text-lg font-bold leading-none">{eventDate.getDate()}</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{event.title}</h3>
              <p className="text-sm text-muted-foreground">{formatTime(event.start_time)}</p>
            </div>
            <Button variant="ghost" size="sm">View</Button>
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
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="p-8 text-center bg-red-50 rounded-lg">
            <p className="text-red-600">Error loading calendar: {error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
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
          <Button onClick={() => setIsCreateOpen(true)}>
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

                  <TabsContent value="upcoming" className="space-y-4">
                    {renderEventList(upcomingEvents)}
                  </TabsContent>

                  <TabsContent value="past" className="space-y-4">
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

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add new event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Venue walkthrough"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <Select
                value={newEvent.clientId}
                onValueChange={(value) => setNewEvent((prev) => ({ ...prev, clientId: value }))}
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
                value={newEvent.eventType}
                onValueChange={(value) => setNewEvent((prev) => ({ ...prev, eventType: value }))}
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
                value={newEvent.eventDate}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, eventDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start time</label>
              <Input
                type="time"
                value={newEvent.startTime}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End time</label>
              <Input
                type="time"
                value={newEvent.endTime}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                value={newEvent.location}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Venue or address"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Add details..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!canSubmit || isSubmitting}
              onClick={async () => {
                if (!canSubmit) return;
                setIsSubmitting(true);
                const created = await createEvent({
                  title: newEvent.title.trim(),
                  clientId: newEvent.clientId !== "none" ? newEvent.clientId : undefined,
                  eventDate: newEvent.eventDate,
                  startTime: newEvent.startTime || undefined,
                  endTime: newEvent.endTime || undefined,
                  eventType: newEvent.eventType as PlannerEvent["event_type"],
                  location: newEvent.location.trim() || undefined,
                  description: newEvent.description.trim() || undefined,
                });
                setIsSubmitting(false);
                if (created) {
                  setIsCreateOpen(false);
                  setNewEvent({
                    title: "",
                    clientId: "none",
                    eventDate: "",
                    startTime: "",
                    endTime: "",
                    eventType: "meeting",
                    location: "",
                    description: "",
                  });
                }
              }}
            >
              {isSubmitting ? "Saving..." : "Create event"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlannerCalendar;
