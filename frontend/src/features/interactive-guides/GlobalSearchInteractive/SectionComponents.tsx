import React, { useState } from 'react';
import { stepsFirstHalf } from './data';
import { stepsSecondHalf, proTips } from './dataContinued';
import { getColorClasses } from './utils';
import { ColorClasses, Step } from './types';

// Combine steps from both files
const steps: Step[] = [...stepsFirstHalf, ...stepsSecondHalf];

// Header Component
const GuideHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
        <span className="text-5xl">🔍</span>
        <span>Global Search Interactive Guide</span>
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300">
        Learn how to search for places, coordinates, and saved GIS data. Master multi-source search,
        bookmarks, and history features for efficient navigation and data discovery.
      </p>
    </div>
  );
};

// Step Card Component
interface StepCardProps {
  step: typeof steps[0];
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  colors: ColorClasses;
}

const StepCard: React.FC<StepCardProps> = ({ step, index, isExpanded, onToggle, colors }) => {
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

// Flow Steps Component
const FlowSteps: React.FC = () => {
  const [showDetails, setShowDetails] = useState<number | null>(null);

  const handleToggle = (stepId: number) => {
    setShowDetails(showDetails === stepId ? null : stepId);
  };

  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <StepCard
          key={step.id}
          step={step}
          index={index}
          isExpanded={showDetails === step.id}
          onToggle={() => handleToggle(step.id)}
          colors={getColorClasses(step.color)}
        />
      ))}
    </div>
  );
};

// Pro Tips Footer Component
const ProTipsFooter: React.FC = () => {
  return (
    <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
      <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2 text-lg">
        <span>💡</span>
        <span>Pro Tips</span>
      </h4>
      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
        {proTips.map((tip, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
            <span><strong>{tip.title}:</strong> {tip.content}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Export all components
export { GuideHeader, FlowSteps, ProTipsFooter };

