import React, { useState } from 'react';
import {
  GuideHeader,
  FlowStepsSection,
  VisualElementsSection,
  RFParametersSection,
  AzimuthCompassSection,
  BeamwidthConfigsSection,
  CoverageRangesSection
} from './SectionComponents';
import {
  StorageComparisonSection,
  AccessMethodsSection,
  QuickFlowSummarySection,
  KeyFeaturesSection,
  UseCasesSection
} from './SectionComponentsContinued';

const SectorRFInteractiveGuide: React.FC = () => {
  const [showDetails, setShowDetails] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <GuideHeader />
        <FlowStepsSection showDetails={showDetails} setShowDetails={setShowDetails} />
        <VisualElementsSection />
        <RFParametersSection />
        <AzimuthCompassSection />
        <BeamwidthConfigsSection />
        <CoverageRangesSection />
        <StorageComparisonSection />
        <AccessMethodsSection />
        <QuickFlowSummarySection />
        <KeyFeaturesSection />
        <UseCasesSection />
      </div>
    </div>
  );
};

export default SectorRFInteractiveGuide;

