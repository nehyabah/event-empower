import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { CalendarDays, Loader2, Lock, MapPin, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { rsvpService, EventInfo } from "@/services/api/rsvpService";
import { formatDateOnly } from "@/lib/dates";

type Attending = "confirmed" | "declined";

const formatDate = (value: string | null) =>
  formatDateOnly(value, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[#faf9f7] px-4 py-12 sm:py-20">
    <div className="mx-auto w-full max-w-md">
      <p className="mb-8 text-center font-serif text-2xl tracking-[0.2em] text-[#2e3240]">
        àjọyọ̀
      </p>
      <div className="overflow-hidden rounded-2xl border border-[#ece8e2] bg-white shadow-sm">
        <div className="h-1 bg-[#b2834c]" />
        {children}
      </div>
    </div>
  </div>
);

const RsvpPage = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState<Attending | null>(null);
  const [guestCount, setGuestCount] = useState("1");
  const [dietaryNotes, setDietaryNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{ status: Attending; message: string } | null>(null);
  // Set when the backend rejects with 410 — the window closed while the page
  // was open, so the form is replaced rather than just showing an error.
  const [closedAfterLoad, setClosedAfterLoad] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;

    (async () => {
      try {
        const info = await rsvpService.getEventInfo(code);
        if (cancelled) return;
        if (!info) setNotFound(true);
        else setEvent(info);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [code]);

  // Prefill from an invite link that carries the guest's name.
  useEffect(() => {
    const guest = searchParams.get("name") || searchParams.get("guest");
    if (guest) setName(guest);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!code || !attending || !name.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await rsvpService.submitRsvp({
        rsvpCode: code,
        name: name.trim(),
        email: email.trim() || undefined,
        status: attending,
        guestCount: attending === "confirmed" ? Number(guestCount) || 1 : 1,
        dietaryNotes: dietaryNotes.trim() || undefined,
      });

      // Once they've answered, send them straight to the couple's website.
      // The response is carried in the URL so the site can acknowledge it —
      // the guest gets confirmation without being parked on a dead-end screen.
      if (event?.storySlug) {
        navigate(`/s/${event.storySlug}?rsvp=${attending}`, { replace: true });
        return;
      }

      // No published website: fall back to confirming in place.
      setSubmitted({ status: attending, message: result.message });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      // The deadline passed between page load and submit.
      if (/closed|deadline/i.test(message)) setClosedAfterLoad(message);
      else setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Shell>
        <div className="flex items-center justify-center p-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#b2834c]" />
        </div>
      </Shell>
    );
  }

  if (notFound || !event) {
    return (
      <Shell>
        <div className="p-10 text-center">
          <p className="mb-3 text-3xl">🔍</p>
          <h1 className="font-serif text-2xl text-[#2e3240]">Invitation not found</h1>
          <p className="mt-2 text-sm text-gray-500">
            This RSVP link doesn't match an event. Check the link and try again, or
            ask the couple to resend it.
          </p>
        </div>
      </Shell>
    );
  }

  const coupleNames =
    [event.partner1Name, event.partner2Name].filter(Boolean).join(" & ") || "The couple";
  const eventDate = formatDate(event.eventDate);
  const deadline = formatDate(event.rsvpDeadline);

  // Closed either on load or on submit.
  const closedReason = closedAfterLoad || (event.rsvpClosed ? event.closedReason : null);

  const Header = (
    <div className="border-b border-[#f0ede8] px-8 pb-6 pt-10 text-center">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#b2834c]">You're invited</p>
      <h1 className="mt-3 font-serif text-3xl leading-tight text-[#2e3240]">{coupleNames}</h1>
      <div className="mt-4 space-y-1.5 text-sm text-gray-500">
        {eventDate && (
          <p className="flex items-center justify-center gap-2">
            <CalendarDays className="h-3.5 w-3.5" />
            {eventDate}
          </p>
        )}
        {event.venue && (
          <p className="flex items-center justify-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            {event.venue}
          </p>
        )}
      </div>
      {event.storySlug && (
        <Link
          to={`/s/${event.storySlug}`}
          className="mt-4 inline-block text-xs font-medium text-[#b2834c] underline underline-offset-4"
        >
          Visit our wedding website
        </Link>
      )}
    </div>
  );

  if (closedReason) {
    return (
      <Shell>
        {Header}
        <div className="px-8 py-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#faf9f7]">
            <Lock className="h-5 w-5 text-[#b2834c]" />
          </div>
          <h2 className="font-serif text-xl text-[#2e3240]">RSVPs are closed</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{closedReason}</p>
          {event.storySlug && (
            <Button asChild variant="outline" className="mt-6">
              <Link to={`/s/${event.storySlug}`}>Visit the wedding website</Link>
            </Button>
          )}
        </div>
      </Shell>
    );
  }

  if (submitted) {
    return (
      <Shell>
        {Header}
        <div className="px-8 py-10 text-center">
          <p className="mb-3 text-4xl">{submitted.status === "confirmed" ? "🎉" : "💐"}</p>
          <h2 className="font-serif text-xl text-[#2e3240]">Thank you</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{submitted.message}</p>
          {event.storySlug && (
            <Button asChild variant="outline" className="mt-6">
              <Link to={`/s/${event.storySlug}`}>Visit the wedding website</Link>
            </Button>
          )}
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {Header}

      <form onSubmit={handleSubmit} className="space-y-5 px-8 py-8">
        {event.rsvpMessage && (
          <p className="rounded-lg border-l-2 border-[#b2834c] bg-[#faf9f7] px-4 py-3 text-sm leading-relaxed text-gray-600">
            {event.rsvpMessage}
          </p>
        )}

        {deadline && (
          <p className="text-center text-xs text-gray-500">
            Please respond by <span className="font-semibold text-[#b2834c]">{deadline}</span>
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="rsvp-name">Your name</Label>
          <Input
            id="rsvp-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rsvp-email">Email (optional)</Label>
          <Input
            id="rsvp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label>Will you be joining us?</Label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: "confirmed" as const, label: "Joyfully accept" },
              { value: "declined" as const, label: "Regretfully decline" },
            ]).map((option) => {
              const selected = attending === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAttending(option.value)}
                  className={`rounded-lg border px-3 py-3 text-sm transition-colors ${
                    selected
                      ? "border-[#b2834c] bg-[#b2834c]/10 font-medium text-[#2e3240]"
                      : "border-[#ece8e2] text-gray-600 hover:border-[#d8d2c9]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {attending === "confirmed" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="rsvp-count">Number of guests</Label>
              <Input
                id="rsvp-count"
                type="number"
                min={1}
                max={2}
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rsvp-diet">Dietary requirements (optional)</Label>
              <Textarea
                id="rsvp-diet"
                rows={3}
                value={dietaryNotes}
                onChange={(e) => setDietaryNotes(e.target.value)}
                placeholder="Allergies or preferences we should know about"
              />
            </div>
          </>
        )}

        {submitError && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-[#b2834c] hover:bg-[#9c7242]"
          disabled={!attending || !name.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</>
          ) : (
            <><PartyPopper className="mr-2 h-4 w-4" />Send RSVP</>
          )}
        </Button>
      </form>
    </Shell>
  );
};

export default RsvpPage;
