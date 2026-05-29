import React, { useState } from "react";
import { Navigate } from "react-router-dom";

const ToolsPage: React.FC = () => {
  // Always open on the dedicated tools page
  const [isOpen, setIsOpen] = useState(true);

  // If user explicitly closes the full screen modal, we can redirect them back to the dashboard or network tab
  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-[1600px] mx-auto w-full">
        <div className="text-center max-w-lg mb-8 mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">GIS Tools</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Powerful standalone conversion and processing modules for your network data.
          </p>
        </div>
      </div>

    </div>
  );
};

export default ToolsPage;
