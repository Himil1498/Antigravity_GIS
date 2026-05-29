import React, { useState } from 'react';
import { GuideHeader, StepsList, ProTipsFooter } from './SectionComponents';

const LayersInteractiveGuide: React.FC = () => {
  const [showDetails, setShowDetails] = useState<number | null>(null);

  return (
    <div className="p-8">
      <GuideHeader />
      <StepsList showDetails={showDetails} setShowDetails={setShowDetails} />
      <ProTipsFooter />
    </div>
  );
};

export default LayersInteractiveGuide;

