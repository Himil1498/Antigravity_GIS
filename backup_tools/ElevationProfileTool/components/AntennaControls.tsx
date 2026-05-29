import React from "react";

interface AntennaControlsProps {
  antennaHeight1: number;
  setAntennaHeight1: (height: number) => void;
  antennaHeight2: number;
  setAntennaHeight2: (height: number) => void;
  rfFrequency: number;
  setRfFrequency: (freq: number) => void;
}

const AntennaControls: React.FC<AntennaControlsProps> = ({
  antennaHeight1,
  setAntennaHeight1,
  antennaHeight2,
  setAntennaHeight2,
  rfFrequency,
  setRfFrequency
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 mb-3">
      <div>
        <label
          htmlFor="antenna-height-1"
          className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1"
        >
          Start Antenna (m)
        </label>
        <input
          id="antenna-height-1"
          type="number"
          value={antennaHeight1}
          onChange={(e) =>
            setAntennaHeight1(parseFloat(e.target.value) || 30)
          }
          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          min="1"
          max="100"
          aria-label="Start antenna height in meters"
        />
      </div>
      <div>
        <label
          htmlFor="antenna-height-2"
          className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1"
        >
          End Antenna (m)
        </label>
        <input
          id="antenna-height-2"
          type="number"
          value={antennaHeight2}
          onChange={(e) =>
            setAntennaHeight2(parseFloat(e.target.value) || 30)
          }
          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          min="1"
          max="100"
          aria-label="End antenna height in meters"
        />
      </div>
      <div>
        <label
          htmlFor="rf-frequency"
          className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1"
        >
          Frequency (MHz)
        </label>
        <select
          id="rf-frequency"
          value={rfFrequency}
          onChange={(e) =>
            setRfFrequency(parseFloat(e.target.value))
          }
          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          aria-label="RF frequency in megahertz"
        >
          <option value="900">900 MHz</option>
          <option value="1800">1800 MHz</option>
          <option value="2400">2.4 GHz</option>
          <option value="5800">5.8 GHz</option>
        </select>
      </div>
    </div>
  );
};

export default AntennaControls;

