-- Migration: Add BM edit tracking columns to infra_approvals
-- Purpose: Allow Branch Managers to edit pending submissions before approving.
--          Preserves original submission data for audit trail.
-- Date: 2026-04-21

ALTER TABLE infra_approvals ADD COLUMN IF NOT EXISTS edited_by INTEGER REFERENCES users(id);
ALTER TABLE infra_approvals ADD COLUMN IF NOT EXISTS edited_original_data JSONB;

COMMENT ON COLUMN infra_approvals.edited_by IS 'User ID of the BM/Admin who edited this submission';
COMMENT ON COLUMN infra_approvals.edited_original_data IS 'Original form_data before first edit, preserved for audit trail';
