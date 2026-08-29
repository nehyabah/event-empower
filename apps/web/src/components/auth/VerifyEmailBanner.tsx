import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MailCheck } from "lucide-react";
import { apiClient } from "@/services/api/client";
import { useAuth } from "@/context/AuthContext";

/**
 * Prompts a new signup to confirm the address they registered with.
 *
 * Shown rather than enforced: a couple can plan their whole wedding
 * unverified. Only the outward-facing actions — messaging a vendor,
 * publishing a public site — are gated, so this is a nudge until one of those
 * is reached, not a wall on first use.
 *
 * Renders nothing once verified, and nothing for accounts that predate
 * verification, which were backfilled.
 */
const VerifyEmailBanner = () => {
  const { user, refreshUser } = useAuth();
  const [code, setCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [sent, setSent] = useState(false);

  if (!user || user.emailVerified !== false) return null;

  const sendCode = async () => {
    setIsSending(true);
    try {
      const res = await apiClient.post("/users/me/verify-email/send");
      if (res.error) throw new Error(res.error);
      setSent(true);
      toast.success("Code sent", { description: `Check ${user.email}.` });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send a code");
    } finally {
      setIsSending(false);
    }
  };

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
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <MailCheck className="h-5 w-5 shrink-0 text-amber-600" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900">Confirm your email</p>
          <p className="text-xs text-amber-800 mt-0.5">
            We sent a code to {user.email}. You'll need it before messaging a vendor or
            publishing your wedding site.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="w-28 tracking-[0.3em] text-center bg-white"
          />
          <Button size="sm" onClick={verify} disabled={isVerifying || code.length !== 6}>
            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
          </Button>
        </div>
      </div>

      <button
        type="button"
        onClick={sendCode}
        disabled={isSending}
        className="mt-2 text-xs text-amber-800 underline underline-offset-2 hover:text-amber-900 disabled:opacity-50"
      >
        {isSending ? "Sending…" : sent ? "Send another code" : "Didn't get it? Send again"}
      </button>
    </div>
  );
};

export default VerifyEmailBanner;
