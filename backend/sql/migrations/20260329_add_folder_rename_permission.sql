-- Migration: Add Rename Folder Permission
-- Description: Adds the network:folder:rename permission to the system_permissions catalog.
-- This enables admins to grant/revoke folder rename capability per-user via the Permissions Dialog.

INSERT INTO system_permissions (category, code, name, description)
VALUES ('network', 'network:folder:rename', 'Rename Folder', 'Rename existing network folders')
ON CONFLICT (code) DO NOTHING;
