import React from 'react';

// Import all sub-components
import { GuideHeader, QuickOverview, FlowSteps, QuickFlowSummary } from './components/HeaderSections';
import {
  DataTypesSection,
  ExportFormatsSection,
  InfrastructureCategoriesSection,
  CustomerCompaniesSection,
  StorageComparisonSection,
  AccessMethodsSection,
} from './components/InfoSections';
import {
  KeyFeaturesSection,
  SystemIntegrationSection,
  UseCasesSection,
  ProTipsSection,
  PerformanceFeaturesSection,
} from './components/AdditionalSections';

const GISDataHubInteractiveGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <GuideHeader />

        {/* Quick Overview */}
        <QuickOverview />

        {/* Flow Steps */}
        <FlowSteps />

        {/* Data Types */}
        <DataTypesSection />

        {/* Export Formats */}
        <ExportFormatsSection />

        {/* Infrastructure Categories */}
        <InfrastructureCategoriesSection />

        {/* Customer Companies */}
        <CustomerCompaniesSection />

        {/* Storage Comparison */}
        <StorageComparisonSection />

        {/* Access Methods */}
        <AccessMethodsSection />

        {/* Quick Flow Summary */}
        <QuickFlowSummary />

        {/* Key Features */}
        <KeyFeaturesSection />

        {/* System Integration */}
        <SystemIntegrationSection />

        {/* Use Cases */}
        <UseCasesSection />

        {/* Pro Tips */}
        <ProTipsSection />

        {/* Performance Features */}
        <PerformanceFeaturesSection />
      </div>
    </div>
  );
};

export default GISDataHubInteractiveGuide;

