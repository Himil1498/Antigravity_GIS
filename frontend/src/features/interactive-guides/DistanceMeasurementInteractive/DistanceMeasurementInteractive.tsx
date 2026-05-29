import React from 'react';

// Import all sub-components
import {
  GuideHeader,
  FlowSteps,
  StorageComparisonSection,
  QuickAccessGuide,
  TechStackSection,
} from './SectionComponents';

const DistanceMeasurementFlow: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <GuideHeader />

        {/* Flow Steps */}
        <FlowSteps />

        {/* Storage Comparison */}
        <StorageComparisonSection />

        {/* Quick Access Guide */}
        <QuickAccessGuide />

        {/* Tech Stack */}
        <TechStackSection />
      </div>
    </div>
  );
};

export default DistanceMeasurementFlow;

