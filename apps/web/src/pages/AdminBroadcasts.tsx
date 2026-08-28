import { useMemo, useState } from "react";
import { formatNumber } from "@/lib/number";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  getAdminBroadcasts,
  createAdminBroadcast,
  updateAdminBroadcast,
  deleteAdminBroadcast,
  cancelAdminBroadcast,
  getAdminTemplates,
  createAdminTemplate,
  updateAdminTemplate,
  deleteAdminTemplate,
  type AdminBroadcast,
  type AdminTemplate,
} from "@/services/api/adminService";

const timeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const statusBadge = (status: string) => {
  switch (status) {
    case "draft": return "bg-slate-100 text-slate-600";
    case "scheduled": return "bg-sky-50 text-sky-700";
    case "sent": return "bg-emerald-50 text-emerald-700";
    case "cancelled": return "bg-red-50 text-red-700";
    default: return "bg-slate-100 text-slate-600";
  }
};

const audienceBadge = (audience: string) => {
  switch (audience) {
    case "all": return "bg-amber-50 text-amber-800";
    case "client": return "bg-blue-50 text-blue-700";
    case "vendor": return "bg-amber-50 text-amber-700";
    case "planner": return "bg-teal-50 text-teal-700";
    case "newsletter": return "bg-pink-50 text-pink-700";
    default: return "bg-slate-100 text-slate-600";
  }
};

const channelBadge = (channel: string) => {
  switch (channel) {
    case "email": return "bg-blue-50 text-blue-700";
    case "sms": return "bg-emerald-50 text-emerald-700";
    case "inapp": return "bg-amber-50 text-amber-800";
    default: return "bg-slate-100 text-slate-600";
  }
};

const audienceLabel = (a: string) => {
  switch (a) {
    case "all": return "All users";
    case "client": return "Clients";
    case "vendor": return "Vendors";
    case "planner": return "Planners";
    case "newsletter": return "Newsletter";
    default: return a;
  }
};

// ── Broadcasts Tab ──────────────────────────────────────────────────

function BroadcastsTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const queryKey = useMemo(
    () => ["admin", "broadcasts", { search, status: statusFilter, audience: audienceFilter, limit, offset }],
    [search, statusFilter, audienceFilter, limit, offset]
  );

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () =>
      getAdminBroadcasts({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        audience: audienceFilter !== "all" ? audienceFilter : undefined,
        limit,
        offset,
      }),
  });

  const totalPages = data ? Math.max(Math.ceil(data.total / limit), 1) : 1;

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBroadcast | null>(null);

  // Form
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [status, setStatus] = useState("draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [templateId, setTemplateId] = useState<string>("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Templates for picker
  const { data: templates } = useQuery({
    queryKey: ["admin", "templates"],
    queryFn: getAdminTemplates,
  });

  const openNew = () => {
    setEditing(null);
    setTitle(""); setBody(""); setAudience("all"); setStatus("draft"); setScheduledAt(""); setTemplateId(""); setActionError(null);
    setDialogOpen(true);
  };

  const openEdit = (b: AdminBroadcast) => {
    setEditing(b);
    setTitle(b.title); setBody(b.body); setAudience(b.audience);
    setStatus(b.status); setScheduledAt(b.scheduled_at ? new Date(b.scheduled_at).toISOString().slice(0, 16) : "");
    setTemplateId(b.template_id || ""); setActionError(null);
    setDialogOpen(true);
  };

  const handleTemplateSelect = (tid: string) => {
    setTemplateId(tid);
    if (tid && templates) {
      const tpl = templates.find((t) => t.id === tid);
      if (tpl) {
        if (tpl.subject) setTitle(tpl.subject);
        if (tpl.body) setBody(tpl.body);
      }
    }
  };

  const createMut = useMutation({
    mutationFn: createAdminBroadcast,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "broadcasts"] }); setDialogOpen(false); },
    onError: (err) => setActionError(err instanceof Error ? err.message : "Failed"),
  });

  const updateMut = useMutation({
    mutationFn: (args: { id: string; payload: Parameters<typeof updateAdminBroadcast>[1] }) =>
      updateAdminBroadcast(args.id, args.payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "broadcasts"] }); setDialogOpen(false); },
    onError: (err) => setActionError(err instanceof Error ? err.message : "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteAdminBroadcast,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "broadcasts"] }),
  });

  const cancelMut = useMutation({
    mutationFn: cancelAdminBroadcast,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "broadcasts"] }),
  });

  const handleSave = () => {
    setActionError(null);
    if (status === "scheduled" && !scheduledAt) {
      setActionError("Pick a schedule date and time.");
      return;
    }
    if (status === "sent") {
      if (!window.confirm("Send this broadcast immediately?")) return;
    }

    const payload = {
      title,
      body,
      audience,
      status,
      scheduledAt: status === "scheduled" ? new Date(scheduledAt).toISOString() : undefined,
      confirmSend: status === "sent" ? true : undefined,
      templateId: templateId || undefined,
    };

    if (editing) {
      updateMut.mutate({ id: editing.id, payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Broadcasts</CardTitle>
            <div className="flex items-center gap-2">
              {data && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {data.total.toLocaleString()} total
                </span>
              )}
              <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={openNew}>
                New Broadcast
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative md:max-w-xs flex-1">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <Input placeholder="Search broadcasts..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={audienceFilter} onValueChange={(v) => { setAudienceFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Audience" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All audiences</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="vendor">Vendors</SelectItem>
                <SelectItem value="planner">Planners</SelectItem>
                <SelectItem value="newsletter">Newsletter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="py-8 text-center text-sm text-slate-400">Loading broadcasts...</p>}
          {error && <p className="py-8 text-center text-sm text-red-600">Failed to load broadcasts.</p>}
          {!isLoading && !error && data && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Title</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Audience</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Date</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Created</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.broadcasts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12 text-center text-sm text-slate-400">No broadcasts found.</TableCell>
                      </TableRow>
                    )}
                    {data.broadcasts.map((b) => (
                      <TableRow key={b.id} className="border-slate-50 hover:bg-slate-50/50">
                        <TableCell className="text-sm font-medium text-slate-800">{b.title}</TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${audienceBadge(b.audience)}`}>
                            {audienceLabel(b.audience)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadge(b.status)}`}>
                            {b.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {b.sent_at
                            ? `Sent ${timeAgo(b.sent_at)}`
                            : b.scheduled_at
                              ? `Scheduled ${new Date(b.scheduled_at).toLocaleDateString()}`
                              : b.cancelled_at
                                ? `Cancelled ${timeAgo(b.cancelled_at)}`
                                : "\u2014"}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">{timeAgo(b.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {(b.status === "draft" || b.status === "scheduled") && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEdit(b)}>Edit</Button>
                            )}
                            {b.status === "scheduled" && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:text-red-700" onClick={() => { if (window.confirm("Cancel this scheduled broadcast?")) cancelMut.mutate(b.id); }}>Cancel</Button>
                            )}
                            {b.status === "draft" && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:text-red-700" onClick={() => { if (window.confirm("Delete this draft?")) deleteMut.mutate(b.id); }}>Delete</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-sm text-slate-500">
                  Showing {formatNumber(Math.min(offset + 1, data.total))}&ndash;{formatNumber(Math.min(offset + limit, data.total))} of {formatNumber(data.total)}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => setPage((c) => Math.max(c - 1, 1))} disabled={page === 1} className="h-8 px-3 text-xs">Previous</Button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = page <= 3 ? i + 1 : page + i - 2;
                    if (p < 1 || p > totalPages) return null;
                    return (
                      <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => setPage(p)} className={`h-8 w-8 p-0 text-xs ${p === page ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}>{p}</Button>
                    );
                  })}
                  <Button variant="outline" size="sm" onClick={() => setPage((c) => Math.min(c + 1, totalPages))} disabled={page === totalPages} className="h-8 px-3 text-xs">Next</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compose / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Broadcast" : "New Broadcast"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {actionError && <p className="text-sm text-red-600">{actionError}</p>}

            {/* Template picker */}
            {templates && templates.length > 0 && (
              <Select value={templateId || "none"} onValueChange={(v) => handleTemplateSelect(v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Use a template (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No template</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Message body" value={body} onChange={(e) => setBody(e.target.value)} rows={5} />

            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger><SelectValue placeholder="Audience" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="vendor">Vendors</SelectItem>
                <SelectItem value="planner">Planners</SelectItem>
                <SelectItem value="newsletter">Newsletter subscribers</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sent">Send now</SelectItem>
              </SelectContent>
            </Select>

            {status === "scheduled" && (
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            )}
            {status === "sent" && (
              <p className="text-xs text-amber-700">This will send immediately after confirmation.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" disabled={!title || !body || saving} onClick={handleSave}>
              {saving ? "Saving..." : editing ? "Update" : status === "draft" ? "Save draft" : status === "scheduled" ? "Schedule" : "Send now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Templates Tab ───────────────────────────────────────────────────

function TemplatesTab() {
  const queryClient = useQueryClient();
  const { data: templates, isLoading, error } = useQuery({
    queryKey: ["admin", "templates"],
    queryFn: getAdminTemplates,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTemplate | null>(null);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [tplBody, setTplBody] = useState("");
  const [channel, setChannel] = useState("email");
  const [actionError, setActionError] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setName(""); setSubject(""); setTplBody(""); setChannel("email"); setActionError(null);
    setDialogOpen(true);
  };

  const openEdit = (t: AdminTemplate) => {
    setEditing(t);
    setName(t.name); setSubject(t.subject || ""); setTplBody(t.body || ""); setChannel(t.channel); setActionError(null);
    setDialogOpen(true);
  };

  const createMut = useMutation({
    mutationFn: createAdminTemplate,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "templates"] }); setDialogOpen(false); },
    onError: (err) => setActionError(err instanceof Error ? err.message : "Failed"),
  });

  const updateMut = useMutation({
    mutationFn: (args: { id: string; payload: Parameters<typeof updateAdminTemplate>[1] }) =>
      updateAdminTemplate(args.id, args.payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "templates"] }); setDialogOpen(false); },
    onError: (err) => setActionError(err instanceof Error ? err.message : "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteAdminTemplate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "templates"] }),
  });

  const handleSave = () => {
    setActionError(null);
    const payload = { name, subject: subject || undefined, body: tplBody, channel };
    if (editing) {
      updateMut.mutate({ id: editing.id, payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Templates</CardTitle>
            <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={openNew}>New Template</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="py-8 text-center text-sm text-slate-400">Loading templates...</p>}
          {error && <p className="py-8 text-center text-sm text-red-600">Failed to load templates.</p>}
          {!isLoading && !error && templates && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Name</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Channel</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Subject</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Updated</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-sm text-slate-400">No templates yet.</TableCell>
                    </TableRow>
                  )}
                  {templates.map((t) => (
                    <TableRow key={t.id} className="border-slate-50 hover:bg-slate-50/50">
                      <TableCell className="text-sm font-medium text-slate-800">{t.name}</TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${channelBadge(t.channel)}`}>{t.channel}</span>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500 max-w-xs truncate">{t.subject || "\u2014"}</TableCell>
                      <TableCell className="text-sm text-slate-500">{timeAgo(t.updated_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEdit(t)}>Edit</Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:text-red-700" onClick={() => { if (window.confirm("Delete this template?")) deleteMut.mutate(t.id); }}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Template" : "New Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {actionError && <p className="text-sm text-red-600">{actionError}</p>}
            <Input placeholder="Template name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Subject (optional)" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <Textarea placeholder="Body" value={tplBody} onChange={(e) => setTplBody(e.target.value)} rows={5} />
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger><SelectValue placeholder="Channel" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="inapp">In-app</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" disabled={!name || !tplBody || saving} onClick={handleSave}>
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Main Page ───────────────────────────────────────────────────────

const AdminBroadcasts = () => {
  const [tab, setTab] = useState<"broadcasts" | "templates">("broadcasts");

  return (
    <AdminLayout title="Broadcasts">
      {/* Tab bar */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab("broadcasts")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === "broadcasts"
              ? "border-b-2 border-primary text-primary"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Broadcasts
        </button>
        <button
          type="button"
          onClick={() => setTab("templates")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === "templates"
              ? "border-b-2 border-primary text-primary"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Templates
        </button>
      </div>

      {tab === "broadcasts" ? <BroadcastsTab /> : <TemplatesTab />}
    </AdminLayout>
  );
};

export default AdminBroadcasts;
