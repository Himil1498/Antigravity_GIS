import React, { useState } from 'react';
import {
  GuideHeader,
  FlowStepsSection,
  SecurityFeaturesSection,
  QuickSummarySection,
  ProTipsSection,
  FooterSection
} from './SectionComponents';

const LoginPageInteractiveGuide: React.FC = () => {
  const [showDetails, setShowDetails] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <GuideHeader />
        <FlowStepsSection showDetails={showDetails} setShowDetails={setShowDetails} />
        <SecurityFeaturesSection />
        <QuickSummarySection />
        <ProTipsSection />
        <FooterSection />
      </div>
    </div>
  );
};

export default LoginPageInteractiveGuide;

