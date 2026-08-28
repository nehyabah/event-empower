import { useMemo, useState } from "react";
import { formatNumber } from "@/lib/number";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  getAdminSubscribers,
  activateAdminSubscriber,
  deactivateAdminSubscriber,
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

const AdminSubscribers = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 50;
  const offset = (page - 1) * limit;

  const queryKey = useMemo(
    () => ["admin", "subscribers", { search, limit, offset }],
    [search, limit, offset]
  );

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getAdminSubscribers({ search: search || undefined, limit, offset }),
  });

  const totalPages = data ? Math.max(Math.ceil(data.total / limit), 1) : 1;

  const activateMut = useMutation({
    mutationFn: activateAdminSubscriber,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "subscribers"] }),
  });

  const deactivateMut = useMutation({
    mutationFn: deactivateAdminSubscriber,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "subscribers"] }),
  });

  return (
    <AdminLayout title="Subscribers">
      <Card className="border-0 shadow-sm">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Newsletter Subscribers</CardTitle>
            {data && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {data.total.toLocaleString()} subscribers
              </span>
            )}
          </div>
          <div className="relative md:max-w-sm">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <Input
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="py-8 text-center text-sm text-slate-400">Loading subscribers...</p>}
          {error && <p className="py-8 text-center text-sm text-red-600">Failed to load subscribers.</p>}
          {!isLoading && !error && data && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Name</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Source</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Subscribed</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.subscribers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12 text-center text-sm text-slate-400">No subscribers found.</TableCell>
                      </TableRow>
                    )}
                    {data.subscribers.map((s) => (
                      <TableRow key={s.id} className="border-slate-50 hover:bg-slate-50/50">
                        <TableCell className="text-sm font-medium text-slate-800">{s.email}</TableCell>
                        <TableCell className="text-sm text-slate-500">{s.name || "\u2014"}</TableCell>
                        <TableCell>
                          {s.source ? (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{s.source}</span>
                          ) : (
                            <span className="text-slate-300">&mdash;</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                            {s.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">{timeAgo(s.subscribed_at)}</TableCell>
                        <TableCell className="text-right">
                          {s.is_active ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-red-600 hover:text-red-700"
                              disabled={deactivateMut.isPending}
                              onClick={() => deactivateMut.mutate(s.id)}
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-emerald-600 hover:text-emerald-700"
                              disabled={activateMut.isPending}
                              onClick={() => activateMut.mutate(s.id)}
                            >
                              Activate
                            </Button>
                          )}
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
    </AdminLayout>
  );
};

export default AdminSubscribers;
