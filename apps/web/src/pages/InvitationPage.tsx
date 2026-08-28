import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import SaveTheDateCard, { CardAlign } from "@/components/dashboard/SaveTheDateCard";
import { rsvpService } from "@/services/api/rsvpService";

const InvitationPage = () => {
  const { code: rsvpCode } = useParams();
  const [searchParams] = useSearchParams();

  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(!!rsvpCode);
  const [loadFailed, setLoadFailed] = useState(false);
  // Envelope intro: sealed → opening (flap lifts, card rises) → done (real card)
  const [eventData, setEventData] = useState<{
    partner1Name: string;
    partner2Name: string;
    eventDate: string;
    venue: string;
    storySlug: string | null;
  } | null>(null);

  // Only used when the couple previews their own card, where this browser
  // holds their details. A guest arriving by link has none of it, so nothing
  // here may invent a name or a date.
  const localWeddingDate = localStorage.getItem("weddingDate");
  const localFormattedDate = localWeddingDate
    ? new Date(localWeddingDate).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Date TBD";
  const localPartner1Name = localStorage.getItem("partner1Name") || "Partner 1";
  const localPartner2Name = localStorage.getItem("partner2Name") || "Partner 2";
  const localVenue = localStorage.getItem("venue") || "";
  // Design comes from the link the couple shared; localStorage is only a
  // fallback for the couple previewing their own card
  const templateId =
    searchParams.get("t") ||
    localStorage.getItem("saveTheDateTemplate") ||
    "vintage-blush";
  const alignParam = searchParams.get("a");
  const textAlign: CardAlign =
    alignParam === "left" || alignParam === "right" ? alignParam : "center";

  // Fetch event details from backend if we have an RSVP code
  useEffect(() => {
    if (!rsvpCode) {
      setIsLoading(false);
      return;
    }

    const fetchEventInfo = async () => {
      try {
        const info = await rsvpService.getEventInfo(rsvpCode);
        if (!info) setLoadFailed(true);
        if (info) {
          const eventDate = info.eventDate
            ? new Date(info.eventDate).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : "Date TBD";

          setEventData({
            partner1Name: info.partner1Name || "Partner 1",
            partner2Name: info.partner2Name || "Partner 2",
            eventDate,
            venue: info.venue || "Venue TBD",
            storySlug: info.storySlug || null,
          });
        }
      } catch (error) {
        console.error("Failed to fetch event info:", error);
        setLoadFailed(true);
        toast.error("Could not load invitation details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventInfo();
  }, [rsvpCode]);

  // Show swipe hint after a few seconds for better UX
  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (!isFlipped) {
        toast("Swipe the card to RSVP", {
          icon: <Sparkles className="w-4 h-4" />,
          duration: 3000,
        });
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [isFlipped, isLoading]);

  // Use event data from backend, or fall back to localStorage
  const partner1Name = eventData?.partner1Name || localPartner1Name;
  const partner2Name = eventData?.partner2Name || localPartner2Name;
  const formattedDate = eventData?.eventDate || localFormattedDate;
  const venue = eventData?.venue || localVenue;

  // A guest followed a real link and we could not load the wedding behind it.
  // Falling through would render whatever happens to be in this browser -
  // for a guest, the placeholder names and no date at all.
  if (rsvpCode && loadFailed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-zinc-50 to-zinc-100">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-serif font-medium text-zinc-800 mb-2">
            We couldn't open this invitation
          </h1>
          <p className="text-sm text-zinc-500">
            The link may have expired, or it may have been mistyped. Please check with
            the couple who invited you.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-zinc-50 to-zinc-100">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-wedding-burgundy animate-pulse mx-auto mb-4" />
          <p className="text-zinc-500">Loading invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-4 md:p-8 bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-100"
      style={{ animation: "invitationReveal .7s ease both" }}>
      <style>{`@keyframes invitationReveal { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }`}</style>
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-wedding-gold/15 to-transparent rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-wedding-burgundy/10 to-transparent rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-wedding-blush/20 to-wedding-sage/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Header */}
      <div className="text-center mb-4 sm:mb-6 md:mb-8 relative z-10">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-wedding-burgundy animate-pulse" />
          <span className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-zinc-500">You're Invited</span>
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-wedding-burgundy animate-pulse" />
        </div>
        <h1 className="font-serif text-xl sm:text-2xl md:text-3xl text-zinc-800">
          {partner1Name} & {partner2Name}
        </h1>
      </div>

      {/* 3D Flip Card */}
      <div className="relative z-10 w-full max-w-[300px] sm:max-w-sm h-[440px] sm:h-[520px] md:h-[600px]">
        <SaveTheDateCard
          templateId={templateId}
          names={{ partner1: partner1Name, partner2: partner2Name }}
          date={formattedDate}
          venue={venue}
          design={{ align: textAlign }}
          isEditable={false}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
          rsvpCode={rsvpCode}
          storySlug={eventData?.storySlug || null}
        />
      </div>

      {/* Footer hint */}
      <p className="text-center text-[10px] sm:text-xs text-zinc-400 mt-4 sm:mt-6 relative z-10">
        Swipe the card to see the RSVP form
      </p>
    </div>
  );
};

export default InvitationPage;
