/**
 * Log Details Modal Component
 * Shows detailed view of a single audit log entry
 */

import React from 'react';
import type { AuditLogEntry } from '../../../../types/audit.types';
import LogDetailsModalHeader from './LogDetailsModalHeader';
import LogDetailsModalBody from './LogDetailsModalBody';

interface LogDetailsModalProps {
  log: AuditLogEntry | null;
  onClose: () => void;
}

const LogDetailsModal: React.FC<LogDetailsModalProps> = ({ log, onClose }) => {
  if (!log) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <LogDetailsModalHeader logId={log.id} onClose={onClose} />

        {/* Modal Body */}
        <LogDetailsModalBody log={log} />


      </div>
    </div>
  );
};

export default LogDetailsModal;

