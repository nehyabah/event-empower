import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import ProjectStats from "@/components/dashboard/ProjectStats";
import WeddingCountdown from "@/components/dashboard/WeddingCountdown";
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
  Copy,
  Palette,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useGuests } from "@/hooks/useGuests";
import { useTodoLists } from "@/context/useTodoLists";
import userService from "@/services/api/userService";
import invitationService from "@/services/api/invitationService";
import rsvpService from "@/services/api/rsvpService";

const UserHomepage = () => {
  const navigate = useNavigate();
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

  const [partner1Name, setPartner1Name] = useState(
    () => localStorage.getItem("partner1Name") || capitalizedName,
  );
  const [partner2Name, setPartner2Name] = useState(
    () => localStorage.getItem("partner2Name") || "Partner",
  );
  const [venue, setVenue] = useState(
    () => localStorage.getItem("venue") || "The Grand Estate",
  );

  const { stats } = useGuests();
  const { todoLists } = useTodoLists();

  const taskStats = useMemo(() => {
    const allItems = todoLists.flatMap(list => list.items);
    return {
      total: allItems.length,
      completed: allItems.filter(item => item.completed).length,
    };
  }, [todoLists]);

  const [plannerCode, setPlannerCode] = useState("");
  const [isLinkingPlanner, setIsLinkingPlanner] = useState(false);
  const [showPlannerLink, setShowPlannerLink] = useState(() => {
    return localStorage.getItem("hidePlannerLink") !== "true";
  });
  const [plannerName, setPlannerName] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    return localStorage.getItem("saveTheDateTemplate") || "classic-roses";
  });
  const [showRsvpBack, setShowRsvpBack] = useState(false);
  const [showCardDesigner, setShowCardDesigner] = useState(false);
  const [rsvpCode, setRsvpCode] = useState<string | null>(null);

  const handleDateChange = (newDate: Date | undefined) => {
    setWeddingDate(newDate);
    if (newDate) {
      const isoDate = newDate.toISOString().split("T")[0];
      localStorage.setItem("weddingDate", isoDate);
      // Sync to backend
      userService.updateUserEvent({ eventDate: isoDate }).catch(console.error);
    }
  };

  useEffect(() => {
    localStorage.setItem("partner1Name", partner1Name);
    localStorage.setItem("partner2Name", partner2Name);
    localStorage.setItem("venue", venue);
  }, [partner1Name, partner2Name, venue]);

  // Sync event details to backend (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      userService.updateUserEvent({
        partner1Name,
        partner2Name,
        venue,
      }).catch(console.error);
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timer);
  }, [partner1Name, partner2Name, venue]);

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

  // Fetch RSVP code for invitation link
  useEffect(() => {
    let isMounted = true;
    const loadRsvpCode = async () => {
      try {
        const code = await rsvpService.getRsvpCode();
        if (isMounted) {
          setRsvpCode(code);
        }
      } catch {
        console.error("Failed to load RSVP code");
      }
    };

    loadRsvpCode();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load event details from backend on mount, or sync localStorage to backend if no event exists
  useEffect(() => {
    let isMounted = true;
    const loadEventDetails = async () => {
      try {
        const event = await userService.getUserEvent();
        if (isMounted) {
          if (event) {
            // Load from backend
            if (event.partner1_name) {
              setPartner1Name(event.partner1_name);
              localStorage.setItem("partner1Name", event.partner1_name);
            }
            if (event.partner2_name) {
              setPartner2Name(event.partner2_name);
              localStorage.setItem("partner2Name", event.partner2_name);
            }
            if (event.venue) {
              setVenue(event.venue);
              localStorage.setItem("venue", event.venue);
            }
            if (event.event_date) {
              const date = new Date(event.event_date);
              if (!isNaN(date.getTime())) {
                setWeddingDate(date);
                localStorage.setItem("weddingDate", event.event_date.toString().split("T")[0]);
              }
            }
          } else {
            // No event in backend - sync localStorage data to backend
            const localDate = localStorage.getItem("weddingDate");
            await userService.updateUserEvent({
              partner1Name: localStorage.getItem("partner1Name") || capitalizedName,
              partner2Name: localStorage.getItem("partner2Name") || "Partner",
              venue: localStorage.getItem("venue") || "The Grand Estate",
              eventDate: localDate || undefined,
            });
            // Reload to get the rsvp_code
            const code = await rsvpService.getRsvpCode();
            if (isMounted) {
              setRsvpCode(code);
            }
          }
        }
      } catch {
        console.error("Failed to load event details");
      }
    };

    loadEventDetails();
    return () => {
      isMounted = false;
    };
  }, [capitalizedName]);

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
      <main className="flex-grow pt-20 pb-12">
        <div className="container mx-auto px-4 space-y-6">
          {/* Welcome Section */}
          <section>
            <h1 className="font-serif text-xl sm:text-2xl md:text-3xl mb-1">
              Welcome back,{" "}
              <span className="text-primary">{capitalizedName}</span>!
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {plannerName ? `Planning with ${plannerName}` : "Continue planning your perfect wedding"}
            </p>
          </section>

          {/* Planner Link Card */}
          {showPlannerLink && (
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Link your planner</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setShowPlannerLink(false);
                      localStorage.setItem("hidePlannerLink", "true");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter invite code"
                    value={plannerCode}
                    onChange={(e) => setPlannerCode(e.target.value)}
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    disabled={!plannerCode.trim() || isLinkingPlanner}
                    onClick={async () => {
                      if (!plannerCode.trim()) return;
                      setIsLinkingPlanner(true);
                      try {
                        await invitationService.acceptInvite(plannerCode.trim());
                        toast.success("Planner linked! Taking you to your workspace…");
                        navigate("/workspace");
                      } catch (err) {
                        toast.error(
                          err instanceof Error ? err.message : "Failed to link",
                        );
                      } finally {
                        setIsLinkingPlanner(false);
                      }
                    }}
                  >
                    {isLinkingPlanner ? "..." : "Link"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wedding Countdown */}
          <WeddingCountdown
            date={weddingDate}
            onDateChange={handleDateChange}
          />

          {/* Stats */}
          <section>
            <h2 className="text-lg font-serif mb-3">Planning Progress</h2>
            <ProjectStats
              totalTasks={taskStats.total}
              completedTasks={taskStats.completed}
              totalGuests={stats.total}
              confirmedGuests={stats.confirmed}
              weddingDate={weddingDate}
            />
          </section>

          {/* Invitation Card Designer */}
          <section>
            <Card className="overflow-hidden">
              {/* Mobile: Collapsible header */}
              <div className="lg:hidden">
                <button
                  onClick={() => setShowCardDesigner(!showCardDesigner)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div>
                    <CardTitle className="text-base font-serif">Invitation Card</CardTitle>
                    <CardDescription className="text-xs">Design and share your save-the-date</CardDescription>
                  </div>
                  {showCardDesigner ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                {showCardDesigner && (
                  <div className="border-t">
                    {/* Card Preview */}
                    <div className="bg-gradient-to-br from-zinc-100 to-zinc-200/80 p-3 flex items-center justify-center">
                      <div className="w-full max-w-[260px] h-[340px] sm:max-w-[280px] sm:h-[380px]">
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

                    {/* Card Customization */}
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="p1-mobile" className="text-xs text-muted-foreground">Partner 1</Label>
                          <Input
                            id="p1-mobile"
                            value={partner1Name}
                            onChange={(e) => setPartner1Name(e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="p2-mobile" className="text-xs text-muted-foreground">Partner 2</Label>
                          <Input
                            id="p2-mobile"
                            value={partner2Name}
                            onChange={(e) => setPartner2Name(e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="venue-mobile" className="text-xs text-muted-foreground">Venue</Label>
                        <Input
                          id="venue-mobile"
                          value={venue}
                          onChange={(e) => setVenue(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>

                      {/* Template Selection */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Template</Label>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {saveTheDateTemplates.map((template) => (
                            <button
                              key={template.id}
                              type="button"
                              onClick={() => {
                                setSelectedTemplate(template.id);
                                localStorage.setItem("saveTheDateTemplate", template.id);
                              }}
                              className={`flex items-center gap-2 shrink-0 rounded-lg border px-3 py-2 text-xs transition-all ${
                                selectedTemplate === template.id
                                  ? "border-zinc-900 bg-zinc-50"
                                  : "border-zinc-200 hover:border-zinc-300"
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full ${template.accentBg} flex items-center justify-center`}>
                                <Palette className={`w-3 h-3 ${template.accent}`} />
                              </div>
                              <span>{template.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button
                        className="w-full gap-2"
                        onClick={() => {
                          const link = rsvpCode
                            ? `${window.location.origin}/invitation/${rsvpCode}`
                            : `${window.location.origin}/invitation`;
                          navigator.clipboard.writeText(link);
                          toast.success("Link copied!");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        Copy Invitation Link
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop: Side-by-side layout */}
              <div className="hidden lg:grid lg:grid-cols-[380px_1fr]">
                <div className="bg-white p-6 border-r flex flex-col gap-5">
                  <div>
                    <CardTitle className="font-serif">Design your Card</CardTitle>
                    <CardDescription>Customize your save-the-date</CardDescription>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="p1" className="text-xs font-medium text-muted-foreground">Partner 1</Label>
                        <Input id="p1" value={partner1Name} onChange={(e) => setPartner1Name(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="p2" className="text-xs font-medium text-muted-foreground">Partner 2</Label>
                        <Input id="p2" value={partner2Name} onChange={(e) => setPartner2Name(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue" className="text-xs font-medium text-muted-foreground">Venue</Label>
                      <Input id="venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Choose Template</Label>
                      <div className="grid gap-2 max-h-[180px] overflow-y-auto pr-2">
                        {saveTheDateTemplates.map((template) => (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => {
                              setSelectedTemplate(template.id);
                              localStorage.setItem("saveTheDateTemplate", template.id);
                            }}
                            className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                              selectedTemplate === template.id
                                ? "border-zinc-900 ring-1 ring-zinc-900 bg-zinc-50"
                                : "border-zinc-100 hover:border-zinc-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-full ${template.accentBg} flex items-center justify-center border ${template.border}`}>
                                <Palette className={`w-3.5 h-3.5 ${template.accent}`} />
                              </div>
                              <span className="font-medium text-zinc-700">{template.name}</span>
                            </div>
                            {selectedTemplate === template.id && (
                              <div className="w-2 h-2 rounded-full bg-zinc-900" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      className="w-full gap-2"
                      onClick={() => {
                        const link = rsvpCode
                          ? `${window.location.origin}/invitation/${rsvpCode}`
                          : `${window.location.origin}/invitation`;
                        navigator.clipboard.writeText(link);
                        toast.success("RSVP link copied!");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                      Copy Invitation Link
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Tap card to preview RSVP form
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-zinc-100 to-zinc-200/80 p-8 flex items-center justify-center min-h-[520px]">
                  <div className="w-full max-w-sm h-[480px]">
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
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-lg font-serif mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <QuickActionCard
                title="To-Do Lists"
                description="Track tasks"
                icon={ListTodo}
                to="/todo-lists"
              />
              <QuickActionCard
                title="Budget"
                description="Manage expenses"
                icon={CreditCard}
                to="/expense-tracker"
              />
              <QuickActionCard
                title="Vendors"
                description="Find services"
                icon={Users}
                to="/vendors"
              />
              <QuickActionCard
                title="Our Story"
                description="Edit your story"
                icon={Pencil}
                to="/couple-story"
              />
            </div>
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
  <Link to={to} className="block">
    <Card className="h-full transition-all hover:shadow-md active:scale-[0.98] overflow-hidden">
      <CardContent className="p-4">
        <div className="rounded-full bg-primary/10 w-9 h-9 flex items-center justify-center mb-3">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-medium text-sm mb-0.5">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </Link>
);

export default UserHomepage;
