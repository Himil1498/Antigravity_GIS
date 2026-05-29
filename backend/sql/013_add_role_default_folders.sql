-- Migration: Add default_folder_ids column to roles table
-- This allows roles to define which network folders should be auto-assigned to users

-- Add the column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'roles' AND column_name = 'default_folder_ids'
    ) THEN
        ALTER TABLE roles ADD COLUMN default_folder_ids JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Column default_folder_ids added to roles table';
    ELSE
        RAISE NOTICE 'Column default_folder_ids already exists in roles table';
    END IF;
END $$;

-- Add a comment for documentation
COMMENT ON COLUMN roles.default_folder_ids IS 'JSON array of network_folder IDs to auto-assign as folder access when a user is assigned this role';
