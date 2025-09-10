const { handler } = require('../netlify/functions/mining');

describe('Mining Functions', () => {
  test('should start mining session', async () => {
    const event = {
      body: JSON.stringify({
        action: 'start',
        userId: 'test-user-123',
        platform: 'nicehash'
      })
    };
    
    const result = await handler(event);
    const response = JSON.parse(result.body);
    
    expect(response.success).toBe(true);
    expect(response.message).toContain('started');
  });
  
  test('should prevent multiple mining sessions', async () => {
    // First session
    await handler({
      body: JSON.stringify({
        action: 'start',
        userId: 'test-user-123',
        platform: 'nicehash'
      })
    });
    
    // Second session - should fail
    const result = await handler({
      body: JSON.stringify({
        action: 'start',
        userId: 'test-user-123',
        platform: 'nicehash'
      })
    });
    
    const response = JSON.parse(result.body);
    
    expect(response.success).toBe(false);
    expect(response.message).toContain('already');
  });
});
