-- Add embed_html column to reference_cards for embedded content (TikTok, YouTube, etc.)
ALTER TABLE reference_cards
ADD COLUMN IF NOT EXISTS embed_html TEXT DEFAULT NULL;

