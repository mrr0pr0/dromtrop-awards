-- Migration: Add optional fields to nominees table for category-specific content
-- Date: 2026-06-03

BEGIN;

-- Add 4 new optional columns to nominees table
ALTER TABLE nominees ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE nominees ADD COLUMN IF NOT EXISTS site_url TEXT;
ALTER TABLE nominees ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE nominees ADD COLUMN IF NOT EXISTS what_we_made TEXT;

-- Verify migration
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'nominees'
ORDER BY ordinal_position;

COMMIT;
