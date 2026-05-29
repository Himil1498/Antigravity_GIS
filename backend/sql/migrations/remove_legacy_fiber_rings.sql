-- Migration: Remove Legacy Fiber Rings
-- Description: Drops the obsolete fiber_rings, fiber_ring_sites, fiber_ring_segments, and fiber_ring_history tables.
-- Created: 2026-04-01

-- Clear tables
DROP TABLE IF EXISTS fiber_ring_history;
DROP TABLE IF EXISTS fiber_ring_segments;
DROP TABLE IF EXISTS fiber_ring_sites;
DROP TABLE IF EXISTS fiber_rings;

-- Remove permission definition
DELETE FROM system_permissions WHERE code = 'map:tools:fiber_ring';
