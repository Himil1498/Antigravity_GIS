/**
 * TemporaryAccessManagement - Utility Functions
 */

import React from "react";
import type { TemporaryRegionAccess } from "../types/types";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

export const formatDate = (date: Date) => {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const isExpiringSoon = (grant: TemporaryRegionAccess) => {
  if (grant.revokedAt || !grant.isActive) return false;
  const now = new Date();
  const daysUntilExpiry = Math.floor(
    (grant.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
};

export const getStatusBadge = (grant: TemporaryRegionAccess) => {
  const now = new Date();

  if (grant.revokedAt) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
        <XCircleIcon className="h-4 w-4 mr-1" />
        Revoked
      </span>
    );
  }

  if (grant.expiresAt < now) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
        <ClockIcon className="h-4 w-4 mr-1" />
        Expired
      </span>
    );
  }

  if (grant.isActive) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
        <CheckCircleIcon className="h-4 w-4 mr-1" />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
      Inactive
    </span>
  );
};

