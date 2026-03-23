-- TTPD Anthology tracks (17-31) are deluxe edition bonus tracks, not vault tracks.
-- Align with Midnights 3am/Til Dawn edition tracks which are already is_vault = false.
UPDATE songs
SET is_vault = false
WHERE album = 'The Tortured Poets Department'
  AND track_number >= 17;
