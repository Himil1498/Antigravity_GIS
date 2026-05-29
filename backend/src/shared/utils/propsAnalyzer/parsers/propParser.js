/**
 * Detect the context/purpose of prop usage
 */
const detectUsageContext = (codeLine, propName) => {
  const line = codeLine.toLowerCase();

  // Event handlers
  if (line.includes('onclick') || line.includes('onchange') || line.includes('onsubmit') ||
      line.includes('onkeypress') || line.includes('onkeydown') || line.includes('onblur')) {
    return 'Event Handler';
  }

  // Conditional rendering
  if (line.includes('if') || line.includes('?') || line.includes(':')) {
    return 'Conditional Logic';
  }

  // Rendering/Display
  if (line.includes('return') || line.includes('<') || line.includes('>')) {
    return 'Rendering/Display';
  }

  // State management
  if (line.includes('usestate') || line.includes('setstate') || line.includes('state')) {
    return 'State Management';
  }

  // API calls
  if (line.includes('fetch') || line.includes('axios') || line.includes('api')) {
    return 'API Call';
  }

  // Validation
  if (line.includes('valid') || line.includes('check') || line.includes('error')) {
    return 'Validation';
  }

  // Computation/Logic
  if (line.includes('const ') || line.includes('let ') || line.includes('=')) {
    return 'Computation';
  }

  return 'General Usage';
};

/**
 * Extract usage summary for a prop
 */
const extractPropUsageSummary = (usages) => {
  if (usages.length === 0) {
    return 'Not directly used (may be passed to child components)';
  }

  const contexts = usages.map(u => u.context);
  const uniqueContexts = [...new Set(contexts)];

  if (uniqueContexts.length === 1) {
    return `Used for ${uniqueContexts[0]} (${usages.length} occurrence${usages.length > 1 ? 's' : ''})`;
  }

  return `Used in multiple contexts: ${uniqueContexts.slice(0, 3).join(', ')} (${usages.length} total)`;
};

/**
 * Analyze prop usage within component code
 */
const analyzePropUsage = (content, propName) => {
  const usages = [];
  const lines = content.split('\n');

  lines.forEach((line, lineNumber) => {
    // Skip import/interface definitions
    if (line.includes('import ') || line.includes('interface ') || line.includes('type ')) {
      return;
    }

    // Pattern 1: Direct prop access - props.propName
    const directPattern = new RegExp(`\\bprops\\.${propName}\\b`, 'g');
    if (directPattern.test(line)) {
      usages.push({
        line: lineNumber + 1,
        context: detectUsageContext(line, propName),
        code: line.trim(),
        type: 'direct-access'
      });
    }

    // Pattern 2: Destructured prop usage
    const destructPattern = new RegExp(`\\b${propName}\\b(?!:)`, 'g');
    if (destructPattern.test(line) && !line.includes(`${propName}:`)) {
      usages.push({
        line: lineNumber + 1,
        context: detectUsageContext(line, propName),
        code: line.trim(),
        type: 'destructured'
      });
    }
  });

  return usages;
};

/**
 * Parse individual props from interface/type block
 */
const parsePropsFromBlock = (block) => {
  const props = [];
  const lines = block.split('\n');

  lines.forEach(line => {
    const trimmed = line.trim();
    // Match: propName: type or propName?: type
    const propMatch = /^([a-zA-Z0-9_]+)(\?)?:\s*(.+?);?$/;
    const match = propMatch.exec(trimmed);
    if (match) {
      props.push({
        name: match[1],
        optional: !!match[2],
        type: match[3].replace(/;$/, '').trim()
      });
    }
  });

  return props;
};

/**
 * Find props interfaces/types
 */
const findPropsInterfaces = (content) => {
  const interfaces = [];

  // Pattern 1: interface ComponentProps { ... }
  const interfacePattern = /(?:export\s+)?interface\s+([A-Z][a-zA-Z0-9]*(?:Props|Properties)?)\s*(?:extends\s+[^{]+)?\s*{([^}]*)}/g;
  let match;
  while ((match = interfacePattern.exec(content)) !== null) {
    const props = parsePropsFromBlock(match[2]);
    interfaces.push({
      name: match[1],
      props: props
    });
  }

  // Pattern 2: type ComponentProps = { ... }
  const typePattern = /(?:export\s+)?type\s+([A-Z][a-zA-Z0-9]*(?:Props|Properties)?)\s*=\s*{([^}]*)}/g;
  while ((match = typePattern.exec(content)) !== null) {
    const props = parsePropsFromBlock(match[2]);
    interfaces.push({
      name: match[1],
      props: props
    });
  }

  return interfaces;
};

module.exports = {
  findPropsInterfaces,
  parsePropsFromBlock,
  analyzePropUsage,
  extractPropUsageSummary,
  detectUsageContext
};
