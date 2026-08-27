import { useState } from "react";
import { Calendar, Check, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { calendarService } from "@/services/api/calendarService";

interface CalendarSyncCardProps {
  feedUrl: string | null;
  webcalUrl: string | null;
  /** Called with the new URLs after the feed is reset. */
  onRotated?: (urls: { feedUrl: string; webcalUrl: string }) => void;
}

/**
 * Subscribe-to-your-calendar panel.
 *
 * Handing out an ICS feed URL means Google, Apple and Outlook poll àjọyọ for
 * changes and deliver the reminders themselves — no OAuth, and it works with
 * whichever calendar the user already lives in.
 */
export const CalendarSyncCard = ({ feedUrl, webcalUrl, onRotated }: CalendarSyncCardProps) => {
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const copyFeed = async () => {
    if (!feedUrl) return;
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      toast.success("Feed link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select and copy the link manually");
    }
  };

  const rotate = async () => {
    setIsRotating(true);
    try {
      const urls = await calendarService.rotateFeed();
      onRotated?.(urls);
      toast.success("A new calendar link has been generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset the link");
    } finally {
      setIsRotating(false);
      setConfirmReset(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Sync to your calendar
        </CardTitle>
        <CardDescription>
          Subscribe once and your àjọyọ dates stay up to date in Google, Apple or
          Outlook Calendar — and those apps handle the reminders.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!feedUrl ? (
          <p className="text-sm text-muted-foreground">Preparing your calendar link…</p>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-md border bg-muted/50 px-3 py-2 text-xs">
                {feedUrl}
              </code>
              <Button size="sm" variant="outline" onClick={copyFeed} className="shrink-0">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="ml-1.5 hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Google takes the https URL through its "from URL" flow. */}
              <Button size="sm" variant="outline" asChild>
                <a
                  href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(feedUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Add to Google
                </a>
              </Button>

              {/* webcal:// opens Apple Calendar / Outlook directly. */}
              {webcalUrl && (
                <Button size="sm" variant="outline" asChild>
                  <a href={webcalUrl}>
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Apple / Outlook
                  </a>
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmReset(true)}
                disabled={isRotating}
                className="text-muted-foreground"
              >
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isRotating ? "animate-spin" : ""}`} />
                Reset link
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Anyone with this link can see your dates, so keep it private. Calendar
              apps usually refresh every few hours.
            </p>
          </>
        )}
      </CardContent>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset your calendar link?</AlertDialogTitle>
            <AlertDialogDescription>
              The current link stops working immediately. Any calendar already
              subscribed to it will stop updating until you re-subscribe with the
              new link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRotating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={rotate} disabled={isRotating}>
              {isRotating ? "Resetting…" : "Reset link"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default CalendarSyncCard;
