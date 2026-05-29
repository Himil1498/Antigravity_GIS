/**
 * Custom hook for managing GIS tool selection and activation
 * Handles tool state, Redux synchronization, and tool reopening from map clicks
 * 
 * Flow: When switching tools, the current tool is immediately closed (cleared)
 * and the new tool opens after a brief delay to allow cleanup.
 */

import React from 'react';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../store/index';
import { setActiveGISTool } from '../../../../../store/slices/mapSlice';
import type { GISToolType } from '../../../../../types/gisToolTypes/index';
import { apiClient } from '../../../../../services/api/client';

export const useToolSelection = () => {
  const dispatch = useAppDispatch();
  const { activeGISTool } = useAppSelector((state) => state.map);
  // Initialize from Redux so tool state survives page navigation
  const [activeTool, setActiveTool] = useState<GISToolType | null>(activeGISTool);
  const [toolInitialData, setToolInitialData] = useState<Record<string, unknown> | null>(null);

  // Sync Redux activeGISTool to local activeTool state
  useEffect(() => {
    if (activeGISTool !== activeTool) {
      setActiveTool(activeGISTool);
    }
  }, [activeGISTool]);

  // Listen for custom events to reopen tools from map clicks
  useEffect(() => {
    const handleReopenTool = (event: CustomEvent) => {
      const { toolType, initialData } = event.detail;
      setToolInitialData(initialData || null);
      setActiveTool(toolType);
      dispatch(setActiveGISTool(toolType));
    };

    window.addEventListener('reopenGISTool', handleReopenTool as EventListener);
    return () => {
      window.removeEventListener('reopenGISTool', handleReopenTool as EventListener);
    };
  }, [dispatch]);

  const pendingToolRef = React.useRef<GISToolType | null>(null);

  /**
   * Tool Selection Logic:
   * - Same tool clicked → close it (toggle off)
   * - Different tool clicked while one is active → close current, queue the new one
   * - No tool active → open the selected tool
   */
  const handleToolSelect = (toolId: GISToolType | null) => {
    if (!toolId || activeTool === toolId) {
      // Toggle off: close the current tool
      pendingToolRef.current = null;
      if (activeTool) {
        window.dispatchEvent(
          new CustomEvent('requestGISToolClose', { detail: { toolId: activeTool } })
        );
      }
    } else if (activeTool) {
      // Switch: close current tool, queue the next one
      pendingToolRef.current = toolId;
      window.dispatchEvent(
        new CustomEvent('requestGISToolClose', { detail: { toolId: activeTool } })
      );
    } else {
      // No active tool: just open the selected one
      setActiveTool(toolId);
      dispatch(setActiveGISTool(toolId));
      
      // Audit Log: Tool Used
      apiClient.post("/audit/logs", {
        action: `Opened GIS Tool: ${toolId}`,
        resource_type: "GIS_TOOL_USED",
        resource_id: String(toolId),
        details: { toolName: toolId }
      }).catch(err => console.error("Failed to log GIS tool usage:", err));
    }
  };

  /**
   * Called by each tool's onClose callback.
   * If a pending tool is queued, opens it after a brief delay for cleanup.
   */
  const closeTool = () => {
    if (pendingToolRef.current) {
      const nextTool = pendingToolRef.current;
      pendingToolRef.current = null;
      // Brief delay allows the closing tool to fully unmount and clean up map objects
      setTimeout(() => {
        setActiveTool(nextTool);
        dispatch(setActiveGISTool(nextTool));
        
        apiClient.post("/audit/logs", {
          action: `Opened GIS Tool: ${nextTool}`,
          resource_type: "GIS_TOOL_USED",
          resource_id: String(nextTool),
          details: { toolName: nextTool }
        }).catch(err => console.error("Failed to log GIS tool usage:", err));
      }, 50);
    } else {
      setActiveTool(null);
      dispatch(setActiveGISTool(null));
    }
  };

  const closeToolWithData = () => {
    setToolInitialData(null);
    closeTool();
  };

  return {
    activeTool,
    toolInitialData,
    handleToolSelect,
    closeTool,
    closeToolWithData
  };
};
