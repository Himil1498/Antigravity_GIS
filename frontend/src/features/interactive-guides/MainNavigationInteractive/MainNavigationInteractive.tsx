import React, { useState } from "react";
import {
  GuideHeader,
  FlowStepsSection,
  NavigationTabsSection,
  RoleBasedAccessSection,
  GISToolsSection,
  KeyFeaturesSection,
  VisualFlowSection,
  NavigationFlowSection,
  AccessComparisonSection,
  QuickReferenceSection,
  ProTipsSection,
} from "./SectionComponents";

const MainNavigationInteractiveGuide: React.FC = () => {
  const [showDetails, setShowDetails] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <GuideHeader />
        <FlowStepsSection
          showDetails={showDetails}
          setShowDetails={setShowDetails}
        />
        <NavigationTabsSection />
        <RoleBasedAccessSection />
        <GISToolsSection />
        <KeyFeaturesSection />
        <VisualFlowSection />
        <NavigationFlowSection />
        <AccessComparisonSection />
        <QuickReferenceSection />
        <ProTipsSection />
      </div>
    </div>
  );
};

export default MainNavigationInteractiveGuide;

