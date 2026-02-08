import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, Menu, X } from "lucide-react";
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';
import AuthButtons from './AuthButtons';
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
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
    setMobileMenuOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled || mobileMenuOpen ? "py-3 bg-background/95 backdrop-blur-lg shadow-elegant" : "py-5"
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
      </header>

      {/* Mobile Menu - rendered outside header for proper stacking */}
      <MobileNav
        isAuthenticated={isAuthenticated}
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
      />
    </>
  );
};

export default Navbar;
