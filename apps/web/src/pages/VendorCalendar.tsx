import { useCallback, useEffect, useMemo, useState } from "react";
import useApproval from "@/hooks/useApproval";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Clock, Loader2, MapPin, Plus, Trash2, User } from "lucide-react";

import MonthCalendar from "@/components/calendar/MonthCalendar";
import NextEventCard from "@/components/calendar/NextEventCard";
import CalendarSyncCard from "@/components/calendar/CalendarSyncCard";
import AddWorkspaceEventDialog from "@/components/calendar/AddWorkspaceEventDialog";
import { useCalendar } from "@/hooks/useCalendar";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import {
  vendorService, VendorBooking, VendorBookingKind, VendorBookingStatus,
  BookableClient, VENDOR_BOOKING_KINDS,
} from "@/services/api/vendorService";

const STATUSES: Array<{ value: VendorBookingStatus; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const statusStyles: Record<VendorBookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-gray-100 text-gray-600",
};

/** Sentinel for "not one of my roster couples". */
const OFF_PLATFORM = "other";

const emptyForm = {
  eventId: OFF_PLATFORM,
  clientName: "",
  title: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  location: "",
  bookingKind: "booking" as VendorBookingKind,
  eventType: "Wedding",
  status: "pending" as VendorBookingStatus,
  totalAmount: "",
  notes: "",
};

const toDateOnly = (value: string) => String(value).split("T")[0];

const VendorCalendar = () => {
  const {
    entries, nextEvent, feedUrl, webcalUrl, isLoading, error,
    refresh, month, setMonth, applyFeedUrls,
  } = useCalendar();

  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [clients, setClients] = useState<BookableClient[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<VendorBooking | null>(null);
  const [addingOn, setAddingOn] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { blocked } = useApproval();
  const loadBookings = useCallback(async () => {
    try {
      const [b, c] = await Promise.all([
        vendorService.listVendorBookings(),
        vendorService.getBookableClients().catch(() => [] as BookableClient[]),
      ]);
      setBookings(b);
      setClients(c);
    } catch {
      // The calendar itself still renders from the /calendar payload.
    }
  }, []);

  // Bookings back the edit dialog; the calendar payload backs the grid.
  useEffect(() => { void loadBookings(); }, [loadBookings]);
  useAutoRefresh(loadBookings, { intervalMs: 60_000 });

  const bookingsById = useMemo(
    () => new Map(bookings.map((b) => [b.id, b])),
    [bookings],
  );

  const dayBookings = useMemo(() => {
    if (!selectedDate) return [];
    return bookings
      .filter((b) => toDateOnly(b.event_date) === selectedDate)
      .sort((a, b) => (a.start_time || "99:99").localeCompare(b.start_time || "99:99"));
  }, [bookings, selectedDate]);

  const openCreate = (date?: string) => {
    setEditingId(null);
    setForm({ ...emptyForm, eventDate: date || selectedDate || "" });
    setIsDialogOpen(true);
  };

  const openEdit = (booking: VendorBooking) => {
    setEditingId(booking.id);
    // Map the stored client_id back to the roster entry it came from.
    const linked = booking.client_id
      ? clients.find((c) => c.client_user_id === booking.client_id)
      : undefined;
    setForm({
      eventId: linked?.event_id ?? OFF_PLATFORM,
      clientName: booking.client_name,
      title: booking.title || "",
      eventDate: toDateOnly(booking.event_date),
      startTime: booking.start_time?.slice(0, 5) || "",
      endTime: booking.end_time?.slice(0, 5) || "",
      location: booking.location || "",
      bookingKind: booking.booking_kind,
      eventType: booking.event_type || "Wedding",
      status: booking.status,
      totalAmount: booking.total_amount != null ? String(booking.total_amount) : "",
      notes: booking.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.eventDate) {
      toast.error("A date is required");
      return;
    }
    // A roster couple supplies its own name; a free-text client must be typed.
    if (form.eventId === OFF_PLATFORM && !form.clientName.trim()) {
      toast.error("Client name is required");
      return;
    }

    setIsSaving(true);
    try {
      const linked = form.eventId !== OFF_PLATFORM;
      const payload = {
        // Linking makes the booking visible to the couple and their planner;
        // null explicitly unlinks it again.
        eventId: linked ? form.eventId : null,
        clientName: form.clientName.trim() || undefined,
        title: form.title.trim() || null,
        eventDate: form.eventDate,
        startTime: form.startTime || null,
        endTime: form.endTime || null,
        location: form.location.trim() || null,
        bookingKind: form.bookingKind,
        eventType: form.eventType,
        status: form.status,
        totalAmount: form.totalAmount || undefined,
        notes: form.notes.trim() || undefined,
      };

      if (editingId) await vendorService.updateVendorBooking(editingId, payload);
      else await vendorService.createVendorBooking(payload);

      toast.success(editingId ? "Event updated" : "Event added");
      setIsDialogOpen(false);
      setEditingId(null);
      // Refresh both sources so the grid and the list agree.
      await Promise.all([loadBookings(), refresh()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save event");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await vendorService.deleteVendorBooking(deleting.id);
      toast.success("Event removed");
      setDeleting(null);
      await Promise.all([loadBookings(), refresh()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove event");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-serif">Calendar</h1>
            <p className="text-muted-foreground">
              Your bookings, meetings and site visits in one place
            </p>
          </div>
          <Button disabled={blocked} onClick={() => openCreate()}>
            <Plus className="mr-2 h-4 w-4" />
            Add event
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* The grid fills the wide column, so there is no dead space */}
          <Card className="lg:col-span-2">
            <CardContent className="p-4 sm:p-5">
              {isLoading ? (
                <div className="flex h-[520px] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <MonthCalendar
                  month={month}
                  onMonthChange={setMonth}
                  entries={entries}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  onSelectEntry={(entry) => {
                    setSelectedDate(entry.date);
                    // Only vendor bookings are editable from here.
                    const id = entry.id.replace(/^vendor-booking-/, "");
                    const booking = bookingsById.get(id);
                    if (booking) openEdit(booking);
                  }}
                />
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <NextEventCard entry={nextEvent} isLoading={isLoading} />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {selectedDate
                    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-GB", {
                        weekday: "long", day: "numeric", month: "long",
                      })
                    : "Select a day"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!selectedDate ? (
                  <p className="text-sm text-muted-foreground">
                    Pick a date on the calendar to see and add events.
                  </p>
                ) : dayBookings.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Nothing booked this day.</p>
                    <Button disabled={blocked} size="sm" variant="outline" onClick={() => openCreate(selectedDate)}>
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Add event
                    </Button>
                    <Button disabled={blocked} size="sm" variant="ghost" onClick={() => setAddingOn(selectedDate)}>
                      Add shared event &amp; tag people
                    </Button>
                  </div>
                ) : (
                  <>
                    {dayBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="rounded-lg border p-3 transition-colors hover:bg-muted/40"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            className="min-w-0 flex-1 text-left"
                            onClick={() => openEdit(booking)}
                          >
                            <p className="truncate font-medium">
                              {booking.title || booking.client_name}
                            </p>
                            <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                              <p className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                {booking.start_time
                                  ? booking.start_time.slice(0, 5) +
                                    (booking.end_time ? ` – ${booking.end_time.slice(0, 5)}` : "")
                                  : "All day"}
                              </p>
                              <p className="flex items-center gap-1.5">
                                <User className="h-3 w-3" />
                                <span className="truncate">{booking.client_name}</span>
                              </p>
                              {booking.location && (
                                <p className="flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{booking.location}</span>
                                </p>
                              )}
                            </div>
                          </button>
                          <div className="flex flex-col items-end gap-1.5">
                            <Badge variant="secondary" className={statusStyles[booking.status]}>
                              {booking.status}
                            </Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 sm:h-7 sm:w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleting(booking)}
                              aria-label="Delete event"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button disabled={blocked} size="sm" variant="outline" className="w-full" onClick={() => openCreate(selectedDate)}>
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Add another
                    </Button>
                    <Button disabled={blocked} size="sm" variant="ghost" className="w-full" onClick={() => setAddingOn(selectedDate)}>
                      Add shared event &amp; tag people
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <CalendarSyncCard
              feedUrl={feedUrl}
              webcalUrl={webcalUrl}
              onRotated={applyFeedUrls}
            />
          </div>
        </div>
      </main>

      <AddWorkspaceEventDialog
        open={!!addingOn}
        onOpenChange={(o) => !o && setAddingOn(null)}
        date={addingOn}
        onCreated={() => { void refresh(); void loadBookings(); }}
      />

      {/* Create / edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit event" : "Add event"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Venue walkthrough"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Client</Label>
              <Select
                value={form.eventId}
                onValueChange={(v) => setForm((p) => ({
                  ...p,
                  eventId: v,
                  // Adopt the couple's name so the field isn't left stale.
                  clientName: v === OFF_PLATFORM
                    ? ""
                    : clients.find((c) => c.event_id === v)?.client_name ?? p.clientName,
                }))}
              >
                <SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.event_id} value={c.event_id}>
                      {c.client_name}{c.event_date ? ` · ${c.event_date}` : ""}
                    </SelectItem>
                  ))}
                  <SelectItem value={OFF_PLATFORM}>Someone else (not on àjọyọ)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {form.eventId === OFF_PLATFORM
                  ? clients.length === 0
                    ? "No couples have added you to their vendor roster yet, so this stays private to you."
                    : "This stays on your calendar only."
                  : "Shared with the couple and their planner."}
              </p>
            </div>

            {form.eventId === OFF_PLATFORM && (
              <div className="space-y-2 sm:col-span-2">
                <Label>Client name</Label>
                <Input
                  value={form.clientName}
                  onChange={(e) => setForm((p) => ({ ...p, clientName: e.target.value }))}
                  placeholder="Ada & Femi"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.bookingKind}
                onValueChange={(v) => setForm((p) => ({ ...p, bookingKind: v as VendorBookingKind }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VENDOR_BOOKING_KINDS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.eventDate}
                onChange={(e) => setForm((p) => ({ ...p, eventDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((p) => ({ ...p, status: v as VendorBookingStatus }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start time</Label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>End time</Label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="Venue or address"
              />
            </div>

            <div className="space-y-2">
              <Label>Amount (₦)</Label>
              <Input
                type="number"
                value={form.totalAmount}
                onChange={(e) => setForm((p) => ({ ...p, totalAmount: e.target.value }))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Anything worth remembering…"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={blocked || isSaving}>
              {isSaving ? "Saving…" : editingId ? "Update event" : "Create event"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.title || deleting?.client_name}" will be removed from your
              calendar. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendorCalendar;
