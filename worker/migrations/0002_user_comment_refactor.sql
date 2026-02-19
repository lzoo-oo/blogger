PRAGMA foreign_keys = ON;

ALTER TABLE users ADD COLUMN user_type TEXT NOT NULL DEFAULT 'real';
ALTER TABLE users ADD COLUMN status INTEGER NOT NULL DEFAULT 1;

ALTER TABLE comments ADD COLUMN user_id INTEGER;

INSERT INTO users (username, password, nickname, avatar, email, role, user_type, status, created_at, updated_at)
SELECT
  'legacy_guest',
  'da9de0cfce0f6f6498f49f8e43eca58b706fb4e6f61722e001452df950f43e45',
  'legacy_guest',
  '',
  '',
  'user',
  'guest',
  1,
  datetime('now'),
  datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'legacy_guest');

UPDATE comments
SET user_id = (SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1)
WHERE is_admin = 1 AND user_id IS NULL;

UPDATE comments
SET user_id = (SELECT id FROM users WHERE username = 'legacy_guest' LIMIT 1)
WHERE is_admin = 0 AND user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
