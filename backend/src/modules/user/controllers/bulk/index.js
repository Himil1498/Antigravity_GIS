const { bulkDeleteUsers } = require('./deleteController');
const { bulkUpdateStatus } = require('./statusController');
const { bulkAssignRegions } = require('./regionController');

module.exports = {
  bulkDeleteUsers,
  bulkUpdateStatus,
  bulkAssignRegions
};
