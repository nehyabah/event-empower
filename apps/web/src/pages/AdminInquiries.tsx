import { useMemo, useState } from "react";
import { formatNumber } from "@/lib/number";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminInquiries } from "@/services/api/adminService";

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "New", value: "new" },
  { label: "Replied", value: "replied" },
  { label: "Archived", value: "archived" },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    new: "bg-sky-50 text-sky-700",
    replied: "bg-emerald-50 text-emerald-700",
    archived: "bg-slate-100 text-slate-500",
  };
  return map[status] || "bg-slate-100 text-slate-600";
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

const AdminInquiries = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const queryKey = useMemo(
    () => ["admin", "inquiries", { search, status, limit, offset }],
    [search, status, limit, offset]
  );

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () =>
      getAdminInquiries({
        search,
        status: status === "all" ? undefined : status,
        limit,
        offset,
      }),
    keepPreviousData: true,
  });

  const totalPages = data ? Math.max(Math.ceil(data.total / limit), 1) : 1;

  return (
    <AdminLayout title="Inquiries">
      <Card className="border-0 shadow-sm">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Inquiry Manager</CardTitle>
            {data && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {data.total.toLocaleString()} inquiries
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative md:max-w-xs md:flex-1">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <Input
                placeholder="Search sender or vendor..."
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
              <SelectTrigger className="md:w-44">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="py-8 text-center text-sm text-slate-400">Loading inquiries...</p>}
          {error && <p className="py-8 text-center text-sm text-red-600">Failed to load inquiries.</p>}
          {!isLoading && !error && data && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Vendor</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sender</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.inquiries.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-12 text-center text-sm text-slate-400">
                          No inquiries found.
                        </TableCell>
                      </TableRow>
                    )}
                    {data.inquiries.map((inquiry) => (
                      <TableRow key={inquiry.id} className="border-slate-50 transition-colors hover:bg-slate-50/50">
                        <TableCell>
                          <Link
                            to={`/admin/inquiries/${inquiry.id}`}
                            className="font-medium text-slate-900 hover:text-primary"
                          >
                            {inquiry.vendorName}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 text-[10px] font-semibold text-amber-700">
                              {(inquiry.senderName || "?")[0]?.toUpperCase()}
                            </div>
                            <span className="text-sm text-slate-600">{inquiry.senderName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusBadge(inquiry.status)}`}>
                            {inquiry.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {timeAgo(inquiry.createdAt)}
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

export default AdminInquiries;
