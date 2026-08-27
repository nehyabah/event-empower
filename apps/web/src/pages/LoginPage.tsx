import { useEffect, useState } from "react";
import { homePathFor } from "@/lib/homePath";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { useAuth } from "@/context/AuthContext";

type AuthView = "login" | "register";

const LoginPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [view, setView] = useState<AuthView>("login");

  const redirectTo = params.get("redirect") || null;

  // If already authenticated, go straight to the redirect target or home
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(redirectTo || homePathFor(user?.userType), { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  // Uses the user the form hands back rather than context: setUser has not
  // necessarily flushed by the time onSuccess fires, so reading context here
  // can route on the previous value.
  const handleSuccess = (signedIn?: { userType?: string }) => {
    navigate(redirectTo || homePathFor(signedIn?.userType ?? user?.userType), { replace: true });
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6 sm:py-8">
      <div className="w-full max-w-md">
        <p className="text-center text-2xl font-serif font-medium mb-5 tracking-tight">àjọyọ</p>

        <Card>
          <CardContent className="p-6 sm:p-7 space-y-5">
            {/* Tab switcher */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  view === "login"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setView("login")}
              >
                Sign in
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  view === "register"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setView("register")}
              >
                Create account
              </button>
            </div>

            {view === "login" ? (
              <LoginForm onSuccess={handleSuccess} />
            ) : (
              <RegisterForm onSuccess={handleSuccess} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
