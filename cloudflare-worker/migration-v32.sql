CREATE TABLE IF NOT EXISTS app_open_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_version TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  received_at TEXT NOT NULL DEFAULT (datetime('now')),
  dog_name TEXT,
  device_type TEXT,
  browser TEXT,
  operating_system TEXT,
  display_mode TEXT CHECK (display_mode IN ('standalone', 'browser'))
);

CREATE INDEX IF NOT EXISTS idx_app_open_events_received
  ON app_open_events(received_at);

CREATE INDEX IF NOT EXISTS idx_app_open_events_platform
  ON app_open_events(operating_system, display_mode, received_at);
