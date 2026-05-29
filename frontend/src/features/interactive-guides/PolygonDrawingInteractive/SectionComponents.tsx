import React from 'react';
import { Step } from './types';
import { getColorClasses } from './utils';
import { steps, storageComparison, visualElements, infoDisplay, quickAccessItems, proTips } from './data';

// Header Component
export const GuideHeader: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
    <div className="text-center">
      <div className="text-6xl mb-4">🔺</div>
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
        Polygon Drawing Tool
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Simple Step-by-Step Guide
      </p>
    </div>
  </div>
);

// Flow Step Card Component
interface FlowStepCardProps {
  step: Step;
  showDetails: number | null;
  setShowDetails: React.Dispatch<React.SetStateAction<number | null>>;
  isLast: boolean;
}

export const FlowStepCard: React.FC<FlowStepCardProps> = ({ step, showDetails, setShowDetails, isLast }) => {
  const colorClasses = getColorClasses(step.color);
  const colorParts = colorClasses.split(' ');
  const gradientClasses = `${colorParts[0]} ${colorParts[1]}`;
  const detailsClasses = colorParts.slice(2).join(' ');

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className={`bg-gradient-to-r ${gradientClasses} p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-2xl font-bold">
                {step.id}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{step.icon}</span>
                  <h2 className="text-2xl font-bold text-white">{step.title}</h2>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDetails(showDetails === step.id ? null : step.id)}
              className="text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition"
            >
              {showDetails === step.id ? 'Hide' : 'Details'}
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">ACTION</p>
              <p className="text-gray-800 dark:text-gray-200">{step.action}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">RESULT</p>
              <p className="text-gray-800 dark:text-gray-200">{step.result}</p>
            </div>
          </div>

          {showDetails === step.id && (
            <div className={`mt-4 p-4 rounded-lg border-l-4 ${detailsClasses}`}>
              <p className="font-semibold mb-2">Detailed Steps:</p>
              <ul className="space-y-2">
                {step.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {!isLast && (
        <div className="flex justify-center py-3">
          <div className="text-4xl text-gray-400">⬇️</div>
        </div>
      )}
    </div>
  );
};

// Flow Steps Section
interface FlowStepsSectionProps {
  showDetails: number | null;
  setShowDetails: React.Dispatch<React.SetStateAction<number | null>>;
}

export const FlowStepsSection: React.FC<FlowStepsSectionProps> = ({ showDetails, setShowDetails }) => (
  <div className="space-y-4">
    {steps.map((step, index) => (
      <FlowStepCard
        key={step.id}
        step={step}
        showDetails={showDetails}
        setShowDetails={setShowDetails}
        isLast={index === steps.length - 1}
      />
    ))}
  </div>
);

// Visual Elements Section
export const VisualElementsSection: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
      👁️ What You'll See on Map
    </h2>
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Visual Elements:</h3>
        <div className="space-y-3">
          {visualElements.map((elem, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="text-2xl">{elem.icon}</span>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{elem.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{elem.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Information Display:</h3>
        <div className="space-y-3">
          {infoDisplay.map((elem, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="text-2xl">{elem.icon}</span>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{elem.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{elem.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Storage Comparison Section
export const StorageComparisonSection: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
      💾 Storage Options Comparison
    </h2>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200 dark:border-gray-700">
            <th className="text-left p-4 text-gray-600 dark:text-gray-400">Feature</th>
            <th className="text-left p-4 text-blue-600 dark:text-blue-400">🔒 Permanent</th>
            <th className="text-left p-4 text-yellow-600 dark:text-yellow-400">⏰ Temporary</th>
          </tr>
        </thead>
        <tbody>
          {storageComparison.map((row, idx) => (
            <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
              <td className="p-4 font-semibold text-gray-700 dark:text-gray-300">{row.feature}</td>
              <td className="p-4 text-gray-600 dark:text-gray-400">{row.permanent}</td>
              <td className="p-4 text-gray-600 dark:text-gray-400">{row.temporary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Quick Access Section
export const QuickAccessSection: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
      🔍 Where to Find Your Saved Polygons
    </h2>
    <div className="grid md:grid-cols-2 gap-4">
      {quickAccessItems.map((item, idx) => (
        <div key={idx} className={`bg-gradient-to-br ${item.colorClass} p-4 rounded-lg`}>
          <h3 className="font-bold mb-2">{item.number} {item.title}</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">{item.description}</p>
        </div>
      ))}
    </div>
  </div>
);

// Quick Flow Summary Section
export const QuickFlowSummarySection: React.FC = () => (
  <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl shadow-xl p-6 mt-8 text-white">
    <h2 className="text-xl font-bold mb-4 text-center">⚡ Quick Flow Summary</h2>
    <div className="bg-gray-900 bg-opacity-50 rounded-lg p-6">
      <div className="space-y-3 text-sm">
        <p>1️⃣ Open Tool → 2️⃣ Click vertices on map → 3️⃣ Polygon forms (3+ points)</p>
        <p>4️⃣ Complete Drawing → 5️⃣ Customize color/opacity (optional)</p>
        <p>6️⃣ Click Save → 7️⃣ Enter name → 8️⃣ Choose storage → Done! 🎉</p>
        <div className="border-t border-gray-600 pt-3 mt-3">
          <p className="text-gray-300">📂 Access via: Data Hub | Map Layers | Load Button | Search | Export</p>
        </div>
      </div>
    </div>
  </div>
);

// Pro Tips Section
export const ProTipsSection: React.FC = () => (
  <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl shadow-xl p-6 mt-8 text-white">
    <h2 className="text-xl font-bold mb-4 text-center">💡 Pro Tips</h2>
    <div className="grid md:grid-cols-2 gap-4">
      {proTips.map((tip, idx) => (
        <div key={idx} className="bg-gray-900 bg-opacity-50 rounded-lg p-4">
          <p className="font-semibold mb-2">{tip.icon} {tip.title}</p>
          <p className="text-sm text-gray-300">{tip.description}</p>
        </div>
      ))}
    </div>
  </div>
);

