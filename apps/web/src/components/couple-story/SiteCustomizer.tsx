import { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Palette,
  Type,
  LayoutList,
  Link2,
  Eye,
  EyeOff,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { siteThemes, fontPairs, SECTION_LABELS, type ThemeConfig } from "@/lib/siteThemes";
import storyService from "@/services/api/storyService";
import { toast } from "sonner";

interface SiteCustomizerProps {
  open: boolean;
  onClose: () => void;
  selectedTheme: string;
  onThemeChange: (themeId: string) => void;
  accentColor: string | null;
  onAccentColorChange: (color: string | null) => void;
  fontPair: string;
  onFontPairChange: (fontId: string) => void;
  sectionOrder: string[];
  onSectionOrderChange: (order: string[]) => void;
  hiddenSections: string[];
  onHiddenSectionsChange: (hidden: string[]) => void;
  slug: string | null;
  onSlugChange: (slug: string | null) => void;
  sitePublished: boolean;
  onPublishedChange: (published: boolean) => void;
}

const ACCENT_PRESETS = [
  "#78716c", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6",
  "#ec4899", "#f43f5e", "#d4a574", "#1e293b",
];

const SiteCustomizer = ({
  open,
  onClose,
  selectedTheme,
  onThemeChange,
  accentColor,
  onAccentColorChange,
  fontPair: currentFontPair,
  onFontPairChange,
  sectionOrder,
  onSectionOrderChange,
  hiddenSections,
  onHiddenSectionsChange,
  slug,
  onSlugChange,
  sitePublished,
  onPublishedChange,
}: SiteCustomizerProps) => {
  const [slugInput, setSlugInput] = useState(slug || "");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [activeTab, setActiveTab] = useState<"theme" | "colors" | "fonts" | "sections" | "url" | "publish">("theme");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setSlugInput(slug || "");
  }, [slug]);

  const checkSlug = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setSlugAvailable(null);
      return;
    }
    setCheckingSlug(true);
    try {
      const result = await storyService.checkSlugAvailability(value);
      setSlugAvailable(result.available);
    } catch {
      setSlugAvailable(null);
    } finally {
      setCheckingSlug(false);
    }
  }, []);

  const handleSlugInputChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlugInput(sanitized);
    setSlugAvailable(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkSlug(sanitized), 500);
  };

  const saveSlug = async () => {
    if (!slugInput || slugInput.length < 3) {
      toast.error("Slug must be at least 3 characters");
      return;
    }
    try {
      await storyService.updateMyStory({ slug: slugInput });
      onSlugChange(slugInput);
      toast.success("Custom URL saved!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save URL");
    }
  };

  const handleSaveField = async (field: string, value: any) => {
    try {
      await storyService.updateMyStory({ [field]: value });
    } catch {
      toast.error("Failed to save changes");
    }
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newOrder = [...sectionOrder];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newOrder.length) return;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
    onSectionOrderChange(newOrder);
    handleSaveField("section_order", newOrder);
  };

  const toggleSection = (sectionId: string) => {
    const newHidden = hiddenSections.includes(sectionId)
      ? hiddenSections.filter((s) => s !== sectionId)
      : [...hiddenSections, sectionId];
    onHiddenSectionsChange(newHidden);
    handleSaveField("hidden_sections", newHidden);
  };

  if (!open) return null;

  const tabs = [
    { id: "theme" as const, label: "Theme", icon: Palette },
    { id: "colors" as const, label: "Colors", icon: Palette },
    { id: "fonts" as const, label: "Fonts", icon: Type },
    { id: "sections" as const, label: "Sections", icon: LayoutList },
    { id: "url" as const, label: "URL", icon: Link2 },
    { id: "publish" as const, label: "Publish", icon: Eye },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-[60] backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Customize Site</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-400 hover:text-stone-600"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Theme Gallery */}
          {activeTab === "theme" && (
            <div className="grid grid-cols-2 gap-3">
              {siteThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    onThemeChange(theme.id);
                    handleSaveField("template_id", theme.id);
                  }}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                    selectedTheme === theme.id
                      ? "border-stone-900 shadow-lg"
                      : "border-stone-100 hover:border-stone-300"
                  }`}
                >
                  <div className={`w-full h-16 rounded-lg mb-3 ${theme.previewColor} border border-stone-100`} />
                  <p className="text-sm font-medium text-stone-800">{theme.name}</p>
                  {selectedTheme === theme.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Colors */}
          {activeTab === "colors" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-stone-700 mb-3 block">
                  Accent Color
                </label>
                <div className="grid grid-cols-6 gap-2 mb-4">
                  {ACCENT_PRESETS.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        onAccentColorChange(color);
                        handleSaveField("accent_color", color);
                      }}
                      className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                        accentColor === color ? "border-stone-900 scale-110" : "border-stone-200"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="#hex"
                    value={accentColor || ""}
                    onChange={(e) => {
                      onAccentColorChange(e.target.value || null);
                    }}
                    onBlur={() => handleSaveField("accent_color", accentColor)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onAccentColorChange(null);
                      handleSaveField("accent_color", null);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Fonts */}
          {activeTab === "fonts" && (
            <div className="space-y-3">
              {fontPairs.map((fp) => (
                <button
                  key={fp.id}
                  onClick={() => {
                    onFontPairChange(fp.id);
                    handleSaveField("font_pair", fp.id);
                  }}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    currentFontPair === fp.id
                      ? "border-stone-900 bg-stone-50"
                      : "border-stone-100 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-stone-700">{fp.name}</span>
                    {currentFontPair === fp.id && <Check className="w-4 h-4 text-stone-900" />}
                  </div>
                  <p className={`text-2xl ${fp.headingClass} text-stone-800`}>
                    Sarah & James
                  </p>
                  <p className={`text-sm mt-1 ${fp.bodyClass} text-stone-500`}>
                    {fp.heading} + {fp.body}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Sections */}
          {activeTab === "sections" && (
            <div className="space-y-2">
              <p className="text-xs text-stone-400 mb-3">
                Reorder and toggle visibility of sections on your wedding site.
              </p>
              {sectionOrder.map((sectionId, index) => {
                const isHidden = hiddenSections.includes(sectionId);
                return (
                  <div
                    key={sectionId}
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                      isHidden ? "border-stone-100 bg-stone-50 opacity-60" : "border-stone-200 bg-white"
                    }`}
                  >
                    <GripVertical className="w-4 h-4 text-stone-300 shrink-0" />
                    <span className="flex-1 text-sm font-medium text-stone-700">
                      {SECTION_LABELS[sectionId] || sectionId}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveSection(index, "up")}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-stone-100 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveSection(index, "down")}
                        disabled={index === sectionOrder.length - 1}
                        className="p-1 rounded hover:bg-stone-100 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleSection(sectionId)}
                        className="p-1 rounded hover:bg-stone-100"
                      >
                        {isHidden ? (
                          <EyeOff className="w-4 h-4 text-stone-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-stone-600" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* URL */}
          {activeTab === "url" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-stone-700 mb-2 block">
                  Custom URL
                </label>
                <p className="text-xs text-stone-400 mb-3">
                  Create a memorable link for your wedding site.
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-stone-400 whitespace-nowrap">/s/</span>
                  <Input
                    value={slugInput}
                    onChange={(e) => handleSlugInputChange(e.target.value)}
                    placeholder="sarah-and-james"
                    className="flex-1"
                  />
                </div>

                {slugInput.length >= 3 && (
                  <div className="flex items-center gap-2 text-sm">
                    {checkingSlug ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                        <span className="text-stone-400">Checking...</span>
                      </>
                    ) : slugAvailable === true ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-green-600">Available!</span>
                      </>
                    ) : slugAvailable === false ? (
                      <>
                        <X className="w-4 h-4 text-red-500" />
                        <span className="text-red-600">Already taken</span>
                      </>
                    ) : null}
                  </div>
                )}

                <Button
                  onClick={saveSlug}
                  disabled={!slugInput || slugInput.length < 3 || slugAvailable === false || checkingSlug}
                  className="w-full mt-4"
                >
                  Save URL
                </Button>

                {slug && (
                  <p className="text-xs text-stone-400 mt-3">
                    Current URL: <span className="font-mono text-stone-600">/s/{slug}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Publish */}
          {activeTab === "publish" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-stone-200">
                <div>
                  <p className="font-medium text-stone-800">Site Published</p>
                  <p className="text-sm text-stone-400 mt-1">
                    {sitePublished
                      ? "Your site is visible to anyone with the link."
                      : "Your site is hidden from the public."}
                  </p>
                </div>
                <Switch
                  checked={sitePublished}
                  onCheckedChange={(checked) => {
                    onPublishedChange(checked);
                    handleSaveField("site_published", checked);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SiteCustomizer;
