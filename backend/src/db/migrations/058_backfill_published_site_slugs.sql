-- A wedding site could be marked published with no slug. /s/:slug then has
-- nothing to resolve, so the site was unreachable and the post-RSVP redirect
-- had nowhere to send guests. Publishing now always generates a slug; this
-- fills in the rows that were published before that was true.
UPDATE couple_stories cs
SET slug = base.candidate
FROM (
  SELECT cs2.id,
         COALESCE(
           NULLIF(
             regexp_replace(
               lower(
                 concat_ws('-and-',
                   NULLIF(COALESCE(cs2.bride_name, ue.partner1_name), ''),
                   NULLIF(COALESCE(cs2.groom_name, ue.partner2_name), '')
                 )
               ),
               '[^a-z0-9]+', '-', 'g'
             ),
             ''
           ),
           'our-wedding'
         ) AS candidate
  FROM couple_stories cs2
  LEFT JOIN user_events ue ON ue.user_id = cs2.user_id
  WHERE cs2.site_published = TRUE AND cs2.slug IS NULL
) base
WHERE cs.id = base.id
  -- Never collide with a slug someone already holds.
  AND NOT EXISTS (SELECT 1 FROM couple_stories x WHERE x.slug = base.candidate);

-- Trim any stray leading/trailing hyphens the regex may leave behind.
UPDATE couple_stories
SET slug = trim(both '-' from slug)
WHERE slug IS NOT NULL AND (slug LIKE '-%' OR slug LIKE '%-');
