-- Migration: Add 12 Granular Matrix Permissions (6 Edit, 6 Delete)
-- Created: 2026-04-17

-- 1. Register/Update Permissions in system_permissions table
INSERT INTO system_permissions (category, code, name, description) VALUES
-- PLANNED DATA
('network', 'network:file:edit_planned', 'Edit Planned Data (Form)', 'Modify unapproved submissions via modal form.'),
('network', 'network:file:live_edit_planned', 'Live Edit Planned Data (In-line)', 'Modify unapproved submissions directly in table.'),
('network', 'network:file:delete_file_planned', 'Delete Planned File', 'Remove the entire planned data file.'),
('network', 'network:file:delete_feature_planned', 'Delete Planned Feature', 'Remove individual features from a planned file.'),

-- LIVE DATA
('network', 'network:file:edit_live', 'Edit Live Data (Form)', 'Modify active infrastructure via modal form.'),
('network', 'network:file:live_edit_live', 'Live Edit Live Data (In-line)', 'Modify active infrastructure directly in table.'),
('network', 'network:file:delete_file_live', 'Delete Live File', 'Remove the entire active inventory file.'),
('network', 'network:file:delete_feature_live', 'Delete Live Feature', 'Remove individual features from live inventory.'),

-- IMPORTED DATA
('network', 'network:file:edit_imported', 'Edit Imported Data (Form)', 'Modify raw imported datasets via modal form.'),
('network', 'network:file:live_edit_imported', 'Live Edit Imported Data (In-line)', 'Modify raw imported datasets directly in table.'),
('network', 'network:file:delete_file_imported', 'Delete Imported File', 'Remove the entire raw imported data file.'),
('network', 'network:file:delete_feature_imported', 'Delete Imported Feature', 'Remove individual features from imported datasets.')
ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 2. Map Permissions to default Roles (Admin, Developer, Manager get all 12)
UPDATE roles 
SET permissions = permissions::jsonb || '[
    "network:file:edit_planned",
    "network:file:live_edit_planned",
    "network:file:delete_file_planned",
    "network:file:delete_feature_planned",
    "network:file:edit_live",
    "network:file:live_edit_live",
    "network:file:delete_file_live",
    "network:file:delete_feature_live",
    "network:file:edit_imported",
    "network:file:live_edit_imported",
    "network:file:delete_file_imported",
    "network:file:delete_feature_imported"
]'::jsonb
WHERE name IN ('admin', 'developer', 'manager');

-- 3. Update existing users with these roles to inherit the new permissions immediately
UPDATE users 
SET permissions = permissions::jsonb || '[
    "network:file:edit_planned",
    "network:file:live_edit_planned",
    "network:file:delete_file_planned",
    "network:file:delete_feature_planned",
    "network:file:edit_live",
    "network:file:live_edit_live",
    "network:file:delete_file_live",
    "network:file:delete_feature_live",
    "network:file:edit_imported",
    "network:file:live_edit_imported",
    "network:file:delete_file_imported",
    "network:file:delete_feature_imported"
]'::jsonb
WHERE role IN ('admin', 'developer', 'manager') 
  AND permissions IS NOT NULL;
