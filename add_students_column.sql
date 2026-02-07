-- Add students column to firms table
ALTER TABLE firms ADD COLUMN IF NOT EXISTS students TEXT;
