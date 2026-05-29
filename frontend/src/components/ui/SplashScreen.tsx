import React, { useEffect, useState } from 'react';

/**
 * Enterprise Grade Splash Screen for Initial App Load
 * Minimalist, highly professional corporate light theme.
 */
const SplashScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [subTask, setSubTask] = useState("initializing boot sequence...");

  const loadingMessages = [
    "Establishing secure connection...",
    "Loading geospatial modules...",
    "Initializing network topologies...",
    "Rendering infrastructure data...",
    "Workspace ready"
  ];

  const subTasksPool = [
    "resolving dns routing...",
    "authenticating matrix signature...",
    "mounting pg_vector indexes...",
    "decrypting geospatial tiles...",
    "loading deck.gl canvas...",
    "warming up cache buffers...",
    "synchronizing remote state...",
    "verifying session token...",
    "building component tree...",
    "injecting environment variables..."
  ];

  useEffect(() => {
    // Simulate loading progress and high-speed console
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setSubTask("system operational.");
          return 100;
        }
        
        // Randomly pick a new sub-task from the pool to simulate fast console output
        setSubTask(subTasksPool[Math.floor(Math.random() * subTasksPool.length)]);
        
        return prev + Math.floor(Math.random() * 12) + 3;
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 25) setMessageIndex(0);
    else if (progress < 50) setMessageIndex(1);
    else if (progress < 75) setMessageIndex(2);
    else if (progress < 95) setMessageIndex(3);
    else setMessageIndex(4);
  }, [progress]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50 font-sans overflow-hidden">
      
      {/* Extremely subtle ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[100px]" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6">
        
        {/* Logo Container - Clean & Professional */}
        <div className="relative flex items-center justify-center w-full">
          {/* Subtle pulse behind the logo */}
          <div className="absolute inset-0 bg-blue-200/40 blur-3xl rounded-full animate-pulse" style={{ animationDuration: '3s' }} />
          
          <img 
            src="/Logos/Transparent/logo1.png" 
            alt="OptiConnect Logo" 
            className={`w-[300px] sm:w-[400px] h-auto object-contain relative z-10 transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setIsImageLoaded(false)}
          />
          {/* Fallback Icon */}
          <svg
            className={`w-24 h-24 text-blue-600 relative z-10 transition-opacity duration-300 ${isImageLoaded ? 'opacity-0 absolute' : 'opacity-100'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        {/* Subtitle */}
        <p className="-mt-14 text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-14 text-center relative z-20">
          Infrastructure Management Platform
        </p>

        {/* Professional Loading Bar */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[11px] font-medium text-slate-500 tracking-wide uppercase">
              {loadingMessages[messageIndex]}
            </span>
            <span className="text-[11px] font-semibold text-blue-600 tabular-nums">
              {Math.min(progress, 100)}%
            </span>
          </div>

          {/* Slim, sharp progress track */}
          <div className="h-[3px] w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              {/* Glossy sheen on the loading bar */}
              <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/40" />
            </div>
          </div>
          
          {/* High-speed Sub-task console */}
          <div className="mt-2.5 flex justify-between items-center text-[9px] font-mono text-slate-400 h-3 overflow-hidden">
             <span>{">"} {subTask}</span>
             <span className="animate-pulse">_</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default SplashScreen;

