-- Create card_groups table
CREATE TABLE IF NOT EXISTS card_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Group',
  color TEXT NOT NULL DEFAULT 'neutral',
  collapsed BOOLEAN NOT NULL DEFAULT FALSE,
  locked BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  x DOUBLE PRECISION NOT NULL DEFAULT 0,
  y DOUBLE PRECISION NOT NULL DEFAULT 0,
  width DOUBLE PRECISION NOT NULL DEFAULT 400,
  height DOUBLE PRECISION NOT NULL DEFAULT 300,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add group_id to reference_cards
ALTER TABLE reference_cards
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES card_groups(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_card_groups_board_id ON card_groups(board_id);
CREATE INDEX IF NOT EXISTS idx_reference_cards_group_id ON reference_cards(group_id);

-- Enable RLS
ALTER TABLE card_groups ENABLE ROW LEVEL SECURITY;

-- Public access policy
CREATE POLICY "Allow all access to card_groups" ON card_groups FOR ALL USING (true) WITH CHECK (true);
