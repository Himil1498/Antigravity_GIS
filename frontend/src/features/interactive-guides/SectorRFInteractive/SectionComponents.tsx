import React from 'react';
import { Step } from './types';
import { getColorClasses } from './utils';
import { stepsFirstHalf } from './stepsData';
import { stepsSecondHalf } from './stepsDataContinued';
import { 
  visualElements, rfParameters, storageComparison, accessMethods,
  primaryDirections, secondaryDirections, beamwidthConfigs, 
  coverageRanges, keyFeatures, useCases 
} from './uiData';

// Combine steps from both files
const steps: Step[] = [...stepsFirstHalf, ...stepsSecondHalf];

// Header Component
export const GuideHeader: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
    <div className="text-center">
      <div className="text-6xl mb-4">📡</div>
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
        RF Sector Tool
      </h1>
      <p className="text-gray-600 dark:text-gray-400 text-lg">
        Complete Step-by-Step Guide for RF Sector Coverage Visualization
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
      👁️ Visual Elements on Map
    </h2>
    <div className="grid md:grid-cols-2 gap-4">
      {visualElements.map((element, idx) => (
        <div key={idx} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <span className="text-2xl">{element.icon}</span>
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{element.title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{element.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// RF Parameters Table Section
export const RFParametersSection: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
      📊 RF Parameters Reference
    </h2>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200 dark:border-gray-700">
            <th className="text-left p-4 text-gray-600 dark:text-gray-400">Parameter</th>
            <th className="text-left p-4 text-gray-600 dark:text-gray-400">Range</th>
            <th className="text-left p-4 text-gray-600 dark:text-gray-400">Description</th>
          </tr>
        </thead>
        <tbody>
          {rfParameters.map((row, idx) => (
            <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
              <td className="p-4 font-semibold text-gray-700 dark:text-gray-300">{row.param}</td>
              <td className="p-4 text-gray-600 dark:text-gray-400">{row.range}</td>
              <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{row.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Azimuth Compass Guide Section
export const AzimuthCompassSection: React.FC = () => (
  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
    <h2 className="text-2xl font-bold mb-6 text-center">🧭 Azimuth Direction Guide</h2>
    <div className="grid md:grid-cols-4 gap-4">
      {primaryDirections.map((dir, idx) => (
        <div key={idx} className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
          <div className="text-3xl mb-2">{dir.icon}</div>
          <p className="font-bold">{dir.degrees}</p>
          <p className="text-sm">{dir.direction}</p>
        </div>
      ))}
    </div>
    <div className="grid md:grid-cols-4 gap-4 mt-4">
      {secondaryDirections.map((dir, idx) => (
        <div key={idx} className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
          <div className="text-3xl mb-2">{dir.icon}</div>
          <p className="font-bold">{dir.degrees}</p>
          <p className="text-sm">{dir.direction}</p>
        </div>
      ))}
    </div>
  </div>
);

// Beamwidth Configurations Section
export const BeamwidthConfigsSection: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
      📐 Common Beamwidth Configurations
    </h2>
    <div className="grid md:grid-cols-2 gap-4">
      {beamwidthConfigs.map((config, idx) => (
        <div key={idx} className={`bg-gradient-to-br ${config.colorClass} p-6 rounded-lg`}>
          <h3 className={`font-bold mb-3 text-lg ${config.textColorClass}`}>{config.title}</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{config.subtitle}</p>
          <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
            {config.items.map((item, iidx) => (
              <li key={iidx}>• {item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

// Coverage Ranges Section
export const CoverageRangesSection: React.FC = () => (
  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
    <h2 className="text-2xl font-bold mb-6 text-center">📏 Typical Coverage Ranges by Technology</h2>
    <div className="grid md:grid-cols-2 gap-4">
      {coverageRanges.map((range, idx) => (
        <div key={idx} className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <span className="text-2xl">{range.icon}</span>
            <span>{range.title}</span>
          </h3>
          <ul className="text-sm space-y-1">
            {range.items.map((item, iidx) => (
              <li key={iidx}>• {item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

