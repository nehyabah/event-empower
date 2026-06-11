import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getAdminVendor,
  verifyAdminVendor,
  unverifyAdminVendor,
  featureAdminVendor,
  unfeatureAdminVendor,
  suspendAdminVendor,
  activateAdminVendor,
  updateAdminVendor,
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
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Link to="/admin/vendors" className="font-medium hover:text-slate-900">
          Vendors
        </Link>
        <span>/</span>
        <span>{data?.profile.business_name || "Profile"}</span>
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
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DetailRow label="Services" value={`${data.services.length} listed`} />
                <DetailRow label="Images" value={`${data.images.length} uploaded`} />
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
    </AdminLayout>
  );
};

export default AdminVendorDetail;
