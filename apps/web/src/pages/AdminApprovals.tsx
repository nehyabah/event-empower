import { useEffect, useState } from "react";
import { apiClient } from "@/services/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckCircle, XCircle, Instagram, Phone, MapPin, Briefcase, Store,
  Loader2, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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
}

const AdminApprovals = () => {
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<PendingUser | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await apiClient.get<PendingUser[]>("/admin/pending-approvals");
      if (res.data) setPending(res.data);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleApprove = async (user: PendingUser) => {
    setActioningId(user.id);
    try {
      await apiClient.post(`/admin/users/${user.id}/approve`);
      setPending((prev) => prev.filter((u) => u.id !== user.id));
      toast.success(`${user.businessName || user.name} approved`);
    } catch {
      toast.error("Failed to approve");
    } finally {
      setActioningId(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    setActioningId(rejectTarget.id);
    try {
      await apiClient.post(`/admin/users/${rejectTarget.id}/reject`, { reason: rejectReason });
      setPending((prev) => prev.filter((u) => u.id !== rejectTarget.id));
      toast.success(`${rejectTarget.businessName || rejectTarget.name} rejected`);
      setRejectTarget(null);
      setRejectReason("");
    } catch {
      toast.error("Failed to reject");
    } finally {
      setActioningId(null);
    }
  };

  const igUrl = (handle: string) => {
    const clean = handle.replace(/^@/, "");
    return `https://instagram.com/${clean}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pending Approvals</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {pending.length} {pending.length === 1 ? "application" : "applications"} awaiting review
          </p>
        </div>
        <Link to="/admin">
          <Button variant="outline" size="sm">← Back to Dashboard</Button>
        </Link>
      </div>

      {pending.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">All caught up!</h3>
            <p className="text-muted-foreground text-sm">No pending applications at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pending.map((u) => (
            <Card key={u.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-base">{u.businessName || u.name || "—"}</span>
                      <Badge variant={u.userType === "vendor" ? "secondary" : "outline"} className="text-xs">
                        {u.userType === "vendor"
                          ? <><Store className="h-3 w-3 mr-1" />Vendor</>
                          : <><Briefcase className="h-3 w-3 mr-1" />Planner</>
                        }
                      </Badge>
                    </div>

                    {/* Contact info */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {u.name && <span>{u.name}</span>}
                      {u.email && <span>{u.email}</span>}
                      {u.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />{u.phone}
                        </span>
                      )}
                      {u.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />{u.city}
                        </span>
                      )}
                    </div>

                    {/* Social / verification */}
                    <div className="flex flex-wrap gap-3">
                      {u.instagramHandle && (
                        <a
                          href={igUrl(u.instagramHandle)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                          <Instagram className="h-4 w-4" />
                          {u.instagramHandle}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {u.whatsappPhone && (
                        <a
                          href={`https://wa.me/${u.whatsappPhone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-green-700 hover:underline"
                        >
                          <Phone className="h-4 w-4" />
                          WhatsApp: {u.whatsappPhone}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Applied {new Date(u.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={actioningId === u.id}
                      onClick={() => handleApprove(u)}
                    >
                      {actioningId === u.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <><CheckCircle className="h-4 w-4 mr-1.5" />Approve</>
                      }
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      disabled={actioningId === u.id}
                      onClick={() => { setRejectTarget(u); setRejectReason(""); }}
                    >
                      <XCircle className="h-4 w-4 mr-1.5" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => { if (!open) setRejectTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Rejecting <strong>{rejectTarget?.businessName || rejectTarget?.name}</strong>. Optionally add a reason (not shown to the user publicly).
            </p>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (internal note)..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!!actioningId}
            >
              {actioningId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApprovals;
