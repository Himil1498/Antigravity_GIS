/**
 * Info Window Content Generators
 * Pure functions that generate HTML content for Google Maps InfoWindows
 */

import { formatDistance } from "./distanceUtils";
import { ElevationDataPoint } from "../types/distanceTypes";

/**
 * Generates HTML content for the high point info window
 */
export const createHighPointInfoContent = (
  elevation: number,
  distance: number
): string => {
  return `<div style="padding: 10px; font-family: system-ui;">
    <div style="color: #10b981; font-weight: bold; font-size: 14px; margin-bottom: 4px;">⛰️ HIGHEST POINT</div>
    <div style="font-size: 16px; font-weight: bold; margin-bottom: 4px;">${elevation.toFixed(
      1
    )} m</div>
    <div style="color: #666; font-size: 12px;">${formatDistance(
      distance
    )} from start</div>
  </div>`;
};

/**
 * Generates HTML content for the low point info window
 */
export const createLowPointInfoContent = (
  elevation: number,
  distance: number
): string => {
  return `<div style="padding: 10px; font-family: system-ui;">
    <div style="color: #3b82f6; font-weight: bold; font-size: 14px; margin-bottom: 4px;">🏞️ LOWEST POINT</div>
    <div style="font-size: 16px; font-weight: bold; margin-bottom: 4px;">${elevation.toFixed(
      1
    )} m</div>
    <div style="color: #666; font-size: 12px;">${formatDistance(
      distance
    )} from start</div>
  </div>`;
};

/**
 * Generates HTML content for the hover info window
 */
export const createHoverInfoContent = (dataPoint: ElevationDataPoint): string => {
  return `<div style="padding: 10px; min-width: 160px; font-family: system-ui;">
    <div style="color: #f59e0b; font-weight: bold; font-size: 13px; margin-bottom: 6px;">📍 Hover Location</div>
    <div style="font-size: 15px; font-weight: bold; margin-bottom: 2px;">Elevation: ${dataPoint.elevation.toFixed(
      1
    )} m</div>
    <div style="color: #666; font-size: 12px; margin-bottom: 4px;">Distance: ${formatDistance(
      dataPoint.distance
    )}</div>
    <div style="color: #999; font-size: 11px; border-top: 1px solid #eee; padding-top: 4px; margin-top: 4px;">
      ${dataPoint.location.lat.toFixed(6)}, ${dataPoint.location.lng.toFixed(6)}
    </div>
  </div>`;
};

/**
 * Generates HTML content for the pinned point info window
 */
export const createPinnedInfoContent = (
  dataPoint: ElevationDataPoint,
  minElev: number | undefined,
  maxElev: number | undefined
): string => {
  const elevationDiff =
    minElev !== undefined ? dataPoint.elevation - minElev : 0;
  const elevationFromMax =
    maxElev !== undefined ? maxElev - dataPoint.elevation : 0;

  return `<div style="padding: 14px; min-width: 220px; font-family: system-ui; background: linear-gradient(to bottom, #f0fdf4 0%, #ffffff 100%);">
    <div style="color: #10b981; font-weight: bold; font-size: 15px; margin-bottom: 10px; display: flex; align-items: center; border-bottom: 2px solid #10b981; padding-bottom: 8px;">
      <span style="font-size: 20px; margin-right: 8px;">📍</span> Elevation Point
    </div>
    <div style="font-size: 18px; font-weight: bold; margin-bottom: 6px; color: #059669; display: flex; align-items: center;">
      <span style="font-size: 24px; margin-right: 6px;">⛰️</span> ${dataPoint.elevation.toFixed(
        1
      )} m
    </div>
    <div style="color: #666; font-size: 13px; margin-bottom: 4px; display: flex; align-items: center;">
      <span style="margin-right: 6px;">📏</span> Distance: ${formatDistance(
        dataPoint.distance
      )}
    </div>
    ${
      minElev !== undefined
        ? `
      <div style="color: #6366f1; font-size: 12px; margin-bottom: 4px;">
        🔼 ${elevationDiff.toFixed(1)}m above lowest point
      </div>
    `
        : ""
    }
    ${
      maxElev !== undefined
        ? `
      <div style="color: #dc2626; font-size: 12px; margin-bottom: 4px;">
        🔽 ${elevationFromMax.toFixed(1)}m below highest point
      </div>
    `
        : ""
    }
    <div style="color: #999; font-size: 11px; border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px; display: flex; align-items: center;">
      <span style="margin-right: 4px;">📌</span> ${dataPoint.location.lat.toFixed(
        6
      )}, ${dataPoint.location.lng.toFixed(6)}
    </div>
    <div style="color: #10b981; font-size: 10px; margin-top: 10px; font-style: italic; text-align: center; background: #f0fdf4; padding: 6px; border-radius: 4px;">
      💡 Click chart again to move pin
    </div>
  </div>`;
};

