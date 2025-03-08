
import { Button } from "@/components/ui/button";
import AuthModal from '@/components/auth/AuthModal';
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HowItWorks = () => {
  return (
    <section className="py-28 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-wedding-gold/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-wedding-burgundy/10 rounded-full blur-3xl" />
      
      <div className="container relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="inline-block px-3 py-1 text-sm font-medium bg-wedding-burgundy/10 text-wedding-burgundy rounded-full mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-6 font-medium tracking-tight">
            Simple Steps to Your Perfect Day
          </h2>
          <p className="text-muted-foreground text-lg">
            Our seamless process helps you plan your dream celebration from start to finish.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24 relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-wedding-gold/0 via-wedding-gold/30 to-wedding-gold/0"></div>
          
          <div className="flex flex-col items-center text-center animate-fade-in-up relative">
            <div className="w-20 h-20 rounded-full bg-wedding-gold/10 text-wedding-gold flex items-center justify-center text-2xl font-medium mb-6 border border-wedding-gold/20 z-10 shadow-lg">
              1
            </div>
            <h3 className="text-2xl font-medium font-serif mb-4">Create Your Event</h3>
            <p className="text-muted-foreground">
              Sign up and create your celebration profile. Choose your region, ceremony type, and set your date.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="w-20 h-20 rounded-full bg-wedding-sage/10 text-wedding-sage flex items-center justify-center text-2xl font-medium mb-6 border border-wedding-sage/20 z-10 shadow-lg">
              2
            </div>
            <h3 className="text-2xl font-medium font-serif mb-4">Manage Tasks & Vendors</h3>
            <p className="text-muted-foreground">
              Use your personalized checklist to track progress and connect with local vendors in your region.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <div className="w-20 h-20 rounded-full bg-wedding-burgundy/10 text-wedding-burgundy flex items-center justify-center text-2xl font-medium mb-6 border border-wedding-burgundy/20 z-10 shadow-lg">
              3
            </div>
            <h3 className="text-2xl font-medium font-serif mb-4">Share & Celebrate</h3>
            <p className="text-muted-foreground">
              Create a beautiful countdown page to share with guests and keep everyone informed about your big day.
            </p>
          </div>
        </div>
        
        <div className="glass rounded-2xl p-12 md:p-16 relative overflow-hidden border border-white/5 shadow-elegant">
          {/* Decorative elements */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-wedding-gold/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-wedding-burgundy/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row gap-12 md:gap-16 items-center">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 text-sm font-medium bg-wedding-gold/10 text-wedding-gold rounded-full mb-4">
                Ready to Begin?
              </span>
              <h3 className="text-3xl md:text-4xl font-serif mb-6 font-medium tracking-tight">
                Start Planning Your Dream Celebration
              </h3>
              <p className="text-muted-foreground text-lg mb-8">
                Join thousands of couples who have planned successful ceremonies with Planr. Our platform understands local traditions, vendors, and timelines.
              </p>
              <div className="flex flex-wrap gap-4">
                <AuthModal 
                  defaultTab="register" 
                  triggerClassName="px-7 py-3 shadow-elegant text-base font-medium group"
                  trigger={
                    <Button className="px-7 py-3 shadow-elegant text-base font-medium group">
                      Start Planning Now
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  }
                />
                <Link to="/features">
                  <Button variant="outline" className="px-7 py-3 button-hover text-base font-medium">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="lg:flex-1 w-full max-w-md">
              <div className="aspect-square rounded-xl overflow-hidden shadow-elegant">
                <img 
                  src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=869&q=80" 
                  alt="Couple planning their celebration"
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

export default HowItWorks;
