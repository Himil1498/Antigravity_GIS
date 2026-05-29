-- SQL Script to insert new file deletion permissions for Network Planning

INSERT INTO system_permissions (category, code, name, description) 
VALUES 
    ('network', 'network:file:delete_approved', 'Delete Approved Network Data', 'Permits deleting finalized, approved outcome data from the system.'),
    ('network', 'network:file:delete_live', 'Delete Live Inventory Data', 'Permits deleting or altering active infrastructure features in the live inventory folders.'),
    ('network', 'network:file:delete_imported', 'Delete Imported File Data', 'Permits deleting user-uploaded raw KML/Excel datasets from the network folders.')
ON CONFLICT (code) DO NOTHING;
