
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface WeddingCountdownProps {
  weddingDate?: string; // ISO date string
}

const WeddingCountdown = ({ weddingDate = "2024-12-31" }: WeddingCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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

  return (
    <Card className="border-2 border-wedding-gold/30 shadow-elegant overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-wedding-gold/10 to-transparent rounded-full blur-xl" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-wedding-burgundy/10 to-transparent rounded-full blur-xl" />
      
      <CardContent className="p-8 relative z-10">
        <h3 className="text-2xl md:text-3xl font-serif text-center mb-8">
          <span className="text-gradient">Your Special Day</span> is Coming
        </h3>
        
        <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="flex flex-col items-center">
              <div className="w-full aspect-square bg-gradient-to-br from-background to-background/80 rounded-xl flex items-center justify-center border border-wedding-gold/20 shadow-elegant">
                <span className="text-2xl md:text-4xl font-bold">{value}</span>
              </div>
              <span className="mt-2 text-sm md:text-base text-muted-foreground capitalize">
                {unit}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeddingCountdown;
