import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/index';
import { addNotification } from '../../store/slices/ui';
import NavigationBar from '../NavigationBar';
import UpdatesPanel from './UpdatesPanel/UpdatesPanel';

// Component to conditionally render NavigationBar (only on authenticated routes)
const ConditionalNavigationBar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isUpdatesOpen, setIsUpdatesOpen] = React.useState(false);

  const dispatch = useAppDispatch();

  React.useEffect(() => {
    const handleOpenUpdates = () => setIsUpdatesOpen(true);
    window.addEventListener('openUpdatesPanel', handleOpenUpdates);
    return () => window.removeEventListener('openUpdatesPanel', handleOpenUpdates);
  }, []);

  React.useEffect(() => {
    const handleSystemUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      dispatch(addNotification({
        type: 'system_update' as any,
        title: `🚀 ${detail?.title || 'New Platform Update'}`,
        message: detail?.summary || 'A new update has been published. Click to view details.',
        autoClose: true,
        duration: 8000,
      }));
    };
    window.addEventListener('system:update_published', handleSystemUpdate);
    return () => window.removeEventListener('system:update_published', handleSystemUpdate);
  }, [dispatch]);

  // Public routes where navigation bar should NOT appear
  const publicRoutes = ["/login", "/verify-email", "/resend-verification"];
  const isPublicRoute = publicRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  // Only show navigation bar on authenticated routes
  if (isPublicRoute || !isAuthenticated) {
    return null;
  }

  return (
    <>
      <NavigationBar onOpenUpdates={() => setIsUpdatesOpen(true)} />
      <UpdatesPanel isOpen={isUpdatesOpen} onClose={() => setIsUpdatesOpen(false)} />
    </>
  );
};

export default ConditionalNavigationBar;

