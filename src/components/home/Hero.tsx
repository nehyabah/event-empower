
import { useState } from "react";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";
import { ArrowRight, Compass, Calendar, Users, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <>
      {/* Video Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <div className="absolute inset-0 bg-black/60 z-10"></div>
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
        
        <div className="container relative z-20 h-full flex items-center justify-center">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
            {/* Main heading with clean design */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium tracking-tight text-white">
              Plan Your Perfect <span className="text-wedding-gold relative">
                Wedding
                <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-wedding-gold"></span>
              </span>
            </h1>
            
            {/* Call-to-action buttons with improved styling */}
            <div className="flex flex-wrap justify-center gap-4 pt-6">
              <AuthModal 
                defaultTab="register" 
                triggerClassName="px-7 py-3 shadow-elegant text-base font-medium group"
                trigger={
                  <Button 
                    className="px-7 py-6 shadow-md text-base font-medium group bg-wedding-gold hover:bg-wedding-gold/90 text-white border-none transition-all duration-300"
                  >
                    Get Started 
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                }
              />
              <Link to="/features">
                <Button 
                  variant="outline" 
                  className="px-7 py-6 text-base font-medium bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  Explore Features
                  <Compass className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section After Video */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-sm font-medium bg-wedding-gold/10 text-wedding-gold rounded-full mb-4">
              Your Dream Wedding Awaits
            </span>
          </div>

          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Your all-in-one platform for planning beautiful weddings. Connect with local
              vendors, manage tasks, and create unforgettable celebrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-wedding-gold/10 text-wedding-gold flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium mb-2">Local vendor directory</h3>
              <p className="text-muted-foreground">Connect with trusted vendors who understand your vision.</p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-wedding-burgundy/10 text-wedding-burgundy flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium mb-2">Wedding templates</h3>
              <p className="text-muted-foreground">Access templates for every part of your wedding journey.</p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-wedding-sage/10 text-wedding-sage flex items-center justify-center mb-4">
                <ListChecks className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium mb-2">Smart task management</h3>
              <p className="text-muted-foreground">Stay organized with customized planning checklists.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
