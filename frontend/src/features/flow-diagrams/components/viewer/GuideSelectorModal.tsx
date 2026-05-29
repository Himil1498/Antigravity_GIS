import React from 'react';
import { GettingStartedGuide, NavigationGuide, MapToolGuide } from './guidesConfig';

interface GuideSelectorModalProps {
  showGuideSelector: boolean;
  activeGuide: string | null;
  setShowGuideSelector: (show: boolean) => void;
  setActiveGuide: (guide: string | null) => void;
  showMapSubmenu: boolean;
  setShowMapSubmenu: (show: boolean) => void;
  gettingStartedGuides: GettingStartedGuide[];
  navigationGuides: NavigationGuide[];
  mapToolGuides: MapToolGuide[];
  handleNavClick: (guide: NavigationGuide) => void;
  handleMapControlClick: (control: string) => void;
}

export const GuideSelectorModal: React.FC<GuideSelectorModalProps> = ({
  showGuideSelector, activeGuide, setShowGuideSelector, setActiveGuide,
  showMapSubmenu, setShowMapSubmenu, gettingStartedGuides, navigationGuides,
  mapToolGuides, handleNavClick, handleMapControlClick
}) => {
  if (!showGuideSelector || activeGuide) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3"><span>📚</span><span>Interactive Step-by-Step Guides</span></h2>
              <p className="text-blue-100 mt-2">Choose a guide to learn how to use each feature</p>
            </div>
            <button onClick={() => setShowGuideSelector(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors" aria-label="Close">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-6 text-center"><p className="text-gray-600 dark:text-gray-300 text-lg">Click on any item below to view its interactive guide</p></div>

          {/* Getting Started */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🚀</span>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Getting Started</h3>
              <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">New Users Start Here</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {gettingStartedGuides.map((guide, index) => (
                <button key={guide.id} onClick={() => setActiveGuide(guide.id)} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-200 text-left group border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center text-2xl shadow-md">{guide.icon}</div>
                    <div className="flex-1">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">STEP {index + 1}</span>
                      <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 text-lg">{guide.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{guide.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end text-blue-600 dark:text-blue-400 text-sm font-medium">View Guide →</div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">Main application navigation</p>
            <div className="flex flex-wrap items-center justify-center gap-1">
              {navigationGuides.map((guide) => (
                <button key={guide.id} onClick={() => handleNavClick(guide)}
                  className={`${guide.component || guide.hasSubmenu ? `${guide.bgColor} border-b-2 ${guide.iconColor} font-semibold` : "border-b-2 border-transparent text-gray-400 cursor-not-allowed"} px-3 py-2 text-sm rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap ${(guide.component || guide.hasSubmenu) && "hover:bg-opacity-80"}`}
                  disabled={!guide.component && !guide.hasSubmenu}>
                  <span className={guide.component || guide.hasSubmenu ? guide.iconColor : ""}>{guide.icon}</span>
                  <span>{guide.name}</span>
                  {guide.hasSubmenu && <svg className={`w-4 h-4 transition-transform ${showMapSubmenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>}
                  {!guide.component && !guide.hasSubmenu && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded ml-1">Soon</span>}
                </button>
              ))}
            </div>
          </div>

          {/* GIS Tools Submenu */}
          {showMapSubmenu && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border-2 border-emerald-200 dark:border-emerald-800 shadow-lg">
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-300 mb-4 flex items-center gap-2">🗺️ Map & GIS Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {mapToolGuides.map((tool) => (
                  <button key={tool.id} onClick={() => { setActiveGuide(tool.id); setShowMapSubmenu(false); }}
                    className="bg-gray-50 dark:bg-gray-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg p-4 shadow hover:shadow-md transition-all text-left group border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{tool.icon}</span>
                      <h4 className="font-semibold text-gray-900 dark:text-white flex-1">{tool.name}</h4>
                      <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Info Footer */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-3 text-lg">💡 What are Interactive Guides?</h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">Each guide provides a comprehensive, step-by-step walkthrough of how to use specific features in OptiConnect GIS.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

