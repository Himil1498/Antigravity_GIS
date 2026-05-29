/**
 * Boundary style controls component
 * Handles color selection, opacity sliders, and preview
 */

import React from 'react';
import type { BoundarySettings } from '../types';
import { PRESET_COLORS } from '../constants';

interface BoundaryStyleControlsProps {
  localSettings: BoundarySettings;
  setLocalSettings: (settings: BoundarySettings) => void;
}

const BoundaryStyleControls: React.FC<BoundaryStyleControlsProps> = ({
  localSettings,
  setLocalSettings,
}) => {
  return (
    <>
      {/* Color Picker with Enhanced Grid */}
      <div
        className={`transition-all duration-200 ${
          localSettings.enabled ? '' : 'opacity-50 pointer-events-none'
        }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
            Boundary Color
          </label>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() =>
                  setLocalSettings({
                    ...localSettings,
                    color: color.value,
                  })
                }
                className={`group relative h-14 rounded-xl overflow-hidden transition-all ${
                  localSettings.color === color.value
                    ? 'ring-4 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800 scale-105'
                    : 'hover:scale-105 ring-2 ring-gray-200 dark:ring-gray-600'
                }`}
                title={color.name}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${color.gradient}`}
                ></div>
                {localSettings.color === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Custom Color:
            </label>
            <input
              type="color"
              value={localSettings.color}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  color: e.target.value,
                })
              }
              aria-label="Custom boundary color"
              className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700">
              {localSettings.color}
            </span>
          </div>
        </div>
      </div>

      {/* Opacity Slider with Enhanced Styling */}
      <div
        className={`transition-all duration-200 ${
          localSettings.enabled ? '' : 'opacity-50 pointer-events-none'
        }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-900 dark:text-white">
              Normal Opacity
            </label>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(localSettings.opacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={localSettings.opacity * 100}
            onChange={(e) =>
              setLocalSettings({
                ...localSettings,
                opacity: parseInt(e.target.value) / 100,
              })
            }
            aria-label="Normal boundary opacity"
            className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>Transparent</span>
            <span>Opaque</span>
          </div>

          {/* Preview */}
          <div className="mt-4 h-20 rounded-xl border-2 border-gray-300 dark:border-gray-600 relative overflow-hidden shadow-inner">
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: localSettings.color,
                opacity: localSettings.opacity,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold text-white bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                Normal View Preview
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dim When Tool Active */}
      <div
        className={`transition-all duration-200 ${
          localSettings.enabled ? '' : 'opacity-50 pointer-events-none'
        }`}
      >
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={localSettings.dimWhenToolActive}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  dimWhenToolActive: e.target.checked,
                })
              }
              aria-label="Auto-dim boundaries when tool active"
              className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <label className="text-sm font-semibold text-gray-900 dark:text-white">
                Auto-Dim When Tool Active
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Automatically reduce boundary opacity when using GIS tools to
                minimize distraction
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dimmed Opacity Slider */}
      {localSettings.enabled && localSettings.dimWhenToolActive && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 animate-slideDown">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-900 dark:text-white">
              Dimmed Opacity (Tool Active)
            </label>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(localSettings.dimmedOpacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={localSettings.dimmedOpacity * 100}
            onChange={(e) =>
              setLocalSettings({
                ...localSettings,
                dimmedOpacity: parseInt(e.target.value) / 100,
              })
            }
            aria-label="Dimmed boundary opacity when tool is active"
            className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>Hidden</span>
            <span>Subtle</span>
          </div>

          {/* Dimmed Preview */}
          <div className="mt-4 h-20 rounded-xl border-2 border-gray-300 dark:border-gray-600 relative overflow-hidden shadow-inner">
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: localSettings.color,
                opacity: localSettings.dimmedOpacity,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold text-white bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                Dimmed View Preview
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BoundaryStyleControls;

