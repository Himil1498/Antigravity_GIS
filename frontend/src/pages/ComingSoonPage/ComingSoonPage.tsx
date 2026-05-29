import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";

/**
 * Generic Coming Soon Page
 * Displays a placeholder for features that are under development.
 * Accepts a 'feature' query parameter to customize the message.
 */
const ComingSoonPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const featureName = searchParams.get("feature") || "This Feature";

  useEffect(() => {
    document.title = `${featureName} - Coming Soon | OptiConnect GIS`;
  }, [featureName]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 ring-8 ring-blue-50 dark:ring-blue-900/10">
          <Construction className="w-12 h-12 text-blue-600 dark:text-blue-400" />
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Coming Soon
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
            {featureName} is currently under development.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            We are working hard to bring you this feature. Stay tuned for
            updates in future releases.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;
