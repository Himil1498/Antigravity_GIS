import React from "react";

interface StreetView360ModalProps {
  show360ViewPosition: { lat: number; lng: number };
  onClose: () => void;
}

const StreetView360Modal: React.FC<StreetView360ModalProps> = ({
  show360ViewPosition,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-2">🌐</span>360° Street View
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Location: {show360ViewPosition.lat.toFixed(6)},{" "}
              {show360ViewPosition.lng.toFixed(6)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-white dark:text-gray-400 hover:bg-red-500 rounded-lg transition-all duration-300 group shadow-sm"
            title="Close 360° view"
          >
            <svg
              className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 relative flex">
          <div id="street-view-container" className="flex-1 h-full" />
          <div className="w-80 h-full border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Context Map
              </h3>
            </div>
            <div
              id="street-view-minimap"
              className="w-full"
              style={{ height: "calc(100% - 60px)" }}
            />
          </div>
        </div>
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Use mouse to drag and explore
          </p>
        </div>
      </div>
    </div>
  );
};

export default StreetView360Modal;

