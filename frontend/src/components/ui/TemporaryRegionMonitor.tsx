import React from 'react';
import { useTemporaryRegionMonitor } from '../../hooks/useTemporaryRegionMonitor';

// Component to handle temporary region monitoring
const TemporaryRegionMonitor: React.FC = () => {
  // Check every 30 seconds (adjust as needed)
  // For testing, you can use a shorter interval like 10000 (10 seconds)
  useTemporaryRegionMonitor(30000);
  return null;
};

export default TemporaryRegionMonitor;

