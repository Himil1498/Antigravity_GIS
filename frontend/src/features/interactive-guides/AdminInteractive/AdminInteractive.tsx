import React from 'react';

// Import all sub-components
import GuideHeader from './components/GuideHeader';
import StatsOverview from './components/StatsOverview';
import FlowSteps from './components/FlowSteps';
import TabsOverviewSection from './components/TabsOverviewSection';
import ProTipsSection from './components/ProTipsSection';
import FlowDiagram from './components/FlowDiagram/index';

const AdminPanelInteractiveGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <GuideHeader />

        {/* Stats Overview */}
        <StatsOverview />

        {/* Flow Steps */}
        <FlowSteps />

        {/* Tabs Overview */}
        <TabsOverviewSection />

        {/* Pro Tips */}
        <ProTipsSection />
      </div>

      {/* Flow Diagram Section */}
      <FlowDiagram />
    </div>
  );
};

export default AdminPanelInteractiveGuide;

