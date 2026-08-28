import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  workspaceMessageService,
  WorkspaceMessage,
  WorkspaceChatParticipant,
} from "@/services/api/workspaceMessageService";

interface WorkspaceChatProps {
  eventId: string;
}

const ROLE_LABEL: Record<string, string> = {
  client: "Couple",
  planner: "Planner",
  vendor: "Vendor",
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

/**
 * Group chat for one wedding workspace.
 *
 * Everyone connected to the wedding shares this single thread - the couple,
 * their planner, and any vendor still on the roster. There is no realtime
 * transport in this codebase (no websockets anywhere), so this polls on a
 * short interval instead, matching how the rest of the app treats "live"
 * data - good enough for a planning conversation, not built for typing
 * indicators.
 */
const WorkspaceChat = ({ eventId }: WorkspaceChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
  const [participants, setParticipants] = useState<WorkspaceChatParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    let cancelled = false;

    const load = async (showSpinner: boolean) => {
      if (showSpinner) setIsLoading(true);
      try {
        const data = await workspaceMessageService.getMessages(eventId);
        if (cancelled) return;
        setMessages(data.messages);
        setParticipants(data.participants);
      } catch {
        // A missed poll is not worth interrupting the page for.
      } finally {
        if (!cancelled && showSpinner) setIsLoading(false);
      }
    };

    load(true);
    const interval = setInterval(() => load(false), 8000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [eventId]);

  useEffect(() => {
    // Jump straight to the bottom on first load; only auto-scroll on new
    // messages after that, so reading older ones is not interrupted every 8s.
    if (isFirstLoad.current) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      if (!isLoading) isFirstLoad.current = false;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setIsSending(true);
    try {
      const sent = await workspaceMessageService.sendMessage(eventId, text);
      setMessages((prev) => [...prev, sent]);
      setDraft("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border bg-card overflow-hidden">
      {participants.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-b px-4 py-2.5 bg-muted/40">
          <span className="text-xs text-muted-foreground mr-1">In this chat:</span>
          {participants.map((p) => (
            <Badge key={p.user_id} variant="outline" className="text-xs font-normal">
              {p.name || "Someone"} · {ROLE_LABEL[p.user_type] || p.user_type}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex-1 min-h-[320px] max-h-[480px] overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            No messages yet. Say hello to get the conversation going.
          </p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                  {!isMine && (
                    <span className="text-xs text-muted-foreground px-1">
                      {msg.sender_name || "Deleted account"}
                      {msg.sender_user_type && ` · ${ROLE_LABEL[msg.sender_user_type] || msg.sender_user_type}`}
                    </span>
                  )}
                  <div
                    className={`rounded-lg px-3.5 py-2 text-sm whitespace-pre-wrap break-words ${
                      isMine ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {msg.message}
                  </div>
                  <span className="text-[11px] text-muted-foreground px-1">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t p-3 flex items-end gap-2 bg-background">
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
    </div>
  );
};

export default WorkspaceChat;
