import React from 'react';

const QuickFlowSummary: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-6 mt-8 text-white">
      <h2 className="text-xl font-bold mb-4 text-center">
        ⚡ Quick Flow Summary
      </h2>
      <div className="bg-gray-900 bg-opacity-50 rounded-lg p-6">
        <div className="space-y-3 text-sm">
          <p>
            1️⃣ Access Page → 2️⃣ Search/Filter (optional) → 3️⃣ View Breakdown
          </p>
          <p>
            4️⃣ Select Users → 5️⃣ Bulk Operations (or individual actions)
          </p>
          <p>6️⃣ View Details → 7️⃣ Add New User (4-section form)</p>
          <p>8️⃣ Validate → 9️⃣ Save → Verification email sent</p>
          <p>
            🔟 Edit User → 1️⃣1️⃣ Email Verification → 1️⃣2️⃣ Password
            Management
          </p>
          <p>1️⃣3️⃣ Manage Permissions → 1️⃣4️⃣ Delete (with confirmation)</p>
          <div className="border-t border-purple-400 pt-3 mt-3">
            <p className="text-purple-100">
              👥 4 Roles | 🎯 7 Row Actions | 📦 3 Bulk Operations
            </p>
            <p className="text-purple-100">
              🌍 36 Regions | 📝 Complete Audit Trail | 🔐 Role-Based Access
            </p>
            <p className="text-purple-100">
              📧 Email Verification | 🔑 Password Management | ⏱️ Temporary
              Access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickFlowSummary;

