import NavLink from "./NavLink";
import { useAuth } from "@/context/AuthContext";

interface DesktopNavProps {
  isAuthenticated: boolean;
}

const DesktopNav = ({ isAuthenticated }: DesktopNavProps) => {
  const { user } = useAuth();

  const isVendor = user?.userType === "vendor";
  const isPlanner = user?.userType === "planner";

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
