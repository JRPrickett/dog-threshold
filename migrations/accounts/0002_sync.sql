-- Account IDs always come from the authenticated session. Delete cascades remove all private data.
CREATE TABLE sync_changes (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  mutation_id TEXT NOT NULL,
  record_key TEXT NOT NULL,
  value_json TEXT,
  UNIQUE(user_id, mutation_id)
);
CREATE INDEX sync_changes_user_cursor ON sync_changes(user_id, seq);
CREATE TABLE sync_records (
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  record_key TEXT NOT NULL,
  revision INTEGER NOT NULL,
  value_json TEXT,
  PRIMARY KEY(user_id, record_key)
);
