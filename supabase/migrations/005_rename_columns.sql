-- Rename columns to match TypeScript types
ALTER TABLE reference_cards RENAME COLUMN url TO source_url;
ALTER TABLE reference_cards RENAME COLUMN user_note TO notes;


