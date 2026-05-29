-- Migration: Add Category and Default Icon to Network Folders
-- Purpose: Support system-enforced icons (Tier 1) and user-defined icons (Tier 2).

ALTER TABLE network_folders 
ADD COLUMN IF NOT EXISTS category VARCHAR(50), -- e.g., 'POP', 'Tower', 'Customer'
ADD COLUMN IF NOT EXISTS default_icon VARCHAR(50); -- e.g., 'Home', 'Star' (For Custom Folders)

-- Optional: Index on category for faster system lookups
CREATE INDEX IF NOT EXISTS idx_network_folders_category ON network_folders(category);
