/**
 * The wedding site's sections, in one place.
 *
 * Previously a section's identity was spread across three files: the page
 * decided what to render, SiteCustomizer decided what could be reordered or
 * hidden, and StoryEditor's seven tabs decided what could be edited. They did
 * not agree — the page renders eleven sections, the editor covered seven, and
 * four (quote, details, wishes, registry) had no obvious home at all.
 *
 * Everything about a section now hangs off this list: its label, what it is
 * for, and how to tell whether the couple has actually filled it in.
 */

export type SectionId =
  | "hero"
  | "quote"
  | "couple"
  | "gallery"
  | "timeline"
  | "wedding-party"
  | "details"
  | "travel"
  | "wishes"
  | "registry"
  | "faq";

/** Everything a section needs to judge its own completeness. */
export interface SectionContext {
  story: {
    title?: string | null;
    content?: string | null;
    love_quote?: string | null;
    wedding_date?: string | null;
    venue?: string | null;
    banner_image_url?: string | null;
    bride_name?: string | null;
    bride_bio?: string | null;
    bride_image_url?: string | null;
    groom_name?: string | null;
    groom_bio?: string | null;
    groom_image_url?: string | null;
  } | null;
  galleryCount: number;
  timelineCount: number;
  partyCount: number;
  travelCount: number;
  faqCount: number;
  wishesCount: number;
  registryCount: number;
}

export interface SectionDef {
  id: SectionId;
  label: string;
  /** One line explaining what the section is, shown under the label. */
  blurb: string;
  /** Sections a guest expects; flagged when empty rather than merely blank. */
  important: boolean;
  /** Whether the couple has put anything in it. */
  isComplete: (ctx: SectionContext) => boolean;
  /** Short status when incomplete, e.g. "No photos yet". */
  emptyHint: string;
}

const filled = (v: unknown) => typeof v === "string" && v.trim() !== "";

export const SECTIONS: SectionDef[] = [
  {
    id: "hero",
    label: "Hero banner",
    blurb: "The first thing guests see — your names, date and a photo.",
    important: true,
    isComplete: (c) => filled(c.story?.banner_image_url) && filled(c.story?.title),
    emptyHint: "Needs a title and a banner photo",
  },
  {
    id: "quote",
    label: "Love quote",
    blurb: "A short line that sets the tone.",
    important: false,
    isComplete: (c) => filled(c.story?.love_quote),
    emptyHint: "No quote yet",
  },
  {
    id: "couple",
    label: "Bride & groom",
    blurb: "A short introduction to each of you.",
    important: true,
    isComplete: (c) =>
      filled(c.story?.bride_name) &&
      filled(c.story?.groom_name) &&
      (filled(c.story?.bride_bio) || filled(c.story?.groom_bio)),
    emptyHint: "Names and at least one bio",
  },
  {
    id: "gallery",
    label: "Photo gallery",
    blurb: "Photos of the two of you.",
    important: true,
    isComplete: (c) => c.galleryCount > 0,
    emptyHint: "No photos yet",
  },
  {
    id: "timeline",
    label: "Our timeline",
    blurb: "How you met, and everything since.",
    important: false,
    isComplete: (c) => c.timelineCount > 0,
    emptyHint: "No moments added",
  },
  {
    id: "wedding-party",
    label: "Wedding party",
    blurb: "Bridesmaids, groomsmen and anyone standing with you.",
    important: false,
    isComplete: (c) => c.partyCount > 0,
    emptyHint: "Nobody added yet",
  },
  {
    id: "details",
    label: "When & where",
    blurb: "The date, time and venue guests need.",
    important: true,
    isComplete: (c) => filled(c.story?.wedding_date) && filled(c.story?.venue),
    emptyHint: "Needs a date and venue",
  },
  {
    id: "travel",
    label: "Travel & stay",
    blurb: "Hotels, directions and anything guests travelling in will need.",
    important: false,
    isComplete: (c) => c.travelCount > 0,
    emptyHint: "No travel info added",
  },
  {
    id: "wishes",
    label: "Well wishes",
    blurb: "Messages guests leave for you. Fills itself in.",
    important: false,
    isComplete: (c) => c.wishesCount > 0,
    emptyHint: "No wishes yet — guests add these",
  },
  {
    id: "registry",
    label: "Registry & gifts",
    blurb: "A gift list, and bank details if you would rather have cash.",
    important: false,
    isComplete: (c) => c.registryCount > 0,
    emptyHint: "Nothing added yet",
  },
  {
    id: "faq",
    label: "FAQ",
    blurb: "Dress code, children, parking — the questions you keep being asked.",
    important: false,
    isComplete: (c) => c.faqCount > 0,
    emptyHint: "No questions added",
  },
];

export const SECTION_BY_ID: Record<string, SectionDef> = Object.fromEntries(
  SECTIONS.map((s) => [s.id, s])
);

/**
 * How ready the site is to share, counting only the sections a guest would
 * actually miss. Optional ones stay optional rather than nagging.
 */
export function siteReadiness(ctx: SectionContext, hidden: string[]) {
  const relevant = SECTIONS.filter((s) => s.important && !hidden.includes(s.id));
  const done = relevant.filter((s) => s.isComplete(ctx));
  return {
    done: done.length,
    total: relevant.length,
    missing: relevant.filter((s) => !s.isComplete(ctx)),
  };
}
