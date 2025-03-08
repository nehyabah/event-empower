
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "@/services/authService";
import { toast } from "@/hooks/use-toast";

interface AuthButtonsProps {
  isAuthenticated: boolean;
  isMobile?: boolean;
}

const AuthButtons = ({ isAuthenticated, isMobile = false }: AuthButtonsProps) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logoutUser();
    toast({
      title: "You've been logged out",
      description: "Hope to see you again soon!",
      variant: "default",
    });
    navigate("/");
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
