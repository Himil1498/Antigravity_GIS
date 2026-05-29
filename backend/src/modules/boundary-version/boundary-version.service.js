const draftService = require('./services/draft.service');
const versionService = require('./services/version.service');
const historyService = require('./services/history.service');
const boundaryService = require('./services/boundary.service');

module.exports = {
  ...draftService,
  ...versionService,
  ...historyService,
  ...boundaryService
};
