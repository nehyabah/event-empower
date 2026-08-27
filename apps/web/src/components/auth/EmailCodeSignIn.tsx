import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Mail } from "lucide-react";
import { apiClient } from "@/services/api/client";
import { useAuth, AuthUser } from "@/context/AuthContext";

/**
 * Sign in with a code emailed to the account holder.
 *
 * Sits beside the password form and Google rather than replacing either: email
 * has outages, and an account whose only route in is an inbox is unreachable
 * whenever the provider is down.
 *
 * Starts collapsed so the ordinary password path stays the obvious one.
 */

interface EmailCodeSignInProps {
  onSuccess?: (user: AuthUser) => void;
}

const EmailCodeSignIn = ({ onSuccess }: EmailCodeSignInProps) => {
  const { applySession } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestCode = async () => {
    setError(null);
    setIsBusy(true);
    try {
      await apiClient.post("/auth/email/request-code", { email: email.trim() });
      // Identical wording whether or not the account exists.
      toast.success("Check your email", {
        description: "If that address has an account, a sign-in code is on its way.",
      });
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsBusy(false);
    }
  };

  const verifyCode = async () => {
    setError(null);
    setIsBusy(true);
    try {
      const response = await apiClient.post<{ user: AuthUser; accessToken: string }>(
        "/auth/email/verify-code",
        { email: email.trim(), code: code.trim() }
      );
      if (response.error || !response.data) {
        throw new Error(response.error || "That code is not valid.");
      }
      applySession(response.data.user, response.data.accessToken);
      onSuccess?.(response.data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code is not valid. Please request a new one.");
    } finally {
      setIsBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        <Mail className="h-3.5 w-3.5" />
        Email me a sign-in code instead
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {step === "email" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="code-email">Email</Label>
            <Input
              id="code-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // Enter should submit, but this sits inside the password form's
              // sibling tree — a real submit would post the wrong form.
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (email.trim()) void requestCode();
                }
              }}
            />
          </div>
          <Button type="button" className="w-full" onClick={requestCode} disabled={isBusy || !email.trim()}>
            {isBusy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              "Send code"
            )}
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="code-input">6-digit code</Label>
            <Input
              id="code-input"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              className="tracking-[0.5em] text-center text-lg"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (code.length === 6) void verifyCode();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">Sent to {email}. Expires in 10 minutes.</p>
          </div>
          <Button type="button" className="w-full" onClick={verifyCode} disabled={isBusy || code.length !== 6}>
            {isBusy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="w-full text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Use a different email
          </button>
        </>
      )}
    </div>
  );
};

export default EmailCodeSignIn;
