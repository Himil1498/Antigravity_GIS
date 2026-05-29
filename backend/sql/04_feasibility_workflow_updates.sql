-- Feasibility Reporting Workflow Updates

-- Add status and review columns to feasibility_reports
ALTER TABLE feasibility_reports
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS review_comments TEXT;

-- Create index for faster filtering by status (for PM dashboard)
CREATE INDEX IF NOT EXISTS idx_feasibility_reports_status ON feasibility_reports(status);
