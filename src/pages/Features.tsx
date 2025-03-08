
import Navbar from "@/components/layout/Navbar";
import Features from "@/components/home/Features";
import Footer from "@/components/home/Footer";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";
import { format } from "date-fns";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FeaturesPage = () => {
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 flex-grow">
        <div className="container max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif mb-6 font-medium tracking-tight">
              Elegant <span className="text-gradient">Features</span> for Your Dream Wedding
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Discover how Planr makes planning your wedding simpler, 
              more organized, and beautiful with our thoughtfully designed features.
            </p>
            
            {/* Wedding Date Display and Edit */}
            <div className="flex flex-col items-center mt-6 mb-4">
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
            
            <div className="mt-8">
              <AuthModal 
                defaultTab="register" 
                trigger={
                  <Button className="button-hover group">
                    Start Planning <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                }
              />
            </div>
          </div>
        </div>
        <Features />
      </div>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
