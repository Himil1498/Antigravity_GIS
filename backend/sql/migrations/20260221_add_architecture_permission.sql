-- Migration: Add System Architecture UI Permission
-- Author: Google Antigravity
-- Date: 2026-02-21

-- Step 1: Insert into system_permissions to make it visible and valid in the DB schema
INSERT INTO system_permissions (category, code, name, description) 
VALUES (
    'help', 
    'system:architecture:view', 
    'View Server Architecture', 
    'Grants access to the interactive server deployment and operations map.'
)
ON CONFLICT (code) DO NOTHING;

-- Step 2: Automatically assign this permission to the super/admin role so they can immediately see it and grant it to others
INSERT INTO role_permissions (role_name, permission_code)
VALUES ('admin', 'system:architecture:view')
ON CONFLICT (role_name, permission_code) DO NOTHING;

-- Optionally, you can also inject it into specific users if they have direct permission overrides:
-- INSERT INTO user_permissions (user_id, permission_code) VALUES (1, 'system:architecture:view') ON CONFLICT DO NOTHING;
