import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminStats, getAdminDashboardActivity } from "@/services/api/adminService";
import { apiClient } from "@/services/api/client";

const statAccents = [
  "border-l-slate-800",
  "border-l-slate-600",
  "border-l-slate-500",
  "border-l-slate-400",
  "border-l-slate-300",
];

const StatCard = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) => (
  <div className={`rounded-lg border border-slate-200 border-l-4 ${accent} bg-white p-4 shadow-sm`}>
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1.5 text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
  </div>
);

const Badge = ({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "info";
}) => {
  const colors = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    info: "bg-sky-50 text-sky-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[variant]}`}>
      {children}
    </span>
  );
};

const typeBadgeVariant = (userType: string) => {
  switch (userType) {
    case "vendor": return "info" as const;
    case "planner": return "warning" as const;
    case "admin": return "success" as const;
    default: return "default" as const;
  }
};

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case "new": return "info" as const;
    case "replied": return "success" as const;
    case "archived": return "default" as const;
    default: return "default" as const;
  }
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

const AdminDashboard = () => {
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    apiClient.get<unknown[]>("/admin/pending-approvals").then((res) => {
      if (res.data) setPendingCount(res.data.length);
    });
  }, []);

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: getAdminStats,
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ["admin", "dashboard-activity"],
    queryFn: getAdminDashboardActivity,
  });

  return (
    <AdminLayout title="Dashboard">
      {/* Pending approvals banner */}
      {pendingCount !== null && pendingCount > 0 && (
        <Link
          to="/admin/approvals"
          className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-5 py-3.5 hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
              {pendingCount}
            </span>
            <span className="text-sm font-medium text-amber-900">
              {pendingCount === 1 ? "1 vendor/planner application" : `${pendingCount} vendor/planner applications`} awaiting approval
            </span>
          </div>
          <span className="text-xs font-medium text-amber-700">Review →</span>
        </Link>
      )}

      {/* Stat Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total Users", value: stats?.totalUsers || 0 },
          { label: "Clients", value: stats?.clients || 0 },
          { label: "Vendors", value: stats?.vendors || 0 },
          { label: "Planners", value: stats?.planners || 0 },
          { label: "Admins", value: stats?.admins || 0 },
        ].map((stat, i) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} accent={statAccents[i]} />
        ))}
      </section>

      {statsLoading && <p className="text-sm text-slate-500">Loading dashboard data...</p>}
      {statsError && <p className="text-sm text-red-600">Failed to load admin stats.</p>}

      {/* Active Users */}
      {activity && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { label: "Last 24 hours", value: activity.activeUsers.last24h, color: "text-slate-900" },
                { label: "Last 7 days", value: activity.activeUsers.last7d, color: "text-slate-900" },
                { label: "Last 30 days", value: activity.activeUsers.last30d, color: "text-slate-900" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                  <div className={`text-3xl font-bold ${item.color}`}>{item.value}</div>
                  <div className="text-sm text-slate-500">{item.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Feeds */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Registrations */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Registrations</CardTitle>
              <Link to="/admin/users" className="text-xs font-medium text-slate-500 hover:text-slate-700">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {activityLoading && <p className="text-sm text-slate-400">Loading...</p>}
              {activity?.recentRegistrations.map((user) => (
                <Link
                  key={user.id}
                  to={`/admin/users/${user.id}`}
                  className="flex items-center justify-between rounded-lg px-2 py-2.5 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {(user.name || user.email || "?")[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {user.name || user.email || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-400">{timeAgo(user.createdAt)}</p>
                    </div>
                  </div>
                  <Badge variant={typeBadgeVariant(user.userType)}>{user.userType}</Badge>
                </Link>
              ))}
              {activity && activity.recentRegistrations.length === 0 && (
                <p className="py-4 text-center text-sm text-slate-400">No recent registrations</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Inquiries */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Inquiries</CardTitle>
              <Link to="/admin/inquiries" className="text-xs font-medium text-slate-500 hover:text-slate-700">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {activityLoading && <p className="text-sm text-slate-400">Loading...</p>}
              {activity?.recentInquiries.map((inquiry) => (
                <Link
                  key={inquiry.id}
                  to={`/admin/inquiries/${inquiry.id}`}
                  className="flex items-center justify-between rounded-lg px-2 py-2.5 transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {inquiry.senderName}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      to {inquiry.vendorName}
                    </p>
                  </div>
                  <Badge variant={statusBadgeVariant(inquiry.status)}>{inquiry.status}</Badge>
                </Link>
              ))}
              {activity && activity.recentInquiries.length === 0 && (
                <p className="py-4 text-center text-sm text-slate-400">No recent inquiries</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Admin Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Admin Actions</CardTitle>
              <Link to="/admin/audit" className="text-xs font-medium text-slate-500 hover:text-slate-700">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {activityLoading && <p className="text-sm text-slate-400">Loading...</p>}
              {activity?.recentAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg px-2 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {log.action.replace("admin.", "")}
                    </p>
                    <p className="text-xs text-slate-400">
                      {log.actorName || "System"}{log.resourceType ? ` \u2022 ${log.resourceType}` : ""}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-xs text-slate-400">
                    {timeAgo(log.createdAt)}
                  </span>
                </div>
              ))}
              {activity && activity.recentAuditLogs.length === 0 && (
                <p className="py-4 text-center text-sm text-slate-400">No recent actions</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
