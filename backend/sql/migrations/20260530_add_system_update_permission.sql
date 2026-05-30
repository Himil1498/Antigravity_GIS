INSERT INTO system_permissions (category, code, name, description, created_at)
VALUES (
    'Admin',
    'admin:system_updates',
    'System Update',
    'Allows user to manage and deploy system updates',
    NOW()
)
ON CONFLICT (code) DO NOTHING;
