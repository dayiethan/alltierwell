-- Add per-song image URL for non-album songs with individual cover art
ALTER TABLE songs ADD COLUMN image_url TEXT;

-- Populate non-album song images
UPDATE songs SET image_url = '/albums/singles/beautiful-eyes.png' WHERE title = 'Beautiful Eyes' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/crazier.png' WHERE title = 'Crazier' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/two-is-better-than-one.png' WHERE title = 'Two Is Better Than One' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/hold-on-live.png' WHERE title = 'Hold On — Live' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/safe-and-sound.png' WHERE title = 'Safe & Sound' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/eyes-open.png' WHERE title = 'Eyes Open' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/both-of-us.png' WHERE title = 'Both of Us' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/highway-dont-care.png' WHERE title = 'Highway Don''t Care' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/sweeter-than-fiction.png' WHERE title = 'Sweeter Than Fiction' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/i-dont-wanna-live-forever.png' WHERE title = 'I Don''t Wanna Live Forever' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/macavity.png' WHERE title = 'Macavity' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/beautiful-ghosts.png' WHERE title = 'Beautiful Ghosts' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/christmas-tree-farm.png' WHERE title = 'Christmas Tree Farm' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/only-the-young.png' WHERE title = 'Only The Young' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/renegade.png' WHERE title = 'Renegade' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/birch.png' WHERE title = 'Birch' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/gasoline.png' WHERE title = 'Gasoline' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/the-joker-and-the-queen.png' WHERE title = 'The Joker And The Queen' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/carolina.png' WHERE title = 'Carolina' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/all-of-the-girls-you-loved-before.png' WHERE title = 'All Of The Girls You Loved Before' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/youre-losing-me.png' WHERE title = 'You''re Losing Me (From The Vault)' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/the-alcott.png' WHERE title = 'The Alcott' AND album = 'Non-Album';
UPDATE songs SET image_url = '/albums/singles/us.png' WHERE title = 'us.' AND album = 'Non-Album';
