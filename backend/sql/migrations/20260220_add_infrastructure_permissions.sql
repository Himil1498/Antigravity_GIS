-- Migration: Add separate table for Add New Inventory Folder Permissions

CREATE TABLE IF NOT EXISTS user_folder_add_access (
    user_id INTEGER REFERENCES opticonnect_user(id) ON DELETE CASCADE,
    folder_id INTEGER REFERENCES network_folders(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, folder_id)
);

-- Index for faster read checks
CREATE INDEX IF NOT EXISTS idx_user_folder_add_access_user_id ON user_folder_add_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_folder_add_access_folder_id ON user_folder_add_access(folder_id);

-- Initialize the table: By default, if a user could "View", let's give them "Add" access initially so their workflow isn't completely broken, 
-- or we can start empty. Starting empty is safer to enforce the new strict rules, but copying over existing access prevents immediate complaints.
-- Let's copy existing access as the baseline so admins can just remove what they don't want.
INSERT INTO user_folder_add_access (user_id, folder_id)
SELECT user_id, folder_id FROM user_folder_access
ON CONFLICT DO NOTHING;
