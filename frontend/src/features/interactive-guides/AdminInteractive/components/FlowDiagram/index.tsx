import React from 'react';
import FlowDiagramHeader from './FlowDiagramHeader';
import FlowDiagramTabs from './FlowDiagramTabs';
import FlowDiagramTabsContinued from './FlowDiagramTabsContinued';
import FlowDiagramFeatures from './FlowDiagramFeatures';
import FlowDiagramFooter from './FlowDiagramFooter';

const FlowDiagram: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-8">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Administration Panel Flow Diagram
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Complete Admin Workflow - Box-Arrow Structure for Visio
        </p>

        <div className="space-y-6">
          <FlowDiagramHeader />
          <FlowDiagramTabs />
          <FlowDiagramTabsContinued />
          <FlowDiagramFeatures />
          <FlowDiagramFooter />
        </div>
      </div>
    </div>
  );
};

export default FlowDiagram;

