import { useState, useCallback, useRef } from "react";
import { HistoryState } from "../types/index";
import { MAX_HISTORY } from "../constants/index";

export const useRegionHistory = () => {
    const [history, setHistory] = useState<HistoryState[][][][]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Use refs to avoid stale closure issues in callbacks
    const historyRef = useRef(history);
    const indexRef = useRef(historyIndex);
    historyRef.current = history;
    indexRef.current = historyIndex;

    const saveToHistory = useCallback((paths: google.maps.LatLng[][][]) => {
        const serializedPaths = paths.map(polygon =>
          polygon.map(ring =>
            ring.map(latLng => ({
              lat: latLng.lat(),
              lng: latLng.lng()
            }))
          )
        );
    
        // Use refs to get the latest values, avoiding stale closures
        const currentIndex = indexRef.current;
        const newHistory = historyRef.current.slice(0, currentIndex + 1);
        newHistory.push(serializedPaths);
        
        if (newHistory.length > MAX_HISTORY) {
          newHistory.shift();
          setHistoryIndex(MAX_HISTORY - 1);
        } else {
          setHistoryIndex(newHistory.length - 1);
        }
        
        setHistory(newHistory);
    }, []); // No dependencies needed since we use refs

    const undo = useCallback((): google.maps.LatLng[][][] | null => {
        const currentIndex = indexRef.current;
        const currentHistory = historyRef.current;
        
        if (currentIndex <= 0) return null;
        
        const previousState = currentHistory[currentIndex - 1];
        setHistoryIndex(currentIndex - 1);
        
        return previousState.map(polygon =>
            polygon.map(ring =>
              ring.map(coord => new google.maps.LatLng(coord.lat, coord.lng))
            )
        );
    }, []);

    const redo = useCallback((): google.maps.LatLng[][][] | null => {
        const currentIndex = indexRef.current;
        const currentHistory = historyRef.current;
        
        if (currentIndex >= currentHistory.length - 1) return null;
        
        const nextState = currentHistory[currentIndex + 1];
        setHistoryIndex(currentIndex + 1);

        return nextState.map(polygon =>
            polygon.map(ring =>
              ring.map(coord => new google.maps.LatLng(coord.lat, coord.lng))
            )
        );
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        setHistoryIndex(-1);
    }, []);

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    return {
        history,
        historyIndex,
        saveToHistory,
        undo,
        redo,
        clearHistory,
        canUndo,
        canRedo,
        setHistory,       // Exposed for useRegionActions
        setHistoryIndex   // Exposed for useRegionActions
    };
};
