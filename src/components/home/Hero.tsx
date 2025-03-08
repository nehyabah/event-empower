
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
      {/* Decorative gradient elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-wedding-gold/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-wedding-sage/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-wedding-blush/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
      
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
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 pt-8 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <span className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-wedding-gold" />
              Local vendor directory
            </span>
            <span className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-wedding-gold" />
              Wedding templates
            </span>
            <span className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-wedding-gold" />
              Smart task management
            </span>
          </div>
          
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
        </div>
      </div>
    </section>
  );
};

export default Hero;
