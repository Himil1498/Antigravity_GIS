import React from 'react';

// Import all sub-components
import GuideHeader from './components/GuideHeader';
import KeyDifferenceAlert from './components/KeyDifferenceAlert';
import FlowSteps from './components/FlowSteps';
import {
  KPICardsSection,
  ActivityTypesSection,
  HealthMetricsSection,
  KeyFeaturesSection,
} from './components/InfoSections';
import {
  AutoRefreshSection,
  QuickReferenceSection,
  TimeFormatSection,
  UseCasesSection,
  ProTipsSection,
  SummaryStatsSection,
} from './components/AdditionalSections';

const DashboardInteractiveGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <GuideHeader />

        {/* Key Difference Alert */}
        <KeyDifferenceAlert />

        {/* Flow Steps */}
        <FlowSteps />

        {/* KPI Cards Grid */}
        <KPICardsSection />

        {/* Activity Types */}
        <ActivityTypesSection />

        {/* Health Metrics */}
        <HealthMetricsSection />

        {/* Key Features */}
        <KeyFeaturesSection />

        {/* Auto-Refresh Details */}
        <AutoRefreshSection />

        {/* Quick Reference */}
        <QuickReferenceSection />

        {/* Time Format Guide */}
        <TimeFormatSection />

        {/* Use Cases */}
        <UseCasesSection />

        {/* Pro Tips */}
        <ProTipsSection />

        {/* Summary Stats */}
        <SummaryStatsSection />
      </div>
    </div>
  );
};

export default DashboardInteractiveGuide;

