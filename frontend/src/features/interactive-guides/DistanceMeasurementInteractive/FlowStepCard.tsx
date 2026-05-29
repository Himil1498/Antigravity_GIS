import React from 'react';
import { Step } from './types';
import { getColorClasses } from './utils';

interface FlowStepCardProps {
  step: Step;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}

const FlowStepCard: React.FC<FlowStepCardProps> = ({
  step,
  isExpanded,
  onToggle,
  isLast,
}) => {
  const colorClasses = getColorClasses(step.color);
  const [gradientFrom, gradientTo] = colorClasses.split(" ");
  const detailClasses = colorClasses.split(" ").slice(2).join(" ");

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Step Header */}
        <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-2xl font-bold">
                {step.id}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{step.icon}</span>
                  <h2 className="text-2xl font-bold text-white">
                    {step.title}
                  </h2>
                </div>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition"
            >
              {isExpanded ? "Hide" : "Details"}
            </button>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                ACTION
              </p>
              <p className="text-gray-800 dark:text-gray-200">
                {step.action}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                RESULT
              </p>
              <p className="text-gray-800 dark:text-gray-200">
                {step.result}
              </p>
            </div>
          </div>

          {/* Detailed Steps */}
          {isExpanded && (
            <div className={`mt-4 p-4 rounded-lg border-l-4 ${detailClasses}`}>
              <p className="font-semibold mb-2">Detailed Steps:</p>
              <ul className="space-y-2">
                {step.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Arrow between steps */}
      {!isLast && (
        <div className="flex justify-center py-3">
          <div className="text-4xl text-gray-400">⬇️</div>
        </div>
      )}
    </div>
  );
};

export default FlowStepCard;

