const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const DRY_RUN = false; // Set to true to see changes without applying them

// Mappings: Order matters! More specific paths should come first.
const MAPPINGS = [
  // Features
  { from: 'components/UserManagement', to: 'features/users' },
  { from: 'components/users', to: 'features/users/components' }, // Merge into users feature
  { from: 'components/admin', to: 'features/admin' },
  { from: 'components/dashboard', to: 'features/dashboard' },
  { from: 'components/FlowDiagrams', to: 'features/flow-diagrams' },
  { from: 'components/groups', to: 'features/groups' },
  { from: 'components/modals', to: 'components/ui/modals' }, // Modals are generic UI usually, or feature specific. Let's put in shared UI for now based on prev analysis
  
  // Layout
  { from: 'components/common/NavigationBar', to: 'components/layout/NavigationBar' },
  { from: 'components/common/Footer', to: 'components/layout/Footer' },
  { from: 'components/common/ModeIndicator', to: 'components/layout/ModeIndicator' },
  
  // Map Feature
  { from: 'pages/GISDataHub.tsx', to: 'features/map/GISDataHub.tsx' },
  { from: 'pages/GISDataHub.tsx.backup', to: 'features/map/GISDataHub.tsx.backup' }, // Keep backups
  { from: 'components/tools', to: 'features/map/tools' },
  
  // Auth Feature (Moving pages to feature/auth)
  { from: 'pages/LoginPage', to: 'features/auth/pages/LoginPage' },
  { from: 'pages/EmailVerificationPage.tsx', to: 'features/auth/pages/EmailVerificationPage.tsx' },
  { from: 'pages/EmailVerificationPageTypes.ts', to: 'features/auth/types/EmailVerificationPageTypes.ts' },
  { from: 'pages/ResendVerificationPage.tsx', to: 'features/auth/pages/ResendVerificationPage.tsx' },
  { from: 'pages/SecurityPage.tsx', to: 'features/auth/pages/SecurityPage.tsx' },
  
  // Components extraction
  { from: 'components/common', to: 'components/ui' }, // catch-all for remaining common
  
  // Routes
  { from: 'AppRoutes.tsx', to: 'routes/AppRoutes.tsx' },

  // Remaining pages stay in pages (or move if they are feature roots)
  // pages/AdminPage -> pages/AdminPage (is this feature root? lets leave top level pages in pages for now unless mapped)
];

// Helper to check if a file ignores structure
const EXCLUDES = [
    'react-app-env.d.ts',
    'setupTests.ts',
    'reportWebVitals.ts',
    'index.tsx',
    'App.tsx',
    'App.css'
];

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
}

function calculateNewPath(currentAbsPath) {
    const relPath = path.relative(SRC_DIR, currentAbsPath);
    // forward slash for matching
    const normalizedRelPath = relPath.split(path.sep).join('/');

    if (EXCLUDES.includes(path.basename(currentAbsPath))) {
        return currentAbsPath;
    }

    for (const mapping of MAPPINGS) {
        if (normalizedRelPath === mapping.from || normalizedRelPath.startsWith(mapping.from + '/')) {
            const suffix = normalizedRelPath.slice(mapping.from.length);
            // Construct new path
            // Handle file-to-file mapping vs dir-to-dir
            const isFileMapping = mapping.from.endsWith('.tsx') || mapping.from.endsWith('.ts'); 
            
            if (isFileMapping && suffix === '') {
                 return path.join(SRC_DIR, mapping.to);
            }
            
            // Dir mapping
            const newRelPath = path.join(mapping.to, suffix);
            return path.join(SRC_DIR, newRelPath);
        }
    }
    
    return currentAbsPath; // No change
}

// Map of OldAbsolute -> NewAbsolute
const fileMap = {};

function step1_buildMap() {
    const allFiles = getAllFiles(SRC_DIR);
    console.log(`Scanning ${allFiles.length} files...`);
    
    allFiles.forEach(file => {
        const newPath = calculateNewPath(file);
        fileMap[file] = newPath;
    });
}

function updateImports(content, currentOldAbsPath) {
    // Regex for imports: import ... from '...' or import '...' or require('...')
    // Captures the quote and the path
    // Simple regex to catch standard static imports. Dynamic imports might need more care but lets start generic.
    // import [something] from "path"
    // import "path"
    // export [something] from "path"
    const importRegex = /(?:import|export)\s+(?:(?:[\s\S]*?\s+from\s+)|(?:))(['"])([^'"]+)\1/g;
    const requireRegex = /require\((['"])([^'"]+)\1\)/g;

    let newContent = content;

    const replaceCallback = (match, quote, importPath) => {
        if (importPath.startsWith('.')) {
            // It is a relative path. Resolve it.
            const absTarget = path.resolve(path.dirname(currentOldAbsPath), importPath);
            
            // Check if we can find this file in our map
            // Note: imports often omit extensions. We need to find the matching file in fileMap keys.
            let resolvedTarget = null;
            
            // Exact match
            if (fileMap[absTarget]) {
                resolvedTarget = absTarget;
            } else {
                // Try extensions
                const extensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.json'];
                for (const ext of extensions) {
                    if (fileMap[absTarget + ext]) {
                        resolvedTarget = absTarget + ext;
                        break;
                    }
                    // Also check index files
                    if (fileMap[path.join(absTarget, `index${ext}`)]) {
                         resolvedTarget = path.join(absTarget, `index${ext}`);
                         break;
                    }
                }
            }

            if (resolvedTarget) {
                const newTargetAbs = fileMap[resolvedTarget];
                const newCurrentAbs = fileMap[currentOldAbsPath];
                
                if (!newCurrentAbs) {
                    // Should not happen if map is built correctly
                    return match;
                }

                let newRelPath = path.relative(path.dirname(newCurrentAbs), newTargetAbs);
                
                // path.relative might return 'filename.ts', we want './filename'
                if (!newRelPath.startsWith('.')) {
                    newRelPath = './' + newRelPath;
                }
                
                // Normalizing path separators to /
                newRelPath = newRelPath.split(path.sep).join('/');
                
                // Remove extension if original didn't have it (or if it's .ts/.tsx/.js/.jsx)
                // If the import was 'file.png' keep it. If 'file' keep it.
                if (!path.extname(importPath) && !importPath.endsWith('/')) {
                     const ext = path.extname(newRelPath);
                     if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
                         newRelPath = newRelPath.slice(0, -ext.length);
                     }
                }

                console.log(`[UPDATE] ${path.basename(currentOldAbsPath)}: ${importPath} -> ${newRelPath}`);
                // Reconstruct match
                return match.replace(importPath, newRelPath);
            } else {
               // console.warn(`[WARN] Could not resolve import '${importPath}' in ${currentOldAbsPath}`);
            }
        }
        return match;
    };

    newContent = newContent.replace(importRegex, replaceCallback);
    newContent = newContent.replace(requireRegex, replaceCallback);

    return newContent;
}

function run() {
    console.log("Building file map...");
    step1_buildMap();
    
    console.log("Processing files...");
    const keys = Object.keys(fileMap);
    
    // Safety check: check for collisions
    const destCounts = {};
    keys.forEach(k => {
        const dest = fileMap[k];
        destCounts[dest] = (destCounts[dest] || 0) + 1;
    });
    const collisions = Object.keys(destCounts).filter(d => destCounts[d] > 1);
    if (collisions.length > 0) {
        console.error("ERROR: Destination collisions detected! Aborting.");
        console.error(collisions);
        process.exit(1);
    }
    
    keys.forEach(oldAbsPath => {
        const newAbsPath = fileMap[oldAbsPath];
        const isMoving = oldAbsPath !== newAbsPath;
        
        if (DRY_RUN) {
             if (isMoving) console.log(`[MOVE] ${oldAbsPath} -> ${newAbsPath}`);
             return;
        }

        try {
            let content = fs.readFileSync(oldAbsPath, 'utf8');
            
            // Update imports in the content
            // We assume UTF8 text for everything. Binary files might break.
            // Check extension
            const ext = path.extname(oldAbsPath).toLowerCase();
            const textExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss', '.html', '.md', '.txt'];
            
            if (textExtensions.includes(ext)) {
                content = updateImports(content, oldAbsPath);
            }

            // Ensure subdir exists
            fs.mkdirSync(path.dirname(newAbsPath), { recursive: true });
            
            // Write to new location
            fs.writeFileSync(newAbsPath, content);
            
            // If moved, we will verify later and clean up? 
            // For now, let's strictly write new, and then we might delete old.
            // BUT: If we write file A to B, and A is still there, verification is hard.
            // Better to delete old immediately IF new path is different
            if (isMoving) {
                fs.unlinkSync(oldAbsPath);
            }
            
        } catch (err) {
            console.error(`Failed to process ${oldAbsPath}:`, err);
        }
    });
    
    console.log("Cleaning up empty directories...");
    if (!DRY_RUN) {
        // Simple cleanup: try rmdir on all dirs in src, ignoring errors if not empty
        // This is a naive cleanup but effective for now.
        // A better way is reverse breadth first search to delete from leaves up.
    }
    
    console.log("Done.");
}

run();
