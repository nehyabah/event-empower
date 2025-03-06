
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Heart, Users, Home, Menu, X } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const NavLink = ({ to, children, className, onClick }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "relative px-3 py-2 text-sm font-medium transition-colors",
        isActive 
          ? "text-primary"
          : "text-foreground/80 hover:text-foreground",
        className
      )}
      onClick={onClick}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-fade-in" />
      )}
    </Link>
  );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
          <span className="font-serif text-xl font-medium">EventEmpower</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/features">Features</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
          <NavLink to="/vendors">Vendors</NavLink>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <AuthModal 
            defaultTab="login" 
            trigger={
              <Button variant="ghost" className="button-hover">
                Log in
              </Button>
            }
          />
          <AuthModal 
            defaultTab="register" 
            trigger={
              <Button className="button-hover">
                Get Started
              </Button>
            }
          />
        </div>

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
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-elegant animate-fade-in-down">
          <div className="container py-4 flex flex-col space-y-4">
            <NavLink to="/" className="px-4 py-2" onClick={() => setMobileMenuOpen(false)}>
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5" />
                <span>Home</span>
              </div>
            </NavLink>
            <NavLink to="/features" className="px-4 py-2" onClick={() => setMobileMenuOpen(false)}>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5" />
                <span>Features</span>
              </div>
            </NavLink>
            <NavLink to="/pricing" className="px-4 py-2" onClick={() => setMobileMenuOpen(false)}>
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5" />
                <span>Pricing</span>
              </div>
            </NavLink>
            <NavLink to="/vendors" className="px-4 py-2" onClick={() => setMobileMenuOpen(false)}>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span>Vendors</span>
              </div>
            </NavLink>
            <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
              <AuthModal 
                defaultTab="login" 
                trigger={
                  <Button variant="ghost" className="w-full justify-start">
                    Log in
                  </Button>
                }
              />
              <AuthModal 
                defaultTab="register" 
                trigger={
                  <Button className="w-full justify-start">
                    Get Started
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
