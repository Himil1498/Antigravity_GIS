const regionService = require('../region.service');
const { pool } = require('../../config/database');

jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn()
  }
}));

describe('Region Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllRegions', () => {
        it('should return regions for admin', async () => {
             const mockRegions = [{ id: 1, name: 'Region 1' }];
             pool.query.mockResolvedValueOnce([mockRegions]);

             const regions = await regionService.getAllRegions(null, null, 1, 'admin');
             expect(regions).toEqual(mockRegions);
             expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE 1=1'), expect.any(Array));
        });
    });
});
