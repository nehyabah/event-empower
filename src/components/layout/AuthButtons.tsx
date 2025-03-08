
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface AuthButtonsProps {
  isAuthenticated: boolean;
  isMobile?: boolean;
}

const AuthButtons = ({ isAuthenticated, isMobile = false }: AuthButtonsProps) => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);
  
  useEffect(() => {
    const getUserType = async () => {
      if (isAuthenticated) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .single();
          
          if (data) {
            setUserType(data.user_type);
          }
        }
      }
    };
    
    getUserType();
  }, [isAuthenticated]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "You've been logged out",
        description: "Hope to see you again soon!",
        variant: "default",
      });
      // Force a full page reload to the root URL to ensure proper rendering
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={isMobile ? "flex flex-col gap-2" : "hidden md:flex items-center gap-4"}>
        <AuthModal 
          defaultTab="login" 
          trigger={
            <Button variant="outline" className={isMobile ? "w-full justify-start" : "button-hover"}>
              Log in
            </Button>
          }
        />
        <AuthModal 
          defaultTab="register" 
          trigger={
            <Button className={isMobile ? "w-full justify-start" : "button-hover"}>
              Get Started
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className={isMobile ? "flex flex-col gap-2" : "hidden md:flex items-center gap-4"}>
      <Button 
        variant="outline" 
        className={isMobile ? "w-full justify-start" : "flex items-center gap-2"} 
        onClick={handleLogout}
      >
        <LogOut className={isMobile ? "mr-2 h-4 w-4" : "h-4 w-4"} />
        Log out
      </Button>
    </div>
  );
};

export default AuthButtons;
