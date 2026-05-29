import React, { useEffect, useState, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "../store/index";
import { updateUser } from "../store/slices/authSlice";
import { getCurrentUserProfile } from "../services/api/index";
import type { User } from "../types/auth/index";
import ProfileHeader from "../features/users/profile/ProfileHeader";
import ProfileStats from "../features/users/profile/ProfileStats";
import ProfileOverviewTab from "../features/users/profile/ProfileOverviewTab";
import ProfileContactTab from "../features/users/profile/ProfileContactTab";
import ProfileWorkTab from "../features/users/profile/ProfileWorkTab";
import ProfileSecurityTab from "../features/users/profile/ProfileSecurityTab";
import ProfileSidebar from "../features/users/profile/ProfileSidebar";

const UserProfile: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<User | null>(user);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  // Sync profileData with user from Redux first (immediate render)
  useEffect(() => {
    if (user) {
      setProfileData(user);
    }
  }, [user]);

  // Fetch fresh profile data from backend on mount
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      try {
        // Only show loading spinner if no cached data
        if (!user) {
          setLoading(true);
        }
        setError(null);

        const freshData = await getCurrentUserProfile();

        if (!cancelled) {
          setProfileData(freshData);
          // Update Redux store with fresh data
          dispatch(updateUser(freshData));
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("❌ Failed to load profile:", err);
          setError(err.message || "Failed to load profile");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    // Always fetch fresh data on mount to get latest 2FA status, etc.
    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, dispatch]); // Removed 'user' from dependencies to always refresh

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setRefreshSuccess(false);

      const freshData = await getCurrentUserProfile();

      // ✅ VALIDATE DATA BEFORE SETTING - Prevent blank page
      if (!freshData || !freshData.id || !freshData.email) {
        throw new Error("Invalid profile data received from server");
      }

      setProfileData(freshData);
      dispatch(updateUser(freshData));
      setRefreshSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setRefreshSuccess(false), 3000);
    } catch (err: any) {
      console.error("❌ Failed to refresh profile:", err);
      setError(err.message || "Failed to refresh profile");
      // ⭐ KEY: Keep showing cached data on error - don't blank the page
      // profileData is NOT cleared, so user still sees their information
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Loading state
  if (loading && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state (no profile data)
  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <svg
              className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Failed to Load Profile
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || "Unknown error"}
            </p>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main profile view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 pb-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <ProfileHeader
          profileData={profileData}
          loading={loading}
          onRefresh={handleRefresh}
        />

        {/* Quick Stats */}
        <ProfileStats profileData={profileData} />

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-yellow-700 dark:text-yellow-300 text-sm">
                {error} (Showing cached data)
              </span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {refreshSuccess && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 animate-fade-in">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-green-500 dark:text-green-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-green-700 dark:text-green-300 text-sm font-medium">
                Profile data refreshed successfully!
              </span>
            </div>
          </div>
        )}

        {/* Content Sections - All in One View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <ProfileOverviewTab profileData={profileData} />
            <ProfileContactTab profileData={profileData} />
            <ProfileWorkTab profileData={profileData} />
            <ProfileSecurityTab profileData={profileData} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
             <ProfileSidebar profileData={profileData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;


