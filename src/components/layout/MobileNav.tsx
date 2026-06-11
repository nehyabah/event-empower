import { Home, Calendar, Users, BookOpen, Filter, Briefcase, CheckSquare, MessageSquare } from "lucide-react";
import NavLink from "./NavLink";
import { useAuth } from "@/context/AuthContext";
import AuthButtons from "./AuthButtons";

interface MobileNavProps {
  isAuthenticated: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const MobileNav = ({ isAuthenticated, isOpen, onClose }: MobileNavProps) => {
  const { user } = useAuth();

  if (!isOpen) return null;

  const isVendor = user?.userType === "vendor";
  const isPlanner = user?.userType === "planner";

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="md:hidden fixed inset-0 bg-black/20 z-[60]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu panel */}
      <div className="md:hidden fixed top-[56px] left-0 right-0 bottom-0 z-[70] bg-background overflow-y-auto shadow-lg border-t border-border/50">
        <div className="container py-6 flex flex-col space-y-2">
          {!isAuthenticated && (
            <NavLink to="/" className="px-4 py-3 rounded-lg hover:bg-muted" showIcon icon={<Home className="w-5 h-5" />}>
              Home
            </NavLink>
          )}

          {!isAuthenticated ? (
            <>
              <NavLink to="/features" className="px-4 py-3 rounded-lg hover:bg-muted" showIcon icon={<Calendar className="w-5 h-5" />}>
                Features
              </NavLink>
              <NavLink to="/pricing" className="px-4 py-3 rounded-lg hover:bg-muted" showIcon icon={<Filter className="w-5 h-5" />}>
                Pricing
              </NavLink>
              <NavLink to="/vendors" className="px-4 py-3 rounded-lg hover:bg-muted" showIcon icon={<Users className="w-5 h-5" />}>
                Vendors
              </NavLink>
            </>
          ) : isVendor ? (
            <>
              <NavLink to="/vendor-home" className="px-4 py-3 rounded-lg hover:bg-muted" showIcon icon={<Home className="w-5 h-5" />}>
                Home
              </NavLink>
              <NavLink to="/vendor-analytics" className="px-4 py-3 rounded-lg hover:bg-muted" showIcon icon={<Briefcase className="w-5 h-5" />}>
                Analytics
              </NavLink>
              <NavLink to="/vendors" className="px-4 py-3 rounded-lg hover:bg-muted" showIcon icon={<Users className="w-5 h-5" />}>
                Marketplace
              </NavLink>
              <NavLink to="/vendor-profile" className="px-4 py-3 rounded-lg hover:bg-muted" showIcon icon={<Users className="w-5 h-5" />}>
                My Profile
              </NavLink>
            </>
          ) : isPlanner ? (
            <>
              <NavLink to="/planner-home" className="px-4 py-3 rounded-lg hover:bg-muted" showIcon icon={<Briefcase className="w-5 h-5" />}>
                Dashboard
              </NavLink>
              <NavLink to="/clients" className="px-4 py-3 rounded-lg hover:bg-muted" showIcon icon={<Users className="w-5 h-5" />}>
                Clients
              </NavLink>
              <NavLink to="/vendors" className="px-4 py-3 rounded-lg hover:bg-muted" showIcon icon={<Users className="w-5 h-5" />}>
                Vendors
              </NavLink>
              <NavLink to="/planner-tasks" className="px-4 py-3 rounded-lg hover:bg-muted" showIcon icon={<CheckSquare className="w-5 h-5" />}>
                Tasks
              </NavLink>
              <NavLink to="/planner-calendar" className="px-4 py-3 rounded-lg hover:bg-muted" showIcon icon={<Calendar className="w-5 h-5" />}>
                Calendar
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" className="px-4 py-3 rounded-lg hover:bg-muted" showIcon icon={<Calendar className="w-5 h-5" />}>
                IV & RSVP
              </NavLink>
              <NavLink to="/todo-lists" className="px-4 py-3 rounded-lg hover:bg-muted" showIcon icon={<CheckSquare className="w-5 h-5" />}>
                To-Do Lists
              </NavLink>
              <NavLink to="/expense-tracker" className="px-4 py-3 rounded-lg hover:bg-muted" showIcon icon={<Calendar className="w-5 h-5" />}>
                Expense Tracker
              </NavLink>
              <NavLink to="/vendors" className="px-4 py-3 rounded-lg hover:bg-muted" showIcon icon={<Users className="w-5 h-5" />}>
                Vendors
              </NavLink>
              <NavLink to="/my-inquiries" className="px-4 py-3 rounded-lg hover:bg-muted" showIcon icon={<MessageSquare className="w-5 h-5" />}>
                My Inquiries
              </NavLink>
              <NavLink to="/couple-story" className="px-4 py-3 rounded-lg hover:bg-muted" showIcon icon={<BookOpen className="w-5 h-5" />}>
                Our Story
              </NavLink>
            </>
          )}

          {/* Auth buttons at the bottom */}
          <div className="pt-6 mt-4 border-t border-border/50">
            <AuthButtons isAuthenticated={isAuthenticated} isMobile={true} />
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
