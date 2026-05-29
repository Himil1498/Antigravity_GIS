-- ==============================================================
-- Audit Logs Table Enhancement Migration
-- Adds Session ID, User Agent, and HTTP Status for advanced tracking
-- Safe to run consecutively (uses IF NOT EXISTS)
-- ==============================================================

BEGIN;

DO $$ 
BEGIN 
    -- Add session_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'session_id') THEN
        ALTER TABLE audit_logs ADD COLUMN session_id VARCHAR(255);
    END IF;

    -- Add user_agent column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_agent') THEN
        ALTER TABLE audit_logs ADD COLUMN user_agent TEXT;
    END IF;

    -- Add status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'status') THEN
        ALTER TABLE audit_logs ADD COLUMN status VARCHAR(50) DEFAULT 'SUCCESS';
    END IF;
END $$;

COMMIT;
