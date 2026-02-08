import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  BarChart,
  Legend,
} from "recharts";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminAnalyticsNav from "@/components/admin/AdminAnalyticsNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminAnalyticsOverview } from "@/services/api/adminService";

const PIE_COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#f43f5e", "#6366f1"];
const BAR_GRADIENT_ID = "barGradient";

const statAccents = ["border-l-slate-800", "border-l-slate-600", "border-l-slate-400"];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color?: string }>; label?: string }) => {
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

const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-semibold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const AdminAnalytics = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "analytics", "overview"],
    queryFn: getAdminAnalyticsOverview,
  });

  return (
    <AdminLayout title="Analytics Overview">
      <AdminAnalyticsNav />

      {/* Stat Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Users", value: data?.totals.users || 0, idx: 0 },
          { label: "Total Vendors", value: data?.totals.vendors || 0, idx: 1 },
          { label: "Total Inquiries", value: data?.totals.inquiries || 0, idx: 2 },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-lg border border-slate-200 border-l-4 ${statAccents[stat.idx]} bg-white p-4 shadow-sm`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{stat.label}</p>
            <p className="mt-1.5 text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </section>

      {isLoading && <p className="text-sm text-slate-500">Loading analytics...</p>}
      {error && <p className="text-sm text-red-600">Failed to load analytics.</p>}

      {/* User Growth Area Chart */}
      {data && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">User Growth (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.userGrowth}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
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
                  name="Users"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fill="url(#areaGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Pie + Bar side by side */}
      {data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Inquiry Status Mix</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => <span className="text-xs capitalize text-slate-600">{value}</span>}
                  />
                  <Pie
                    data={data.inquiriesByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="45%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={3}
                    cornerRadius={4}
                    labelLine={false}
                    label={PieLabel}
                  >
                    {data.inquiriesByStatus.map((_: unknown, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Daily Inquiries</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.inquiryVolume}>
                  <defs>
                    <linearGradient id={BAR_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#0891b2" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickFormatter={(value) => value.slice(5)}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Inquiries" fill={`url(#${BAR_GRADIENT_ID})`} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAnalytics;
