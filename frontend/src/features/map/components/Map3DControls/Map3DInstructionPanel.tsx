import React from 'react';

const Map3DInstructionPanel: React.FC = () => {
  return (
    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
      <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-2">
        💡 Navigation Tips
      </h4>
      <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
        <li>
          • <strong>Drag:</strong> Pan the map
        </li>
        <li>
          • <strong>Scroll:</strong> Zoom in/out
        </li>
        <li>
          • <strong>Right-click + Drag:</strong> Rotate & tilt
        </li>
        <li>
          • <strong>Ctrl + Drag:</strong> Adjust tilt angle
        </li>
      </ul>
    </div>
  );
};

export default Map3DInstructionPanel;

