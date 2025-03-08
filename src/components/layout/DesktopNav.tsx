
import NavLink from "./NavLink";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DesktopNavProps {
  isAuthenticated: boolean;
}

const DesktopNav = ({ isAuthenticated }: DesktopNavProps) => {
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
  
  const isVendor = userType === "vendor";
  const isPlanner = userType === "planner";

  return (
    <nav className="hidden md:flex items-center space-x-1">
      <NavLink to="/">Home</NavLink>
      
      {!isAuthenticated ? (
        <>
          <NavLink to="/features">Features</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
          <NavLink to="/vendors">Vendors</NavLink>
        </>
      ) : isVendor ? (
        <>
          <NavLink to="/vendor-home">Dashboard</NavLink>
          <NavLink to="/vendors">Marketplace</NavLink>
          <NavLink to="/vendor-profile">My Profile</NavLink>
        </>
      ) : isPlanner ? (
        <>
          <NavLink to="/planner-home">Dashboard</NavLink>
          <NavLink to="/clients">Clients</NavLink>
          <NavLink to="/vendors">Vendors</NavLink>
          <NavLink to="/planner-tasks">Tasks</NavLink>
          <NavLink to="/planner-calendar">Calendar</NavLink>
        </>
      ) : (
        <>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/todo-lists">To-Do Lists</NavLink>
          <NavLink to="/expense-tracker">Expenses</NavLink>
          <NavLink to="/vendors">Vendors</NavLink>
          <NavLink to="/couple-story">Our Story</NavLink>
        </>
      )}
    </nav>
  );
};

export default DesktopNav;
