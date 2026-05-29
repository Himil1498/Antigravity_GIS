/**
 * Custom hook for managing toolbox UI state
 * Handles collapsed state, dialogs, and advanced options visibility
 */

import { useState } from 'react';

export const useToolboxState = () => {
  const [isToolboxCollapsed, setIsToolboxCollapsed] = useState<boolean>(false);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [showCloseWarning, setShowCloseWarning] = useState<boolean>(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  return {
    isToolboxCollapsed,
    setIsToolboxCollapsed,
    showSaveDialog,
    setShowSaveDialog,
    showCloseWarning,
    setShowCloseWarning,
    showAdvancedOptions,
    setShowAdvancedOptions,
    saving,
    setSaving
  };
};

