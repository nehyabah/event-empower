import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import ProjectStats from "@/components/dashboard/ProjectStats";
import WeddingCountdown from "@/components/dashboard/WeddingCountdown";
import SaveTheDateCard, {
  saveTheDateTemplates,
  CardAlign,
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
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  ChevronUp,
  UserCheck,
  CalendarHeart,
  ArrowRight,
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
import { useAuth } from "@/context/AuthContext";

const UserHomepage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Derive display name from auth context, fallback to email parsing
  const displayName = useMemo(() => {
    if (user?.name?.trim()) {
      return user.name.trim().split(" ")[0];
    }
    const email = user?.email || localStorage.getItem("userEmail") || "";
    const raw = email.split("@")[0].split(".")[0];
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [user]);

  const [weddingDate, setWeddingDate] = useState<Date | undefined>(() => {
    const saved = localStorage.getItem("weddingDate");
    if (!saved) return new Date("2024-12-31");
    const parsed = new Date(saved);
    return Number.isNaN(parsed.getTime()) ? new Date("2024-12-31") : parsed;
  });

  const [partner1Name, setPartner1Name] = useState(
    () => localStorage.getItem("partner1Name") || displayName,
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
  const [plannerDismissed, setPlannerDismissed] = useState(() => {
    return localStorage.getItem("hidePlannerLink") === "true";
  });
  const [plannerName, setPlannerName] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    return localStorage.getItem("saveTheDateTemplate") || "dusty-blue-romance";
  });
  const [textAlign, setTextAlign] = useState<CardAlign>(() => {
    const saved = localStorage.getItem("saveTheDateAlign");
    return saved === "left" || saved === "right" ? saved : "center";
  });
  const [showRsvpBack, setShowRsvpBack] = useState(false);
  const [showCardDesigner, setShowCardDesigner] = useState(false);
  const [rsvpCode, setRsvpCode] = useState<string | null>(null);

  const handleDateChange = (newDate: Date | undefined) => {
    setWeddingDate(newDate);
    if (newDate) {
      const isoDate = newDate.toISOString().split("T")[0];
      localStorage.setItem("weddingDate", isoDate);
      userService.updateUserEvent({ eventDate: isoDate }).catch(console.error);
    }
  };

  useEffect(() => {
    localStorage.setItem("partner1Name", partner1Name);
    localStorage.setItem("partner2Name", partner2Name);
    localStorage.setItem("venue", venue);
  }, [partner1Name, partner2Name, venue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      userService.updateUserEvent({ partner1Name, partner2Name, venue }).catch(console.error);
    }, 1000);
    return () => clearTimeout(timer);
  }, [partner1Name, partner2Name, venue]);

  useEffect(() => {
    let mounted = true;
    userService.getPlannerLink()
      .then(link => { if (mounted) setPlannerName(link?.planner_name || null); })
      .catch(() => { if (mounted) setPlannerName(null); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    rsvpService.getRsvpCode()
      .then(code => { if (mounted) setRsvpCode(code); })
      .catch(console.error);
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const event = await userService.getUserEvent();
        if (!mounted) return;
        if (event) {
          if (event.partner1_name) { setPartner1Name(event.partner1_name); localStorage.setItem("partner1Name", event.partner1_name); }
          if (event.partner2_name) { setPartner2Name(event.partner2_name); localStorage.setItem("partner2Name", event.partner2_name); }
          if (event.venue) { setVenue(event.venue); localStorage.setItem("venue", event.venue); }
          if (event.event_date) {
            const d = new Date(event.event_date);
            if (!isNaN(d.getTime())) {
              setWeddingDate(d);
              localStorage.setItem("weddingDate", event.event_date.toString().split("T")[0]);
            }
          }
        } else {
          const localDate = localStorage.getItem("weddingDate");
          await userService.updateUserEvent({
            partner1Name: localStorage.getItem("partner1Name") || displayName,
            partner2Name: localStorage.getItem("partner2Name") || "Partner",
            venue: localStorage.getItem("venue") || "The Grand Estate",
            eventDate: localDate || undefined,
          });
          const code = await rsvpService.getRsvpCode();
          if (mounted) setRsvpCode(code);
        }
      } catch { /* silent */ }
    };
    load();
    return () => { mounted = false; };
  }, [displayName]);

  const formattedWeddingDate = weddingDate
    ? weddingDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    : "Date TBD";

  const updateTemplate = (id: string) => {
    setSelectedTemplate(id);
    localStorage.setItem("saveTheDateTemplate", id);
  };

  const updateAlign = (a: CardAlign) => {
    setTextAlign(a);
    localStorage.setItem("saveTheDateAlign", a);
  };

  // Design choices ride along in the link so guests see the same card
  const buildInvitationLink = () => {
    const base = rsvpCode
      ? `${window.location.origin}/invitation/${rsvpCode}`
      : `${window.location.origin}/invitation`;
    return `${base}?t=${selectedTemplate}&a=${textAlign}`;
  };

  const copyInvitationLink = () => {
    navigator.clipboard.writeText(buildInvitationLink());
    toast.success("Invitation link copied!");
  };

  const alignOptions: { value: CardAlign; icon: React.ElementType }[] = [
    { value: "left", icon: AlignLeft },
    { value: "center", icon: AlignCenter },
    { value: "right", icon: AlignRight },
  ];

  const showPlannerPrompt = !plannerName && !plannerDismissed;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      <Navbar />
      <main className="flex-grow pt-20 pb-12">
        <div className="container mx-auto px-4 space-y-6 max-w-5xl">

          {/* Welcome */}
          <section className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl mb-1">
                Welcome back, <span className="text-primary">{displayName}</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                {plannerName
                  ? <span className="inline-flex items-center gap-1.5"><UserCheck className="h-3.5 w-3.5 text-green-600" />Planning with <strong>{plannerName}</strong></span>
                  : "Continue planning your perfect wedding"
                }
              </p>
            </div>
            {plannerName && (
              <Link to="/workspace">
                <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
                  <CalendarHeart className="h-4 w-4" />
                  Workspace
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </section>

          {/* Planner state: connected */}
          {plannerName && (
            <Card className="border-green-100 bg-gradient-to-r from-green-50 to-emerald-50/40">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <UserCheck className="h-5 w-5 text-green-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-green-900">Connected to {plannerName}</p>
                  <p className="text-xs text-green-700/70 mt-0.5">Your planner can see your workspace, checklist and guest list.</p>
                </div>
                <Link to="/workspace">
                  <Button size="sm" variant="outline" className="border-green-200 text-green-800 hover:bg-green-100 shrink-0">
                    Open workspace
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Planner state: prompt to link */}
          {showPlannerPrompt && (
            <Card className="border-dashed border-zinc-300 bg-white">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div>
                    <p className="text-sm font-medium">Link a wedding planner</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Enter the invite code your planner shared with you</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground"
                    onClick={() => {
                      setPlannerDismissed(true);
                      localStorage.setItem("hidePlannerLink", "true");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Invite code"
                    value={plannerCode}
                    onChange={(e) => setPlannerCode(e.target.value)}
                    className="text-sm h-9"
                    onKeyDown={(e) => { if (e.key === "Enter" && plannerCode.trim()) e.currentTarget.form?.requestSubmit(); }}
                  />
                  <Button
                    size="sm"
                    className="h-9 px-4"
                    disabled={!plannerCode.trim() || isLinkingPlanner}
                    onClick={async () => {
                      if (!plannerCode.trim()) return;
                      setIsLinkingPlanner(true);
                      try {
                        await invitationService.acceptInvite(plannerCode.trim());
                        toast.success("Planner linked! Taking you to your workspace…");
                        navigate("/workspace");
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Failed to link");
                      } finally {
                        setIsLinkingPlanner(false);
                      }
                    }}
                  >
                    {isLinkingPlanner ? "Linking…" : "Link"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wedding Countdown */}
          <WeddingCountdown date={weddingDate} onDateChange={handleDateChange} />

          {/* Planning Progress */}
          <section>
            <h2 className="text-base font-serif font-medium mb-3 text-zinc-700">Planning Progress</h2>
            <ProjectStats
              totalTasks={taskStats.total}
              completedTasks={taskStats.completed}
              totalGuests={stats.total}
              confirmedGuests={stats.confirmed}
              weddingDate={weddingDate}
            />
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-base font-serif font-medium mb-3 text-zinc-700">Quick Actions</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <QuickActionCard title="To-Do Lists" description="Track tasks" icon={ListTodo} to="/todo-lists" />
              <QuickActionCard title="Budget" description="Manage expenses" icon={CreditCard} to="/expense-tracker" />
              <QuickActionCard title="Vendors" description="Find services" icon={Users} to="/vendors" />
              <QuickActionCard title="Our Story" description="Edit your story" icon={Pencil} to="/couple-story" />
            </div>
          </section>

          {/* Invitation Card Designer */}
          <section>
            <Card className="overflow-hidden">
              {/* Mobile: Collapsible */}
              <div className="lg:hidden">
                <button
                  onClick={() => setShowCardDesigner(!showCardDesigner)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div>
                    <CardTitle className="text-base font-serif">Invitation Card</CardTitle>
                    <CardDescription className="text-xs">Design and share your save-the-date</CardDescription>
                  </div>
                  {showCardDesigner
                    ? <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    : <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  }
                </button>

                {showCardDesigner && (
                  <div className="border-t">
                    <div className="bg-gradient-to-br from-zinc-100 to-zinc-200/80 p-3 flex items-center justify-center">
                      <div className="w-full max-w-[260px] h-[340px] sm:max-w-[280px] sm:h-[380px]">
                        <SaveTheDateCard
                          templateId={selectedTemplate}
                          names={{ partner1: partner1Name, partner2: partner2Name }}
                          date={formattedWeddingDate}
                          venue={venue}
                          design={{ align: textAlign }}
                          isEditable={true}
                          isFlipped={showRsvpBack}
                          onFlip={() => setShowRsvpBack(!showRsvpBack)}
                        />
                      </div>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="p1-mobile" className="text-xs text-muted-foreground">Partner 1</Label>
                          <Input id="p1-mobile" value={partner1Name} onChange={(e) => setPartner1Name(e.target.value)} className="h-9 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="p2-mobile" className="text-xs text-muted-foreground">Partner 2</Label>
                          <Input id="p2-mobile" value={partner2Name} onChange={(e) => setPartner2Name(e.target.value)} className="h-9 text-sm" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="venue-mobile" className="text-xs text-muted-foreground">Venue</Label>
                        <Input id="venue-mobile" value={venue} onChange={(e) => setVenue(e.target.value)} className="h-9 text-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Design</Label>
                        <div className="flex gap-2.5 overflow-x-auto pb-2">
                          {saveTheDateTemplates.map((template) => (
                            <button
                              key={template.id}
                              type="button"
                              onClick={() => updateTemplate(template.id)}
                              className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                                selectedTemplate === template.id
                                  ? "border-zinc-900 shadow-md"
                                  : "border-zinc-200 opacity-75 hover:opacity-100"
                              }`}
                            >
                              <div className="relative w-14 h-[72px] overflow-hidden" style={{ backgroundColor: template.paper }}>
                                <template.Decor />
                                <span
                                  className="absolute inset-0 flex items-center justify-center text-[10px]"
                                  style={{ fontFamily: template.nameFont, color: template.ink }}
                                >
                                  A&nbsp;&amp;&nbsp;J
                                </span>
                              </div>
                              <p className="text-[9px] py-0.5 px-1 truncate w-14 bg-white text-zinc-600">{template.name}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Text Alignment</Label>
                        <div className="flex gap-1.5">
                          {alignOptions.map(({ value, icon: Icon }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => updateAlign(value)}
                              className={`flex-1 flex items-center justify-center h-9 rounded-md border transition-all ${
                                textAlign === value
                                  ? "border-zinc-900 bg-zinc-100 text-zinc-900"
                                  : "border-zinc-200 text-zinc-400 hover:border-zinc-300"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full gap-2" onClick={copyInvitationLink}>
                        <Copy className="h-4 w-4" />
                        Copy Invitation Link
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop: Side-by-side */}
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
                      <Label className="text-xs font-medium text-muted-foreground">Choose Design</Label>
                      <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1">
                        {saveTheDateTemplates.map((template) => (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => updateTemplate(template.id)}
                            className={`rounded-lg overflow-hidden border-2 transition-all text-left ${
                              selectedTemplate === template.id
                                ? "border-zinc-900 shadow-md"
                                : "border-zinc-200 opacity-80 hover:opacity-100 hover:border-zinc-400"
                            }`}
                          >
                            <div className="relative w-full h-24 overflow-hidden" style={{ backgroundColor: template.paper }}>
                              <template.Decor />
                              <span
                                className="absolute inset-0 flex items-center justify-center text-xs"
                                style={{ fontFamily: template.nameFont, color: template.ink }}
                              >
                                A&nbsp;&amp;&nbsp;J
                              </span>
                            </div>
                            <p className="text-[10px] py-1 px-1.5 truncate bg-white text-zinc-600 font-medium">{template.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Text Alignment</Label>
                      <div className="flex gap-1.5">
                        {alignOptions.map(({ value, icon: Icon }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => updateAlign(value)}
                            className={`flex-1 flex items-center justify-center h-9 rounded-md border transition-all ${
                              textAlign === value
                                ? "border-zinc-900 bg-zinc-100 text-zinc-900"
                                : "border-zinc-200 text-zinc-400 hover:border-zinc-300"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Button className="w-full gap-2" onClick={copyInvitationLink}>
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
                      design={{ align: textAlign }}
                      isEditable={true}
                      isFlipped={showRsvpBack}
                      onFlip={() => setShowRsvpBack(!showRsvpBack)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </section>

        </div>
      </main>
    </div>
  );
};

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  to: string;
}

const QuickActionCard = ({ title, description, icon: Icon, to }: QuickActionCardProps) => (
  <Link to={to} className="block">
    <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] overflow-hidden">
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
