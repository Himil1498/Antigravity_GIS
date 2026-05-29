-- Migration: Create Dark Fiber Redesign Tables
-- Description: Creates the baseline tables for storing KMZ/KML parsed Dark Fiber networks.

CREATE TABLE IF NOT EXISTS dark_fiber_imports (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    imported_by VARCHAR(100),
    status VARCHAR(50) DEFAULT 'SUCCESS',
    details JSONB
);

CREATE TABLE IF NOT EXISTS dark_fiber_nodes (
    id SERIAL PRIMARY KEY,
    import_id INT REFERENCES dark_fiber_imports(id) ON DELETE CASCADE,
    name VARCHAR(255),
    type VARCHAR(100), -- e.g., 'POP' or 'Customer' or 'Unknown'
    geom geometry(Point, 4326),
    properties JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dark_fiber_routes (
    id SERIAL PRIMARY KEY,
    import_id INT REFERENCES dark_fiber_imports(id) ON DELETE CASCADE,
    name VARCHAR(255),
    geom geometry(LineString, 4326),
    properties JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_df_nodes_geom ON dark_fiber_nodes USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_df_routes_geom ON dark_fiber_routes USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_df_nodes_import_id ON dark_fiber_nodes(import_id);
CREATE INDEX IF NOT EXISTS idx_df_routes_import_id ON dark_fiber_routes(import_id);

-- Optional: Create an aggregated view or trigger later if needed, but for now we keep it raw and performant.
