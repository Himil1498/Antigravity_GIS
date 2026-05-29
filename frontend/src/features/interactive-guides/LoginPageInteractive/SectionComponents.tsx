import React from 'react';
import { Step } from './types';
import { getColorClasses } from './utils';
import { steps, securityFeatures, proTips } from './data';

// Header Component
export const GuideHeader: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
    <div className="text-center">
      <div className="text-6xl mb-4">🔐</div>
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
        Login & Authentication Flow
      </h1>
      <p className="text-gray-600 dark:text-gray-400 text-lg">
        Complete Interactive Guide to Secure User Authentication
      </p>
      <div className="mt-4 flex justify-center gap-4 text-sm flex-wrap">
        <span className="bg-red-100 dark:bg-red-900 px-3 py-1 rounded-full text-red-800 dark:text-red-200">
          🔒 Secure Authentication
        </span>
        <span className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full text-blue-800 dark:text-blue-200">
          ⏱️ Auto Session Expiry
        </span>
        <span className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full text-green-800 dark:text-green-200">
          🛡️ Password Protected
        </span>
      </div>
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
        {/* Step Header */}
        <div className={`bg-gradient-to-r ${gradientClasses} p-6`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-2xl font-bold text-gray-800 dark:text-white">
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
              {showDetails === step.id ? '▲ Hide' : '▼ Details'}
            </button>
          </div>
        </div>

        {/* Step Content */}
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

          {/* Detailed Steps */}
          {showDetails === step.id && (
            <div className={`mt-4 p-4 rounded-lg border-l-4 ${detailsClasses}`}>
              <p className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Detailed Steps:</p>
              <ul className="space-y-2">
                {step.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1 font-bold">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">{detail}</span>
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

// Security Features Section
export const SecurityFeaturesSection: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
      🛡️ Security Features
    </h2>
    <div className="grid md:grid-cols-2 gap-4">
      {securityFeatures.map((feature, idx) => {
        const detailsClasses = getColorClasses(feature.color).split(' ').slice(2).join(' ');
        return (
          <div key={idx} className={`p-4 rounded-lg border-l-4 ${detailsClasses}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{feature.icon}</span>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{feature.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.details}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// Quick Summary Section
export const QuickSummarySection: React.FC = () => (
  <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl shadow-xl p-6 mt-8 text-white">
    <h2 className="text-xl font-bold mb-4 text-center">⚡ Quick Flow Summary</h2>
    <div className="bg-gray-900 bg-opacity-50 rounded-lg p-6">
      <div className="space-y-3 text-sm">
        <p><strong>Normal Login:</strong> Enter credentials → Submit → Authentication → Redirect to map page</p>
        <p><strong>Forgot Password:</strong> Click link → Enter username → Admin notified → Receive reset email → Reset password → Login</p>
        <p><strong>Contact Support:</strong> Click link → Copy email OR Open email client → Send to himil.chauhan@optimaltele.net</p>
        <div className="border-t border-cyan-400 pt-3 mt-3">
          <p className="text-cyan-100">🔒 Secure: Encrypted passwords and secure transmission</p>
          <p className="text-cyan-100">⏱️ Session: Automatic expiry after inactivity for security</p>
          <p className="text-cyan-100">✉️ Verified: Email verification required for account activation</p>
        </div>
      </div>
    </div>
  </div>
);

// Pro Tips Section
export const ProTipsSection: React.FC = () => (
  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-8 mt-8 text-white">
    <h2 className="text-2xl font-bold mb-6 text-center">💡 Pro Tips & Best Practices</h2>
    <div className="grid md:grid-cols-2 gap-4">
      {proTips.map((tip, idx) => (
        <div key={idx} className="bg-white bg-opacity-10 p-4 rounded-lg">
          <p className="font-bold mb-1">{tip.title}</p>
          <p className="text-sm">{tip.content}</p>
        </div>
      ))}
    </div>
  </div>
);

// Footer Section
export const FooterSection: React.FC = () => (
  <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-2xl shadow-xl p-6 mt-8 mb-8 text-white text-center">
    <p className="text-sm">
      <strong>Login & Authentication Guide</strong>
    </p>
    <p className="text-xs mt-2 text-gray-400">
      Secure Authentication • Password Protection • Auto Session Expiry • Real-time Updates
    </p>
  </div>
);

