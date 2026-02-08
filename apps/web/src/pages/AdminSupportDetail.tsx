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
import {
  addAdminTicketMessage,
  getAdminTicket,
  updateAdminTicket,
} from "@/services/api/adminService";

const AdminSupportDetail = () => {
  const { id } = useParams();
  const [status, setStatus] = useState("open");
  const [priority, setPriority] = useState("medium");
  const [message, setMessage] = useState("");
  const [internal, setInternal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "support", id],
    queryFn: async () => {
      const detail = await getAdminTicket(id || "");
      setStatus(detail.ticket.status || "open");
      setPriority(detail.ticket.priority || "medium");
      return detail;
    },
    enabled: !!id,
  });

  const handleSave = async () => {
    if (!id) return;
    setActionError(null);
    setActionLoading(true);
    try {
      await updateAdminTicket(id, { status, priority });
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSend = async () => {
    if (!id || !message.trim()) return;
    setActionError(null);
    setActionLoading(true);
    try {
      await addAdminTicketMessage(id, { message, isInternal: internal });
      setMessage("");
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Message failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout title="Support Ticket">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Link to="/admin/support" className="font-medium hover:text-slate-900">
          Support
        </Link>
        <span>/</span>
        <span>{data?.ticket.subject || "Ticket"}</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ticket Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <p className="text-sm text-slate-600">Loading ticket...</p>}
          {error && <p className="text-sm text-red-600">Failed to load ticket.</p>}
          {actionError && <p className="text-sm text-red-600">{actionError}</p>}
          {!isLoading && !error && data && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ticket Number
                  </p>
                  <p className="text-sm font-mono text-slate-900">
                    SUP-{String(data.ticket.ticket_number).padStart(6, "0")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Subject
                  </p>
                  <p className="text-sm text-slate-900">{data.ticket.subject}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Category
                  </p>
                  <p className="text-sm text-slate-900">{data.ticket.category || "-"}</p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                {data.ticket.description || "No description."}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </p>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Priority
                  </p>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handleSave} disabled={actionLoading}>
                  Save changes
                </Button>
                <label className="flex items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={internal}
                    onChange={(event) => setInternal(event.target.checked)}
                  />
                  Internal note
                </label>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Add Message
                </p>
                <Textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Reply to ticket..."
                  rows={4}
                />
                <Button onClick={handleSend} disabled={actionLoading || !message.trim()}>
                  Send message
                </Button>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Conversation
                </p>
                {data.messages.length === 0 && (
                  <p className="text-sm text-slate-500">No messages yet.</p>
                )}
                {data.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700"
                  >
                    <div className="text-xs text-slate-500">
                      {msg.is_internal ? "Internal" : "Public"} •{" "}
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                    <div className="mt-2">{msg.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminSupportDetail;
