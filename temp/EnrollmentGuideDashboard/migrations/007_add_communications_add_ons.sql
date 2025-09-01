-- Add communications_add_ons field to intakes table

ALTER TABLE intakes 
ADD COLUMN communications_add_ons TEXT DEFAULT '' 
CHECK (communications_add_ons IN ('', 'None', 'OE Letter', 'OE Presentation', 'Both', 'Other'));