/**
 * The one link a couple hands out.
 *
 * There were two: the designer shared /invitation/<code>, which opens the
 * card the couple designed and flips to the RSVP on its back, while the RSVP
 * settings shared /rsvp/<code>, a bare form with no card at all. Same
 * invitation, two different experiences, depending on which tab you happened
 * to copy from.
 *
 * The card is the invitation, so that is what gets sent. /rsvp/<code> still
 * works — the card's own back links there, and older shared links must keep
 * working — but it is no longer something we hand out.
 *
 * The design choices ride along in the query string so the guest sees the card
 * as it was designed, not the default.
 */

const TEMPLATE_KEY = "saveTheDateTemplate";
const ALIGN_KEY = "saveTheDateAlign";
const LAYOUT_KEY = "saveTheDateLayout";

export const buildInvitationLink = (rsvpCode: string | null | undefined): string | null => {
  if (!rsvpCode) return null;

  // Was "dusty-blue-romance", which no longer exists — a link built before
  // the couple picked anything would have named a deleted template.
  let template = "plain-ivory";
  let align = "center";
  let layout = { offsetX: 0, offsetY: 0, scale: 1 };
  try {
    template = localStorage.getItem(TEMPLATE_KEY) || template;
    align = localStorage.getItem(ALIGN_KEY) || align;
    const saved = JSON.parse(localStorage.getItem(LAYOUT_KEY) || "null");
    if (saved && typeof saved === "object") {
      layout = {
        offsetX: Number(saved.offsetX) || 0,
        offsetY: Number(saved.offsetY) || 0,
        scale: Number(saved.scale) || 1,
      };
    }
  } catch {
    // Private browsing can throw on access; the defaults are fine.
  }

  const params = new URLSearchParams({ t: template, a: align });
  // Only sent when moved from the default, so an untouched card keeps a
  // short, readable link.
  if (layout.offsetX) params.set("x", layout.offsetX.toFixed(1));
  if (layout.offsetY) params.set("y", layout.offsetY.toFixed(1));
  if (layout.scale !== 1) params.set("s", layout.scale.toFixed(2));

  return `${window.location.origin}/invitation/${rsvpCode}?${params.toString()}`;
};

export default buildInvitationLink;
