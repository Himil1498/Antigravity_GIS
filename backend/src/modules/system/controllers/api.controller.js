const { Pool } = require("pg");
require('dotenv').config();
const { logAudit } = require('../../audit/audit.service');

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "autocad_gis_db",
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

/**
 * Helper to flatten the express router stack into a list of endpoints
 */
function getRoutes(stack, basePath = '') {
    const routes = [];

    stack.forEach(layer => {
        if (layer.route) {
            // It's a route
            const path = basePath + layer.route.path;
            const methods = Object.keys(layer.route.methods).filter(m => layer.route.methods[m]);
            
            methods.forEach(method => {
                 routes.push({
                     method: method.toUpperCase(),
                     path: path,
                     parameters: layer.keys.map(k => k.name)
                 });
            });

        } else if (layer.name === 'router' && layer.handle.stack) {
            // It's a router middleware
            // Need to find the mounting path. This is tricky in pure express without knowing where it was mounted.
            // But we can approximate.
            // Actually, querying the app._router.stack from the controller is safer.
            // For now, let's assume this recursive function works on properly passed stacks.
            
            // Note: retrieving the full path from a nested router in express 4.x is hard because the mount path is regex lost.
            // However, we can use the "regexp" source if needed, or just rely on manual mapping if this fails.
            
            // Instead of complex recursion here, we will do it inside the controller using req.app._router.stack
        }
    });
    return routes;
}


/* Helper to parse Express 4.x Regex into a string path */
const getPathFromRegex = (regexp) => {
    if (!regexp || regexp.fast_slash) return '';
    try {
        const str = regexp.toString();
        // Common pattern: /^\/api\/v1\/?(?=\/|$)/i
        const match = str
            .replace('\\/?', '')
            .replace('(?=\\/|$)', '$')
            .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//);
        
        if (match) {
            let path = match[1].replace(/\\(.)/g, '$1');
            if (!path.startsWith('/')) path = '/' + path;
            return path;
        }
        return '';
    } catch (e) {
        return '';
    }
};

/* Recursive function to find all routes */
const findRoutes = (stack, basePath = '') => {
    let routes = [];
    
    if (!stack) return routes;

    stack.forEach(layer => {
        if (layer.route) {
            // It's a route
            const path = basePath + layer.route.path;
            const methods = Object.keys(layer.route.methods).filter(m => layer.route.methods[m]);
            methods.forEach(method => {
                routes.push({
                    method: method.toUpperCase(),
                    path: path === '/' ? basePath : path || '/'
                });
            });
        } else if (layer.name === 'router' && layer.handle.stack) {
            // It's a router
            let prefix = getPathFromRegex(layer.regexp);
            
            // Special case for 'api' prefix if regex parsing is tricky
            // If the router is mounted at /api, checking the code or assumption might be needed
            // But let's trust our parser.
            findRoutes(layer.handle.stack, basePath + prefix).forEach(r => routes.push(r));
        }
    });
    return routes;
};

exports.getApiDocs = async (req, res) => {
    try {
        // 1. Discover Active Routes
        const activeRoutes = findRoutes(req.app._router.stack);
        
        // Remove duplicates (e.g. if mounted multiple times or same path)
        const uniqueRoutes = Array.from(new Set(activeRoutes.map(r => `${r.method}|${r.path}`)))
            .map(s => {
                const [method, path] = s.split('|');
                return { method, path: path || '/' };
            });

        // 2. Fetch Existing Annotations
        const { rows: annotations } = await pool.query('SELECT * FROM system_api_annotations');
        const annotationMap = new Map(annotations.map(a => [`${a.method}:${a.path}`, a]));

        // 3. Auto-populate missing routes
        const newRoutes = [];
        const merged = uniqueRoutes.map(r => {
            const key = `${r.method}:${r.path}`;
            const existing = annotationMap.get(key);
            
            if (!existing) {
                // Prepare for insertion
                // Generate a generic description
                const parts = r.path.split('/').filter(Boolean);
                const resource = parts[parts.length - 1] || 'root';
                const verb = r.method === 'GET' ? 'Retrieves' : r.method === 'POST' ? 'Creates' : r.method === 'PUT' ? 'Updates' : 'Deletes';
                // Try to infer module from path
                const module = parts[0] === 'api' ? parts[1] : parts[0] || 'System';
                
                const desc = `### What
${verb} ${resource} data.

### Where
Module: **${module.charAt(0).toUpperCase() + module.slice(1)}**
Path: \`${r.path}\`

### Why
Auto-detected endpoint for ${resource} operations.

### How
Standard **${r.method}** Request.

### Connects
- ${module.charAt(0).toUpperCase() + module.slice(1)} Database Tables`;
                
                newRoutes.push({
                    method: r.method,
                    path: r.path,
                    description: desc
                });
                
                return {
                    ...r,
                    description: desc,
                    usage_example: "",
                    response_schema: "",
                    last_updated: new Date().toISOString()
                };
            }
            
            return {
               ...r,
               description: existing.description,
               usage_example: existing.usage_example,
               response_schema: existing.response_schema,
               last_updated: existing.last_updated_at
            };
        });

        // 4. Batch Insert New Routes (Async)
        if (newRoutes.length > 0) {
            // We do this asynchronously to not block the response too long, or we can await it.
            // Awaiting is safer to ensure next refresh has them.
            // Batched insert limited to ~500 params, so let's chunk it if needed
            // Assuming < 50 new routes at once usually.
            
            const chunkArray = (arr, size) => {
                const res = [];
                for (let i = 0; i < arr.length; i += size) { res.push(arr.slice(i, i + size)); }
                return res;
            }
            
            const chunks = chunkArray(newRoutes, 20); // Safety batching
            
            for (const chunk of chunks) {
                const values = [];
                const placeholders = [];
                chunk.forEach((r, i) => {
                    const updatedBy = 'system-auto';
                    const offset = i * 6;
                    placeholders.push(`($${offset+1}, $${offset+2}, $${offset+3}, $${offset+4}, $${offset+5}, $${offset+6})`);
                    values.push(r.method, r.path, r.description, '', '', updatedBy);
                });
                
                if (placeholders.length > 0) {
                    const query = `
                        INSERT INTO system_api_annotations (method, path, description, usage_example, response_schema, updated_by) 
                        VALUES ${placeholders.join(', ')}
                        ON CONFLICT (method, path) DO NOTHING
                    `;
                    await pool.query(query, values);
                }
            }
            console.log(`Auto-populated ${newRoutes.length} new API routes.`);
        }

        // 5. Sort
        merged.sort((a,b) => a.path.localeCompare(b.path));

        res.json({
            count: merged.length,
            apis: merged
        });

    } catch (error) {
        console.error("API Docs Error:", error);
        res.status(500).json({ error: "Failed to fetch API documentation" });
    }
};

exports.updateApiAnnotation = async (req, res) => {
    try {
        const { method, path, description, usage_example, response_schema } = req.body;
        
        if (!method || !path) {
            return res.status(400).json({ error: "Method and Path are required" });
        }

        const query = `
            INSERT INTO system_api_annotations (method, path, description, usage_example, response_schema, updated_by, last_updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (method, path)
            DO UPDATE SET
                description = EXCLUDED.description,
                usage_example = EXCLUDED.usage_example,
                response_schema = EXCLUDED.response_schema,
                updated_by = EXCLUDED.updated_by,
                last_updated_at = NOW()
            RETURNING *;
        `;
        
        const result = await pool.query(query, [
            method.toUpperCase(), 
            path, 
            description, 
            usage_example, 
            response_schema, 
            req.user?.username || 'system'
        ]);

        await logAudit(
            req.user?.id || 'system',
            'UPDATE_API_ANNOTATION',
            'SYSTEM_API',
            path,
            { method: method.toUpperCase() },
            req
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Update Annotation Error:", error);
        res.status(500).json({ error: "Failed to update documentation" });
    }
};
