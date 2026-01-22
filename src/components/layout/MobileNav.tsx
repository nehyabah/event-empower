import { Home, Calendar, Users, BookOpen, Filter, Briefcase, CheckSquare } from "lucide-react";
import NavLink from "./NavLink";
import { useAuth } from "@/context/AuthContext";

interface MobileNavProps {
  isAuthenticated: boolean;
  isOpen: boolean;
}

const MobileNav = ({ isAuthenticated, isOpen }: MobileNavProps) => {
  const { user } = useAuth();

  if (!isOpen) return null;

  const isVendor = user?.userType === "vendor";
  const isPlanner = user?.userType === "planner";

  return (
    <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-elegant animate-fade-in-down">
      <div className="container py-4 flex flex-col space-y-4">
        <NavLink to="/" className="px-4 py-2" showIcon icon={<Home className="w-5 h-5" />}>
          Home
        </NavLink>

        {!isAuthenticated ? (
          <>
            <NavLink to="/features" className="px-4 py-2" showIcon icon={<Calendar className="w-5 h-5" />}>
              Features
            </NavLink>
            <NavLink to="/pricing" className="px-4 py-2" showIcon icon={<Filter className="w-5 h-5" />}>
              Pricing
            </NavLink>
            <NavLink to="/vendors" className="px-4 py-2" showIcon icon={<Users className="w-5 h-5" />}>
              Vendors
            </NavLink>
          </>
        ) : isVendor ? (
          <>
            <NavLink to="/vendor-home" className="px-4 py-2" showIcon icon={<Briefcase className="w-5 h-5" />}>
              Dashboard
            </NavLink>
            <NavLink to="/vendors" className="px-4 py-2" showIcon icon={<Users className="w-5 h-5" />}>
              Marketplace
            </NavLink>
            <NavLink to="/vendor-profile" className="px-4 py-2" showIcon icon={<Users className="w-5 h-5" />}>
              My Profile
            </NavLink>
          </>
        ) : isPlanner ? (
          <>
            <NavLink to="/planner-home" className="px-4 py-2" showIcon icon={<Briefcase className="w-5 h-5" />}>
              Dashboard
            </NavLink>
            <NavLink to="/clients" className="px-4 py-2" showIcon icon={<Users className="w-5 h-5" />}>
              Clients
            </NavLink>
            <NavLink to="/vendors" className="px-4 py-2" showIcon icon={<Users className="w-5 h-5" />}>
              Vendors
            </NavLink>
            <NavLink to="/planner-tasks" className="px-4 py-2" showIcon icon={<CheckSquare className="w-5 h-5" />}>
              Tasks
            </NavLink>
            <NavLink to="/planner-calendar" className="px-4 py-2" showIcon icon={<Calendar className="w-5 h-5" />}>
              Calendar
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard" className="px-4 py-2" showIcon icon={<Calendar className="w-5 h-5" />}>
              Dashboard
            </NavLink>
            <NavLink to="/todo-lists" className="px-4 py-2" showIcon icon={<Calendar className="w-5 h-5" />}>
              To-Do Lists
            </NavLink>
            <NavLink to="/expense-tracker" className="px-4 py-2" showIcon icon={<Calendar className="w-5 h-5" />}>
              Expenses
            </NavLink>
            <NavLink to="/vendors" className="px-4 py-2" showIcon icon={<Users className="w-5 h-5" />}>
              Vendors
            </NavLink>
            <NavLink to="/couple-story" className="px-4 py-2" showIcon icon={<BookOpen className="w-5 h-5" />}>
              Our Story
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileNav;
