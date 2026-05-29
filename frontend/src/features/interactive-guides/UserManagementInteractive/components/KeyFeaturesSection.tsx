import React from 'react';
import { keyFeatures } from '../constants';

const KeyFeaturesSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">
        ✨ Key Features
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {keyFeatures.map((feature, idx) => (
          <div key={idx} className="bg-white bg-opacity-10 p-4 rounded-lg">
            <h3 className="font-bold mb-2">{feature.title}</h3>
            <ul className="text-sm space-y-1">
              {feature.items.map((item, itemIdx) => (
                <li key={itemIdx}>• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyFeaturesSection;

