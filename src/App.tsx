
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser, AuthUser } from "@/services/authService";
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
import { TodoProvider } from "./context/TodoContext";
import PlannerTasks from "./pages/PlannerTasks";
import PlannerCalendar from "./pages/PlannerCalendar";
import PlannerClients from "./pages/PlannerClients";

const queryClient = new QueryClient();

// Auth guard component to check if user is authenticated
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth: boolean;
  vendorOnly?: boolean;
  clientOnly?: boolean;
  plannerOnly?: boolean;
}

const App = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check initial auth state
  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };
    
    checkUser();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const ProtectedRoute = ({ 
    children, 
    requireAuth, 
    vendorOnly = false, 
    clientOnly = false,
    plannerOnly = false 
  }: ProtectedRouteProps) => {
    if (isLoading) {
      return null; // Or a loading spinner
    }
    
    if (requireAuth && !user) {
      return <Navigate to="/" replace />;
    }
    
    if (!requireAuth && user) {
      if (user.userType === "vendor") {
        return <Navigate to="/vendor-home" replace />;
      } else if (user.userType === "planner") {
        return <Navigate to="/planner-home" replace />;
      }
      return <Navigate to="/home" replace />;
    }
    
    if (vendorOnly && user?.userType !== "vendor") {
      if (user?.userType === "planner") {
        return <Navigate to="/planner-home" replace />;
      }
      return <Navigate to="/home" replace />;
    }
    
    if (clientOnly && user?.userType !== "client") {
      if (user?.userType === "vendor") {
        return <Navigate to="/vendor-home" replace />;
      } else if (user?.userType === "planner") {
        return <Navigate to="/planner-home" replace />;
      }
      return <Navigate to="/home" replace />;
    }
    
    if (plannerOnly && user?.userType !== "planner") {
      if (user?.userType === "vendor") {
        return <Navigate to="/vendor-home" replace />;
      }
      return <Navigate to="/home" replace />;
    }
    
    return <>{children}</>;
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TodoProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={
                <ProtectedRoute requireAuth={false}>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/invitation" element={<InvitationPage />} />
              <Route path="/invitation/:code" element={<InvitationPage />} />
              
              {/* Shared story page - publicly accessible */}
              <Route path="/shared-story" element={<SharedStoryPage />} />
              
              {/* Authenticated user homepage - client only */}
              <Route path="/home" element={
                <ProtectedRoute requireAuth={true} clientOnly={true}>
                  <UserHomepage />
                </ProtectedRoute>
              } />
              
              {/* Authenticated vendor homepage - vendor only */}
              <Route path="/vendor-home" element={
                <ProtectedRoute requireAuth={true} vendorOnly={true}>
                  <VendorHomepage />
                </ProtectedRoute>
              } />
              
              {/* Authenticated planner homepage - planner only */}
              <Route path="/planner-home" element={
                <ProtectedRoute requireAuth={true} plannerOnly={true}>
                  <PlannerHomepage />
                </ProtectedRoute>
              } />
              
              {/* Protected routes - primarily for clients */}
              <Route path="/dashboard" element={
                <ProtectedRoute requireAuth={true} clientOnly={true}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/couple-story" element={
                <ProtectedRoute requireAuth={true} clientOnly={true}>
                  <CoupleStory />
                </ProtectedRoute>
              } />
              <Route path="/expense-tracker" element={
                <ProtectedRoute requireAuth={true} clientOnly={true}>
                  <ExpenseTracker />
                </ProtectedRoute>
              } />
              <Route path="/todo-lists" element={
                <ProtectedRoute requireAuth={true} clientOnly={true}>
                  <TodoLists />
                </ProtectedRoute>
              } />
              
              {/* Protected routes - planner only */}
              <Route path="/planner-tasks" element={
                <ProtectedRoute requireAuth={true} plannerOnly={true}>
                  <PlannerTasks />
                </ProtectedRoute>
              } />
              <Route path="/planner-calendar" element={
                <ProtectedRoute requireAuth={true} plannerOnly={true}>
                  <PlannerCalendar />
                </ProtectedRoute>
              } />
              <Route path="/clients" element={
                <ProtectedRoute requireAuth={true} plannerOnly={true}>
                  <PlannerClients />
                </ProtectedRoute>
              } />
              
              {/* Routes accessible to both clients and vendors */}
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/vendor-profile" element={<VendorProfile />} />
              
              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TodoProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
