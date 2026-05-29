-- Database Optimization Indices
-- Generated for Performance Tuning
-- Date: 2026-01-10

-- 1. Users Table (Frequent lookups by username/email/role)
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);

-- 2. Notifications (Filtering by user and sorting by date)
CREATE INDEX IF NOT EXISTS idx_notifications_user_date ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- 3. Temporary Access Logs (Checking active access)
-- Useful for: WHERE user_id = ? AND status = 'active' AND end_time > NOW()
CREATE INDEX IF NOT EXISTS idx_temp_access_status ON temporary_access_log(user_id, status, end_time);

-- 4. Fiber Rings (Spatial & User Filtering)
-- Geometry index is usually created by PostGIS automatically or manually if missing. 
-- Adding standard B-Tree for metadata filtering.
CREATE INDEX IF NOT EXISTS idx_fiber_rings_creator ON fiber_rings(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fiber_rings_region ON fiber_rings(region_id);
-- Ensure users can find rings they own quickly

-- 5. Sector RF Data (Tower Data)
CREATE INDEX IF NOT EXISTS idx_sector_rf_user ON sector_rf_data(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sector_rf_region ON sector_rf_data(region_id);

-- 6. Elevation Profiles (History)
CREATE INDEX IF NOT EXISTS idx_elevation_user ON elevation_profiles(created_by, created_at DESC);

-- 7. Drawings (Polygons & Circles)
CREATE INDEX IF NOT EXISTS idx_polygons_user ON polygon_drawings(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_circles_user ON circle_drawings(created_by, created_at DESC);

-- 8. Audit Logs (Security/History)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);

-- 9. API Performance Logs (For future analysis)
CREATE INDEX IF NOT EXISTS idx_api_perf_endpoint ON api_performance_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_perf_status ON api_performance_logs(status_code);
