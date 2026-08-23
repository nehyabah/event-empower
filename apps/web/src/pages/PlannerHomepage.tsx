import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckSquare, Users, Clock, ArrowRight, Plus } from "lucide-react";
import plannerService, { DashboardStats, PlannerTask } from "@/services/api/plannerService";
import { useAuth } from "@/context/AuthContext";
import NextEventCard from "@/components/calendar/NextEventCard";
import { useCalendar } from "@/hooks/useCalendar";

const PlannerHomepage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Next thing across the planner's own events, client weddings and deadlines.
  const { nextEvent: nextCalendarEntry, isLoading: isCalendarLoading } = useCalendar();

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        const data = await plannerService.getDashboardStats();
        if (isMounted) {
          setStats(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const nextEvent = stats?.upcomingEvents?.[0];
  const nextEventLabel = useMemo(() => {
    if (!nextEvent?.event_date) return null;
    const date = new Date(nextEvent.event_date);
    if (Number.isNaN(date.getTime())) return null;
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Happening today";
    if (diffDays === 1) return "Tomorrow";
    return `In ${diffDays} days`;
  }, [nextEvent]);

  const deadlineTasks = useMemo(() => {
    if (!stats) return [];
    const items = [...stats.overdueTasks, ...stats.dueSoonTasks];
    const seen = new Set<string>();
    return items.filter((task) => {
      if (seen.has(task.id)) return false;
      seen.add(task.id);
      return true;
    });
  }, [stats]);

  const taskCountMap = useMemo(() => {
    const map = new Map<string, number>();
    (stats?.taskCountsByClient || []).forEach((entry) => {
      if (entry.client_id) {
        map.set(entry.client_id, entry.total);
      }
    });
    return map;
  }, [stats]);

  const clientsPageSize = 6;
  const eventsPageSize = 5;
  const upcomingClientsPageSize = 5;
  const [clientsPage, setClientsPage] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);
  const [upcomingClientsPage, setUpcomingClientsPage] = useState(1);

  const combinedClients = useMemo(() => {
    return [...(stats?.activeClients || []), ...(stats?.upcomingClients || [])];
  }, [stats]);

  const clientPageCount = Math.max(1, Math.ceil(combinedClients.length / clientsPageSize));
  const pagedClients = combinedClients.slice(
    (clientsPage - 1) * clientsPageSize,
    clientsPage * clientsPageSize
  );

  const upcomingEvents = stats?.upcomingEvents || [];
  const eventsPageCount = Math.max(1, Math.ceil(upcomingEvents.length / eventsPageSize));
  const pagedEvents = upcomingEvents.slice(
    (eventsPage - 1) * eventsPageSize,
    eventsPage * eventsPageSize
  );

  const upcomingClientPageCount = Math.max(
    1,
    Math.ceil((stats?.upcomingClients?.length || 0) / upcomingClientsPageSize)
  );
  const pagedUpcomingClients = (stats?.upcomingClients || []).slice(
    (upcomingClientsPage - 1) * upcomingClientsPageSize,
    upcomingClientsPage * upcomingClientsPageSize
  );

  const renderDueLabel = (task: PlannerTask) => {
    if (!task.due_date) return "No due date";
    const due = new Date(task.due_date);
    if (Number.isNaN(due.getTime())) return "No due date";
    const today = new Date();
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `Due in ${diffDays} days`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {user?.approvalStatus === 'pending' && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-amber-50 border-b border-amber-200 px-4 py-3 mt-16">
          <div className="container mx-auto flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Account pending approval</p>
              <p className="text-xs text-amber-700 mt-0.5">
                We're verifying your details. You'll be notified within 1 working day once approved.
              </p>
            </div>
          </div>
        </div>
      )}
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-serif">Wedding Planner Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Manage your clients and upcoming events.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {error && (
              <Card className="border-destructive/40 bg-destructive/5">
                <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
              </Card>
            )}

            {/* What's next across every client, meeting and deadline */}
            <NextEventCard
              entry={nextCalendarEntry}
              isLoading={isCalendarLoading}
              action={
                <Button size="sm" variant="outline" asChild>
                  <Link to="/planner-calendar">Open calendar</Link>
                </Button>
              }
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? "--" : stats?.clients.active ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {isLoading ? "Loading..." : `${stats?.clients.total ?? 0} total clients`}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? "--" : stats?.events.upcoming ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {isLoading
                      ? "Loading..."
                      : nextEvent
                      ? `Next: ${nextEvent.title} (${nextEventLabel || "soon"})`
                      : "No upcoming events"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? "--" : stats?.tasks.pending ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {isLoading ? "Loading..." : `${stats?.tasks.highPriority ?? 0} high priority`}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? "--" : stats?.overdueTasks.length ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {isLoading ? "Loading..." : "Needs attention"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Your latest planning activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-80 overflow-y-auto">
                  {(stats?.recentTasks || []).slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-muted/50">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span>{task.client_name || "General"}</span>
                          <span className="mx-2">•</span>
                          <span>
                            {task.created_at
                              ? new Date(task.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                              : "Recent"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!isLoading && (!stats?.recentTasks || stats.recentTasks.length === 0) && (
                    <p className="text-sm text-muted-foreground">No recent activity yet.</p>
                  )}
                  <Button variant="link" size="sm" className="mt-2 w-full">
                    View all activities
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Deadlines</CardTitle>
                  <CardDescription>Tasks due in the next 7 days</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-80 overflow-y-auto">
                  {deadlineTasks.slice(0, 5).map((task) => {
                    const dueLabel = renderDueLabel(task);
                    const isOverdue = dueLabel === "Overdue";
                    return (
                      <div key={task.id} className="flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-muted/50">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task.title}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span className={isOverdue ? "text-red-500 font-medium" : "text-amber-500 font-medium"}>
                              {dueLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {!isLoading && deadlineTasks.length === 0 && (
                    <p className="text-sm text-muted-foreground">No deadlines in the next week.</p>
                  )}
                  <Button variant="link" size="sm" className="mt-2 w-full">
                    View all deadlines
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <Button onClick={() => navigate("/clients")} className="flex-1">
                <Users className="mr-2 h-4 w-4" />
                Manage Clients
              </Button>
              <Button onClick={() => navigate("/planner-tasks")} className="flex-1">
                <CheckSquare className="mr-2 h-4 w-4" />
                View All Tasks
              </Button>
              <Button onClick={() => navigate("/planner-calendar")} className="flex-1">
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-medium">Your Client List</h2>
              <Button onClick={() => navigate("/clients")}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Client
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {isLoading && (
                <div className="col-span-full text-sm text-muted-foreground">Loading clients...</div>
              )}
              {!isLoading && pagedClients.length ? (
                pagedClients.map((client) => (
                    <Card key={client.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          {client.partner1_name} & {client.partner2_name}
                        </CardTitle>
                        <CardDescription>
                          Event Date: {client.event_date ? new Date(client.event_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "TBD"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Venue: {client.venue || "Venue TBD"}</p>
                          <p className="text-sm text-muted-foreground">Guests: {client.guest_count || "TBD"}</p>
                          <div className="flex justify-between text-sm pt-2">
                            <span className="text-blue-500 font-medium">Status: {client.status}</span>
                            <span className="text-green-500 font-medium">
                              Budget: {client.budget ? formatCurrency(client.budget) : "TBD"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Tasks: {taskCountMap.get(client.id) ?? 0}
                          </p>
                          <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate("/clients")}>
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                !isLoading && (
                  <div className="col-span-full p-8 text-center bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground">No clients yet. Add your first client.</p>
                  </div>
                )
              )}
            </div>

            {clientPageCount > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setClientsPage((prev) => Math.max(1, prev - 1))}
                  disabled={clientsPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setClientsPage((prev) => Math.min(clientPageCount, prev + 1))}
                  disabled={clientsPage === clientPageCount}
                >
                  Next
                </Button>
              </div>
            )}
            
            <Button variant="outline" className="w-full" onClick={() => navigate("/clients")}>
              View All Clients
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg mb-6">
              <h2 className="text-xl font-medium mb-2">Upcoming Events</h2>
              <div className="space-y-4">
                {isLoading && <p className="text-sm text-muted-foreground">Loading events...</p>}
                {!isLoading && pagedEvents.length ? (
                  pagedEvents.map((event) => (
                    <div key={event.id} className="flex justify-between items-center p-3 bg-background rounded-md shadow-sm">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.event_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} - {event.location || "Location TBD"}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => navigate("/planner-calendar")}>Details</Button>
                    </div>
                  ))
                ) : (
                  !isLoading && (
                    <div className="p-6 text-center bg-background rounded-md shadow-sm">
                      <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
                    </div>
                  )
                )}
              </div>
            </div>

            {eventsPageCount > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEventsPage((prev) => Math.max(1, prev - 1))}
                  disabled={eventsPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEventsPage((prev) => Math.min(eventsPageCount, prev + 1))}
                  disabled={eventsPage === eventsPageCount}
                >
                  Next
                </Button>
              </div>
            )}
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h2 className="text-xl font-medium mb-2">Clients with Upcoming Dates</h2>
              <div className="space-y-4">
                {isLoading && <p className="text-sm text-muted-foreground">Loading clients...</p>}
                {!isLoading && pagedUpcomingClients.length ? (
                  pagedUpcomingClients.map((client) => (
                    <div key={client.id} className="flex justify-between items-center p-3 bg-background rounded-md shadow-sm">
                      <div>
                        <p className="font-medium">{client.partner1_name} & {client.partner2_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {client.event_date ? new Date(client.event_date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Date TBD"} - {client.venue || "Venue TBD"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tasks: {taskCountMap.get(client.id) ?? 0}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => navigate("/clients")}>Details</Button>
                    </div>
                  ))
                ) : (
                  !isLoading && (
                    <div className="p-6 text-center bg-background rounded-md shadow-sm">
                      <p className="text-sm text-muted-foreground">No upcoming client dates yet.</p>
                    </div>
                  )
                )}
              </div>
            </div>

            {upcomingClientPageCount > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUpcomingClientsPage((prev) => Math.max(1, prev - 1))}
                  disabled={upcomingClientsPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUpcomingClientsPage((prev) => Math.min(upcomingClientPageCount, prev + 1))}
                  disabled={upcomingClientsPage === upcomingClientPageCount}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PlannerHomepage;
