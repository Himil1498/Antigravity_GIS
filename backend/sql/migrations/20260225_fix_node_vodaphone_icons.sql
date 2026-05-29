-- Migration: Fix incorrect default_icon values for Node and Vodaphone system folders
-- Date: 2026-02-25
-- Issue: Node folder had default_icon='BTS-STATION' instead of 'NODE',
--        Vodaphone folder had default_icon='CUSTOMER' instead of 'VODAFONE'.
--        This caused all downstream icon rendering (map tiles, import modal, 
--        active layers panel, dashboard) to show wrong icons.

-- Fix Node folder (id may differ on production, so match by name + is_system)
UPDATE network_folders 
SET default_icon = 'NODE' 
WHERE name = 'Node' AND is_system = true AND default_icon = 'BTS-STATION';

-- Fix Vodaphone folder
UPDATE network_folders 
SET default_icon = 'VODAFONE' 
WHERE name = 'Vodaphone' AND is_system = true AND default_icon = 'CUSTOMER';

-- Also update any existing files that inherited the wrong icon_type
UPDATE network_files 
SET icon_type = 'NODE' 
WHERE folder_id IN (SELECT id FROM network_folders WHERE name = 'Node' AND is_system = true)
  AND icon_type = 'BTS-STATION';

UPDATE network_files 
SET icon_type = 'VODAFONE' 
WHERE folder_id IN (SELECT id FROM network_folders WHERE name = 'Vodaphone' AND is_system = true)
  AND icon_type IN ('CUSTOMER', 'DEFAULT');
