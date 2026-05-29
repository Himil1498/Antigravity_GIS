-- Add action_url column to notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url VARCHAR(500);

-- Add related_entity_id for linking to specific entities
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_entity_id INTEGER;

-- Add related_entity_type for context
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_entity_type VARCHAR(50);
