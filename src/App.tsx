
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Vendors from "./pages/Vendors";
import Dashboard from "./pages/Dashboard";
import CoupleStory from "./pages/CoupleStory";
import ExpenseTracker from "./pages/ExpenseTracker";
import TodoLists from "./pages/TodoLists";
import NotFound from "./pages/NotFound";
import { TodoProvider } from "./context/TodoContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TodoProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/couple-story" element={<CoupleStory />} />
            <Route path="/expense-tracker" element={<ExpenseTracker />} />
            <Route path="/todo-lists" element={<TodoLists />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TodoProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
