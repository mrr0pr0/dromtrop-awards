-- Migration: Add approval status to nominees.
ALTER TABLE nominees
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';

UPDATE nominees
SET status = 'approved'
WHERE status IS NULL;

ALTER TABLE nominees
ALTER COLUMN status SET DEFAULT 'approved';

ALTER TABLE nominees
ALTER COLUMN status SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'nominees_status_check'
  ) THEN
    ALTER TABLE nominees
    ADD CONSTRAINT nominees_status_check
    CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_nominees_status
ON nominees(status);
