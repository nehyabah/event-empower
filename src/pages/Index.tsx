
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import Footer from "@/components/home/Footer";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  console.log("Index page rendered, checking auth state");
  
  // Check authentication state and redirect if needed
  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication state");
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        console.log("User is authenticated, checking user type");
        setIsAuthenticated(true);
        // User is authenticated, get their user type
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.session.user.id)
          .single();
          
        if (profileData) {
          console.log("User type:", profileData.user_type);
          // Redirect based on user type
          if (profileData.user_type === "vendor") {
            navigate("/vendor-home");
          } else if (profileData.user_type === "planner") {
            navigate("/planner-home");
          } else {
            navigate("/home");
          }
        }
      } else {
        console.log("User is not authenticated, showing landing page");
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, updating state");
        setIsAuthenticated(false);
      } else if (session) {
        console.log("User signed in, updating state");
        setIsAuthenticated(true);
        checkAuth(); // Re-check to handle redirects
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Only render the landing page if the user is not authenticated
  if (isAuthenticated === false) {
    console.log("Rendering landing page");
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Hero />
          <Features />
          <HowItWorks />
          <Testimonials />
        </main>
        <Footer />
      </div>
    );
  }

  // This should never render as authenticated users are redirected
  console.log("Authenticated user not redirected yet, showing loading");
  return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
};

export default Index;
