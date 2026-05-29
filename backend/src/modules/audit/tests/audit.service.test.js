const auditService = require('../audit.service');
const { pool } = require('../../config/database');

jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn()
  }
}));

describe('Audit Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAuditLogs', () => {
        it('should build query and return logs', async () => {
             const mockLogs = [{ id: 1, action: 'LOGIN' }];
             pool.query.mockResolvedValueOnce([mockLogs]);

             const logs = await auditService.getAuditLogs({ page: 1, limit: 10 });
             expect(logs).toEqual(mockLogs);
             expect(pool.query).toHaveBeenCalled();
        });
    });
});
