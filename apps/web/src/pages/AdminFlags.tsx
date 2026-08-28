import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flag, ShieldCheck } from "lucide-react";
import { getAdminMessageFlags } from "@/services/api/adminService";
import { formatNumber } from "@/lib/number";

/**
 * Blocked attempts to exchange contact details in chat.
 *
 * These were being recorded with nowhere to read them, which made "chats are
 * monitored, violations may disable an account" a claim nobody could act on.
 *
 * Grouped by person and ordered by count, because one blocked message is a
 * mistake and the same account doing it repeatedly is the thing worth a
 * decision.
 */

const VIOLATION_LABEL: Record<string, string> = {
  phone: "Phone number",
  email: "Email address",
  url: "Link",
  social_handle: "Social handle",
  spelled_digits: "Spelled-out digits",
};

const SURFACE_LABEL: Record<string, string> = {
  inquiry: "Vendor chat",
  workspace_chat: "Workspace chat",
};

const AdminFlags = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "message-flags"],
    queryFn: getAdminMessageFlags,
  });

  return (
    <AdminLayout title="Safety flags">
      <div>
        <p className="text-sm text-muted-foreground">
          Messages blocked for containing contact details, grouped by sender. The text
          shown is what they tried to send.
        </p>
      </div>

      {isLoading && <p className="text-sm text-slate-600">Loading flags...</p>}
      {error && <p className="text-sm text-red-600">Failed to load safety flags.</p>}

      {!isLoading && !error && data && data.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <ShieldCheck className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <h3 className="font-medium mb-1">Nothing flagged</h3>
            <p className="text-sm text-muted-foreground">
              No one has tried to pass contact details through chat.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && data && data.length > 0 && (
        <div className="space-y-4">
          {data.map((row) => (
            <Card key={row.userId ?? "deleted"}>
              <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                <div className="min-w-0">
                  <CardTitle className="text-base truncate">
                    {row.name || row.email || "Deleted account"}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {row.email}
                    {row.userType && ` · ${row.userType}`}
                    {row.isActive === false && " · suspended"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={
                      row.flagCount >= 3
                        ? "text-red-700 border-red-300"
                        : "text-amber-700 border-amber-300"
                    }
                  >
                    <Flag className="h-3 w-3 mr-1" />
                    {formatNumber(row.flagCount)}
                  </Badge>
                  {row.userId && (
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/admin/users/${row.userId}`}>Review account</Link>
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {row.violations.map((v) => (
                    <Badge key={v} variant="secondary" className="text-xs font-normal">
                      {VIOLATION_LABEL[v] || v}
                    </Badge>
                  ))}
                  <span className="text-xs text-muted-foreground self-center ml-1">
                    last {new Date(row.lastAt).toLocaleDateString("en-NG", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {row.samples.map((sample, i) => (
                    <div key={i} className="rounded-md border bg-muted/40 px-3 py-2">
                      <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">
                        {sample.text}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {SURFACE_LABEL[sample.surface] || sample.surface} ·{" "}
                        {new Date(sample.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminFlags;
