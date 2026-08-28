import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Index from "./pages/Index";
import UserHomepage from "./pages/UserHomepage";
import VendorHomepage from "./pages/VendorHomepage";
import VendorAnalytics from "./pages/VendorAnalytics";
import VendorCalendar from "./pages/VendorCalendar";
import RsvpPage from "./pages/RsvpPage";
import PlannerHomepage from "./pages/PlannerHomepage";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Vendors from "./pages/Vendors";
import Dashboard from "./pages/Dashboard";
import CoupleStory from "./pages/CoupleStory";
import SharedStoryPage from "./pages/SharedStoryPage";
import ExpenseTracker from "./pages/ExpenseTracker";
import TodoLists from "./pages/TodoLists";
import VendorProfile from "./pages/VendorProfile";
import InvitationPage from "./pages/InvitationPage";
import NotFound from "./pages/NotFound";
import PlannerTasks from "./pages/PlannerTasks";
import PlannerCalendar from "./pages/PlannerCalendar";
import PlannerClients from "./pages/PlannerClients";
import PlannerProfilePage from "./pages/PlannerProfile";
import PlannerClientWorkspace from "./pages/PlannerClientWorkspace";
import Workspace from "./pages/Workspace";
import AcceptInvite from "./pages/AcceptInvite";
import LoginPage from "./pages/LoginPage";
import VisionBoard from "./pages/VisionBoard";
import MyInquiries from "./pages/MyInquiries";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ForgotPassword from "./pages/ForgotPassword";
import BottomNav from "./components/layout/BottomNav";
import ScrollToTop from "./components/layout/ScrollToTop";
import EventSetup from "./pages/EventSetup";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminUserDetail from "./pages/AdminUserDetail";
import AdminVendors from "./pages/AdminVendors";
import AdminVendorDetail from "./pages/AdminVendorDetail";
import AdminInquiries from "./pages/AdminInquiries";
import AdminInquiryDetail from "./pages/AdminInquiryDetail";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminAnalyticsUsers from "./pages/AdminAnalyticsUsers";
import AdminAnalyticsVendors from "./pages/AdminAnalyticsVendors";
import AdminAnalyticsInquiries from "./pages/AdminAnalyticsInquiries";
import AdminSupport from "./pages/AdminSupport";
import AdminSupportDetail from "./pages/AdminSupportDetail";
import AdminModeration from "./pages/AdminModeration";
import AdminBroadcasts from "./pages/AdminBroadcasts";
import AdminSubscribers from "./pages/AdminSubscribers";
import AdminAudit from "./pages/AdminAudit";
import AdminApprovals from "./pages/AdminApprovals";

const queryClient = new QueryClient();

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Protected route that requires authentication
const RequireAuth = ({ children, allowedTypes }: { children: React.ReactNode; allowedTypes?: string[] }) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check if user type is allowed (if specified)
  if (allowedTypes && user && !allowedTypes.includes(user.userType)) {
    // Redirect to appropriate home based on user type
    if (user.userType === "vendor") {
      return <Navigate to="/vendor-home" replace />;
    } else if (user.userType === "planner") {
      return <Navigate to="/planner-home" replace />;
    } else if (user.userType === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

// Landing page route - redirects authenticated users to their home
const LandingRoute = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Debug: Log routing decision
  console.log("LandingRoute - user:", user, "userType:", user?.userType, "isAuthenticated:", isAuthenticated);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated && user) {
    // Debug: Log which route we're taking
    console.log("Routing to:", user.userType === "vendor" ? "/vendor-home" : user.userType === "planner" ? "/planner-home" : user.userType === "admin" ? "/admin" : "/home");

    // Redirect to appropriate home based on user type
    if (user.userType === "vendor") {
      return <Navigate to="/vendor-home" replace />;
    } else if (user.userType === "planner") {
      return <Navigate to="/planner-home" replace />;
    } else if (user.userType === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return <Index />;
};

const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* Landing page - redirects authenticated users */}
      <Route path="/" element={<LandingRoute />} />

      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/invitation" element={<InvitationPage />} />
      <Route path="/invitation/:code" element={<InvitationPage />} />
      {/* Public RSVP — guests reach this from the invite link or the wedding site */}
      <Route path="/rsvp/:code" element={<RsvpPage />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />
      <Route path="/shared-story" element={<SharedStoryPage />} />
      <Route path="/s/:slug" element={<SharedStoryPage />} />
      <Route path="/vendors" element={<Vendors />} />
      <Route path="/vendor-profile" element={<VendorProfile />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/setup" element={
          <RequireAuth allowedTypes={["client"]}>
            <EventSetup />
          </RequireAuth>
        } />

      {/* Client routes */}
      <Route path="/home" element={
        <RequireAuth allowedTypes={["client"]}>
          <UserHomepage />
        </RequireAuth>
      } />
      <Route path="/dashboard" element={
        <RequireAuth allowedTypes={["client"]}>
          <Dashboard />
        </RequireAuth>
      } />
      <Route path="/couple-story" element={
        <RequireAuth allowedTypes={["client"]}>
          <CoupleStory />
        </RequireAuth>
      } />
      <Route path="/expense-tracker" element={
        <RequireAuth allowedTypes={["client"]}>
          <ExpenseTracker />
        </RequireAuth>
      } />
      <Route path="/todo-lists" element={
        <RequireAuth allowedTypes={["client"]}>
          <TodoLists />
        </RequireAuth>
      } />
      <Route path="/my-inquiries" element={
        <RequireAuth allowedTypes={["client"]}>
          <MyInquiries />
        </RequireAuth>
      } />
      <Route path="/workspace" element={
        <RequireAuth allowedTypes={["client"]}>
          <Workspace />
        </RequireAuth>
      } />
      <Route path="/vision-board" element={
        <RequireAuth allowedTypes={["client"]}>
          <VisionBoard />
        </RequireAuth>
      } />

      {/* Vendor routes */}
      <Route path="/vendor-home" element={
        <RequireAuth allowedTypes={["vendor"]}>
          <VendorHomepage />
        </RequireAuth>
      } />
      <Route path="/vendor-analytics" element={
        <RequireAuth allowedTypes={["vendor"]}>
          <VendorAnalytics />
        </RequireAuth>
      } />
      <Route path="/vendor-calendar" element={
        <RequireAuth allowedTypes={["vendor"]}>
          <VendorCalendar />
        </RequireAuth>
      } />

      {/* Planner routes */}
      <Route path="/planner-home" element={
        <RequireAuth allowedTypes={["planner"]}>
          <PlannerHomepage />
        </RequireAuth>
      } />
      <Route path="/planner-tasks" element={
        <RequireAuth allowedTypes={["planner"]}>
          <PlannerTasks />
        </RequireAuth>
      } />
      <Route path="/planner-calendar" element={
        <RequireAuth allowedTypes={["planner"]}>
          <PlannerCalendar />
        </RequireAuth>
      } />
      <Route path="/planner-profile" element={
        <RequireAuth allowedTypes={["planner"]}>
          <PlannerProfilePage />
        </RequireAuth>
      } />
      <Route path="/clients" element={
        <RequireAuth allowedTypes={["planner"]}>
          <PlannerClients />
        </RequireAuth>
      } />
      <Route path="/clients/:clientId/workspace" element={
        <RequireAuth allowedTypes={["planner"]}>
          <PlannerClientWorkspace />
        </RequireAuth>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <RequireAuth allowedTypes={["admin"]}>
          <AdminDashboard />
        </RequireAuth>
      } />
      <Route path="/admin/analytics" element={
        <RequireAuth allowedTypes={["admin"]}>
          <AdminAnalytics />
        </RequireAuth>
      } />
      <Route path="/admin/analytics/users" element={
        <RequireAuth allowedTypes={["admin"]}>
          <AdminAnalyticsUsers />
        </RequireAuth>
      } />
      <Route path="/admin/analytics/vendors" element={
        <RequireAuth allowedTypes={["admin"]}>
          <AdminAnalyticsVendors />
        </RequireAuth>
      } />
      <Route path="/admin/analytics/inquiries" element={
        <RequireAuth allowedTypes={["admin"]}>
          <AdminAnalyticsInquiries />
        </RequireAuth>
      } />
      <Route path="/admin/support" element={
        <RequireAuth allowedTypes={["admin"]}>
          <AdminSupport />
        </RequireAuth>
      } />
      <Route path="/admin/support/:id" element={
        <RequireAuth allowedTypes={["admin"]}>
          <AdminSupportDetail />
        </RequireAuth>
      } />
      <Route path="/admin/moderation" element={
        <RequireAuth allowedTypes={["admin"]}>
          <AdminModeration />
        </RequireAuth>
      } />
      <Route path="/admin/broadcasts" element={
        <RequireAuth allowedTypes={["admin"]}>
          <AdminBroadcasts />
        </RequireAuth>
      } />
      <Route path="/admin/subscribers" element={
        <RequireAuth allowedTypes={["admin"]}>
          <AdminSubscribers />
        </RequireAuth>
      } />
      <Route path="/admin/audit" element={
        <RequireAuth allowedTypes={["admin"]}>
          <AdminAudit />
        </RequireAuth>
      } />
      <Route path="/admin/users" element={
        <RequireAuth allowedTypes={["admin"]}>
          <AdminUsers />
        </RequireAuth>
      } />
      <Route path="/admin/users/:id" element={
        <RequireAuth allowedTypes={["admin"]}>
          <AdminUserDetail />
        </RequireAuth>
      } />
      <Route path="/admin/vendors" element={
        <RequireAuth allowedTypes={["admin"]}>
          <AdminVendors />
        </RequireAuth>
      } />
      <Route path="/admin/vendors/:id" element={
        <RequireAuth allowedTypes={["admin"]}>
          <AdminVendorDetail />
        </RequireAuth>
      } />
      <Route path="/admin/inquiries" element={
        <RequireAuth allowedTypes={["admin"]}>
          <AdminInquiries />
        </RequireAuth>
      } />
      <Route path="/admin/inquiries/:id" element={
        <RequireAuth allowedTypes={["admin"]}>
          <AdminInquiryDetail />
        </RequireAuth>
      } />
      <Route path="/admin/approvals" element={
        <RequireAuth allowedTypes={["admin"]}>
          <AdminApprovals />
        </RequireAuth>
      } />

      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
