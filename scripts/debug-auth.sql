-- 1. Pre-approve an Email
-- Run this to whitelist an email address so it auto-approves when they first sign in.
INSERT INTO approved_emails (email) 
VALUES ('user@example.com')
ON CONFLICT (email) DO NOTHING;

-- 2. Verify Whitelisted Emails
-- Run this to view all pre-approved emails in the database.
SELECT id, email, created_at 
FROM approved_emails;

-- 3. Check User Status
-- Run this to verify the registration status and role of a user.
SELECT id, email, name, status, role 
FROM users 
WHERE LOWER(email) = LOWER('user@example.com');
