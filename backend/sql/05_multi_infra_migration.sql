-- Multi-Infrastructure Linking Migration

-- 1. Remove the unique constraint on (report_id, feature_id) if it exists.
-- The name might be 'feasibility_items_report_id_feature_id_key' (Postgres default)
ALTER TABLE feasibility_items DROP CONSTRAINT IF EXISTS feasibility_items_report_id_feature_id_key;

-- 2. If there are other unique indexes that prevent duplicates, drop them too.
DROP INDEX IF EXISTS idx_feasibility_items_unique_report_feature;