import { queryOne } from '../config/database.js';

/**
 * Who may see a vendor's direct contact details.
 *
 * The directory is browsable by anyone, but a vendor's phone, email, website
 * and socials stay hidden until there is a booking. Until then the platform
 * is the only channel, which is what keeps a record of what was agreed and
 * gives an unhappy couple something to point at.
 *
 * Masking happens here, on the server. Hiding these fields in the UI while
 * still sending them in the JSON would not be a safety measure - anyone
 * could read them straight out of the network tab.
 */

/** Booked or confirmed, the same bar the review system already uses. */
const UNLOCKED_STATUSES = "('booked', 'confirmed')";

export async function canSeeVendorContact(
  viewerUserId: string | undefined,
  vendorProfileId: string
): Promise<boolean> {
  if (!viewerUserId) return false;

  // The vendor themselves, and an admin, always see it.
  const self = await queryOne<{ id: string }>(
    `SELECT u.id
       FROM users u
       LEFT JOIN vendor_profiles vp ON vp.user_id = u.id AND vp.id = $2
      WHERE u.id = $1
        AND (u.user_type = 'admin' OR vp.id IS NOT NULL)`,
    [viewerUserId, vendorProfileId]
  );
  if (self) return true;

  // A couple who has booked them, or the planner on that couple's wedding.
  const booked = await queryOne<{ id: string }>(
    `SELECT pv.id
       FROM project_vendors pv
       JOIN user_events ue ON ue.id = pv.event_id
      WHERE pv.vendor_profile_id = $2
        AND pv.status IN ${UNLOCKED_STATUSES}
        AND (
          ue.user_id = $1
          OR ue.planner_id = $1
          OR EXISTS (
            SELECT 1 FROM planner_clients pc
             WHERE pc.user_id = ue.user_id
               AND pc.planner_id = $1
               AND pc.invite_status = 'accepted'
          )
        )
      LIMIT 1`,
    [viewerUserId, vendorProfileId]
  );
  return Boolean(booked);
}

/**
 * Hides the middle of a business name, leaving the first and last word.
 *
 * A couple should be judging the portfolio, not searching the business up
 * and arranging things off-platform before anything is booked.
 *
 * Honest limitation: a two-word name has no middle, so the rule as stated
 * would hide nothing. Those fall back to masking the interior of the last
 * word, which is weaker - a short name is simply harder to obscure while
 * staying recognisable.
 */
export function maskBusinessName(name: string | null | undefined): string {
  if (!name) return 'Vendor';
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'Vendor';

  const veil = (w: string) =>
    w.length <= 2 ? '•'.repeat(w.length) : w[0] + '•'.repeat(Math.max(2, w.length - 1));

  if (words.length >= 3) {
    return [words[0], '•••', words[words.length - 1]].join(' ');
  }
  if (words.length === 2) {
    return `${words[0]} ${veil(words[1])}`;
  }
  return veil(words[0]);
}

type ContactFields = {
  email: string | null;
  phone: string | null;
  website: string | null;
  social_links: unknown;
};

/**
 * Blanks the direct-contact fields. Returns the same shape so callers and
 * the frontend types stay unchanged; `contact_unlocked` tells the UI whether
 * to render the details or the locked state.
 */
export function maskVendorContact<T extends ContactFields & { business_name?: string }>(
  profile: T,
  unlocked: boolean
): T & { contact_unlocked: boolean } {
  if (unlocked) return { ...profile, contact_unlocked: true };
  return {
    ...profile,
    email: null,
    phone: null,
    website: null,
    social_links: [],
    ...(profile.business_name !== undefined
      ? { business_name: maskBusinessName(profile.business_name) }
      : {}),
    contact_unlocked: false,
  };
}
