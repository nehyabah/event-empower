
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, Menu, X } from "lucide-react";
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';
import AuthButtons from './AuthButtons';
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Check auth status when component mounts
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "py-3 bg-background/80 backdrop-blur-lg shadow-elegant" : "py-5"
      )}
    >
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary animate-pulse-soft" />
          <span className="font-serif text-xl font-medium">Planr</span>
        </Link>

        {/* Desktop Navigation */}
        <DesktopNav isAuthenticated={isAuthenticated} />

        {/* Auth Buttons (Desktop) */}
        <AuthButtons isAuthenticated={isAuthenticated} />

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      <MobileNav isAuthenticated={isAuthenticated} isOpen={mobileMenuOpen} />
      
      {/* Auth Buttons (Mobile) */}
      {mobileMenuOpen && (
        <div className="md:hidden container py-2 pb-4 border-t border-border/50">
          <AuthButtons isAuthenticated={isAuthenticated} isMobile={true} />
        </div>
      )}
    </header>
  );
};

export default Navbar;
