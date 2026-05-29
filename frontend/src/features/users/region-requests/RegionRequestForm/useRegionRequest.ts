/**
 * Custom hook for Region Request Form logic
 * Location: Frontend/src/features/users/region-requests/RegionRequestForm/useRegionRequest.ts
 */

import { useState } from 'react';
import { showToast, toastMessages } from '../../../../utils/toastUtils';
import type { RequestType, NotificationState } from './types';

export const useRegionRequest = (onSubmitCallback?: () => void) => {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [requestType, setRequestType] = useState<RequestType>('access');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showNotification = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ) => {
    setNotification({ isOpen: true, type, title, message });
  };

  const resetForm = () => {
    setSelectedRegion('');
    setRequestType('access');
    setReason('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRegion || !reason.trim()) {
      showNotification('error', 'Validation Error', 'Please select a region and provide a reason.');
      return;
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem('opti_connect_token') || localStorage.getItem('opti_connect_token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:82/api';

      const response = await fetch(`${API_URL}/region-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          region_name: selectedRegion,
          request_type: requestType,
          reason: reason.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit region request');
      }

      showToast.success(toastMessages.region.requestSubmitted);
      resetForm();

      if (onSubmitCallback) {
        onSubmitCallback();
      }
    } catch (error: any) {
      console.error('Error submitting region request:', error);
      showNotification(
        'error',
        'Submission Failed',
        error.message || 'Failed to submit region request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const closeNotification = () => {
    setNotification({ ...notification, isOpen: false });
  };

  return {
    selectedRegion,
    setSelectedRegion,
    requestType,
    setRequestType,
    reason,
    setReason,
    loading,
    notification,
    showNotification,
    closeNotification,
    resetForm,
    handleSubmit
  };
};

