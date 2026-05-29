import React, { useState } from 'react';
import { steps } from '../constants';
import FlowStepCard from './FlowStepCard';

const FlowSteps: React.FC = () => {
  const [showDetails, setShowDetails] = useState<number | null>(null);

  const handleToggle = (stepId: number) => {
    setShowDetails(showDetails === stepId ? null : stepId);
  };

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <FlowStepCard
          key={step.id}
          step={step}
          isExpanded={showDetails === step.id}
          onToggle={() => handleToggle(step.id)}
          isLast={index === steps.length - 1}
        />
      ))}
    </div>
  );
};

export default FlowSteps;

