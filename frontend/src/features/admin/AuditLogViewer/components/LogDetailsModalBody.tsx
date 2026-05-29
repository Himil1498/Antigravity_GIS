/**
 * Log Details Modal Body Component
 * Composes all content sections of the modal body
 */

import React from 'react';
import type { AuditLogEntry } from '../../../../types/audit.types';
import LogDetailsStatusBanner from './LogDetailsStatusBanner';
import LogDetailsInfoGrid from './LogDetailsInfoGrid';
import LogDetailsUserInfo from './LogDetailsUserInfo';
import LogDetailsAdditionalDetails from './LogDetailsAdditionalDetails';

interface LogDetailsModalBodyProps {
  log: AuditLogEntry;
}

const LogDetailsModalBody: React.FC<LogDetailsModalBodyProps> = ({ log }) => {
  return (
    <div className="overflow-y-auto p-4 space-y-4">
      <LogDetailsStatusBanner log={log} />
      <LogDetailsInfoGrid log={log} />
      <LogDetailsUserInfo log={log} />
      <LogDetailsAdditionalDetails details={log.details} />
    </div>
  );
};

export default LogDetailsModalBody;

