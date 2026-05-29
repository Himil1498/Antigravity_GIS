-- Migration: Rename location_marker permission to feasibility:markers
-- Description: Renames the map:tools:location_marker permission to network:feasibility:markers
-- across all user permission arrays and the system_permissions catalog.
-- Date: 2026-04-11
-- Reason: The standalone Location Marker Tool has been removed from the GIS dropdown.
--         The permission is now exclusively used by the Feasibility Hub feature,
--         so it has been moved under the network:feasibility namespace for clarity.

-- =====================================================
-- 1. Update system_permissions catalog
-- =====================================================
UPDATE system_permissions 
SET category = 'network',
    code = 'network:feasibility:markers',
    name = 'Add / Edit / Delete Markers',
    description = 'Allows adding new markers on the map, editing marker details, and deleting feasibility studies.'
WHERE code = 'map:tools:location_marker';

-- If the old row doesn't exist, insert the new one
INSERT INTO system_permissions (category, code, name, description)
SELECT 'network', 'network:feasibility:markers', 'Add / Edit / Delete Markers', 
       'Allows adding new markers on the map, editing marker details, and deleting feasibility studies.'
WHERE NOT EXISTS (
    SELECT 1 FROM system_permissions WHERE code = 'network:feasibility:markers'
);

-- =====================================================
-- 2. Update all user permission arrays in the users table
-- =====================================================
-- This replaces 'map:tools:location_marker' with 'network:feasibility:markers'
-- in every user's JSON permissions array.
UPDATE users
SET permissions = (
    SELECT jsonb_agg(
        CASE 
            WHEN elem::text = '"map:tools:location_marker"' 
            THEN '"network:feasibility:markers"'::jsonb
            ELSE elem
        END
    )
    FROM jsonb_array_elements(permissions::jsonb) AS elem
)
WHERE permissions::text LIKE '%map:tools:location_marker%';

-- =====================================================
-- 3. Cleanup: Remove the old permission if it still exists
-- =====================================================
DELETE FROM system_permissions WHERE code = 'map:tools:location_marker';
