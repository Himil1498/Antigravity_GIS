const boundaryPublicService = require('../boundary-public.service');
const { pool } = require('../../config/database');

jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn()
  }
}));

describe('Boundary Public Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getPublishedBoundaries', () => {
        it('should return all boundaries for admin', async () => {
             const mockBoundaries = [{ id: 1 }];
             pool.query.mockResolvedValueOnce([mockBoundaries]);
             const result = await boundaryPublicService.getPublishedBoundaries(1, 'admin');
             expect(result).toEqual(mockBoundaries);
             expect(pool.query).toHaveBeenCalledWith(expect.not.stringContaining('user_regions'), expect.any(Array));
        });
    });
});
