-- Update complexity band names to new format

-- First, create a new table with updated check constraint
CREATE TABLE intakes_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intake_id TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    plan_year INTEGER NOT NULL,
    requestor_name TEXT NOT NULL,
    sections_changed_flags TEXT DEFAULT '{}',
    sections_included_flags TEXT DEFAULT '{}',
    payroll_storage_url TEXT,
    guide_type TEXT DEFAULT '' CHECK (guide_type IN ('', 'Update Existing Guide', 'New Guide Build')),
    communications_add_ons TEXT DEFAULT '' CHECK (communications_add_ons IN ('', 'None', 'OE Letter', 'OE Presentation', 'Both', 'Other')),
    requested_production_time TEXT,
    notes_general TEXT,
    complexity_score INTEGER DEFAULT 0,
    complexity_band TEXT DEFAULT 'Minimal' CHECK (complexity_band IN ('Minimal', 'Low', 'Medium', 'High')),
    status TEXT DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'STARTED', 'ROADBLOCK', 'READY_FOR_QA', 'DELIVERED_TO_CONSULTANT')),
    date_received DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy data with updated complexity band names
INSERT INTO intakes_new (id, intake_id, client_name, plan_year, requestor_name, sections_changed_flags, sections_included_flags, payroll_storage_url, guide_type, communications_add_ons, requested_production_time, notes_general, complexity_score, complexity_band, status, date_received, created_at, updated_at)
SELECT 
    id, 
    intake_id, 
    client_name, 
    plan_year, 
    requestor_name, 
    COALESCE(sections_changed_flags, '{}'), 
    COALESCE(sections_included_flags, '{}'), 
    payroll_storage_url, 
    guide_type, 
    communications_add_ons, 
    requested_production_time, 
    notes_general, 
    complexity_score,
    CASE 
        WHEN complexity_band = 'MINIMAL' THEN 'Minimal'
        WHEN complexity_band = 'LOW' THEN 'Low'
        WHEN complexity_band = 'MODERATE' THEN 'Medium'
        WHEN complexity_band = 'HIGH' THEN 'High'
        WHEN complexity_band = 'SIGNIFICANT' THEN 'High'
        ELSE 'Minimal'
    END,
    status, 
    date_received, 
    created_at, 
    updated_at 
FROM intakes;

-- Drop old table and rename new one
DROP TABLE intakes;
ALTER TABLE intakes_new RENAME TO intakes;