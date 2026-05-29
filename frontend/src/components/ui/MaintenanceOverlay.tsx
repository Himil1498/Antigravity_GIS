import React, { useState, useEffect } from "react";
import { Loader2, ServerCog } from "lucide-react";

export const MaintenanceOverlay: React.FC = () => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [attempt, setAttempt] = useState(1);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    const handleMaintenanceEvent = () => {
      // If we aren't already in maintenance mode, turn it on
      if (!isMaintenance) {
        setIsMaintenance(true);
        setAttempt(1);
        setRecovering(false);
      }
    };

    window.addEventListener("system:maintenance_mode", handleMaintenanceEvent);
    
    return () => {
      window.removeEventListener("system:maintenance_mode", handleMaintenanceEvent);
    };
  }, [isMaintenance]);

  // Force any waiting service worker to activate before we reload.
  // This is critical to prevent the reload loop where the old SW
  // serves a cached stale index.html after recovery.
  const forceServiceWorkerUpdate = async (): Promise<void> => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // If there's a waiting worker, tell it to activate immediately
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          // Force an update check to pick up the new SW from the fresh deployment
          await registration.update();
          // Give the new SW a moment to activate and claim clients
          await new Promise(resolve => setTimeout(resolve, 500));
          // If there's STILL a waiting worker after the update, activate it
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      } catch (swError) {
        // Non-critical — worst case the browser handles it on next navigation
        console.warn('SW update during maintenance recovery:', swError);
      }
    }
  };

  // Polling logic when in maintenance mode
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (isMaintenance && !recovering) {
      // Start polling exactly like the static HTML shield
      pollInterval = setInterval(async () => {
        try {
          // Strictly avoid caching to ensure we see the actual server recovery
          const response = await fetch(`/api/health?t=${Date.now()}`, { 
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
          });
          
          if (response.ok) {
            setRecovering(true);
            clearInterval(pollInterval);
            
            // CRITICAL: Force SW update BEFORE reloading to prevent stale cache loop
            await forceServiceWorkerUpdate();
            
            // Allow 2 seconds for fresh static assets to be completely swapped by deploy script
            setTimeout(() => {
              window.location.reload(); 
            }, 2000);
          } else {
            setAttempt(prev => prev + 1);
          }
        } catch (error) {
          // Normal if the gateway is dropped
          setAttempt(prev => prev + 1);
        }
      }, 10000); // Poll every 10 seconds
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isMaintenance, recovering]);

  if (!isMaintenance) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-lg p-10 bg-slate-800/90 border border-slate-700 shadow-2xl rounded-2xl flex flex-col items-center text-center">
        <div className="mb-6 flex justify-center w-full bg-slate-800/10 rounded-xl p-2 items-center">
          <img 
            src="/Logos/Transparent_Dark/logo1.png" 
            alt="OptiConnect GIS" 
            className="h-20 w-auto drop-shadow-lg brightness-0 invert opacity-90" 
          />
        </div>
        
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          System Update in Progress
        </h1>
        
        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
          OptiConnect GIS is currently receiving scheduled upgrades to enhance performance. We estimate to be back online shortly.
        </p>

        <div className="bg-slate-900/50 w-full p-4 rounded-lg flex items-center justify-center gap-3 border border-slate-800">
          {recovering ? (
            <>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
              <span className="text-green-400 font-medium">Connection restored! Reloading...</span>
            </>
          ) : (
            <>
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              <span className="text-slate-400 text-sm">
                Attempting to reconnect (Attempt {attempt})...
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceOverlay;
