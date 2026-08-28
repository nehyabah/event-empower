import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Monitor, RefreshCw, Smartphone } from "lucide-react";

/**
 * Live preview of the wedding site.
 *
 * Renders the real public page in an iframe rather than a second
 * reimplementation of it. CoupleStory and SharedStoryPage already render the
 * same sections from separate code, and they drift; adding a third copy for
 * the builder would guarantee the preview eventually lied. This way the
 * preview is the published page.
 *
 * Same-origin, so the frame can be scrolled to the section being edited.
 */

interface SitePreviewProps {
  /** The couple's user id — the public page accepts it as ?id=. */
  userId: string | null | undefined;
  /** Scrolled into view whenever it changes. */
  focusSection: string | null;
  /** Bumped by the parent after a save to pull fresh content. */
  reloadKey: number;
}

const SitePreview = ({ userId, focusSection, reloadKey }: SitePreviewProps) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [nonce, setNonce] = useState(0);

  const src = userId ? `/shared-story?id=${encodeURIComponent(userId)}` : null;

  const scrollToSection = () => {
    if (!focusSection) return;
    const frame = frameRef.current;
    try {
      const doc = frame?.contentDocument;
      const el = doc?.getElementById(`section-${focusSection}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      // Same-origin, so this should not throw — but a preview that cannot
      // scroll must never take the builder down with it.
    }
  };

  // The section list renders inside the frame, so a freshly-loaded frame may
  // not have the target yet. Retry briefly rather than silently doing nothing.
  useEffect(() => {
    if (isLoading) return;
    scrollToSection();
    const t = setTimeout(scrollToSection, 350);
    return () => clearTimeout(t);
  }, [focusSection, isLoading, nonce]);

  useEffect(() => {
    if (reloadKey === 0) return;
    setIsLoading(true);
    setNonce((n) => n + 1);
  }, [reloadKey]);

  if (!src) {
    return (
      <div className="rounded-xl border bg-muted/30 py-20 text-center text-sm text-muted-foreground">
        Preview appears once your site has been created.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">Live preview</span>
        <div className="flex items-center gap-1">
          <div className="flex rounded-md bg-muted/60 p-0.5">
            <button
              onClick={() => setDevice("desktop")}
              className={`rounded px-2 py-1 ${device === "desktop" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              aria-label="Desktop preview"
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`rounded px-2 py-1 ${device === "mobile" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              aria-label="Mobile preview"
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsLoading(true);
              setNonce((n) => n + 1);
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="relative bg-muted/20 flex justify-center">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        <iframe
          // Remounts on nonce so a save pulls fresh content without needing
          // to reach into the frame's history.
          key={nonce}
          ref={frameRef}
          src={src}
          title="Wedding site preview"
          onLoad={() => setIsLoading(false)}
          className={`bg-white transition-all ${
            device === "mobile" ? "w-[390px] border-x" : "w-full"
          }`}
          style={{ height: "70vh", minHeight: 480 }}
        />
      </div>
    </div>
  );
};

export default SitePreview;
