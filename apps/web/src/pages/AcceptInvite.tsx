import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { invitationService } from "@/services/api/invitationService";
import { useAuth } from "@/context/AuthContext";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

type Stage = "loading" | "preview" | "accepting" | "done" | "error";
type AuthView = "login" | "register";

const AcceptInvite = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const code = (params.get("code") ?? "").trim().toUpperCase();

  const [stage, setStage] = useState<Stage>("loading");
  const [preview, setPreview] = useState<{ plannerName: string; coupleName: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("login");

  useEffect(() => {
    if (!code) {
      setStage("error");
      setErrorMsg("No invite code found in the link.");
      return;
    }

    invitationService
      .previewInvite(code)
      .then((data) => {
        setPreview(data);
        setStage("preview");
      })
      .catch((err) => {
        setStage("error");
        setErrorMsg(err instanceof Error ? err.message : "This invite is invalid or has expired.");
      });
  }, [code]);

  const handleAccept = async () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    if (user?.userType !== "client") {
      toast.error("Only couple accounts can accept a planner invite.");
      return;
    }

    setStage("accepting");
    setShowAuth(false);
    try {
      await invitationService.acceptInvite(code);
      sessionStorage.removeItem("pendingInviteCode");
      setStage("done");
    } catch (err) {
      setStage("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to accept invite.");
    }
  };

  // Auto-accept once authenticated as a client
  useEffect(() => {
    if (stage === "preview" && isAuthenticated && user?.userType === "client") {
      handleAccept();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, isAuthenticated, user]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <p className="text-center text-2xl font-serif font-medium mb-8 tracking-tight">àjọyọ</p>

        <Card>
          <CardContent className="pt-8 pb-8 px-8 space-y-6">
            {stage === "loading" && (
              <div className="text-center">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground text-sm mt-4">Checking invite…</p>
              </div>
            )}

            {stage === "preview" && preview && !showAuth && (
              <div className="text-center space-y-4">
                <div className="space-y-1">
                  <p className="text-lg font-semibold">{preview.plannerName}</p>
                  <p className="text-sm text-muted-foreground">has invited you to collaborate on your event</p>
                </div>
                {preview.coupleName && (
                  <p className="text-base font-medium">{preview.coupleName}</p>
                )}
                <Button className="w-full" size="lg" onClick={handleAccept}>
                  Accept invitation
                </Button>
                <p className="text-xs text-muted-foreground">
                  You'll need to be signed in to accept.
                </p>
              </div>
            )}

            {stage === "preview" && showAuth && (
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Sign in to accept your invitation from{" "}
                    <span className="font-medium text-foreground">{preview?.plannerName}</span>
                  </p>
                </div>

                {/* Auth tab switcher */}
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      authView === "login"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => setAuthView("login")}
                  >
                    Sign in
                  </button>
                  <button
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      authView === "register"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => setAuthView("register")}
                  >
                    Create account
                  </button>
                </div>

                {authView === "login" ? (
                  <LoginForm onSuccess={() => { /* auto-accept useEffect handles it */ }} />
                ) : (
                  <RegisterForm onSuccess={() => { /* auto-accept useEffect handles it */ }} />
                )}

                <button
                  className="w-full text-xs text-muted-foreground hover:text-foreground text-center transition-colors"
                  onClick={() => setShowAuth(false)}
                >
                  ← Back to invite
                </button>
              </div>
            )}

            {stage === "accepting" && (
              <div className="text-center">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground text-sm mt-4">Linking your account…</p>
              </div>
            )}

            {stage === "done" && (
              <div className="text-center space-y-4">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                <div className="space-y-1">
                  <p className="text-lg font-semibold">You're connected!</p>
                  <p className="text-sm text-muted-foreground">
                    Your planner can now collaborate on your event.
                  </p>
                </div>
                <Button className="w-full" onClick={() => navigate("/workspace")}>
                  Go to your workspace
                </Button>
              </div>
            )}

            {stage === "error" && (
              <div className="text-center space-y-4">
                <XCircle className="mx-auto h-12 w-12 text-destructive" />
                <div className="space-y-1">
                  <p className="text-lg font-semibold">Invite not valid</p>
                  <p className="text-sm text-muted-foreground">{errorMsg}</p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
                  Go to home
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcceptInvite;
