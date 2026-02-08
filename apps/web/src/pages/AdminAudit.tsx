import { Fragment, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminAuditLogs } from "@/services/api/adminService";

const actionBadge = (action: string) => {
  if (action.includes("delete") || action.includes("suspend")) return "bg-red-50 text-red-700";
  if (action.includes("verify") || action.includes("activate")) return "bg-emerald-50 text-emerald-700";
  if (action.includes("update") || action.includes("edit")) return "bg-sky-50 text-sky-700";
  if (action.includes("feature")) return "bg-amber-50 text-amber-700";
  if (action.includes("reset")) return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
};

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

const AdminAudit = () => {
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const limit = 50;
  const offset = (page - 1) * limit;

  const queryKey = useMemo(
    () => ["admin", "audit", { action, limit, offset }],
    [action, limit, offset]
  );

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getAdminAuditLogs({ action: action || undefined, limit, offset }),
  });

  const totalPages = data ? Math.max(Math.ceil(data.total / limit), 1) : 1;

  const formatJson = (value: unknown) => {
    if (value === null || value === undefined) return "null";
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  return (
    <AdminLayout title="Audit Trail">
      <Card className="border-0 shadow-sm">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Admin Actions</CardTitle>
            {data && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {data.total.toLocaleString()} entries
              </span>
            )}
          </div>
          <div className="relative md:max-w-sm">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <Input
              placeholder="Filter by action e.g. admin.user.suspend"
              value={action}
              onChange={(event) => { setAction(event.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="py-8 text-center text-sm text-slate-400">Loading audit logs...</p>}
          {error && <p className="py-8 text-center text-sm text-red-600">Failed to load audit logs.</p>}
          {!isLoading && !error && data && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">When</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Action</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Resource</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Actor</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.logs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-12 text-center text-sm text-slate-400">
                          No audit entries found.
                        </TableCell>
                      </TableRow>
                    )}
                    {data.logs.map((log) => (
                      <Fragment key={log.id}>
                        <TableRow className="border-slate-50 transition-colors hover:bg-slate-50/50">
                          <TableCell className="text-sm text-slate-500">
                            {timeAgo(log.created_at)}
                          </TableCell>
                          <TableCell>
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedLogId((current) => (current === log.id ? null : log.id))
                              }
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80 ${actionBadge(log.action)}`}
                              aria-expanded={expandedLogId === log.id}
                            >
                              <svg
                                className={`h-3 w-3 transition-transform ${expandedLogId === log.id ? "rotate-90" : ""}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                              </svg>
                              {log.action}
                            </button>
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {log.resource_type ? (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600">
                                {log.resource_type}{log.resource_id ? `:${log.resource_id.slice(0, 8)}` : ""}
                              </span>
                            ) : (
                              <span className="text-slate-300">&mdash;</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {log.actor_name || log.actor_email ? (
                              <span className="text-xs font-medium text-slate-700">{log.actor_name || log.actor_email}</span>
                            ) : log.user_id ? (
                              <span className="font-mono text-xs">{log.user_id.slice(0, 8)}...</span>
                            ) : (
                              <span className="text-slate-300">system</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-400">
                            {log.ip_address || "\u2014"}
                          </TableCell>
                        </TableRow>
                        {expandedLogId === log.id && (
                          <TableRow>
                            <TableCell colSpan={5} className="bg-slate-50/50 px-4 py-4">
                              {/* Actor & Meta Details */}
                              <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Details</p>
                                <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                                  <div>
                                    <p className="text-[11px] font-medium uppercase text-slate-400">Actor</p>
                                    <p className="text-sm font-medium text-slate-800">
                                      {log.actor_name || log.actor_email || "System"}
                                    </p>
                                  </div>
                                  {log.actor_email && log.actor_name && (
                                    <div>
                                      <p className="text-[11px] font-medium uppercase text-slate-400">Email</p>
                                      <p className="text-sm text-slate-600">{log.actor_email}</p>
                                    </div>
                                  )}
                                  {log.user_id && (
                                    <div>
                                      <p className="text-[11px] font-medium uppercase text-slate-400">User ID</p>
                                      <p className="font-mono text-xs text-slate-500">{log.user_id}</p>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-[11px] font-medium uppercase text-slate-400">Timestamp</p>
                                    <p className="text-sm text-slate-600">
                                      {new Date(log.created_at).toLocaleString(undefined, {
                                        dateStyle: "medium",
                                        timeStyle: "medium",
                                      })}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-medium uppercase text-slate-400">IP Address</p>
                                    <p className="font-mono text-xs text-slate-500">{log.ip_address || "\u2014"}</p>
                                  </div>
                                  {log.resource_type && (
                                    <div>
                                      <p className="text-[11px] font-medium uppercase text-slate-400">Resource</p>
                                      <p className="text-sm text-slate-600">
                                        {log.resource_type}
                                        {log.resource_id && (
                                          <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-500">
                                            {log.resource_id}
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  )}
                                  <div className="sm:col-span-2 lg:col-span-3">
                                    <p className="text-[11px] font-medium uppercase text-slate-400">User Agent</p>
                                    <p className="truncate text-xs text-slate-400">{log.user_agent || "\u2014"}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Old / New Values */}
                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="rounded-lg border border-slate-200 bg-white p-4">
                                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0 6.75 6.75M4.5 12l6.75-6.75" />
                                    </svg>
                                    Old Values
                                  </p>
                                  <pre className="max-h-64 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-600">
                                    {formatJson(log.old_values)}
                                  </pre>
                                </div>
                                <div className="rounded-lg border border-slate-200 bg-white p-4">
                                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0-6.75-6.75M19.5 12l-6.75 6.75" />
                                    </svg>
                                    New Values
                                  </p>
                                  <pre className="max-h-64 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-600">
                                    {formatJson(log.new_values)}
                                  </pre>
                                </div>
                              </div>

                              <div className="mt-3 text-xs text-slate-400">
                                <span className="font-medium text-slate-500">Log ID:</span> <span className="font-mono">{log.id}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-sm text-slate-500">
                  Showing {Math.min(offset + 1, data.total)}&ndash;{Math.min(offset + limit, data.total)} of {data.total}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((c) => Math.max(c - 1, 1))}
                    disabled={page === 1}
                    className="h-8 px-3 text-xs"
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = page <= 3 ? i + 1 : page + i - 2;
                    if (p < 1 || p > totalPages) return null;
                    return (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(p)}
                        className={`h-8 w-8 p-0 text-xs ${p === page ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                      >
                        {p}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((c) => Math.min(c + 1, totalPages))}
                    disabled={page === totalPages}
                    className="h-8 px-3 text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminAudit;
