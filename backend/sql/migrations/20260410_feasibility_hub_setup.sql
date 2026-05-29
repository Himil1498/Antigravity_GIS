-- Migration: Feasibility Hub Setup
-- Date: 2026-04-10
-- Add permissions and schema for feasibility studies

-- 1. Add Feasibility Permissions
INSERT INTO system_permissions (code, name, category, description)
VALUES 
    ('network:feasibility:view', 'View Feasibility Hub', 'Network Planning', 'Allows access to the Feasibility Hub and its study records.'),
    ('network:feasibility:edit', 'Manage Feasibility Studies', 'Network Planning', 'Allows creating markers and processing feasibility analysis.')
ON CONFLICT (code) DO NOTHING;

-- 2. Update marked_locations table to hold feasibility results
-- We use JSONB to store the connections (BTS points and link details)
ALTER TABLE marked_locations 
ADD COLUMN IF NOT EXISTS feasibility_data JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_feasibility BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS linked_file_id INTEGER REFERENCES network_files(id) ON DELETE SET NULL;

-- 3. Index for feasibility markers
CREATE INDEX IF NOT EXISTS idx_marked_locations_feasibility ON marked_locations(is_feasibility) WHERE is_feasibility = TRUE;

-- 4. Comment updates
COMMENT ON COLUMN marked_locations.feasibility_data IS 'Stores parsed BTS candidates and connection analysis in JSON format.';
COMMENT ON COLUMN marked_locations.is_feasibility IS 'Distinguishes feasibility surveys from standard map markers.';
