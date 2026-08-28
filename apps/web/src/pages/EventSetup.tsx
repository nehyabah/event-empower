import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import userService from "@/services/api/userService";
import { useAuth } from "@/context/AuthContext";

/**
 * First-run setup for a couple.
 *
 * Everything here was previously scattered: the date and names were edited
 * inline on the home page, the budget lived behind the expenses screen, and the
 * expected guest count had no interface at all despite the column existing.
 * A new account therefore opened onto a dashboard full of empty widgets with
 * nothing indicating where to begin.
 *
 * Skippable on purpose — someone who just wants to look around should not hit
 * a wall, and everything here stays editable later.
 */

const EventSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [partner1, setPartner1] = useState("");
  const [partner2, setPartner2] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [guests, setGuests] = useState("");
  const [budget, setBudget] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Prefill from whatever already exists, so this doubles as an edit screen.
  useEffect(() => {
    let cancelled = false;
    userService
      .getUserEvent()
      .then((event) => {
        if (cancelled || !event) return;
        setPartner1(event.partner1_name || user?.name || "");
        setPartner2(event.partner2_name || "");
        setEventDate(event.event_date ? String(event.event_date).slice(0, 10) : "");
        setVenue(event.venue || "");
        setGuests(event.guest_count_estimate ? String(event.guest_count_estimate) : "");
        setBudget(event.total_budget ? String(event.total_budget) : "");
      })
      .catch(() => {
        /* a missing event is the normal case on a new account */
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.name]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await userService.updateUserEvent({
        partner1Name: partner1.trim() || undefined,
        partner2Name: partner2.trim() || undefined,
        eventDate: eventDate || null,
        venue: venue.trim() || null,
        // Empty stays undefined rather than 0 — an unanswered question is not
        // a budget of nothing.
        guestCountEstimate: guests ? Number(guests) : undefined,
        totalBudget: budget ? Number(budget) : undefined,
      });
      toast.success("All set", { description: "You can change any of this later." });
      navigate("/home", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 px-4 pt-24 pb-16">
        <div className="mx-auto w-full max-w-lg">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Wedding details
            </p>
            <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight">
              Tell us about your wedding
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Just the basics — everything here can be changed later.
            </p>
          </div>

          <Card>
            <CardContent className="p-6 sm:p-8">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <form onSubmit={save} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="p1">Your name</Label>
                      <Input id="p1" value={partner1} onChange={(e) => setPartner1(e.target.value)} placeholder="Ada" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p2">Partner's name</Label>
                      <Input id="p2" value={partner2} onChange={(e) => setPartner2(e.target.value)} placeholder="Obi" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Wedding date</Label>
                    <Input id="date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue or city</Label>
                    <Input id="venue" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Eko Hotel, Lagos" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guests">Expected guests</Label>
                      <Input
                        id="guests"
                        inputMode="numeric"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value.replace(/\D/g, ""))}
                        placeholder="250"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget (₦)</Label>
                      <Input
                        id="budget"
                        inputMode="numeric"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value.replace(/\D/g, ""))}
                        placeholder="5000000"
                      />
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full mt-2" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      "Save and continue"
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => navigate("/home", { replace: true })}
                    className="w-full text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    Skip for now
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EventSetup;
