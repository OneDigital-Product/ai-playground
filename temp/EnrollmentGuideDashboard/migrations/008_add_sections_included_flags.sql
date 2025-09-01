-- Add sections_included_flags field to intakes table

ALTER TABLE intakes 
ADD COLUMN sections_included_flags TEXT DEFAULT '{}';