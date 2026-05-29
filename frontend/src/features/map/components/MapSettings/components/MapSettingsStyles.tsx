import React from 'react';

const MapSettingsStyles: React.FC = () => (
  <style>{`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideDown {
      from { transform: translateY(-10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }
    .animate-slideUp {
      animation: slideUp 0.3s ease-out;
    }
    .animate-slideDown {
      animation: slideDown 0.3s ease-out;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #3B82F6;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #2563EB;
    }
    input[type="range"]::-webkit-slider-thumb {
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
      border: 2px solid white;
    }
    input[type="range"]::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
      border: 2px solid white;
    }
  `}</style>
);

export default MapSettingsStyles;

