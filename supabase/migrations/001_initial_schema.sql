-- Create boards table
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  synthesis_output JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reference_cards table
CREATE TABLE reference_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'file', 'link', 'text')),
  source TEXT NOT NULL CHECK (source IN ('upload', 'instagram', 'tiktok', 'youtube', 'twitter', 'pinterest', 'arena', 'googledoc', 'notion', 'web')),
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  url TEXT,
  file_path TEXT,
  user_note TEXT,
  tags TEXT[] DEFAULT '{}',
  role TEXT CHECK (role IN ('lighting', 'styling', 'pose', 'composition', 'set', 'color', 'general')),
  pinned BOOLEAN DEFAULT FALSE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster board lookups
CREATE INDEX idx_reference_cards_board_id ON reference_cards(board_id);
CREATE INDEX idx_reference_cards_position ON reference_cards(board_id, position);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for boards updated_at
CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional for MVP, but good practice)
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth in MVP)
CREATE POLICY "Allow all access to boards" ON boards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to reference_cards" ON reference_cards FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket for uploads (run this in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('references', 'references', true);

