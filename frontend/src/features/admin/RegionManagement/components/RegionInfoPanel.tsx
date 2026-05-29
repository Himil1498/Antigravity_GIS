import React from 'react';
import { Region } from '../../../../services/region/types';

const RegionInfoPanel: React.FC = () => {
  return (
    <>
      <style>{`
        .info-panel {
          font-family: 'DM Sans', sans-serif;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 20px;
          margin-top: 32px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        .dark .info-panel {
          background: rgba(30, 41, 59, 0.4);
          border-color: rgba(71, 85, 105, 0.3);
        }
        .info-panel-accent {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(to bottom, #3b82f6, #6366f1);
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          transition: background 0.2s ease;
        }
        .info-item:hover {
          background: rgba(59, 130, 246, 0.05);
        }
        .dark .info-item:hover {
          background: rgba(59, 130, 246, 0.1);
        }
      `}</style>

      <div className="info-panel group">
        <div className="info-panel-accent" />
        
        <div className="flex items-start gap-5">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm transition-transform group-hover:scale-110">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              About Boundary Management
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: "Precision Editing", desc: "Select a region to customize its geographic polygons", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
                { label: "Vertex Manipulation", desc: "Drag points to adjust or click lines to add detail", icon: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" },
                { label: "Auto-Snapping", desc: "Our engine snaps new points to the nearest geometric edge", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
                { label: "Version History", desc: "Full audit trail for every modification made", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
                { label: "Role Based Access", desc: "Secure editing restricted to approved personnel", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
                { label: "Live Stats", desc: "Real-time updates to project impact and infra counts", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }
              ].map((item, idx) => (
                <div key={idx} className="info-item group/item">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 text-blue-500 shadow-sm group-hover/item:border-blue-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.label}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute right-4 bottom-4 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
      </div>
    </>
  );
};

export default RegionInfoPanel;

