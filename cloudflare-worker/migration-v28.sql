-- Run this once against the existing threshold-analytics D1 database.
ALTER TABLE usage_events ADD COLUMN dog_name TEXT;
ALTER TABLE usage_events ADD COLUMN target_seconds INTEGER;
ALTER TABLE usage_events ADD COLUMN stopped INTEGER;
ALTER TABLE usage_events ADD COLUMN session_type TEXT;
ALTER TABLE usage_events ADD COLUMN device_type TEXT;
ALTER TABLE usage_events ADD COLUMN browser TEXT;
