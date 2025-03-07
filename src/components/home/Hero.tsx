
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";
import { Heart, CheckCircle2 } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative pt-28 md:pt-36 pb-20 overflow-hidden">
      {/* Decorative gradient circles */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-wedding-gold/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-wedding-sage/10 rounded-full blur-3xl" />
      
      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full animate-fade-in">
            <Heart className="w-4 h-4 mr-1.5" />
            <span>Your Wedding, Perfectly Planned</span>
          </span>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight animate-fade-in-up">
            Effortlessly Plan Your Perfect <span className="text-gradient">Nigerian Wedding</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            Planr is your all-in-one platform for planning weddings and events in Nigeria.
            Find local vendors, manage tasks, and create memorable experiences.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <AuthModal 
              defaultTab="register" 
              triggerClassName="px-6 py-2.5 shadow-elegant"
            />
            <Button variant="outline" className="px-6 py-2.5 button-hover">
              Explore Features
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 pt-4 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: "450ms" }}>
            <span className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-wedding-gold" />
              Local vendor directory
            </span>
            <span className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-wedding-gold" />
              Cultural wedding templates
            </span>
            <span className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-wedding-gold" />
              Smart task management
            </span>
          </div>
          
          <div className="pt-12 w-full max-w-4xl opacity-90 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
            <div className="glass rounded-2xl p-4 md:p-6 shadow-elegant">
              <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-xl">
                <img 
                  src="https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80" 
                  alt="Nigerian wedding celebration"
                  className="w-full h-full object-cover"
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
