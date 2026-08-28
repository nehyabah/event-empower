import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
  getAdminVendor,
  verifyAdminVendor,
  unverifyAdminVendor,
  featureAdminVendor,
  unfeatureAdminVendor,
  suspendAdminVendor,
  activateAdminVendor,
  updateAdminVendor,
  approveAdminUser,
  rejectAdminUser,
} from "@/services/api/adminService";

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </span>
    <span className="text-sm text-slate-900">{value}</span>
  </div>
);

const AdminVendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [editForm, setEditForm] = useState({
    business_name: "",
    category: "",
    description: "",
    location: "",
    email: "",
    phone: "",
    website: "",
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "vendor", id],
    queryFn: () => getAdminVendor(id || ""),
    enabled: !!id,
  });

  const startEditing = () => {
    if (!data) return;
    setEditForm({
      business_name: data.profile.business_name || "",
      category: data.profile.category || "",
      description: data.profile.description || "",
      location: data.profile.location || "",
      email: data.profile.email || "",
      phone: data.profile.phone || "",
      website: data.profile.website || "",
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!id) return;
    setActionError(null);
    setActionLoading(true);
    try {
      await updateAdminVendor(id, editForm);
      setIsEditing(false);
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update vendor");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!data) return;
    setActionLoading(true);
    try {
      await approveAdminUser(data.profile.user_id);
      toast.success(`${data.profile.business_name} approved`);
      navigate("/admin/approvals");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!data) return;
    setActionLoading(true);
    try {
      await rejectAdminUser(data.profile.user_id, rejectReason);
      toast.success(`${data.profile.business_name} rejected`);
      setRejecting(false);
      navigate("/admin/approvals");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (
    action: () => Promise<void>,
    confirmMsg?: string
  ) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setActionError(null);
    setActionLoading(true);
    try {
      await action();
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout title="Vendor Profile">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Link to="/admin/vendors" className="font-medium hover:text-slate-900">
            Vendors
          </Link>
          <span>/</span>
          <span>{data?.profile.business_name || "Profile"}</span>
        </div>
        {data?.approvalStatus && (
          <Badge variant={data.approvalStatus === "pending" ? "outline" : "secondary"}>
            {data.approvalStatus}
          </Badge>
        )}
      </div>

      {actionError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {actionError}
        </p>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Profile Overview</CardTitle>
          {data && !isEditing && (
            <Button variant="outline" size="sm" onClick={startEditing}>
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <p className="text-sm text-slate-600">Loading vendor...</p>}
          {error && <p className="text-sm text-red-600">Failed to load vendor.</p>}

          {!isLoading && !error && data && !isEditing && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailRow label="Business Name" value={data.profile.business_name} />
                <DetailRow label="Category" value={data.profile.category} />
                <DetailRow label="Location" value={data.profile.location || "—"} />
                <DetailRow label="Email" value={data.profile.email || data.email || "—"} />
                <DetailRow label="Phone" value={data.profile.phone || "—"} />
                <DetailRow label="Website" value={data.profile.website || "—"} />
                <DetailRow
                  label="Status"
                  value={`${data.profile.is_active ? "Active" : "Inactive"} • ${
                    data.profile.is_verified ? "Verified" : "Unverified"
                  } • ${data.profile.is_featured ? "Featured" : "Not Featured"}`}
                />
                <DetailRow label="Rating" value={`${data.profile.rating} (${data.profile.review_count} reviews)`} />
                <DetailRow
                  label="Signed up"
                  value={
                    data.createdAt
                      ? new Date(data.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
                      : "—"
                  }
                />
                <DetailRow
                  label="Submitted for review"
                  value={
                    data.onboardingSubmittedAt
                      ? new Date(data.onboardingSubmittedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
                      : "Not yet"
                  }
                />
                <DetailRow label="Account type" value={data.authProvider === "google" ? "Google sign-in" : "Email + password"} />
              </div>

              {data.profile.description && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Description
                  </span>
                  <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                    {data.profile.description}
                  </p>
                </div>
              )}

              {data.services.length > 0 && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Services ({data.services.length})
                  </span>
                  <div className="mt-2 divide-y rounded-md border">
                    {data.services.map((svc) => (
                      <div key={svc.id} className="flex items-start justify-between gap-4 p-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{svc.name}</p>
                          {svc.description && (
                            <p className="text-xs text-slate-600 mt-0.5">{svc.description}</p>
                          )}
                        </div>
                        <span className="text-sm text-slate-700 shrink-0">
                          {svc.price != null ? `₦${svc.price.toLocaleString()}` : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.images.length > 0 && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Photos ({data.images.length})
                  </span>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {data.images
                      .slice()
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((img) => (
                        <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={img.url}
                            alt={img.alt_text || "Vendor photo"}
                            className={`aspect-square w-full rounded-lg object-cover border ${
                              img.is_primary ? "ring-2 ring-primary" : ""
                            }`}
                          />
                        </a>
                      ))}
                  </div>
                </div>
              )}

              {data.services.length === 0 && data.images.length === 0 && !data.profile.description && (
                <p className="text-sm bg-amber-50 border border-amber-200 rounded px-3 py-2 text-amber-900">
                  No description, services or photos have been added yet.
                </p>
              )}
            </div>
          )}

          {isEditing && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={editForm.business_name}
                    onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} disabled={actionLoading}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={actionLoading}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {data && data.approvalStatus === "pending" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Decision</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={actionLoading}
              onClick={handleApprove}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <CheckCircle className="h-4 w-4 mr-1.5" />}
              Approve
            </Button>
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
              disabled={actionLoading}
              onClick={() => { setRejecting(true); setRejectReason(""); }}
            >
              <XCircle className="h-4 w-4 mr-1.5" />
              Reject
            </Button>
          </CardContent>
        </Card>
      )}

      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.profile.is_verified ? (
                <Button
                  variant="outline"
                  disabled={actionLoading}
                  onClick={() => handleAction(() => unverifyAdminVendor(id!), "Remove verification from this vendor?")}
                >
                  Unverify
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled={actionLoading}
                  onClick={() => handleAction(() => verifyAdminVendor(id!))}
                >
                  Verify
                </Button>
              )}

              {data.profile.is_featured ? (
                <Button
                  variant="outline"
                  disabled={actionLoading}
                  onClick={() => handleAction(() => unfeatureAdminVendor(id!))}
                >
                  Unfeature
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled={actionLoading}
                  onClick={() => handleAction(() => featureAdminVendor(id!))}
                >
                  Feature
                </Button>
              )}

              {data.profile.is_active ? (
                <Button
                  variant="destructive"
                  disabled={actionLoading}
                  onClick={() =>
                    handleAction(
                      () => suspendAdminVendor(id!),
                      "Suspend this vendor? Their account and profile will be deactivated."
                    )
                  }
                >
                  Suspend
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled={actionLoading}
                  onClick={() => handleAction(() => activateAdminVendor(id!))}
                >
                  Activate
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      <Dialog open={rejecting} onOpenChange={setRejecting}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject application</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              This is sent to the applicant by email, so write it as you would to them
              directly.
            </p>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRejectConfirm} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminVendorDetail;
