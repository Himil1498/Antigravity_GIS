-- Migration: Register Dark Fiber Placeholder Permission
-- Date: 2026-04-17
-- Description: Adds the 'darkfiber:view' permission definition back to the system.
-- This allows Admins to control visibility of the redesign placeholder tab via the UI.

BEGIN;

-- Insert the permission definition if it doesn't already exist
INSERT INTO system_permissions (category, code, name, description, created_at)
VALUES (
    'darkfiber', 
    'darkfiber:view', 
    'View Dark Fiber (Placeholder)', 
    'Allows the user to see the Dark Fiber navigation tab and access the placeholder page.', 
    NOW()
)
ON CONFLICT (code) DO NOTHING;

-- Verification log
INSERT INTO audit_logs (action, resource_type, details, status, created_at)
VALUES (
    'PERMISSION_REGISTERED', 
    'system_permissions', 
    '{"message": "Re-registered darkfiber:view permission for placeholder redesign visibility control."}'::jsonb, 
    'SUCCESS', 
    NOW()
);

COMMIT;
