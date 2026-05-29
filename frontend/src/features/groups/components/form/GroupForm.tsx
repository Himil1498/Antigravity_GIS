import React from "react";
import { GroupFormProps, TabType } from '../../types/form.types';
import { useGroupForm } from '../../hooks/useGroupForm';
import { BasicInfoTab, PermissionsTab, MembersTab, RegionsTab } from './TabContent';

const TAB_ICONS: Record<TabType, React.ReactNode> = {
  basic: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  permissions: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  members: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  regions: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

const GroupForm: React.FC<GroupFormProps> = ({ group, onSave, onCancel }) => {
  const {
    activeTab, setActiveTab, formData, setFormData, availableUsers,
    togglePermission, toggleMember, toggleRegion, selectAllPermissionsInCategory, permissionsByCategory,
  } = useGroupForm(group);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "basic", label: "Basic Info" },
    { id: "permissions", label: `Permissions (${formData.permissions.length})` },
    { id: "members", label: `Members (${formData.members.length})` },
    { id: "regions", label: `Regions (${formData.assignedRegions.length})` },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onCancel} />
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{group ? "Edit Group" : "Create New Group"}</h3>
              </div>
              <button type="button" onClick={onCancel} aria-label="Close" title="Close" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`${activeTab === tab.id ? "border-amber-500 text-amber-600 dark:text-amber-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"} whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm inline-flex items-center gap-2`}
                  >
                    {TAB_ICONS[tab.id]}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6 max-h-96 overflow-y-auto px-1">
              {activeTab === "basic" && <BasicInfoTab formData={formData} setFormData={setFormData} />}
              {activeTab === "permissions" && <PermissionsTab formData={formData} togglePermission={togglePermission} selectAllPermissionsInCategory={selectAllPermissionsInCategory} permissionsByCategory={permissionsByCategory} />}
              {activeTab === "members" && <MembersTab formData={formData} availableUsers={availableUsers} toggleMember={toggleMember} />}
              {activeTab === "regions" && <RegionsTab formData={formData} toggleRegion={toggleRegion} />}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end space-x-3">
              <button type="button" onClick={onCancel} className="inline-flex items-center px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                Cancel
              </button>
              <button type="submit" className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {group ? "Update Group" : "Create Group"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GroupForm;

