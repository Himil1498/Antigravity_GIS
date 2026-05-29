-- Migration: Add missing UX fields to Dark Fiber tables
-- Database: PostgreSQL

-- 1. Update dark_fiber_routes table
ALTER TABLE dark_fiber_routes
ADD COLUMN IF NOT EXISTS start_pop_id INTEGER REFERENCES dark_fiber_pops(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS end_pop_id INTEGER REFERENCES dark_fiber_pops(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS fiber_type VARCHAR(50) DEFAULT 'single_mode',
ADD COLUMN IF NOT EXISTS cable_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS line_width INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS line_dash_pattern VARCHAR(50);

-- 2. Update dark_fiber_customer_rings table
ALTER TABLE dark_fiber_customer_rings
ADD COLUMN IF NOT EXISTS start_pop VARCHAR(255),
ADD COLUMN IF NOT EXISTS end_pop VARCHAR(255),
ADD COLUMN IF NOT EXISTS line_width INTEGER DEFAULT 3;
