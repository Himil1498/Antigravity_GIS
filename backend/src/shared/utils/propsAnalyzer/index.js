/**
 * Props Analyzer - Orchestrator
 * Analyzes component props and connections
 */

const fs = require('fs');
const path = require('path');
const { getAllTsxFiles } = require('./scan/fileScanner');
const { findComponentDefinitions, findComponentImports, findComponentUsages } = require('./parsers/componentParser');
const { findPropsInterfaces, analyzePropUsage, extractPropUsageSummary } = require('./parsers/propParser');
const { buildConnectionGraph, generateReport } = require('./reporting/graphBuilder');

class PropsAnalyzer {
  constructor(basePath) {
    this.basePath = basePath;
    this.components = new Map();
    this.propsInterfaces = new Map();
    this.connections = [];
    this.totalPropsCount = 0;
  }

  /**
   * Main analysis function
   */
  async analyze() {
    const startTime = Date.now();

    // Scan all .tsx files
    const files = getAllTsxFiles(this.basePath);

    for (const file of files) {
      this.analyzeFile(file); // No await needed, operations are synchronous fs
    }

    // Build connection graph
    this.connections = buildConnectionGraph(this.components, this.propsInterfaces);

    const duration = Date.now() - startTime;

    return generateReport(this.components, this.propsInterfaces, this.connections, this.totalPropsCount, duration);
  }

  /**
   * Analyze a single file
   */
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(this.basePath, filePath);

      // Extract component name from file path
      const fileName = path.basename(filePath, '.tsx');

      // Find component definitions
      const componentMatches = findComponentDefinitions(content, fileName);

      // Find props interfaces
      const propsMatches = findPropsInterfaces(content);

      // Find component imports
      const imports = findComponentImports(content);

      // Find component usages (JSX tags)
      const usages = findComponentUsages(content);

      // Store component info
      componentMatches.forEach(comp => {
        this.components.set(comp.name, {
          name: comp.name,
          file: relativePath,
          propsInterface: comp.propsInterface,
          propsCount: 0,
          imports: imports,
          usages: usages,
          lineCount: content.split('\n').length,
          fileContent: content // Store for later prop usage analysis
        });
      });

      // Store props interfaces
      propsMatches.forEach(props => {
        // Analyze usage for each prop in the interface
        const propsWithUsage = props.props.map(prop => {
          const usage = analyzePropUsage(content, prop.name);
          return {
            ...prop,
            usageCount: usage.length,
            usages: usage.slice(0, 5), // Limit to first 5 usages
            usageSummary: extractPropUsageSummary(usage)
          };
        });

        this.propsInterfaces.set(props.name, {
          name: props.name,
          file: relativePath,
          props: propsWithUsage,
          propsCount: props.props.length
        });
        this.totalPropsCount += props.props.length;
      });

    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error.message);
    }
  }
}

/**
 * Run props analysis
 */
async function analyzeProps(frontendPath) {
  const analyzer = new PropsAnalyzer(frontendPath);
  return await analyzer.analyze();
}

module.exports = { analyzeProps, PropsAnalyzer };
