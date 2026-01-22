import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import ProjectStats from "@/components/dashboard/ProjectStats";
import WeddingCountdown from "@/components/dashboard/WeddingCountdown";
// import SaveTheDateCard, { saveTheDateTemplates } from "@/components/dashboard/SaveTheDateCard";
import SaveTheDateCard, {
  saveTheDateTemplates,
} from "@/components/dashboard/SaveTheDateCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ListTodo,
  CreditCard,
  Users,
  Pencil,
  UserPlus,
  Search,
  MoreHorizontal,
  Link as LinkIcon,
  Copy,
  Phone,
  Loader2,
  Palette,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useGuests } from "@/hooks/useGuests";
import { useTodoLists } from "@/context/useTodoLists";
import { Guest } from "@/services/api/userService";
import userService from "@/services/api/userService";
import invitationService from "@/services/api/invitationService";

const UserHomepage = () => {
  const userEmail = localStorage.getItem("userEmail") || "user@example.com";
  const firstName = userEmail.split("@")[0].split(".")[0];
  const capitalizedName =
    firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const [weddingDate, setWeddingDate] = useState<Date | undefined>(() => {
    const saved = localStorage.getItem("weddingDate");
    if (!saved) return new Date("2024-12-31");
    const parsed = new Date(saved);
    return Number.isNaN(parsed.getTime()) ? new Date("2024-12-31") : parsed;
  });

  // Card customization state
  const [partner1Name, setPartner1Name] = useState(
    () => localStorage.getItem("partner1Name") || capitalizedName,
  );
  const [partner2Name, setPartner2Name] = useState(
    () => localStorage.getItem("partner2Name") || "Partner",
  );
  const [venue, setVenue] = useState(
    () => localStorage.getItem("venue") || "The Grand Estate",
  );

  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [guestInviteLink, setGuestInviteLink] = useState("");

  // Use the guests hook for real backend data
  const { guests, stats, isLoading: guestsLoading, createGuest } = useGuests();

  // Use the todo lists hook for task statistics
  const { todoLists } = useTodoLists();

  // Calculate task statistics from todo lists
  const taskStats = useMemo(() => {
    const allItems = todoLists.flatMap(list => list.items);
    return {
      total: allItems.length,
      completed: allItems.filter(item => item.completed).length,
    };
  }, [todoLists]);

  // Generate dynamic timeline based on wedding date
  const timelineItems = useMemo(() => {
    if (!weddingDate) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const wedding = new Date(weddingDate);
    wedding.setHours(0, 0, 0, 0);
    const diffTime = wedding.getTime() - today.getTime();
    const daysUntilWedding = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeksUntilWedding = Math.ceil(daysUntilWedding / 7);

    // Define timeline milestones (weeks before wedding)
    const milestones = [
      { weeks: 12, title: "Book Vendors", description: "Secure photographers, caterers, and musicians" },
      { weeks: 8, title: "Final Venue Visit", description: "Confirm all venue details and arrangements" },
      { weeks: 6, title: "Wedding Outfits", description: "Final fittings for wedding attire" },
      { weeks: 4, title: "Guest Confirmation", description: "Finalize guest count and seating arrangements" },
      { weeks: 2, title: "Wedding Rehearsal", description: "Practice ceremony with wedding party" },
      { weeks: 1, title: "Final Details", description: "Confirm all vendors and finalize timeline" },
      { weeks: 0, title: "Wedding Day", description: "Your special day has arrived!" },
    ];

    // Filter milestones that are still relevant (haven't passed yet) plus the next upcoming one
    return milestones.map((milestone, index) => {
      const milestoneDate = new Date(wedding);
      milestoneDate.setDate(milestoneDate.getDate() - (milestone.weeks * 7));

      // Determine if this milestone is "active" (current focus)
      // Active if: we're within this milestone's timeframe
      const nextMilestone = milestones[index + 1];
      const isActive = nextMilestone
        ? weeksUntilWedding <= milestone.weeks && weeksUntilWedding > nextMilestone.weeks
        : weeksUntilWedding <= milestone.weeks && weeksUntilWedding >= 0;

      // Determine if milestone is completed (date has passed)
      const isPast = milestoneDate < today;

      return {
        date: milestone.weeks === 0
          ? "Wedding Day"
          : milestone.weeks === 1
            ? "1 week before"
            : `${milestone.weeks} weeks before`,
        title: milestone.title,
        description: milestone.description,
        active: isActive && !isPast,
        completed: isPast,
      };
    }).filter(item => {
      // Show completed items, the active one, and upcoming ones
      // But only show the next 4-5 relevant items
      return true;
    }).slice(0, 5);
  }, [weddingDate]);

  const [searchQuery, setSearchQuery] = useState("");
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [newGuestGroup, setNewGuestGroup] = useState("Family");
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [plannerCode, setPlannerCode] = useState("");
  const [isLinkingPlanner, setIsLinkingPlanner] = useState(false);
  const [showPlannerLink, setShowPlannerLink] = useState(() => {
    return localStorage.getItem("hidePlannerLink") !== "true";
  });
  const [plannerName, setPlannerName] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    return localStorage.getItem("saveTheDateTemplate") || "garden-ivory";
  });
  const [showRsvpBack, setShowRsvpBack] = useState(false);

  const handleDateChange = (newDate: Date | undefined) => {
    setWeddingDate(newDate);
    if (newDate) {
      const isoDate = newDate.toISOString().split("T")[0];
      localStorage.setItem("weddingDate", isoDate);
    }
  };

  // Save card details when they change
  useEffect(() => {
    localStorage.setItem("partner1Name", partner1Name);
    localStorage.setItem("partner2Name", partner2Name);
    localStorage.setItem("venue", venue);
  }, [partner1Name, partner2Name, venue]);

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

  // Update the generate guest invite link function to produce a properly formatted URL
  const generateGuestInviteLink = (guest: Guest) => {
    setSelectedGuest(guest);
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/invitation?name=${encodeURIComponent(guest.name)}${guest.email ? `&email=${encodeURIComponent(guest.email)}` : ""}`;
    setGuestInviteLink(link);
  };

  const copyGuestInviteLink = () => {
    navigator.clipboard.writeText(guestInviteLink);
    toast.success("Guest invitation link copied to clipboard!");
  };

  useEffect(() => {
    let isMounted = true;
    const loadPlanner = async () => {
      try {
        const link = await userService.getPlannerLink();
        if (isMounted) {
          setPlannerName(link?.planner_name || null);
        }
      } catch {
        if (isMounted) {
          setPlannerName(null);
        }
      }
    };

    loadPlanner();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredGuests = guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guest.email &&
        guest.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (guest.phone && guest.phone.includes(searchQuery)) ||
      (guest.guest_group &&
        guest.guest_group.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const confirmedCount = stats.confirmed;
  const pendingCount = stats.pending;
  const declinedCount = stats.declined;
  const formattedWeddingDate = weddingDate
    ? weddingDate.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Date TBD";

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      <Navbar />
      <main className="flex-grow pt-20 md:pt-24 pb-16">
        <div className="container mx-auto px-4 space-y-8 md:space-y-10">
          <section className="text-center md:text-left">
            <h1 className="font-serif text-2xl md:text-4xl mb-2">
              Welcome back,{" "}
              <span className="text-primary">{capitalizedName}</span>!
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
              Continue planning your perfect wedding
              {plannerName ? ` with ${plannerName}` : ""}. Here's what needs
              your attention.
            </p>
          </section>

          {showPlannerLink && (
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle>Link your planner</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowPlannerLink(false);
                    localStorage.setItem("hidePlannerLink", "true");
                  }}
                >
                  X
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row gap-3 md:items-center">
                <Input
                  placeholder="Enter planner invite code"
                  value={plannerCode}
                  onChange={(e) => setPlannerCode(e.target.value)}
                />
                <Button
                  disabled={!plannerCode.trim() || isLinkingPlanner}
                  onClick={async () => {
                    if (!plannerCode.trim()) return;
                    setIsLinkingPlanner(true);
                    try {
                      await invitationService.acceptInvite(plannerCode.trim());
                      toast.success("Planner linked successfully");
                      setPlannerCode("");
                      const link = await userService.getPlannerLink();
                      setPlannerName(link?.planner_name || null);
                    } catch (err) {
                      toast.error(
                        err instanceof Error
                          ? err.message
                          : "Failed to link planner",
                      );
                    } finally {
                      setIsLinkingPlanner(false);
                    }
                  }}
                >
                  {isLinkingPlanner ? "Linking..." : "Link planner"}
                </Button>
              </CardContent>
            </Card>
          )}

          <WeddingCountdown
            date={weddingDate}
            onDateChange={handleDateChange}
          />

          <section className="py-4 md:py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-serif">Guest List</h2>
              <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="text-sm w-full md:w-auto gap-2 order-1 sm:order-2">
                      <UserPlus className="h-4 w-4" />
                      Add Guest
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
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
            </div>

            <Card className="mb-6 overflow-hidden border-none shadow-xl">
              <div className="grid lg:grid-cols-[400px_1fr] h-full">
                {/* Editor Sidebar */}
                <div className="bg-white p-6 border-r border-zinc-100 flex flex-col gap-6">
                  <div className="space-y-1">
                    <CardTitle className="font-serif">
                      Design your Card
                    </CardTitle>
                    <CardDescription>
                      Customize the details guests will see.
                    </CardDescription>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="p1"
                          className="text-xs font-bold uppercase text-zinc-400"
                        >
                          Partner 1
                        </Label>
                        <Input
                          id="p1"
                          value={partner1Name}
                          onChange={(e) => setPartner1Name(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="p2"
                          className="text-xs font-bold uppercase text-zinc-400"
                        >
                          Partner 2
                        </Label>
                        <Input
                          id="p2"
                          value={partner2Name}
                          onChange={(e) => setPartner2Name(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="venue"
                        className="text-xs font-bold uppercase text-zinc-400"
                      >
                        Venue
                      </Label>
                      <Input
                        id="venue"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 pt-2">
                      <Label className="text-xs font-bold uppercase text-zinc-400 mb-2 block">
                        Choose Template
                      </Label>
                      <div className="grid gap-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                        {saveTheDateTemplates.map((template) => (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => {
                              setSelectedTemplate(template.id);
                              localStorage.setItem(
                                "saveTheDateTemplate",
                                template.id,
                              );
                            }}
                            className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left text-sm transition-all ${
                              selectedTemplate === template.id
                                ? `border-zinc-900 ring-1 ring-zinc-900 bg-zinc-50`
                                : "border-zinc-100 bg-white hover:border-zinc-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full ${template.accentBg} flex items-center justify-center border ${template.border}`}
                              >
                                <Palette
                                  className={`w-4 h-4 ${template.accent}`}
                                />
                              </div>
                              <span className="font-medium text-zinc-700">
                                {template.name}
                              </span>
                            </div>
                            {selectedTemplate === template.id && (
                              <div className="w-2 h-2 rounded-full bg-zinc-900"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100">
                    <Button
                      className="w-full gap-2 bg-zinc-900 text-white hover:bg-zinc-800"
                      onClick={() => {
                        const link = `${window.location.origin}/invitation`;
                        navigator.clipboard.writeText(link);
                        toast.success("RSVP link copied!");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                      Copy Invitation Link
                    </Button>
                    <p className="text-xs text-center text-zinc-400 mt-3">
                      Swipe the card to preview RSVP form
                    </p>
                  </div>
                </div>

                {/* Preview Area */}
                <div className="bg-gradient-to-br from-zinc-100 to-zinc-200/80 p-6 md:p-10 flex items-center justify-center min-h-[580px]">
                  <div className="w-full max-w-sm h-[520px]">
                    <SaveTheDateCard
                      templateId={selectedTemplate}
                      names={{ partner1: partner1Name, partner2: partner2Name }}
                      date={formattedWeddingDate}
                      venue={venue}
                      isEditable={true}
                      isFlipped={showRsvpBack}
                      onFlip={() => setShowRsvpBack(!showRsvpBack)}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <CardTitle>Your Wedding Guests</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Manage and track your guest list
                    </p>
                  </div>
                  <div className="w-full md:w-auto">
                    <div className="relative w-full">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search guests..."
                        className="pl-8 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <div className="overflow-x-auto pb-2">
                    <TabsList className="w-full md:w-auto mb-4">
                      <TabsTrigger value="all">
                        All ({guests.length})
                      </TabsTrigger>
                      <TabsTrigger value="confirmed">
                        Confirmed ({confirmedCount})
                      </TabsTrigger>
                      <TabsTrigger value="pending">
                        Pending ({pendingCount})
                      </TabsTrigger>
                      <TabsTrigger value="declined">
                        Declined ({declinedCount})
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="all" className="mt-0">
                    <div className="rounded-md border overflow-x-auto">
                      <div className="grid grid-cols-12 p-4 text-sm font-medium text-muted-foreground bg-muted/50 min-w-[600px]">
                        <div className="col-span-3">Name</div>
                        <div className="col-span-3">Contact</div>
                        <div className="col-span-2">Group</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2 text-right">Actions</div>
                      </div>
                      <div className="divide-y min-w-[600px]">
                        {filteredGuests.length > 0 ? (
                          filteredGuests.map((guest) => (
                            <div
                              key={guest.id}
                              className="grid grid-cols-12 p-4 items-center text-sm"
                            >
                              <div className="col-span-3">
                                <div className="font-medium">{guest.name}</div>
                              </div>
                              <div className="col-span-3">
                                <div className="text-xs mb-1">
                                  {guest.email || "No email"}
                                </div>
                                {guest.phone && (
                                  <div className="text-xs flex items-center text-muted-foreground">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {guest.phone}
                                  </div>
                                )}
                              </div>
                              <div className="col-span-2">
                                {guest.guest_group}
                              </div>
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
                                  {guest.status.charAt(0).toUpperCase() +
                                    guest.status.slice(1)}
                                </div>
                              </div>
                              <div className="col-span-2 text-right">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="mr-1"
                                      onClick={() =>
                                        generateGuestInviteLink(guest)
                                      }
                                    >
                                      <LinkIcon className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>
                                        Invitation Link for{" "}
                                        {selectedGuest?.name}
                                      </DialogTitle>
                                      <DialogDescription>
                                        Share this unique link with your guest
                                        to let them RSVP directly.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="flex items-center gap-2">
                                        <Input
                                          value={guestInviteLink}
                                          readOnly
                                          className="font-mono text-xs text-ellipsis"
                                        />
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          onClick={copyGuestInviteLink}
                                        >
                                          <Copy className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        <p>
                                          When your guest opens this link,
                                          they'll be able to confirm or decline
                                          your invitation.
                                        </p>
                                      </div>
                                      <div className="flex justify-end">
                                        <Button
                                          variant="default"
                                          onClick={copyGuestInviteLink}
                                          className="w-full sm:w-auto"
                                        >
                                          Copy Link
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-muted-foreground">
                            No guests match your search
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  {/* ... other tabs content ... */}
                  <TabsContent value="confirmed" className="mt-0">
                    <div className="rounded-md border">
                      <div className="grid grid-cols-12 p-4 text-sm font-medium text-muted-foreground bg-muted/50">
                        <div className="col-span-3">Name</div>
                        <div className="col-span-3">Contact</div>
                        <div className="col-span-2">Group</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2 text-right">Actions</div>
                      </div>
                      {/* Simplified for brevity - reuse previous logic */}
                      <div className="p-8 text-center text-muted-foreground">
                        No confirmed guests
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="pending" className="mt-0">
                    <div className="rounded-md border">
                      <div className="p-8 text-center text-muted-foreground">
                        No pending guests
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="declined" className="mt-0">
                    <div className="rounded-md border">
                      <div className="p-8 text-center text-muted-foreground">
                        No declined guests
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>

          <section className="py-4 md:py-6">
            <h2 className="text-xl md:text-2xl font-serif mb-4 md:mb-6">
              Wedding Planning Progress
            </h2>
            <ProjectStats
              totalTasks={taskStats.total}
              completedTasks={taskStats.completed}
              totalGuests={stats.total}
              confirmedGuests={stats.confirmed}
              weddingDate={weddingDate}
            />
          </section>

          <section className="py-4 md:py-6">
            <h2 className="text-xl md:text-2xl font-serif mb-4 md:mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickActionCard
                title="To-Do Lists"
                description="Track your planning tasks"
                icon={ListTodo}
                to="/todo-lists"
              />
              <QuickActionCard
                title="Expense Tracker"
                description="Manage your wedding budget"
                icon={CreditCard}
                to="/expense-tracker"
              />
              <QuickActionCard
                title="Find Vendors"
                description="Discover local services"
                icon={Users}
                to="/vendors"
              />
              <QuickActionCard
                title="Edit Story"
                description="Update your love story"
                icon={Pencil}
                to="/couple-story"
              />
            </div>
          </section>

          <section className="py-6 md:py-8">
            <h2 className="text-xl md:text-2xl font-serif mb-4 md:mb-8">
              Your Wedding Timeline
            </h2>
            {timelineItems.length > 0 ? (
              <div
                className="relative pl-8 md:pl-12 space-y-8 md:space-y-10 max-w-3xl before:absolute before:left-3 md:before:left-4 before:top-3 before:bottom-10 before:w-[2px]
                before:bg-gradient-to-b before:from-primary/10 before:via-primary/50 before:to-primary/20"
              >
                {timelineItems.map((item, index) => (
                  <TimelineItem
                    key={index}
                    date={item.date}
                    title={item.title}
                    description={item.description}
                    active={item.active}
                    completed={item.completed}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Set your wedding date to see your personalized timeline</p>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  to: string;
}

const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  to,
}: QuickActionCardProps) => (
  <Link to={to} className="block h-full">
    <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden group">
      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:bg-primary/10 transition-all" />
      <CardContent className="p-6 relative">
        <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-medium text-lg mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </Link>
);

interface TimelineItemProps {
  date: string;
  title: string;
  description: string;
  active?: boolean;
  completed?: boolean;
}

const TimelineItem = ({
  date,
  title,
  description,
  active = false,
  completed = false,
}: TimelineItemProps) => (
  <div className={`relative transition-all duration-300 hover:translate-x-1 group ${completed ? "opacity-60" : ""}`}>
    <div
      className={`absolute w-8 h-8 rounded-full -left-[21px] top-0 flex items-center justify-center
      ${
        completed
          ? "bg-green-500 text-white"
          : active
            ? "bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20"
            : "bg-white border-2 border-primary/30"
      } transition-all duration-300 group-hover:scale-110`}
    >
      {completed ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : active ? (
        <div className="w-2 h-2 rounded-full bg-white animate-pulse-soft"></div>
      ) : null}
    </div>
    <div className="pl-6">
      <div
        className={`${completed ? "text-green-600 line-through" : active ? "text-primary font-medium" : "text-muted-foreground"} text-sm mb-2 transition-colors group-hover:text-primary/80`}
      >
        {date}
      </div>
      <h3
        className={`font-medium text-lg mb-2 transition-colors ${completed ? "text-muted-foreground line-through" : active ? "text-primary" : ""} group-hover:text-primary/90`}
      >
        {title}
      </h3>
      <p className={`text-sm mb-3 ${completed ? "text-muted-foreground/60" : "text-muted-foreground"}`}>{description}</p>
      {active && !completed && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          Current Focus
        </span>
      )}
    </div>
  </div>
);

export default UserHomepage;
