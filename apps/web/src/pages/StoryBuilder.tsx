import { useEffect, useMemo, useRef, useState } from "react";
import VerifyEmailBanner from "@/components/auth/VerifyEmailBanner";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ExternalLink, AlertCircle, CheckCircle2, Palette, Eye, EyeOff, Monitor } from "lucide-react";
import SectionRail from "@/components/story-builder/SectionRail";
import SectionEditor from "@/components/story-builder/SectionEditor";
import SitePreview from "@/components/story-builder/SitePreview";
import AppearancePanel from "@/components/story-builder/AppearancePanel";
import { useAuth } from "@/context/AuthContext";
import { storyService, StoryBundle } from "@/services/api/storyService";
import { SectionContext, SectionId, siteReadiness } from "@/lib/storySections";
import { DEFAULT_SECTION_ORDER } from "@/lib/siteThemes";

/**
 * The wedding site builder.
 *
 * Replaces a split where content lived in a modal, order and visibility lived
 * in a separate settings sheet, and four of the eleven sections had no editor
 * at all. Here a section is one row: what it contains, whether guests can see
 * it, where it sits, and the form to fill it in.
 */
const StoryBuilder = () => {
  const { user } = useAuth();
  const [previewKey, setPreviewKey] = useState(0);
  const [bundle, setBundle] = useState<StoryBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);
  const [hidden, setHidden] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<SectionId | null>(null);
  const [showAppearance, setShowAppearance] = useState(false);
  // On a phone the rail, the editor and a 70vh preview stacked vertically
  // meant endless scrolling to do anything. The preview is opt-in below lg.
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSavingLayout, setIsSavingLayout] = useState(false);

  const load = async () => {
    try {
      const data = await storyService.getMyStory();
      setBundle(data);
      setPreviewKey((k) => k + 1);
      setOrder(data.story?.section_order || DEFAULT_SECTION_ORDER);
      setHidden(data.story?.hidden_sections || []);
    } catch {
      toast.error("Could not load your wedding site");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const ctx: SectionContext = useMemo(
    () => ({
      story: bundle?.story ?? null,
      galleryCount: bundle?.images.length ?? 0,
      timelineCount: bundle?.timeline.length ?? 0,
      partyCount: bundle?.weddingParty.length ?? 0,
      travelCount: bundle?.travelInfo.length ?? 0,
      faqCount: bundle?.faqItems.length ?? 0,
      wishesCount: bundle?.comments.length ?? 0,
      registryCount: (bundle?.wishlist.length ?? 0) + (bundle?.bankDetails.length ?? 0),
    }),
    [bundle]
  );

  const readiness = useMemo(() => siteReadiness(ctx, hidden), [ctx, hidden]);

  /** Order and visibility save immediately — they are one click, not a form. */
  const persistLayout = async (nextOrder: string[], nextHidden: string[]) => {
    setOrder(nextOrder);
    setHidden(nextHidden);
    setIsSavingLayout(true);
    try {
      await storyService.updateMyStory({
        section_order: nextOrder,
        hidden_sections: nextHidden,
      });
    } catch {
      toast.error("Could not save your layout");
      void load();
    } finally {
      setIsSavingLayout(false);
    }
  };

  const slug = bundle?.story?.slug;
  const published = bundle?.story?.site_published ?? false;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-6">
            <VerifyEmailBanner />

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-serif font-medium tracking-tight">
                  Your wedding site
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Everything guests will see, one section at a time.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/couple-story">
                    <ExternalLink className="h-4 w-4 mr-1.5" />
                    Preview site
                  </Link>
                </Button>
              </div>
            </div>

            <div className="lg:hidden flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2.5">
              <Monitor className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                You can build your whole site from here, but it is easier on a laptop —
                there you get the live preview side by side while you type.
              </p>
            </div>

            {/* What is left to do, rather than making them find out from the
                published site. */}
            <Card
              className={
                readiness.missing.length > 0 ? "border-amber-200 bg-amber-50/50" : "border-green-200 bg-green-50/50"
              }
            >
              <CardContent className="flex items-start gap-3 py-4">
                {readiness.missing.length > 0 ? (
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {readiness.done} of {readiness.total} key sections ready
                  </p>
                  {readiness.missing.length > 0 ? (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Still to do:{" "}
                      {readiness.missing.map((m, i) => (
                        <span key={m.id}>
                          {i > 0 && ", "}
                          <button
                            className="underline underline-offset-2 hover:text-foreground"
                            onClick={() => setActiveId(m.id)}
                          >
                            {m.label}
                          </button>
                        </span>
                      ))}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {published && slug
                        ? "Your site is live and ready to share."
                        : "Everything is filled in — publish it when you are ready."}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr] items-start">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium">Sections</h2>
                  {isSavingLayout && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Saving
                    </span>
                  )}
                </div>

                <SectionRail
                  inlineEditor={
                    <SectionEditor sectionId={activeId} bundle={bundle} onSaved={load} />
                  }
                  order={order}
                  hidden={hidden}
                  ctx={ctx}
                  activeId={activeId}
                  onSelect={(id) => {
                    setShowAppearance(false);
                    setActiveId(activeId === id ? null : id);
                  }}
                  onToggleHidden={(id) =>
                    persistLayout(
                      order,
                      hidden.includes(id) ? hidden.filter((h) => h !== id) : [...hidden, id]
                    )
                  }
                  onReorder={(next) => persistLayout(next, hidden)}
                />

                <Button
                  variant={showAppearance ? "default" : "outline"}
                  className="w-full"
                  onClick={() => {
                    setShowAppearance((v) => !v);
                    setActiveId(null);
                  }}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Appearance &amp; publishing
                </Button>
              </div>

              <div className="space-y-4" ref={editorRef}>
                {showAppearance ? (
                  <AppearancePanel bundle={bundle} onSaved={load} />
                ) : (
                  <div className="hidden lg:block">
                    <SectionEditor sectionId={activeId} bundle={bundle} onSaved={load} />
                  </div>
                )}
                <div className="lg:hidden">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowPreviewMobile((v) => !v)}
                  >
                    {showPreviewMobile ? (
                      <><EyeOff className="h-4 w-4 mr-2" />Hide preview</>
                    ) : (
                      <><Eye className="h-4 w-4 mr-2" />Show preview</>
                    )}
                  </Button>
                </div>

                <div className={showPreviewMobile ? "" : "hidden lg:block"}>
                  <SitePreview
                    userId={user?.id}
                    focusSection={activeId}
                    reloadKey={previewKey}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StoryBuilder;
