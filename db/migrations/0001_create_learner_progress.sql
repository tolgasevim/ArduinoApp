-- Migration: 0001_create_learner_progress
-- Creates the central table that stores each learner's progress.
-- user_id is a client-generated UUID (stable per browser / device).

CREATE TABLE IF NOT EXISTS learner_progress (
  user_id               TEXT PRIMARY KEY,
  nickname              TEXT,
  xp                    INTEGER NOT NULL DEFAULT 0,
  badges                TEXT    NOT NULL DEFAULT '[]',   -- JSON array of badge IDs
  completed_mission_ids TEXT    NOT NULL DEFAULT '[]',   -- JSON array of mission IDs
  streak_days           INTEGER NOT NULL DEFAULT 0,
  last_active_date      TEXT,                            -- ISO date string "YYYY-MM-DD"
  created_at            TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT    NOT NULL DEFAULT (datetime('now'))
);
