-- Add originalReport and jobBody columns to reports table
ALTER TABLE reports ADD COLUMN IF NOT EXISTS originalReport jsonb;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS jobBody text;
