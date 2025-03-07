
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import UserHomepage from "./pages/UserHomepage";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Vendors from "./pages/Vendors";
import Dashboard from "./pages/Dashboard";
import CoupleStory from "./pages/CoupleStory";
import ExpenseTracker from "./pages/ExpenseTracker";
import TodoLists from "./pages/TodoLists";
import VendorProfile from "./pages/VendorProfile";
import InvitationPage from "./pages/InvitationPage";
import NotFound from "./pages/NotFound";
import { TodoProvider } from "./context/TodoContext";

const queryClient = new QueryClient();

// Auth guard component to check if user is authenticated
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth: boolean;
}

const ProtectedRoute = ({ children, requireAuth }: ProtectedRouteProps) => {
  const isAuthenticated = localStorage.getItem("authenticated") === "true";
  
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate checking auth on app load
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);
  
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
              <Route path="/invitation/:code" element={<InvitationPage />} />
              
              {/* Authenticated user homepage */}
              <Route path="/home" element={
                <ProtectedRoute requireAuth={true}>
                  <UserHomepage />
                </ProtectedRoute>
              } />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute requireAuth={true}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/couple-story" element={
                <ProtectedRoute requireAuth={true}>
                  <CoupleStory />
                </ProtectedRoute>
              } />
              <Route path="/expense-tracker" element={
                <ProtectedRoute requireAuth={true}>
                  <ExpenseTracker />
                </ProtectedRoute>
              } />
              <Route path="/todo-lists" element={
                <ProtectedRoute requireAuth={true}>
                  <TodoLists />
                </ProtectedRoute>
              } />
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
