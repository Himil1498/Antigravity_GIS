import React from 'react';
import { User } from '../../../../types/auth/index';
import { getAvatarColor, getInitials, getRoleBadgeColor } from '../../utils/UserDetailModalUtils';

interface UserDetailModalHeaderProps {
  user: User;
  onClose: () => void;
}

const UserDetailModalHeader: React.FC<UserDetailModalHeaderProps> = ({ user, onClose }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
        aria-label="Close modal"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className={`w-20 h-20 rounded-2xl ${getAvatarColor(
              user.name
            )} flex items-center justify-center text-white font-bold text-2xl shadow-xl`}
          >
            {getInitials(user.name)}
          </div>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-lg">
            <span className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></span>
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-1">{user.name}</h3>
          <span
            className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(
              user.role
            )} shadow-lg`}
          >
            {user.role}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModalHeader;

