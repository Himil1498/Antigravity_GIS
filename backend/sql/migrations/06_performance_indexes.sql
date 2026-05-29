-- Performance Indexes Migration
-- Detected slow queries on notifications and temporary_access_log tables
-- Adding indexes to support filtering by user_id, status, and sorting by time

-- 1. Notifications: Optimize Count Unread & List
-- Query: SELECT COUNT(*) ... WHERE user_id = ? AND is_read = FALSE
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE is_read = FALSE;

-- Query: SELECT ... WHERE user_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);


-- 2. Temporary Access Log: Optimize Access Checks
-- Query: SELECT ... WHERE user_id = ? AND status != 'revoked' AND end_time > NOW()
-- We primarily filter by user_id, then check time/status.
CREATE INDEX IF NOT EXISTS idx_temp_access_user_active ON temporary_access_log(user_id, end_time, status);

-- Also optimize the Joins on region_id and granted_by if they aren't already indexed (FKs often aren't auto-indexed in PG)
CREATE INDEX IF NOT EXISTS idx_temp_access_region ON temporary_access_log(region_id);
CREATE INDEX IF NOT EXISTS idx_temp_access_granter ON temporary_access_log(granted_by);

-- 3. Region Boundaries: Optimize Geometry Access (just in case)
-- CREATE INDEX IF NOT EXISTS idx_region_boundaries_geom ON region_boundaries USING GIST(boundary_geojson);
-- Note: GIST on JSONB geojson is not standard, normally we'd have a geometry column. 
-- The existing schema uses 'boundary_geojson' JSONB so we can't easily GIST index it without expression index.
-- Skipping complex GIST for now as the reported slow queries are relational.

ANALYZE notifications;
ANALYZE temporary_access_log;
