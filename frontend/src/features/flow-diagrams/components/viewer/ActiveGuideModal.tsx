import React from 'react';

interface ActiveGuideModalProps {
  activeGuide: string | null;
  setActiveGuide: (guide: string | null) => void;
  setShowGuideSelector: (show: boolean) => void;
  setMapSection: (section: string) => void;
  renderActiveGuide: () => React.ReactNode;
}

export const ActiveGuideModal: React.FC<ActiveGuideModalProps> = ({
  activeGuide, setActiveGuide, setShowGuideSelector, setMapSection, renderActiveGuide
}) => {
  if (!activeGuide) return null;

  const handleBack = () => {
    setActiveGuide(null);
    setMapSection('all');
  };

  return (
    // Full screen page - no modal overlay
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 w-full">
      {/* Back button bar - sticky at top */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-semibold">Back to Guides</span>
          </button>
        </div>
      </div>

      {/* Guide content - full width, no restrictions */}
      <div className="w-full">
        {renderActiveGuide()}
      </div>
    </div>
  );
};

