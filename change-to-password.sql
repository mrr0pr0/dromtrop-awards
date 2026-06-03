-- Add password storage for NextAuth credentials login
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Optional, lets Neon generate UUIDs in SQL
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add / accept a user
-- They will set their password the first time they log in.
INSERT INTO users (id, email, status, role)
VALUES (gen_random_uuid()::text, 'user@example.com', 'approved', 'user')
ON CONFLICT (email) DO UPDATE SET
  status = 'approved',
  role = COALESCE(users.role, 'user');

-- Make a user admin
UPDATE users
SET role = 'admin', status = 'approved'
WHERE LOWER(email) = LOWER('admin@example.com');

-- Reject / unaccept a user
UPDATE users
SET status = 'pending'
WHERE LOWER(email) = LOWER('user@example.com');