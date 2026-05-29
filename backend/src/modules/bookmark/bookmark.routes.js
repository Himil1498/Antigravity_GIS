const express = require('express');
const router = express.Router();
const { authenticate } = require('../../shared/middleware/auth');
const bookmarkController = require('./controllers/bookmark.controller');

router.use(authenticate);

router.get('/', bookmarkController.getAllBookmarks);
router.post('/', bookmarkController.createBookmark);
router.put('/:id', bookmarkController.updateBookmark);
router.delete('/:id', bookmarkController.deleteBookmark);

module.exports = router;
