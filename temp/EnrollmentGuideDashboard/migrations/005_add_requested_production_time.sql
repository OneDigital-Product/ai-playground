-- Add requested_production_time field to intakes table
-- Migration 005: Add requested production time field

ALTER TABLE intakes ADD COLUMN requested_production_time TEXT DEFAULT 'Standard';

-- Update any existing records to have 'Standard' as default
UPDATE intakes SET requested_production_time = 'Standard' WHERE requested_production_time IS NULL;