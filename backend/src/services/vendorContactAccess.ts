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
export function maskVendorContact<T extends ContactFields>(
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
    contact_unlocked: false,
  };
}
