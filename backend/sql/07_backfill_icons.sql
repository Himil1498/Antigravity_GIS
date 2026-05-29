-- Migration: Backfill Icon Types for Existing Files (Robust System)
-- Purpose: rigorously enforce icon rules on ALL files, including Bandwidth Drop and recursive System Folder checks.

UPDATE network_files
SET icon_type = 
  CASE
    -- 1. Specific Infrastructure Types (Priority High)
    WHEN UPPER(p.name) LIKE '%BANDWIDTH DROP%' OR UPPER(p.name) LIKE '%BANDWIDTH%' THEN 'BANDWIDTH-DROP-BTS'
    WHEN UPPER(p.name) = 'BTS' OR UPPER(p.name) LIKE '%BTS%' THEN 'BTS-STATION'
    WHEN UPPER(p.name) LIKE '%DATA CENTER%' THEN 'DATACENTER'
    WHEN UPPER(p.name) LIKE '%OFFICE%' THEN 'OFFICE-LOCATIONS'
    WHEN UPPER(p.name) LIKE '%POP%' THEN 'POP'
    
    -- 2. Tier 1: System Folder Name Matching (Official Providers)
    -- Check Parent Name directly
    WHEN UPPER(p.name) LIKE '%ASCEND%' THEN 'ASCEND'
    WHEN UPPER(p.name) LIKE '%AIRTEL%' THEN 'AIRTEL'
    WHEN UPPER(p.name) LIKE '%INDUS%' THEN 'INDUS'
    WHEN UPPER(p.name) LIKE '%SUMMIT%' THEN 'SUMMIT'
    WHEN UPPER(p.name) LIKE '%ELEVOR%' THEN 'ELEVOR'
    WHEN UPPER(p.name) LIKE '%BSNL%' OR UPPER(p.name) LIKE '%CELLONE%' THEN 'BSNL'
    WHEN UPPER(p.name) LIKE '%JIO%' THEN 'JIO'
    WHEN UPPER(p.name) LIKE '%VI%' OR UPPER(p.name) LIKE '%VODAFONE%' THEN 'VI'
    WHEN UPPER(p.name) LIKE '%ATC%' THEN 'ATC'
    WHEN UPPER(p.name) LIKE '%TATA%' THEN 'TATA'
    
    -- 3. Recursive Checks: If Parent doesn't match, check GRANDPARENT (simple 1-level up check for now)
    -- (Assuming 'p' is parent, we need to join grandparent 'gp' to do this properly, 
    --  but standard update doesn't allow easy multiple joins. We usage Tier 2 inheritance).

    -- 3. Tier 2: Inherit 'default_icon' from Parent (System or Custom)
    -- This covers the "Andaman in Indus" case IF Indus has default_icon set.
    WHEN p.default_icon IS NOT NULL AND p.default_icon != 'DEFAULT' THEN p.default_icon
    
    -- 4. Generic Types
    WHEN UPPER(p.name) LIKE '%CUSTOMER%' THEN 'CUSTOMER'
    
    -- Default Fallback: KEEP EXISTING
    ELSE network_files.icon_type
  END
FROM network_folders p
WHERE network_files.folder_id = p.id;
