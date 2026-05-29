-- Migration: Remove deprecated GIS Tools tables and permissions
-- Description: Drops tables for distance, polygon, circle, elevation, and sector tools which are no longer saved to DB, and cleans up their permissions.

-- 1. Drop Tables
DROP TABLE IF EXISTS distance_measurements CASCADE;
DROP TABLE IF EXISTS polygon_drawings CASCADE;
DROP TABLE IF EXISTS circle_drawings CASCADE;
DROP TABLE IF EXISTS elevation_profiles CASCADE;
DROP TABLE IF EXISTS sector_rf_coverage CASCADE;

-- 2. Add new Geometry Suite permission
INSERT INTO system_permissions (code, name, description, category) 
VALUES ('map:tools:geometry_suite', 'Geometry Suite', 'Enables analytical tools including Distance, Polygon, Circle, Elevation, and Sector RF.', 'map')
ON CONFLICT (code) DO NOTHING;

-- 3. Migrate users/groups from old permission to new one
INSERT INTO user_permissions (user_id, permission_id, granted_by, granted_at)
SELECT up.user_id, 'map:tools:geometry_suite', up.granted_by, up.granted_at
FROM user_permissions up
WHERE up.permission_id = 'map:tools:distance'
ON CONFLICT DO NOTHING;

INSERT INTO group_permissions (group_id, permission_id, granted_by, granted_at)
SELECT gp.group_id, 'map:tools:geometry_suite', gp.granted_by, gp.granted_at
FROM group_permissions gp
WHERE gp.permission_id = 'map:tools:distance'
ON CONFLICT DO NOTHING;

-- 4. Remove old permissions from DB
DELETE FROM user_permissions WHERE permission_id IN (
    'map:tools:distance', 'map:tools:polygon', 'map:tools:elevation', 'map:tools:circle', 'map:tools:sector_rf',
    'datahub:view', 'datahub:feature:filter', 'datahub:feature:delete', 'datahub:feature:delete_all'
);

DELETE FROM group_permissions WHERE permission_id IN (
    'map:tools:distance', 'map:tools:polygon', 'map:tools:elevation', 'map:tools:circle', 'map:tools:sector_rf',
    'datahub:view', 'datahub:feature:filter', 'datahub:feature:delete', 'datahub:feature:delete_all'
);

DELETE FROM system_permissions WHERE code IN (
    'map:tools:distance', 'map:tools:polygon', 'map:tools:elevation', 'map:tools:circle', 'map:tools:sector_rf',
    'datahub:view', 'datahub:feature:filter', 'datahub:feature:delete', 'datahub:feature:delete_all'
);
