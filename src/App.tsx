import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Index from "./pages/Index";
import UserHomepage from "./pages/UserHomepage";
import VendorHomepage from "./pages/VendorHomepage";
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
    }
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

// Landing page route - redirects authenticated users to their home
const LandingRoute = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated && user) {
    // Redirect to appropriate home based on user type
    if (user.userType === "vendor") {
      return <Navigate to="/vendor-home" replace />;
    } else if (user.userType === "planner") {
      return <Navigate to="/planner-home" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return <Index />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing page - redirects authenticated users */}
      <Route path="/" element={<LandingRoute />} />

      {/* Public routes */}
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/invitation" element={<InvitationPage />} />
      <Route path="/invitation/:code" element={<InvitationPage />} />
      <Route path="/shared-story" element={<SharedStoryPage />} />
      <Route path="/vendors" element={<Vendors />} />
      <Route path="/vendor-profile" element={<VendorProfile />} />

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

      {/* Vendor routes */}
      <Route path="/vendor-home" element={
        <RequireAuth allowedTypes={["vendor"]}>
          <VendorHomepage />
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
      <Route path="/clients" element={
        <RequireAuth allowedTypes={["planner"]}>
          <PlannerClients />
        </RequireAuth>
      } />

      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
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
