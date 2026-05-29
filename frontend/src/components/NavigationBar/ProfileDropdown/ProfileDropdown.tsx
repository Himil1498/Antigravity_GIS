import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileDropdownProps } from "./types";
import { calculateSessionInfo } from "./sessionUtils";
import ProfileAvatar from "./ProfileAvatar";
import ProfileHeader from "./ProfileHeader";
import MenuItems from "./MenuItems";
import TemporaryAccessSection from "./TemporaryAccessSection";
import PermanentRegionsSection from "./PermanentRegionsSection";
import LogoutButton from "./LogoutButton";

const ProfileDropdownMain: React.FC<ProfileDropdownProps> = ({
  user,
  isOpen,
  onToggle,
  onClose,
  dropdownRef,
  temporaryAccessCount,
  tempAccessGrants,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [sessionInfo, setSessionInfo] = useState(calculateSessionInfo(user));

  useEffect(() => {
    if (!isOpen) return;

    const updateSessionInfo = () => {
      setSessionInfo(calculateSessionInfo(user));
    };

    updateSessionInfo();
    const interval = setInterval(updateSessionInfo, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleProfileNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
    navigate("/profile");
  };

  const handleLogoutClick = () => {
    onClose();
    onLogout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <ProfileAvatar
        user={user}
        isOpen={isOpen}
        temporaryAccessCount={temporaryAccessCount}
        onToggle={onToggle}
      />

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-[70vh] rounded-xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 backdrop-blur-lg animate-in fade-in slide-in-from-top-2 duration-200 z-50 flex flex-col overflow-hidden">
          
          <div className="overflow-y-auto flex-1 custom-scrollbar">
              <ProfileHeader user={user} temporaryAccessCount={temporaryAccessCount} />
    
              <MenuItems user={user} onClose={onClose} onProfileNavigation={handleProfileNavigation} />
    
              <TemporaryAccessSection tempAccessGrants={tempAccessGrants} />
    
              <PermanentRegionsSection user={user} tempAccessGrants={tempAccessGrants} />
          </div>

          <div className="flex-shrink-0 bg-white dark:bg-gray-800 z-10">
              <LogoutButton onLogout={handleLogoutClick} />
          </div>
        </div>
      )}
      <ScrollStyle />
    </div>
  );
};

export default ProfileDropdownMain;

// Add scrollbar styles if not globally available
// We can move this to global css later
const ScrollStyle = () => (
    <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 3px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
    `}</style>
);

