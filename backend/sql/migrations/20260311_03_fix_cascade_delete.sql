-- Fix Delete Logic: Enable Cascade Delete
-- Run this in your database to ensure that deleting a file also deletes its features.

-- 1. Drop existing Foreign Key (if name differs, check your constraints)
ALTER TABLE network_features
DROP CONSTRAINT IF EXISTS network_features_file_id_fkey;

-- 2. Add New Foreign Key with ON DELETE CASCADE
ALTER TABLE network_features
ADD CONSTRAINT network_features_file_id_fkey 
FOREIGN KEY (file_id) 
REFERENCES network_files(id) 
ON DELETE CASCADE;

-- Validation
-- You can verify the constraint was added by running:
-- SELECT constraint_name, delete_rule 
-- FROM information_schema.referential_constraints 
-- WHERE constraint_name = 'network_features_file_id_fkey';
