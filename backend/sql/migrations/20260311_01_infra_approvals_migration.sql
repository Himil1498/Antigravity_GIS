-- Infrastructure Approvals Table
-- Staging table for 2-stage PM→BM approval workflow
CREATE TABLE IF NOT EXISTS infra_approvals (
    id SERIAL PRIMARY KEY,
    folder_id INTEGER REFERENCES network_folders(id) ON DELETE CASCADE,
    submitted_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending_planned',
    -- Statuses: pending_planned, planned, pending_active, active, rejected
    form_data JSONB NOT NULL,
    circuit_id VARCHAR(100),
    feature_id INTEGER,  -- Links to network_features after first approval
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_infra_approvals_status ON infra_approvals(status);
CREATE INDEX IF NOT EXISTS idx_infra_approvals_submitted_by ON infra_approvals(submitted_by);
CREATE INDEX IF NOT EXISTS idx_infra_approvals_folder_id ON infra_approvals(folder_id);
