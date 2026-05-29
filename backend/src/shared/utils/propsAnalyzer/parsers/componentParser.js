/**
 * Find component definitions (functional components)
 */
const findComponentDefinitions = (content, fileName) => {
  const components = [];

  // Pattern 1: const ComponentName: React.FC<PropsInterface> = (props) => {}
  const fcPattern1 = /(?:export\s+)?(?:const|function)\s+([A-Z][a-zA-Z0-9]*)\s*:\s*React\.FC(?:<([A-Z][a-zA-Z0-9]*)>)?/g;
  let match;
  while ((match = fcPattern1.exec(content)) !== null) {
    components.push({
      name: match[1],
      propsInterface: match[2] || null
    });
  }

  // Pattern 2: function ComponentName(props: PropsInterface) {}
  const funcPattern = /(?:export\s+)?(?:default\s+)?function\s+([A-Z][a-zA-Z0-9]*)\s*(?:<[^>]*>)?\s*\(\s*(?:{\s*[^}]*\s*}|[a-zA-Z0-9_]+)\s*:\s*([A-Z][a-zA-Z0-9]*)/g;
  while ((match = funcPattern.exec(content)) !== null) {
    components.push({
      name: match[1],
      propsInterface: match[2]
    });
  }

  // Pattern 3: const ComponentName = (props: PropsInterface) => {}
  const arrowPattern = /(?:export\s+)?const\s+([A-Z][a-zA-Z0-9]*)\s*=\s*\(\s*(?:{\s*[^}]*\s*}|[a-zA-Z0-9_]+)\s*:\s*([A-Z][a-zA-Z0-9]*)/g;
  while ((match = arrowPattern.exec(content)) !== null) {
    components.push({
      name: match[1],
      propsInterface: match[2]
    });
  }

  // If no components found but file is PascalCase, assume it's a component
  if (components.length === 0 && /^[A-Z]/.test(fileName)) {
    components.push({
      name: fileName,
      propsInterface: null
    });
  }

  return components;
};

/**
 * Find component imports
 */
const findComponentImports = (content) => {
  const imports = [];

  // Match: import { Component1, Component2 } from './path'
  const importPattern = /import\s+(?:{([^}]+)}|([A-Z][a-zA-Z0-9]*))\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importPattern.exec(content)) !== null) {
    if (match[1]) {
      // Named imports
      const names = match[1].split(',').map(n => n.trim()).filter(n => /^[A-Z]/.test(n));
      names.forEach(name => {
        imports.push({
          name: name,
          from: match[3]
        });
      });
    } else if (match[2]) {
      // Default import
      imports.push({
        name: match[2],
        from: match[3]
      });
    }
  }

  return imports;
};

/**
 * Find component usages in JSX
 */
const findComponentUsages = (content) => {
  const usages = [];

  // Match: <ComponentName ... />  or <ComponentName> ... </ComponentName>
  const jsxPattern = /<([A-Z][a-zA-Z0-9]*)/g;
  let match;
  while ((match = jsxPattern.exec(content)) !== null) {
    usages.push(match[1]);
  }

  // Remove duplicates
  return [...new Set(usages)];
};

module.exports = {
  findComponentDefinitions,
  findComponentImports,
  findComponentUsages
};
