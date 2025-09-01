-- Migration: Remove requestor_email column
-- This migration removes the requestor_email column from the intakes table

-- SQLite doesn't support DROP COLUMN, so we need to recreate the table
-- First, create new table without requestor_email column
CREATE TABLE intakes_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intake_id TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    plan_year INTEGER NOT NULL,
    requestor_name TEXT NOT NULL,
    date_received DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'STARTED', 'ROADBLOCK', 'READY_FOR_QA', 'DELIVERED_TO_CONSULTANT')),
    complexity_band TEXT CHECK (complexity_band IN ('MINIMAL', 'LOW', 'MODERATE', 'HIGH')),
    complexity_score INTEGER DEFAULT 0,
    payroll_storage_url TEXT,
    notes_general TEXT,
    sections_changed_flags TEXT DEFAULT '{"C":false,"D":false,"E":false,"F":false,"G":false,"H":false,"I":false}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old table to new table (excluding requestor_email)
INSERT INTO intakes_new (
    id, intake_id, client_name, plan_year, requestor_name, date_received,
    status, complexity_band, complexity_score, payroll_storage_url,
    notes_general, sections_changed_flags, created_at, updated_at
)
SELECT 
    id, intake_id, client_name, plan_year, requestor_name, date_received,
    status, complexity_band, complexity_score, payroll_storage_url,
    notes_general, sections_changed_flags, created_at, updated_at
FROM intakes;

-- Drop old table
DROP TABLE intakes;

-- Rename new table to original name
ALTER TABLE intakes_new RENAME TO intakes;

-- Recreate indexes if any existed (none in our case, but good practice)
-- No additional indexes needed for this table currently