import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Calendar,
  Briefcase,
  CheckSquare,
  LayoutDashboard,
  BookOpen,
  Store,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

/**
 * App-style bottom navigation for signed-in users on small screens.
 *
 * A burger menu hides the whole product behind a tap and a read; a fixed bar
 * keeps the four or five places people actually go one thumb-stretch away, at
 * the bottom of the screen where the thumb already is.
 *
 * Signed-out visitors keep the burger: marketing pages are a browsing flow, not
 * an app, and the links there change with scroll position.
 */

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  /** Extra paths that should light this tab up. */
  alsoMatches?: string[];
}

const ITEMS: Record<string, NavItem[]> = {
  client: [
    { to: "/home", label: "Home", icon: Home },
    { to: "/dashboard", label: "Invites", icon: Calendar },
    { to: "/workspace", label: "Plan", icon: LayoutDashboard },
    { to: "/vendors", label: "Vendors", icon: Store },
    { to: "/couple-story", label: "Story", icon: BookOpen },
  ],
  planner: [
    { to: "/planner-home", label: "Home", icon: Briefcase },
    { to: "/clients", label: "Clients", icon: Users, alsoMatches: ["/clients/"] },
    { to: "/planner-tasks", label: "Tasks", icon: CheckSquare },
    { to: "/planner-calendar", label: "Calendar", icon: Calendar },
    { to: "/vendors", label: "Vendors", icon: Store },
  ],
  vendor: [
    { to: "/vendor-home", label: "Home", icon: Home },
    { to: "/vendor-calendar", label: "Calendar", icon: Calendar },
    { to: "/vendor-analytics", label: "Stats", icon: Briefcase },
    { to: "/vendor-profile", label: "Profile", icon: Users },
  ],
};

const BottomNav = () => {
  const { isAuthenticated, user } = useAuth();
  const { pathname } = useLocation();

  const items = user?.userType ? ITEMS[user.userType] : undefined;
  // Admin has its own layout and navigation.
  const visible = Boolean(isAuthenticated && items) && !pathname.startsWith("/admin");

  // The bar is fixed, so it sits over whatever is at the foot of the page —
  // usually a submit button. A class on <body> lets one CSS rule reserve the
  // space, rather than every page remembering to add padding.
  useEffect(() => {
    document.body.classList.toggle("has-bottom-nav", visible);
    return () => document.body.classList.remove("has-bottom-nav");
  }, [visible]);

  if (!visible || !items) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t bg-background/95 backdrop-blur-lg"
      // Keeps the bar clear of the iOS home indicator.
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Main"
    >
      <ul className="flex">
        {items.map(({ to, label, icon: Icon, alsoMatches }) => {
          const active =
            pathname === to || (alsoMatches ?? []).some((p) => pathname.startsWith(p));
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                // min-h-14 keeps every target above the 44px touch guideline.
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-1.5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
