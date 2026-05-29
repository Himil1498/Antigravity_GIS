import React from 'react';
import { bulkOperations } from '../constants';

const BulkOperationsSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">
        📦 Bulk Operations (3 Actions)
      </h2>
      <div className="space-y-4">
        {bulkOperations.map((op, idx) => (
          <div key={idx} className="bg-white bg-opacity-10 p-4 rounded-lg">
            <div className="flex items-start gap-3 mb-2">
              <span className="text-3xl">{op.icon}</span>
              <div>
                <p className="font-bold text-lg">{op.name}</p>
                <p className="text-sm text-white/90 mt-1">{op.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BulkOperationsSection;

