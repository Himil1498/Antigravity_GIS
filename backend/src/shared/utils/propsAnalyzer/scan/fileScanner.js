const fs = require('fs');
const path = require('path');

/**
 * Get all .tsx files recursively
 */
const getAllTsxFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and build directories
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'build' && file !== 'dist') {
        getAllTsxFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
};

module.exports = { getAllTsxFiles };
