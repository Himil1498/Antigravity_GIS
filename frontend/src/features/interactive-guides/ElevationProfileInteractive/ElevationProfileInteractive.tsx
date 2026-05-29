import React from 'react';

// Import all sub-components
import {
  GuideHeader,
  FlowSteps,
  VisualElementsSection,
  StorageComparisonSection,
  AccessMethodsSection,
  QuickFlowSummary,
  KeyFeaturesSection,
} from './SectionComponents';

const ElevationProfileFlowDiagram: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <GuideHeader />

        {/* Flow Steps */}
        <FlowSteps />

        {/* Visual Elements Guide */}
        <VisualElementsSection />

        {/* Storage Comparison */}
        <StorageComparisonSection />

        {/* Access Methods */}
        <AccessMethodsSection />

        {/* Quick Flow Summary */}
        <QuickFlowSummary />

        {/* Features Highlight */}
        <KeyFeaturesSection />
      </div>
    </div>
  );
};

export default ElevationProfileFlowDiagram;

