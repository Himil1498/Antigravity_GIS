import React from 'react';
import { Step, ColorClasses } from './types';
import { getColorClasses } from './utils';
import { steps, proTips } from './data';

// Header Component
export const GuideHeader: React.FC = () => (
  <div className="mb-8">
    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
      <span className="text-5xl">📊</span>
      <span>Layers Panel Interactive Guide</span>
    </h1>
    <p className="text-lg text-gray-600 dark:text-gray-300">
      Learn how to manage and toggle map layers. Control visibility of Distance measurements, Polygons, Circles,
      Elevation profiles, Infrastructure items, and RF Sectors. Master the user filter to view data from specific users.
    </p>
  </div>
);

// Step Card Component
interface StepCardProps {
  step: Step;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export const StepCard: React.FC<StepCardProps> = ({ step, index, isExpanded, onToggle }) => {
  const colors = getColorClasses(step.color);

  return (
    <div className={`${colors.bg} ${colors.border} border-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg`}>
      {/* Step Header */}
      <button
        onClick={onToggle}
        className="w-full p-6 text-left flex items-center gap-4 hover:opacity-80 transition-opacity"
      >
        <div className="flex-shrink-0">
          <div className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center text-3xl border-2 ${colors.border}`}>
            {step.icon}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`${colors.text} text-sm font-bold`}>STEP {index + 1}</span>
            <h3 className={`text-2xl font-bold ${colors.text}`}>{step.title}</h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
            <span className="font-bold">Action:</span> {step.action}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            <span className="font-bold">Result:</span> {step.result}
          </p>
        </div>
        <div className="flex-shrink-0">
          <svg
            className={`w-6 h-6 ${colors.text} transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t-2 border-gray-200 dark:border-gray-700">
          <h4 className={`${colors.text} font-bold mb-3 flex items-center gap-2`}>
            <span>📋</span>
            <span>Detailed Steps:</span>
          </h4>
          <ul className="space-y-2">
            {step.details.map((detail, idx) => (
              <li
                key={idx}
                className="text-gray-700 dark:text-gray-300 pl-4 border-l-2 border-gray-300 dark:border-gray-600"
              >
                {detail}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Steps List Component
interface StepsListProps {
  showDetails: number | null;
  setShowDetails: React.Dispatch<React.SetStateAction<number | null>>;
}

export const StepsList: React.FC<StepsListProps> = ({ showDetails, setShowDetails }) => (
  <div className="space-y-6">
    {steps.map((step, index) => (
      <StepCard
        key={step.id}
        step={step}
        index={index}
        isExpanded={showDetails === step.id}
        onToggle={() => setShowDetails(showDetails === step.id ? null : step.id)}
      />
    ))}
  </div>
);

// Pro Tips Footer Component
export const ProTipsFooter: React.FC = () => (
  <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
    <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2 text-lg">
      <span>💡</span>
      <span>Pro Tips</span>
    </h4>
    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
      {proTips.map((tip, idx) => (
        <li key={idx} className="flex items-start gap-2">
          <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
          <span><strong>{tip.label}:</strong> {tip.content}</span>
        </li>
      ))}
    </ul>
  </div>
);

