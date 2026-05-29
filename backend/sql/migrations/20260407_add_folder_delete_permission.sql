-- Migration: Add Delete Folder Permission
-- Description: Adds the network:folder:delete permission to the system_permissions catalog.
-- This enables admins to grant/revoke folder delete capability per-user via the Permissions Dialog.

INSERT INTO system_permissions (category, code, name, description)
VALUES ('network', 'network:folder:delete', 'Delete Folder', 'Delete user-created network folders (system folders are always protected)')
ON CONFLICT (code) DO NOTHING;
