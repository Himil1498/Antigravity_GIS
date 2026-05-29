/**
 * Region Request Form - Main Component (Orchestrator)
 * Location: Frontend/src/features/users/region-requests/RegionRequestForm/RegionRequestForm.tsx
 * 
 * Refactored following code quality standards:
 * - Main file < 250 lines
 * - Feature-based subdirectory structure
 * - Extracted components, hooks, types, and constants
 */

import React from 'react';
import NotificationDialog from '../../../../components/ui/NotificationDialog';
import FormHeader from './components/FormHeader';
import InfoCard from './components/InfoCard';
import RequestTypeSelector from './components/RequestTypeSelector';
import RegionSelector from './components/RegionSelector';
import ReasonInput from './components/ReasonInput';
import FormActions from './components/FormActions';
import { useRegionRequest } from './useRegionRequest';
import type { RegionRequestFormProps } from './types';

const RegionRequestForm: React.FC<RegionRequestFormProps> = ({ onSubmit }) => {
  const {
    selectedRegion,
    setSelectedRegion,
    requestType,
    setRequestType,
    reason,
    setReason,
    loading,
    notification,
    closeNotification,
    resetForm,
    handleSubmit
  } = useRegionRequest(onSubmit);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <FormHeader />
      <InfoCard />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <RequestTypeSelector
            requestType={requestType}
            onRequestTypeChange={setRequestType}
          />

          <RegionSelector
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
          />

          <ReasonInput
            reason={reason}
            onReasonChange={setReason}
          />

          <FormActions
            loading={loading}
            onClear={resetForm}
          />
        </form>
      </div>

      <NotificationDialog
        isOpen={notification.isOpen}
        onClose={closeNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        autoClose
        autoCloseDelay={5000}
      />
    </div>
  );
};

export default RegionRequestForm;

