-- =============================================================================
-- Migration: Recreate independent dark_fiber_folders
-- Date: 2026-04-25
-- Purpose: Ensures Dark Fiber has its own independent folder structure separate
--          from Network Planning's network_folders.
-- =============================================================================

BEGIN;

-- 1. Recreate dark_fiber_folders
CREATE TABLE IF NOT EXISTS dark_fiber_folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INTEGER REFERENCES dark_fiber_folders(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- 2. Repoint imports back to dark_fiber_folders (Only if imports table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'dark_fiber_imports') THEN
        ALTER TABLE dark_fiber_imports DROP CONSTRAINT IF EXISTS dark_fiber_imports_folder_id_fkey;
        UPDATE dark_fiber_imports SET folder_id = NULL;
        ALTER TABLE dark_fiber_imports
        ADD CONSTRAINT dark_fiber_imports_folder_id_fkey
        FOREIGN KEY (folder_id) REFERENCES dark_fiber_folders(id) ON DELETE SET NULL;
    END IF;
END $$;

COMMIT;
