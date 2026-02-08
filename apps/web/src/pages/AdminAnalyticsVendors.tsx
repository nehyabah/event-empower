import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminAnalyticsNav from "@/components/admin/AdminAnalyticsNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminAnalyticsVendors } from "@/services/api/adminService";

const BAR_COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#f43f5e", "#6366f1", "#ec4899", "#14b8a6", "#f97316", "#a855f7"];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      {label && <p className="mb-1 text-xs font-medium text-slate-500">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold text-slate-900">
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const AdminAnalyticsVendors = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "analytics", "vendors"],
    queryFn: getAdminAnalyticsVendors,
  });

  return (
    <AdminLayout title="Vendor Analytics">
      <AdminAnalyticsNav />

      {isLoading && <p className="text-sm text-slate-500">Loading analytics...</p>}
      {error && <p className="text-sm text-red-600">Failed to load analytics.</p>}

      {data && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Vendors by Category - Colorful Bars */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Vendors by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.vendorsByCategory} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Vendors" radius={[0, 6, 6, 0]} barSize={20}>
                    {data.vendorsByCategory.map((_: unknown, i: number) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Vendor Growth - Area */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Vendor Growth (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.vendorGrowth}>
                  <defs>
                    <linearGradient id="vendorGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    tickFormatter={(value) => value.slice(5)}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="New Vendors"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fill="url(#vendorGrowthGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#06b6d4", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAnalyticsVendors;
