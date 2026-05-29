import React from 'react';
import FlowDiagramHeader from './FlowDiagramHeader';
import FlowDiagramSections from './FlowDiagramSections';
import FlowDiagramSectionsContinued from './FlowDiagramSectionsContinued';
import FlowDiagramFooter from './FlowDiagramFooter';

const FlowDiagram: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Analytics Dashboard Flow Diagram
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Frontend Features Only - Box-Arrow Structure for Visio
          </p>
        </div>

        {/* Flow Diagram */}
        <div className="flex flex-col items-center space-y-0">
          <FlowDiagramHeader />
          <FlowDiagramSections />
          <FlowDiagramSectionsContinued />
          <FlowDiagramFooter />
        </div>
      </div>
    </div>
  );
};

export default FlowDiagram;

