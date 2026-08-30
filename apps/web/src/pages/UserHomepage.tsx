import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import WeddingCountdown from "@/components/dashboard/WeddingCountdown";
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
  X,
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
    if (!saved) return undefined;
    const parsed = new Date(saved);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  });

  const [partner1Name, setPartner1Name] = useState(
    () => localStorage.getItem("partner1Name") || displayName,
  );
  const [partner2Name, setPartner2Name] = useState(
    () => localStorage.getItem("partner2Name") || "",
  );
  const [venue, setVenue] = useState(
    () => localStorage.getItem("venue") || "",
  );

  const { stats } = useGuests();
  const { todoLists } = useTodoLists();


  const [plannerCode, setPlannerCode] = useState("");
  const [isLinkingPlanner, setIsLinkingPlanner] = useState(false);
  const [plannerDismissed, setPlannerDismissed] = useState(() => {
    return localStorage.getItem("hidePlannerLink") === "true";
  });
  const [plannerName, setPlannerName] = useState<string | null>(null);
  const [setupIncomplete, setSetupIncomplete] = useState(false);

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
    const load = async () => {
      try {
        const event = await userService.getUserEvent();
        if (!mounted) return;
        if (event) {
          // Enough to plan with: a date, a budget and a guest estimate.
          setSetupIncomplete(
            !event.event_date || !event.total_budget || !event.guest_count_estimate,
          );
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
          setSetupIncomplete(true);
          // Create the row, but do not invent its contents: seeding "Partner"
          // and "The Grand Estate" made a new account look like it already
          // held somebody else's wedding. /setup asks for the real answers.
          await userService.updateUserEvent({
            partner1Name: localStorage.getItem("partner1Name") || displayName,
          });
        }
      } catch { /* silent */ }
    };
    load();
    return () => { mounted = false; };
  }, [displayName]);


  const showPlannerPrompt = !plannerName && !plannerDismissed;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      <Navbar />
      <main className="flex-grow pt-20 pb-12">
        <div className="container mx-auto px-4 space-y-6 max-w-5xl">

          {/* The couple's names, in the same serif the workspace uses for them,
              so the two places they see their own names agree.
              Falls back to one name until a partner has been added. */}
          <div className="text-center pt-2">
            <h1 className="text-4xl sm:text-5xl font-serif font-medium tracking-tight text-primary leading-tight">
              {partner2Name ? `${partner1Name} & ${partner2Name}` : partner1Name}
            </h1>
          </div>


          {/* Wedding Countdown */}
          <WeddingCountdown date={weddingDate} onDateChange={handleDateChange} />


          {/* One route into the shared workspace. The header already names the
              planner, so repeating it in a full-width card said nothing new. */}
          {plannerName && (
            <Link to="/workspace" className="block">
              <Card className="transition-colors hover:bg-muted/40">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <CalendarHeart className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Go to workspace with {plannerName}</p>
                    <p className="text-xs text-muted-foreground">
                      Checklist, budget and guests, all shared
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          )}


          {/* Nothing to plan against until the basics exist, and this used to
              have no home in the UI at all — the expected guest count had no
              interface despite the column existing. */}
          {setupIncomplete && (
            <Link to="/setup" className="block">
              <Card className="border-dashed transition-colors hover:bg-muted/40">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <CalendarHeart className="h-4 w-4 text-amber-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Finish setting up your wedding</p>
                    <p className="text-xs text-muted-foreground">
                      Add your date, expected guests and budget
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
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
                    className="h-9 w-9 sm:h-7 sm:w-7 shrink-0 text-muted-foreground"
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
