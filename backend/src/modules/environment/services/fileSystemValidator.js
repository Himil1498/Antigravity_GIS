/**
 * File System and Dependencies Validator
 * Validates file system and node modules
 */

const fs = require('fs');
const path = require('path');
const { CRITICAL_PACKAGES } = require('../constants');

/**
 * Validates file system directories and files
 */
function validateFileSystem() {
  const passed = [];
  const warnings = [];
  const errors = [];

  // Check required directories
  const requiredDirs = [
    { path: path.join(process.cwd(), 'src'), name: 'Backend src directory' },
    { path: path.join(process.cwd(), '..', 'Frontend'), name: 'Frontend directory' },
    { path: path.join(process.cwd(), '..', 'Frontend', 'src'), name: 'Frontend src directory' },
    { path: path.join(process.cwd(), '..', 'Frontend', 'public'), name: 'Frontend public directory' }
  ];

  requiredDirs.forEach(dirInfo => {
    if (fs.existsSync(dirInfo.path)) {
      passed.push({
        category: 'filesystem',
        check: dirInfo.name,
        status: 'passed',
        message: `${dirInfo.name} exists`
      });
    } else {
      errors.push({
        category: 'filesystem',
        check: dirInfo.name,
        status: 'error',
        message: `${dirInfo.name} not found`,
        path: dirInfo.path,
        recommendation: 'Ensure project structure is intact'
      });
    }
  });

  // Check required files
  const requiredFiles = [
    { path: path.join(process.cwd(), '.env'), name: 'Backend .env file' },
    { path: path.join(process.cwd(), 'package.json'), name: 'Backend package.json' },
    { path: path.join(process.cwd(), '..', 'Frontend', '.env'), name: 'Frontend .env file' },
    { path: path.join(process.cwd(), '..', 'Frontend', 'package.json'), name: 'Frontend package.json' }
  ];

  requiredFiles.forEach(fileInfo => {
    if (fs.existsSync(fileInfo.path)) {
      passed.push({
        category: 'filesystem',
        check: fileInfo.name,
        status: 'passed',
        message: `${fileInfo.name} exists`
      });
    } else {
      errors.push({
        category: 'filesystem',
        check: fileInfo.name,
        status: 'error',
        message: `${fileInfo.name} not found`,
        path: fileInfo.path,
        recommendation: 'Create or restore this file'
      });
    }
  });

  // Check write permissions for critical directories
  const writableDirs = [
    { path: path.join(process.cwd(), '..', 'database_backups'), name: 'Backup directory' },
    { path: path.join(process.cwd(), '..', 'logs'), name: 'Logs directory' }
  ];

  writableDirs.forEach(dirInfo => {
    try {
      if (!fs.existsSync(dirInfo.path)) {
        fs.mkdirSync(dirInfo.path, { recursive: true });
      }

      fs.accessSync(dirInfo.path, fs.constants.W_OK);
      passed.push({
        category: 'filesystem',
        check: dirInfo.name,
        status: 'passed',
        message: `${dirInfo.name} is writable`
      });
    } catch (error) {
      warnings.push({
        category: 'filesystem',
        check: dirInfo.name,
        status: 'warning',
        message: `${dirInfo.name} is not writable`,
        recommendation: 'Check directory permissions'
      });
    }
  });

  return { passed, warnings, errors };
}

/**
 * Validates node modules installation
 */
async function validateNodeModules() {
  const passed = [];
  const warnings = [];
  const errors = [];

  try {
    // Check Backend node_modules
    const backendModulesPath = path.join(process.cwd(), 'node_modules');
    if (fs.existsSync(backendModulesPath)) {
      passed.push({
        category: 'dependencies',
        check: 'backend_node_modules',
        status: 'passed',
        message: 'Backend node_modules directory exists'
      });

      // Check critical packages
      CRITICAL_PACKAGES.forEach(pkg => {
        const pkgPath = path.join(backendModulesPath, pkg);
        if (fs.existsSync(pkgPath)) {
          passed.push({
            category: 'dependencies',
            check: `backend_package_${pkg}`,
            status: 'passed',
            message: `Package '${pkg}' is installed`
          });
        } else {
          errors.push({
            category: 'dependencies',
            check: `backend_package_${pkg}`,
            status: 'error',
            message: `Critical package '${pkg}' is missing`,
            recommendation: 'Run npm install in Backend directory'
          });
        }
      });

    } else {
      errors.push({
        category: 'dependencies',
        check: 'backend_node_modules',
        status: 'error',
        message: 'Backend node_modules directory not found',
        recommendation: 'Run npm install in Backend directory'
      });
    }

    // Check Frontend node_modules
    const frontendModulesPath = path.join(process.cwd(), '..', 'Frontend', 'node_modules');
    if (fs.existsSync(frontendModulesPath)) {
      passed.push({
        category: 'dependencies',
        check: 'frontend_node_modules',
        status: 'passed',
        message: 'Frontend node_modules directory exists'
      });
    } else {
      warnings.push({
        category: 'dependencies',
        check: 'frontend_node_modules',
        status: 'warning',
        message: 'Frontend node_modules directory not found',
        recommendation: 'Run npm install in Frontend directory'
      });
    }

  } catch (error) {
    errors.push({
      category: 'dependencies',
      check: 'node_modules_validation',
      status: 'error',
      message: 'Failed to validate node_modules',
      details: error.message
    });
  }

  return { passed, warnings, errors };
}

module.exports = {
  validateFileSystem,
  validateNodeModules
};
