-- Add region_id to network_files for filtering
ALTER TABLE network_files 
ADD COLUMN IF NOT EXISTS region_id INTEGER REFERENCES regions(id);

-- Index for faster filtering by region
CREATE INDEX IF NOT EXISTS idx_network_files_region ON network_files(region_id);
