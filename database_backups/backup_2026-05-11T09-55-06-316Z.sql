--
-- PostgreSQL database dump
--


-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.system_permissions DROP CONSTRAINT IF EXISTS system_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.system_permissions DROP CONSTRAINT IF EXISTS system_permissions_code_key;
ALTER TABLE IF EXISTS public.system_permissions ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.system_permissions_id_seq;
DROP TABLE IF EXISTS public.system_permissions;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: system_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_permissions (
    id integer NOT NULL,
    category character varying(50) NOT NULL,
    code character varying(100) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: system_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.system_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: system_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.system_permissions_id_seq OWNED BY public.system_permissions.id;


--
-- Name: system_permissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_permissions ALTER COLUMN id SET DEFAULT nextval('public.system_permissions_id_seq'::regclass);


--
-- Data for Name: system_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (1, 'map', 'map:view', 'View Map Tab', 'Access to the main Map interface', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (6, 'map', 'gis.infrastructure.use', 'Use Infrastructure Tool', 'Access to infrastructure management tools', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (8, 'map', 'gis.infrastructure.loader', 'Infrastructure Loader', 'Access to infrastructure loader tools', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (13, 'network', 'network:view', 'View Network Planning', 'Access the Network Planning tab', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (14, 'network', 'network:infra:items', 'Infrastructure Item', 'View Infrastructure Items and Network Folders', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (15, 'network', 'network:feasibility:read', 'Feasibility Reviews (Read)', 'View Feasibility Reports', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (16, 'network', 'network:feasibility:write', 'Feasibility Reviews (Write)', 'Create/Edit Feasibility Reports', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (17, 'network', 'network:infra:add', 'Add Infrastructure', 'Add new infrastructure to the network', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (19, 'network', 'network:map:view', 'Map View', 'See network elements on the map', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (20, 'network', 'network:folder:create', 'New Folder', 'Create new root or sub folders', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (21, 'network', 'network:file:import', 'Import File', 'Import KML/KMZ network files', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (22, 'dashboard', 'dashboard:view', 'View Dashboard', 'Access the main dashboard', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (23, 'users', 'users:view', 'View Users', 'See list of users (Read-only)', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (24, 'users', 'users:create', 'Create Users', 'Invite or create new user accounts', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (25, 'users', 'users:edit', 'Edit Users', 'Edit user details', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (26, 'users', 'users:delete', 'Delete Users', 'Remove user accounts', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (27, 'users', 'users:manage_permissions', 'Manage Permissions', 'Assign roles and permissions to users', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (28, 'users', 'users:reset_password', 'Reset Password', 'Change user passwords', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (29, 'users', 'users:manage_security', 'Manage Security', 'Verify email, Manage 2FA', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (30, 'users', 'users:assign_regions', 'Assign Regions', 'Manage user region access', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (31, 'users', 'users:assign_groups', 'Assign Groups', 'Manage user group membership', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (32, 'groups', 'groups:view', 'View Groups', 'Access the Groups management tab', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (33, 'groups', 'groups:create', 'Create Groups', 'Create new user groups', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (34, 'groups', 'groups:edit', 'Edit Groups', 'Manage group members and permissions', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (35, 'groups', 'groups:delete', 'Delete Groups', 'Remove groups', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (36, 'admin', 'admin:view', 'View Admin Tab', 'Access the Admin interface', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (37, 'admin', 'admin:audit_logs', 'Audit Logs', 'View system audit logs', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (38, 'admin', 'admin:region_request', 'Region Request', 'Manage region access requests', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (39, 'admin', 'admin:bulk_assignment', 'Bulk Assignment', 'Bulk assign regions/roles', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (40, 'admin', 'admin:temp_access', 'Temporary Access', 'Manage temporary user access', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (41, 'admin', 'admin:export_reports', 'Export Reports', 'Export system reports', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (42, 'admin', 'admin:password_reset', 'Password Reset', 'Reset user passwords', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (43, 'admin', 'admin:region_boundaries', 'Region Boundaries', 'Manage map region limits', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (44, 'admin', 'admin:database', 'Database', 'Database management tools', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (45, 'analytics', 'analytics:view', 'View Analytics', 'Access the Analytics tab', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (46, 'settings', 'settings:view', 'View Settings', 'Access application settings', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (47, 'settings', 'settings:boundary:edit', 'Edit Boundaries', 'Modify system boundary settings', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (48, 'settings', 'settings:map:edit', 'Edit Map Settings', 'Modify default map configurations', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (49, 'search', 'search:use', 'Use Search', 'Access global search functionality', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (50, 'search', 'search:history:view', 'View Search History', 'See past search queries', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (51, 'bookmarks', 'bookmarks:create', 'Create Bookmarks', 'Save locations or views', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (53, 'user_management', 'users:update', 'Update User', 'Allow updating user details', '2026-02-14 11:22:36.541768+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (54, 'system_admin', 'permissions.view', 'View Permissions', 'Allow viewing system permissions', '2026-02-14 11:22:36.581007+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (55, 'system_admin', 'permissions.manage', 'Manage Permissions', 'Allow managing system permissions', '2026-02-14 11:22:36.589432+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (56, 'system_settings', 'settings.view', 'View Settings', 'Allow viewing system settings', '2026-02-14 11:22:36.594419+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (57, 'network_planning', 'network:manage_features', 'Manage Network Features', 'Allow managing network features and folders', '2026-02-14 11:22:36.609096+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (58, 'network_planning', 'network:feasibility:manage', 'Manage Feasibility', 'Allow managing feasibility reports', '2026-02-14 11:22:36.624876+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (59, 'network_planning', 'network:feasibility:delete', 'Delete Feasibility', 'Allow deleting feasibility reports', '2026-02-14 11:22:36.63476+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (60, 'developer_tools', 'devtools.view', 'View Backups', 'Allow viewing backup list and stats', '2026-02-14 11:22:36.642007+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (61, 'developer_tools', 'devtools.delete', 'Delete Backup', 'Allow deleting database backups', '2026-02-14 11:22:36.645889+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (62, 'developer_tools', 'devtools.run', 'Run Backup/Restore', 'Allow execution of backup and restore', '2026-02-14 11:22:36.648711+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (63, 'developer_tools', 'devtools.admin', 'Backup Admin', 'Full access to backup administration', '2026-02-14 11:22:36.65644+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (64, 'system_admin', 'admin:audit_logs:delete', 'Delete Audit Log', 'Allow deleting specific audit logs', '2026-02-14 11:22:36.664164+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (65, 'system_admin', 'admin:audit_logs:clear', 'Clear Audit Logs', 'Allow clearing all audit logs', '2026-02-14 11:22:36.673661+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (66, 'devtools', 'devtools.download', 'Download Dump', 'Download database dumps', '2026-02-14 18:41:10.226194+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (69, 'admin', 'system:schema:view', 'View Database Schema', 'Allows viewing of the database tables, columns, and relationships.', '2026-02-17 23:00:16.687869+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (71, 'system', 'system:schema:query', 'Run SQL Queries', 'Run Read-Only SQL Queries', '2026-02-17 23:41:20.317584+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (72, 'system', 'system:schema:export', 'Export Schema Diagram', 'Save Schema as Image', '2026-02-17 23:41:20.365363+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (73, 'system', 'system:schema:annotate', 'Annotate Schema', 'Edit table descriptions and notes', '2026-02-17 23:49:13.733024+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (75, 'System', 'system:api:view', 'View API Documentation', 'View API Documentation', '2026-02-18 00:14:04.126089+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (76, 'System', 'system:api:edit', 'Edit API Documentation', 'Edit API Documentation', '2026-02-18 00:14:04.126089+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (78, 'system', 'data:export', 'Export Data', 'Export database tables to Excel', '2026-02-19 14:52:39.429052+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (81, 'help', 'system:schema:erd', 'Global ER Diagram', 'Allows viewing the Global ER Diagram visualization of the database.', '2026-02-22 11:30:03.934781+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (83, 'network', 'network:infra:approve', 'Approval Dashboard (BM Workflow)', 'Access to audit and approve/reject infrastructure requests.', '2026-03-06 20:50:16.699765+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (84, 'network', 'network:infra:submissions', 'My Submissions Tab (PM Workflow)', 'Access to track and resubmit own infrastructure requests.', '2026-03-06 20:50:16.699765+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (18, 'network', 'network:recycle_bin', 'View Recycle Bin', 'Grants access to view soft-deleted network items.', '2026-02-10 13:06:16.337362+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (82, 'network', 'network:infra:delete', 'Delete Submissions', 'Allow users to delete their own infrastructure submissions or admins to delete any.', '2026-03-06 20:41:18.775376+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (88, 'Network Planning', 'network:feasibility:view', 'View Feasibility Hub', 'Allows access to the Feasibility Hub and its study records.', '2026-04-10 14:24:46.856565+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (89, 'Network Planning', 'network:feasibility:edit', 'Manage Feasibility Studies', 'Allows creating markers and processing feasibility analysis.', '2026-04-10 14:24:46.856565+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (90, 'network', 'network:feasibility:markers', 'Add / Edit / Delete Markers', 'Allows adding new markers on the map, editing marker details, and deleting feasibility studies.', '2026-04-11 12:29:51.239447+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (96, 'network', 'network:file:delete_planned', 'Delete Planned Data', 'Remove unapproved submissions.', '2026-04-17 00:03:03.626637+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (99, 'network', 'network:file:delete_live', 'Delete Live Data', 'Remove active infrastructure.', '2026-04-17 00:03:03.626637+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (102, 'network', 'network:file:delete_imported', 'Delete Imported Data', 'Remove raw imported datasets.', '2026-04-17 00:03:03.626637+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (94, 'network', 'network:file:edit_planned', 'Edit Planned Data (Form)', 'Modify unapproved submissions via modal form.', '2026-04-17 00:03:03.626637+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (91, 'network', 'network:file:live_edit_planned', 'Live Edit Planned Data (In-line)', 'Modify unapproved submissions directly in table.', '2026-04-17 00:00:03.733043+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (105, 'network', 'network:file:delete_file_planned', 'Delete Planned File', 'Remove the entire planned data file.', '2026-04-17 00:20:51.90234+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (106, 'network', 'network:file:delete_feature_planned', 'Delete Planned Feature', 'Remove individual features from a planned file.', '2026-04-17 00:20:51.90234+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (97, 'network', 'network:file:edit_live', 'Edit Live Data (Form)', 'Modify active infrastructure via modal form.', '2026-04-17 00:03:03.626637+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (92, 'network', 'network:file:live_edit_live', 'Live Edit Live Data (In-line)', 'Modify active infrastructure directly in table.', '2026-04-17 00:00:03.733043+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (109, 'network', 'network:file:delete_file_live', 'Delete Live File', 'Remove the entire active inventory file.', '2026-04-17 00:20:51.90234+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (110, 'network', 'network:file:delete_feature_live', 'Delete Live Feature', 'Remove individual features from live inventory.', '2026-04-17 00:20:51.90234+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (100, 'network', 'network:file:edit_imported', 'Edit Imported Data (Form)', 'Modify raw imported datasets via modal form.', '2026-04-17 00:03:03.626637+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (93, 'network', 'network:file:live_edit_imported', 'Live Edit Imported Data (In-line)', 'Modify raw imported datasets directly in table.', '2026-04-17 00:00:03.733043+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (113, 'network', 'network:file:delete_file_imported', 'Delete Imported File', 'Remove the entire raw imported data file.', '2026-04-17 00:20:51.90234+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (114, 'network', 'network:file:delete_feature_imported', 'Delete Imported Feature', 'Remove individual features from imported datasets.', '2026-04-17 00:20:51.90234+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (119, 'darkfiber', 'darkfiber:view', 'View Dark Fiber (Placeholder)', 'Allows the user to see the Dark Fiber navigation tab and access the placeholder page.', '2026-04-17 14:55:17.821447+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (121, 'map', 'map:tools:geometry_suite', 'Geometry Suite', 'Enables analytical tools including Distance, Polygon, Circle, Elevation, and Sector RF.', '2026-05-01 17:49:10.437212+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (122, 'map', 'map:tools:circle', 'Circle Tool', 'Enables drawing circular exclusion zones and coverage radii.', '2026-05-01 17:54:00.104513+05:30');
INSERT INTO public.system_permissions (id, category, code, name, description, created_at) VALUES (123, 'map', 'map:tools:sector_rf', 'Sector RF Coverage', 'Displays cellular sector markers and renders simulated RF coverage arcs based on antenna stats.', '2026-05-01 17:54:00.104513+05:30');


--
-- Name: system_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.system_permissions_id_seq', 123, true);


--
-- Name: system_permissions system_permissions_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_permissions
    ADD CONSTRAINT system_permissions_code_key UNIQUE (code);


--
-- Name: system_permissions system_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_permissions
    ADD CONSTRAINT system_permissions_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--


