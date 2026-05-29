/**
 * Building Cache Controller
 * Handles main building cache endpoints
 */

const { ERRORS, MESSAGES } = require('../constants');
const { calculateCacheStatistics, formatCacheData, parseJSON, generateCacheKey } = require('../utils');
const { pool } = require('../../../config/database');
const { CACHE_TABLES } = require('../constants');
const {
  saveCache,
  getCacheByKey,
  queryCacheByBbox,
  updateAccessStatistics
} = require('../services/building-cache.service');

/**
 * @route   POST /api/building-cache
 * @desc    Save building/obstacle data to cache
 * @access  Private
 */
const saveBuildingCache = async (req, res) => {
  try {
    const {
      bbox,
      building_data,
      obstacle_data
    } = req.body;

    if (!bbox || !building_data) {
      return res.status(400).json({
        success: false,
        error: ERRORS.BUILDING_DATA_REQUIRED
      });
    }

    // Generate cache key from bbox
    const cacheKey = generateCacheKey(bbox);

    // Calculate statistics
    const statistics = calculateCacheStatistics(building_data);

    // Save or update cache
    const result = await saveCache({
      cacheKey,
      bbox,
      buildingData: building_data,
      obstacleData: obstacle_data,
      statistics
    });

    // Parse JSON data for response
    const buildingDataParsed = parseJSON(building_data);

    if (result.updated) {
      return res.json({
        success: true,
        message: MESSAGES.CACHE_UPDATED,
        cacheKey,
        updated: true
      });
    }

    res.status(201).json({
      success: true,
      message: MESSAGES.CACHE_SAVED,
      cacheKey,
      statistics
    });
  } catch (error) {
    console.error('Save cache error:', error);
    res.status(500).json({
      success: false,
      error: ERRORS.FAILED_TO_SAVE
    });
  }
};

/**
 * @route   GET /api/building-cache/:cacheKey
 * @desc    Get cached building data
 * @access  Private
 */
const getBuildingCache = async (req, res) => {
  try {
    const { cacheKey } = req.params;

    const cached = await getCacheByKey(cacheKey);

    if (!cached) {
      return res.status(404).json({
        success: false,
        error: ERRORS.CACHE_NOT_FOUND
      });
    }

    // Update access statistics
    await updateAccessStatistics(cacheKey);

    // Parse JSON data
    const cachedParsed = {
      ...cached,
      building_data: parseJSON(cached.building_data),
      obstacle_data: parseJSON(cached.obstacle_data)
    };

    res.json({
      success: true,
      cached: true,
      data: formatCacheData(cachedParsed)
    });
  } catch (error) {
    console.error('Get cache error:', error);
    res.status(500).json({
      success: false,
      error: ERRORS.FAILED_TO_GET
    });
  }
};

/**
 * @route   POST /api/building-cache/query
 * @desc    Query cache by bounding box
 * @access  Private
 */
const queryBuildingCache = async (req, res) => {
  try {
    const { bbox } = req.body;

    if (!bbox) {
      return res.status(400).json({
        success: false,
        error: ERRORS.BBOX_REQUIRED
      });
    }

    // Find overlapping cache entries
    const cached = await queryCacheByBbox(bbox);

    if (!cached) {
      return res.json({
        success: true,
        cached: false,
        message: MESSAGES.NO_CACHE_FOUND
      });
    }

    // Update access statistics
    await updateAccessStatistics(cached.cache_key);

    // Parse JSON data
    const cachedParsed = {
      ...cached,
      building_data: parseJSON(cached.building_data),
      obstacle_data: parseJSON(cached.obstacle_data)
    };

    res.json({
      success: true,
      cached: true,
      cacheKey: cached.cache_key,
      data: formatCacheData(cachedParsed)
    });
  } catch (error) {
    console.error('Query cache error:', error);
    res.status(500).json({
      success: false,
      error: ERRORS.FAILED_TO_QUERY
    });
  }
};

module.exports = {
  saveBuildingCache,
  getBuildingCache,
  queryBuildingCache
};
