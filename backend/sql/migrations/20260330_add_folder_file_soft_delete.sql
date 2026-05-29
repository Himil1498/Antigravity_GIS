-- Migration: Add Soft Delete to Network Folders and Files
-- Description: Adds deleted_at and deleted_by to support the unified Recycle Bin.

ALTER TABLE network_folders 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_network_folders_deleted_at ON network_folders(deleted_at);

ALTER TABLE network_files 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_network_files_deleted_at ON network_files(deleted_at);
