
import { useState } from "react";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";
import { Heart, CheckCircle2, ArrowRight, Calendar } from "lucide-react";
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
  const [date, setDate] = useState<Date | undefined>(
    localStorage.getItem("weddingDate") 
      ? new Date(localStorage.getItem("weddingDate") as string)
      : new Date(new Date().setMonth(new Date().getMonth() + 6))
  );
  
  const [isEditing, setIsEditing] = useState(false);
  
  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    
    setDate(newDate);
    
    const isoDate = newDate.toISOString().split('T')[0];
    localStorage.setItem("weddingDate", isoDate);
    
    toast.success("Wedding date updated successfully!");
    
    setIsEditing(false);
  };
  
  const formattedDate = date ? format(date, "MMMM d, yyyy") : "";
  
  return (
    <section className="relative pt-24 md:pt-28 pb-20 overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <video 
          className="w-full h-full object-cover"
          autoPlay 
          muted 
          loop 
          playsInline
        >
          <source src="https://res.cloudinary.com/dfjv35kht/video/upload/v1741438100/8775884-hd_1920_1080_25fps_mjcobz.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      <div className="container relative z-20">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
          {/* Badge with subtle animation */}
          <span className="inline-flex items-center px-4 py-1.5 text-sm font-medium bg-white/20 backdrop-blur-sm text-white rounded-full animate-fade-in-up shadow-sm">
            <Heart className="w-4 h-4 mr-2" />
            <span>Your Dream Wedding Awaits</span>
          </span>
          
          {/* Main heading with improved text gradient */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight animate-fade-in-up text-white" style={{ animationDelay: "100ms" }}>
            Plan Your Perfect <span className="relative z-10">
              <span className="text-wedding-gold">Wedding</span>
              <svg className="absolute -bottom-2 md:-bottom-3 left-0 w-full h-[6px] text-wedding-gold/40" viewBox="0 0 100 8" preserveAspectRatio="none">
                <path d="M0,5 C30,2 70,2 100,5 L100,8 L0,8 Z" fill="currentColor" />
              </svg>
            </span>
          </h1>
          
          {/* Subtitle with better readability */}
          <p className="text-lg md:text-xl text-white/90 max-w-2xl animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            Your all-in-one platform for planning beautiful weddings.
            Connect with local vendors, manage tasks, and create unforgettable celebrations.
          </p>
          
          {/* Wedding date selector with improved UI */}
          <div className="flex flex-col items-center animate-fade-in-up bg-black/30 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10" style={{ animationDelay: "250ms" }}>
            <Popover open={isEditing} onOpenChange={setIsEditing}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-wedding-gold" />
                <span className="text-lg font-medium text-white">{formattedDate}</span>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-wedding-gold hover:bg-white/10 hover:text-wedding-gold gap-1 p-1 h-auto"
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
                  className={cn("p-3")}
                />
              </PopoverContent>
            </Popover>
            <p className="text-sm text-white/70">Set your wedding date</p>
          </div>
          
          {/* Call-to-action buttons with improved styling */}
          <div className="flex flex-wrap justify-center gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <AuthModal 
              defaultTab="register" 
              triggerClassName="px-7 py-3 shadow-elegant text-base font-medium group"
              trigger={
                <Button 
                  className="px-7 py-6 shadow-elegant text-base font-medium group bg-gradient-to-r from-wedding-gold to-wedding-burgundy/90 hover:from-wedding-burgundy/90 hover:to-wedding-gold text-white border-none transition-all duration-300"
                >
                  Get Started 
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              }
            />
            <Link to="/features">
              <Button 
                variant="outline" 
                className="px-7 py-6 button-hover text-base font-medium border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                Explore Features
              </Button>
            </Link>
          </div>
          
          {/* Feature highlights with improved spacing and icons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 pt-6 text-sm text-white/80 animate-fade-in-up mt-2" style={{ animationDelay: "400ms" }}>
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
        </div>
      </div>
    </section>
  );
};

export default Hero;
