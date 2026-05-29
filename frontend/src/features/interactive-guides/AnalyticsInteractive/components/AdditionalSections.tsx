import React from 'react';
import { useCases, proTips } from '../data/index';

// Use Cases Section
export const UseCasesSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">
        🎯 Common Use Cases
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {useCases.map((useCase, idx) => (
          <div key={idx} className="bg-white bg-opacity-10 p-4 rounded-lg">
            <h3 className="font-bold mb-2">{useCase.title}</h3>
            <p className="text-sm">{useCase.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Pro Tips Section
export const ProTipsSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl p-8 mt-8 mb-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">💡 Pro Tips</h2>
      <div className="space-y-3">
        {proTips.map((tip, idx) => (
          <div key={idx} className="bg-white bg-opacity-10 p-4 rounded-lg">
            <p className="font-bold mb-1">{tip.title}</p>
            <p className="text-sm">{tip.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

