-- MASTER FIX: Folder Icons & Recursive Inheritance
-- Purpose: 
-- 1. Explicitly set default_icon for all known System Folder Types (BTS, POP, ISPs).
-- 2. Propagate these icons to ALL children recursively (handling "Andaman" inside "Indus").
-- 3. Update File Icons to match the fixed Folder Icons.

BEGIN;

-- ---------------------------------------------------------
-- STEP 1: Set Top-Level & System Folder Icons (Explicit Rules)
-- ---------------------------------------------------------

-- Infrastructure
UPDATE network_folders SET default_icon = 'BTS-STATION', category = 'active'
WHERE name ILIKE '%BTS%' AND name NOT ILIKE '%Bandwidth Drop%';

UPDATE network_folders SET default_icon = 'BANDWIDTH-DROP-BTS', category = 'active'
WHERE name ILIKE '%Bandwidth Drop%';

UPDATE network_folders SET default_icon = 'DATACENTER', category = 'active'
WHERE name ILIKE '%Data Center%';

UPDATE network_folders SET default_icon = 'POP', category = 'active'
WHERE name ILIKE '%POP%';

UPDATE network_folders SET default_icon = 'OFFICE-LOCATIONS', category = 'active'
WHERE name ILIKE '%Office%';

UPDATE network_folders SET default_icon = 'FIBER', category = 'active'
WHERE name ILIKE '%Fiber%';

-- ISPs / Tower Cos (Pattern Matching)
UPDATE network_folders SET default_icon = 'INDUS', category = 'active' WHERE name ILIKE '%Indus%';
UPDATE network_folders SET default_icon = 'ELEVOR', category = 'active' WHERE name ILIKE '%Elevor%';
UPDATE network_folders SET default_icon = 'ASCEND', category = 'active' WHERE name ILIKE '%Ascend%';
UPDATE network_folders SET default_icon = 'SUMMIT', category = 'active' WHERE name ILIKE '%Summit%';
UPDATE network_folders SET default_icon = 'ATC', category = 'active' WHERE name ILIKE '%ATC%';
UPDATE network_folders SET default_icon = 'AIRTEL', category = 'active' WHERE name ILIKE '%Airtel%';
UPDATE network_folders SET default_icon = 'JIO', category = 'active' WHERE name ILIKE '%Jio%';
UPDATE network_folders SET default_icon = 'BSNL', category = 'active' WHERE name ILIKE '%BSNL%' OR name ILIKE '%Cellone%';
UPDATE network_folders SET default_icon = 'VI', category = 'active' WHERE name ILIKE '%Vodafone%' OR name ILIKE '%Idea%' OR name ILIKE '%Vi%';
UPDATE network_folders SET default_icon = 'TATA', category = 'active' WHERE name ILIKE '%Tata%';

-- ---------------------------------------------------------
-- STEP 2: Recursive Propagation to Children
-- ---------------------------------------------------------
WITH RECURSIVE folder_tree AS (
    -- Anchor: Folders that have a valid default_icon
    SELECT id, default_icon, category
    FROM network_folders
    WHERE default_icon IS NOT NULL AND default_icon != 'DEFAULT'
    
    UNION ALL
    
    -- Recursive: Children inherit from Parent
    SELECT c.id, p.default_icon, p.category
    FROM network_folders c
    JOIN folder_tree p ON c.parent_id = p.id
    -- Only update if child doesn't have its own specific icon (or is generic)
    WHERE (c.default_icon IS NULL OR c.default_icon = 'DEFAULT')
)
UPDATE network_folders f
SET 
  default_icon = ft.default_icon,
  category = ft.category
FROM folder_tree ft
WHERE f.id = ft.id;

-- ---------------------------------------------------------
-- STEP 3: Update Files based on Fixed Folders
-- ---------------------------------------------------------
UPDATE network_files f
SET icon_type = p.default_icon
FROM network_folders p
WHERE f.folder_id = p.id
AND p.default_icon IS NOT NULL 
AND p.default_icon != 'DEFAULT';

COMMIT;
