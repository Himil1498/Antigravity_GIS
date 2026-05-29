-- Migration: Create roles table for dynamic role management
-- Date: 2026-02-17

-- Table: roles
CREATE TABLE IF NOT EXISTS "roles" (
    "id" SERIAL NOT NULL,
    "name" CHARACTER VARYING(50) NOT NULL,
    "display_name" CHARACTER VARYING(100) NOT NULL,
    "description" TEXT,
    "permissions" JSONB DEFAULT '[]'::jsonb,
    "color" CHARACTER VARYING(20) DEFAULT '#6B7280',
    "icon" CHARACTER VARYING(50) DEFAULT 'user',
    "is_system" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "created_by" INTEGER,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    UNIQUE ("name")
);

-- Seed default system roles
INSERT INTO roles (name, display_name, description, permissions, color, icon, is_system, is_active) VALUES
('admin', 'Admin', 'Full system access with all permissions', '["*"]', '#7C3AED', 'shield', true, true),
('manager', 'Manager', 'Team management with user and data control', '["gis.distance.use","gis.distance.save","gis.distance.delete.any","gis.polygon.use","gis.polygon.save","gis.polygon.delete.any","gis.circle.use","gis.circle.save","gis.circle.delete.any","gis.elevation.use","gis.elevation.save","gis.elevation.delete.any","gis.infrastructure.use","gis.infrastructure.save","gis.infrastructure.delete.any","gis.infrastructure.import","data.view.all","data.edit.all","data.delete.all","data.export","users:view","users:edit","users:delete","users:manage_permissions","users:reset_password","users:manage_security","users:assign_regions","users:assign_groups","groups:view","settings.view","settings.boundary.edit","settings.map.edit","search.use","search.history.view","bookmarks.create"]', '#2563EB', 'briefcase', true, true),
('technician', 'Technician', 'Technical operations with own data management', '["gis.distance.use","gis.distance.save","gis.distance.delete.own","gis.polygon.use","gis.polygon.save","gis.polygon.delete.own","gis.circle.use","gis.circle.save","gis.circle.delete.own","gis.elevation.use","gis.elevation.save","gis.elevation.delete.own","gis.infrastructure.use","gis.infrastructure.save","gis.infrastructure.delete.own","data.view.own","data.edit.own","data.delete.own","settings.view","search.use","bookmarks.create","users:view","map:view","datahub:view","network:view","dashboard:view"]', '#D97706', 'cog', true, true),
('developer', 'Developer', 'System development with full GIS and admin view access', '["gis.distance.use","gis.distance.save","gis.distance.delete.any","gis.polygon.use","gis.polygon.save","gis.polygon.delete.any","gis.circle.use","gis.circle.save","gis.circle.delete.any","gis.elevation.use","gis.elevation.save","gis.elevation.delete.any","gis.infrastructure.use","gis.infrastructure.save","gis.infrastructure.delete.any","gis.infrastructure.import","data.view.all","data.edit.all","data.delete.all","data.export","users:view","users:edit","users:delete","users:manage_permissions","settings.view","settings.boundary.edit","settings.map.edit","search.use","search.history.view","bookmarks.create","map:view","datahub:view","network:view","dashboard:view","analytics:view","admin:view"]', '#059669', 'code', true, true),
('user', 'User', 'Basic access with limited GIS tools', '["gis.distance.use","gis.distance.save","gis.polygon.use","gis.circle.use","data.view.own","search.use","users:view","map:view","datahub:view","network:view","dashboard:view"]', '#6B7280', 'user', true, true)
ON CONFLICT (name) DO NOTHING;
