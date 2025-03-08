
import { useState } from "react";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";
import { Heart, CheckCircle2, ArrowRight, Calendar, Camera, Music, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Hero = () => {
  // Get the wedding date from localStorage or use default date
  const [date, setDate] = useState<Date | undefined>(
    localStorage.getItem("weddingDate") 
      ? new Date(localStorage.getItem("weddingDate") as string)
      : new Date(new Date().setMonth(new Date().getMonth() + 6))
  );
  
  const [isEditing, setIsEditing] = useState(false);
  
  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    
    setDate(newDate);
    
    // Format the date as ISO string and store in localStorage
    const isoDate = newDate.toISOString().split('T')[0];
    localStorage.setItem("weddingDate", isoDate);
    
    // Show success message
    toast.success("Wedding date updated successfully!");
    
    // Close the date picker
    setIsEditing(false);
  };
  
  const formattedDate = date ? format(date, "MMMM d, yyyy") : "";
  
  return (
    <section className="relative pt-28 md:pt-36 pb-24 overflow-hidden">
      {/* Enhanced decorative gradient elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-wedding-gold/20 to-transparent rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute -bottom-10 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-wedding-sage/20 to-transparent rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-wedding-blush/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-wedding-navy/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "3s" }} />
      <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-wedding-burgundy/5 rounded-full blur-2xl animate-float" />
      
      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
          <span className="inline-flex items-center px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary rounded-full animate-fade-in-up">
            <Heart className="w-4 h-4 mr-2" />
            <span>Your Dream Wedding Awaits</span>
          </span>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-medium tracking-tight animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            Plan Your Perfect <span className="text-gradient relative">
              Wedding
              <svg className="absolute -bottom-3 left-0 w-full h-2 text-wedding-gold/30" viewBox="0 0 100 8" preserveAspectRatio="none">
                <path d="M0,5 C30,2 70,2 100,5 L100,8 L0,8 Z" fill="currentColor" />
              </svg>
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            Your all-in-one platform for planning beautiful weddings.
            Connect with local vendors, manage tasks, and create unforgettable celebrations.
          </p>
          
          {/* Wedding Date Display and Edit */}
          <div className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            <Popover open={isEditing} onOpenChange={setIsEditing}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-wedding-gold" />
                <span className="text-lg font-medium">{formattedDate}</span>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-primary hover:bg-primary/5 hover:text-primary gap-1 p-1 h-auto"
                  >
                    Edit
                  </Button>
                </PopoverTrigger>
              </div>
              <PopoverContent className="w-auto p-0" align="center">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                  disabled={(calendarDate) => calendarDate < new Date()}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <p className="text-sm text-muted-foreground">Set your wedding date</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-5 pt-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <AuthModal 
              defaultTab="register" 
              triggerClassName="px-7 py-3 shadow-elegant text-base font-medium group"
              trigger={
                <Button className="px-7 py-3 shadow-elegant text-base font-medium group">
                  Get Started 
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              }
            />
            <Link to="/features">
              <Button variant="outline" className="px-7 py-3 button-hover text-base font-medium">
                Explore Features
              </Button>
            </Link>
          </div>
          
          {/* Enhanced feature highlights with icons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 pt-8 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <span className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-wedding-gold" />
              Local vendors
            </span>
            <span className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-wedding-gold" />
              Event templates
            </span>
            <span className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-wedding-gold" />
              Task management
            </span>
            <span className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-wedding-gold" />
              Budget tracking
            </span>
          </div>
          
          {/* Image gallery section */}
          <div className="pt-14 w-full max-w-5xl animate-fade-in-up" style={{ animationDelay: "500ms" }}>
            <div className="glass p-4 rounded-2xl shadow-elegant overflow-hidden">
              <div className="aspect-[16/7] overflow-hidden rounded-xl">
                <img 
                  src="https://res.cloudinary.com/dfjv35kht/image/upload/v1741387649/pexels-ashleyrae-697740_osqcbb.jpg" 
                  alt="Wedding celebration"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
          
          {/* Expanded photo gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl pt-4 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
            <div className="glass rounded-xl overflow-hidden shadow-elegant group">
              <div className="aspect-square overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Wedding rings"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 text-white">
                    <div className="flex items-center">
                      <Camera className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Photo Gallery</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass rounded-xl overflow-hidden shadow-elegant group">
              <div className="aspect-square overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1549985908-20f6d9d4356e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Wedding reception"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 text-white">
                    <div className="flex items-center">
                      <Music className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Event Planning</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass rounded-xl overflow-hidden shadow-elegant group">
              <div className="aspect-square overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1550005809-91ad75fb315f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Wedding couple"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 text-white">
                    <div className="flex items-center">
                      <Gift className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Gift Registry</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Animated floating elements */}
          <div className="w-full max-w-5xl relative h-24 mt-8 overflow-hidden animate-fade-in-up" style={{ animationDelay: "700ms" }}>
            <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-wedding-gold/10 border border-wedding-gold/20 shadow-lg animate-float" style={{ animationDelay: "0s" }}>
              <div className="absolute inset-0 flex items-center justify-center text-wedding-gold">
                <Heart className="w-8 h-8" />
              </div>
            </div>
            
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-wedding-burgundy/10 border border-wedding-burgundy/20 shadow-lg animate-float" style={{ animationDelay: "1.5s" }}>
              <div className="absolute inset-0 flex items-center justify-center text-wedding-burgundy">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            
            <div className="absolute top-1/2 left-3/4 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-wedding-sage/10 border border-wedding-sage/20 shadow-lg animate-float" style={{ animationDelay: "3s" }}>
              <div className="absolute inset-0 flex items-center justify-center text-wedding-sage">
                <Gift className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
