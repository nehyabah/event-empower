-- A moment on the couple's timeline no longer needs a headline.
--
-- "What happened" was required, so every entry had to be given a name before it
-- could be saved. Plenty of moments are just a date and a photo, or a date and
-- a paragraph — forcing a title on those makes couples invent one, and an
-- invented headline reads worse than none at all.
--
-- Existing titles are untouched; this only stops the column insisting.
ALTER TABLE story_timeline_events ALTER COLUMN title DROP NOT NULL;

-- Anything already saved as an empty string is the same thing as absent, and
-- the site renders the heading only when there is one.
UPDATE story_timeline_events SET title = NULL WHERE btrim(coalesce(title, '')) = '';
