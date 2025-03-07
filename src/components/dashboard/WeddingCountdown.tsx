
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Heart } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface WeddingCountdownProps {
  weddingDate?: string; // ISO date string
  onDateChange?: (date: string) => void;
}

const WeddingCountdown = ({ 
  weddingDate = "2024-12-31", 
  onDateChange 
}: WeddingCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [date, setDate] = useState<Date | undefined>(new Date(weddingDate));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Calculate time left
    const calculateTimeLeft = () => {
      const difference = new Date(weddingDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    // Initial calculation
    calculateTimeLeft();
    
    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [weddingDate]);

  useEffect(() => {
    // Update the date state when weddingDate prop changes
    setDate(new Date(weddingDate));
  }, [weddingDate]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    
    setDate(newDate);
    
    // Format the date as ISO string and call the onDateChange callback
    const isoDate = newDate.toISOString().split('T')[0];
    if (onDateChange) {
      onDateChange(isoDate);
    }
    
    // Close the date picker
    setIsEditing(false);
  };

  // Get the name of the month for display
  const weddingMonth = date ? format(date, "MMMM") : "";
  // Get the day of the month for display
  const weddingDay = date ? format(date, "d") : "";
  // Get the year for display
  const weddingYear = date ? format(date, "yyyy") : "";

  return (
    <Card className="overflow-hidden relative border-0 shadow-lg bg-gradient-to-tr from-background via-background to-background/90">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAwIDEwMHY1MHYtNTBoNTBoLTUweiIgc3Ryb2tlPSJoc2woMzIgNDAlIDUwJSAvIDAuMDUpIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] opacity-10" />
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-wedding-gold/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-wedding-burgundy/5 rounded-full blur-3xl" />
      
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Left column: Date display */}
          <div className="bg-gradient-to-br from-wedding-gold/10 via-wedding-gold/5 to-transparent p-8 flex flex-col items-center justify-center text-center border-r border-wedding-gold/10">
            <div className="text-5xl font-serif font-light text-wedding-gold mb-2">{weddingMonth}</div>
            <div className="text-8xl font-serif font-bold bg-gradient-to-br from-wedding-gold to-wedding-burgundy/80 bg-clip-text text-transparent">{weddingDay}</div>
            <div className="text-3xl font-serif text-muted-foreground mt-1">{weddingYear}</div>
            
            <Popover open={isEditing} onOpenChange={setIsEditing}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-4 text-xs text-primary hover:bg-primary/5 hover:text-primary gap-2 group"
                >
                  <CalendarIcon className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                  Edit Date
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                  disabled={(calendarDate) => calendarDate < new Date()}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Right column: Countdown */}
          <div className="col-span-1 md:col-span-2 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-5 h-5 text-wedding-burgundy/70 animate-pulse-soft" />
              <h3 className="text-2xl md:text-3xl font-serif">
                <span className="bg-gradient-to-r from-wedding-gold to-wedding-burgundy/80 bg-clip-text text-transparent">Your Special Day</span>
              </h3>
            </div>
            
            <div className="grid grid-cols-4 gap-4 max-w-xl">
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="flex flex-col items-center">
                  <div className="w-full aspect-square relative rounded-xl overflow-hidden group">
                    {/* Background layers */}
                    <div className="absolute inset-0 bg-gradient-to-br from-wedding-gold/5 to-transparent opacity-70"></div>
                    <div className="absolute inset-0 border border-wedding-gold/10 rounded-xl"></div>
                    
                    {/* Number display */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                        {value}
                      </span>
                    </div>
                  </div>
                  <span className="mt-2 text-sm md:text-base text-muted-foreground capitalize">
                    {unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeddingCountdown;
