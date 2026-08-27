import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { apiClient } from "@/services/api/client";

/**
 * Password reset in two steps on one screen.
 *
 * The code arrives by email and is typed back here, rather than following a
 * link: the reset is often begun on a laptop while the email lands on a phone,
 * and corporate link scanners can consume a one-time URL before the person
 * ever clicks it.
 *
 * The first step never reveals whether the address has an account — the server
 * answers identically either way, and so does this page.
 */

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsBusy(true);
    try {
      await apiClient.post("/auth/password/request-reset", { email: email.trim() });
      // Deliberately the same message whether or not the account exists.
      toast.success("Check your email", {
        description: "If that address has an account, a 6-digit code is on its way.",
      });
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsBusy(false);
    }
  };

  const submitReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Those passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }

    setIsBusy(true);
    try {
      const response = await apiClient.post<{ message: string }>("/auth/password/reset", {
        email: email.trim(),
        code: code.trim(),
        password,
      });
      if (response.error) throw new Error(response.error);

      toast.success("Password changed", { description: "Please sign in with your new password." });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code is not valid. Please request a new one.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <p className="text-center text-2xl font-serif font-medium mb-5 tracking-tight">àjọyọ̀</p>

          <Card>
            <CardContent className="p-6 sm:p-7 space-y-5">
              <div>
                <h1 className="text-xl font-serif font-medium">
                  {step === "request" ? "Reset your password" : "Enter your code"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {step === "request"
                    ? "We'll email you a 6-digit code to confirm it's you."
                    : `We sent a code to ${email}. It expires in 15 minutes.`}
                </p>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              {step === "request" ? (
                <form onSubmit={requestCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isBusy || !email.trim()}>
                    {isBusy ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      "Send me a code"
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={submitReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-code">6-digit code</Label>
                    <Input
                      id="reset-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="000000"
                      maxLength={6}
                      className="tracking-[0.5em] text-center text-lg"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reset-password">New password</Label>
                    <Input
                      id="reset-password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reset-confirm">Confirm new password</Label>
                    <Input
                      id="reset-confirm"
                      type="password"
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isBusy || code.length !== 6}>
                    {isBusy ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing password…
                      </>
                    ) : (
                      "Change password"
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("request");
                      setCode("");
                      setError(null);
                    }}
                    className="w-full text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    Didn't get it? Send another code
                  </button>
                </form>
              )}

              <Link
                to="/login"
                className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to sign in
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
