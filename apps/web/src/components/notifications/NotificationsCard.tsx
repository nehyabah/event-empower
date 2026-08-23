import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notificationService, UserNotification } from "@/services/api/notificationService";
import { useLiveData } from "@/hooks/useLiveData";

/** "3h ago" — precise enough for a feed, without pulling in a date library. */
const timeAgo = (iso: string): string => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

/**
 * In-app notification feed.
 *
 * Polls, so a vendor added to a roster while the tab is open finds out without
 * reloading — which was the whole gap: nothing told them at all.
 */
export const NotificationsCard = ({ emptyHint }: { emptyHint?: string }) => {
  const fetcher = useCallback(() => notificationService.list(), []);
  const { data, isLoading, refresh } = useLiveData(fetcher, { intervalMs: 60_000 });
  const [busy, setBusy] = useState(false);

  const notifications: UserNotification[] = data?.notifications ?? [];
  const unread = data?.unread ?? 0;

  const open = async (n: UserNotification) => {
    if (n.read_at) return;
    try {
      await notificationService.markRead(n.id);
      await refresh();
    } catch {
      // Non-critical: following the link still works.
    }
  };

  const clearAll = async () => {
    setBusy(true);
    try {
      await notificationService.markAllRead();
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const row = (n: UserNotification) => (
    <div
      className={`flex items-start gap-3 rounded-lg p-3 transition-colors ${
        n.read_at ? "opacity-70" : "bg-primary/5"
      } ${n.link ? "hover:bg-muted/60" : ""}`}
    >
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-transparent" : "bg-primary"}`}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">{n.title}</p>
        {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
        <p className="mt-1 text-[11px] text-muted-foreground">{timeAgo(n.created_at)}</p>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-primary" />
            Notifications
            {unread > 0 && <Badge className="bg-primary text-primary-foreground">{unread}</Badge>}
          </CardTitle>
          {unread > 0 && (
            <Button size="sm" variant="ghost" onClick={clearAll} disabled={busy}>
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            {emptyHint || "Nothing new right now."}
          </p>
        ) : (
          notifications.map((n) =>
            n.link ? (
              <Link key={n.id} to={n.link} onClick={() => open(n)} className="block">
                {row(n)}
              </Link>
            ) : (
              <button key={n.id} onClick={() => open(n)} className="block w-full text-left">
                {row(n)}
              </button>
            )
          )
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
