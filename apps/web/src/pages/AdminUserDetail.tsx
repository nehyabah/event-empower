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
  activateAdminUser,
  getAdminUser,
  softDeleteAdminUser,
  suspendAdminUser,
  updateAdminUser,
  updateAdminUserNotes,
  resetAdminUserPassword,
} from "@/services/api/adminService";

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </span>
    <span className="text-sm text-slate-900">{value}</span>
  </div>
);

const AdminUserDetail = () => {
  const { id } = useParams();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    user_type: "",
  });
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "user", id],
    queryFn: () => getAdminUser(id || ""),
    enabled: !!id,
  });

  const handleAction = async (action: "suspend" | "activate" | "delete") => {
    if (!id) return;
    setActionError(null);

    if (action === "delete") {
      const confirmed = window.confirm("Soft delete this user? They will be deactivated.");
      if (!confirmed) return;
    }

    setActionLoading(true);
    try {
      if (action === "suspend") {
        await suspendAdminUser(id);
      } else if (action === "activate") {
        await activateAdminUser(id);
      } else {
        await softDeleteAdminUser(id);
      }
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const startEditing = () => {
    if (!data) return;
    setEditForm({
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      user_type: data.userType,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!id) return;
    setActionError(null);
    setActionLoading(true);
    try {
      await updateAdminUser(id, editForm);
      setIsEditing(false);
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setActionLoading(false);
    }
  };

  const startEditingNotes = () => {
    setNotesValue(data?.adminNotes || "");
    setIsEditingNotes(true);
  };

  const handleSaveNotes = async () => {
    if (!id) return;
    setActionError(null);
    setActionLoading(true);
    try {
      await updateAdminUserNotes(id, notesValue);
      setIsEditingNotes(false);
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update notes");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!id) return;
    const confirmed = window.confirm(
      "Reset this user's password? A temporary password will be generated and all their sessions will be revoked."
    );
    if (!confirmed) return;
    setActionError(null);
    setActionLoading(true);
    setTempPassword(null);
    try {
      const result = await resetAdminUserPassword(id);
      setTempPassword(result.temporaryPassword);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout title="User Profile">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Link to="/admin/users" className="font-medium hover:text-slate-900">
          Users
        </Link>
        <span>/</span>
        <span>{data?.name || "Profile"}</span>
      </div>

      {actionError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {actionError}
        </p>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Account Details</CardTitle>
          {data && !isEditing && !data.deletedAt && (
            <Button variant="outline" size="sm" onClick={startEditing}>
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <p className="text-sm text-slate-600">Loading user...</p>}
          {error && <p className="text-sm text-red-600">Failed to load user.</p>}

          {!isLoading && !error && data && !isEditing && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailRow label="Name" value={data.name || "Unnamed user"} />
                <DetailRow label="Email" value={data.email || "—"} />
                <DetailRow label="Phone" value={data.phone || "—"} />
                <DetailRow label="User Type" value={data.userType} />
                <DetailRow
                  label="Status"
                  value={data.deletedAt ? "Deleted" : data.isActive ? "Active" : "Suspended"}
                />
                <DetailRow
                  label="Created"
                  value={new Date(data.createdAt).toLocaleString()}
                />
                <DetailRow
                  label="Last Updated"
                  value={new Date(data.updatedAt).toLocaleString()}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleAction("suspend")}
                  disabled={actionLoading || !data.isActive || !!data.deletedAt}
                >
                  Suspend
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAction("activate")}
                  disabled={actionLoading || data.isActive || !!data.deletedAt}
                >
                  Activate
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetPassword}
                  disabled={actionLoading || !!data.deletedAt}
                >
                  Reset Password
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction("delete")}
                  disabled={actionLoading || !!data.deletedAt}
                >
                  Soft Delete
                </Button>
              </div>

              {tempPassword && (
                <div className="bg-amber-50 border border-amber-200 rounded p-3">
                  <p className="text-sm font-medium text-amber-800">Temporary Password Generated</p>
                  <p className="mt-1 font-mono text-sm text-amber-900 select-all">
                    {tempPassword}
                  </p>
                  <p className="mt-1 text-xs text-amber-600">
                    Copy this password now. It will not be shown again.
                  </p>
                </div>
              )}
            </div>
          )}

          {isEditing && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
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
                  <Label htmlFor="user_type">User Type</Label>
                  <select
                    id="user_type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editForm.user_type}
                    onChange={(e) => setEditForm({ ...editForm, user_type: e.target.value })}
                  >
                    <option value="client">Client</option>
                    <option value="vendor">Vendor</option>
                    <option value="planner">Planner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Admin Notes</CardTitle>
            {!isEditingNotes && (
              <Button variant="outline" size="sm" onClick={startEditingNotes}>
                {data.adminNotes ? "Edit Notes" : "Add Notes"}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!isEditingNotes && (
              <p className="text-sm text-slate-600 whitespace-pre-wrap">
                {data.adminNotes || "No admin notes yet."}
              </p>
            )}
            {isEditingNotes && (
              <div className="space-y-3">
                <Textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  rows={4}
                  placeholder="Internal notes about this user..."
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveNotes} disabled={actionLoading}>
                    Save Notes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingNotes(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
};

export default AdminUserDetail;
