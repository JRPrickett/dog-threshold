CREATE TABLE IF NOT EXISTS usage_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL
    CHECK (event_name IN ('session_started', 'session_saved')),
  app_version TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  received_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_usage_events_received
  ON usage_events(received_at);

CREATE INDEX IF NOT EXISTS idx_usage_events_name_received
  ON usage_events(event_name, received_at);
