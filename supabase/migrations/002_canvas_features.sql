-- Add canvas position columns to reference_cards
ALTER TABLE reference_cards
ADD COLUMN IF NOT EXISTS x DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS y DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS width DOUBLE PRECISION DEFAULT 200,
ADD COLUMN IF NOT EXISTS height DOUBLE PRECISION DEFAULT 200;

-- Create connections table for relationships between cards
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  source_card_id UUID NOT NULL REFERENCES reference_cards(id) ON DELETE CASCADE,
  target_card_id UUID NOT NULL REFERENCES reference_cards(id) ON DELETE CASCADE,
  label TEXT,
  color TEXT DEFAULT '#ffffff',
  style TEXT DEFAULT 'solid' CHECK (style IN ('solid', 'dashed', 'dotted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT different_cards CHECK (source_card_id != target_card_id)
);

-- Create canvas_labels table for text annotations
CREATE TABLE IF NOT EXISTS canvas_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  x DOUBLE PRECISION NOT NULL DEFAULT 0,
  y DOUBLE PRECISION NOT NULL DEFAULT 0,
  font_size INTEGER DEFAULT 16,
  color TEXT DEFAULT '#ffffff',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_connections_board_id ON connections(board_id);
CREATE INDEX IF NOT EXISTS idx_connections_source ON connections(source_card_id);
CREATE INDEX IF NOT EXISTS idx_connections_target ON connections(target_card_id);
CREATE INDEX IF NOT EXISTS idx_canvas_labels_board_id ON canvas_labels(board_id);

-- Enable RLS
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_labels ENABLE ROW LEVEL SECURITY;

-- Public access policies
CREATE POLICY "Allow all access to connections" ON connections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to canvas_labels" ON canvas_labels FOR ALL USING (true) WITH CHECK (true);

-- Add canvas viewport settings to boards
ALTER TABLE boards
ADD COLUMN IF NOT EXISTS canvas_zoom DOUBLE PRECISION DEFAULT 1,
ADD COLUMN IF NOT EXISTS canvas_offset_x DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS canvas_offset_y DOUBLE PRECISION DEFAULT 0;
