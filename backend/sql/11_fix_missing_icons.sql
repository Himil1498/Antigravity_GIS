-- FIX: Missing Icons & Dark Fiber (Refined with Specific Icons)

BEGIN;

-- 1. Dark Fiber -> DARK-FIBER (Specific Icon)
UPDATE network_folders SET default_icon = 'DARK-FIBER', category = 'active'
WHERE name ILIKE '%Dark Fiber%' OR name ILIKE '%Dark Fibre%';

-- 2. NNI -> NNI (Force)
UPDATE network_folders SET default_icon = 'NNI', category = 'active'
WHERE name ILIKE '%NNI%';

-- 3. Sub POP -> SUB-POP (Force)
UPDATE network_folders SET default_icon = 'SUB-POP', category = 'active'
WHERE name ILIKE '%Sub%POP%';


-- 4. Specific Providers (Using keys from MapIcons.ts)
UPDATE network_folders SET default_icon = 'RAILTAIL', category = 'active' WHERE name ILIKE '%Railtail%';
UPDATE network_folders SET default_icon = 'PGCIL', category = 'active' WHERE name ILIKE '%PGCIL%';
UPDATE network_folders SET default_icon = 'RCOM', category = 'active' WHERE name ILIKE '%RCOM%';
UPDATE network_folders SET default_icon = 'SIFY', category = 'active' WHERE name ILIKE '%Sify%';
UPDATE network_folders SET default_icon = 'TTSL', category = 'active' WHERE name ILIKE '%TTSL%';
UPDATE network_folders SET default_icon = 'JTM', category = 'active' WHERE name ILIKE '%JTM%';
UPDATE network_folders SET default_icon = 'OPTIMAL', category = 'active' WHERE name ILIKE '%Optimal Telemedia%';

-- 5. Re-Propagate these new defaults to children
WITH RECURSIVE folder_tree AS (
    SELECT id, default_icon, category
    FROM network_folders
    WHERE default_icon IS NOT NULL AND default_icon != 'DEFAULT'
    UNION ALL
    SELECT c.id, p.default_icon, p.category
    FROM network_folders c
    JOIN folder_tree p ON c.parent_id = p.id
    WHERE (c.default_icon IS NULL OR c.default_icon = 'DEFAULT')
)
UPDATE network_folders f
SET default_icon = ft.default_icon, category = ft.category
FROM folder_tree ft
WHERE f.id = ft.id;

-- 6. Update Files
UPDATE network_files f
SET icon_type = p.default_icon
FROM network_folders p
WHERE f.folder_id = p.id
AND p.default_icon IS NOT NULL 
AND p.default_icon != 'DEFAULT';

COMMIT;
