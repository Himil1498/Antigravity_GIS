require('dotenv').config({ path: 'Backend/.env' });
const axios = require('axios');
const { performance } = require('perf_hooks');

// Configuration
const ENV_API_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 82}`;
const API_URL = ENV_API_URL.endsWith('/api') ? ENV_API_URL : `${ENV_API_URL}/api`;

const ADMIN_EMAIL = 'admin@opticonnect.com';
const ADMIN_PASSWORD = 'Admin@123';
const ITERATIONS = 10; // Number of times to run each test for average
const SLOW_THRESHOLD_MS = 200; // Warning threshold

const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    bold: "\x1b[1m"
};

const stats = {};

const log = (msg) => console.log(msg);

const login = async () => {
    try {
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        return res.data.token;
    } catch (error) {
        console.error(`Login failed at ${API_URL}/auth/login:`, error.message);
        process.exit(1);
    }
};

const measure = async (name, fn) => {
    const times = [];
    process.stdout.write(`${colors.cyan}Testing ${name}... ${colors.reset}`);
    
    for (let i = 0; i < ITERATIONS; i++) {
        const start = performance.now();
        try {
            await fn();
        } catch (e) {
            process.stdout.write(colors.red + 'X');
            continue;
        }
        const end = performance.now();
        times.push(end - start);
        process.stdout.write('.');
    }

    if (times.length === 0) {
        console.log(` ${colors.red}FAILED${colors.reset}`);
        return;
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    times.sort((a, b) => a - b);
    const p95 = times[Math.floor(times.length * 0.95)];

    stats[name] = { avg, min, max, p95 };

    const color = avg > SLOW_THRESHOLD_MS ? colors.red : (avg > 100 ? colors.yellow : colors.green);
    console.log(` ${color}[Avg: ${avg.toFixed(0)}ms | P95: ${p95.toFixed(0)}ms]${colors.reset}`);
};

const runBenchmarks = async () => {
    console.log(`${colors.bold}🚀 Starting API Latency Benchmark (${ITERATIONS} runs/endpoint)${colors.reset}\n`);
    
    const token = await login();
    const headers = { Authorization: `Bearer ${token}` };

    // --- Core & Infra ---
    await measure('Core: Auth Check', () => axios.get(`${API_URL}/auth/me`, { headers }));
    await measure('Core: System Health', () => axios.get(`${API_URL}/health`, { headers }));
    await measure('DataHub: All User Data', () => axios.get(`${API_URL}/datahub/all?limit=50`, { headers }));
    await measure('Infrastructure: List', () => axios.get(`${API_URL}/infrastructure?limit=20`, { headers }));
    const viewportParams = { north: 37.0, south: 8.0, east: 97.0, west: 68.0, zoom: 7 };
    await measure('Infrastructure: Viewport', () => axios.get(`${API_URL}/infrastructure/viewport`, { headers, params: viewportParams }));
    await measure('Building Cache: Status', () => axios.get(`${API_URL}/building-cache/status`, { headers }).catch(() => {}));

    // --- GIS Tools (Read Operations) ---
    await measure('GIS: Distances', () => axios.get(`${API_URL}/measurements/distance?limit=1`, { headers }).catch(() => {}));
    await measure('GIS: Polygons', () => axios.get(`${API_URL}/drawings/polygon?limit=1`, { headers }).catch(() => {}));
    await measure('GIS: Circles', () => axios.get(`${API_URL}/drawings/circle?limit=1`, { headers }).catch(() => {}));
    await measure('GIS: Sectors', () => axios.get(`${API_URL}/rf/sectors?limit=1`, { headers }).catch(() => {}));
    await measure('GIS: Fiber Rings', () => axios.get(`${API_URL}/fiber-rings?limit=1`, { headers }).catch(() => {}));

    // --- Admin & Stats ---
    await measure('Admin: User List', () => axios.get(`${API_URL}/users?limit=10`, { headers }));
    await measure('Analytics: Dashboard', () => axios.get(`${API_URL}/analytics/dashboard`, { headers }));
    await measure('Analytics: Recent Activity', () => axios.get(`${API_URL}/analytics/recent-activity`, { headers }));
    await measure('Analytics: System Overview', () => axios.get(`${API_URL}/analytics/system-overview`, { headers }));
    await measure('Audit: Logs', () => axios.get(`${API_URL}/audit/logs?limit=5`, { headers }));

    // --- Management Modules ---
    await measure('Groups: List', () => axios.get(`${API_URL}/groups`, { headers }));
    await measure('Regions: List', () => axios.get(`${API_URL}/regions`, { headers }));
    await measure('Region Requests: List', () => axios.get(`${API_URL}/region-requests`, { headers }).catch(e => { if(e.response?.status !== 404) throw e; }));
    await measure('Access Control: Temp List', () => axios.get(`${API_URL}/temporary-access`, { headers }));
    await measure('Preferences: Get', () => axios.get(`${API_URL}/preferences`, { headers }));

    // --- Features ---
    await measure('Search: Global "Tower"', () => axios.get(`${API_URL}/search/global?q=tower`, { headers }));
    await measure('Notifications: List', () => axios.get(`${API_URL}/notifications`, { headers }));
    await measure('Layers: List', () => axios.get(`${API_URL}/layers`, { headers }).catch(e => { if(e.response?.status !== 404) throw e; }));
    await measure('Bookmarks: List', () => axios.get(`${API_URL}/bookmarks`, { headers }).catch(e => { if(e.response?.status !== 404) throw e; }));
    await measure('Reports: User Activity', () => axios.get(`${API_URL}/reports/user-activity`, { headers }));
    await measure('Features: List', () => axios.get(`${API_URL}/features`, { headers }).catch(e => { if(e.response?.status !== 500 && e.response?.status !== 404) throw e; }));

    // --- Developer Tools ---
    await measure('DevTools: Settings', () => axios.get(`${API_URL}/dev-tools/settings`, { headers }));
    await measure('Backup: History', () => axios.get(`${API_URL}/developer-tools/backup/history`, { headers }).catch(() => {}));
    await measure('Security: Config', () => axios.get(`${API_URL}/developer-tools/security/config`, { headers }).catch(() => {}));
    await measure('Environment: Config', () => axios.get(`${API_URL}/developer-tools/environment`, { headers }).catch(() => {}));

    // --- Boundaries ---
    await measure('Boundary: Public', () => axios.get(`${API_URL}/boundaries/published`, { headers }));
    // await measure('Boundary: Versions', () => axios.get(`${API_URL}/regions/1/versions`, { headers }).catch(() => {}));
    // await measure('Boundary: Impact', () => axios.get(`${API_URL}/regions/1/infrastructure-history`, { headers }).catch(() => {}));

    console.log(`\n${colors.bold}=== Benchmark Results ===${colors.reset}`);
    console.table(Object.entries(stats).map(([Endpoint, s]) => ({
        Endpoint,
        'Avg (ms)': s.avg.toFixed(2),
        'P95 (ms)': s.p95.toFixed(2),
        'Status': s.avg > SLOW_THRESHOLD_MS ? 'SLOW ⚠️' : 'FAST ✅'
    })));
};

runBenchmarks();
