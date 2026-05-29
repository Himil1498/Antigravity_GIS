import React from 'react';
import { proTips } from '../constants';

const ProTipsSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-8 mt-8 mb-8 text-white">
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

export default ProTipsSection;

