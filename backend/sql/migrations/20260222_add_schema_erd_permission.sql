-- Migration: Add system:schema:erd permission

-- 1. Insert into system_permissions list
INSERT INTO system_permissions (category, code, name, description) 
VALUES (
    'help', 
    'system:schema:erd', 
    'Global ER Diagram',
    'Allows viewing the Global ER Diagram visualization of the database.'
) ON CONFLICT (code) DO NOTHING;
