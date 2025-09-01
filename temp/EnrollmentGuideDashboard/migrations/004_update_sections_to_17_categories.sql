-- Migration: Update sections to new 17 benefit categories
-- This migration updates the sections_changed_flags to include all 17 new benefit categories

-- Update the default value for new intakes
-- SQLite doesn't support ALTER COLUMN DEFAULT directly, so we'll use a trigger approach

-- First, update existing records to have the new 17-section structure
UPDATE intakes SET sections_changed_flags = '{"A":false,"B":false,"C":false,"D":false,"E":false,"F":false,"G":false,"H":false,"I":false,"J":false,"K":false,"L":false,"M":false,"N":false,"O":false,"P":false,"Q":false}' 
WHERE sections_changed_flags LIKE '{"C":false%';

-- Update any existing records that might have different structures
UPDATE intakes SET sections_changed_flags = '{"A":false,"B":false,"C":false,"D":false,"E":false,"F":false,"G":false,"H":false,"I":false,"J":false,"K":false,"L":false,"M":false,"N":false,"O":false,"P":false,"Q":false}' 
WHERE LENGTH(sections_changed_flags) < 100;