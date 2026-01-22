import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import SaveTheDateCard from "@/components/dashboard/SaveTheDateCard";

const InvitationPage = () => {
  const location = useLocation();
  const { code } = useParams();
  const queryParams = new URLSearchParams(location.search);

  // Extract guest details from URL if available
  const guestNameFromURL = queryParams.get("name") || "";
  const guestEmailFromURL = queryParams.get("email") || "";

  const [submitted, setSubmitted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Get the wedding date from localStorage (fallback to a future date if not set)
  const weddingDate = localStorage.getItem("weddingDate") || "2024-12-31";
  const parsedDate = new Date(weddingDate);
  const formattedDate = parsedDate.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Get couple names from localStorage or use fallback
  const partner1Name = localStorage.getItem("partner1Name") || "Partner 1";
  const partner2Name = localStorage.getItem("partner2Name") || "Partner 2";
  const venue = localStorage.getItem("venue") || "The Grand Estate";
  const templateId = localStorage.getItem("saveTheDateTemplate") || "garden-ivory";

  // Check if an invitation code was provided
  useEffect(() => {
    if (code) {
      console.log("Invitation code:", code);
      toast.info("Loading invitation details...");
    }
  }, [code]);

  // Show swipe hint after a few seconds for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only show hint if user hasn't already flipped
      if (!isFlipped) {
        toast("Swipe the card to RSVP", {
          icon: <Sparkles className="w-4 h-4" />,
          duration: 3000,
        });
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [isFlipped]);

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-zinc-50 to-zinc-100">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-wedding-gold/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-wedding-burgundy/10 to-transparent rounded-full blur-3xl" />

        <Card className="w-full max-w-md border border-wedding-gold/20 shadow-xl relative overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className="my-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-green-600 fill-current" />
              </div>
              <h1 className="text-3xl font-serif mb-4 text-zinc-800">Thank You!</h1>
              <p className="text-zinc-600 mb-8 leading-relaxed">
                Your response has been recorded. We're so excited to celebrate this special day with you!
              </p>
              <div className="space-y-3">
                <p className="text-sm text-zinc-500">
                  {formattedDate} at {venue}
                </p>
                <Button asChild className="w-full">
                  <Link to="/">Return Home</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-100">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-wedding-gold/15 to-transparent rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-wedding-burgundy/10 to-transparent rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-wedding-blush/20 to-wedding-sage/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Header */}
      <div className="text-center mb-6 md:mb-8 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-5 h-5 text-wedding-burgundy animate-pulse" />
          <span className="text-sm uppercase tracking-[0.3em] text-zinc-500">You're Invited</span>
          <Heart className="w-5 h-5 text-wedding-burgundy animate-pulse" />
        </div>
        <h1 className="font-serif text-2xl md:text-3xl text-zinc-800">
          {partner1Name} & {partner2Name}
        </h1>
      </div>

      {/* 3D Flip Card */}
      <div className="relative z-10 w-full max-w-sm h-[560px] md:h-[600px]">
        <SaveTheDateCard
          templateId={templateId}
          names={{ partner1: partner1Name, partner2: partner2Name }}
          date={formattedDate}
          venue={venue}
          isEditable={false}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
        />
      </div>

      {/* Footer hint */}
      <p className="text-center text-xs text-zinc-400 mt-6 relative z-10">
        Swipe the card to see the RSVP form
      </p>
    </div>
  );
};

export default InvitationPage;
