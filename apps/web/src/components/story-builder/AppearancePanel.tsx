import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { storyService, StoryBundle } from "@/services/api/storyService";
import { siteThemes, fontPairs } from "@/lib/siteThemes";

/**
 * Theme, fonts, colour, address and publishing.
 *
 * The last thing the builder did not own — it previously lived in a separate
 * settings sheet reached from a gear icon floating over the live site, which
 * is why appearance and content felt like two different products.
 */

const ACCENT_PRESETS = [
  "#78716c", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6",
  "#ec4899", "#f43f5e", "#d4a574", "#1e293b",
];

const slugify = (v: string) =>
  v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

const AppearancePanel = ({
  bundle,
  onSaved,
}: {
  bundle: StoryBundle | null;
  onSaved: () => void | Promise<void>;
}) => {
  const story = bundle?.story ?? null;
  const [slug, setSlug] = useState(story?.slug ?? "");
  const [slugState, setSlugState] = useState<"idle" | "checking" | "free" | "taken">("idle");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setSlug(story?.slug ?? "");
    setSlugState("idle");
  }, [story?.slug]);

  /** Appearance is a preview-and-see choice, so each pick saves immediately. */
  const saveField = async (patch: Parameters<typeof storyService.updateMyStory>[0]) => {
    setIsBusy(true);
    try {
      await storyService.updateMyStory(patch);
      await onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setIsBusy(false);
    }
  };

  const saveSlug = async () => {
    const clean = slugify(slug);
    if (!clean) return;
    setSlugState("checking");
    try {
      // Checking first turns a duplicate into a clear message rather than a
      // generic failure from the database's unique constraint.
      const { available } = await storyService.checkSlugAvailability(clean);
      if (!available && clean !== story?.slug) {
        setSlugState("taken");
        return;
      }
      await saveField({ slug: clean });
      setSlug(clean);
      setSlugState("free");
    } catch {
      setSlugState("idle");
      toast.error("Could not check that address");
    }
  };

  const publicUrl = story?.slug ? `${window.location.origin}/s/${story.slug}` : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Appearance &amp; publishing</CardTitle>
        <p className="text-sm text-muted-foreground">
          How your site looks, and where guests find it.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Theme</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {siteThemes.map((t) => {
              const active = story?.template_id === t.id;
              return (
                <button
                  key={t.id}
                  disabled={isBusy}
                  onClick={() => saveField({ template_id: t.id })}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    active ? "border-primary bg-primary/5 font-medium" : "hover:bg-muted"
                  }`}
                >
                  {t.name}
                  {active && <Check className="inline h-3.5 w-3.5 ml-1 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Fonts</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {fontPairs.map((f) => {
              const active = story?.font_pair === f.id;
              return (
                <button
                  key={f.id}
                  disabled={isBusy}
                  onClick={() => saveField({ font_pair: f.id })}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    active ? "border-primary bg-primary/5 font-medium" : "hover:bg-muted"
                  }`}
                >
                  {f.name}
                  {active && <Check className="inline h-3.5 w-3.5 ml-1 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Accent colour</Label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_PRESETS.map((c) => (
              <button
                key={c}
                disabled={isBusy}
                onClick={() => saveField({ accent_color: c })}
                style={{ backgroundColor: c }}
                aria-label={`Accent ${c}`}
                className={`h-8 w-8 rounded-full border-2 transition-transform ${
                  story?.accent_color === c ? "border-foreground scale-110" : "border-transparent"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2 border-t pt-5">
          <Label htmlFor="site-slug">Web address</Label>
          <div className="flex gap-2">
            <div className="flex items-center rounded-md border bg-muted/40 pl-3 flex-1 min-w-0">
              <span className="text-sm text-muted-foreground shrink-0">/s/</span>
              <Input
                id="site-slug"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugState("idle"); }}
                placeholder="ada-and-obi"
                className="border-0 bg-transparent focus-visible:ring-0 px-1"
              />
            </div>
            <Button
              variant="outline"
              onClick={saveSlug}
              disabled={isBusy || slugState === "checking" || !slugify(slug)}
            >
              {slugState === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
          {slugState === "taken" && (
            <p className="text-xs text-destructive">That address is already taken.</p>
          )}
          {slugState === "free" && (
            <p className="text-xs text-green-700">Saved.</p>
          )}
          {slug && slugify(slug) !== slug && (
            <p className="text-xs text-muted-foreground">Will be saved as “{slugify(slug)}”.</p>
          )}
        </div>

        <div className="flex items-start justify-between gap-4 border-t pt-5">
          <div>
            <p className="text-sm font-medium">Published</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {story?.site_published
                ? "Anyone with the link can see your site."
                : "Only you can see it. Guests get a not-found page."}
            </p>
          </div>
          <Switch
            checked={!!story?.site_published}
            disabled={isBusy}
            onCheckedChange={(v) => saveField({ site_published: v })}
          />
        </div>

        {publicUrl && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3">
            <code className="text-xs flex-1 min-w-0 truncate">{publicUrl}</code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                void navigator.clipboard.writeText(publicUrl);
                toast.success("Link copied");
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppearancePanel;
