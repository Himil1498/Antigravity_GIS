import React from 'react';

// Import all sub-components
import GuideHeader from './components/GuideHeader';
import KeyDifferenceAlert from './components/KeyDifferenceAlert';
import FlowSteps from './components/FlowSteps';
import {
  DashboardSectionsOverview,
  KeyFeaturesSection,
  QuickReferenceSection,
  DataRefreshSection,
} from './components/InfoSections';
import { UseCasesSection, ProTipsSection } from './components/AdditionalSections';
import FlowDiagram from './components/FlowDiagram/index';

const AnalyticsInteractiveGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <GuideHeader />

        {/* Key Difference Alert */}
        <KeyDifferenceAlert />

        {/* Flow Steps */}
        <FlowSteps />

        {/* Dashboard Sections */}
        <DashboardSectionsOverview />

        {/* Key Features */}
        <KeyFeaturesSection />

        {/* Quick Reference */}
        <QuickReferenceSection />

        {/* Data Refresh */}
        <DataRefreshSection />

        {/* Use Cases */}
        <UseCasesSection />

        {/* Pro Tips */}
        <ProTipsSection />
      </div>

      {/* Flow Diagram Section */}
      <FlowDiagram />
    </div>
  );
};

export default AnalyticsInteractiveGuide;

