import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useAppSelector } from "../../store/index";
import { getAllNavigationItems, NavigationItem } from "./navigationConfig";
import { useTemporaryAccess } from "./useTemporaryAccess";
import { useScrollNav } from "../../hooks/useScrollNav";
import { useLogo } from "../../contexts/LogoContext";

// Extracted Components
import DesktopNavigation from "./DesktopNavigation";
import MobileMenuButton from "./MobileMenuButton";
import ProfileDropdown from "./ProfileDropdown/index";
import MobileMenu from "./MobileMenu";
import NavbarActions from "./NavbarActions";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface NavigationBarProps {
  onOpenUpdates?: () => void;
}

/**
 * NavigationBar - Main application navigation component
 * Features: responsive design, dark mode, scrollable nav, mobile menu
 */
const NavigationBar: React.FC<NavigationBarProps> = ({ onOpenUpdates }) => {
  // Hooks
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const { logoPath } = useLogo();

  // State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const { temporaryAccessCount, tempAccessGrants } = useTemporaryAccess({
    userId: user?.id?.toString(),
    isAuthenticated,
  });
  const { navScrollRef, showScrollButtons } = useScrollNav();

  // Memoized navigation items filtered by user role AND permissions
  const navigation = useMemo(() => {
    if (!user) return [];
    const allNavigation = getAllNavigationItems();
    const userRoleLower = (user.role || "").toLowerCase();

    return allNavigation.filter((item: NavigationItem) => {
      // 1. Permission Check (Priority)
      if (item.requiredPermission) {
        // Check for "all" wildcard
        if (
          user.directPermissions?.includes("all") ||
          user.permissions?.includes("all" as any) ||
          user.directPermissions?.includes("*") ||
          user.permissions?.includes("*" as any)
        ) {
          return true;
        }

        // Check specific permission in directPermissions or permissions (legacy)
        const hasDirectPermission = user.directPermissions?.includes(
          item.requiredPermission,
        );
        const hasLegacyPermission = user.permissions?.includes(
          item.requiredPermission as any,
        );

        if (hasDirectPermission || hasLegacyPermission) return true;

        // Admin fallback
        if (user.role && user.role.toLowerCase() === "admin") return true;

        return false;
      }

      // 2. Role Check (Fallback for items without specific permission)
      const itemRolesLower = item.roles.map((r: string) => r.toLowerCase());
      return itemRolesLower.includes(userRoleLower);
    });
  }, [user]);

  const { activeGISTool } = useAppSelector((state) => state.map);

  // Check if current route is active
  const isActive = useCallback(
    (href: string) => {
      if (href === "/") return location.pathname === "/";
      return location.pathname.startsWith(href);
    },
    [location.pathname],
  );

  // Handlers
  const handleLogout = useCallback(() => {
    setShowProfileDropdown(false);
    logout();
    navigate("/login");
  }, [logout, navigate]);

  const toggleProfileDropdown = useCallback(() => {
    setShowProfileDropdown((prev) => !prev);
  }, []);

  const closeProfileDropdown = useCallback(() => {
    setShowProfileDropdown(false);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!showProfileDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileDropdown]);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 z-50">
      <div className="w-full px-4">
        <div className="flex items-center h-14 sm:h-16 justify-between gap-2">
          
          {/* Left Section: Logo & Primary Nav */}
          <div className="flex items-center min-w-0 flex-1 gap-2">
            {/* Logo */}
            <div 
              className="flex items-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity relative z-20 w-32 mr-4"
              onClick={() => navigate("/map")}
            >
              <img
                src={logoPath}
                alt="OptiConnect GIS"
                className="h-12 w-auto object-contain scale-[3.2] origin-left dark:brightness-0 dark:invert"
                style={{ pointerEvents: 'none' }}
              />
            </div>

            {/* Desktop Navigation - Will scroll if space is tight */}
            <DesktopNavigation
              navigation={navigation}
              isActive={isActive}
              navScrollRef={navScrollRef}
              showScrollButtons={showScrollButtons}
            />
          </div>

          {/* Right Section: Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Mobile Menu Button */}
            <MobileMenuButton
              isOpen={isMobileMenuOpen}
              onClick={toggleMobileMenu}
            />

            {/* Actions Dock (Updates, Theme, etc) */}
            <NavbarActions
              isDarkMode={isDarkMode}
              onToggleDarkMode={toggleDarkMode}
              onOpenUpdates={onOpenUpdates}
            />

            {/* Profile Dropdown */}
            <ProfileDropdown
              user={user}
              isOpen={showProfileDropdown}
              onToggle={toggleProfileDropdown}
              onClose={closeProfileDropdown}
              dropdownRef={profileDropdownRef}
              temporaryAccessCount={temporaryAccessCount}
              tempAccessGrants={tempAccessGrants}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        navigation={navigation}
        isActive={isActive}
        onClose={closeMobileMenu}
      />
    </nav>
  );
};

export default NavigationBar; 