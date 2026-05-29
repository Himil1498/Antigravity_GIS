// import React from 'react';
// import type { Region } from "../../../../services/region/types";

// interface RegionListProps {
//   regions: Region[];
//   onSelectRegion: (id: number) => void;
// }

// const RegionList: React.FC<RegionListProps> = ({ regions, onSelectRegion }) => {
//   if (regions.length === 0) {
//     return (
//       <div className="col-span-full text-center py-12">
//         <svg
//           className="w-16 h-16 text-gray-300 mx-auto mb-4"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={1.5}
//             d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
//           />
//         </svg>
//         <p className="text-gray-500 text-lg">No regions found</p>
//         <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//       {regions.map((region) => (
//         <div
//           key={region.id}
//           onClick={() => onSelectRegion(region.id)}
//           className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all duration-300 overflow-hidden cursor-pointer"
//         >
//           {/* Top Accent Strip */}
//           <div className={`h-1.5 w-full ${
//             region.isActive ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-300 dark:bg-gray-700'
//           }`} />

//           <div className="p-6">
//             <div className="flex items-start justify-between mb-5">
//               <div className="flex-1 min-w-0">
//                 <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
//                   {region.name}
//                 </h3>
//                 <div className="flex items-center gap-2 mt-1.5">
//                   <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
//                     Region Code:
//                   </span>
//                   <span className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
//                     {region.code}
//                   </span>
//                 </div>
//               </div>
              
//               <div className="flex flex-col items-end gap-2">
//                 <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight shadow-sm ${
//                   region.isActive
//                     ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
//                     : 'bg-gray-50 text-gray-600 border border-gray-100'
//                 }`}>
//                   <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${region.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
//                   {region.isActive ? 'Active' : 'Inactive'}
//                 </span>
                
//                 <span className="text-[10px] font-bold uppercase tracking-tight px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
//                   {region.type}
//                 </span>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 mb-6">
//               <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
//                 region.hasBoundary
//                   ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
//                   : "bg-amber-50 text-amber-700 border border-amber-100"
//               }`}>
//                 {region.hasBoundary ? (
//                   <>
//                     <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     Boundary Set
//                   </>
//                 ) : (
//                   <>
//                     <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                     </svg>
//                     No Boundary
//                   </>
//                 )}
//               </div>
              
//               {region.hasBoundary && (
//                 <div className="flex -space-x-2">
//                   {[1, 2, 3].map((i) => (
//                     <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-[8px] font-bold text-gray-500">
//                       V{i}
//                     </div>
//                   ))}
//                   <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-600">
//                     +
//                   </div>
//                 </div>
//               )}
//             </div>

//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onSelectRegion(region.id);
//               }}
//               className="group/btn w-full px-5 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-600 dark:hover:bg-blue-600 text-gray-700 dark:text-gray-300 hover:text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-bold shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 hover:border-blue-500"
//             >
//               <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2.5}
//                   d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
//                 />
//               </svg>
//               <span>Edit Boundary</span>
//               <svg className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//               </svg>
//             </button>
//           </div>
          
//           {/* Subtle Background Pattern */}
//           <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
//         </div>
//       ))}
//     </div>
//   );
// };

// export default RegionList;


import React from 'react';
import type { Region } from "../../../../services/region/types";

interface RegionListProps {
  regions: Region[];
  onSelectRegion: (id: number) => void;
}

const RegionList: React.FC<RegionListProps> = ({ regions, onSelectRegion }) => {
  if (regions.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-24 px-8">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-slate-400/10 blur-2xl scale-150" />
          <div className="relative w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-inner">
            <svg className="w-9 h-9 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
        </div>
        <p className="text-slate-700 dark:text-slate-200 text-lg font-semibold tracking-tight">No regions found</p>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1.5 font-medium">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');

        .region-card {
          font-family: 'DM Sans', sans-serif;
          position: relative;
          background: rgba(255,255,255,0.97);
          border: 1px solid rgba(220,226,236,0.9);
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(.22,.68,0,1.2), box-shadow 0.25s ease, border-color 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04);
        }
        .dark .region-card {
          background: rgba(17,24,39,0.85);
          border-color: rgba(55,65,81,0.7);
          box-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.25);
          backdrop-filter: blur(12px);
        }
        .region-card:hover {
          transform: translateY(-4px) scale(1.008);
          box-shadow: 0 8px 40px rgba(59,130,246,0.13), 0 2px 12px rgba(0,0,0,0.08);
          border-color: rgba(147,197,253,0.7);
        }
        .dark .region-card:hover {
          border-color: rgba(59,130,246,0.4);
          box-shadow: 0 8px 40px rgba(59,130,246,0.18), 0 2px 8px rgba(0,0,0,0.4);
        }

        .region-card .card-shimmer {
          position: absolute;
          inset: 0;
          opacity: 0;
          background: linear-gradient(135deg, rgba(59,130,246,0.04) 0%, transparent 60%);
          transition: opacity 0.3s ease;
          pointer-events: none;
          border-radius: inherit;
        }
        .region-card:hover .card-shimmer { opacity: 1; }

        .accent-bar {
          height: 3px;
          width: 100%;
          border-radius: 3px 3px 0 0;
          position: absolute;
          top: 0; left: 0;
          transition: opacity 0.3s ease;
        }
        .accent-bar-active {
          background: linear-gradient(90deg, #10b981, #06b6d4, #3b82f6);
          background-size: 200%;
          animation: shimmerBar 3s linear infinite;
        }
        .accent-bar-inactive {
          background: linear-gradient(90deg, #94a3b8, #cbd5e1);
        }
        @keyframes shimmerBar {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .status-dot-active {
          background: #10b981;
          box-shadow: 0 0 0 0 rgba(16,185,129,0.4);
          animation: pulseDot 2s infinite;
        }
        @keyframes pulseDot {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
          70% { box-shadow: 0 0 0 5px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }

        .region-code {
          font-family: 'DM Mono', monospace;
        }

        .edit-btn {
          position: relative;
          overflow: hidden;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 11px 20px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 0.85rem;
          letter-spacing: 0.01em;
          border: 1px solid rgba(226,232,240,1);
          background: rgba(248,250,252,1);
          color: #475569;
          transition: all 0.25s cubic-bezier(.22,.68,0,1.2);
          cursor: pointer;
        }
        .dark .edit-btn {
          border-color: rgba(55,65,81,0.8);
          background: rgba(30,41,59,0.6);
          color: #94a3b8;
        }
        .edit-btn:hover {
          background: #2563eb;
          border-color: #2563eb;
          color: white;
          transform: scale(1.02);
          box-shadow: 0 4px 20px rgba(37,99,235,0.35);
        }
        .edit-btn .btn-arrow {
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.2s, transform 0.2s;
        }
        .edit-btn:hover .btn-arrow {
          opacity: 1;
          transform: translateX(0);
        }
        .edit-btn .btn-icon {
          transition: transform 0.2s;
        }
        .edit-btn:hover .btn-icon { transform: scale(1.15); }

        .tag-base {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .boundary-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
        }
        .boundary-badge-set {
          background: rgba(238,242,255,1);
          color: #4f46e5;
          border: 1px solid rgba(199,210,254,0.8);
        }
        .dark .boundary-badge-set {
          background: rgba(49,46,129,0.25);
          color: #a5b4fc;
          border-color: rgba(99,102,241,0.3);
        }
        .boundary-badge-none {
          background: rgba(255,251,235,1);
          color: #d97706;
          border: 1px solid rgba(253,230,138,0.8);
        }
        .dark .boundary-badge-none {
          background: rgba(120,53,15,0.2);
          color: #fbbf24;
          border-color: rgba(217,119,6,0.3);
        }

        .vertex-avatar {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid white;
          background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 7px;
          font-weight: 700;
          color: #64748b;
          margin-left: -7px;
        }
        .dark .vertex-avatar {
          border-color: #111827;
          background: linear-gradient(135deg, #334155, #1e293b);
          color: #94a3b8;
        }
        .vertex-avatar:first-child { margin-left: 0; }
        .vertex-avatar-plus {
          background: linear-gradient(135deg, #bfdbfe, #93c5fd);
          color: #1d4ed8;
        }
        .dark .vertex-avatar-plus {
          background: linear-gradient(135deg, #1e3a5f, #1e40af);
          color: #60a5fa;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(226,232,240,0.8), transparent);
          margin: 0 -24px;
        }
        .dark .divider {
          background: linear-gradient(90deg, transparent, rgba(55,65,81,0.6), transparent);
        }

        .bg-grid-pattern {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px);
          background-size: 20px 20px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s;
          border-radius: inherit;
        }
        .region-card:hover .bg-grid-pattern { opacity: 1; }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', fontFamily: "'DM Sans', sans-serif" }}>
        {regions.map((region, idx) => (
          <div
            key={region.id}
            className="region-card"
            onClick={() => onSelectRegion(region.id)}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {/* Animated accent bar */}
            <div className={`accent-bar ${region.isActive ? 'accent-bar-active' : 'accent-bar-inactive'}`} />

            {/* Background patterns */}
            <div className="bg-grid-pattern" />
            <div className="card-shimmer" />

            <div style={{ padding: '24px', paddingTop: '22px' }}>
              {/* Header Row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: '1.05rem', fontWeight: 700, margin: 0, marginBottom: '6px',
                    color: 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    letterSpacing: '-0.02em',
                  }}
                    className="text-slate-900 dark:text-white group-hover:text-blue-600"
                  >
                    {region.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8' }}>
                      Code
                    </span>
                    <span className="region-code text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" style={{
                      fontSize: '12px', fontWeight: 500,
                      padding: '2px 8px', borderRadius: '6px',
                    }}>
                      {region.code}
                    </span>
                  </div>
                </div>

                {/* Status + Type tags */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                  <span className={`tag-base ${region.isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`} style={{ border: `1px solid ${region.isActive ? 'rgba(167,243,208,0.7)' : 'rgba(226,232,240,0.8)'}` }}>
                    <span className={`status-dot-active`} style={{
                      width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                      background: region.isActive ? '#10b981' : '#94a3b8',
                      animation: region.isActive ? undefined : 'none',
                    }} />
                    {region.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="tag-base bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    style={{ border: '1px solid rgba(191,219,254,0.7)' }}>
                    {region.type}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="divider" style={{ marginBottom: '16px' }} />

              {/* Boundary Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span className={`boundary-badge ${region.hasBoundary ? 'boundary-badge-set' : 'boundary-badge-none'}`}>
                  {region.hasBoundary ? (
                    <>
                      <svg style={{ width: 13, height: 13 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Boundary Set
                    </>
                  ) : (
                    <>
                      <svg style={{ width: 13, height: 13 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      No Boundary
                    </>
                  )}
                </span>

                {region.hasBoundary && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="vertex-avatar">V{i}</div>
                    ))}
                    <div className="vertex-avatar vertex-avatar-plus">+</div>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button
                className="edit-btn"
                onClick={(e) => { e.stopPropagation(); onSelectRegion(region.id); }}
              >
                <svg className="btn-icon" style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Edit Boundary</span>
                <svg className="btn-arrow" style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default RegionList;