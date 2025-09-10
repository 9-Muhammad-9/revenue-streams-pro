const { handler } = require('../netlify/functions/ads');
const mongoose = require('mongoose');

// Mock mongoose connection
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connections: [{ readyState: 1 }],
  model: jest.fn().mockReturnValue({
    findByIdAndUpdate: jest.fn()
  })
}));

describe('Ad Revenue Tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should correctly calculate 30/70 revenue split', async () => {
    const event = {
      body: JSON.stringify({
        userId: 'test-user-123',
        adType: 'video',
        value: 1.00
      })
    };
    
    const result = await handler(event);
    const response = JSON.parse(result.body);
    
    expect(response.success).toBe(true);
    expect(response.userShare).toBe(0.3); // 30%
    expect(response.platformShare).toBe(0.7); // 70%
  });
  
  test('should handle invalid ad types', async () => {
    const event = {
      body: JSON.stringify({
        userId: 'test-user-123',
        adType: 'invalid',
        value: 1.00
      })
    };
    
    const result = await handler(event);
    const response = JSON.parse(result.body);
    
    expect(response.success).toBe(false);
    expect(response.message).toContain('Invalid');
  });
});
