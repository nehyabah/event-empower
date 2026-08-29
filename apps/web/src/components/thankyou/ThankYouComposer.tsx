import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Image as ImageIcon, Send, X, Check, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { thankYouService, type AudienceBreakdown, type ThankYouAudience } from "@/services/api/thankYouService";
import { API_URL } from "@/lib/apiUrl";
import { apiClient } from "@/services/api/client";
import resolveMediaUrl from "@/lib/media";
import { formatNumber } from "@/lib/number";
import { cn } from "@/lib/utils";

const DEFAULT_BODY = `Dear {name},

Thank you for celebrating with us. Having you there meant more to us than we can put into words, and we are still smiling about it.

We hope to see you again soon.`;

/**
 * The couple's thank-you note to their guests.
 *
 * The whole design assumes this is sent once and cannot be taken back, so it
 * is a draft that saves as you type and a send that states the exact number of
 * people it is about to reach. {name} is the only placeholder — anything
 * richer would need explaining, and the guest's name is the one thing worth
 * varying.
 */
export const ThankYouComposer = () => {
  const [subject, setSubject] = useState("Thank you");
  const [body, setBody] = useState(DEFAULT_BODY);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [audience, setAudience] = useState<ThankYouAudience>("attended");
  const [breakdown, setBreakdown] = useState<AudienceBreakdown | null>(null);
  const [eventDate, setEventDate] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; skipped: number } | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);
  // Skips the save that would otherwise fire from loading the draft in.
  const hydrated = useRef(false);

  useEffect(() => {
    (async () => {
      const res = await thankYouService.getDraft();
      if (res.data?.draft) {
        const d = res.data.draft;
        setSubject(d.subject);
        setBody(d.body);
        setPhotoUrl(d.photo_url);
        setAudience(d.audience);
      }
      if (res.data?.breakdown) setBreakdown(res.data.breakdown);
      setEventDate(res.data?.eventDate ?? null);
      setIsLoading(false);
      hydrated.current = true;
    })();
  }, []);

  // Autosave. A couple writes this over several sittings and will not think to
  // press save before closing the tab.
  useEffect(() => {
    if (!hydrated.current) return;
    if (!subject.trim() || !body.trim()) return;
    const t = setTimeout(async () => {
      setIsSaving(true);
      await thankYouService.saveDraft({ subject, body, photoUrl, audience });
      setIsSaving(false);
    }, 1200);
    return () => clearTimeout(t);
  }, [subject, body, photoUrl, audience]);

  useEffect(() => {
    if (!hydrated.current) return;
    thankYouService.preview(audience).then((r) => r.data && setBreakdown(r.data));
  }, [audience]);

  const beforeTheDay = useMemo(() => {
    if (!eventDate) return false;
    return new Date(eventDate) > new Date();
  }, [eventDate]);

  const uploadPhoto = async (file: File) => {
    setIsUploading(true);
    try {
      const token = apiClient.getAccessToken();
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_URL}/thank-you/photo`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
        body: form,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setPhotoUrl(url);
    } catch {
      toast.error("That photo could not be uploaded");
    } finally {
      setIsUploading(false);
    }
  };

  const send = async () => {
    setConfirming(false);
    setIsSending(true);
    try {
      const res = await thankYouService.send();
      if (res.error) throw new Error(res.error);
      setResult(res.data!);
      toast.success(`Sent to ${formatNumber(res.data!.sent)} ${res.data!.sent === 1 ? "guest" : "guests"}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send the note");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (result) {
    return (
      <Card>
        <CardContent className="p-6 text-center sm:p-10">
          <Check className="mx-auto mb-3 h-8 w-8 text-emerald-600" />
          <h3 className="text-lg font-medium">Your thank-you is on its way</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Sent to {formatNumber(result.sent)} {result.sent === 1 ? "guest" : "guests"}.
            {result.skipped > 0 && ` ${formatNumber(result.skipped)} skipped for want of an email address.`}
            {result.failed > 0 && ` ${formatNumber(result.failed)} could not be delivered.`}
          </p>
        </CardContent>
      </Card>
    );
  }

  const total = breakdown?.reachable ?? 0;

  return (
    <div className="space-y-4">
      {beforeTheDay && (
        <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-900">
            Your wedding date hasn't passed yet. You can write this now, but it's usually
            sent once the day is over.
          </p>
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Thank your guests</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            One email to everyone who shared the day with you. Write <code className="rounded bg-muted px-1">{"{name}"}</code> and
            each guest sees their own name.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Who it goes to</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {([
                { value: "attended" as const, label: "Guests who came", hint: "Everyone who confirmed" },
                { value: "all" as const, label: "Everyone invited", hint: "Including those who couldn't make it" },
              ]).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAudience(option.value)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    audience === option.value
                      ? "border-primary bg-primary/5 ring-1 ring-inset ring-primary/30"
                      : "hover:bg-muted/40",
                  )}
                >
                  <span className="block text-sm font-medium">{option.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{option.hint}</span>
                </button>
              ))}
            </div>
            {breakdown && (
              <p className="text-xs text-muted-foreground">
                {formatNumber(breakdown.reachable)} will receive it
                {breakdown.noEmail > 0 && ` · ${formatNumber(breakdown.noEmail)} have no email on file`}
                {breakdown.alreadySent > 0 && ` · ${formatNumber(breakdown.alreadySent)} already thanked`}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ty-subject">Subject</Label>
            <Input id="ty-subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ty-body">Message</Label>
            <Textarea
              id="ty-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              maxLength={5000}
              className="min-h-[220px] leading-relaxed"
            />
            <p className="text-xs text-muted-foreground">
              {isSaving ? "Saving…" : "Saved automatically"}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Photo (optional)</Label>
            {photoUrl ? (
              <div className="relative overflow-hidden rounded-lg border">
                <img src={resolveMediaUrl(photoUrl)} alt="" className="block max-h-56 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  aria-label="Remove photo"
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isUploading}
                onClick={() => fileInput.current?.click()}
              >
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                Add a photo
              </Button>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadPhoto(file);
                e.target.value = "";
              }}
            />
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={isSending || total === 0 || !subject.trim() || !body.trim()}
            onClick={() => setConfirming(true)}
          >
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {total === 0 ? "No one to send to yet" : `Send to ${formatNumber(total)} ${total === 1 ? "guest" : "guests"}`}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Send to {formatNumber(total)} {total === 1 ? "guest" : "guests"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This goes out straight away and can't be unsent. Have a last read of your
              message before you do.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back to editing</AlertDialogCancel>
            <AlertDialogAction onClick={send}>Send it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ThankYouComposer;
