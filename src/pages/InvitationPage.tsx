
import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, CalendarIcon, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const InvitationPage = () => {
  const location = useLocation();
  const { code } = useParams();
  const queryParams = new URLSearchParams(location.search);
  
  // Extract guest details from URL if available
  const guestNameFromURL = queryParams.get("name") || "";
  const guestEmailFromURL = queryParams.get("email") || "";
  
  const [name, setName] = useState(guestNameFromURL);
  const [email, setEmail] = useState(guestEmailFromURL);
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  
  // Get the wedding date from localStorage (fallback to a future date if not set)
  const weddingDate = localStorage.getItem("weddingDate") || "2024-12-31";
  const parsedDate = new Date(weddingDate);
  const formattedDate = format(parsedDate, "EEEE, MMMM d, yyyy");
  const formattedTime = format(parsedDate, "h:mm a");
  
  // Extract couple name from localStorage or use fallback
  const userEmail = localStorage.getItem("userEmail") || "user@example.com";
  const firstName = userEmail.split('@')[0].split('.')[0];
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  const coupleName = `${capitalizedName} & Partner`;
  
  // Check if an invitation code was provided
  useEffect(() => {
    if (code) {
      // In a real app, you would fetch guest details from a database using this code
      console.log("Invitation code:", code);
      toast.info("Loading invitation details...");
    }
  }, [code]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast.error("Please fill in required fields");
      return;
    }
    
    if (attending === null) {
      toast.error("Please indicate whether you'll be attending");
      return;
    }
    
    // Create a new guest entry
    const guest = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      status: attending ? 'confirmed' : 'declined',
      group: 'RSVP'
    };
    
    // Add to guest list in localStorage
    const existingGuests = localStorage.getItem("weddingGuests");
    const guestList = existingGuests ? JSON.parse(existingGuests) : [];
    
    // Check if guest already exists (by email) and update rather than adding duplicate
    const existingGuestIndex = guestList.findIndex((g: any) => g.email === email);
    if (existingGuestIndex >= 0) {
      guestList[existingGuestIndex] = guest;
    } else {
      guestList.push(guest);
    }
    
    localStorage.setItem("weddingGuests", JSON.stringify(guestList));
    
    // Show success message
    toast.success(`Thank you for your response!`);
    setSubmitted(true);
  };
  
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-wedding-gold/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-wedding-burgundy/10 to-transparent rounded-full blur-3xl" />
        
        <Card className="w-full max-w-md border border-wedding-gold/20 shadow-lg relative overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="my-8">
              <Heart className="w-14 h-14 text-wedding-burgundy mx-auto mb-4" />
              <h1 className="text-2xl font-serif mb-4">Thank You!</h1>
              <p className="mb-6">
                Your response has been recorded. We look forward to celebrating with you!
              </p>
              <Button asChild>
                <Link to="/">Return Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-wedding-gold/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-wedding-burgundy/10 to-transparent rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md border border-wedding-gold/20 shadow-lg relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-wedding-gold/5 rounded-full blur-3xl" />
        
        <CardHeader className="text-center border-b border-border/10 pb-6">
          <div className="flex items-center justify-center mb-2">
            <Heart className="w-6 h-6 text-wedding-burgundy animate-pulse-soft" />
          </div>
          <CardTitle className="font-serif text-2xl">{coupleName}</CardTitle>
          <p className="text-muted-foreground text-sm mt-1">Request the pleasure of your company at their wedding</p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
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
                <p className="text-sm text-muted-foreground">Sunset Gardens Resort</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
              />
            </div>
            
            <div className="space-y-2 pt-2">
              <Label>Will you be attending?</Label>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  type="button"
                  variant={attending === true ? "default" : "outline"}
                  className={attending === true ? "bg-wedding-gold hover:bg-wedding-gold/90 text-black" : ""}
                  onClick={() => setAttending(true)}
                >
                  Happily Accept
                </Button>
                <Button
                  type="button"
                  variant={attending === false ? "default" : "outline"}
                  className={attending === false ? "bg-wedding-burgundy hover:bg-wedding-burgundy/90" : ""}
                  onClick={() => setAttending(false)}
                >
                  Regretfully Decline
                </Button>
              </div>
            </div>
            
            <Button type="submit" className="w-full mt-6">
              Submit RSVP
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationPage;
