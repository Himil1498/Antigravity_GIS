/**
 * Build connection graph (which components use which)
 */
const buildConnectionGraph = (components, propsInterfaces) => {
  const connections = [];

  components.forEach((componentInfo, componentName) => {
    // Link props interface to component
    if (componentInfo.propsInterface && propsInterfaces.has(componentInfo.propsInterface)) {
      const propsInfo = propsInterfaces.get(componentInfo.propsInterface);
      componentInfo.propsCount = propsInfo.propsCount;
      componentInfo.propsList = propsInfo.props;
    }

    // Find which components this component uses
    componentInfo.usages.forEach(usedComponent => {
      // Check if this component was imported
      const isImported = componentInfo.imports.some(imp => imp.name === usedComponent);

      if (isImported || components.has(usedComponent)) {
        connections.push({
          from: componentName,
          to: usedComponent,
          type: 'uses'
        });
      }
    });
  });

  return connections;
};

/**
 * Generate Mermaid diagram for visualization
 */
const generateMermaidDiagram = (connections) => {
  let diagram = 'graph TD\n';

  // Limit to top 30 connections to avoid overcrowding
  const topConnections = connections.slice(0, 30);

  topConnections.forEach(conn => {
    const fromId = conn.from.replace(/[^a-zA-Z0-9]/g, '_');
    const toId = conn.to.replace(/[^a-zA-Z0-9]/g, '_');
    diagram += `  ${fromId}["${conn.from}"] --> ${toId}["${conn.to}"]\n`;
  });

  return diagram;
};

/**
 * Generate analysis report
 */
const generateReport = (components, propsInterfaces, connections, totalPropsCount, duration) => {
  // Calculate statistics
  const totalComponents = components.size;
  const totalInterfaces = propsInterfaces.size;
  const componentsWithProps = Array.from(components.values()).filter(c => c.propsCount > 0).length;
  const avgPropsPerComponent = totalInterfaces > 0 ? (totalPropsCount / totalInterfaces).toFixed(2) : 0;

  // Top components by props count
  const topComponentsByProps = Array.from(components.values())
    .filter(c => c.propsCount > 0)
    .sort((a, b) => b.propsCount - a.propsCount)
    .slice(0, 20)
    .map(c => ({
      name: c.name,
      file: c.file,
      propsCount: c.propsCount,
      propsInterface: c.propsInterface
    }));

  // Most connected components (most usages)
  const componentUsageCount = new Map();
  connections.forEach(conn => {
    componentUsageCount.set(conn.to, (componentUsageCount.get(conn.to) || 0) + 1);
  });

  const mostUsedComponents = Array.from(componentUsageCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, count]) => ({
      name,
      usedByCount: count,
      file: components.get(name)?.file || 'Unknown'
    }));

  // Component connection graph (for visualization)
  const connectionGraph = connections.map(conn => ({
    from: conn.from,
    to: conn.to,
    fromFile: components.get(conn.from)?.file || 'Unknown',
    toFile: components.get(conn.to)?.file || 'Unknown'
  }));

  // Detailed component list
  const componentDetails = Array.from(components.values()).map(c => ({
    name: c.name,
    file: c.file,
    propsInterface: c.propsInterface || 'None',
    propsCount: c.propsCount,
    props: c.propsList || [],
    uses: c.usages.length,
    lineCount: c.lineCount
  }));

  // Props interface details
  const propsDetails = Array.from(propsInterfaces.values()).map(p => ({
    name: p.name,
    file: p.file,
    propsCount: p.propsCount,
    props: p.props
  }));

  return {
    summary: {
      totalComponents,
      totalPropsInterfaces: totalInterfaces,
      totalPropsCount,
      componentsWithProps,
      avgPropsPerComponent: parseFloat(avgPropsPerComponent),
      totalConnections: connections.length,
      analysisDuration: `${duration}ms`
    },
    topComponentsByProps,
    mostUsedComponents,
    connectionGraph,
    componentDetails,
    propsDetails,
    mermaidDiagram: generateMermaidDiagram(connections)
  };
};

module.exports = {
  buildConnectionGraph,
  generateReport,
  generateMermaidDiagram
};
