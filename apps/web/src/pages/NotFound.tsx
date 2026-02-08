
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Construction, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/50">
      <div className="text-center px-6 py-12 max-w-md mx-auto glass rounded-xl animate-fade-in">
        <div className="flex justify-center mb-6">
          <Construction 
            size={64} 
            className={cn(
              "text-primary animate-pulse-soft",
              "drop-shadow-md"
            )} 
          />
        </div>
        
        <h1 className="text-4xl font-bold mb-2 text-gradient">Under Construction</h1>
        <p className="text-xl text-foreground/80 mb-6">
          We're working on building something amazing here!
        </p>
        
        <div className="text-muted-foreground mb-8 pb-4 border-b border-border/50">
          <p className="text-sm">The page <span className="font-mono bg-secondary/70 px-2 py-1 rounded">{location.pathname}</span> is not available yet.</p>
        </div>
        
        <Button asChild variant="default" className="button-hover gap-2">
          <a href="/">
            <ArrowLeft size={18} />
            <span>Return to Home</span>
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
