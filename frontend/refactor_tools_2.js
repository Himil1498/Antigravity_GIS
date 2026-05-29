const fs = require('fs');
const path = require('path');

const toolsDir = path.resolve(__dirname, 'src/features/map/tools');
const targetDir = path.join(toolsDir, 'MeasurementSuiteTool/modules');

const tools = ['DistanceMeasurementTool', 'PolygonDrawingTool', 'ElevationProfileTool'];

// Create modules dir
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Move folders
tools.forEach(t => {
  const oldPath = path.join(toolsDir, t);
  const newPath = path.join(targetDir, t);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${t}`);
  }
});

// Helper to get all files
function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        getAllFiles(filePath, fileList);
      }
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = getAllFiles(path.resolve(__dirname, 'src'));

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Fix external files importing FROM the moved tools
  if (!file.includes('MeasurementSuiteTool\\modules')) {
    tools.forEach(t => {
      // Fix imports like: from "../../DistanceMeasurementTool/something"
      // to: from "../../MeasurementSuiteTool/modules/DistanceMeasurementTool/something"
      const regex = new RegExp(`(['"\`])(.*?)/${t}(/|['"\`])`, 'g');
      content = content.replace(regex, (match, p1, p2, p3) => {
        if (p2.includes('MeasurementSuiteTool/modules')) return match;
        return `${p1}${p2}/MeasurementSuiteTool/modules/${t}${p3}`;
      });
    });
  }

  // 2. Fix internal files WITHIN the moved tools importing OUTSIDE
  // Because they moved from features/map/tools/T to features/map/tools/MeasurementSuiteTool/modules/T
  // Their depth increased by 2 folders ("MeasurementSuiteTool", "modules")
  // So any relative import starting with "../" needs an extra "../../"
  if (file.includes('MeasurementSuiteTool\\modules')) {
    const importRegex = /from\s+(['"\`])(\.\.\/.*?)(['"\`])/g;
    content = content.replace(importRegex, (match, p1, p2, p3) => {
      // Only adjust if it's going OUT of the tool folder.
      // E.g., if inside DistanceMeasurementTool/utils/index.ts, depth to tool root is 1 ("../")
      // If it imports "../../components", it's going out of DistanceMeasurementTool.
      
      // Let's count the depth to the tool root
      const fileParts = file.replace(/\\/g, '/').split('/');
      const modulesIndex = fileParts.indexOf('modules');
      const toolRootIndex = modulesIndex + 1; // e.g. DistanceMeasurementTool
      
      const currentDepth = fileParts.length - 1 - toolRootIndex;
      
      // If the import goes up MORE times than currentDepth, it's escaping the tool folder
      const upCount = (p2.match(/\.\.\//g) || []).length;
      if (upCount > currentDepth) {
        // It's escaping! Add "../../" to account for "MeasurementSuiteTool/modules"
        return `from ${p1}../../${p2}${p3}`;
      }
      return match;
    });
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated imports in ${file}`);
  }
});
