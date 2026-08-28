import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MousePointerClick, Info } from "lucide-react";
import { storyService, StoryBundle, UpdateStoryInput } from "@/services/api/storyService";
import { SECTION_BY_ID, SectionId } from "@/lib/storySections";

/**
 * The form for whichever section is selected.
 *
 * Sections backed by their own tables (timeline, party, travel, FAQ,
 * registry) are managed on their existing screens; this links straight to
 * them rather than duplicating a list editor and risking two places to add a
 * timeline entry. Sections backed by columns on couple_stories are edited
 * here directly — including quote, details and hero, which previously had no
 * editor anywhere.
 */

interface SectionEditorProps {
  sectionId: SectionId | null;
  bundle: StoryBundle | null;
  onSaved: () => void | Promise<void>;
}

/** Which couple_stories columns each section owns. */
const FIELDS: Partial<
  Record<
    SectionId,
    Array<{
      key: keyof UpdateStoryInput;
      label: string;
      placeholder?: string;
      multiline?: boolean;
      type?: string;
      help?: string;
    }>
  >
> = {
  hero: [
    { key: "title", label: "Headline", placeholder: "Ada & Obi" },
    { key: "banner_image_url", label: "Banner image URL", placeholder: "https://…", help: "The large photo behind your names." },
    { key: "hashtag", label: "Hashtag", placeholder: "#AdaWedsObi" },
  ],
  quote: [
    {
      key: "love_quote",
      label: "Quote",
      multiline: true,
      placeholder: "Two souls with but a single thought…",
      help: "A short line shown between sections.",
    },
  ],
  couple: [
    { key: "bride_name", label: "Bride's name", placeholder: "Ada" },
    { key: "bride_bio", label: "About her", multiline: true },
    { key: "bride_image_url", label: "Her photo URL", placeholder: "https://…" },
    { key: "groom_name", label: "Groom's name", placeholder: "Obi" },
    { key: "groom_bio", label: "About him", multiline: true },
    { key: "groom_image_url", label: "His photo URL", placeholder: "https://…" },
  ],
  details: [
    { key: "wedding_date", label: "Wedding date", type: "date" },
    { key: "wedding_time", label: "Start time", type: "time" },
    { key: "venue", label: "Venue", placeholder: "Eko Hotel, Lagos" },
    { key: "content", label: "Anything else guests should know", multiline: true },
  ],
};

/** Sections whose content lives in their own tables and screens. */
const MANAGED_ELSEWHERE: Partial<Record<SectionId, { to: string; label: string; note: string }>> = {
  gallery: { to: "/couple-story", label: "Manage photos", note: "Photos are added on your site page." },
  timeline: { to: "/couple-story", label: "Manage timeline", note: "Timeline moments are added on your site page." },
  "wedding-party": { to: "/couple-story", label: "Manage wedding party", note: "Party members are added on your site page." },
  travel: { to: "/couple-story", label: "Manage travel info", note: "Travel details are added on your site page." },
  faq: { to: "/couple-story", label: "Manage FAQ", note: "Questions are added on your site page." },
  registry: { to: "/couple-story", label: "Manage registry", note: "Gift list and bank details are managed on your site page." },
};

const SectionEditor = ({ sectionId, bundle, onSaved }: SectionEditorProps) => {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const def = sectionId ? SECTION_BY_ID[sectionId] : null;
  const fields = sectionId ? FIELDS[sectionId] : undefined;

  // Reseed whenever the selection or the underlying story changes, so the
  // form never shows the previous section's values.
  useEffect(() => {
    if (!fields || !bundle?.story) {
      setDraft({});
      return;
    }
    const next: Record<string, string> = {};
    for (const f of fields) {
      const v = (bundle.story as unknown as Record<string, unknown>)[f.key as string];
      next[f.key as string] = v == null ? "" : String(v).slice(0, 10_000);
    }
    // A date column comes back as an ISO timestamp; <input type="date"> only
    // accepts YYYY-MM-DD and silently shows nothing otherwise.
    if (next.wedding_date) next.wedding_date = next.wedding_date.split("T")[0];
    setDraft(next);
  }, [sectionId, bundle]);

  const save = async () => {
    if (!fields) return;
    setIsSaving(true);
    try {
      const payload: UpdateStoryInput = {};
      for (const f of fields) {
        const value = draft[f.key as string] ?? "";
        (payload as Record<string, unknown>)[f.key as string] = value.trim() === "" ? null : value;
      }
      await storyService.updateMyStory(payload);
      toast.success(`${def?.label} saved`);
      await onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setIsSaving(false);
    }
  };

  if (!def) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <MousePointerClick className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Choose a section on the left to edit it.
          </p>
        </CardContent>
      </Card>
    );
  }

  const elsewhere = MANAGED_ELSEWHERE[def.id];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{def.label}</CardTitle>
        <p className="text-sm text-muted-foreground">{def.blurb}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {def.id === "wishes" && (
          <div className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Guests write these themselves — there is nothing to fill in. Hide the
              section if you would rather not collect them.
            </p>
          </div>
        )}

        {elsewhere && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{elsewhere.note}</p>
            <Button variant="outline" asChild>
              <a href={elsewhere.to}>{elsewhere.label}</a>
            </Button>
          </div>
        )}

        {fields && (
          <>
            {fields.map((f) => (
              <div key={f.key as string} className="space-y-2">
                <Label htmlFor={`f-${f.key as string}`}>{f.label}</Label>
                {f.multiline ? (
                  <Textarea
                    id={`f-${f.key as string}`}
                    rows={4}
                    value={draft[f.key as string] ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [f.key as string]: e.target.value }))
                    }
                  />
                ) : (
                  <Input
                    id={`f-${f.key as string}`}
                    type={f.type}
                    value={draft[f.key as string] ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [f.key as string]: e.target.value }))
                    }
                  />
                )}
                {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
              </div>
            ))}

            <Button onClick={save} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save {def.label.toLowerCase()}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SectionEditor;
