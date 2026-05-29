import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ToolsState {
  excelKml: {
    file: File | null;
    previewData: any[];
    exportFormat: 'kml' | 'kmz';
  };
  kmlExcel: {
    file: File | null;
    previewData: any[];
  };
  viewer: {
    kmlFile: File | null;
    viewerData: any[];
  };
  kmlKmz: {
    file: File | null;
    fileData: any;
  };
}

interface ToolsContextType {
  state: ToolsState;
  saveExcelKmlState: (state: Partial<ToolsState['excelKml']>) => void;
  saveKmlExcelState: (state: Partial<ToolsState['kmlExcel']>) => void;
  saveViewerState: (state: Partial<ToolsState['viewer']>) => void;
  saveKmlKmzState: (state: Partial<ToolsState['kmlKmz']>) => void;
}

const defaultState: ToolsState = {
  excelKml: { file: null, previewData: [], exportFormat: 'kml' },
  kmlExcel: { file: null, previewData: [] },
  viewer: { kmlFile: null, viewerData: [] },
  kmlKmz: { file: null, fileData: null }
};

const ToolsContext = createContext<ToolsContextType | undefined>(undefined);

export const ToolsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ToolsState>(defaultState);

  const saveExcelKmlState = React.useCallback((newState: Partial<ToolsState['excelKml']>) => {
    setState(prev => ({ ...prev, excelKml: { ...prev.excelKml, ...newState } }));
  }, []);

  const saveKmlExcelState = React.useCallback((newState: Partial<ToolsState['kmlExcel']>) => {
    setState(prev => ({ ...prev, kmlExcel: { ...prev.kmlExcel, ...newState } }));
  }, []);

  const saveViewerState = React.useCallback((newState: Partial<ToolsState['viewer']>) => {
    setState(prev => ({ ...prev, viewer: { ...prev.viewer, ...newState } }));
  }, []);

  const saveKmlKmzState = React.useCallback((newState: Partial<ToolsState['kmlKmz']>) => {
    setState(prev => ({ ...prev, kmlKmz: { ...prev.kmlKmz, ...newState } }));
  }, []);

  return (
    <ToolsContext.Provider value={{ state, saveExcelKmlState, saveKmlExcelState, saveViewerState, saveKmlKmzState }}>
      {children}
    </ToolsContext.Provider>
  );
};

export const useToolsContext = () => {
  const context = useContext(ToolsContext);
  if (context === undefined) {
    throw new Error('useToolsContext must be used within a ToolsProvider');
  }
  return context;
};
