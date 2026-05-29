import React from 'react';

// Import all sub-components
import GuideHeader from './components/GuideHeader';
import FlowSteps from './components/FlowSteps';
import {
  VisualElementsSection,
  StorageComparisonSection,
  AccessMethodsSection,
} from './components/InfoSections';
import {
  QuickFlowSummary,
  TechStackSection,
  KeyFeaturesSection,
  UseCasesSection,
} from './components/AdditionalSections';

const CircleDrawingInteractiveGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-6">
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

        {/* Tech Stack */}
        <TechStackSection />

        {/* Features Highlight */}
        <KeyFeaturesSection />

        {/* Use Cases */}
        <UseCasesSection />
      </div>
    </div>
  );
};

export default CircleDrawingInteractiveGuide;

