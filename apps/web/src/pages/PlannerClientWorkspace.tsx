import { useEffect, useState, useCallback, useMemo } from "react";
import { formatCurrency } from "@/lib/currency";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Loader2, ArrowLeft, CheckCircle2, Circle, Sparkles,
  PlusCircle, Trash2, Users, DollarSign, MapPin, CalendarDays,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  plannerService,
  WorkspaceData,
  ClientTodoList,
  ClientTodoItem,
  PlannerClient,
} from "@/services/api/plannerService";
import { usePlannerClients } from "@/hooks/usePlannerClients";
import { VisionBoardCanvas } from "@/components/workspace/VisionBoardCanvas";
import AddVendorToRosterDialog from "@/components/vendors/AddVendorToRosterDialog";
import { ExpenseProvider } from "@/context/ExpenseContext";
import ExpenseSummary from "@/components/expenses/ExpenseSummary";
import ExpenseList from "@/components/expenses/ExpenseList";
import ExpenseCategories from "@/components/expenses/ExpenseCategories";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "TBD";

const fmtCurrency = (n: number) =>
  formatCurrency(n);

const statusBadge = (status: string) => {
  const map: Record<string, JSX.Element> = {
    inquired:  <Badge variant="secondary">Inquired</Badge>,
    quoted:    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Quoted</Badge>,
    booked:    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Booked</Badge>,
    confirmed: <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>,
    cancelled: <Badge variant="destructive">Cancelled</Badge>,
  };
  return map[status] ?? <Badge variant="secondary">{status}</Badge>;
};

// ── Page ──────────────────────────────────────────────────────────────────────

const PlannerClientWorkspace = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { clients, getClientName } = usePlannerClients();

  const [isLoading, setIsLoading] = useState(true);
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [client, setClient] = useState<PlannerClient | null>(null);

  // Todos tab state
  const [todos, setTodos] = useState<ClientTodoList[]>([]);
  const [todosLoading, setTodosLoading] = useState(false);
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!clientId) return;
    setIsLoading(true);
    plannerService.getClientWorkspace(clientId)
      .then((data) => {
        setWorkspace(data);
      })
      .catch(() => toast.error("Failed to load workspace"))
      .finally(() => setIsLoading(false));
  }, [clientId]);

  // Resolve client from list
  useEffect(() => {
    if (clientId && clients.length > 0) {
      const found = clients.find(c => c.id === clientId);
      if (found) setClient(found);
    }
  }, [clientId, clients]);

  const loadTodos = useCallback(async () => {
    if (!clientId) return;
    setTodosLoading(true);
    try {
      const data = await plannerService.getClientTodos(clientId);
      setTodos(data);
    } catch {
      toast.error("Failed to load to-do lists");
    } finally {
      setTodosLoading(false);
    }
  }, [clientId]);

  const handleToggle = useCallback(async (list: ClientTodoList, item: ClientTodoItem) => {
    if (!clientId) return;
    try {
      const updated = await plannerService.toggleClientTodoItem(clientId, list.id, item.id);
      setTodos(prev => prev.map(l =>
        l.id === list.id ? { ...l, items: l.items.map(i => i.id === item.id ? updated : i) } : l
      ));
    } catch {
      toast.error("Failed to update item");
    }
  }, [clientId]);

  const handleDeleteItem = useCallback(async (list: ClientTodoList, item: ClientTodoItem) => {
    if (!clientId) return;
    try {
      await plannerService.deleteClientTodoItem(clientId, list.id, item.id);
      setTodos(prev => prev.map(l =>
        l.id === list.id ? { ...l, items: l.items.filter(i => i.id !== item.id) } : l
      ));
    } catch {
      toast.error("Failed to delete item");
    }
  }, [clientId]);

  const handleAddItem = useCallback(async (list: ClientTodoList) => {
    if (!clientId) return;
    const text = (newItemTexts[list.id] ?? "").trim();
    if (!text) return;
    try {
      const newItem = await plannerService.addClientTodoItem(clientId, list.id, text);
      setTodos(prev => prev.map(l =>
        l.id === list.id ? { ...l, items: [...l.items, newItem] } : l
      ));
      setNewItemTexts(prev => ({ ...prev, [list.id]: "" }));
    } catch {
      toast.error("Failed to add item");
    }
  }, [clientId, newItemTexts]);

  const coupleNames = workspace
    ? [workspace.event.partner1_name, workspace.event.partner2_name].filter(Boolean).join(" & ") || "Unnamed Couple"
    : client ? getClientName(client) : "Client Workspace";
  const [expenseTab, setExpenseTab] = useState<"all" | "categories">("all");
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const handleResendInvite = useCallback(async () => {
    if (!clientId) return;
    setIsInviting(true);
    try {
      const result = await plannerService.createClientInvite(clientId);
      if (result.emailSent) {
        toast.success("Invite sent");
      } else {
        toast.warning("Invite created, but the email could not be sent", {
          description: `Share this code with your client: ${result.inviteCode}`,
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setIsInviting(false);
    }
  }, [clientId]);

  // Re-read the workspace so the roster, counts and spend all move together.
  const reloadWorkspace = useCallback(async () => {
    if (!clientId) return;
    try {
      setWorkspace(await plannerService.getClientWorkspace(clientId));
    } catch {
      toast.error("Failed to refresh the roster");
    }
  }, [clientId]);

  const handleRemoveVendor = useCallback(async (v: { id: string; business_name?: string }) => {
    if (!clientId) return;
    try {
      await plannerService.removeClientProjectVendor(clientId, v.id);
      toast.success(`${v.business_name || "Vendor"} removed from the roster`);
      await reloadWorkspace();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove vendor");
    }
  }, [clientId, reloadWorkspace]);

  // Vision board service scoped to this client
  const visionBoardService = useMemo(() => ({
    list: () => plannerService.getClientVisionBoard(clientId!),
    create: (input: Parameters<typeof plannerService.addClientVisionBoardItem>[1]) =>
      plannerService.addClientVisionBoardItem(clientId!, input),
    update: (id: string, input: Parameters<typeof plannerService.updateClientVisionBoardItem>[2]) =>
      plannerService.updateClientVisionBoardItem(clientId!, id, input),
    remove: (id: string) => plannerService.removeClientVisionBoardItem(clientId!, id),
    uploadImage: (file: File) => plannerService.uploadClientVisionBoardImage(clientId!, file),
  }), [clientId]);

  // ── Loading ────────────────────────────────────────────────────────────────

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

  if (!workspace) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24">
        <div className="mt-16 max-w-md mx-auto text-center space-y-4 p-10 rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="text-4xl">🌿</div>
          <h2 className="text-xl font-serif font-medium">No workspace yet</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {client?.invite_status === "accepted"
              ? "This client's invite is marked accepted, but no couple account is attached to it — so there's no wedding to build a workspace around. Re-sending the invite will relink it."
              : "This client hasn't accepted your invite yet. Their workspace — budget, vendors, checklists and calendar — appears here once they do."}
          </p>
          <p className="text-xs text-muted-foreground">
            Vendors, budget and shared events all attach to the couple's wedding,
            so they only become available after the invite is accepted.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" asChild><Link to="/clients">Back to clients</Link></Button>
            {client && client.invite_status !== "accepted" && (
              <Button size="default" onClick={handleResendInvite} disabled={isInviting}>
                {isInviting ? "Sending…" : "Resend invite"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );

  const { event, vendors, sharedTodos, guestStats } = workspace;

  // ── Full workspace ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-16">

        {/* Header */}
        <div className="mb-6 pt-4 flex items-start gap-3">
          <Button variant="ghost" size="icon" className="mt-0.5 shrink-0" onClick={() => navigate("/clients")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-medium tracking-tight">{coupleNames}</h1>
            {event.event_date && (
              <p className="text-muted-foreground mt-1 text-sm">{fmt(event.event_date)}</p>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full" onValueChange={(v) => { if (v === "todos" && todos.length === 0 && !todosLoading) loadTodos(); }}>
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full mb-8 h-auto sm:h-10 p-1 bg-muted/60 rounded-lg">
            <TabsTrigger value="overview"     className="rounded-md text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
            <TabsTrigger value="budget"       className="rounded-md text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Budget</TabsTrigger>
            <TabsTrigger value="vendors"      className="rounded-md text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Vendors</TabsTrigger>
            <TabsTrigger value="todos"        className="rounded-md text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">To-Do Lists</TabsTrigger>
            <TabsTrigger value="vision-board" className="rounded-md text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Mood Board</TabsTrigger>
            <TabsTrigger value="guests"       className="rounded-md text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Guests</TabsTrigger>
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview" className="space-y-5">

            {/* Hero banner */}
            <div className="relative rounded-2xl overflow-hidden text-white" style={{ background: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)" }}>
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse at 15% 60%, rgba(180,130,80,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(120,90,55,0.14) 0%, transparent 50%)" }} />
              <div className="relative px-8 py-8">
                <p className="text-stone-400 text-xs uppercase tracking-[0.2em] mb-2 font-medium">{workspace.client?.event_type || "Wedding"}</p>
                <h2 className="text-3xl md:text-4xl font-serif font-medium tracking-tight mb-4">{coupleNames}</h2>
                <div className="flex flex-wrap items-center gap-5 text-sm text-stone-300">
                  {event.event_date && (
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      {fmt(event.event_date)}
                    </span>
                  )}
                  {event.venue && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      {event.venue}
                    </span>
                  )}
                  {event.guest_count_estimate > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      {event.guest_count_estimate} guests
                    </span>
                  )}
                </div>
                {event.event_date && (() => {
                  const days = Math.ceil((new Date(event.event_date).getTime() - Date.now()) / 86_400_000);
                  if (days > 0) return (
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
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
              const confirmedVendors = vendors.filter(v => v.status === "booked" || v.status === "confirmed").length;
              const vendorSpend = vendors.filter(v => v.status === "booked" || v.status === "confirmed").reduce((s, v) => s + (v.amount ?? 0), 0);
              const allItems = sharedTodos.flatMap(l => l.items ?? []);
              const doneItems = allItems.filter(i => i.completed).length;
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-border/60 bg-card p-4 space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Guests RSVP'd</p>
                    <p className="text-2xl font-bold">{guestStats.confirmed}<span className="text-sm font-normal text-muted-foreground"> / {guestStats.total}</span></p>
                    <div className="h-1 rounded-full bg-muted overflow-hidden mt-1">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: guestStats.total > 0 ? `${(guestStats.confirmed / guestStats.total) * 100}%` : "0%" }} />
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card p-4 space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Budget</p>
                    <p className="text-2xl font-bold">{event.total_budget ? fmtCurrency(event.total_budget) : "—"}</p>
                    {vendorSpend > 0 && <p className="text-xs text-muted-foreground">{fmtCurrency(vendorSpend)} committed</p>}
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card p-4 space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Vendors</p>
                    <p className="text-2xl font-bold">{confirmedVendors}<span className="text-sm font-normal text-muted-foreground"> / {vendors.length}</span></p>
                    <p className="text-xs text-muted-foreground">booked or confirmed</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card p-4 space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Tasks</p>
                    <p className="text-2xl font-bold">{doneItems}<span className="text-sm font-normal text-muted-foreground"> / {allItems.length}</span></p>
                    <div className="h-1 rounded-full bg-muted overflow-hidden mt-1">
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
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{vendors.length} {vendors.length === 1 ? "vendor" : "vendors"}</span>
                      <Button size="sm" variant="outline" className="h-7" onClick={() => setIsAddingVendor(true)}>
                        <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                        Add vendor
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {vendors.length === 0 ? (
                    <div className="px-6 pb-6 space-y-3">
                      <p className="text-sm text-muted-foreground">No vendors added yet.</p>
                      <p className="text-xs text-muted-foreground">
                        Adding a vendor lets them schedule against this wedding and be
                        tagged on shared calendar events.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {vendors.map((v, i) => (
                        <div key={v.id} className={`flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors ${i < vendors.length - 1 ? "border-b border-border/40" : ""}`}>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{v.business_name || "Unnamed Vendor"}</p>
                            {v.vendor_category && <p className="text-xs text-muted-foreground capitalize">{v.vendor_category}</p>}
                          </div>
                          {v.amount != null && v.amount > 0 && <p className="text-sm tabular-nums text-muted-foreground shrink-0">{fmtCurrency(v.amount)}</p>}
                          {statusBadge(v.status)}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveVendor(v)}
                            aria-label={`Remove ${v.business_name || "vendor"}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right sidebar: RSVP + checklists */}
              <div className="md:col-span-2 space-y-5">

                {/* RSVP breakdown */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">RSVP Breakdown</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: "Confirmed", value: guestStats.confirmed, color: "bg-emerald-500" },
                      { label: "Pending",   value: guestStats.pending,   color: "bg-amber-400" },
                      { label: "Declined",  value: guestStats.declined,  color: "bg-rose-400" },
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
                      <span className="font-semibold">{guestStats.total}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Checklists */}
                {sharedTodos.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Checklists</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {sharedTodos.slice(0, 5).map(list => {
                        const done = list.items?.filter(i => i.completed).length ?? 0;
                        const total = list.items?.length ?? 0;
                        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
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

          {/* ── To-Do Lists ── */}
          {/* ── Vendors ──────────────────────────────────────────────────── */}
          <TabsContent value="vendors" className="space-y-5">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm font-semibold">Vendor Roster</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vendors here can schedule against this wedding and be tagged on shared events.
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setIsAddingVendor(true)}>
                    <PlusCircle className="mr-1.5 h-4 w-4" />
                    Add vendor
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {vendors.length === 0 ? (
                  <div className="px-6 pb-6 space-y-3">
                    <p className="text-sm text-muted-foreground">No vendors on this roster yet.</p>
                    <Button size="sm" variant="outline" onClick={() => setIsAddingVendor(true)}>
                      <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                      Add the first vendor
                    </Button>
                  </div>
                ) : (
                  <div>
                    {vendors.map((v, i) => (
                      <div key={v.id} className={`flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors ${i < vendors.length - 1 ? "border-b border-border/40" : ""}`}>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{v.business_name || "Unnamed Vendor"}</p>
                          {v.vendor_category && <p className="text-xs text-muted-foreground capitalize">{v.vendor_category}</p>}
                        </div>
                        {v.amount != null && v.amount > 0 && (
                          <p className="text-sm tabular-nums text-muted-foreground shrink-0">{fmtCurrency(v.amount)}</p>
                        )}
                        {statusBadge(v.status)}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveVendor(v)}
                          aria-label={`Remove ${v.business_name || "vendor"}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Budget ───────────────────────────────────────────────────── */}
          <TabsContent value="budget" className="space-y-5">
            {/* The couple's own budget components, pointed at this client and
                rendered read-only, so both sides read identical figures. */}
            <ExpenseProvider clientId={clientId}>
              <ExpenseSummary />
              <Tabs value={expenseTab} onValueChange={v => setExpenseTab(v as typeof expenseTab)}>
                <TabsList className="grid grid-cols-2 w-full sm:w-64 mb-4 h-9 p-1 bg-muted/60 rounded-lg">
                  <TabsTrigger value="all"        className="rounded-md text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">All Expenses</TabsTrigger>
                  <TabsTrigger value="categories" className="rounded-md text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">By Category</TabsTrigger>
                </TabsList>
                <TabsContent value="all"><ExpenseList /></TabsContent>
                <TabsContent value="categories"><ExpenseCategories /></TabsContent>
              </Tabs>
              <p className="text-xs text-muted-foreground">
                Read-only — only the couple can change their budget.
              </p>
            </ExpenseProvider>
          </TabsContent>

          <TabsContent value="todos" className="space-y-4">
            {todosLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : todos.length === 0 && !todosLoading ? (
              <div className="text-center py-16 text-muted-foreground">
                <Sparkles className="mx-auto h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">No to-do lists yet.</p>
              </div>
            ) : (
              todos.map(list => {
                const done = list.items.filter(i => i.completed).length;
                return (
                  <Card key={list.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{list.title}</CardTitle>
                        <span className="text-xs text-muted-foreground">{done}/{list.items.length} done</span>
                      </div>
                      {list.description && <p className="text-sm text-muted-foreground">{list.description}</p>}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {list.items.map(item => (
                        <div key={item.id} className="flex items-center gap-2 group">
                          <button onClick={() => handleToggle(list, item)} className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
                            {item.completed
                              ? <CheckCircle2 className="h-4 w-4 text-primary" />
                              : <Circle className="h-4 w-4" />}
                          </button>
                          <span className={`flex-1 text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>{item.text}</span>
                          {item.status === "in_progress" && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium shrink-0">In progress</span>
                          )}
                          {item.status === "done" && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium shrink-0">Done</span>
                          )}
                          {item.status === "todo" && !item.completed && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium shrink-0">To do</span>
                          )}
                          <button onClick={() => handleDeleteItem(list, item)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      {/* Add item */}
                      <div className="flex gap-2 pt-2">
                        <Input
                          placeholder="Add a task…"
                          value={newItemTexts[list.id] ?? ""}
                          onChange={e => setNewItemTexts(prev => ({ ...prev, [list.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === "Enter") handleAddItem(list); }}
                          className="h-8 text-sm"
                        />
                        <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => handleAddItem(list)}>
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* ── Vision Board ── */}
          <TabsContent value="vision-board" className="h-[70vh]">
            <VisionBoardCanvas service={visionBoardService} />
          </TabsContent>

          {/* ── Guests ── */}
          <TabsContent value="guests">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total", value: guestStats.total,     color: "bg-muted/50 text-foreground" },
                { label: "Confirmed", value: guestStats.confirmed, color: "bg-green-50 text-green-700" },
                { label: "Pending",   value: guestStats.pending,   color: "bg-amber-50 text-amber-700" },
                { label: "Declined",  value: guestStats.declined,  color: "bg-red-50 text-red-700" },
              ].map(({ label, value, color }) => (
                <Card key={label} className={`border-0 ${color}`}>
                  <CardContent className="pt-6 pb-4 text-center">
                    <p className="text-4xl font-bold mb-1">{value}</p>
                    <p className="text-sm opacity-70">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

      {/* Mounted at page level: a dialog nested inside a TabsContent only
          exists while that tab is open, so it could never be opened from
          another tab. */}
      {clientId && (
        <AddVendorToRosterDialog
          open={isAddingVendor}
          onOpenChange={setIsAddingVendor}
          clientId={clientId}
          existingVendorIds={vendors.map(v => v.vendor_profile_id)}
          onAdded={reloadWorkspace}
        />
      )}

      </main>
    </div>
  );
};

export default PlannerClientWorkspace;
