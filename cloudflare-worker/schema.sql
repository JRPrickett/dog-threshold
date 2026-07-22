CREATE TABLE IF NOT EXISTS usage_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL
    CHECK (event_name IN ('session_started', 'session_saved')),
  app_version TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  received_at TEXT NOT NULL DEFAULT (datetime('now')),
  dog_name TEXT,
  target_seconds INTEGER,
  stopped INTEGER CHECK (stopped IS NULL OR stopped IN (0, 1)),
  session_type TEXT CHECK (session_type IS NULL OR session_type IN ('absence', 'door')),
  device_type TEXT CHECK (device_type IS NULL OR device_type IN ('mobile', 'tablet', 'desktop', 'unknown')),
  browser TEXT
);

CREATE INDEX IF NOT EXISTS idx_usage_events_received
  ON usage_events(received_at);

CREATE INDEX IF NOT EXISTS idx_usage_events_name_received
  ON usage_events(event_name, received_at);


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
