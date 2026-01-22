import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface AuthModalProps {
  defaultTab?: "login" | "register";
  trigger?: React.ReactNode;
  triggerClassName?: string;
}

const AuthModal = ({
  defaultTab = "login",
  trigger,
  triggerClassName = "",
}: AuthModalProps) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">(defaultTab);

  useEffect(() => {
    if (open) setMode(defaultTab);
  }, [open, defaultTab]);

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            className={`${triggerClassName} ${defaultTab === "login" ? "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50" : "bg-zinc-900 text-white hover:bg-zinc-800"}`}
          >
            {defaultTab === "login" ? "Log in" : "Get Started"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden bg-white gap-0 border-none shadow-2xl">
        <div className="flex flex-col md:flex-row h-full md:min-h-[550px]">
          <div className="hidden md:flex flex-col justify-between w-1/2 bg-zinc-900 p-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519225469958-3160e0d5a3c2?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent"></div>

            <div className="relative z-10 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-wedding-gold" />
                <span className="text-xs font-bold tracking-[0.2em] text-wedding-gold uppercase">
                  Planr
                </span>
              </div>
            </div>

            <div className="relative z-10 mb-8">
              <h2 className="text-4xl font-serif font-medium leading-tight mb-4 tracking-tight">
                {mode === "login" ? "Welcome back." : "Begin your journey."}
              </h2>
              <p className="text-zinc-300 font-light leading-relaxed max-w-sm text-lg">
                {mode === "login"
                  ? "Access your wedding dashboard and continue planning your perfect day."
                  : "Join thousands of couples simplifying their wedding planning experience."}
              </p>
            </div>

            <div className="relative z-10 text-sm text-zinc-600 font-medium">
              Ac 2024 Planr Inc.
            </div>
          </div>

          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
            <div className="max-w-xs mx-auto w-full">
              <div className="mb-10 text-center md:text-left">
                <DialogTitle className="text-3xl font-serif font-medium text-zinc-900 mb-2 tracking-tight">
                  {mode === "login" ? "Sign In" : "Create Account"}
                </DialogTitle>
                <DialogDescription className="text-zinc-500">
                  {mode === "login"
                    ? "Enter your details below"
                    : "Simple, free access to all features"}
                </DialogDescription>
              </div>

              <div className="flex items-center justify-between rounded-full bg-zinc-100 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                    mode === "login"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                    mode === "register"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Create
                </button>
              </div>

              {mode === "login" ? (
                <LoginForm onSuccess={() => setOpen(false)} />
              ) : (
                <RegisterForm onSuccess={() => setOpen(false)} />
              )}

              <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
                <p className="text-sm text-zinc-500">
                  {mode === "login"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <button
                    onClick={toggleMode}
                    className="font-medium text-zinc-900 hover:underline underline-offset-4 ml-1 transition-colors"
                  >
                    {mode === "login" ? "Sign up free" : "Log in"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
