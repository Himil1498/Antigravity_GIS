-- Migration: Add Soft Delete to Dark Fiber Imports
-- Date: 2026-04-27
-- Description: Adds is_deleted and deleted_at columns to dark_fiber_imports to support soft deletion logic in the backend.

ALTER TABLE dark_fiber_imports
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Update existing records to have is_deleted = false instead of null
UPDATE dark_fiber_imports SET is_deleted = FALSE WHERE is_deleted IS NULL;
