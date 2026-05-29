const boundaryVersionService = require('../boundary-version.service');
const { pool } = require('../../config/database');

jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn(),
    getConnection: jest.fn()
  }
}));

describe('Boundary Version Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getRegionBoundary', () => {
        it('should return boundary if found', async () => {
             const mockBoundary = [{ id: 1, boundary_geojson: "{}" }];
             pool.query.mockResolvedValueOnce([mockBoundary]);
             const result = await boundaryVersionService.getRegionBoundary(1);
             expect(result).toEqual(mockBoundary[0]);
        });
    });
});
