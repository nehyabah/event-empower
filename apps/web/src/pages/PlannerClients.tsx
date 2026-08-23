import { useMemo, useState, useCallback, useEffect } from "react";
import { formatCurrency } from "@/lib/currency";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Loader2,
  CheckCircle2,
  Circle,
  Trash2,
  PlusCircle,
  ClipboardList,
  LayoutDashboard,
  MoreVertical,
  Archive,
  ArchiveRestore,
  Check,
  LayoutGrid,
  List,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePlannerClients } from "@/hooks/usePlannerClients";
import { PlannerClient, ClientTodoList, ClientTodoItem, WorkspaceData, plannerService } from "@/services/api/plannerService";
import { Separator } from "@/components/ui/separator";

const PlannerClients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">(() => {
    // Remembered per browser: planners tend to settle on one and stay there.
    const saved = typeof window !== "undefined" && localStorage.getItem("planr:clients-view");
    return saved === "list" ? "list" : "card";
  });

  useEffect(() => {
    localStorage.setItem("planr:clients-view", viewMode);
  }, [viewMode]);
  const { clients, isLoading, error, activeClients, upcomingClients, completedClients, archivedClients, getClientName, createClient, createInvite, deleteClient, archiveClient, unarchiveClient } = usePlannerClients();

  // Delete/archive confirmation state
  const [confirmDelete, setConfirmDelete] = useState<PlannerClient | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<PlannerClient | null>(null);
  const [isActioning, setIsActioning] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setIsActioning(true);
    await deleteClient(confirmDelete.id);
    setIsActioning(false);
    setConfirmDelete(null);
  };

  const handleArchive = async () => {
    if (!confirmArchive) return;
    setIsActioning(true);
    await archiveClient(confirmArchive.id);
    setIsActioning(false);
    setConfirmArchive(null);
  };
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Workspace panel state
  const [workspaceClient, setWorkspaceClient] = useState<PlannerClient | null>(null);
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);

  const openClientWorkspace = useCallback(async (client: PlannerClient) => {
    setWorkspaceClient(client);
    setWorkspaceData(null);
    setWorkspaceLoading(true);
    try {
      const data = await plannerService.getClientWorkspace(client.id);
      setWorkspaceData(data);
    } catch {
      toast.error("Failed to load client workspace");
    } finally {
      setWorkspaceLoading(false);
    }
  }, []);

  // Shared todos panel state
  const [todosClient, setTodosClient] = useState<PlannerClient | null>(null);
  const [clientTodos, setClientTodos] = useState<ClientTodoList[]>([]);
  const [todosLoading, setTodosLoading] = useState(false);
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({});

  const openClientTodos = useCallback(async (client: PlannerClient) => {
    setTodosClient(client);
    setTodosLoading(true);
    try {
      const todos = await plannerService.getClientTodos(client.id);
      setClientTodos(todos);
    } catch {
      toast.error("Failed to load shared todos");
    } finally {
      setTodosLoading(false);
    }
  }, []);

  const handleToggleItem = useCallback(async (clientId: string, list: ClientTodoList, item: ClientTodoItem) => {
    try {
      const updated = await plannerService.toggleClientTodoItem(clientId, list.id, item.id);
      setClientTodos(prev => prev.map(l =>
        l.id === list.id
          ? { ...l, items: l.items.map(i => i.id === item.id ? updated : i) }
          : l
      ));
    } catch {
      toast.error("Failed to update item");
    }
  }, []);

  const handleDeleteItem = useCallback(async (clientId: string, list: ClientTodoList, item: ClientTodoItem) => {
    try {
      await plannerService.deleteClientTodoItem(clientId, list.id, item.id);
      setClientTodos(prev => prev.map(l =>
        l.id === list.id
          ? { ...l, items: l.items.filter(i => i.id !== item.id) }
          : l
      ));
    } catch {
      toast.error("Failed to delete item");
    }
  }, []);

  const handleAddItem = useCallback(async (clientId: string, list: ClientTodoList) => {
    const text = (newItemTexts[list.id] || "").trim();
    if (!text) return;
    try {
      const newItem = await plannerService.addClientTodoItem(clientId, list.id, text);
      setClientTodos(prev => prev.map(l =>
        l.id === list.id ? { ...l, items: [...l.items, newItem] } : l
      ));
      setNewItemTexts(prev => ({ ...prev, [list.id]: "" }));
    } catch {
      toast.error("Failed to add item");
    }
  }, [newItemTexts]);
  const [newClient, setNewClient] = useState({
    partner1Name: "",
    partner2Name: "",
    email: "",
    phone: "",
    eventType: "Wedding",
    eventDate: "",
    status: "upcoming",
    budget: "",
    venue: "",
    guestCount: "",
    notes: "",
  });

  const canSubmit = useMemo(() => {
    return newClient.partner1Name.trim() && newClient.partner2Name.trim() && newClient.email.trim();
  }, [newClient]);

  // Filter clients based on search term
  const filteredClients = clients.filter(client => {
    const name = getClientName(client).toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) ||
      client.email.toLowerCase().includes(search) ||
      client.event_type.toLowerCase().includes(search);
  });

  // Format budget for display
  const formatBudget = (budget: number | null): string => {
    if (!budget) return 'TBD';
    return formatCurrency(budget);
  };

  // Format date for display
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get status badge with appropriate color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':    return <Badge variant="default" className="bg-blue-500">Active</Badge>;
      case 'completed': return <Badge variant="outline" className="text-green-500 border-green-500">Completed</Badge>;
      case 'upcoming':  return <Badge variant="outline" className="text-amber-500 border-amber-500">Upcoming</Badge>;
      case 'archived':  return <Badge variant="outline" className="text-muted-foreground">Archived</Badge>;
      default:          return null;
    }
  };

  // Client card component to avoid repetition
  // Shared bits, so the card and the row can never drift apart.
  const clientActions = (client: PlannerClient) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {client.status === 'archived' ? (
          <DropdownMenuItem onClick={() => unarchiveClient(client.id)}>
            <ArchiveRestore className="mr-2 h-4 w-4" />Restore
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => setConfirmArchive(client)}>
            <Archive className="mr-2 h-4 w-4" />Archive
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => setConfirmDelete(client)}
        >
          <Trash2 className="mr-2 h-4 w-4" />Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const copyInvite = async (client: PlannerClient) => {
    if (client.invite_code) {
      await navigator.clipboard.writeText(client.invite_code);
      toast.success("Invite code copied");
      return;
    }
    const result = await createInvite(client.id);
    if (result?.inviteCode) {
      await navigator.clipboard.writeText(result.inviteCode);
      toast.success("Invite code copied");
    }
  };

  /** A linked client needs no invite prompt — that space is better spent. */
  const InviteState = ({ client }: { client: PlannerClient }) =>
    client.user_id ? (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
        <Check className="h-3 w-3" />Linked
      </span>
    ) : (
      <button
        onClick={() => copyInvite(client)}
        className="text-xs text-primary underline underline-offset-2 hover:opacity-80"
      >
        {client.invite_code ? "Copy invite" : "Generate invite"}
      </button>
    );

  const ClientCard = ({ client }: { client: PlannerClient }) => (
    <Card
      key={client.id}
      className={`flex flex-col transition-shadow hover:shadow-md ${client.status === 'archived' ? 'opacity-70' : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="truncate text-base leading-tight">{getClientName(client)}</CardTitle>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {client.event_type} · {formatDate(client.event_date)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {getStatusBadge(client.status)}
            {clientActions(client)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 pt-0">
        {/* Three facts side by side rather than four stacked rows */}
        <div className="grid grid-cols-3 gap-2 rounded-lg border bg-muted/30 p-3">
          {[
            { label: "Guests", value: client.guest_count ? String(client.guest_count) : "TBD" },
            { label: "Budget", value: formatBudget(client.budget) },
            { label: "Venue",  value: client.venue || "TBD" },
          ].map((f) => (
            <div key={f.label} className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{f.label}</p>
              <p className="truncate text-sm font-medium" title={f.value}>{f.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate" title={client.email}>{client.email}</span>
          </p>
          {client.phone && (
            <p className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{client.phone}</span>
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
          <InviteState client={client} />
          <div className="flex gap-2">
            {client.user_id && (
              <Button variant="ghost" size="sm" onClick={() => openClientTodos(client)} className="gap-1">
                <ClipboardList className="h-3.5 w-3.5" />
                Todos
              </Button>
            )}
            <Button size="sm" onClick={() => navigate(`/clients/${client.id}/workspace`)} className="gap-1">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Workspace
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  /**
   * Column tracks for the list view.
   *
   * Every row repeats the same template so the columns line up down the page —
   * rows are separate containers, so identical tracks are what aligns them. The
   * action track is a fixed width rather than auto, otherwise a row with a
   * Todos button would be wider and drag every other column sideways.
   */
  const LIST_GRID =
    "grid items-center gap-x-4 px-4 " +
    "grid-cols-[minmax(0,1fr)_auto] " +
    "md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_5.5rem_7.5rem_6.5rem_15rem]";

  const ClientRow = ({ client }: { client: PlannerClient }) => (
    <div
      className={`${LIST_GRID} border-b py-3 last:border-b-0 hover:bg-muted/40 ${client.status === 'archived' ? 'opacity-70' : ''}`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{getClientName(client)}</p>
          {getStatusBadge(client.status)}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {client.event_type} · {formatDate(client.event_date)}
        </p>
      </div>

      <p className="hidden truncate text-sm text-muted-foreground md:block" title={client.venue || undefined}>
        {client.venue || "—"}
      </p>
      <p className="hidden text-sm tabular-nums text-muted-foreground md:block">
        {client.guest_count ? client.guest_count : "—"}
      </p>
      <p className="hidden truncate text-sm font-medium tabular-nums md:block">
        {formatBudget(client.budget)}
      </p>
      <div className="hidden md:block"><InviteState client={client} /></div>

      <div className="flex items-center justify-end gap-1">
        {client.user_id && (
          <Button variant="ghost" size="sm" onClick={() => openClientTodos(client)} className="gap-1">
            <ClipboardList className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Todos</span>
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => navigate(`/clients/${client.id}/workspace`)} className="gap-1">
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Workspace</span>
        </Button>
        {clientActions(client)}
      </div>
    </div>
  );

  /** Column labels, so the list reads as a table rather than floating values. */
  const ClientListHeader = () => (
    <div className={`${LIST_GRID} border-b bg-muted/40 py-2`}>
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Client</span>
      <span className="hidden text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:block">Venue</span>
      <span className="hidden text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:block">Guests</span>
      <span className="hidden text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:block">Budget</span>
      <span className="hidden text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:block">Invite</span>
      <span className="sr-only">Actions</span>
    </div>
  );

  /**
   * One renderer for every tab, so card and list views stay consistent and a
   * change lands everywhere at once.
   */
  const ClientCollection = ({
    clients: list, empty,
  }: { clients: PlannerClient[]; empty: React.ReactNode }) => {
    if (list.length === 0) return <>{empty}</>;

    if (viewMode === "list") {
      return (
        <div className="overflow-hidden rounded-lg border bg-card">
          <ClientListHeader />
          {list.map((c) => <ClientRow key={c.id} client={c} />)}
        </div>
      );
    }

    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => <ClientCard key={c.id} client={c} />)}
      </div>
    );
  };


  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading clients...</p>
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
            <p className="text-red-600">Error loading clients: {error}</p>
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
            <h1 className="text-3xl font-serif">Client Management</h1>
            <p className="text-muted-foreground">Manage all your wedding clients</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Client
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border p-1">
            {([
              { value: "card" as const, Icon: LayoutGrid, label: "Card view" },
              { value: "list" as const, Icon: List,       label: "List view" },
            ]).map(({ value, Icon, label }) => (
              <Button
                key={value}
                variant={viewMode === value ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                aria-label={label}
                aria-pressed={viewMode === value}
                title={label}
                onClick={() => setViewMode(value)}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="all">All ({clients.filter(c => c.status !== 'archived').length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeClients.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcomingClients.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedClients.length})</TabsTrigger>
            <TabsTrigger value="archived">Archived ({archivedClients.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ClientCollection
              clients={filteredClients.filter(c => c.status !== 'archived')}
              empty={
                <div className="rounded-lg bg-muted/50 p-8 text-center">
                  <p className="text-muted-foreground">
                    {clients.filter(c => c.status !== 'archived').length === 0 ? "No clients yet. Add your first client!" : "No clients found matching your search."}
                  </p>
                </div>
              }
            />
          </TabsContent>

          <TabsContent value="active">
            <ClientCollection
              clients={activeClients.filter(c => {
                  const name = getClientName(c).toLowerCase();
                  return name.includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase());
                })}
              empty={
                <div className="rounded-lg bg-muted/50 p-8 text-center">
                  <p className="text-muted-foreground">
                    No active clients.
                  </p>
                </div>
              }
            />
          </TabsContent>

          <TabsContent value="upcoming">
            <ClientCollection
              clients={upcomingClients.filter(c => {
                  const name = getClientName(c).toLowerCase();
                  return name.includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase());
                })}
              empty={
                <div className="rounded-lg bg-muted/50 p-8 text-center">
                  <p className="text-muted-foreground">
                    No upcoming clients.
                  </p>
                </div>
              }
            />
          </TabsContent>

          <TabsContent value="completed">
            <ClientCollection
              clients={completedClients.filter(c => {
                  const name = getClientName(c).toLowerCase();
                  return name.includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase());
                })}
              empty={
                <div className="rounded-lg bg-muted/50 p-8 text-center">
                  <p className="text-muted-foreground">
                    No completed client events yet.
                  </p>
                </div>
              }
            />
          </TabsContent>

          <TabsContent value="archived">
            <ClientCollection
              clients={archivedClients.filter(c => {
                  const name = getClientName(c).toLowerCase();
                  return name.includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase());
                })}
              empty={
                <div className="rounded-lg bg-muted/50 p-8 text-center">
                  <p className="text-muted-foreground">
                    No archived clients.
                  </p>
                </div>
              }
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Workspace Sheet */}
      <Sheet open={!!workspaceClient} onOpenChange={(open) => { if (!open) { setWorkspaceClient(null); setWorkspaceData(null); } }}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              Workspace — {workspaceClient ? getClientName(workspaceClient) : ""}
            </SheetTitle>
          </SheetHeader>

          {workspaceLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !workspaceData ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No workspace data available. Client may not have linked their account yet.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Client Header */}
              <div className="rounded-lg border p-4 space-y-2">
                <h3 className="font-medium">Event Details</h3>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Couple</p>
                    <p className="font-medium">
                      {[workspaceData.event.partner1_name, workspaceData.event.partner2_name].filter(Boolean).join(" & ") || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Event Type</p>
                    <p className="font-medium">{workspaceClient?.event_type || "Wedding"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Date</p>
                    <p className="font-medium">
                      {workspaceData.event.event_date
                        ? new Date(workspaceData.event.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "TBD"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Venue</p>
                    <p className="font-medium">{workspaceData.event.venue || "TBD"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Budget</p>
                    <p className="font-medium">
                      {workspaceData.event.total_budget
                        ? formatCurrency(workspaceData.event.total_budget)
                        : "TBD"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Guests</p>
                    <p className="font-medium">{workspaceData.event.guest_count_estimate || "TBD"}</p>
                  </div>
                </div>
              </div>

              {/* Vendor Roster */}
              <div className="rounded-lg border p-4 space-y-3">
                <h3 className="font-medium">Vendor Roster</h3>
                <Separator />
                {workspaceData.vendors.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No vendors added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {workspaceData.vendors.map((vendor) => (
                      <div key={vendor.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium">{vendor.business_name || "Unnamed Vendor"}</p>
                          <p className="text-xs text-muted-foreground">{vendor.vendor_category || vendor.category || "—"}</p>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          {vendor.amount ? (
                            <span className="text-xs text-muted-foreground">
                              {formatCurrency(vendor.amount)}
                            </span>
                          ) : null}
                          {(() => {
                            switch (vendor.status) {
                              case "inquired": return <Badge variant="secondary" className="text-xs">Inquired</Badge>;
                              case "quoted": return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">Quoted</Badge>;
                              case "booked": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs">Booked</Badge>;
                              case "confirmed": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">Confirmed</Badge>;
                              case "cancelled": return <Badge variant="destructive" className="text-xs">Cancelled</Badge>;
                            }
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shared Todos */}
              <div className="rounded-lg border p-4 space-y-3">
                <h3 className="font-medium">Shared Checklists</h3>
                <Separator />
                {workspaceData.sharedTodos.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No shared lists yet.</p>
                ) : (
                  <div className="space-y-4">
                    {workspaceData.sharedTodos.map((list) => {
                      const completed = list.items.filter((i) => i.completed).length;
                      const total = list.items.length;
                      return (
                        <div key={list.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{list.title}</p>
                            <span className="text-xs text-muted-foreground">{completed}/{total}</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: total > 0 ? `${Math.round((completed / total) * 100)}%` : "0%" }}
                            />
                          </div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {list.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-2">
                                {item.completed
                                  ? <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                                  : <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                }
                                <span className={`text-xs ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                                  {item.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Guest Summary */}
              <div className="rounded-lg border p-4 space-y-3">
                <h3 className="font-medium">Guest Summary</h3>
                <Separator />
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-xl font-bold">{workspaceData.guestStats.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <p className="text-xl font-bold text-green-700">{workspaceData.guestStats.confirmed}</p>
                    <p className="text-xs text-green-600">Confirmed</p>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <p className="text-xl font-bold text-amber-700">{workspaceData.guestStats.pending}</p>
                    <p className="text-xs text-amber-600">Pending</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Shared Todos Sheet */}
      <Sheet open={!!todosClient} onOpenChange={(open) => { if (!open) setTodosClient(null); }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Shared Todos — {todosClient ? getClientName(todosClient) : ""}
            </SheetTitle>
          </SheetHeader>

          {todosLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : clientTodos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No shared lists yet. Ask your client to share a list with you.
            </div>
          ) : (
            <div className="space-y-6">
              {clientTodos.map(list => {
                const completed = list.items.filter(i => i.completed).length;
                const total = list.items.length;
                return (
                  <div key={list.id} className="rounded-lg border p-4 space-y-3">
                    <div>
                      <h3 className="font-medium">{list.title}</h3>
                      {list.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{list.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: total > 0 ? `${Math.round((completed / total) * 100)}%` : "0%" }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{completed}/{total}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto">
                      {list.items.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2">No items yet.</p>
                      ) : (
                        list.items.map(item => (
                          <div key={item.id} className="flex items-center gap-2 group">
                            <button
                              onClick={() => todosClient && handleToggleItem(todosClient.id, list, item)}
                              className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                            >
                              {item.completed
                                ? <CheckCircle2 className="h-4 w-4 text-primary" />
                                : <Circle className="h-4 w-4" />
                              }
                            </button>
                            <span className={`flex-1 text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                              {item.text}
                            </span>
                            <button
                              onClick={() => todosClient && handleDeleteItem(todosClient.id, list, item)}
                              className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t">
                      <PlusCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      <input
                        value={newItemTexts[list.id] || ""}
                        onChange={(e) => setNewItemTexts(prev => ({ ...prev, [list.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            todosClient && handleAddItem(todosClient.id, list);
                          }
                        }}
                        placeholder="Add a task..."
                        className="flex-1 bg-transparent text-sm outline-none min-w-0 py-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => todosClient && handleAddItem(todosClient.id, list)}
                        disabled={!(newItemTexts[list.id] || "").trim()}
                        className="h-7 px-2 text-xs shrink-0"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Add new client</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Partner 1 name</label>
              <Input
                value={newClient.partner1Name}
                onChange={(e) => setNewClient((prev) => ({ ...prev, partner1Name: e.target.value }))}
                placeholder="Jane"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Partner 2 name</label>
              <Input
                value={newClient.partner2Name}
                onChange={(e) => setNewClient((prev) => ({ ...prev, partner2Name: e.target.value }))}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="couple@email.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={newClient.phone}
                onChange={(e) => setNewClient((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+234..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Event type</label>
              <Input
                value={newClient.eventType}
                onChange={(e) => setNewClient((prev) => ({ ...prev, eventType: e.target.value }))}
                placeholder="Wedding"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Event date</label>
              <Input
                type="date"
                value={newClient.eventDate}
                onChange={(e) => setNewClient((prev) => ({ ...prev, eventDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={newClient.status}
                onValueChange={(value) => setNewClient((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Budget</label>
              <Input
                type="number"
                value={newClient.budget}
                onChange={(e) => setNewClient((prev) => ({ ...prev, budget: e.target.value }))}
                placeholder="25000"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Venue</label>
              <Input
                value={newClient.venue}
                onChange={(e) => setNewClient((prev) => ({ ...prev, venue: e.target.value }))}
                placeholder="Venue name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Guest count</label>
              <Input
                type="number"
                value={newClient.guestCount}
                onChange={(e) => setNewClient((prev) => ({ ...prev, guestCount: e.target.value }))}
                placeholder="150"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={newClient.notes}
                onChange={(e) => setNewClient((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Important details..."
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
                const created = await createClient({
                  partner1Name: newClient.partner1Name.trim(),
                  partner2Name: newClient.partner2Name.trim(),
                  email: newClient.email.trim(),
                  phone: newClient.phone.trim() || undefined,
                  eventType: newClient.eventType.trim() || undefined,
                  eventDate: newClient.eventDate || undefined,
                  status: newClient.status as "active" | "upcoming" | "completed",
                  budget: newClient.budget ? Number(newClient.budget) : undefined,
                  venue: newClient.venue.trim() || undefined,
                  guestCount: newClient.guestCount ? Number(newClient.guestCount) : undefined,
                  notes: newClient.notes.trim() || undefined,
                });
                setIsSubmitting(false);
                if (created) {
                  setIsCreateOpen(false);
                  setNewClient({
                    partner1Name: "",
                    partner2Name: "",
                    email: "",
                    phone: "",
                    eventType: "Wedding",
                    eventDate: "",
                    status: "upcoming",
                    budget: "",
                    venue: "",
                    guestCount: "",
                    notes: "",
                  });
                }
              }}
            >
              {isSubmitting ? "Saving..." : "Create client"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation */}
      <AlertDialog open={!!confirmArchive} onOpenChange={(open) => !open && setConfirmArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive client?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmArchive && `"${getClientName(confirmArchive)}" will be moved to your Archived tab. You can restore them at any time.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActioning}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} disabled={isActioning}>
              {isActioning ? "Archiving..." : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete client?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete && `This will permanently delete "${getClientName(confirmDelete)}" and all associated data. This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActioning}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isActioning}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isActioning ? "Deleting..." : "Delete permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlannerClients;
