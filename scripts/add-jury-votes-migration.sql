-- Separate table for jury votes; keeps them isolated from audience votes
CREATE TABLE IF NOT EXISTS jury_votes (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  nominee_id  INTEGER NOT NULL REFERENCES nominees(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_jury_votes_category ON jury_votes(category_id);
CREATE INDEX IF NOT EXISTS idx_jury_votes_user ON jury_votes(user_id);
