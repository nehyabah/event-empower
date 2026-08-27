import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Calendar,
  Briefcase,
  CheckSquare,
  LayoutDashboard,
  BookOpen,
  Store,
  UserCircle,
  LogOut,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
  ],
  planner: [
    { to: "/planner-home", label: "Home", icon: Briefcase },
    { to: "/clients", label: "Clients", icon: Users, alsoMatches: ["/clients/"] },
    { to: "/planner-tasks", label: "Tasks", icon: CheckSquare },
    { to: "/planner-calendar", label: "Calendar", icon: Calendar },
  ],
  vendor: [
    { to: "/vendor-home", label: "Home", icon: Home },
    { to: "/vendor-calendar", label: "Calendar", icon: Calendar },
    { to: "/vendor-analytics", label: "Stats", icon: Briefcase },
  ],
};

const PROFILE_PATH: Record<string, string> = {
  client: "/dashboard",
  planner: "/planner-profile",
  vendor: "/vendor-profile",
};

const BottomNav = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [accountOpen, setAccountOpen] = useState(false);

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

        {/* Account. Hiding the burger for signed-in users took sign-out with
            it — it lived in the mobile menu — so the bar has to carry it. */}
        <li className="flex-1">
          <button
            type="button"
            onClick={() => setAccountOpen(true)}
            className={cn(
              "flex w-full min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-1.5 transition-colors",
              accountOpen ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <UserCircle className="h-5 w-5" strokeWidth={1.8} />
            <span className="text-[10px] font-medium leading-none">Account</span>
          </button>
        </li>
      </ul>

      <Sheet open={accountOpen} onOpenChange={setAccountOpen}>
        <SheetContent side="bottom" className="rounded-t-xl">
          <SheetHeader className="text-left">
            <SheetTitle className="text-base">{user?.name || user?.email}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex flex-col gap-1">
            <Link
              to={PROFILE_PATH[user?.userType ?? "client"] ?? "/home"}
              onClick={() => setAccountOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-muted"
            >
              <UserCircle className="h-4 w-4" />
              My profile
            </Link>
            <button
              type="button"
              onClick={async () => {
                setAccountOpen(false);
                await logout();
                navigate("/", { replace: true });
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default BottomNav;
