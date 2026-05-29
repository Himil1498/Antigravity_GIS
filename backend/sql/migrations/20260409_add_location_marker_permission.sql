-- Migration: Add Location Marker & Elevation Permission
-- Description: Adds the map:tools:location_marker permission to the system_permissions catalog.

INSERT INTO system_permissions (category, code, name, description)
VALUES ('map', 'map:tools:location_marker', 'Location Marker & Elevation', 'Allows marking custom map points and rendering elevation profiles to internal network nodes.')
ON CONFLICT (code) DO NOTHING;
