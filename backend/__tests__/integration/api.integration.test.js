const request = require('supertest');

// Test against the actual running API server
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

describe('API Integration Tests', () => {
  // These tests require the API server to be running
  // Start the server with: npm run dev
  // Or set API_BASE_URL to test against a deployed API

  beforeAll(async () => {
    // Test if the server is running
    try {
      await request(API_BASE_URL).get('/health').timeout(5000);
    } catch (error) {
      console.error(`
❌ API server is not running at ${API_BASE_URL}
   
To run integration tests:
1. Start the server: npm run dev
2. In another terminal: npm run test:integration

Or set API_BASE_URL environment variable to test against a deployed API.
      `);
      throw new Error(`API server not available at ${API_BASE_URL}`);
    }
  });
  test('GET /health should return health status', async () => {
    const response = await request(API_BASE_URL)
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({
      status: 'healthy',
      timestamp: expect.any(String),
      environment: expect.stringMatching(/^(local|lambda)$/),
      dataSource: expect.stringMatching(/^(Local JSON|DynamoDB)$/)
    });
  });

  test('GET /payments should return payments with metadata', async () => {
    const response = await request(API_BASE_URL)
      .get('/payments')
      .expect(200);

    expect(response.body).toHaveProperty('payments');
    expect(response.body).toHaveProperty('count');
    expect(response.body).toHaveProperty('dataSource');
    expect(response.body).toHaveProperty('totalAmount');

    expect(Array.isArray(response.body.payments)).toBe(true);
    expect(typeof response.body.count).toBe('number');
    expect(response.body.dataSource).toMatch(/^(Local JSON|DynamoDB)$/);
    expect(typeof response.body.totalAmount).toBe('number');
  });

  test('GET /payments should filter by recipient', async () => {
    const response = await request(API_BASE_URL)
      .get('/payments?recipient=John')
      .expect(200);

    expect(response.body.payments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recipient: expect.stringContaining('John')
        })
      ])
    );

    // Verify filtering worked by checking results contain John
    expect(response.body.payments.length).toBeGreaterThan(0);
  });

  test('GET /payments should filter by date (after)', async () => {
    const response = await request(API_BASE_URL)
      .get('/payments?after=2025-07-01')
      .expect(200);

    // Verify date filtering worked
    expect(response.body.payments.length).toBeGreaterThan(0);

    // All payments should be after the specified date
    response.body.payments.forEach(payment => {
      expect(new Date(payment.scheduled_date)).toBeInstanceOf(Date);
      expect(new Date(payment.scheduled_date) > new Date('2025-07-01')).toBe(true);
    });
  });

  test('GET /payments should filter by date (before)', async () => {
    const response = await request(API_BASE_URL)
      .get('/payments?before=2025-12-31')
      .expect(200);

    // Verify date filtering worked
    expect(response.body.payments.length).toBeGreaterThan(0);

    // All payments should be before the specified date
    response.body.payments.forEach(payment => {
      expect(new Date(payment.scheduled_date) < new Date('2025-12-31')).toBe(true);
    });
  });

  test('GET /payments should handle multiple filters', async () => {
    const response = await request(API_BASE_URL)
      .get('/payments?recipient=Jane&after=2025-01-01')
      .expect(200);

    // Verify filtering worked
    expect(response.body.payments.length).toBeGreaterThan(0);

    // Should have Jane in recipient and date after 2025-01-01
    response.body.payments.forEach(payment => {
      expect(payment.recipient.toLowerCase()).toContain('jane');
      expect(new Date(payment.scheduled_date) > new Date('2025-01-01')).toBe(true);
    });
  });

  test('GET /payments should return empty array for no matches', async () => {
    const response = await request(API_BASE_URL)
      .get('/payments?recipient=NonExistentPerson')
      .expect(200);

    expect(response.body.payments).toEqual([]);
    expect(response.body.count).toBe(0);
    expect(response.body.totalAmount).toBe(0);
  });

  test('GET /payments should only return pending payments', async () => {
    const response = await request(API_BASE_URL)
      .get('/payments')
      .expect(200);

    // All returned payments should have status 'pending'
    response.body.payments.forEach(payment => {
      expect(payment.status).toBe('pending');
    });
  });

  test('GET /payments should highlight recent payments (within 24 hours)', async () => {
    const response = await request(API_BASE_URL)
      .get('/payments')
      .expect(200);

    // Check if payments have the isWithin24Hours property
    response.body.payments.forEach(payment => {
      expect(payment).toHaveProperty('isWithin24Hours');
      expect(typeof payment.isWithin24Hours).toBe('boolean');
    });

    // Count highlighted payments
    const highlightedPayments = response.body.payments.filter(p => p.isWithin24Hours);
    expect(highlightedPayments.length).toBeGreaterThanOrEqual(0);
  });

  test('GET /payments/:id should return specific payment', async () => {
    // First get all payments to find a valid ID
    const allPayments = await request(API_BASE_URL)
      .get('/payments')
      .expect(200);

    if (allPayments.body.payments.length > 0) {
      const paymentId = allPayments.body.payments[0].id;

      const response = await request(API_BASE_URL)
        .get(`/payments/${paymentId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('dataSource');
      expect(response.body.id).toBe(paymentId);
      expect(response.body.dataSource).toMatch(/^(Local|DynamoDB)$/);
    }
  });

  test('GET /payments/:id should return 404 for non-existent payment', async () => {
    const response = await request(API_BASE_URL)
      .get('/payments/non-existent-id')
      .expect(404);

    expect(response.body).toEqual({
      error: 'Payment not found'
    });
  });

  test('GET /payments should return 400 for invalid filters', async () => {
    const response = await request(API_BASE_URL)
      .get('/payments?after=2025-01-01&before=2024-01-01')
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Invalid filters');
  });

  test('GET /payments should handle invalid date format gracefully', async () => {
    const response = await request(API_BASE_URL)
      .get('/payments?after=invalid-date')
      .expect(200);

    // Should return all payments when date is invalid
    expect(response.body.payments).toBeDefined();
    expect(Array.isArray(response.body.payments)).toBe(true);
  });

  test('GET /payments should handle empty recipient gracefully', async () => {
    const response = await request(API_BASE_URL)
      .get('/payments?recipient=')
      .expect(200);

    // Should return all payments when recipient is empty
    expect(response.body.payments).toBeDefined();
    expect(Array.isArray(response.body.payments)).toBe(true);
  });

  test('API should handle CORS headers', async () => {
    const response = await request(API_BASE_URL)
      .get('/payments')
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBe('*');
  });

  test('API should return 404 for unknown routes', async () => {
    const response = await request(API_BASE_URL)
      .get('/unknown-route')
      .expect(404);

    // Different APIs may return different 404 formats
    expect(response.status).toBe(404);
  });

  test('API should calculate total amount correctly', async () => {
    const response = await request(API_BASE_URL)
      .get('/payments')
      .expect(200);

    const expectedTotal = response.body.payments.reduce((sum, payment) => {
      return sum + payment.amount;
    }, 0);

    expect(response.body.totalAmount).toBe(expectedTotal);
  });

  test('API should handle case-insensitive recipient filtering', async () => {
    const lowerResponse = await request(API_BASE_URL)
      .get('/payments?recipient=john')
      .expect(200);

    const upperResponse = await request(API_BASE_URL)
      .get('/payments?recipient=JOHN')
      .expect(200);

    // Both should return the same results
    expect(lowerResponse.body.payments).toEqual(upperResponse.body.payments);
  });

  test('API should handle partial recipient matching', async () => {
    const response = await request(API_BASE_URL)
      .get('/payments?recipient=Jo')
      .expect(200);

    // Should match any recipient containing "Jo" (like "John")
    response.body.payments.forEach(payment => {
      expect(payment.recipient.toLowerCase()).toContain('jo');
    });
  });
});
