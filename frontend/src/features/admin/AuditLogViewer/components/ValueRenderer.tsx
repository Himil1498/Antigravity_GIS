/**
 * ValueRenderer Component
 * Recursively renders JSON values with syntax highlighting
 */

import React, { useState } from 'react';

const CollapsibleNode: React.FC<{ label: React.ReactNode; isArray?: boolean; children: React.ReactNode }> = ({ label, isArray, children }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="ml-4">
      <div 
        className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded px-1 -ml-1 transition-colors w-max"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <svg 
          className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono text-sm">
          {label}
        </span>
        {!isExpanded && (
          <span className="text-gray-400 text-xs italic ml-2">
            {isArray ? '[...]' : '{...}'}
          </span>
        )}
      </div>
      {isExpanded && <div className="mt-1 ml-2 border-l border-gray-200 dark:border-gray-600 pl-3">{children}</div>}
    </div>
  );
};

export const renderValue = (value: any, depth = 0): React.ReactElement => {
  if (value === null)
    return <span className="text-gray-500 dark:text-gray-500 italic">null</span>;
  if (value === undefined)
    return <span className="text-gray-500 dark:text-gray-500 italic">undefined</span>;
  if (typeof value === 'boolean')
    return (
      <span className="text-purple-600 dark:text-purple-400 font-semibold">
        {value.toString()}
      </span>
    );
  if (typeof value === 'number')
    return (
      <span className="text-blue-600 dark:text-blue-400 font-semibold">{value}</span>
    );
  if (typeof value === 'string')
    return <span className="text-green-700 dark:text-green-400">"{value}"</span>;

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-500">[]</span>;
    return (
      <div className="space-y-1">
        {value.map((item, index) => {
          const isComplex = typeof item === 'object' && item !== null;
          return (
            <div key={index} className="flex items-start gap-2">
              {!isComplex && (
                <span className="text-gray-500 dark:text-gray-500 font-mono text-xs mt-0.5">
                  [{index}]
                </span>
              )}
              {isComplex ? (
                <CollapsibleNode label={`[${index}]`} isArray={Array.isArray(item)}>
                  {renderValue(item, depth + 1)}
                </CollapsibleNode>
              ) : (
                renderValue(item, depth + 1)
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return <span className="text-gray-500">{}</span>;
    
    return (
      <div className="space-y-1">
        {entries.map(([key, val]) => {
          const isComplex = typeof val === 'object' && val !== null;
          
          if (isComplex) {
            return (
              <CollapsibleNode key={key} label={`${key}:`} isArray={Array.isArray(val)}>
                {renderValue(val, depth + 1)}
              </CollapsibleNode>
            );
          }
          
          return (
            <div key={key} className="flex items-start gap-3 ml-4">
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold font-mono text-sm min-w-fit">
                {key}:
              </span>
              <div className="flex-1">{renderValue(val, depth + 1)}</div>
            </div>
          );
        })}
      </div>
    );
  }

  return <span className="text-gray-700 dark:text-gray-300">{String(value)}</span>;
};

