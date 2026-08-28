import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/services/api/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CheckCircle, Instagram, MapPin, Briefcase, Store,
  Loader2, Search, AlertTriangle, Clock, ChevronRight,
} from "lucide-react";

interface PendingUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  userType: "vendor" | "planner";
  businessName: string | null;
  instagramHandle: string | null;
  whatsappPhone: string | null;
  city: string | null;
  createdAt: string;
  onboardingSubmittedAt: string | null;
  authProvider: string | null;
  vendorProfileId: string | null;
  isPossibleDuplicate: boolean;
}

type Tab = "ready" | "incomplete" | "all";

/** Days since they submitted, so the queue shows what is going stale. */
const waitingDays = (iso: string | null): number | null => {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

/**
 * The approval queue.
 *
 * Read-only by design: approving or rejecting happens on the applicant's
 * detail page, so a decision cannot be made from a two-line summary without
 * having looked at the profile it is about.
 */
const AdminApprovals = () => {
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("ready");
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiClient
      .get<PendingUser[]>("/admin/pending-approvals")
      .then((res) => {
        if (res.data) setPending(res.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const submittedCount = pending.filter((u) => u.onboardingSubmittedAt).length;
  const notSubmittedCount = pending.length - submittedCount;

  const visible = pending.filter((u) => {
    if (tab === "ready" && !u.onboardingSubmittedAt) return false;
    if (tab === "incomplete" && u.onboardingSubmittedAt) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [u.businessName, u.name, u.email, u.city]
      .filter(Boolean)
      .some((f) => f!.toLowerCase().includes(q));
  });

  /** Vendors are keyed by vendor_profiles.id, planners by their user id. */
  const reviewHref = (u: PendingUser) =>
    u.userType === "vendor"
      ? u.vendorProfileId
        ? `/admin/vendors/${u.vendorProfileId}`
        : `/admin/users/${u.id}`
      : `/admin/planners/${u.id}`;

  return (
    <AdminLayout title="Approvals">
      <div>
        <p className="text-sm text-muted-foreground">
          {submittedCount} {submittedCount === 1 ? "application" : "applications"} ready for review
          {notSubmittedCount > 0 && ` · ${notSubmittedCount} still filling out their profile`}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex gap-1 p-1 bg-muted/60 rounded-lg w-full sm:w-auto">
          {([
            ["ready", `Ready (${submittedCount})`],
            ["incomplete", `Incomplete (${notSubmittedCount})`],
            ["all", `All (${pending.length})`],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`flex-1 sm:flex-none whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === value
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by business, name, email or city..."
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : visible.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <h3 className="font-medium mb-1">
              {pending.length === 0 ? "All caught up" : "Nothing matches"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {pending.length === 0
                ? "No pending applications at the moment."
                : "Try a different tab or search term."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border divide-y overflow-hidden bg-card">
          {visible.map((u) => {
            const days = waitingDays(u.onboardingSubmittedAt);
            return (
              <Link
                key={u.id}
                to={reviewHref(u)}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group"
              >
                <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  {u.userType === "vendor"
                    ? <Store className="h-4 w-4 text-muted-foreground" />
                    : <Briefcase className="h-4 w-4 text-muted-foreground" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">
                      {u.businessName || u.name || "Unnamed application"}
                    </span>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {u.userType}
                    </Badge>
                    {u.isPossibleDuplicate && (
                      <Badge variant="outline" className="text-xs text-amber-700 border-amber-300">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Possible duplicate
                      </Badge>
                    )}
                    {!u.onboardingSubmittedAt && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        Still onboarding
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                    {u.name && u.businessName && <span className="truncate">{u.name}</span>}
                    {u.email && <span className="truncate">{u.email}</span>}
                    {u.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {u.city}
                      </span>
                    )}
                    {u.instagramHandle && (
                      <span className="flex items-center gap-1">
                        <Instagram className="h-3 w-3" />
                        {u.instagramHandle}
                      </span>
                    )}
                  </div>
                </div>

                <div className="hidden md:block text-right shrink-0">
                  {u.onboardingSubmittedAt ? (
                    <>
                      <p className={`text-sm font-medium ${days !== null && days >= 3 ? "text-amber-700" : ""}`}>
                        {days === 0 ? "Today" : `${days}d waiting`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fmtDate(u.onboardingSubmittedAt)}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Signed up {fmtDate(u.createdAt)}
                    </p>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 pointer-events-none group-hover:bg-background"
                  tabIndex={-1}
                >
                  Review
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminApprovals;
