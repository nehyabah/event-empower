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
import ListSectionEditor, { ListSectionSpec } from "./ListSectionEditor";
import ImageField from "./ImageField";

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
    { key: "title", label: "Headline", placeholder: "Ada & Femi" },
    { key: "banner_image_url", label: "Banner photo", type: "image", help: "The large photo behind your names." },
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
    { key: "bride_image_url", label: "Her photo", type: "image" },
    { key: "groom_name", label: "Groom's name", placeholder: "Femi" },
    { key: "groom_bio", label: "About him", multiline: true },
    { key: "groom_image_url", label: "His photo", type: "image" },
  ],
  details: [
    { key: "wedding_date", label: "Wedding date", type: "date" },
    { key: "wedding_time", label: "Start time", type: "time" },
    { key: "venue", label: "Venue", placeholder: "Eko Hotel, Lagos" },
    { key: "content", label: "Anything else guests should know", multiline: true },
  ],
};

/**
 * Sections backed by their own tables. Each is the same shape — a list of
 * records — so they share ListSectionEditor and differ only in this spec.
 */
const listSpec = (sectionId: SectionId): ListSectionSpec<never> | null => {
  switch (sectionId) {
    case "timeline":
      return {
        noun: "moment",
        fields: [
          { key: "title", label: "What happened", placeholder: "We met", required: true },
          { key: "date", label: "When", type: "date" },
          { key: "description", label: "Tell the story", multiline: true },
          { key: "image_url", label: "Photo", type: "image" },
        ],
        primary: (i: any) => i.title,
        secondary: (i: any) => i.description || i.date || null,
        add: (v) => storyService.addTimeline({ title: v.title, date: v.date || undefined, description: v.description || undefined, image_url: v.image_url || undefined }),
        update: (id, v) => storyService.updateTimeline(id, { title: v.title, date: v.date || undefined, description: v.description || undefined, image_url: v.image_url || undefined }),
        remove: (id) => storyService.deleteTimeline(id),
        reorder: (ids) => storyService.reorderTimeline(ids),
      } as unknown as ListSectionSpec<never>;

    case "wedding-party":
      return {
        noun: "person",
        fields: [
          { key: "name", label: "Name", placeholder: "Chidinma", required: true },
          { key: "role", label: "Role", placeholder: "Chief bridesmaid", required: true },
          {
            key: "side",
            label: "Side",
            options: [
              { value: "both", label: "Both" },
              { value: "bride", label: "Bride" },
              { value: "groom", label: "Groom" },
            ],
          },
          { key: "bio", label: "About them", multiline: true },
          { key: "image_url", label: "Photo", type: "image" },
        ],
        primary: (i: any) => i.name,
        secondary: (i: any) => i.role || null,
        add: (v) => storyService.addWeddingParty({ name: v.name, role: v.role, side: v.side || undefined, bio: v.bio || undefined, image_url: v.image_url || undefined }),
        update: (id, v) => storyService.updateWeddingParty(id, { name: v.name, role: v.role, side: v.side || undefined, bio: v.bio || undefined, image_url: v.image_url || undefined }),
        remove: (id) => storyService.deleteWeddingParty(id),
        reorder: (ids) => storyService.reorderWeddingParty(ids),
      } as unknown as ListSectionSpec<never>;

    case "travel":
      return {
        noun: "place",
        fields: [
          { key: "title", label: "Name", placeholder: "Eko Hotel", required: true },
          { key: "category", label: "Type", placeholder: "Hotel, transport, parking…" },
          { key: "description", label: "Details", multiline: true },
          { key: "address", label: "Address" },
          { key: "link", label: "Link", placeholder: "https://…" },
        ],
        primary: (i: any) => i.title,
        secondary: (i: any) => i.description || i.address || null,
        add: (v) => storyService.addTravel({ title: v.title, category: v.category || undefined, description: v.description || undefined, address: v.address || undefined, link: v.link || undefined }),
        update: (id, v) => storyService.updateTravel(id, { title: v.title, category: v.category || undefined, description: v.description || undefined, address: v.address || undefined, link: v.link || undefined }),
        remove: (id) => storyService.deleteTravel(id),
        reorder: (ids) => storyService.reorderTravel(ids),
      } as unknown as ListSectionSpec<never>;

    case "faq":
      return {
        noun: "question",
        fields: [
          { key: "question", label: "Question", placeholder: "Is there a dress code?", required: true },
          { key: "answer", label: "Answer", multiline: true, required: true },
        ],
        primary: (i: any) => i.question,
        secondary: (i: any) => i.answer || null,
        add: (v) => storyService.addFaq({ question: v.question, answer: v.answer }),
        update: (id, v) => storyService.updateFaq(id, { question: v.question, answer: v.answer }),
        remove: (id) => storyService.deleteFaq(id),
        reorder: (ids) => storyService.reorderFaq(ids),
      } as unknown as ListSectionSpec<never>;

    case "gallery":
      return {
        noun: "photo",
        fields: [
          { key: "url", label: "Photo", type: "image", required: true },
          { key: "caption", label: "Caption" },
        ],
        primary: (i: any) => i.caption || "Photo",
        secondary: (i: any) => i.url,
        add: (v) => storyService.addStoryImage({ url: v.url, caption: v.caption || null }),
        remove: (id) => storyService.deleteStoryImage(id),
      } as unknown as ListSectionSpec<never>;

    case "registry":
      return {
        noun: "gift",
        fields: [
          { key: "name", label: "Item", placeholder: "Dinner set", required: true },
          { key: "price", label: "Approximate price", placeholder: "45,000" },
          { key: "link", label: "Where to buy", placeholder: "https://…" },
        ],
        primary: (i: any) => i.name,
        secondary: (i: any) => i.price || null,
        add: (v) => storyService.addWishlistItem({ name: v.name, price: v.price || null, link: v.link || null }),
        update: (id, v) => storyService.updateWishlistItem(id, { name: v.name, price: v.price || null, link: v.link || null }),
        remove: (id) => storyService.deleteWishlistItem(id),
      } as unknown as ListSectionSpec<never>;

    default:
      return null;
  }
};

/** The rows behind each list-backed section. */
const listItems = (sectionId: SectionId, bundle: StoryBundle | null): Array<{ id: string }> => {
  switch (sectionId) {
    case "timeline": return bundle?.timeline ?? [];
    case "wedding-party": return bundle?.weddingParty ?? [];
    case "travel": return bundle?.travelInfo ?? [];
    case "faq": return bundle?.faqItems ?? [];
    case "gallery": return bundle?.images ?? [];
    case "registry": return bundle?.wishlist ?? [];
    default: return [];
  }
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

  const spec = listSpec(def.id);
  const items = listItems(def.id, bundle);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{def.label}</CardTitle>
        <p className="text-sm text-muted-foreground">{def.blurb}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {def.id === "wishes" && (
          <>
            <div className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Guests write these themselves. Hide the section if you would rather
                not collect them.
              </p>
            </div>

            {/* Previously there was nowhere in the app to actually read these -
                a couple had to open their own public site to see what guests
                had written. */}
            {(bundle?.comments.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">
                No wishes yet. They appear here as guests leave them.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {bundle!.comments.length}{" "}
                  {bundle!.comments.length === 1 ? "wish" : "wishes"}
                </p>
                <div className="divide-y rounded-lg border max-h-80 overflow-y-auto">
                  {bundle!.comments.map((c) => (
                    <div key={c.id} className="p-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {new Date(c.created_at).toLocaleDateString("en-NG", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap break-words">
                        {c.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {spec && (
          <ListSectionEditor items={items as never[]} spec={spec} onChanged={onSaved} />
        )}

        {def.id === "registry" && (
          <p className="text-xs text-muted-foreground border-t pt-3">
            Bank details for cash gifts are managed on your site page — they are
            published publicly, so they are kept deliberately separate.
          </p>
        )}

        {fields && (
          <>
            {fields.map((f) => (
              <div key={f.key as string} className="space-y-2">
                <Label htmlFor={`f-${f.key as string}`}>{f.label}</Label>
                {f.type === "image" ? (
                  <ImageField
                    value={draft[f.key as string] ?? ""}
                    label={f.label}
                    onChange={(url) =>
                      setDraft((d) => ({ ...d, [f.key as string]: url }))
                    }
                  />
                ) : f.multiline ? (
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
