import { useEffect, useState } from "react";
import { buildInvitationLink } from "@/lib/invitationLink";
import { toast } from "sonner";
import { AlignCenter, AlignLeft, AlignRight, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  CardElementId, CardLayout, ELEMENT_LABELS, ElementLayout,
  SCALE_MAX, SCALE_MIN, clampElement, decodeLayout, encodeLayout,
} from "@/lib/cardLayout";
import SaveTheDateCard, {
  CardAlign,
  saveTheDateTemplates,
} from "@/components/dashboard/SaveTheDateCard";
import { userService } from "@/services/api/userService";
import { rsvpService } from "@/services/api/rsvpService";
import { formatDateOnly } from "@/lib/dates";

/**
 * Design the save-the-date and share it.
 *
 * Self-contained: it loads the couple's event itself and writes changes back,
 * so it can sit on the invitations page without the host screen having to own
 * and thread through the card's state.
 */
export const InvitationCardDesigner = () => {
  const [partner1Name, setPartner1Name] = useState(
    () => localStorage.getItem("partner1Name") || "Ada",
  );
  const [partner2Name, setPartner2Name] = useState(
    () => localStorage.getItem("partner2Name") || "Femi",
  );
  const [venue, setVenue] = useState(
    () => localStorage.getItem("venue") || "",
  );
  const [weddingDate, setWeddingDate] = useState<string | null>(
    () => localStorage.getItem("weddingDate"),
  );
  const [selectedTemplate, setSelectedTemplate] = useState(
    () => localStorage.getItem("saveTheDateTemplate") || "plain-ivory",
  );
  // Where the couple has moved each piece of the card.
  const [layout, setLayout] = useState<CardLayout>(() => {
    try {
      return decodeLayout(localStorage.getItem("saveTheDateLayout"));
    } catch {
      return {};
    }
  });
  const [selectedElement, setSelectedElement] = useState<CardElementId | null>(null);

  const [textAlign, setTextAlign] = useState<CardAlign>(() => {
    const saved = localStorage.getItem("saveTheDateAlign");
    return saved === "left" || saved === "right" ? saved : "center";
  });
  const [showRsvpBack, setShowRsvpBack] = useState(false);
  const [showCardDesigner, setShowCardDesigner] = useState(true);
  const [rsvpCode, setRsvpCode] = useState<string | null>(null);
  const [storySlug, setStorySlug] = useState<string | null>(null);

  // Seed from the saved event so the card matches reality, not stale local
  // values from a previous device.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const event = await userService.getUserEvent();
        if (cancelled || !event) return;
        if (event.partner1_name) setPartner1Name(event.partner1_name);
        if (event.partner2_name) setPartner2Name(event.partner2_name);
        if (event.venue) setVenue(event.venue);
        if (event.event_date) setWeddingDate(String(event.event_date).split("T")[0]);
        if (event.rsvp_code) {
          setRsvpCode(event.rsvp_code);
          const info = await rsvpService.getEventInfo(event.rsvp_code);
          if (!cancelled) setStorySlug(info?.storySlug ?? null);
        }
      } catch {
        // The designer still works from local values.
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Debounced write-back, so typing a name is not one request per keystroke.
  useEffect(() => {
    localStorage.setItem("partner1Name", partner1Name);
    localStorage.setItem("partner2Name", partner2Name);
    localStorage.setItem("venue", venue);
    const t = setTimeout(() => {
      userService.updateUserEvent({ partner1Name, partner2Name, venue }).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [partner1Name, partner2Name, venue]);

  const updateTemplate = (id: string) => {
    setSelectedTemplate(id);
    localStorage.setItem("saveTheDateTemplate", id);
  };

  const updateAlign = (a: CardAlign) => {
    setTextAlign(a);
    localStorage.setItem("saveTheDateAlign", a);
  };

  const updateElement = (id: CardElementId, next: ElementLayout) => {
    setLayout((prev) => {
      const merged = { ...prev, [id]: clampElement(next) };
      localStorage.setItem("saveTheDateLayout", encodeLayout(merged));
      return merged;
    });
  };

  const resetLayout = () => {
    setLayout({});
    setSelectedElement(null);
    localStorage.removeItem("saveTheDateLayout");
  };

  const selectedLayout: ElementLayout = clampElement(
    selectedElement ? layout[selectedElement] : undefined
  );

  const formattedWeddingDate =
    formatDateOnly(weddingDate, { month: "long", day: "numeric", year: "numeric" }) ?? "Date TBD";

  // One definition, shared with the RSVP settings, so both tabs hand out the
  // same link. Falls back to live state when no code exists yet, since the
  // helper reads the persisted values.
  const copyInvitationLink = () => {
    const link =
      buildInvitationLink(rsvpCode) ??
      `${window.location.origin}/invitation?t=${selectedTemplate}&a=${textAlign}`;
    navigator.clipboard.writeText(link);
    toast.success("Invitation link copied!");
  };

  const alignOptions: { value: CardAlign; icon: React.ElementType }[] = [
    { value: "left", icon: AlignLeft },
    { value: "center", icon: AlignCenter },
    { value: "right", icon: AlignRight },
  ];

  return (
        <Card className="overflow-hidden">
          {/* Mobile: Collapsible */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowCardDesigner(!showCardDesigner)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div>
                <CardTitle className="text-base font-serif">Invitation Card</CardTitle>
                <CardDescription className="text-xs">Design and share your save-the-date</CardDescription>
              </div>
              {showCardDesigner
                ? <ChevronUp className="h-5 w-5 text-muted-foreground" />
                : <ChevronDown className="h-5 w-5 text-muted-foreground" />
              }
            </button>

            {showCardDesigner && (
              <div className="border-t">
                <div className="bg-gradient-to-br from-zinc-100 to-zinc-200/80 px-4 py-6 flex items-center justify-center border-b">
                  <div className="w-[min(78vw,320px)] aspect-[13/17] min-h-[380px]">
                    <SaveTheDateCard
                      templateId={selectedTemplate}
                      names={{ partner1: partner1Name, partner2: partner2Name }}
                      date={formattedWeddingDate}
                      venue={venue}
                      design={{ align: textAlign, layout }}
                      onLayoutChange={updateElement}
                      selectedElement={selectedElement}
                      onSelectElement={setSelectedElement}
                      isEditable={true}
                      isFlipped={showRsvpBack}
                      onFlip={() => setShowRsvpBack(!showRsvpBack)}
                    />
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="p1-mobile" className="text-xs text-muted-foreground">Bride</Label>
                      <Input id="p1-mobile" value={partner1Name} onChange={(e) => setPartner1Name(e.target.value)} className="h-9 text-base md:text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="p2-mobile" className="text-xs text-muted-foreground">Groom</Label>
                      <Input id="p2-mobile" value={partner2Name} onChange={(e) => setPartner2Name(e.target.value)} className="h-9 text-base md:text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="venue-mobile" className="text-xs text-muted-foreground">Venue</Label>
                    <Input id="venue-mobile" value={venue} onChange={(e) => setVenue(e.target.value)} className="h-9 text-base md:text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Design</Label>
                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 snap-x snap-mandatory">
                      {saveTheDateTemplates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => updateTemplate(template.id)}
                          className={`shrink-0 snap-start rounded-lg overflow-hidden border-2 transition-all ${
                            selectedTemplate === template.id
                              ? "border-zinc-900 shadow-md"
                              : "border-zinc-200 opacity-75 hover:opacity-100"
                          }`}
                        >
                          <div className="relative w-20 h-[104px] overflow-hidden" style={{ backgroundColor: template.paper }}>
                            <template.Decor />
                            <span
                              className="absolute inset-0 flex items-center justify-center text-xs"
                              style={{ fontFamily: template.nameFont, color: template.ink }}
                            >
                              A&nbsp;&amp;&nbsp;J
                            </span>
                          </div>
                          <p className="text-[10px] py-1 px-1 truncate w-20 bg-white text-zinc-600">{template.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">
                        {selectedElement ? ELEMENT_LABELS[selectedElement] : "Nothing selected"}
                      </Label>
                      <button
                        type="button"
                        onClick={resetLayout}
                        className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
                      >
                        Reset layout
                      </button>
                    </div>
                    <Slider
                      value={[selectedLayout.scale]}
                      min={SCALE_MIN}
                      max={SCALE_MAX}
                      step={0.02}
                      disabled={!selectedElement}
                      onValueChange={([v]) =>
                        selectedElement && updateElement(selectedElement, { ...selectedLayout, scale: v })
                      }
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Tap a line or the flowers to select it, then drag to move. Arrow keys nudge; hold shift for bigger steps. Easier on a laptop, where there is room to work.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Text Alignment</Label>
                    <div className="flex gap-1.5">
                      {alignOptions.map(({ value, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => updateAlign(value)}
                          className={`flex-1 flex items-center justify-center h-9 rounded-md border transition-all ${
                            textAlign === value
                              ? "border-zinc-900 bg-zinc-100 text-zinc-900"
                              : "border-zinc-200 text-zinc-400 hover:border-zinc-300"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full gap-2" onClick={copyInvitationLink}>
                    <Copy className="h-4 w-4" />
                    Copy Invitation Link
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop: Side-by-side */}
          <div className="hidden lg:grid lg:grid-cols-[380px_1fr]">
            <div className="bg-white p-6 border-r flex flex-col gap-5">
              <div>
                <CardTitle className="font-serif">Design your Card</CardTitle>
                <CardDescription>Customize your save-the-date</CardDescription>
              </div>
              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="p1" className="text-xs font-medium text-muted-foreground">Bride</Label>
                    <Input id="p1" value={partner1Name} onChange={(e) => setPartner1Name(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p2" className="text-xs font-medium text-muted-foreground">Groom</Label>
                    <Input id="p2" value={partner2Name} onChange={(e) => setPartner2Name(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue" className="text-xs font-medium text-muted-foreground">Venue</Label>
                  <Input id="venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Choose Design</Label>
                  <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1">
                    {saveTheDateTemplates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => updateTemplate(template.id)}
                        className={`rounded-lg overflow-hidden border-2 transition-all text-left ${
                          selectedTemplate === template.id
                            ? "border-zinc-900 shadow-md"
                            : "border-zinc-200 opacity-80 hover:opacity-100 hover:border-zinc-400"
                        }`}
                      >
                        <div className="relative w-full h-24 overflow-hidden" style={{ backgroundColor: template.paper }}>
                          <template.Decor />
                          <span
                            className="absolute inset-0 flex items-center justify-center text-xs"
                            style={{ fontFamily: template.nameFont, color: template.ink }}
                          >
                            A&nbsp;&amp;&nbsp;J
                          </span>
                        </div>
                        <p className="text-[10px] py-1 px-1.5 truncate bg-white text-zinc-600 font-medium">{template.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">
                      {selectedElement ? ELEMENT_LABELS[selectedElement] : "Nothing selected"}
                    </Label>
                    <button
                      type="button"
                      onClick={resetLayout}
                      className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
                    >
                      Reset layout
                    </button>
                  </div>
                  <Slider
                    value={[selectedLayout.scale]}
                    min={SCALE_MIN}
                    max={SCALE_MAX}
                    step={0.02}
                    disabled={!selectedElement}
                    onValueChange={([v]) =>
                      selectedElement && updateElement(selectedElement, { ...selectedLayout, scale: v })
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Tap a line or the flowers to select it, then drag to move. Arrow keys nudge; hold shift for bigger steps.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Text Alignment</Label>
                  <div className="flex gap-1.5">
                    {alignOptions.map(({ value, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateAlign(value)}
                        className={`flex-1 flex items-center justify-center h-9 rounded-md border transition-all ${
                          textAlign === value
                            ? "border-zinc-900 bg-zinc-100 text-zinc-900"
                            : "border-zinc-200 text-zinc-400 hover:border-zinc-300"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <Button className="w-full gap-2" onClick={copyInvitationLink}>
                  <Copy className="h-4 w-4" />
                  Copy Invitation Link
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Tap card to preview RSVP form
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-zinc-100 to-zinc-200/80 p-8 flex items-center justify-center min-h-[520px]">
              <div className="w-full max-w-sm h-[480px]">
                <SaveTheDateCard
                  templateId={selectedTemplate}
                  names={{ partner1: partner1Name, partner2: partner2Name }}
                  date={formattedWeddingDate}
                  venue={venue}
                  design={{ align: textAlign, layout }}
                      onLayoutChange={updateElement}
                      selectedElement={selectedElement}
                      onSelectElement={setSelectedElement}
                  isEditable={true}
                  isFlipped={showRsvpBack}
                  onFlip={() => setShowRsvpBack(!showRsvpBack)}
                />
              </div>
            </div>
          </div>
        </Card>
  );
};

export default InvitationCardDesigner;
