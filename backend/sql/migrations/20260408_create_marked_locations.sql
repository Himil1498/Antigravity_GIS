-- Migration: Create marked_locations table
-- Date: 2026-04-08

CREATE TABLE IF NOT EXISTS marked_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    notes TEXT,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups by user
CREATE INDEX idx_marked_locations_created_by ON marked_locations(created_by);

-- Comment on table
COMMENT ON TABLE marked_locations IS 'Stores user-defined points of interest for elevation analysis and map markings.';
