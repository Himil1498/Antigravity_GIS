import React from "react";
import { Region, Boundary, BoundaryVersion } from "../../../../services/region/index";

interface InfrastructureStats {
  total: number;
  POP: number;
  Customer: number;
}

interface RegionDetailsProps {
  selectedRegion: Region;
  draftExists: boolean;
  currentBoundary: Boundary | null;
  versions: BoundaryVersion[];
  totalVersions: number;
  publishedVersionsCount: number;
  infrastructureStats: InfrastructureStats;
  onAnalyze: () => void;
  onShowImpactPreview: () => void;
  onShowPublishConfirm: () => void;
  onShowDiscardConfirm: () => void;
  onShowUnpublishConfirm?: () => void;
  onShowDeleteConfirm?: () => void;
  onOpenEditor: () => void;
}

const RegionDetails: React.FC<RegionDetailsProps> = ({
  selectedRegion,
  draftExists,
  currentBoundary,
  versions,
  totalVersions,
  publishedVersionsCount,
  infrastructureStats,
  onAnalyze,
  onShowImpactPreview,
  onShowPublishConfirm,
  onShowDiscardConfirm,
  onShowUnpublishConfirm,
  onShowDeleteConfirm,
  onOpenEditor,
}) => {
  return (
    <div className="space-y-6">
      {/* Draft Banner */}
      {draftExists && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 border-l-4 border-l-amber-500 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div>
            <h3 className="font-extrabold text-amber-900 dark:text-amber-400 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Unpublished Draft Detected
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1 font-medium">
              You have saved region changes that have not been published live to the platform yet.
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">

            <button
              onClick={onShowPublishConfirm}
              className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-md hover:from-emerald-600 hover:to-green-700 font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Publish Now
            </button>
            <button
              onClick={onShowDiscardConfirm}
              className="flex-1 sm:flex-none px-4 py-2 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800 font-bold text-sm transition-colors shadow-sm"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Boundary Status Banner */}
      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          <div className="flex-1 space-y-4 w-full">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Boundary Status
            </h3>
            <div className="flex flex-wrap gap-8 items-center">
              <div className="flex flex-col gap-1.5">
                <span className="text-gray-500 dark:text-gray-400 font-medium text-[11px] uppercase tracking-wider">Deployment Status</span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-black tracking-wide shadow-sm w-fit ${currentBoundary ? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50" : "bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"}`}
                >
                  {currentBoundary ? "LIVE ON MAP" : "UNPUBLISHED"}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-gray-500 dark:text-gray-400 font-medium text-[11px] uppercase tracking-wider">Active Version</span>
                <span className="font-mono font-bold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded-md border border-gray-100 dark:border-gray-700 inline-block w-fit">
                  {currentBoundary?.version
                    ? `v${currentBoundary.version}`
                    : currentBoundary
                      ? "v1"
                      : "No version"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-2 md:mt-0">
            {currentBoundary && (
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={onShowUnpublishConfirm}
                  className="flex-1 sm:flex-none px-4 py-3 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 text-xs font-bold transition-colors whitespace-nowrap"
                >
                  Unpublish
                </button>
                <button
                  onClick={onShowDeleteConfirm}
                  className="flex-1 sm:flex-none px-4 py-3 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 text-xs font-bold transition-colors whitespace-nowrap"
                >
                  Delete
                </button>
              </div>
            )}
            <button
              onClick={onOpenEditor}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-bold shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 hover:-translate-y-0.5 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              {draftExists ? "Resume Editing Draft" : "Edit Live Boundary"}
            </button>
          </div>
        </div>
      </div>



      {/* Version History Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-gray-800 dark:text-gray-200 font-bold flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Version History & Activity
            </h3>
            <p className="text-xs text-gray-500 mt-1">Audit log of all drafts, publications, and modifications.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {versions.length > 0 ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Version</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Vertices</th>
                  <th className="px-6 py-4 font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {versions.map((v, i) => (
                  <tr key={v.id || i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        v{v.versionNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {v.status === 'published' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Published
                        </span>
                      ) : v.status === 'draft' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Draft
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {new Date(v.publishedAt || v.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(v.publishedAt || v.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                          {(v.publishedByName || v.createdByName || '?')[0].toUpperCase()}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {v.publishedByName || v.createdByName || 'Unknown User'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                        {v.vertexCount ? v.vertexCount.toLocaleString() : 0} pts
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 dark:text-gray-400 truncate max-w-[250px] inline-block" title={v.changeReason || v.notes || 'No remarks'}>
                        {v.changeReason || v.notes || <span className="text-gray-400 italic">No remarks</span>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-medium">No version history available</p>
              <p className="text-xs mt-1">Boundaries haven't been published for this region yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegionDetails;

