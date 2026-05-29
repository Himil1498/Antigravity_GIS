const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../src');
const outputFile = path.resolve(__dirname, '../project_structure.txt');

if (!fs.existsSync(srcDir)) {
    console.error(`Error: Source directory not found at ${srcDir}`);
    process.exit(1);
}

const stream = fs.createWriteStream(outputFile);

function log(str) {
    console.log(str);
    stream.write(str + '\n');
}

log('Project Structure (src):');
log(`Path: ${srcDir}`);
log('========================');

function printTree(dir, prefix = '') {
    const items = fs.readdirSync(dir);
    
    // Sort directories first, then files
    items.sort((a, b) => {
        const aPath = path.join(dir, a);
        const bPath = path.join(dir, b);
        const aStats = fs.statSync(aPath);
        const bStats = fs.statSync(bPath);
        
        if (aStats.isDirectory() && !bStats.isDirectory()) return -1;
        if (!aStats.isDirectory() && bStats.isDirectory()) return 1;
        return a.localeCompare(b);
    });

    items.forEach((item, index) => {
        // Skip hidden files and node_modules
        if (item.startsWith('.')) return;
        if (item === 'node_modules') return;

        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);
        const isLast = index === items.length - 1;
        
        // Symbols for tree structure
        const connector = isLast ? '└── ' : '├── ';
        const childPrefix = isLast ? '    ' : '│   ';

        log(`${prefix}${connector}${item}`);

        if (stats.isDirectory()) {
            printTree(fullPath, prefix + childPrefix);
        }
    });
}

printTree(srcDir);
log('');
log(`Structure saved to: ${outputFile}`);
stream.end();
