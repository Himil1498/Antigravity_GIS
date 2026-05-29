import React from 'react';
import ForgotPasswordForm from './ForgotPasswordForm';
import ForgotPasswordSuccess from './ForgotPasswordSuccess';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  username: string;
  onUsernameChange: (val: string) => void;
  reason: string;
  onReasonChange: (val: string) => void;
  requestSent: boolean;
  isSending: boolean;
  error: string;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  username,
  onUsernameChange,
  reason,
  onReasonChange,
  requestSent,
  isSending,
  error
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-0">
      {/* Background overlay */}
      <div
        className="fixed inset-0 transition-opacity bg-gray-900/75 dark:bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal panel */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl text-left overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transform transition-all w-full max-w-lg">
        {!requestSent ? (
            <ForgotPasswordForm
              onSubmit={onSubmit}
              onClose={onClose}
              username={username}
              onUsernameChange={onUsernameChange}
              reason={reason}
              onReasonChange={onReasonChange}
              isSending={isSending}
              error={error}
            />
          ) : (
            <ForgotPasswordSuccess
              onClose={onClose}
              username={username}
            />
          )}
        </div>
    </div>
  );
};

export default ForgotPasswordModal;

