import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useGuests } from "@/hooks/useGuests";
import RsvpSettingsCard from "@/components/invitations/RsvpSettingsCard";
import InvitationCardDesigner from "@/components/invitations/InvitationCardDesigner";
import { Guest } from "@/services/api/userService";
import {
  Copy,
  Link as LinkIcon,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  UserPlus,
  Users,
} from "lucide-react";

/**
 * Row actions for a guest.
 *
 * The trigger existed on both the card and the table row but was wired to
 * nothing, so there was no way to correct an RSVP or remove a guest anywhere
 * in the UI even though the API supported both.
 */
const GuestActionsMenu = ({
  guest,
  onStatusChange,
  onDelete,
}: {
  guest: Guest;
  onStatusChange: (guest: Guest, status: Guest["status"]) => void;
  onDelete: (guest: Guest) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-8 sm:w-8">
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Actions for {guest.name}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {(["confirmed", "pending", "declined"] as const)
        .filter(status => status !== guest.status)
        .map(status => (
          <DropdownMenuItem key={status} onClick={() => onStatusChange(guest, status)}>
            Mark as {status}
          </DropdownMenuItem>
        ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem className="text-destructive" onClick={() => onDelete(guest)}>
        Remove guest
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// Mobile Guest Card Component
const GuestCard = ({
  guest,
  onGenerateLink,
  onStatusChange,
  onDelete,
}: {
  guest: Guest;
  onGenerateLink: (guest: Guest) => void;
  onStatusChange: (guest: Guest, status: Guest["status"]) => void;
  onDelete: (guest: Guest) => void;
}) => (
  <div className="p-4 border-b last:border-b-0">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate">{guest.name}</span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${
              guest.status === "confirmed"
                ? "bg-green-100 text-green-800"
                : guest.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {guest.status.charAt(0).toUpperCase() + guest.status.slice(1)}
          </span>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          {guest.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span className="truncate">{guest.email}</span>
            </div>
          )}
          {guest.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{guest.phone}</span>
            </div>
          )}
          {guest.guest_group && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{guest.guest_group}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 sm:h-8 sm:w-8"
          onClick={() => onGenerateLink(guest)}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <GuestActionsMenu guest={guest} onStatusChange={onStatusChange} onDelete={onDelete} />
      </div>
    </div>
  </div>
);

// Desktop Table Row Component
const GuestTableRow = ({
  guest,
  onGenerateLink,
  onStatusChange,
  onDelete,
}: {
  guest: Guest;
  onGenerateLink: (guest: Guest) => void;
  onStatusChange: (guest: Guest, status: Guest["status"]) => void;
  onDelete: (guest: Guest) => void;
}) => (
  <div className="grid grid-cols-12 p-4 items-center text-sm">
    <div className="col-span-3">
      <div className="font-medium">{guest.name}</div>
    </div>
    <div className="col-span-3">
      <div className="text-xs mb-1">{guest.email || "No email"}</div>
      {guest.phone && (
        <div className="text-xs flex items-center text-muted-foreground">
          <Phone className="h-3 w-3 mr-1" />
          {guest.phone}
        </div>
      )}
    </div>
    <div className="col-span-2">{guest.guest_group}</div>
    <div className="col-span-2">
      <div
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          guest.status === "confirmed"
            ? "bg-green-100 text-green-800"
            : guest.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
        }`}
      >
        {guest.status.charAt(0).toUpperCase() + guest.status.slice(1)}
      </div>
    </div>
    <div className="col-span-2 text-right">
      <Button
        variant="outline"
        size="icon"
        className="mr-1"
        onClick={() => onGenerateLink(guest)}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <GuestActionsMenu guest={guest} onStatusChange={onStatusChange} onDelete={onDelete} />
    </div>
  </div>
);

const Dashboard = () => {
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [guestInviteLink, setGuestInviteLink] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [newGuestGroup, setNewGuestGroup] = useState("Family");
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const { guests, stats, createGuest, updateGuest, deleteGuest } = useGuests();

  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);

  const handleGuestStatusChange = (guest: Guest, status: Guest["status"]) => {
    void updateGuest(guest.id, { status });
  };

  const addGuest = async () => {
    if (newGuestName && newGuestEmail) {
      setIsAddingGuest(true);
      try {
        await createGuest({
          name: newGuestName,
          email: newGuestEmail,
          phone: newGuestPhone || undefined,
          group: newGuestGroup,
          status: "pending",
        });
        setNewGuestName("");
        setNewGuestEmail("");
        setNewGuestPhone("");
      } finally {
        setIsAddingGuest(false);
      }
    }
  };

  const generateGuestInviteLink = (guest: Guest) => {
    setSelectedGuest(guest);
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/invitation?name=${encodeURIComponent(guest.name)}${guest.email ? `&email=${encodeURIComponent(guest.email)}` : ""}`;
    setGuestInviteLink(link);
    setLinkDialogOpen(true);
  };

  const copyGuestInviteLink = () => {
    navigator.clipboard.writeText(guestInviteLink);
    toast.success("Guest invitation link copied to clipboard!");
  };

  const filteredGuests = guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guest.email &&
        guest.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (guest.phone && guest.phone.includes(searchQuery)) ||
      (guest.guest_group &&
        guest.guest_group.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const confirmedGuests = filteredGuests.filter(g => g.status === "confirmed");
  const pendingGuests = filteredGuests.filter(g => g.status === "pending");
  const declinedGuests = filteredGuests.filter(g => g.status === "declined");

  const confirmedCount = stats.confirmed;
  const pendingCount = stats.pending;
  const declinedCount = stats.declined;

  const renderGuestList = (guestList: Guest[], emptyMessage: string) => (
    <>
      {/* Mobile View - Cards */}
      <div className="md:hidden rounded-md border">
        {guestList.length > 0 ? (
          guestList.map((guest) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              onGenerateLink={generateGuestInviteLink}
              onStatusChange={handleGuestStatusChange}
              onDelete={setGuestToDelete}
            />
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block rounded-md border">
        <div className="grid grid-cols-12 p-4 text-sm font-medium text-muted-foreground bg-muted/50">
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Contact</div>
          <div className="col-span-2">Group</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <div className="divide-y">
          {guestList.length > 0 ? (
            guestList.map((guest) => (
              <GuestTableRow
                key={guest.id}
                guest={guest}
                onGenerateLink={generateGuestInviteLink}
                onStatusChange={handleGuestStatusChange}
                onDelete={setGuestToDelete}
              />
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              {emptyMessage}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-16">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-serif mb-1">Invitations & RSVP</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage your guest list and track RSVPs.
            </p>
          </div>

          {/* One page, three jobs: design the invitation, set how RSVPs work,
              and work the guest list. */}
          <Tabs defaultValue="card" className="w-full">
            <TabsList className="flex w-full justify-start overflow-x-auto no-scrollbar mb-6 h-auto p-1 gap-1 bg-muted/60 rounded-lg sm:grid sm:grid-cols-3 sm:max-w-md sm:h-10">
              <TabsTrigger value="card"   className="shrink-0 whitespace-nowrap rounded-md px-3 text-xs sm:text-sm sm:px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Design</TabsTrigger>
              <TabsTrigger value="rsvp"   className="shrink-0 whitespace-nowrap rounded-md px-3 text-xs sm:text-sm sm:px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Send &amp; replies</TabsTrigger>
              <TabsTrigger value="guests" className="shrink-0 whitespace-nowrap rounded-md px-3 text-xs sm:text-sm sm:px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Guests{stats.total ? ` (${stats.total})` : ""}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="card">
              <InvitationCardDesigner />
            </TabsContent>

            <TabsContent value="rsvp">
              <RsvpSettingsCard />
            </TabsContent>

            <TabsContent value="guests" className="space-y-6">
          {/* Stats Cards - Mobile */}
          <div className="grid grid-cols-3 gap-2 md:hidden">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-green-700">{confirmedCount}</div>
              <div className="text-xs text-green-600">Confirmed</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-yellow-700">{pendingCount}</div>
              <div className="text-xs text-yellow-600">Pending</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-red-700">{declinedCount}</div>
              <div className="text-xs text-red-600">Declined</div>
            </div>
          </div>

          {/* Search and Add Guest */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search guests..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2 shrink-0">
                  <UserPlus className="h-4 w-4" />
                  <span className="sm:inline">Add Guest</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Guest</DialogTitle>
                  <DialogDescription>
                    Add guest details to send them an invitation link.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Guest Name
                    </label>
                    <Input
                      id="name"
                      value={newGuestName}
                      onChange={(e) => setNewGuestName(e.target.value)}
                      placeholder="Full Name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={newGuestEmail}
                      onChange={(e) => setNewGuestEmail(e.target.value)}
                      placeholder="Email"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newGuestPhone}
                      onChange={(e) => setNewGuestPhone(e.target.value)}
                      placeholder="Phone Number"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="group" className="text-sm font-medium">
                      Group
                    </label>
                    <select
                      id="group"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newGuestGroup}
                      onChange={(e) => setNewGuestGroup(e.target.value)}
                    >
                      <option value="Family">Family</option>
                      <option value="Friends">Friends</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <Button
                    onClick={addGuest}
                    className="w-full mt-2"
                    disabled={isAddingGuest}
                  >
                    {isAddingGuest ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {isAddingGuest ? "Adding..." : "Save Guest"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Guest List Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Guest List</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid grid-cols-4 w-full mb-4 h-9 p-1 bg-muted/60 rounded-lg">
                  <TabsTrigger
                    value="all"
                    className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="confirmed"
                    className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <span className="hidden sm:inline">Confirmed</span>
                    <span className="sm:hidden">Yes</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <span className="hidden sm:inline">Pending</span>
                    <span className="sm:hidden">Wait</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="declined"
                    className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <span className="hidden sm:inline">Declined</span>
                    <span className="sm:hidden">No</span>
                  </TabsTrigger>
                </TabsList>

                <div>
                  <TabsContent value="all" className="mt-0">
                    {renderGuestList(filteredGuests, "No guests found. Add your first guest!")}
                  </TabsContent>

                  <TabsContent value="confirmed" className="mt-0">
                    {renderGuestList(confirmedGuests, "No confirmed guests yet")}
                  </TabsContent>

                  <TabsContent value="pending" className="mt-0">
                    {renderGuestList(pendingGuests, "No pending guests")}
                  </TabsContent>

                  <TabsContent value="declined" className="mt-0">
                    {renderGuestList(declinedGuests, "No declined guests")}
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <AlertDialog open={!!guestToDelete} onOpenChange={(open) => !open && setGuestToDelete(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {guestToDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes them from your guest list along with their RSVP. You can add
              them again, but their reply will not come back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (guestToDelete) void deleteGuest(guestToDelete.id);
                setGuestToDelete(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invitation Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invitation Link for {selectedGuest?.name}</DialogTitle>
            <DialogDescription>
              Share this unique link with your guest to let them RSVP directly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <Input
                value={guestInviteLink}
                readOnly
                className="font-mono text-xs"
              />
              <Button variant="outline" size="icon" onClick={copyGuestInviteLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              When your guest opens this link, they'll be able to confirm or
              decline your invitation.
            </p>
            <Button onClick={copyGuestInviteLink} className="w-full">
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
