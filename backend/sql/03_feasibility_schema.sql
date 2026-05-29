-- Feasibility Reports Schema

CREATE TABLE IF NOT EXISTS feasibility_reports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

CREATE TABLE IF NOT EXISTS feasibility_items (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES feasibility_reports(id) ON DELETE CASCADE,
    feature_id INTEGER NOT NULL REFERENCES network_features(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_feasibility_reports_user ON feasibility_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_feasibility_items_report ON feasibility_items(report_id);
CREATE INDEX IF NOT EXISTS idx_feasibility_items_feature ON feasibility_items(feature_id);

-- Add updated_at trigger if not exists (assuming function exists, else simple update)
