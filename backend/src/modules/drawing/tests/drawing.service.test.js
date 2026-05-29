const polygonService = require('../services/polygon.service');
const circleService = require('../services/circle.service');
const { pool } = require('../../../config/database');

jest.mock('../../../config/database', () => ({
    pool: {
        query: jest.fn()
    }
}));

jest.mock('../../../modules/audit/audit.service', () => ({
    logAudit: jest.fn()
}));

jest.mock('../../../shared/services/websocket', () => ({
    broadcastGISUpdate: jest.fn()
}));

jest.mock('../../../shared/middleware/cache', () => ({
    clearCache: jest.fn()
}));

describe('Drawing Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Polygon Service', () => {
        it('getAllPolygons should return polygons', async () => {
            const mockPolygons = [{ id: 1, polygon_name: 'Test Poly' }];
            pool.query.mockResolvedValueOnce([mockPolygons]);

            const result = await polygonService.getAllPolygons(1, 'user', {});
            expect(result).toEqual(mockPolygons);
            expect(pool.query).toHaveBeenCalled();
        });

        it('createPolygon should insert polygon', async () => {
             const mockResult = { insertId: 1 };
             pool.query.mockResolvedValueOnce([mockResult]);

             const data = {
                 polygon_name: 'Test',
                 coordinates: [[0,0], [1,1], [0,1]],
                 region_id: 1,
                 area: 100,
                 perimeter: 50
             };

             const result = await polygonService.createPolygon(data, 1, {});
             expect(result.id).toBe(1);
        });
    });

    describe('Circle Service', () => {
        it('getAllCircles should return circles', async () => {
            const mockCircles = [{ id: 1, circle_name: 'Test Circle' }];
            pool.query.mockResolvedValueOnce([mockCircles]);

            const result = await circleService.getAllCircles(1, 'user', {});
            expect(result).toEqual(mockCircles);
        });

         it('createCircle should insert circle', async () => {
             const mockResult = { insertId: 1 };
             pool.query.mockResolvedValueOnce([mockResult]);

             const data = {
                 circle_name: 'Test',
                 center_lat: 10,
                 center_lng: 10,
                 radius: 100,
                 region_id: 1
             };

             const result = await circleService.createCircle(data, 1, {});
             expect(result.id).toBe(1);
        });
    });
});
