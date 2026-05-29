const regionRequestService = require('../region-request.service');
const { pool } = require('../../config/database');

jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn(),
    getConnection: jest.fn()
  }
}));

jest.mock('../../notification/services/notification.service', () => ({
    notifyAllAdmins: jest.fn(),
    createNotification: jest.fn()
}));

describe('Region Request Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createRequest', () => {
        it('should create a request successfully', async () => {
            const mockUser = 1;
            const mockData = { region_id: 2, comments: 'Access please' };
            
            // Region exists
            pool.query.mockResolvedValueOnce([[{ id: 2 }]]); 
            // Existing access - none
            pool.query.mockResolvedValueOnce([[]]); 
            // Pending - none
            pool.query.mockResolvedValueOnce([[]]); 
            // Insert
            pool.query.mockResolvedValueOnce([{ insertId: 100 }]); 
            // Region info
            pool.query.mockResolvedValueOnce([[{ name: 'Region 2' }]]); 
            // User info
            pool.query.mockResolvedValueOnce([[{ username: 'test' }]]); 

            const result = await regionRequestService.createRequest(mockUser, mockData);
            expect(result.id).toBe(100);
            expect(result.status).toBe('pending');
        });

        it('should throw if already pending', async () => {
             const mockUser = 1;
            const mockData = { region_id: 2 };
            
            pool.query.mockResolvedValueOnce([[{ id: 2 }]]); 
            pool.query.mockResolvedValueOnce([[]]); 
            pool.query.mockResolvedValueOnce([[{ id: 99 }]]); // Pending exists

            await expect(regionRequestService.createRequest(mockUser, mockData))
                .rejects.toThrow(regionRequestService.ERRORS.ALREADY_PENDING);
        });
    });
});
