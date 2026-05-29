-- Optimizations for Network Planning Module
-- Run this in your production PostgreSQL database

-- 1. Optimize Folder Lookups
-- Speeds up "getFolderContents" queries
CREATE INDEX IF NOT EXISTS idx_network_files_folder_id 
ON network_files(folder_id);

-- 2. Optimize Feature Lookups (Critical for large files)
-- Speeds up fetching geometries for a specific file
CREATE INDEX IF NOT EXISTS idx_network_features_file_id 
ON network_features(file_id);

-- 3. Optimize Spatial Queries (PostGIS)
-- Speeds up bounding box queries, tile generation (MVT), and spatial joins
-- NOTE: Ensure PostGIS extension is enabled (CREATE EXTENSION IF NOT EXISTS postgis;)
CREATE INDEX IF NOT EXISTS idx_network_features_geom 
ON network_features USING GIST(geom);

-- 4. Optimize Background Polling & Status Filtering
-- Speeds up queries checking for 'processing' files (e.g. Smart Check, Admin dashboards)
CREATE INDEX IF NOT EXISTS idx_network_files_processing_status 
ON network_files(processing_status) 
WHERE processing_status IN ('processing', 'failed');
