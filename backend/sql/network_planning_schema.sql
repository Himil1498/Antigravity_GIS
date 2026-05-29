-- Network Folders Table
CREATE TABLE IF NOT EXISTS network_folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INTEGER REFERENCES network_folders(id) ON DELETE CASCADE,
    is_system BOOLEAN DEFAULT FALSE, -- If true, cannot be deleted/renamed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id) -- Nullable for system folders
);

-- Index for faster tree traversal
CREATE INDEX IF NOT EXISTS idx_network_folders_parent_id ON network_folders(parent_id);

-- Network Files Table (for KML/KMZ)
CREATE TABLE IF NOT EXISTS network_files (
    id SERIAL PRIMARY KEY,
    folder_id INTEGER REFERENCES network_folders(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'kml', 'kmz'
    storage_path VARCHAR(512), -- Path to physical file if stored on disk
    size_bytes BIGINT,
    metadata JSONB DEFAULT '{}', -- Extra info parsed from KML
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INTEGER REFERENCES users(id)
);

-- Network Features Table (for KML/KMZ Geometries)
CREATE TABLE IF NOT EXISTS network_features (
    id SERIAL PRIMARY KEY,
    file_id INTEGER REFERENCES network_files(id) ON DELETE CASCADE,
    geom geometry(Geometry, 3857), -- Store as Web Mercator for MVT
    properties JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_network_features_geom ON network_features USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_network_features_file_id ON network_features(file_id);

CREATE INDEX IF NOT EXISTS idx_network_files_folder_id ON network_files(folder_id);
