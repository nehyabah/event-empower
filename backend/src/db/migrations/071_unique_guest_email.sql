-- One row per person on a guest list.
--
-- RSVP responses matched an existing guest by name alone, so replying as "Neh"
-- when the list said "Nehemiah" created a second row: the couple saw a stranger
-- accept while the person they invited still showed as pending. One list ended
-- up with the same address three times and got three copies of the invitation.
--
-- The matching bug is fixed in code; this stops the duplicates that are already
-- there, and makes a repeat impossible.

-- Normalise first, so the index below compares what normaliseEmail() writes.
UPDATE guests SET email = lower(btrim(email))
 WHERE email IS NOT NULL AND email <> lower(btrim(email));

UPDATE guests SET email = NULL WHERE btrim(coalesce(email, '')) = '';

-- Collapse existing duplicates, keeping the most informative row: someone who
-- answered outranks someone who never did, then the most recent answer, then
-- the oldest row. The survivor inherits an invitation timestamp from any of its
-- duplicates, so nobody is re-invited just because the row that recorded it was
-- the one removed.
WITH ranked AS (
  SELECT id, user_id, email,
         row_number() OVER (
           PARTITION BY user_id, email
           ORDER BY (rsvp_responded_at IS NOT NULL) DESC,
                    rsvp_responded_at DESC NULLS LAST,
                    created_at ASC
         ) AS rn
    FROM guests
   WHERE email IS NOT NULL
),
keepers AS (SELECT id, user_id, email FROM ranked WHERE rn = 1),
carried AS (
  SELECT k.id, min(g.invitation_sent_at) AS invited_at
    FROM keepers k
    JOIN guests g ON g.user_id = k.user_id AND g.email = k.email
   WHERE g.invitation_sent_at IS NOT NULL
   GROUP BY k.id
)
UPDATE guests SET invitation_sent_at = carried.invited_at
  FROM carried WHERE guests.id = carried.id AND guests.invitation_sent_at IS NULL;

WITH ranked AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY user_id, email
           ORDER BY (rsvp_responded_at IS NOT NULL) DESC,
                    rsvp_responded_at DESC NULLS LAST,
                    created_at ASC
         ) AS rn
    FROM guests
   WHERE email IS NOT NULL
)
DELETE FROM guests WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Guests with no address are left alone: a couple may legitimately have several
-- people they only have a phone number for.
CREATE UNIQUE INDEX IF NOT EXISTS idx_guests_unique_email
  ON guests(user_id, email) WHERE email IS NOT NULL;
