import { useMemo, useState } from "react";
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
import { getAdminUsers } from "@/services/api/adminService";
import type { UserType } from "@/context/AuthContext";

const typeOptions: Array<{ label: string; value: UserType | "all" }> = [
  { label: "All types", value: "all" },
  { label: "Clients", value: "client" },
  { label: "Vendors", value: "vendor" },
  { label: "Planners", value: "planner" },
  { label: "Admins", value: "admin" },
];

const typeBadge = (type: string) => {
  const map: Record<string, string> = {
    client: "bg-slate-100 text-slate-700",
    vendor: "bg-sky-50 text-sky-700",
    planner: "bg-amber-50 text-amber-700",
    admin: "bg-wedding-navy/10 text-wedding-navy",
  };
  return map[type] || "bg-slate-100 text-slate-700";
};

const statusBadge = (isActive: boolean, deletedAt: string | null) => {
  if (deletedAt) return { label: "Deleted", cls: "bg-red-50 text-red-700" };
  if (isActive) return { label: "Active", cls: "bg-emerald-50 text-emerald-700" };
  return { label: "Suspended", cls: "bg-amber-50 text-amber-700" };
};

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<UserType | "all">("all");
  const [page, setPage] = useState(1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const queryKey = useMemo(
    () => ["admin", "users", { search, type, limit, offset }],
    [search, type, limit, offset]
  );

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getAdminUsers({ search, type, limit, offset }),
    keepPreviousData: true,
  });

  const totalPages = data ? Math.max(Math.ceil(data.total / limit), 1) : 1;

  return (
    <AdminLayout title="Users">
      <Card className="border-0 shadow-sm">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">User Directory</CardTitle>
            {data && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {data.total.toLocaleString()} users
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative md:max-w-xs md:flex-1">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <Input
                placeholder="Search name, email, phone..."
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={type} onValueChange={(value) => { setType(value as UserType | "all"); setPage(1); }}>
              <SelectTrigger className="md:w-44">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="py-8 text-center text-sm text-slate-400">Loading users...</p>}
          {error && <p className="py-8 text-center text-sm text-red-600">Failed to load users.</p>}
          {!isLoading && !error && data && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">User</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Type</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-12 text-center text-sm text-slate-400">
                          No users found.
                        </TableCell>
                      </TableRow>
                    )}
                    {data.users.map((user) => {
                      const status = statusBadge(user.isActive, user.deletedAt);
                      return (
                        <TableRow key={user.id} className="border-slate-50 transition-colors hover:bg-slate-50/50">
                          <TableCell>
                            <Link to={`/admin/users/${user.id}`} className="flex items-center gap-3">
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-50 to-amber-100 text-xs font-semibold text-amber-800">
                                {(user.name || user.email || "?")[0]?.toUpperCase()}
                              </div>
                              <span className="font-medium text-slate-900 hover:text-primary">
                                {user.name || "Unnamed user"}
                              </span>
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">{user.email || "\u2014"}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${typeBadge(user.userType)}`}>
                              {user.userType}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.cls}`}>
                              {status.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-sm text-slate-500">
                  Showing {Math.min(offset + 1, data.total)}\u2013{Math.min(offset + limit, data.total)} of {data.total}
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

export default AdminUsers;
