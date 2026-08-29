import { useCallback, useEffect, useState } from "react";
import { formatNumber } from "@/lib/number";
import { formatCurrency } from "@/lib/currency";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, Circle, Plus, Search, Lock, CalendarDays, MapPin, Users, DollarSign, Mail, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/services/api/client";
// Aliased: `ExpenseSummary` is also the name of the component imported below.
import {
  userService, ReviewableVendor, VendorReview,
  ExpenseSummary as ExpenseSummaryData,
} from "@/services/api/userService";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import ClientCalendarTab from "@/components/calendar/ClientCalendarTab";
import { formatDateOnly, daysUntilDate } from "@/lib/dates";
import VendorReviewDialog from "@/components/vendors/VendorReviewDialog";
import { VisionBoardCanvas } from "@/components/workspace/VisionBoardCanvas";
import WorkspaceChat from "@/components/workspace/WorkspaceChat";
import TodoList from "@/components/todos/TodoList";
import CreateTodoList from "@/components/todos/CreateTodoList";
import { TodoProvider } from "@/context/TodoContext";
import ExpenseSummary from "@/components/expenses/ExpenseSummary";
import ExpenseList from "@/components/expenses/ExpenseList";
import ExpenseCategories from "@/components/expenses/ExpenseCategories";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import { ExpenseProvider } from "@/context/ExpenseContext";

// ── Types ─────────────────────────────────────────────────────────────────────

interface WorkspaceEvent {
  id: string;
  partner1_name: string | null;
  partner2_name: string | null;
  event_date: string | null;
  venue: string | null;
  total_budget: number;
  guest_count_estimate: number;
}

interface WorkspacePlanner {
  planner_id: string;
  planner_name: string | null;
  planner_email: string | null;
}

interface WorkspaceVendor {
  id: string;
  vendor_profile_id: string;
  business_name?: string;
  vendor_category?: string;
  category: string | null;
  status: "inquired" | "quoted" | "booked" | "confirmed" | "cancelled";
  amount: number | null;
  notes: string | null;
}

interface WorkspaceTodoItem {
  id: string;
  text: string;
  completed: boolean;
  status: "todo" | "in_progress" | "done";
}

interface WorkspaceTodoList {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  items: WorkspaceTodoItem[];
}

interface WorkspaceGuestStats {
  total: number;
  confirmed: number;
  pending: number;
  declined: number;
  maybe: number;
}

interface WorkspaceData {
  event: WorkspaceEvent;
  planner: WorkspacePlanner | null;
  vendors: WorkspaceVendor[];
  sharedTodos: WorkspaceTodoList[];
  guestStats: WorkspaceGuestStats;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (d: string | null) =>
  formatDateOnly(d, { month: "long", day: "numeric", year: "numeric" }, "en-US") ?? "TBD";


const vendorBadge = (status: WorkspaceVendor["status"]) => {
  const map = {
    inquired: <Badge variant="secondary">Inquired</Badge>,
    quoted:   <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Quoted</Badge>,
    booked:   <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Booked</Badge>,
    confirmed:<Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>,
    cancelled:<Badge variant="destructive">Cancelled</Badge>,
  };
  return map[status];
};

// ── Page ──────────────────────────────────────────────────────────────────────

const Workspace = () => {
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noEvent, setNoEvent] = useState(false);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [todoSearch, setTodoSearch] = useState("");
  const [todoTab, setTodoTab] = useState<"all" | "private" | "active" | "completed">("all");
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseTab, setExpenseTab] = useState<"all" | "categories">("all");
  // Vendor reviews: map of vendor_profile_id -> the couple's existing review
  const [reviews, setReviews] = useState<Record<string, VendorReview>>({});
  const [reviewTarget, setReviewTarget] = useState<{ id: string; name: string } | null>(null);
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummaryData | null>(null);

  const loadWorkspace = useCallback(async () => {
    const r = await apiClient.get<WorkspaceData>("/users/workspace");
    if (r.error) {
      // Only surface an error on the first load; a failed background refresh
      // keeps the workspace on screen.
      if (workspace) return;
      if (r.status === 401) setError("session-expired");
      else if (r.status === 404 || r.error.toLowerCase().includes("not found")) setNoEvent(true);
      else setError("server");
    } else {
      setWorkspace(r.data || null);
      if (!r.data) setNoEvent(true);
    }
  }, [workspace]);

  const loadSummaries = useCallback(async () => {
    // Budget balance for the overview stat.
    await userService.getExpenseSummary()
      .then(setExpenseSummary)
      .catch(() => { /* non-critical */ });

    // Any reviews the couple has already left.
    await userService.getReviewableVendors()
      .then((list: ReviewableVendor[]) => {
        const map: Record<string, VendorReview> = {};
        list.forEach((v) => { if (v.review) map[v.vendor_profile_id] = v.review; });
        setReviews(map);
      })
      .catch(() => { /* non-critical */ });
  }, []);

  useEffect(() => {
    Promise.all([loadWorkspace().catch(() => setError("network")), loadSummaries()])
      .finally(() => setIsLoading(false));
    // Run once on mount; refreshes are handled by useAutoRefresh below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The planner and both partners edit this data, so keep it current.
  useAutoRefresh(() => Promise.all([loadWorkspace(), loadSummaries()]));

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading workspace…</p>
        </div>
      </main>
    </div>
  );

  if (error) {
    const isSessionExpired = error === "session-expired";
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 flex items-start justify-center">
          <div className="mt-16 max-w-md w-full text-center space-y-4 p-10 rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className="text-4xl">{isSessionExpired ? "🔑" : "🌿"}</div>
            <h2 className="text-xl font-serif font-medium">
              {isSessionExpired ? "Session expired" : error === "network" ? "Connection lost" : "Something went wrong"}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {isSessionExpired
                ? "Your session has timed out. Please sign in again to continue planning."
                : error === "network"
                ? "We couldn't reach the server. Check your internet connection and try again."
                : "We ran into an unexpected issue loading your workspace. Please try again in a moment."}
            </p>
            {isSessionExpired ? (
              <Button asChild className="mt-2">
                <Link to="/login">Sign in</Link>
              </Button>
            ) : (
              <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                Try again
              </Button>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (noEvent || !workspace) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24">
        <div className="p-8 text-center bg-muted/50 rounded-lg max-w-md mx-auto">
          <h2 className="text-xl font-serif mb-2">No event set up yet</h2>
          <p className="text-muted-foreground mb-4">Set up your event details to see your workspace.</p>
          <Button asChild><Link to="/dashboard">Go to Dashboard</Link></Button>
        </div>
      </main>
    </div>
  );

  const { event, planner, vendors, sharedTodos, guestStats } = workspace;
  const coupleNames = [event.partner1_name, event.partner2_name].filter(Boolean).join(" & ") || "Your Wedding";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-3 sm:px-4 pt-24 pb-16">
        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex w-full justify-start overflow-x-auto no-scrollbar mb-6 h-auto p-1 gap-1 bg-muted/60 rounded-lg sm:grid sm:grid-cols-6 sm:h-10">
            <TabsTrigger value="overview"    className="shrink-0 whitespace-nowrap rounded-md px-3 text-xs sm:text-sm sm:px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
            <TabsTrigger value="calendar"    className="shrink-0 whitespace-nowrap rounded-md px-3 text-xs sm:text-sm sm:px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Calendar</TabsTrigger>
              <TabsTrigger value="visionboard" className="shrink-0 whitespace-nowrap rounded-md px-3 text-xs sm:text-sm sm:px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Mood Board
            </TabsTrigger>
            <TabsTrigger value="todos"       className="shrink-0 whitespace-nowrap rounded-md px-3 text-xs sm:text-sm sm:px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">To-Do Lists</TabsTrigger>
            <TabsTrigger value="budget"      className="shrink-0 whitespace-nowrap rounded-md px-3 text-xs sm:text-sm sm:px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Budget</TabsTrigger>
            <TabsTrigger value="chat"        className="shrink-0 whitespace-nowrap rounded-md px-3 text-xs sm:text-sm sm:px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Chat</TabsTrigger>
          </TabsList>

          {/* ── Calendar ─────────────────────────────────────────────────── */}
          <TabsContent value="calendar">
            <ClientCalendarTab />
          </TabsContent>

          {/* ── Chat ─────────────────────────────────────────────────────── */}
          <TabsContent value="chat">
            <WorkspaceChat eventId={event.id} />
          </TabsContent>

          {/* ── Overview ─────────────────────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-5">

            {/* Hero banner */}
            <div className="relative rounded-2xl overflow-hidden text-white" style={{ background: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)" }}>
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse at 15% 60%, rgba(180,130,80,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(120,90,55,0.14) 0%, transparent 50%)" }} />
              <div className="relative px-5 py-6 sm:px-8 sm:py-8">
                <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-2 font-medium">Your Wedding</p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium tracking-tight mb-3 sm:mb-4 break-words">{coupleNames}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-stone-300">
                  {event.event_date && (
                    <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-stone-400 shrink-0" />{formatDate(event.event_date)}</span>
                  )}
                  {event.venue && (
                    <span className="flex items-center gap-1.5 min-w-0"><MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" /><span className="truncate">{event.venue}</span></span>
                  )}
                  {event.guest_count_estimate > 0 && (
                    <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-stone-400 shrink-0" />{formatNumber(event.guest_count_estimate)} guests</span>
                  )}
                </div>
                {event.event_date && (() => {
                  const days = daysUntilDate(event.event_date) ?? 0;
                  if (days > 0) return (
                    <div className="mt-4 sm:mt-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <span className="text-lg font-bold" style={{ color: "#e4b96a" }}>{days}</span>
                      <span className="text-stone-300">days to go</span>
                    </div>
                  );
                  if (days === 0) return <div className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold" style={{ background: "rgba(228,185,106,0.15)", color: "#e4b96a" }}>Today is the day!</div>;
                  return null;
                })()}
              </div>
            </div>

            {/* Quick stats */}
            {(() => {
              const bookedVendors = vendors.filter(v => v.status === "booked" || v.status === "confirmed").length;
              const allItems = sharedTodos.flatMap(l => l.items);
              const doneItems = allItems.filter(i => i.completed).length;
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  <div className="rounded-xl border border-border/60 bg-card p-3 sm:p-4 space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Guests RSVP'd</p>
                    <p className="text-xl sm:text-2xl font-bold">{formatNumber(guestStats.confirmed)}<span className="text-sm font-normal text-muted-foreground"> / {formatNumber(guestStats.total)}</span></p>
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: guestStats.total > 0 ? `${(guestStats.confirmed / guestStats.total) * 100}%` : "0%" }} />
                    </div>
                  </div>
                  {/* Budget with the outstanding balance, not just the allocation */}
                  <div className="rounded-xl border border-border/60 bg-card p-3 sm:p-4 space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Budget</p>
                    <p className="text-xl sm:text-2xl font-bold">{event.total_budget ? formatCurrency(event.total_budget) : "—"}</p>
                    {expenseSummary && expenseSummary.total_unpaid > 0 ? (
                      <p className={`text-xs font-medium ${expenseSummary.overdue_count > 0 ? "text-red-600" : "text-amber-600"}`}>
                        {formatCurrency(expenseSummary.total_unpaid)} balance owed
                        {expenseSummary.overdue_count > 0 && " · overdue"}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {expenseSummary ? "all settled" : "total allocated"}
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card p-3 sm:p-4 space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Vendors</p>
                    <p className="text-xl sm:text-2xl font-bold">{bookedVendors}<span className="text-sm font-normal text-muted-foreground"> / {vendors.length}</span></p>
                    <p className="text-xs text-muted-foreground">booked or confirmed</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card p-3 sm:p-4 space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Tasks</p>
                    <p className="text-xl sm:text-2xl font-bold">{doneItems}<span className="text-sm font-normal text-muted-foreground"> / {allItems.length}</span></p>
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: allItems.length > 0 ? `${(doneItems / allItems.length) * 100}%` : "0%" }} />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Vendor roster + sidebar */}
            <div className="grid gap-5 md:grid-cols-5">

              {/* Vendor roster */}
              <Card className="md:col-span-3">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Vendor Roster</CardTitle>
                    <span className="text-xs text-muted-foreground">{vendors.length} {vendors.length === 1 ? "vendor" : "vendors"}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {vendors.length === 0 ? (
                    <div className="px-6 pb-6 text-sm text-muted-foreground text-center py-4">
                      No vendors yet.{" "}
                      <Link to="/vendors" className="text-primary underline underline-offset-2">Browse vendors</Link>
                    </div>
                  ) : (
                    vendors.map((v, i) => {
                      const canReview = v.status === "booked" || v.status === "confirmed";
                      const existing = reviews[v.vendor_profile_id];
                      return (
                      <div key={v.id} className={`flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors ${i < vendors.length - 1 ? "border-b border-border/40" : ""}`}>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{v.business_name || "Unnamed Vendor"}</p>
                          {(v.vendor_category || v.category) && <p className="text-xs text-muted-foreground capitalize">{v.vendor_category || v.category}</p>}
                        </div>
                        {v.amount != null && v.amount > 0 && <p className="text-sm tabular-nums text-muted-foreground shrink-0">{formatCurrency(v.amount)}</p>}
                        {vendorBadge(v.status)}
                        {canReview && (
                          existing ? (
                            <button
                              onClick={() => setReviewTarget({ id: v.vendor_profile_id, name: v.business_name || "Vendor" })}
                              className="flex items-center gap-1 shrink-0 rounded-md px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors"
                              title="Edit your review"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {existing.rating.toFixed(1)}
                            </button>
                          ) : (
                            <Button
                              variant="outline" size="sm"
                              className="h-7 shrink-0 text-xs gap-1"
                              onClick={() => setReviewTarget({ id: v.vendor_profile_id, name: v.business_name || "Vendor" })}
                            >
                              <Star className="w-3.5 h-3.5" /> Rate
                            </Button>
                          )
                        )}
                      </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              {/* Right sidebar */}
              <div className="md:col-span-2 space-y-5">

                {/* Planner */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Your Planner</CardTitle></CardHeader>
                  <CardContent>
                    {planner ? (
                      <div className="space-y-2">
                        <p className="font-semibold">{planner.planner_name || "Your Planner"}</p>
                        {planner.planner_email && (
                          <a href={`mailto:${planner.planner_email}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <Mail className="h-3.5 w-3.5 shrink-0" />{planner.planner_email}
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed">No planner linked yet. Ask your planner to send you an invite link.</p>
                    )}
                  </CardContent>
                </Card>

                {/* RSVP breakdown */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">RSVP Breakdown</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: "Confirmed", value: guestStats.confirmed, color: "bg-emerald-500" },
                      { label: "Pending",   value: guestStats.pending,   color: "bg-amber-400"  },
                      { label: "Declined",  value: guestStats.declined,  color: "bg-rose-400"   },
                    ].map(({ label, value, color }) => {
                      const pct = guestStats.total > 0 ? Math.round((value / guestStats.total) * 100) : 0;
                      return (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-medium tabular-nums">{value} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    <Separator className="my-1" />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Total invited</span>
                      <span className="font-semibold">{formatNumber(guestStats.total)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Shared checklists */}
                {sharedTodos.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Checklists</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {sharedTodos.slice(0, 5).map(list => {
                        const done  = list.items.filter(i => i.completed).length;
                        const total = list.items.length;
                        const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
                        return (
                          <div key={list.id}>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-medium truncate mr-2">{list.title}</span>
                              <span className="text-muted-foreground shrink-0 tabular-nums">{done}/{total}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

              </div>
            </div>

          </TabsContent>

          {/* ── Vision Board ─────────────────────────────────────────────── */}
          <TabsContent value="visionboard" className="mt-0">
            <div className="h-[calc(100dvh-230px)] min-h-[360px] sm:min-h-[500px] rounded-xl overflow-hidden border">
              <VisionBoardCanvas />
            </div>
          </TabsContent>

          {/* ── To-Do Lists ──────────────────────────────────────────────── */}
          <TabsContent value="todos">
            <TodoProvider>
              <div className="space-y-4">
                {/* Controls */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={todoSearch} onChange={e => setTodoSearch(e.target.value)} placeholder="Search lists…" className="pl-9" />
                  </div>
                  <Button onClick={() => setIsCreatingList(true)} className="gap-2 shrink-0">
                    <Plus size={16} /> New List
                  </Button>
                </div>

                {isCreatingList && (
                  <div className="bg-card rounded-lg p-4 sm:p-6 shadow-sm border">
                    <CreateTodoList onCancel={() => setIsCreatingList(false)} />
                  </div>
                )}

                <Tabs value={todoTab} onValueChange={v => setTodoTab(v as typeof todoTab)}>
                  <TabsList className="grid grid-cols-4 w-full sm:w-auto sm:inline-grid h-9 p-1 bg-muted/60 rounded-lg mb-4">
                    <TabsTrigger value="all"       className="text-xs sm:text-sm rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">All</TabsTrigger>
                    <TabsTrigger value="private"   className="text-xs sm:text-sm rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1"><Lock className="h-3 w-3" />Private</TabsTrigger>
                    <TabsTrigger value="active"    className="text-xs sm:text-sm rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Active</TabsTrigger>
                    <TabsTrigger value="completed" className="text-xs sm:text-sm rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Done</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all">       <TodoList filter="all"       searchQuery={todoSearch} /></TabsContent>
                  <TabsContent value="private">   <TodoList filter="private"   searchQuery={todoSearch} /></TabsContent>
                  <TabsContent value="active">    <TodoList filter="active"    searchQuery={todoSearch} /></TabsContent>
                  <TabsContent value="completed"> <TodoList filter="completed" searchQuery={todoSearch} /></TabsContent>
                </Tabs>
              </div>
            </TodoProvider>
          </TabsContent>

          {/* ── Budget ───────────────────────────────────────────────────── */}
          <TabsContent value="budget">
            <ExpenseProvider>
              <div className="space-y-4">
                <ExpenseSummary />
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-serif">Expenses</h2>
                  <Button onClick={() => setIsAddingExpense(true)} className="gap-2" size="sm">
                    <Plus size={16} /><span className="hidden sm:inline">Add Expense</span><span className="sm:hidden">Add</span>
                  </Button>
                </div>
                {isAddingExpense && (
                  <div className="bg-card rounded-lg p-4 sm:p-6 shadow-sm border">
                    <ExpenseForm onCancel={() => setIsAddingExpense(false)} />
                  </div>
                )}
                <Tabs value={expenseTab} onValueChange={v => setExpenseTab(v as typeof expenseTab)}>
                  <TabsList className="grid grid-cols-2 w-full sm:w-auto sm:inline-grid h-9 p-1 bg-muted/60 rounded-lg mb-4">
                    <TabsTrigger value="all"        className="text-xs sm:text-sm rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">All Expenses</TabsTrigger>
                    <TabsTrigger value="categories" className="text-xs sm:text-sm rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Categories</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all">        <ExpenseList /></TabsContent>
                  <TabsContent value="categories"> <ExpenseCategories /></TabsContent>
                </Tabs>
              </div>
            </ExpenseProvider>
          </TabsContent>

        </Tabs>
      </main>

      {reviewTarget && (
        <VendorReviewDialog
          open={!!reviewTarget}
          onOpenChange={(o) => { if (!o) setReviewTarget(null); }}
          vendorProfileId={reviewTarget.id}
          vendorName={reviewTarget.name}
          existingReview={reviews[reviewTarget.id] || null}
          onSaved={(review) => setReviews((prev) => ({ ...prev, [reviewTarget.id]: review }))}
          onDeleted={() => setReviews((prev) => {
            const next = { ...prev };
            delete next[reviewTarget.id];
            return next;
          })}
        />
      )}
    </div>
  );
};

export default Workspace;
