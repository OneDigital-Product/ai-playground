-- Add guide_type field to intakes table

ALTER TABLE intakes 
ADD COLUMN guide_type TEXT DEFAULT '' 
CHECK (guide_type IN ('', 'Update Existing Guide', 'New Guide Build'));