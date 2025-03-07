
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Heart, MapPin, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface InvitationData {
  couple: string;
  date: string;
  venue?: string;
  details?: string;
  code: string;
}

const InvitationPage = () => {
  const { code } = useParams<{ code: string }>();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);
  
  useEffect(() => {
    if (!code) return;
    
    // In a real app, this would fetch from a database
    const invitationData = localStorage.getItem(`invitation_${code}`);
    if (invitationData) {
      setInvitation(JSON.parse(invitationData));
      
      // Check if user has already RSVP'd
      const status = localStorage.getItem(`rsvp_${code}`);
      if (status) {
        setRsvpStatus(status);
      }
    }
  }, [code]);
  
  const handleRSVP = (status: string) => {
    if (!code) return;
    
    // In a real app, this would save to a database
    localStorage.setItem(`rsvp_${code}`, status);
    setRsvpStatus(status);
    toast.success(`You have ${status} the invitation!`);
  };
  
  if (!invitation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-serif mb-4">Invitation Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The invitation you're looking for doesn't exist or has expired.
            </p>
            <Link to="/">
              <Button>Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Parse the date for display
  const weddingDate = new Date(invitation.date);
  const monthName = format(weddingDate, "MMMM");
  const dayOfMonth = format(weddingDate, "d");
  const year = format(weddingDate, "yyyy");
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-wedding-gold/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-wedding-burgundy/10 to-transparent rounded-full blur-3xl" />
      
      <Card className="w-full max-w-2xl border border-wedding-gold/20 shadow-lg relative overflow-hidden bg-gradient-to-tr from-background via-background to-background/90">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCwwIEwyMDAsMjAwIE0yMDAsMCBMMCwyMDAiIHN0cm9rZT0iaHNsKDMyIDQwJSA1MCUgLyAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIwLjUiIGZpbGw9Im5vbmUiLz48L3N2Zz4=')] opacity-10" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-wedding-gold/5 rounded-full blur-3xl" />
        
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {/* Date column */}
            <div className="bg-gradient-to-br from-wedding-gold/10 via-wedding-gold/5 to-transparent p-8 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-wedding-gold/10">
              <div className="text-3xl md:text-4xl font-serif font-light text-wedding-gold mb-2">{monthName}</div>
              <div className="text-6xl md:text-7xl font-serif font-bold bg-gradient-to-br from-wedding-gold to-wedding-burgundy/80 bg-clip-text text-transparent">{dayOfMonth}</div>
              <div className="text-2xl font-serif text-muted-foreground mt-1">{year}</div>
            </div>
            
            {/* Invitation details */}
            <div className="col-span-1 md:col-span-2 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-5 h-5 text-wedding-burgundy/70 animate-pulse-soft" />
                <h3 className="text-2xl md:text-3xl font-serif">
                  <span className="bg-gradient-to-r from-wedding-gold to-wedding-burgundy/80 bg-clip-text text-transparent">Wedding Invitation</span>
                </h3>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-3xl font-serif text-center">{invitation.couple}</h1>
                
                <p className="text-center text-lg text-muted-foreground">
                  We warmly invite you to celebrate our wedding day
                </p>
                
                <div className="space-y-4 mt-6">
                  {/* Location info would go here in a real invitation */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-wedding-gold/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-wedding-gold" />
                    </div>
                    <div>
                      <p className="font-medium">Venue</p>
                      <p className="text-sm text-muted-foreground">
                        {invitation.venue || "Sunset Gardens Resort"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-wedding-gold/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-wedding-gold" />
                    </div>
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">
                        {format(weddingDate, "h:mm a")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-wedding-gold/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-wedding-gold" />
                    </div>
                    <div>
                      <p className="font-medium">Details</p>
                      <p className="text-sm text-muted-foreground">
                        {invitation.details || "Reception to follow. Please RSVP by confirming below."}
                      </p>
                    </div>
                  </div>
                </div>
                
                {rsvpStatus ? (
                  <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      You have {rsvpStatus} this invitation
                    </p>
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => setRsvpStatus(null)}
                    >
                      Change Response
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                    <Button 
                      className="bg-wedding-gold hover:bg-wedding-gold/90 text-black"
                      onClick={() => handleRSVP('accepted')}
                    >
                      Accept with Pleasure
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleRSVP('declined')}
                    >
                      Decline with Regret
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationPage;
