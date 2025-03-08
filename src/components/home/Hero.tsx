
import { useState } from "react";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";
import { ArrowRight, Compass } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
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
            Plan Your Perfect <span className="text-wedding-gold">Wedding</span>
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
  );
};

export default Hero;
