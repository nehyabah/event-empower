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

export const buildInvitationLink = (rsvpCode: string | null | undefined): string | null => {
  if (!rsvpCode) return null;

  let template = "dusty-blue-romance";
  let align = "center";
  try {
    template = localStorage.getItem(TEMPLATE_KEY) || template;
    align = localStorage.getItem(ALIGN_KEY) || align;
  } catch {
    // Private browsing can throw on access; the defaults are fine.
  }

  return `${window.location.origin}/invitation/${rsvpCode}?t=${template}&a=${align}`;
};

export default buildInvitationLink;
