import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Calendar, Mail, Clock, Archive, CheckCircle } from "lucide-react";
import { vendorService, VendorInquiry, InquiryMessage } from "@/services/api/vendorService";

interface InquiryDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inquiryId: string | null;
  mode: "vendor" | "client";
  onStatusChange?: (inquiryId: string, status: 'new' | 'replied' | 'archived') => void;
}

const InquiryDetailModal = ({
  open,
  onOpenChange,
  inquiryId,
  mode,
  onStatusChange,
}: InquiryDetailModalProps) => {
  const [inquiry, setInquiry] = useState<VendorInquiry & { vendor_name?: string } | null>(null);
  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!open || !inquiryId) {
      setInquiry(null);
      setMessages([]);
      setNewMessage("");
      return;
    }

    const fetchInquiry = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (mode === "vendor") {
          const data = await vendorService.getInquiryWithMessages(inquiryId);
          setInquiry(data.inquiry);
          setMessages(data.messages);
        } else {
          const data = await vendorService.getMyInquiry(inquiryId);
          setInquiry(data.inquiry);
          setMessages(data.messages);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load inquiry");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiry();
  }, [open, inquiryId, mode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !inquiryId) return;

    try {
      setIsSending(true);
      setError(null);

      let sentMessage: InquiryMessage;
      if (mode === "vendor") {
        sentMessage = await vendorService.sendInquiryMessage(inquiryId, newMessage.trim());
      } else {
        sentMessage = await vendorService.sendMyInquiryMessage(inquiryId, newMessage.trim());
      }

      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");

      // Update inquiry status if vendor just replied
      if (mode === "vendor" && inquiry?.status === "new") {
        setInquiry((prev) => prev ? { ...prev, status: "replied" } : null);
        onStatusChange?.(inquiryId, "replied");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStatusChange = async (newStatus: 'new' | 'replied' | 'archived') => {
    if (!inquiryId) return;
    try {
      await vendorService.updateVendorInquiry(inquiryId, { status: newStatus });
      setInquiry((prev) => prev ? { ...prev, status: newStatus } : null);
      onStatusChange?.(inquiryId, newStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="default">New</Badge>;
      case "replied":
        return <Badge variant="secondary">Replied</Badge>;
      case "archived":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {mode === "vendor" ? "Inquiry Details" : "Conversation with Vendor"}
            </DialogTitle>
            {inquiry && getStatusBadge(inquiry.status)}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-destructive">
            {error}
          </div>
        ) : inquiry ? (
          <>
            {/* Inquiry Info */}
            <div className="px-6 py-4 bg-muted/50 border-b space-y-2">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {mode === "vendor" ? inquiry.sender_name : inquiry.vendor_name}
                  </span>
                </div>
                {inquiry.sender_email && mode === "vendor" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{inquiry.sender_email}</span>
                  </div>
                )}
                {inquiry.event_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Event: {formatDate(inquiry.event_date)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Sent: {formatDate(inquiry.created_at)}</span>
                </div>
              </div>

              {/* Original Inquiry Message */}
              <div className="bg-background rounded-lg p-3 mt-2">
                <p className="text-sm font-medium text-muted-foreground mb-1">Original Inquiry:</p>
                <p className="text-sm">{inquiry.message}</p>
              </div>

              {/* Status Controls (Vendor only) */}
              {mode === "vendor" && (
                <div className="flex items-center gap-2 mt-2">
                  {inquiry.status !== "replied" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange("replied")}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Replied
                    </Button>
                  )}
                  {inquiry.status !== "archived" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange("archived")}
                    >
                      <Archive className="h-4 w-4 mr-1" />
                      Archive
                    </Button>
                  )}
                  {inquiry.status === "archived" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange("new")}
                    >
                      Restore
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Messages Thread */}
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        (mode === "vendor" && msg.sender_type === "vendor") ||
                        (mode === "client" && msg.sender_type === "client")
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          (mode === "vendor" && msg.sender_type === "vendor") ||
                          (mode === "client" && msg.sender_type === "client")
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            (mode === "vendor" && msg.sender_type === "vendor") ||
                            (mode === "client" && msg.sender_type === "client")
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Reply Form */}
            <div className="px-6 py-4 border-t bg-background">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="resize-none min-h-[80px]"
                  disabled={isSending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default InquiryDetailModal;
