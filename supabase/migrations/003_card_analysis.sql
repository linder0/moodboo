-- Add analysis JSONB column to reference_cards for storing AI vision analysis
ALTER TABLE reference_cards
ADD COLUMN IF NOT EXISTS analysis JSONB;

-- Create index for faster queries on analysis data
CREATE INDEX IF NOT EXISTS idx_reference_cards_analysis ON reference_cards USING GIN (analysis);

-- Comment for documentation
COMMENT ON COLUMN reference_cards.analysis IS 'AI-generated visual analysis including palette, lighting, composition, mood, tags, and summary';
