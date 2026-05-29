-- Migration: Add Granular Permissions for Network Infrastructure (Form vs In-line)
-- Created: 2026-04-16
-- This migration registers 9 granular permissions (3 Form Edit, 3 In-line Live Edit, 3 Delete)

-- 1. Register Permissions in system_permissions table
INSERT INTO system_permissions (category, code, name, description) VALUES
-- Planned Data
('network', 'network:file:edit_planned', 'Edit Planned Data (Form)', 'Modify unapproved submissions via modal form.'),
('network', 'network:file:live_edit_planned', 'Live Edit Planned Data (In-line)', 'Modify unapproved submissions directly within the data grid.'),
('network', 'network:file:delete_planned', 'Delete Planned Data', 'Remove unapproved submissions.'),
-- Live Data
('network', 'network:file:edit_live', 'Edit Live Data (Form)', 'Modify active infrastructure via modal form.'),
('network', 'network:file:live_edit_live', 'Live Edit Live Data (In-line)', 'Modify active infrastructure directly within the data grid.'),
('network', 'network:file:delete_live', 'Delete Live Data', 'Remove active infrastructure.'),
-- Imported Data
('network', 'network:file:edit_imported', 'Edit Imported Data (Form)', 'Modify raw imported datasets via modal form.'),
('network', 'network:file:live_edit_imported', 'Live Edit Imported Data (In-line)', 'Modify raw imported datasets directly within the data grid.'),
('network', 'network:file:delete_imported', 'Delete Imported Data', 'Remove raw imported datasets.')
ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 2. Map Permissions to default Roles
UPDATE roles 
SET permissions = permissions::jsonb || '[
    "network:file:edit_planned",
    "network:file:live_edit_planned",
    "network:file:edit_live",
    "network:file:live_edit_live",
    "network:file:edit_imported",
    "network:file:live_edit_imported",
    "network:file:delete_planned",
    "network:file:delete_live",
    "network:file:delete_imported"
]'::jsonb
WHERE name IN ('admin', 'developer', 'manager');

-- 3. Update existing users to inherit the new permissions
UPDATE users 
SET permissions = permissions::jsonb || '[
    "network:file:edit_planned",
    "network:file:live_edit_planned",
    "network:file:edit_live",
    "network:file:live_edit_live",
    "network:file:edit_imported",
    "network:file:live_edit_imported",
    "network:file:delete_planned",
    "network:file:delete_live",
    "network:file:delete_imported"
]'::jsonb
WHERE role IN ('admin', 'developer', 'manager') AND permissions IS NOT NULL;
