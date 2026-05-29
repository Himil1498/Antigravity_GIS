const boundaryImpactService = require('../boundary-impact.service');
const { pool } = require('../../config/database');

jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn()
  }
}));

describe('Boundary Impact Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('analyzeImpact', () => {
        it('should throw if no draft found', async () => {
             pool.query.mockResolvedValueOnce([[]]); // No drafts
             await expect(boundaryImpactService.analyzeImpact(1))
                .rejects.toThrow('No draft boundary found');
        });
    });
});
