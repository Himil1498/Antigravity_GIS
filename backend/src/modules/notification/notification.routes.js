const express = require('express');
const router = express.Router();
const { authenticate } = require('../../shared/middleware/auth');
const notificationController = require('./controllers/notification.controller');

router.use(authenticate);

router.get('/', notificationController.getMyNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.delete('/clear-all', notificationController.clearAllRead);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
