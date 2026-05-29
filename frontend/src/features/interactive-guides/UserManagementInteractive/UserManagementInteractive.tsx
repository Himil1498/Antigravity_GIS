import React from 'react';

// Import all sub-components
import GuideHeader from './components/GuideHeader';
import FlowSteps from './components/FlowSteps';
import {
  UserRolesSection,
  RowActionsSection,
  FormSectionsDisplay,
  TableColumnsGrid,
} from './components/InfoSections';
import BulkOperationsSection from './components/BulkOperationsSection';
import ValidationRulesTable from './components/ValidationRulesTable';
import QuickFlowSummary from './components/QuickFlowSummary';
import KeyFeaturesSection from './components/KeyFeaturesSection';
import ProTipsSection from './components/ProTipsSection';

const UsersManagementInteractiveGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <GuideHeader />

        {/* Flow Steps */}
        <FlowSteps />

        {/* User Roles */}
        <UserRolesSection />

        {/* Row-Level Actions */}
        <RowActionsSection />

        {/* Bulk Operations */}
        <BulkOperationsSection />

        {/* 4-Section Form */}
        <FormSectionsDisplay />

        {/* Validation Rules */}
        <ValidationRulesTable />

        {/* Table Columns */}
        <TableColumnsGrid />

        {/* Quick Flow Summary */}
        <QuickFlowSummary />

        {/* Key Features */}
        <KeyFeaturesSection />

        {/* Pro Tips */}
        <ProTipsSection />
      </div>
    </div>
  );
};

export default UsersManagementInteractiveGuide;

