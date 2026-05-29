const fs = require('fs');
const path = require('path');
const p = path.join('C:', 'Optimal_Telemedia_Main', 'OptiConnect_GIS', 'india-boundaries-2026-05-28 (1).json');
const data = JSON.parse(fs.readFileSync(p, 'utf8'));
console.log('Total features:', data.features.length);
const names = data.features.map(f => f.properties?.name || f.properties?.ST_NM);
console.log(names);
