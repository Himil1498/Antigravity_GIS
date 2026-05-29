import React, { useMemo, useEffect, useCallback, useState, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  NodeProps,
  Edge,
  Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { TableSchema } from '../../../../services/schemaService';
import { showToast } from '../../../../utils/toastUtils';

// Custom Node for Tables
const TableNode = ({ data }: NodeProps<any>) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-xl border w-64 overflow-hidden select-none transition-all duration-300 ${data.isDimmed ? 'opacity-20 scale-95' : 'opacity-100 scale-100'} ${data.isHighlighted ? 'ring-4 ring-yellow-400 border-yellow-400 shadow-yellow-400/20' : 'border-indigo-200 dark:border-indigo-800/50'}`}>
      {/* Header */}
      <div className={`px-4 py-3 flex justify-between items-center text-white ${data.isFocused ? 'bg-emerald-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}>
        <span className="font-bold truncate text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
            {data.name}
        </span>
        <button 
          onClick={(e) => { e.stopPropagation(); data.onFocus(data.name); }} 
          className="px-2 py-1 text-[10px] bg-white/20 hover:bg-white/40 rounded uppercase font-bold tracking-wider transition-colors"
          title={data.isFocused ? "Unfocus Table" : "Focus Neighbors Only"}
        >
           {data.isFocused ? 'X Focus' : 'Focus'}
        </button>
      </div>
      
      {/* Target Handle (Incoming references) */}
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500 border-2 border-white dark:border-slate-800" />
      
      {/* Columns */}
      <div className="flex flex-col bg-white dark:bg-slate-800/90 py-2">
        {data.columns.map((col: any, idx: number) => (
          <div key={idx} className="flex justify-between items-center px-4 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs transition-colors">
            <span className="font-medium text-slate-700 dark:text-slate-300 font-mono flex items-center gap-2">
               {col.column_name}
               {col.column_name === 'id' && <span className="text-[10px] text-yellow-500" title="Primary Key">🗝️</span>}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase">{col.data_type}</span>
          </div>
        ))}
      </div>
      
      {/* Source Handle (Outgoing references) */}
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800" />
    </div>
  );
};

const nodeTypes = {
  tableNode: TableNode,
};

interface GlobalERDiagramProps {
  schema: TableSchema[];
  onNodeClick?: (tableName: string) => void;
  onNodeDoubleClick?: (tableName: string) => void;
}

const GlobalERDiagram: React.FC<GlobalERDiagramProps> = ({ schema, onNodeClick, onNodeDoubleClick }) => {
  const [showConnectedOnly, setShowConnectedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedNode, setFocusedNode] = useState<string | null>(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        showToast.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Focus Handler
  const handleFocus = useCallback((nodeName: string) => {
    setFocusedNode(prev => prev === nodeName ? null : nodeName);
  }, []);

  // Generate Nodes manually spaced in a grid
  const initialNodes: Node[] = useMemo(() => {
    // We sort tables alphabetically to keep them somewhat organized
    let sortedSchema = [...schema].sort((a, b) => a.name.localeCompare(b.name));
    
    if (showConnectedOnly) {
      sortedSchema = sortedSchema.filter(
        table => table.relationships.incoming.length > 0 || table.relationships.outgoing.length > 0
      );
    }

    const columnsPerRow = Math.ceil(Math.sqrt(sortedSchema.length)) || 1;
    
    const saved = localStorage.getItem('erd-layout');
    const savedLayout = saved ? JSON.parse(saved) : null;

    return sortedSchema.map((table, index) => {
      const col = index % columnsPerRow;
      const row = Math.floor(index / columnsPerRow);
      
      let position = { x: col * 400, y: row * 500 }; // 400px width spacing, 500px height spacing
      if (savedLayout && savedLayout[table.name]) {
         position = savedLayout[table.name];
      }

      return {
        id: table.name,
        type: 'tableNode',
        position,
        data: {
            ...table,
            onFocus: handleFocus,
            isDimmed: false,
            isHighlighted: false,
            isFocused: false
        },
      };
    });
  }, [schema, showConnectedOnly, handleFocus]);

  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    schema.forEach(table => {
      // Draw edges where this table has a foreign key pointing OUT to another table
      table.relationships.outgoing.forEach(rel => {
        edges.push({
          id: `e-${table.name}-${rel.targetTable}-${rel.column}`,
          source: table.name, // The table making the reference
          target: rel.targetTable, // The parent table being referenced
          label: `${rel.column} → ${rel.targetColumn}`,
          animated: false,
          style: { stroke: '#10b981', strokeWidth: 2, transition: 'opacity 300ms' }, // emerald-500
          labelStyle: { fill: '#64748b', fontSize: 10, fontWeight: 700 }, // slate-500
          labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
          labelBgPadding: [4, 2],
          labelBgBorderRadius: 4,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#10b981',
            width: 20,
            height: 20,
          },
        });
      });
    });
    return edges;
  }, [schema]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state if schema changes entirely
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Compute Display Nodes (applies search/focus without destroying coordinates)
  const displayNodes = useMemo(() => {
    return nodes.map((n) => {
      let isDimmed = false;
      let isHighlighted = false;
      let isFocused = focusedNode === n.id;

      if (focusedNode) {
        // Neighborhood isolation mode
        const tableSchema = schema.find(s => s.name === focusedNode);
        const isNeighbor = 
            tableSchema?.relationships.incoming.some(r => r.sourceTable === n.id) ||
            tableSchema?.relationships.outgoing.some(r => r.targetTable === n.id);
        
        if (!isFocused && !isNeighbor) {
            isDimmed = true;
        }
      } else if (searchQuery.trim()) {
        // Search Highlighting block
        if (n.id.toLowerCase().includes(searchQuery.toLowerCase())) {
            isHighlighted = true;
        } else {
            isDimmed = true;
        }
      }

      return {
        ...n,
        data: {
            ...n.data,
            isDimmed,
            isHighlighted,
            isFocused
        }
      };
    });
  }, [nodes, focusedNode, searchQuery, schema]);

  // Compute Display Edges (applies focus hiding)
  const displayEdges = useMemo(() => {
      return edges.map(e => {
          let isDimmed = false;
          if (focusedNode) {
              if (e.source !== focusedNode && e.target !== focusedNode) {
                  isDimmed = true;
              }
          }
          return {
              ...e,
              style: { ...e.style, opacity: isDimmed ? 0.05 : 1 },
              labelBgStyle: { ...e.labelBgStyle, fillOpacity: isDimmed ? 0 : 0.9 },
              labelStyle: { ...e.labelStyle, fillOpacity: isDimmed ? 0 : 1 },
          };
      });
  }, [edges, focusedNode]);

  // Pass click handler up
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(node.id);
      }
    },
    [onNodeClick]
  );
  
  const handleNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onNodeDoubleClick) {
        onNodeDoubleClick(node.id);
      }
    },
    [onNodeDoubleClick]
  );

  const handleSaveLayout = () => {
    const layout = nodes.reduce((acc, n) => {
        acc[n.id] = n.position;
        return acc;
    }, {} as Record<string, {x: number, y: number}>);
    localStorage.setItem('erd-layout', JSON.stringify(layout));
    showToast.success('Architecture layout saved locally!');
  };

  const handleResetLayout = () => {
    localStorage.removeItem('erd-layout');
    window.location.reload();
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden relative shadow-inner">
       {/* Instruction Overlay */}
       <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-5 py-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 pointer-events-auto flex flex-col gap-3 w-80">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
               <span className="text-lg">🗺️</span> Global Schema ERD
            </h3>
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mb-3">
               Interactive Developer Architecture Canvas.
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-2 mb-3 flex gap-2">
                <span className="text-blue-500 text-sm">💡</span>
                <span className="text-[10px] text-blue-700 dark:text-blue-300 leading-tight">
                    <strong>Double-click</strong> any table to explore its full structure in the Schema Visualizer.
                </span>
            </div>
            
            {/* Search Input */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input 
                  type="text"
                  placeholder="Fuzzy Search tables..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200 transition-shadow"
                />
            </div>
          </div>
          
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <input 
                type="checkbox" 
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 form-checkbox dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                checked={showConnectedOnly}
                onChange={(e) => setShowConnectedOnly(e.target.checked)}
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Show Connected tables only
              </span>
            </label>

            {/* Developer Action Buttons */}
            <div className="flex gap-2 flex-wrap">
               <button onClick={handleSaveLayout} className="flex-1 min-w-[30%] bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-2 rounded uppercase tracking-wider transition-colors shadow-sm flex justify-center items-center gap-1">
                  <span>💾</span> Save
               </button>
               <button onClick={handleResetLayout} className="flex-1 min-w-[30%] bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[10px] font-bold py-2 rounded uppercase tracking-wider transition-colors flex justify-center items-center gap-1">
                  <span>🔄</span> Reset
               </button>
               <button onClick={toggleFullscreen} className="flex-1 min-w-[30%] bg-slate-200 hover:bg-slate-300 dark:bg-emerald-900/40 dark:hover:bg-emerald-800/60 dark:text-emerald-300 text-slate-700 text-[10px] font-bold py-2 rounded uppercase tracking-wider transition-colors flex justify-center items-center gap-1 border border-transparent dark:border-emerald-800/50">
                  <span>{isFullscreen ? '↙️' : '↗️'}</span> {isFullscreen ? 'Exit Full' : 'Full Screen'}
               </button>
            </div>
          </div>
       </div>
       
       <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.5, maxZoom: 1 }}
        minZoom={0.1}
        maxZoom={4}
        defaultEdgeOptions={{ zIndex: 0 }}
       >
        <Background color="#94a3b8" gap={20} size={1} />
        <Controls showInteractive={false} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 fill-slate-700 dark:fill-slate-300 shadow-md rounded-lg overflow-hidden" />
        <MiniMap 
            nodeColor="#6366f1"
            maskColor="rgba(15, 23, 42, 0.2)"
            className="rounded-xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            style={{ width: 150, height: 100 }}
            zoomable
            pannable
        />
       </ReactFlow>
    </div>
  );
};

export default GlobalERDiagram;
