-- Fix Bandwidth Drop Folder Icon
UPDATE network_folders
SET default_icon = 'BANDWIDTH-DROP-BTS', category = 'active'
WHERE name ILIKE '%Bandwidth Drop%' AND (default_icon != 'BANDWIDTH-DROP-BTS' OR default_icon IS NULL);
