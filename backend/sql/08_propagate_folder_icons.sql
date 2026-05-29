-- Migration: Propagate Icons to Child Folders
-- Purpose: Ensure subfolders (e.g., "Andaman") inherit "Indus" icon from their parent "Indus" folder.

WITH RECURSIVE folder_tree AS (
    -- Base Case: Select Top-Level Folders or Folders with explicitly set icons
    SELECT 
        id, 
        name, 
        parent_id, 
        category, 
        default_icon
    FROM network_folders
    WHERE parent_id IS NULL OR (default_icon IS NOT NULL AND default_icon != 'DEFAULT')

    UNION ALL

    -- Recursive Step: Select children, inheriting parent's values if likely to be correct
    SELECT 
        c.id, 
        c.name, 
        c.parent_id,
        COALESCE(p.category, c.category), -- Inherit category
        COALESCE(p.default_icon, c.default_icon) -- Inherit default_icon
    FROM network_folders c
    JOIN folder_tree p ON c.parent_id = p.id
    -- Only inherit if child doesn't already have a strong setting
    WHERE (c.default_icon IS NULL OR c.default_icon = 'DEFAULT')
)
UPDATE network_folders f
SET 
  default_icon = ft.default_icon,
  category = ft.category
FROM folder_tree ft
WHERE f.id = ft.id
  AND ft.default_icon IS NOT NULL;
