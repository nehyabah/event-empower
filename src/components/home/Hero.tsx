
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";
import { Heart, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
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
              Nigerian Wedding
              <svg className="absolute -bottom-3 left-0 w-full h-2 text-wedding-gold/30" viewBox="0 0 100 8" preserveAspectRatio="none">
                <path d="M0,5 C30,2 70,2 100,5 L100,8 L0,8 Z" fill="currentColor" />
              </svg>
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            Your all-in-one platform for planning authentic Nigerian weddings.
            Connect with local vendors, manage tasks, and create unforgettable celebrations.
          </p>
          
          <div className="flex flex-wrap justify-center gap-5 pt-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <AuthModal 
              defaultTab="register" 
              triggerClassName="px-7 py-3 shadow-elegant text-base font-medium group"
              triggerContent={
                <>
                  Get Started 
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
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
              Cultural wedding templates
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
                  src="https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=85" 
                  alt="Nigerian wedding celebration"
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
