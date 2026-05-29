-- Register Infrastructure Delete Permission
INSERT INTO system_permissions (category, code, name, description)
VALUES ('network', 'network:infra:delete', 'Delete Submissions', 'Allow users to delete their own infrastructure submissions or admins to delete any.')
ON CONFLICT (code) DO UPDATE 
SET category = EXCLUDED.category,
    name = EXCLUDED.name,
    description = EXCLUDED.description;
