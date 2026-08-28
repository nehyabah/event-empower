import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { vendorService, InquiryMessage } from "@/services/api/vendorService";
import { ChatSafetyBanner, ChatSafetyIntro } from "@/components/safety/ChatSafetyNotice";

interface VendorChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorProfileId: string | null;
  vendorName: string;
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });

/**
 * A real conversation with a vendor, opened straight from the directory.
 *
 * Replaces the one-shot enquiry form: a couple asking a second question had
 * no way back into what they already said, and the vendor received it as a
 * fresh enquiry rather than a reply.
 *
 * The thread is created lazily on the first message, because
 * vendor_inquiries.message is NOT NULL — opening this window is not the same
 * as starting a conversation, and a vendor should not collect an empty
 * enquiry every time someone taps Chat.
 */
const VendorChatModal = ({ open, onOpenChange, vendorProfileId, vendorName }: VendorChatModalProps) => {
  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !vendorProfileId) {
      setMessages([]);
      setDraft("");
      setAcknowledged(false);
      return;
    }
    let cancelled = false;
    setAcknowledged(false);
    setIsLoading(true);
    vendorService
      .getVendorConversation(vendorProfileId)
      .then((data) => {
        if (!cancelled) setMessages(data.messages);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load this conversation");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [open, vendorProfileId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !vendorProfileId) return;
    setIsSending(true);
    try {
      const { message } = await vendorService.messageVendor(vendorProfileId, text);
      setMessages((prev) => [...prev, message]);
      setDraft("");
    } catch (err) {
      // The safety block comes back as a plain message; showing it as-is is
      // the whole point, so the sender learns what was wrong.
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b">
          <DialogTitle className="text-base">{vendorName}</DialogTitle>
        </DialogHeader>

        {!isLoading && messages.length === 0 && !acknowledged ? (
          <div className="p-5">
            <ChatSafetyIntro onAccept={() => setAcknowledged(true)} />
          </div>
        ) : (
          <>
            <ChatSafetyBanner />

            <div className="min-h-[280px] max-h-[50vh] overflow-y-auto px-5 py-4 space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">
                  No messages yet. Tell them about your wedding and what you're looking for.
                </p>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_type === "client";
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[80%] flex flex-col gap-0.5">
                        <div
                          className={`rounded-lg px-3.5 py-2 text-sm whitespace-pre-wrap break-words ${
                            isMine ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          {msg.message}
                        </div>
                        <span className={`text-[11px] text-muted-foreground px-1 ${isMine ? "text-right" : ""}`}>
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t p-3 flex items-end gap-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!isSending) void handleSend();
                  }
                }}
                placeholder="Write a message..."
                rows={1}
                className="min-h-[40px] max-h-32 resize-none"
              />
              <Button size="icon" onClick={handleSend} disabled={isSending || !draft.trim()}>
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VendorChatModal;
