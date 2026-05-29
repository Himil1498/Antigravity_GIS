const searchService = require('../services/search.service');
const historyService = require('../services/history.service');
const { ERRORS, DEFAULTS } = require('../constants');
const { logAudit } = require('../../audit/audit.service');

// --- Global & Entity Search ---

const globalSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return res.status(400).json({ success: false, error: 'Query too short' });
        }

        const results = await searchService.globalSearch(req.user.id, q);

        // Record history
        await historyService.addSearchToHistory(req.user.id, q, 'global', 0); // Count not accurate for global aggregated, maybe implement simple count

        res.json({ success: true, results });
    } catch (error) {
        console.error('Global search error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return res.status(400).json({ success: false, error: 'Query too short' });
        }

        const users = await searchService.searchUsers(req.user.id, q);
        res.json({ success: true, users });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ success: false, error: 'Search users failed' });
    }
};

const searchRegions = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return res.status(400).json({ success: false, error: 'Query too short' });
        }

        const regions = await searchService.searchRegions(req.user.id, q);
        res.json({ success: true, regions });
    } catch (error) {
        console.error('Search regions error:', error);
        res.status(500).json({ success: false, error: 'Search regions failed' });
    }
};

const searchFeatures = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return res.status(400).json({ success: false, error: 'Query too short' });
        }

        const features = await searchService.searchFeatures(req.user.id, q);
        res.json({ success: true, features });
    } catch (error) {
        console.error('Search features error:', error);
        res.status(500).json({ success: false, error: 'Search features failed' });
    }
};

const searchSavedData = async (req, res) => {
    try {
        const { q, userId } = req.query;
        if (!q || q.trim().length < 2) {
             return res.status(400).json({ success: false, error: 'Query too short' });
        }

        const result = await searchService.searchSavedData(req.user.id, req.user.role, q, userId);
        res.json(result);
    } catch (error) {
        console.error('Search saved data error:', error);
        res.status(500).json({ success: false, error: 'Search saved data failed' });
    }
};

const getUsersList = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
             return res.status(403).json({ success: false, error: 'Access denied' });
        }
        const users = await searchService.getUsersList();
        res.json({ success: true, users });
    } catch (error) {
        console.error('Get users list error:', error);
        res.status(500).json({ success: false, error: 'Failed to get users list' });
    }
};

// --- History & Stats ---

const getSearchHistory = async (req, res) => {
    try {
        const { limit, offset } = req.query;
        const result = await historyService.getSearchHistory(req.user.id, limit, offset);
        res.json({
            success: true,
            history: result.history,
            total: result.total,
            limit: parseInt(limit || DEFAULTS.LIMIT),
            offset: parseInt(offset || DEFAULTS.OFFSET)
        });
    } catch (error) {
        console.error('Error fetching search history:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch search history' });
    }
};

const getRecentSearches = async (req, res) => {
    try {
        const searches = await historyService.getRecentSearches(req.user.id, req.query.limit);
        res.json({ success: true, recent_searches: searches });
    } catch (error) {
         console.error('Error fetching recent searches:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch recent searches' });
    }
};

const getSearchStats = async (req, res) => {
    try {
        const stats = await historyService.getSearchStats(req.user.id);
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error fetching search stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch search statistics' });
    }
};

const addSearchToHistory = async (req, res) => {
    try {
        const { search_query, search_type, result_count } = req.body;
        if (!search_query || !search_type) {
             return res.status(400).json({ success: false, message: 'search_query and search_type are required' });
        }

        await historyService.addSearchToHistory(req.user.id, search_query, search_type, result_count);
        res.json({ success: true, message: 'Search added to history' });
    } catch (error) {
        console.error('Error adding search to history:', error);
        res.status(500).json({ success: false, message: 'Failed to add search to history' });
    }
};

const clearSearchHistory = async (req, res) => {
    try {
        await historyService.clearSearchHistory(req.user.id);

        await logAudit(
            req.user.id,
            'CLEAR_SEARCH_HISTORY',
            'SEARCH',
            req.user.id,
            {},
            req
        );

        res.json({ success: true, message: 'Search history cleared' });
    } catch (error) {
        console.error('Error clearing search history:', error);
        res.status(500).json({ success: false, message: 'Failed to clear search history' });
    }
};

const deleteSearch = async (req, res) => {
    try {
        const success = await historyService.deleteSearch(req.params.id, req.user.id);
        if (!success) {
             return res.status(404).json({ success: false, message: 'Search not found' });
        }

        await logAudit(
            req.user.id,
            'DELETE_SEARCH',
            'SEARCH',
            req.params.id,
            {},
            req
        );

        res.json({ success: true, message: 'Search deleted from history' });
    } catch (error) {
        console.error('Error deleting search:', error);
        res.status(500).json({ success: false, message: 'Failed to delete search' });
    }
};

module.exports = {
    globalSearch,
    searchUsers,
    searchRegions,
    searchFeatures,
    searchSavedData,
    getUsersList,
    getSearchHistory,
    getRecentSearches,
    getSearchStats,
    addSearchToHistory,
    clearSearchHistory,
    deleteSearch
};
