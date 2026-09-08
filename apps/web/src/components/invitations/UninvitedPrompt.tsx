import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Send, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { userService, type Guest } from "@/services/api/userService";

interface Props {
  guests: Guest[];
  onSent: () => void;
}

/**
 * Says out loud that adding a guest does not invite them.
 *
 * Couples assume a guest list with email addresses on it sends the invitations,
 * because every other product they have used works that way. It does not here,
 * and the send lived on a different tab from the list — so people built the
 * list, saw the addresses sitting there, and waited for replies to an
 * invitation nobody had sent.
 *
 * Deliberately not an automatic send on add: a list is built over weeks, and an
 * invitation that goes out the moment a name is typed cannot be taken back.
 * Stating the position and putting the button next to the list is the honest
 * version.
 */
export const UninvitedPrompt = ({ guests, onSent }: Props) => {
  const [isSending, setIsSending] = useState(false);

  const uninvited = guests.filter((g) => !g.invitation_sent_at && g.email);
  const withoutEmail = guests.filter((g) => !g.invitation_sent_at && !g.email);

  const send = async () => {
    setIsSending(true);
    try {
      const result = await userService.sendInvitations();
      if (result.reason) toast.info(result.reason);
      else {
        toast.success(`Invitation sent to ${result.sent} guest${result.sent === 1 ? "" : "s"}`);
        if (result.failed > 0) toast.warning(`${result.failed} could not be delivered.`);
      }
      onSent();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send the invitations");
    } finally {
      setIsSending(false);
    }
  };

  if (guests.length === 0) return null;

  if (uninvited.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
        <MailCheck className="h-4 w-4 shrink-0 text-emerald-600" />
        <p className="text-xs text-emerald-900">
          Everyone with an email address has been invited.
          {withoutEmail.length > 0 &&
            ` ${withoutEmail.length} guest${withoutEmail.length === 1 ? " has" : "s have"} no email address — you will need to reach them another way.`}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-amber-900">
          {uninvited.length} guest{uninvited.length === 1 ? " has" : "s have"} not been invited yet
        </p>
        <p className="mt-0.5 text-xs text-amber-800">
          Adding someone to the list does not email them. Send the invitation when your list is ready.
        </p>
      </div>
      <Button size="sm" className="shrink-0" onClick={send} disabled={isSending}>
        {isSending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
        Send {uninvited.length} invitation{uninvited.length === 1 ? "" : "s"}
      </Button>
    </div>
  );
};

export default UninvitedPrompt;
