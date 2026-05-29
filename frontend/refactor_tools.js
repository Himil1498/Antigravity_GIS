const fs = require('fs');
const path = require('path');

const srcDir = 'c:\\Optimal_Telemedia_Main\\OptiConnect_GIS\\frontend\\src';
const toolsDir = path.join(srcDir, 'features\\map\\tools');
const suiteModulesDir = path.join(toolsDir, 'MeasurementSuiteTool\\modules');

// Ensure target dir exists
if (!fs.existsSync(suiteModulesDir)) {
  fs.mkdirSync(suiteModulesDir, { recursive: true });
}

// Folders to move
const tools = [
  'DistanceMeasurementTool',
  'PolygonDrawingTool',
  'ElevationProfileTool'
];

// Move folders
tools.forEach(tool => {
  const oldPath = path.join(toolsDir, tool);
  const newPath = path.join(suiteModulesDir, tool);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log('Moved ' + tool);
  }
});

// Function to recursively find files
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

const allFiles = getAllFiles(srcDir);

// Simple regex replacements for absolute-like relative paths from outside the tools dir
let replacedCount = 0;
allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace occurrences in imports
  // We look for strings like: /ElevationProfileTool/ or ../ElevationProfileTool/
  tools.forEach(tool => {
    // Replace "/DistanceMeasurementTool/" with "/MeasurementSuiteTool/modules/DistanceMeasurementTool/"
    const regex1 = new RegExp(`(['"\`])(.*?)/${tool}(/)(.*?)['"\`]`, 'g');
    content = content.replace(regex1, (match, p1, p2, p3, p4) => {
      if (p2.includes('MeasurementSuiteTool/modules')) return match;
      return `${p1}${p2}/MeasurementSuiteTool/modules/${tool}${p3}${p4}${p1}`;
    });
    
    // Replace exact matches like "../../DistanceMeasurementTool"
    const regex2 = new RegExp(`(['"\`])(.*?)/${tool}['"\`]`, 'g');
    content = content.replace(regex2, (match, p1, p2) => {
      if (p2.includes('MeasurementSuiteTool/modules')) return match;
      return `${p1}${p2}/MeasurementSuiteTool/modules/${tool}${p1}`;
    });
    
    // Also handle internal imports WITHIN the moved folders!
    // Since they are now nested inside `MeasurementSuiteTool/modules/X`, 
    // imports pointing OUTSIDE (like "../../components/Button") now need an extra "../"
    // But this script won't fix internal relative paths going UP.
    // Let's hope there are no direct relative paths that break, or we will fix them next.
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    replacedCount++;
    console.log('Updated imports in ' + file);
  }
});

console.log('Updated ' + replacedCount + ' files.');
