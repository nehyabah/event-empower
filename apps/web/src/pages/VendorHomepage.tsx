
import { formatCurrency } from "@/lib/currency";
import ApprovalCelebration from "@/components/auth/ApprovalCelebration";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Users, 
  Star, 
  MessageSquare, 
  BarChart4, 
  Settings, 
  Camera, 
  Building,
  Plus,
  Mail,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { vendorService, VendorDashboard, VendorInquiry, VendorWorkspaceProject } from "@/services/api/vendorService";
import InquiryDetailModal from "@/components/vendors/InquiryDetailModal";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useCalendar } from "@/hooks/useCalendar";
import NextEventCard from "@/components/calendar/NextEventCard";
import NotificationsCard from "@/components/notifications/NotificationsCard";

const VendorHomepage = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<VendorDashboard | null>(null);
  const [inquiryList, setInquiryList] = useState<VendorInquiry[]>([]);
  const [workspaceProjects, setWorkspaceProjects] = useState<VendorWorkspaceProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    clientName: "",
    eventDate: "",
    eventType: "Wedding",
    status: "pending" as "pending" | "confirmed" | "completed" | "cancelled",
    totalAmount: "",
    notes: "",
  });
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  // Drives the "next event" card; the full grid lives on /vendor-calendar.
  const { nextEvent, isLoading: isCalendarLoading } = useCalendar();

  const vendorName = dashboard?.profile.business_name || "Vendor";
  const firstName = vendorName.split(' ')[0];
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const upcomingEvents = useMemo(() => {
    return (dashboard?.upcoming_events || []).map((event) => ({
      id: event.id,
      name: event.client_name,
      rawDate: event.event_date,
      date: new Date(event.event_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      type: event.event_type || "Wedding",
      status: event.status,
    }));
  }, [dashboard]);

  const inquiries = useMemo(() => {
    const source = inquiryList.length > 0 ? inquiryList : dashboard?.inquiries || [];
    return source.map((inquiry) => ({
      id: inquiry.id,
      name: inquiry.sender_name,
      date: new Date(inquiry.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      message: inquiry.message,
      status: inquiry.status,
      notes: 'notes' in inquiry ? inquiry.notes : null,
      email: 'sender_email' in inquiry ? inquiry.sender_email : null,
      eventDate: 'event_date' in inquiry ? inquiry.event_date : null,
    }));
  }, [dashboard, inquiryList]);

  const resetEventForm = () => {
    setEventForm({
      clientName: "",
      eventDate: "",
      eventType: "Wedding",
      status: "pending",
      totalAmount: "",
      notes: "",
    });
  };

  const handleOpenInquiry = (inquiryId: string) => {
    setSelectedInquiryId(inquiryId);
    setIsInquiryModalOpen(true);
  };

  const handleInquiryStatusChange = (inquiryId: string, newStatus: 'new' | 'replied' | 'archived') => {
    setInquiryList((prev) =>
      prev.map((item) => (item.id === inquiryId ? { ...item, status: newStatus } : item))
    );
    // Update dashboard stats if we're changing from/to "new" status
    setDashboard((prev) => {
      if (!prev) return prev;
      const oldInquiry = inquiryList.find((i) => i.id === inquiryId);
      if (!oldInquiry) return prev;

      let newCount = prev.stats.inquiries_new;
      if (oldInquiry.status === "new" && newStatus !== "new") {
        newCount = Math.max(0, newCount - 1);
      } else if (oldInquiry.status !== "new" && newStatus === "new") {
        newCount = newCount + 1;
      }

      return {
        ...prev,
        stats: { ...prev.stats, inquiries_new: newCount },
      };
    });
  };

  const handleSaveEvent = async () => {
    if (!eventForm.clientName.trim() || !eventForm.eventDate) {
      setError("Client name and event date are required.");
      return;
    }

    try {
      setIsSavingEvent(true);
      const payload = {
        clientName: eventForm.clientName.trim(),
        eventDate: eventForm.eventDate,
        eventType: eventForm.eventType,
        status: eventForm.status,
        totalAmount: eventForm.totalAmount,
        notes: eventForm.notes,
      };

      if (editingEventId) await vendorService.updateVendorBooking(editingEventId, payload);
      else await vendorService.createVendorBooking(payload);

      resetEventForm();
      setIsAddingEvent(false);
      setEditingEventId(null);
      // Re-read rather than patching stats by hand: "upcoming" now depends on
      // the date, so the server is the only place that can compute it.
      await fetchDashboard();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create event";
      setError(message);
    } finally {
      setIsSavingEvent(false);
    }
  };

  const hasLoadedRef = useRef(false);

  const fetchDashboard = useCallback(async () => {
    try {
      if (!hasLoadedRef.current) setIsLoading(true);
      const [data, projects] = await Promise.all([
        vendorService.getVendorDashboard(),
        vendorService.getVendorWorkspace().catch(() => []),
      ]);
      setDashboard(data);
      setWorkspaceProjects(projects);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load vendor dashboard";
      if (!hasLoadedRef.current) setError(message);
    } finally {
      hasLoadedRef.current = true;
      setIsLoading(false);
    }
  }, []);

  const fetchInquiries = useCallback(async () => {
    try {
      const data = await vendorService.listVendorInquiries();
      setInquiryList(data);
    } catch {
      // Keep whatever inquiries are already on screen.
    } finally {
      setIsLoadingInquiries(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
    void fetchInquiries();
  }, [fetchDashboard, fetchInquiries]);

  // New inquiries and bookings should appear without a manual reload.
  useAutoRefresh(() => Promise.all([fetchDashboard(), fetchInquiries()]));
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ApprovalCelebration />
      <main className="flex-grow pt-20 md:pt-24 pb-16">
        {user?.approvalStatus === 'pending' && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
            <div className="container mx-auto flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              {/* 'pending' is set at signup, so on its own it says nothing about
                  whether they have actually sent anything in to review yet. */}
              {user.onboardingSubmittedAt ? (
                <div>
                  <p className="text-sm font-medium text-amber-900">Your account is pending approval</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    We're reviewing your business details. You'll get an email once approved — usually within 1 working day. You won't appear in the marketplace until then.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-amber-900">Finish setting up your profile</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    We can't review your account until you've added your business details.{" "}
                    <Link to="/vendor-profile" className="underline font-medium">Complete your profile</Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        {user?.approvalStatus === 'rejected' && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3">
            <div className="container mx-auto flex items-start gap-3">
              <Clock className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Account application not approved</p>
                <p className="text-xs text-red-700 mt-0.5">
                  Please contact support for more information about your application status.
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="container mx-auto px-4 space-y-8 md:space-y-10">
          <section className="text-center md:text-left">
            <h1 className="font-serif text-2xl md:text-4xl mb-2">
              Welcome back, <span className="text-primary">{capitalizedName}</span>!
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
              Manage your wedding services, bookings, and client inquiries from your vendor dashboard.
            </p>
          </section>
          
          <section className="py-4 space-y-6">
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* What's next, and the way through to the full calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <NextEventCard
                  entry={nextEvent}
                  isLoading={isCalendarLoading}
                  action={
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/vendor-calendar">Open calendar</Link>
                    </Button>
                  }
                />
              </div>
              <NotificationsCard emptyHint="When a couple adds you to their wedding, it shows up here." />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="flex flex-col justify-center">
                <CardContent className="p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Calendar</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Manage bookings, meetings and site visits, and sync them to
                    Google or Apple Calendar.
                  </p>
                  <Button size="sm" className="mt-3 w-full" asChild>
                    <Link to="/vendor-calendar">
                      <Calendar className="mr-2 h-4 w-4" />
                      View calendar
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Upcoming Events"
                value={dashboard ? String(dashboard.stats.upcoming_events) : "--"}
                description={upcomingEvents[0] ? `Next event: ${upcomingEvents[0].date}` : "No upcoming events"}
                icon={Calendar}
              />
              <MetricCard 
                title="New Inquiries" 
                value={dashboard ? String(dashboard.stats.inquiries_new) : "--"} 
                description={dashboard ? `${dashboard.stats.inquiries_total} total inquiries` : "No inquiries yet"} 
                icon={MessageSquare} 
              />
              <MetricCard 
                title="Confirmed Events" 
                value={dashboard ? String(dashboard.stats.confirmed_events) : "--"} 
                description="Confirmed bookings" 
                icon={Users} 
              />
            </div>
          </section>
          
          <section className="py-4">
            <Tabs defaultValue="upcoming" className="w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-serif">Events & Inquiries</h2>
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
                  <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="upcoming" className="mt-0">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Upcoming Events</CardTitle>
                        <CardDescription>Manage your booked events</CardDescription>
                      </div>
                      <Button className="flex items-center gap-1" onClick={() => setIsAddingEvent(true)}>
                        <Plus className="h-4 w-4" />
                        Add Event
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-6 text-muted-foreground">Loading events...</div>
                    ) : upcomingEvents.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">No upcoming events yet.</div>
                    ) : (
                      upcomingEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between border-b py-4 last:border-b-0 last:pb-0">
                          <div className="flex items-center gap-4">
                            <div className="bg-primary/10 text-primary p-3 rounded-full">
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-medium">{event.name}</h3>
                              <p className="text-sm text-muted-foreground">{event.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{event.date}</div>
                            <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                              event.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                setEditingEventId(event.id);
                                setEventForm({
                                  clientName: event.name,
                                  eventDate: event.rawDate,
                                  eventType: event.type,
                                  status: event.status,
                                  totalAmount: "",
                                  notes: "",
                                });
                                setIsAddingEvent(true);
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                    
                    <div className="mt-4 text-center">
                      <Button variant="outline" className="w-full" disabled>
                        View All Events
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="inquiries" className="mt-0">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Client Inquiries</CardTitle>
                        <CardDescription>Respond to potential clients</CardDescription>
                      </div>
                      <Button variant="outline" className="flex items-center gap-1" disabled>
                        <Mail className="h-4 w-4" />
                        Compose
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading || isLoadingInquiries ? (
                      <div className="text-center py-6 text-muted-foreground">Loading inquiries...</div>
                    ) : inquiries.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">No inquiries yet.</div>
                    ) : (
                      inquiries.map((inquiry) => (
                        <div
                          key={inquiry.id}
                          className="flex items-center justify-between border-b py-4 last:border-b-0 last:pb-0 cursor-pointer hover:bg-muted/50 -mx-4 px-4 transition-colors"
                          onClick={() => handleOpenInquiry(inquiry.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${
                              inquiry.status === 'new' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                            }`}>
                              <MessageSquare className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-medium">{inquiry.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">{inquiry.message}</p>
                              {inquiry.eventDate && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Event date: {new Date(inquiry.eventDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                              <Clock className="h-3 w-3" />
                              {inquiry.date}
                            </div>
                            <div className={`text-xs px-2 py-1 mt-1 rounded-full inline-block ${
                              inquiry.status === 'new' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                            }`}>
                              {inquiry.status === 'new' ? 'New' : inquiry.status === 'replied' ? 'Replied' : 'Archived'}
                            </div>
                            <div className="mt-2 flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenInquiry(inquiry.id)}
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    
                    <div className="mt-4 text-center">
                      <Button variant="outline" className="w-full" disabled>
                        View All Inquiries
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="projects" className="mt-0">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>My Projects</CardTitle>
                    <CardDescription>Events where you are booked as a vendor</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-6 text-muted-foreground">Loading projects...</div>
                    ) : workspaceProjects.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">No projects yet.</div>
                    ) : (
                      <div className="space-y-4">
                        {workspaceProjects.map((project) => (
                          <div key={project.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-medium">{project.couple_names || "Unnamed Couple"}</h3>
                                {project.event_date && (
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(project.event_date).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                )}
                              </div>
                              {(() => {
                                switch (project.status) {
                                  case "inquired": return <Badge variant="secondary">Inquired</Badge>;
                                  case "quoted": return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Quoted</Badge>;
                                  case "booked": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Booked</Badge>;
                                  case "confirmed": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>;
                                  case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
                                }
                              })()}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {project.venue && (
                                <div>
                                  <span className="text-muted-foreground">Venue: </span>
                                  <span>{project.venue}</span>
                                </div>
                              )}
                              {project.category && (
                                <div>
                                  <span className="text-muted-foreground">Category: </span>
                                  <span>{project.category}</span>
                                </div>
                              )}
                              {project.amount !== null && project.amount !== undefined && (
                                <div>
                                  <span className="text-muted-foreground">Amount: </span>
                                  <span>
                                    {formatCurrency(project.amount)}
                                  </span>
                                </div>
                              )}
                              {project.planner_name && (
                                <div>
                                  <span className="text-muted-foreground">Planner: </span>
                                  <span>{project.planner_name}</span>
                                </div>
                              )}
                            </div>
                            {project.planner_email && (
                              <p className="text-xs text-muted-foreground">
                                Planner contact: {project.planner_email}
                              </p>
                            )}
                            {project.notes && (
                              <p className="text-xs text-muted-foreground border-t pt-2">{project.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          <section className="py-4">
            <h2 className="text-xl md:text-2xl font-serif mb-4">Manage Your Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ActionCard 
                title="Portfolio" 
                description="Update your work samples" 
                icon={Camera} 
                to="/vendor-portfolio"
                badgeText="Pro"
              />
              <ActionCard 
                title="Services" 
                description="Edit your offerings" 
                icon={Building} 
              />
              <ActionCard 
                title="Reviews" 
                description="View client feedback" 
                icon={Star} 
                badgeCount="3"
              />
              <ActionCard 
                title="Analytics" 
                description="View performance stats" 
                icon={BarChart4} 
                to="/vendor-analytics"
              />
            </div>
          </section>
        </div>
      </main>

      <Dialog
        open={isAddingEvent}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingEvent(false);
            setEditingEventId(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEventId ? "Edit Event" : "Add Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={eventForm.clientName}
                onChange={(event) => setEventForm((prev) => ({ ...prev, clientName: event.target.value }))}
                placeholder="e.g., Ayomide & Daniel"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventForm.eventDate}
                  onChange={(event) => setEventForm((prev) => ({ ...prev, eventDate: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Input
                  id="eventType"
                  value={eventForm.eventType}
                  onChange={(event) => setEventForm((prev) => ({ ...prev, eventType: event.target.value }))}
                  placeholder="Wedding, Engagement, etc."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={eventForm.status}
                  onChange={(event) =>
                    setEventForm((prev) => ({
                      ...prev,
                      status: event.target.value as "pending" | "confirmed",
                    }))
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount (Optional)</Label>
                <Input
                  id="totalAmount"
                  value={eventForm.totalAmount}
                  onChange={(event) => setEventForm((prev) => ({ ...prev, totalAmount: event.target.value }))}
                  placeholder="e.g., 250000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={eventForm.notes}
                onChange={(event) => setEventForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Add any extra details..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { resetEventForm(); setIsAddingEvent(false); }}>
                Cancel
              </Button>
              <Button onClick={handleSaveEvent} disabled={isSavingEvent}>
                {isSavingEvent ? "Saving..." : editingEventId ? "Update Event" : "Save Event"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <InquiryDetailModal
        open={isInquiryModalOpen}
        onOpenChange={setIsInquiryModalOpen}
        inquiryId={selectedInquiryId}
        mode="vendor"
        onStatusChange={handleInquiryStatusChange}
      />
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
}

const MetricCard = ({ title, value, description, icon: Icon, trend, trendUp }: MetricCardProps) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold">{value}</h3>
            {trend && (
              <span className={`text-xs ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {trend}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="bg-primary/10 p-3 rounded-full">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  to?: string;
  badgeText?: string;
  badgeCount?: string;
}

const ActionCard = ({ title, description, icon: Icon, to = "#", badgeText, badgeCount }: ActionCardProps) => (
  <Link to={to} className="block h-full">
    <Card className="h-full transition-all hover:shadow-md hover:-translate-y-1 overflow-hidden group">
      <CardContent className="p-6 relative">
        <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {badgeText && (
            <span className="bg-wedding-gold/20 text-wedding-gold text-xs px-2 py-1 rounded-full">
              {badgeText}
            </span>
          )}
          {badgeCount && (
            <span className="bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {badgeCount}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  </Link>
);

export default VendorHomepage;
