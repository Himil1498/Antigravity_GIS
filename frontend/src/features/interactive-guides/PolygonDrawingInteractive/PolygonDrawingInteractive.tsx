import React, { useState } from 'react';
import {
  GuideHeader,
  FlowStepsSection,
  VisualElementsSection,
  StorageComparisonSection,
  QuickAccessSection,
  QuickFlowSummarySection,
  ProTipsSection
} from './SectionComponents';

const PolygonDrawingFlow: React.FC = () => {
  const [showDetails, setShowDetails] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <GuideHeader />
        <FlowStepsSection showDetails={showDetails} setShowDetails={setShowDetails} />
        <VisualElementsSection />
        <StorageComparisonSection />
        <QuickAccessSection />
        <QuickFlowSummarySection />
        <ProTipsSection />
      </div>
    </div>
  );
};

export default PolygonDrawingFlow;

