const express = require('express');
const router = express.Router();
const { authenticate } = require('../../shared/middleware/auth');
const searchController = require('./controllers/search.controller');

router.use(authenticate);

// Global & Entity Search
router.get('/global', searchController.globalSearch);
router.get('/users', searchController.searchUsers);
router.get('/regions', searchController.searchRegions);
router.get('/features', searchController.searchFeatures);
router.get('/saved-data', searchController.searchSavedData);
router.get('/users-list', searchController.getUsersList); // Admin only, check in controller

// Search History
router.get('/history', searchController.getSearchHistory);
router.get('/history/recent', searchController.getRecentSearches);
router.get('/history/stats', searchController.getSearchStats);
router.post('/history', searchController.addSearchToHistory);
router.delete('/history', searchController.clearSearchHistory);
router.delete('/history/:id', searchController.deleteSearch);

module.exports = router;
