import { useMemo, useState } from "react";
import { formatNumber } from "@/lib/number";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminVendors } from "@/services/api/adminService";

const AdminVendors = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const queryKey = useMemo(
    () => ["admin", "vendors", { search, limit, offset }],
    [search, limit, offset]
  );

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getAdminVendors({ search, limit, offset }),
    keepPreviousData: true,
  });

  const totalPages = data ? Math.max(Math.ceil(data.total / limit), 1) : 1;

  return (
    <AdminLayout title="Vendors">
      <Card className="border-0 shadow-sm">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Vendor Directory</CardTitle>
            {data && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {data.total.toLocaleString()} vendors
              </span>
            )}
          </div>
          <div className="relative md:max-w-xs">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <Input
              placeholder="Search name, category, location..."
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="py-8 text-center text-sm text-slate-400">Loading vendors...</p>}
          {error && <p className="py-8 text-center text-sm text-red-600">Failed to load vendors.</p>}
          {!isLoading && !error && data && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Business</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Category</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Verified</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.vendors.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-12 text-center text-sm text-slate-400">
                          No vendors found.
                        </TableCell>
                      </TableRow>
                    )}
                    {data.vendors.map((vendor) => (
                      <TableRow key={vendor.id} className="border-slate-50 transition-colors hover:bg-slate-50/50">
                        <TableCell>
                          <Link to={`/admin/vendors/${vendor.id}`} className="flex items-center gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-100 to-cyan-100 text-xs font-semibold text-sky-700">
                              {(vendor.businessName || "?")[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900 hover:text-primary">
                                {vendor.businessName}
                              </p>
                              {vendor.location && (
                                <p className="truncate text-xs text-slate-400">{vendor.location}</p>
                              )}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            {vendor.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            vendor.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}>
                            {vendor.isActive ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {vendor.isVerified ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                              </svg>
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                              Unverified
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {new Date(vendor.createdAt).toLocaleDateString()}
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

export default AdminVendors;
