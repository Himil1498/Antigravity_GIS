const analyticsService = require('../analytics.service');
const { pool } = require('../../../config/database');

jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn()
  }
}));

describe('Analytics Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getDashboardAnalytics', () => {
        it('should aggregate counts correctly', async () => {
             // Mock extensive Promise.all return
             const mockCounts = [
                 [{ count: 10 }], // measurements
                 [{ count: 5 }],  // polygons
                 [{ count: 2 }],  // circles
                 [{ count: 3 }],  // sectors
                 [{ count: 100 }], // infra
                 [{ count: 8 }],   // bookmarks
                 [{ count: 4 }],    // layers
                 [{ count: 15 }]    // recent
             ];
             
             // pool.query mock to return these in order
             // Since Promise.all calls them in parallel, the order of mockResolvedValueOnce strictly might be tricky if not serial.
             // But Jest mocks usually work FIFO on calls.
             // With Promise.all, they are initiated.
             // Let's rely on standard mocking.
             
             pool.query
                .mockResolvedValueOnce([[mockCounts[0][0]]])
                .mockResolvedValueOnce([[mockCounts[1][0]]])
                .mockResolvedValueOnce([[mockCounts[2][0]]])
                .mockResolvedValueOnce([[mockCounts[3][0]]])
                .mockResolvedValueOnce([[mockCounts[4][0]]])
                .mockResolvedValueOnce([[mockCounts[5][0]]])
                .mockResolvedValueOnce([[mockCounts[6][0]]])
                .mockResolvedValueOnce([[mockCounts[7][0]]]);

             const result = await analyticsService.getDashboardAnalytics(1);
             
             expect(result.total_measurements).toBe(10);
             expect(result.total_infrastructure).toBe(100);
        });
    });
});
