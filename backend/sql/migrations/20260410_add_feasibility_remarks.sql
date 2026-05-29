-- Migration: Add Remarks to Feasibility Studies
-- Date: 2026-04-10
-- Supports descriptive text for marked locations

ALTER TABLE marked_locations 
ADD COLUMN IF NOT EXISTS remarks TEXT;

COMMENT ON COLUMN marked_locations.remarks IS 'User provided description or remarks for the marked location / feasibility study.';
