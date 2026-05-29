-- Migration: Fix Dark Fiber Baseline Tables
-- Date: 2026-04-27
-- Description: Re-creates the core Dark Fiber tables if they were missed in previous deployments.

-- 1. Ensure PostGIS is active (Required for geometry columns)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create Dark Fiber Imports (The baseline table)
CREATE TABLE IF NOT EXISTS dark_fiber_imports (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    imported_by VARCHAR(100),
    status VARCHAR(50) DEFAULT 'SUCCESS',
    details JSONB,
    folder_id INTEGER, -- Added to support the folder relationship
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- 3. Create Dark Fiber Nodes (POPs and Customers)
CREATE TABLE IF NOT EXISTS dark_fiber_nodes (
    id SERIAL PRIMARY KEY,
    import_id INT REFERENCES dark_fiber_imports(id) ON DELETE CASCADE,
    name VARCHAR(255),
    type VARCHAR(100), -- 'POP', 'Customer', etc.
    geom geometry(Point, 4326),
    properties JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Dark Fiber Routes (Cables)
CREATE TABLE IF NOT EXISTS dark_fiber_routes (
    id SERIAL PRIMARY KEY,
    import_id INT REFERENCES dark_fiber_imports(id) ON DELETE CASCADE,
    name VARCHAR(255),
    geom geometry(LineString, 4326),
    properties JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_df_nodes_geom ON dark_fiber_nodes USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_df_routes_geom ON dark_fiber_routes USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_df_nodes_import_id ON dark_fiber_nodes(import_id);
CREATE INDEX IF NOT EXISTS idx_df_routes_import_id ON dark_fiber_routes(import_id);
