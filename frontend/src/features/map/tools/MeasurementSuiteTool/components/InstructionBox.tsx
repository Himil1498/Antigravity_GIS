import React from "react";

interface InstructionBoxProps {
  isPlacingCenter: boolean;
}

const InstructionBox: React.FC<InstructionBoxProps> = ({ isPlacingCenter }) => {
  return (
    <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <p className="text-sm text-blue-800 dark:text-blue-200">
        {isPlacingCenter
          ? "📍 Click on the map to place the circle center."
          : "📍 Drag the circle or center marker to reposition. Drag the circle edge to resize."}
      </p>
    </div>
  );
};

export default InstructionBox;

