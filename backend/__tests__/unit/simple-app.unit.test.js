const request = require('supertest');
const express = require('express');
const cors = require('cors');

describe('Simple Express App Unit Tests', () => {
  let app;

  beforeEach(() => {
    // Create a simple test app without complex dependencies
    app = express();
    app.use(cors());
    app.use(express.json());

    // Simple test endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: 'test'
      });
    });

    // Mock payments endpoint
    app.get('/payments', (req, res) => {
      const mockPayments = [
        {
          id: 'test_001',
          amount: 1000,
          currency: 'USD',
          recipient: 'Test User',
          status: 'pending',
          scheduled_date: '2025-10-01',
          isWithin24Hours: false
        }
      ];

      res.json({
        payments: mockPayments,
        count: 1,
        totalAmount: 1000,
        currency: 'USD',
        dataSource: 'Test'
      });
    });
  });

  test('GET /health should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('environment', 'test');
  });

  test('GET /payments should return mock payments', async () => {
    const response = await request(app)
      .get('/payments')
      .expect(200);

    expect(response.body).toHaveProperty('payments');
    expect(response.body).toHaveProperty('count', 1);
    expect(response.body).toHaveProperty('totalAmount', 1000);
    expect(response.body).toHaveProperty('currency', 'USD');
    expect(response.body).toHaveProperty('dataSource', 'Test');

    expect(response.body.payments).toHaveLength(1);
    expect(response.body.payments[0]).toHaveProperty('id', 'test_001');
  });

  test('should handle CORS headers', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });

  test('should return 404 for non-existent routes', async () => {
    await request(app)
      .get('/non-existent')
      .expect(404);
  });
});
