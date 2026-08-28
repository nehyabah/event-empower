import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Instagram, ExternalLink, Loader2 } from "lucide-react";
import { getAdminPlanner, approveAdminUser, rejectAdminUser } from "@/services/api/adminService";
import { ReviewField, CompletenessSummary } from "@/components/admin/ReviewField";
import ReviewNotes from "@/components/admin/ReviewNotes";

/**
 * Full review page for a planner applicant.
 *
 * Before this existed, an admin deciding whether to approve a planner had
 * nothing but a name, an email and a phone number from the pending-approvals
 * card - none of the bio, experience, specializations or portfolio the
 * planner actually submitted. This is the whole profile.
 */

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </span>
    <span className="text-sm text-slate-900">{value}</span>
  </div>
);

const AdminPlannerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "planner", id],
    queryFn: () => getAdminPlanner(id || ""),
    enabled: !!id,
  });

  const handleApprove = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await approveAdminUser(id);
      toast.success(`${data?.user.name || "Planner"} approved`);
      navigate("/admin/approvals");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await rejectAdminUser(id, rejectReason);
      toast.success(`${data?.user.name || "Planner"} rejected`);
      setRejecting(false);
      navigate("/admin/approvals");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  const igUrl = (handle: string) => `https://instagram.com/${handle.replace(/^@/, "")}`;

  const isPending = data?.user.approval_status === "pending";

  return (
    <AdminLayout title="Planner Profile">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Link to="/admin/approvals" className="font-medium hover:text-slate-900">
          Approvals
        </Link>
        <span>/</span>
        <span>{data?.user.name || data?.user.business_name || "Profile"}</span>
      </div>

      {isLoading && <p className="text-sm text-slate-600">Loading planner...</p>}
      {error && <p className="text-sm text-red-600">Failed to load planner.</p>}

      {data && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Application</CardTitle>
              <Badge variant={isPending ? "outline" : "secondary"}>
                {data.user.approval_status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              {!data.profile && (
                <p className="text-sm bg-amber-50 border border-amber-200 rounded px-3 py-2 text-amber-900">
                  This account has not saved a profile yet - the fields below are
                  everything they have entered so far.
                </p>
              )}

              <CompletenessSummary
                fields={[
                  { label: "Name", value: data.user.name, required: true },
                  { label: "Email", value: data.user.email, required: true },
                  { label: "Phone", value: data.profile?.phone || data.user.phone, required: true },
                  { label: "Location", value: data.profile?.location || data.user.city, required: true },
                  { label: "Bio", value: data.profile?.bio, required: true },
                  { label: "Tagline", value: data.profile?.tagline },
                  { label: "Years of experience", value: data.profile?.years_of_experience },
                  { label: "Specializations", value: data.profile?.specializations },
                  { label: "Website", value: data.profile?.website },
                  { label: "Instagram", value: data.profile?.instagram || data.user.instagram_handle },
                  { label: "Profile photo", value: data.profile?.profile_image_url },
                ]}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <ReviewField label="Name" value={data.user.name} required />
                <ReviewField label="Email" value={data.user.email} required />
                <ReviewField label="Phone" value={data.profile?.phone || data.user.phone} required />
                <ReviewField
                  label="Location"
                  value={data.profile?.location || data.user.city}
                  required
                />
                <ReviewField label="Tagline" value={data.profile?.tagline} />
                <ReviewField
                  label="Years of experience"
                  value={
                    data.profile?.years_of_experience != null
                      ? `${data.profile.years_of_experience} years`
                      : null
                  }
                />
                <ReviewField
                  label="Website"
                  value={data.profile?.website}
                  href={data.profile?.website || undefined}
                />
                <ReviewField
                  label="Instagram"
                  value={data.profile?.instagram || data.user.instagram_handle}
                  href={
                    data.profile?.instagram || data.user.instagram_handle
                      ? igUrl(data.profile?.instagram || data.user.instagram_handle || "")
                      : undefined
                  }
                />
                <ReviewField label="WhatsApp" value={data.user.whatsapp_phone} />
                <ReviewField
                  label="Signed up"
                  value={new Date(data.user.created_at).toLocaleDateString("en-NG", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                />
                <ReviewField
                  label="Submitted for review"
                  value={
                    data.user.onboarding_submitted_at
                      ? new Date(data.user.onboarding_submitted_at).toLocaleDateString("en-NG", {
                          day: "numeric", month: "short", year: "numeric",
                        })
                      : null
                  }
                />
                <ReviewField
                  label="Account type"
                  value={data.user.auth_provider === "google" ? "Google sign-in" : "Email + password"}
                />
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Bio <span className="ml-1 text-slate-400 normal-case font-normal">(required)</span>
                </span>
                {data.profile?.bio ? (
                  <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{data.profile.bio}</p>
                ) : (
                  <p className="mt-1 text-sm italic text-amber-700">Not provided</p>
                )}
              </div>

              {data.profile?.specializations && data.profile.specializations.length > 0 && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Specializations
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {data.profile.specializations.map((s) => (
                      <Badge key={s} variant="outline">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {data.profile?.bio && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Bio
                  </span>
                  <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                    {data.profile.bio}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {(data.profile?.instagram || data.user.instagram_handle) && (
                  <a
                    href={igUrl(data.profile?.instagram || data.user.instagram_handle || "")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Instagram className="h-4 w-4" />
                    {data.profile?.instagram || data.user.instagram_handle}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {data.profile?.website && (
                  <a
                    href={data.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    {data.profile.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {(data.profile?.profile_image_url || data.profile?.cover_image_url) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {data.profile.profile_image_url && (
                    <img
                      src={data.profile.profile_image_url}
                      alt="Profile"
                      className="aspect-square w-full rounded-lg object-cover border"
                    />
                  )}
                  {data.profile.cover_image_url && (
                    <img
                      src={data.profile.cover_image_url}
                      alt="Cover"
                      className="aspect-square w-full rounded-lg object-cover border"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <ReviewNotes userId={data.user.id} initialNotes={data.user.admin_notes} />

          {isPending && (
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
        </>
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

export default AdminPlannerDetail;
