/**
 * Feature Controller (Barrel Export)
 * Re-exports from split controllers
 */

const basicController = require('./feature-basic.controller');
const advancedController = require('./feature-advanced.controller');

module.exports = {
  ...basicController,
  ...advancedController
};
