
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Heart, MapPin, Clock, Users, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'pending' | 'confirmed' | 'declined' | 'maybe';
  group?: string;
}

interface InvitationData {
  guest: Guest;
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
    if (!code || !invitation) return;
    
    // Update the guest status in the guestlist
    const guestId = invitation.guest.id;
    const guestsData = localStorage.getItem("weddingGuests");
    
    if (guestsData) {
      const guests: Guest[] = JSON.parse(guestsData);
      const updatedGuests = guests.map(guest => {
        if (guest.id === guestId) {
          return { ...guest, status: status === 'accepted' ? 'confirmed' : 'declined' };
        }
        return guest;
      });
      
      // Save updated guests list
      localStorage.setItem("weddingGuests", JSON.stringify(updatedGuests));
    }
    
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
  const formattedDate = format(weddingDate, "EEEE, MMMM d, yyyy");
  const formattedTime = format(weddingDate, "h:mm a");
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-wedding-gold/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-wedding-burgundy/10 to-transparent rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md border border-wedding-gold/20 shadow-lg relative overflow-hidden bg-gradient-to-tr from-background via-background to-background/90">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCwwIEwyMDAsMjAwIE0yMDAsMCBMMCwyMDAiIHN0cm9rZT0iaHNsKDMyIDQwJSA1MCUgLyAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIwLjUiIGZpbGw9Im5vbmUiLz48L3N2Zz4=')] opacity-10" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-wedding-gold/5 rounded-full blur-3xl" />
        
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-center mb-2">
            <Heart className="w-5 h-5 text-wedding-burgundy/70 animate-pulse-soft" />
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-serif mb-2">Wedding Invitation</h1>
            <h2 className="text-xl font-serif text-wedding-gold">{invitation.couple}</h2>
            <p className="text-muted-foreground text-sm mt-2">
              cordially invites
            </p>
            <h3 className="text-lg font-medium mt-1">{invitation.guest.name}</h3>
          </div>
          
          <div className="space-y-5 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-wedding-gold/10 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-wedding-gold" />
              </div>
              <div>
                <p className="font-medium">Date</p>
                <p className="text-sm text-muted-foreground">{formattedDate}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-wedding-gold/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-wedding-gold" />
              </div>
              <div>
                <p className="font-medium">Time</p>
                <p className="text-sm text-muted-foreground">{formattedTime}</p>
              </div>
            </div>
            
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
                <Mail className="w-5 h-5 text-wedding-gold" />
              </div>
              <div>
                <p className="font-medium">Contact Email</p>
                <p className="text-sm text-muted-foreground truncate max-w-[230px]">
                  {invitation.guest.email}
                </p>
              </div>
            </div>
            
            {invitation.guest.phone && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-wedding-gold/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-wedding-gold" />
                </div>
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">
                    {invitation.guest.phone}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {rsvpStatus ? (
            <div className="text-center">
              <div className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-semibold mb-4 ${
                rsvpStatus === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {rsvpStatus === 'accepted' ? 'You have accepted' : 'You have declined'}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Thank you for your response
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setRsvpStatus(null)}
              >
                Change Response
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-sm">
                Please confirm your attendance:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className="bg-wedding-gold hover:bg-wedding-gold/90 text-black"
                  onClick={() => handleRSVP('accepted')}
                >
                  Accept
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleRSVP('declined')}
                >
                  Decline
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationPage;
