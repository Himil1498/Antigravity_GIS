-- Migration: Remove Groups Module
-- Description: Drop tables related to the groups feature and remove system permissions.

-- 1. Drop the group related tables
DROP TABLE IF EXISTS "group_members" CASCADE;
DROP TABLE IF EXISTS "group_permissions" CASCADE;
DROP TABLE IF EXISTS "group_regions" CASCADE;
DROP TABLE IF EXISTS "groups" CASCADE;

-- 2. Remove group permissions from system_permissions
DELETE FROM system_permissions 
WHERE code IN ('groups:view', 'groups:create', 'groups:edit', 'groups:delete');