import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../../../store/index';
import { createRegionRequest, getRegionRequests, cancelRegionRequest } from '../../../../services/regionRequest/index';
import type { RegionAccessRequest } from '../../../../types/regionRequest.types';
import { NotificationState } from './types';
import { updateUser } from '../../../../store/slices/authSlice';
import { authService } from '../../../../services/api/authService';

export const useRegionAccessRequest = () => {
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [userRequests, setUserRequests] = useState<RegionAccessRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({ isOpen: false, type: 'info', title: '', message: '' });
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  useEffect(() => { 
    if (user?.id) loadUserRequests(); 
  }, [user?.id]);

  const loadUserRequests = async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      // Backend already filters by authenticated user's ID for non-admin users
      const [requests, userProfile] = await Promise.all([
        getRegionRequests(),
        authService.getCurrentUserProfile()
      ]);
      setUserRequests(requests);
      if (userProfile) {
        dispatch(updateUser(userProfile));
      }
    } catch (error) {
      console.error("Failed to refresh user data", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRegionToggle = (region: string) => {
    setSelectedRegions(prev => prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]);
  };

  const showNotification = (type: NotificationState['type'], title: string, message: string) => {
    setNotification({ isOpen: true, type, title, message });
  };

  const closeNotification = () => setNotification(prev => ({ ...prev, isOpen: false }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { showNotification('error', 'Error', 'User not authenticated'); return; }
    if (selectedRegions.length === 0) { showNotification('warning', 'No Regions Selected', 'Please select at least one region.'); return; }
    if (reason.trim().length < 3) { showNotification('warning', 'Invalid Reason', 'Please provide a reason (at least 3 characters).'); return; }
    setIsSubmitting(true);
    try {
      await createRegionRequest(user, selectedRegions, reason);
      showNotification('success', 'Request Submitted', `Your request for ${selectedRegions.length} region(s) has been submitted.`);
      setSelectedRegions([]); setReason('');
      await loadUserRequests();
    } catch (error: any) {
      showNotification('error', 'Submission Failed', error.message || 'Failed to submit request. Please try again.');
    } finally { setIsSubmitting(false); }
  };

  // Delete confirmation flow (replaces window.confirm)
  const requestDeleteConfirmation = (requestId: string) => setConfirmingDeleteId(requestId);
  const cancelDeleteConfirmation = () => setConfirmingDeleteId(null);

  const confirmDelete = async () => {
    if (!user || !confirmingDeleteId) return;
    const deleteId = confirmingDeleteId;
    setConfirmingDeleteId(null);
    try {
      const result = await cancelRegionRequest(deleteId, user);
      if (result) {
        showNotification('success', 'Request Cancelled', 'Your region access request has been cancelled successfully.');
        await loadUserRequests();
      } else {
        showNotification('error', 'Cancellation Failed', 'Failed to cancel request. Please try again.');
      }
    } catch (error: any) {
      showNotification('error', 'Cancellation Failed', error.message || 'Failed to cancel request.');
    }
  };

  const assignedRegions = user?.assignedRegions || [];
  const pendingRequests = userRequests.filter(req => req.status === 'pending');
  const pendingRegions = pendingRequests.flatMap(req => req.requestedRegions);

  return {
    user, selectedRegions, reason, setReason, userRequests, isSubmitting, isRefreshing, notification,
    assignedRegions, pendingRequests, pendingRegions,
    handleRegionToggle, handleSubmit, closeNotification, loadUserRequests,
    confirmingDeleteId, requestDeleteConfirmation, confirmDelete, cancelDeleteConfirmation,
  };
};
