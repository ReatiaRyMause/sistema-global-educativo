import request from 'supertest';
import app from '../server.js';

// Test básicos que no requieren base de datos
describe('Basic API Tests', () => {
  test('Health check should return 200', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'OK');
  });

  test('Test endpoint should return 200', async () => {
    const response = await request(app)
      .get('/api/test')
      .expect(200);
    
    expect(response.body).toHaveProperty('message');
  });

  test('API docs should return 200', async () => {
    const response = await request(app)
      .get('/api/docs')
      .expect(200);
    
    expect(response.body).toHaveProperty('name', 'Global API');
  });
});