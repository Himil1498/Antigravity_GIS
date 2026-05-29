-- Migration: Add Performance Indexes for Network Planning Data
-- Date: 2026-04-29
-- Purpose: Optimize ST_AsMVT tile generation for massive datasets (10+ Lacs records).

-- 1. Spatial index on geometry for fast ST_TileEnvelope and ST_Intersects queries
CREATE INDEX IF NOT EXISTS idx_network_features_geom_gist 
ON network_features USING GIST (geom);

-- 2. Index on file_id to optimize filtering when specific layers are toggled
CREATE INDEX IF NOT EXISTS idx_network_features_file_id 
ON network_features (file_id);

-- 3. Index on deleted_at to quickly skip soft-deleted features
CREATE INDEX IF NOT EXISTS idx_network_features_deleted_at 
ON network_features (deleted_at)
WHERE deleted_at IS NULL; -- Partial index for maximum efficiency

-- 4. Index on network_files folder_id for fast join lookups
CREATE INDEX IF NOT EXISTS idx_network_files_folder_id 
ON network_files (folder_id);

-- 5. Spatial index on region_boundaries for fast region intersections
CREATE INDEX IF NOT EXISTS idx_region_boundaries_geom_gist 
ON region_boundaries USING GIST (geom);
