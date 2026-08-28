import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BarChart3, Users, ClipboardCheck, Store, Inbox,
  LifeBuoy, ShieldAlert, Megaphone, Mail, ScrollText,
  ArrowLeft, LogOut, Menu, Flag,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Grouped so the sidebar reads as sections rather than eleven flat links.
 * Review is first because it is the work that actually has a queue behind it.
 */
const NAV_SECTIONS: Array<{
  heading: string;
  items: Array<{ label: string; to: string; icon: typeof Users }>;
}> = [
  {
    heading: "Overview",
    items: [
      { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
      { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    heading: "Review",
    items: [
      { label: "Approvals", to: "/admin/approvals", icon: ClipboardCheck },
      { label: "Safety flags", to: "/admin/flags", icon: Flag },
      { label: "Moderation", to: "/admin/moderation", icon: ShieldAlert },
    ],
  },
  {
    heading: "People",
    items: [
      { label: "Users", to: "/admin/users", icon: Users },
      { label: "Vendors", to: "/admin/vendors", icon: Store },
    ],
  },
  {
    heading: "Comms",
    items: [
      { label: "Inquiries", to: "/admin/inquiries", icon: Inbox },
      { label: "Support", to: "/admin/support", icon: LifeBuoy },
      { label: "Broadcasts", to: "/admin/broadcasts", icon: Megaphone },
      { label: "Subscribers", to: "/admin/subscribers", icon: Mail },
    ],
  },
  {
    heading: "System",
    items: [{ label: "Audit log", to: "/admin/audit", icon: ScrollText }],
  },
];

const isActivePath = (pathname: string, to: string) =>
  pathname === to || (to !== "/admin" && pathname.startsWith(to));

const NavContents = ({
  pathname,
  onNavigate,
  onLogout,
}: {
  pathname: string;
  onNavigate?: () => void;
  onLogout: () => void;
}) => (
  <div className="flex h-full flex-col bg-wedding-navy">
    <div className="flex h-16 items-center gap-2 px-6 border-b border-white/10 shrink-0">
      <span className="font-serif text-sm font-bold text-white">àjọyọ</span>
      <span className="text-xs font-medium text-white/50">Admin</span>
    </div>

    <nav className="flex-1 space-y-4 px-3 py-4 overflow-y-auto">
      {NAV_SECTIONS.map((section) => (
        <div key={section.heading}>
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">
            {section.heading}
          </p>
          <div className="space-y-0.5">
            {section.items.map(({ label, to, icon: Icon }) => {
              const active = isActivePath(pathname, to);
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-wedding-gold/15 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active ? "text-wedding-gold" : "text-white/40")} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>

    <div className="border-t border-white/10 p-3 space-y-1 shrink-0">
      <Link
        to="/home"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4 text-white/40" />
        Back to app
      </Link>
      <button
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-red-500/10 hover:text-red-400 transition-colors"
      >
        <LogOut className="h-4 w-4 text-white/40" />
        Sign out
      </button>
    </div>
  </div>
);

const AdminLayout = ({ title, children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-wedding-navy/80">
          <NavContents pathname={location.pathname} onLogout={handleLogout} />
        </aside>

        <div className="flex-1 lg:pl-64 min-w-0">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border bg-background/95 backdrop-blur-sm px-4 sm:px-6">
            {/* Below lg the sidebar is hidden, and until this existed there was
                no way to reach any admin page from a phone or tablet. */}
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <button
                  className="lg:hidden -ml-1 rounded-md p-2 hover:bg-muted"
                  aria-label="Open admin menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 border-0">
                <NavContents
                  pathname={location.pathname}
                  onNavigate={() => setDrawerOpen(false)}
                  onLogout={handleLogout}
                />
              </SheetContent>
            </Sheet>

            <h1 className="font-serif text-base sm:text-lg font-semibold text-foreground truncate">
              {title}
            </h1>
          </header>

          <main className="p-4 sm:p-6 space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
