-- Run once if users table already exists without Auth.js columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS image TEXT;

CREATE TABLE IF NOT EXISTS verification_token (
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);
