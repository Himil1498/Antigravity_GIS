const notificationService = require('../services/notification.service');
const { logAudit } = require('../../audit/audit.service');

const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unreadOnly = 'false' } = req.query;
    const notifications = await notificationService.getMyNotifications(userId, unreadOnly === 'true');
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    res.json({ success: true, count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch unread count' });
  }
};

const markAsRead = async (req, res) => {
  try {
    await notificationService.markAsRead(req.user.id, req.params.id);
    
    await logAudit(
      req.user.id,
      'MARK_NOTIFICATION_READ',
      'NOTIFICATION',
      req.params.id,
      {},
      req
    );

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    
    await logAudit(
      req.user.id,
      'MARK_ALL_NOTIFICATIONS_READ',
      'NOTIFICATION',
      req.user.id,
      {},
      req
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark all notifications as read' });
  }
};

const deleteNotification = async (req, res) => {
  try {
    await notificationService.deleteNotification(req.user.id, req.params.id);
    
    await logAudit(
      req.user.id,
      'DELETE_NOTIFICATION',
      'NOTIFICATION',
      req.params.id,
      {},
      req
    );

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete notification' });
  }
};

const clearAllRead = async (req, res) => {
  try {
    await notificationService.clearAllRead(req.user.id);
    
    await logAudit(
      req.user.id,
      'CLEAR_ALL_READ_NOTIFICATIONS',
      'NOTIFICATION',
      req.user.id,
      {},
      req
    );

    res.json({ success: true, message: 'All read notifications cleared' });
  } catch (error) {
    console.error('Clear all read error:', error);
    res.status(500).json({ success: false, error: 'Failed to clear notifications' });
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllRead
};
