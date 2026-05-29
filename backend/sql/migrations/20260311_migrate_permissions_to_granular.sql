UPDATE roles 
SET permissions = (
    SELECT jsonb_agg(val)
    FROM (
        SELECT v.val
        FROM jsonb_array_elements(permissions::jsonb) AS x(val)
        CROSS JOIN LATERAL (
            SELECT '"network:file:edit_planned"'::jsonb AS val WHERE x.val::text = '"network:file:edit"'
            UNION ALL
            SELECT '"network:file:edit_live"'::jsonb AS val WHERE x.val::text = '"network:file:edit"'
            UNION ALL
            SELECT '"network:file:edit_imported"'::jsonb AS val WHERE x.val::text = '"network:file:edit"'
            UNION ALL
            SELECT x.val WHERE x.val::text != '"network:file:edit"'
        ) v
    ) sub
)
WHERE permissions::text LIKE '%"network:file:edit"%';

UPDATE users 
SET permissions = (
    SELECT jsonb_agg(val)
    FROM (
        SELECT v.val
        FROM jsonb_array_elements(permissions::jsonb) AS x(val)
        CROSS JOIN LATERAL (
            SELECT '"network:file:edit_planned"'::jsonb AS val WHERE x.val::text = '"network:file:edit"'
            UNION ALL
            SELECT '"network:file:edit_live"'::jsonb AS val WHERE x.val::text = '"network:file:edit"'
            UNION ALL
            SELECT '"network:file:edit_imported"'::jsonb AS val WHERE x.val::text = '"network:file:edit"'
            UNION ALL
            SELECT x.val WHERE x.val::text != '"network:file:edit"'
        ) v
    ) sub
)
WHERE permissions::text LIKE '%"network:file:edit"%';

UPDATE roles 
SET permissions = (
    SELECT COALESCE(jsonb_agg(x.val), '[]'::jsonb)
    FROM jsonb_array_elements(permissions::jsonb) AS x(val)
    WHERE x.val::text != '"network:file:delete"'
)
WHERE permissions::text LIKE '%"network:file:delete"%';

UPDATE users 
SET permissions = (
    SELECT COALESCE(jsonb_agg(x.val), '[]'::jsonb)
    FROM jsonb_array_elements(permissions::jsonb) AS x(val)
    WHERE x.val::text != '"network:file:delete"'
)
WHERE permissions::text LIKE '%"network:file:delete"%';
