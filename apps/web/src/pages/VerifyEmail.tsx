import { useEffect, useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, MailCheck } from "lucide-react";
import { apiClient } from "@/services/api/client";
import { useAuth } from "@/context/AuthContext";

/**
 * The first screen a new account sees.
 *
 * Verification is a hard gate: until the address is confirmed there is
 * nothing else to do in the app, so this stands in front of every
 * authenticated route rather than sitting on one page as a prompt. Signing
 * out is deliberately left reachable — someone who mistyped their address
 * needs a way back out that is not "abandon the tab".
 */
const VerifyEmail = () => {
  const { user, refreshUser, logout } = useAuth();
  const [code, setCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [sentOnce, setSentOnce] = useState(false);

  const sendCode = async (announce = true) => {
    setIsSending(true);
    try {
      const res = await apiClient.post("/users/me/verify-email/send");
      if (res.error) throw new Error(res.error);
      setSentOnce(true);
      if (announce) toast.success("Code sent", { description: `Check ${user?.email}.` });
    } catch (err) {
      // A send throttled because signup just sent one is not worth alarming
      // anyone about — the code they need is already in their inbox.
      if (announce) toast.error(err instanceof Error ? err.message : "Could not send a code");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    // Signup already sent one; this covers arriving here later, or a send
    // that failed while the account was being created.
    void sendCode(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verify = async () => {
    setIsVerifying(true);
    try {
      const res = await apiClient.post("/users/me/verify-email", { code: code.trim() });
      if (res.error) throw new Error(res.error);
      toast.success("Email confirmed");
      await refreshUser();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "That code is not correct");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="p-6 sm:p-8 space-y-5">
              <div className="text-center">
                <MailCheck className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h1 className="text-xl font-serif font-medium">Confirm your email</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-foreground">{user?.email}</span>. Enter it to
                  finish setting up your account.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verify-code">Confirmation code</Label>
                <Input
                  id="verify-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && code.length === 6 && !isVerifying) verify();
                  }}
                  placeholder="000000"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  className="tracking-[0.5em] text-center text-lg"
                />
              </div>

              <Button className="w-full" onClick={verify} disabled={isVerifying || code.length !== 6}>
                {isVerifying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Confirm email
              </Button>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => sendCode()}
                  disabled={isSending}
                  className="text-muted-foreground underline underline-offset-4 hover:text-foreground disabled:opacity-50"
                >
                  {isSending ? "Sending…" : sentOnce ? "Send another code" : "Didn't get it?"}
                </button>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Sign out
                </button>
              </div>

              <p className="text-xs text-muted-foreground border-t pt-4">
                Wrong address? Sign out and register again — we can only send the code to the
                address this account was created with.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default VerifyEmail;
