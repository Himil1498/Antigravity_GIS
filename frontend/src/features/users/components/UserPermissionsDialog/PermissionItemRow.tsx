import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface PermissionItemRowProps {
  code: string;
  label: string;
  description: string;
  indent: boolean;
  isSelected: boolean;
  isGroup: boolean;
  onToggle: () => void;
  globalShowDetails: boolean;
}

export const PermissionItemRow: React.FC<PermissionItemRowProps> = ({
  code,
  label,
  description,
  indent,
  isSelected,
  isGroup,
  onToggle,
  globalShowDetails,
}) => {
  const [localShowDetails, setLocalShowDetails] = useState(false);

  const showDetails = globalShowDetails || localShowDetails;

  return (
    <div
      className={`pg-item-row ${indent ? "indent" : ""} ${isSelected ? "selected" : ""}`}
    >
      <div className="pg-item-header">
        <label
          htmlFor={`perm-${code}`}
          className="pg-checkbox-wrapper"
        >
          <input
            id={`perm-${code}`}
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className="pg-checkbox-input"
          />
          <div className={`pg-checkbox-visual ${isSelected ? "checked" : ""}`}>
            {isSelected && (
              <svg
                className="pg-checkbox-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </label>

        <div className="pg-item-body">
          <div className="pg-item-label-group">
            <label
              htmlFor={`perm-${code}`}
              className={`pg-item-label ${isSelected ? "selected" : ""}`}
            >
              {label}
            </label>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setLocalShowDetails(!localShowDetails);
              }}
              className={`pg-doc-toggle-btn ${showDetails ? "active" : ""}`}
              title="Toggle Description"
            >
              <svg
                className="pg-doc-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showDetails ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
            </button>
          </div>

          <div className="pg-badge-group">
            {isGroup && (
              <span className="pg-badge pg-badge-inherited">Inherited</span>
            )}
            {!isGroup && isSelected && (
              <span className="pg-badge pg-badge-direct">Direct</span>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pg-doc-panel-container"
            style={{ overflow: "hidden" }}
          >
            <div className="pg-doc-panel">
              <div className="pg-doc-panel-inner">
                <div className="pg-doc-panel-icon">
                  <svg className="pg-doc-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="pg-doc-panel-title">
                    System Permission: <code className="pg-doc-panel-code">{code}</code>
                  </h4>
                  <p className="pg-doc-panel-desc">{description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
