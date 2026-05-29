import React from 'react';
import { GuideHeader, FlowSteps, ProTipsFooter } from './SectionComponents';

const GlobalSearchInteractive: React.FC = () => {
  return (
    <div className="p-8">
      {/* Header */}
      <GuideHeader />

      {/* Steps Grid */}
      <FlowSteps />

      {/* Footer Info */}
      <ProTipsFooter />
    </div>
  );
};

export default GlobalSearchInteractive;

