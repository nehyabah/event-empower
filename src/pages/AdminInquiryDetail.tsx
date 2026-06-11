import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAdminInquiry, updateAdminInquiry } from "@/services/api/adminService";

const AdminInquiryDetail = () => {
  const { id } = useParams();
  const [status, setStatus] = useState("new");
  const [notes, setNotes] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "inquiry", id],
    queryFn: async () => {
      const detail = await getAdminInquiry(id || "");
      setStatus(detail.inquiry.status || "new");
      setNotes(detail.inquiry.notes || "");
      return detail;
    },
    enabled: !!id,
  });

  const handleSave = async () => {
    if (!id) return;
    setActionError(null);
    setActionLoading(true);
    try {
      await updateAdminInquiry(id, { status, notes });
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout title="Inquiry Detail">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Link to="/admin/inquiries" className="font-medium hover:text-slate-900">
          Inquiries
        </Link>
        <span>/</span>
        <span>{data?.vendor?.business_name || "Inquiry"}</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inquiry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <p className="text-sm text-slate-600">Loading inquiry...</p>}
          {error && <p className="text-sm text-red-600">Failed to load inquiry.</p>}
          {actionError && <p className="text-sm text-red-600">{actionError}</p>}
          {!isLoading && !error && data && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Vendor
                  </p>
                  <p className="text-sm text-slate-900">
                    {data.vendor?.business_name || "Unknown vendor"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Sender
                  </p>
                  <p className="text-sm text-slate-900">{data.inquiry.sender_name}</p>
                  <p className="text-xs text-slate-500">{data.inquiry.sender_email || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Event Date
                  </p>
                  <p className="text-sm text-slate-900">
                    {data.inquiry.event_date
                      ? new Date(data.inquiry.event_date).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created
                  </p>
                  <p className="text-sm text-slate-900">
                    {new Date(data.inquiry.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                {data.inquiry.message}
              </div>

              <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </p>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Notes
                  </p>
                  <Textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Add internal notes"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button onClick={handleSave} disabled={actionLoading}>
                  Save changes
                </Button>
                <span className="text-xs text-slate-500">
                  {data.messages.length} messages in thread
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminInquiryDetail;
