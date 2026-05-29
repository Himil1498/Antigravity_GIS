import React from 'react';

const KeyDifferenceAlert: React.FC = () => {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500 rounded-xl p-6 mb-8">
      <div className="flex items-start gap-4">
        <div className="text-4xl">⚖️</div>
        <div>
          <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-2">
            📊 Analytics vs 🏠 Dashboard
          </h3>
          <div className="space-y-2 text-amber-700 dark:text-amber-300">
            <p className="flex items-center gap-2">
              <span className="font-bold">
                📊 Analytics Page (Current):
              </span>
              <span>
                Shows <strong className="underline">ALL users' data</strong>{" "}
                (system-wide)
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-bold">🏠 Dashboard Page:</span>
              <span>
                Shows <strong className="underline">your data only</strong>{" "}
                (personal)
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyDifferenceAlert;

