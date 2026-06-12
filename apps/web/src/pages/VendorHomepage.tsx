
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
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

const VendorHomepage = () => {
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

      const booking = editingEventId
        ? await vendorService.updateVendorBooking(editingEventId, payload)
        : await vendorService.createVendorBooking(payload);

      setDashboard((prev) => {
        if (!prev) return prev;
        const updated = {
          id: booking.id,
          client_name: booking.client_name,
          event_date: booking.event_date,
          event_type: booking.event_type,
          status: booking.status,
        };

        const existing = prev.upcoming_events.find((event) => event.id === booking.id);
        const upcoming_events = existing
          ? prev.upcoming_events.map((event) => (event.id === booking.id ? updated : event))
          : [updated, ...prev.upcoming_events];

        const uniqueUpcoming = upcoming_events.slice(0, 5);

        const confirmedDelta =
          (existing?.status === "confirmed" ? 1 : 0) !==
          (booking.status === "confirmed" ? 1 : 0)
            ? booking.status === "confirmed"
              ? 1
              : -1
            : 0;

        return {
          ...prev,
          stats: {
            ...prev.stats,
            upcoming_events: existing ? prev.stats.upcoming_events : prev.stats.upcoming_events + 1,
            confirmed_events: prev.stats.confirmed_events + confirmedDelta,
          },
          upcoming_events: uniqueUpcoming,
        };
      });

      resetEventForm();
      setIsAddingEvent(false);
      setEditingEventId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create event";
      setError(message);
    } finally {
      setIsSavingEvent(false);
    }
  };
  
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [data, projects] = await Promise.all([
          vendorService.getVendorDashboard(),
          vendorService.getVendorWorkspace().catch(() => []),
        ]);
        setDashboard(data);
        setWorkspaceProjects(projects);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load vendor dashboard";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setIsLoadingInquiries(true);
        const data = await vendorService.listVendorInquiries();
        setInquiryList(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load inquiries";
        setError(message);
      } finally {
        setIsLoadingInquiries(false);
      }
    };

    fetchInquiries();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 md:pt-24 pb-16">
        <div className="container mx-auto px-4 space-y-8 md:space-y-10">
          <section className="text-center md:text-left">
            <h1 className="font-serif text-2xl md:text-4xl mb-2">
              Welcome back, <span className="text-primary">{capitalizedName}</span>!
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
              Manage your wedding services, bookings, and client inquiries from your vendor dashboard.
            </p>
          </section>
          
          <section className="py-4">
            {error && (
              <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
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
                                    {new Intl.NumberFormat("en-US", {
                                      style: "currency",
                                      currency: "USD",
                                      maximumFractionDigits: 0,
                                    }).format(project.amount)}
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
      <Footer />

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
