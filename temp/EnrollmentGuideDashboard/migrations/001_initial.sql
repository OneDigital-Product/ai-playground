-- Initial schema for Enrollment Guide Intake App

-- Intakes table
CREATE TABLE intakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intake_id TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    plan_year INTEGER NOT NULL,
    requestor_name TEXT NOT NULL,
    requestor_email TEXT,
    date_received TEXT NOT NULL DEFAULT (datetime('now')),
    status TEXT NOT NULL DEFAULT 'NOT_STARTED' 
        CHECK (status IN ('NOT_STARTED', 'STARTED', 'ROADBLOCK', 'READY_FOR_QA', 'DELIVERED_TO_CONSULTANT')),
    complexity_band TEXT NOT NULL DEFAULT 'MINIMAL' 
        CHECK (complexity_band IN ('MINIMAL', 'LOW', 'MODERATE', 'SIGNIFICANT')),
    complexity_score INTEGER NOT NULL DEFAULT 0,
    payroll_storage_url TEXT,
    notes_general TEXT,
    sections_changed_flags TEXT NOT NULL DEFAULT '{"C":false,"D":false,"E":false,"F":false,"G":false,"H":false,"I":false}',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Uploads table
CREATE TABLE uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intake_id TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('GUIDE', 'PLAN_DOC', 'PAYROLL_SCREEN', 'OTHER')),
    original_name TEXT,
    mime_type TEXT,
    bytes INTEGER,
    stored_path TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (intake_id) REFERENCES intakes(intake_id) ON DELETE CASCADE
);

-- Section details table
CREATE TABLE section_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intake_id TEXT NOT NULL,
    section_code TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (intake_id) REFERENCES intakes(intake_id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_intakes_intake_id ON intakes(intake_id);
CREATE INDEX idx_intakes_status ON intakes(status);
CREATE INDEX idx_intakes_complexity_band ON intakes(complexity_band);
CREATE INDEX idx_intakes_plan_year ON intakes(plan_year);
CREATE INDEX idx_intakes_date_received ON intakes(date_received);
CREATE INDEX idx_uploads_intake_id ON uploads(intake_id);
CREATE INDEX idx_section_details_intake_id ON section_details(intake_id);
CREATE INDEX idx_section_details_section_code ON section_details(section_code);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_intakes_updated_at 
    AFTER UPDATE ON intakes
    FOR EACH ROW
BEGIN
    UPDATE intakes SET updated_at = datetime('now') WHERE id = NEW.id;
END;
