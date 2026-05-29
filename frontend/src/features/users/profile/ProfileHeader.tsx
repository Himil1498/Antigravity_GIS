import React from "react";
import type { User } from "../../../types/auth/index";
import { getUserDisplayName, getRoleDisplay, getStatusDisplay } from "./profileHelpers";

interface ProfileHeaderProps {
  profileData: User | null;
  loading: boolean;
  onRefresh: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileData,
  loading,
  onRefresh
}) => {
  return (
    <div className="mb-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 shadow-2xl">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}
        />

        <div className="relative px-8 py-12">
          <div className="flex items-start justify-between flex-col md:flex-row gap-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center text-2xl font-bold text-blue-600">
                {getUserDisplayName(profileData).charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">
                  {getUserDisplayName(profileData)}
                </h1>
                <p className="text-blue-100 mt-1">
                  @{profileData?.username || "user"}
                </p>
                <div className="flex items-center space-x-3 mt-3 flex-wrap gap-2">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white bg-opacity-20 text-white text-sm font-semibold backdrop-blur-sm border border-white border-opacity-30">
                    <span
                      className={`w-2 h-2 ${
                        getStatusDisplay(profileData) === "Active"
                          ? "bg-green-400"
                          : "bg-red-400"
                      } rounded-full mr-2`}
                    ></span>
                    {getStatusDisplay(profileData)}
                  </span>
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white bg-opacity-10 text-blue-100 text-sm font-semibold backdrop-blur-sm border border-white border-opacity-20">
                    {getRoleDisplay(profileData)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onRefresh}
                disabled={loading}
                className="inline-flex items-center px-6 py-2.5 rounded-lg bg-white hover:bg-blue-50 text-blue-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className={`w-4 h-4 mr-2 ${
                    loading ? "animate-spin" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;

