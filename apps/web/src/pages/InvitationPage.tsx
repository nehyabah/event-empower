import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import SaveTheDateCard, { CardAlign, resolveTemplate } from "@/components/dashboard/SaveTheDateCard";
import { rsvpService } from "@/services/api/rsvpService";

const InvitationPage = () => {
  const { code: rsvpCode } = useParams();
  const [searchParams] = useSearchParams();

  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(!!rsvpCode);
  // Envelope intro: sealed → opening (flap lifts, card rises) → done (real card)
  const [envelopeStage, setEnvelopeStage] = useState<"sealed" | "opening" | "done">("sealed");
  const [eventData, setEventData] = useState<{
    partner1Name: string;
    partner2Name: string;
    eventDate: string;
    venue: string;
    storySlug: string | null;
  } | null>(null);

  // Get fallback data from localStorage
  const localWeddingDate = localStorage.getItem("weddingDate") || "2024-12-31";
  const localParsedDate = new Date(localWeddingDate);
  const localFormattedDate = localParsedDate.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const localPartner1Name = localStorage.getItem("partner1Name") || "Partner 1";
  const localPartner2Name = localStorage.getItem("partner2Name") || "Partner 2";
  const localVenue = localStorage.getItem("venue") || "The Grand Estate";
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
        toast.error("Could not load invitation details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventInfo();
  }, [rsvpCode]);

  // Show swipe hint after a few seconds for better UX
  useEffect(() => {
    if (isLoading || envelopeStage !== "done") return;

    const timer = setTimeout(() => {
      if (!isFlipped) {
        toast("Swipe the card to RSVP", {
          icon: <Sparkles className="w-4 h-4" />,
          duration: 3000,
        });
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [isFlipped, isLoading, envelopeStage]);

  const openEnvelope = () => {
    if (envelopeStage !== "sealed") return;
    setEnvelopeStage("opening");
    // flap lifts (.8s) → card rises (.9s, delayed .55s) → envelope fades → swap in real card
    setTimeout(() => setEnvelopeStage("done"), 1900);
  };

  // Use event data from backend, or fall back to localStorage
  const partner1Name = eventData?.partner1Name || localPartner1Name;
  const partner2Name = eventData?.partner2Name || localPartner2Name;
  const formattedDate = eventData?.eventDate || localFormattedDate;
  const venue = eventData?.venue || localVenue;

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

  // ── Envelope intro ──
  if (envelopeStage !== "done") {
    const t = resolveTemplate(templateId);
    const opening = envelopeStage === "opening";
    const initial = (n: string) => (n.trim()[0] || "").toUpperCase();

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-100">
        <style>{`@keyframes envelopeIn { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: none; } }`}</style>

        {/* Outer wrapper fades the whole scene away once the card has risen */}
        <div
          className="w-full max-w-[300px] sm:max-w-sm"
          style={{ opacity: opening ? 0 : 1, transition: "opacity .6s ease 1.25s" }}
        >
          <div style={{ animation: "envelopeIn .8s cubic-bezier(.2,.7,.3,1) both" }}>
            <p className="text-center text-[10px] sm:text-xs uppercase tracking-[0.3em] text-zinc-400 mb-5"
              style={{ opacity: opening ? 0 : 1, transition: "opacity .4s ease" }}>
              You're Invited
            </p>

            {/* Envelope */}
            <div
              onClick={openEnvelope}
              className="relative w-full h-[440px] sm:h-[520px] md:h-[600px] cursor-pointer select-none"
              style={{ perspective: "1200px" }}
            >
              {/* Back panel */}
              <div className="absolute inset-0 rounded-xl shadow-2xl"
                style={{
                  background: `linear-gradient(165deg, ${t.accentBg}, ${t.paper})`,
                  border: `1px solid ${t.frame}`,
                }} />

              {/* Card inside — rises out on open */}
              <div className="absolute rounded-lg shadow-lg flex flex-col items-center justify-start text-center px-6 pt-10"
                style={{
                  left: "6%", right: "6%", top: "5%", bottom: "5%",
                  zIndex: 10,
                  backgroundColor: t.paper,
                  border: `1px solid ${t.frame}`,
                  transform: opening ? "translateY(-56%)" : "translateY(0)",
                  transition: "transform .9s cubic-bezier(.22,.9,.34,1) .55s",
                }}>
                <p className="uppercase text-[9px] sm:text-[10px]"
                  style={{ fontFamily: t.headerFont, letterSpacing: t.headerTracking, color: t.inkSoft }}>
                  Save the Date
                </p>
                <p className="text-lg sm:text-xl mt-1.5" style={{ fontFamily: t.scriptFont, color: t.accent }}>
                  for the wedding of
                </p>
                <p className="text-xl sm:text-2xl mt-2 leading-tight" style={{ fontFamily: t.nameFont, color: t.ink }}>
                  {partner1Name}
                </p>
                <p className="text-lg sm:text-xl" style={{ fontFamily: t.scriptFont, color: t.accent }}>&amp;</p>
                <p className="text-xl sm:text-2xl leading-tight" style={{ fontFamily: t.nameFont, color: t.ink }}>
                  {partner2Name}
                </p>
              </div>

              {/* Pocket — V-notched front of the envelope */}
              <div className="absolute inset-0 rounded-xl"
                style={{
                  zIndex: 20,
                  clipPath: "polygon(0 15%, 50% 42%, 100% 15%, 100% 100%, 0 100%)",
                  background: `linear-gradient(180deg, ${t.accentBg} 0%, ${t.paper} 55%)`,
                  boxShadow: `inset 0 1px 0 ${t.frame}`,
                  borderLeft: `1px solid ${t.frame}`,
                  borderRight: `1px solid ${t.frame}`,
                  borderBottom: `1px solid ${t.frame}`,
                  borderRadius: "12px",
                }} />

              {/* Addressed-in-calligraphy names on the envelope front */}
              <div className="absolute inset-x-0 text-center pointer-events-none" style={{ top: "58%", zIndex: 25 }}>
                <p className="text-2xl sm:text-3xl" style={{ fontFamily: t.scriptFont, color: t.ink }}>
                  {partner1Name} &amp; {partner2Name}
                </p>
                <p className="mt-2 uppercase text-[8px] sm:text-[9px] tracking-[0.35em]"
                  style={{ fontFamily: t.headerFont, color: t.inkSoft }}>
                  {formattedDate}
                </p>
              </div>

              {/* Flap — lifts open */}
              <div className="absolute inset-x-0 top-0 h-full"
                style={{
                  zIndex: 30,
                  clipPath: "polygon(0 0, 100% 0, 50% 46%)",
                  background: `linear-gradient(180deg, ${t.frame}, ${t.accentBg})`,
                  borderRadius: "12px 12px 0 0",
                  transformOrigin: "top center",
                  transform: opening ? "rotateX(180deg)" : "rotateX(0deg)",
                  transition: "transform .8s cubic-bezier(.4,0,.2,1)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }} />

              {/* Wax seal at the flap tip */}
              <div className="absolute left-1/2 flex items-center justify-center"
                style={{
                  zIndex: 40,
                  top: "46%",
                  width: 58, height: 58,
                  borderRadius: "50%",
                  background: t.accent,
                  color: "#fff",
                  fontFamily: t.scriptFont,
                  fontSize: 20,
                  boxShadow: "0 3px 10px rgba(0,0,0,.2), inset 0 0 0 3px rgba(255,255,255,.28)",
                  transform: opening ? "translate(-50%,-50%) scale(.5)" : "translate(-50%,-50%)",
                  opacity: opening ? 0 : 1,
                  transition: "transform .45s ease, opacity .45s ease",
                }}>
                {initial(partner1Name)}&nbsp;&amp;&nbsp;{initial(partner2Name)}
              </div>
            </div>

            <p className="text-center text-[10px] sm:text-xs uppercase tracking-[0.25em] text-zinc-400 mt-6 animate-pulse"
              style={{ opacity: opening ? 0 : 1, transition: "opacity .3s ease" }}>
              Tap to open
            </p>
          </div>
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
