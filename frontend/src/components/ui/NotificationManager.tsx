
import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/index';
import { removeNotification } from '../../store/slices/ui';
import { toast } from 'react-toastify';
import { ToastBody } from '../../utils/toastUtils';

const NotificationManager: React.FC = () => {
    const dispatch = useAppDispatch();
    const notifications = useAppSelector(state => state.ui.notifications);

    useEffect(() => {
        notifications.forEach(notification => {
            const { id, type, title, message, autoClose, duration } = notification;

            const content = <ToastBody title={title || ''} description={message} />;

            const toastAutoClose: number | false = autoClose === false ? false : (duration || 5000);

            const options = {
                toastId: id, // Prevent duplicates
                autoClose: toastAutoClose,
                onClose: () => dispatch(removeNotification(id)),
                onClick: () => {
                    if ((type as string) === 'system_update' || type === 'info') {
                        window.dispatchEvent(new CustomEvent('openUpdatesPanel'));
                    }
                }
            };

            switch (type as string) {
                case 'success':
                    toast.success(content, options);
                    break;
                case 'error':
                    toast.error(content, options);
                    break;
                case 'warning':
                    toast.warning(content, options);
                    break;
                case 'system_update':
                    toast.info(content, { ...options, icon: '🚀' as any, className: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40 border-l-4 border-cyan-500 cursor-pointer' });
                    break;
                case 'info':
                default:
                    toast.info(content, options);
                    break;
            }
        });
    }, [notifications, dispatch]);

    return null;
};

export default NotificationManager;

