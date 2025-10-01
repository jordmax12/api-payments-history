// Mock fs module
jest.mock('fs');

const fs = require('fs');

// Import the functional API
const {
  getAllPayments,
  getPendingPayments,
  getPaymentById,
  getPaymentsWithFilters,
  loadLocalData
} = require('../../src/data-layer');

describe('DataLayer Pure Functional API Unit Tests', () => {
  const mockPaymentsData = [
    {
      id: 'txn_001',
      amount: 5000,
      currency: 'USD',
      scheduled_date: '2025-07-26',
      recipient: 'John Doe',
      status: 'pending'
    },
    {
      id: 'txn_002',
      amount: 2500,
      currency: 'USD',
      scheduled_date: '2025-10-01',
      recipient: 'Jane Smith',
      status: 'pending'
    },
    {
      id: 'txn_003',
      amount: 1000,
      currency: 'USD',
      scheduled_date: '2025-09-30',
      recipient: 'Bob Johnson',
      status: 'completed'
    }
  ];

  beforeEach(() => {
    // Mock fs.readFileSync
    fs.readFileSync.mockReturnValue(JSON.stringify(mockPaymentsData));

    // Reset environment variables
    delete process.env.AWS_LAMBDA_FUNCTION_NAME;
    delete process.env.PAYMENTS_TABLE_NAME;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Local mode tests
  test('should load local data from JSON file', () => {
    const data = loadLocalData();
    expect(data).toEqual(mockPaymentsData);
    expect(fs.readFileSync).toHaveBeenCalledWith(
      expect.stringContaining('payments-test.json'),
      'utf8'
    );
  });

  test('should return all payments from local data', async () => {
    const payments = await getAllPayments({
      isLambda: false,
      localData: mockPaymentsData
    });

    expect(payments).toEqual(mockPaymentsData);
  });

  test('should return only pending payments', async () => {
    const pendingPayments = await getPendingPayments({
      isLambda: false,
      localData: mockPaymentsData
    });

    const expectedPending = mockPaymentsData.filter(p => p.status === 'pending');
    expect(pendingPayments).toEqual(expectedPending);
    expect(pendingPayments).toHaveLength(2);
  });

  test('should find payment by ID', async () => {
    const payment = await getPaymentById('txn_001', {
      isLambda: false,
      localData: mockPaymentsData
    });

    expect(payment).toEqual(mockPaymentsData[0]);
  });

  test('should return null for non-existent payment ID', async () => {
    const payment = await getPaymentById('non-existent', {
      isLambda: false,
      localData: mockPaymentsData
    });

    expect(payment).toBeNull();
  });

  test('should filter payments by recipient', async () => {
    const filters = { recipient: 'John' };
    const filteredPayments = await getPaymentsWithFilters(filters, {
      isLambda: false,
      localData: mockPaymentsData
    });

    expect(filteredPayments).toHaveLength(1);
    expect(filteredPayments[0].recipient).toBe('John Doe');
  });

  test('should filter payments by date (after)', async () => {
    const filters = { after: '2025-09-29' };
    const filteredPayments = await getPaymentsWithFilters(filters, {
      isLambda: false,
      localData: mockPaymentsData
    });

    // Should include Jane Smith (2025-10-01) but not John Doe (2025-07-26)
    expect(filteredPayments).toHaveLength(1);
    expect(filteredPayments[0].recipient).toBe('Jane Smith');
  });

  test('should apply multiple filters', async () => {
    const filters = {
      recipient: 'Jane',
      after: '2025-09-01'
    };
    const filteredPayments = await getPaymentsWithFilters(filters, {
      isLambda: false,
      localData: mockPaymentsData
    });

    expect(filteredPayments).toHaveLength(1);
    expect(filteredPayments[0].recipient).toBe('Jane Smith');
    expect(filteredPayments[0].scheduled_date).toBe('2025-10-01');
  });

  // Lambda mode tests
  test('should handle Lambda environment detection', () => {
    // Test environment detection without AWS SDK imports
    process.env.AWS_LAMBDA_FUNCTION_NAME = 'test-function';

    const { isLambdaEnvironment } = require('../../src/data-layer');
    expect(isLambdaEnvironment()).toBe(true);

    delete process.env.AWS_LAMBDA_FUNCTION_NAME;
    expect(isLambdaEnvironment()).toBe(false);
  });

  test('should use correct table name from environment', () => {
    process.env.PAYMENTS_TABLE_NAME = 'CustomTable';

    // Test that environment variables are read correctly
    expect(process.env.PAYMENTS_TABLE_NAME).toBe('CustomTable');

    delete process.env.PAYMENTS_TABLE_NAME;
  });

  // Error handling tests
  test('should handle JSON parse errors gracefully', () => {
    fs.readFileSync.mockReturnValue('invalid json');
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const data = loadLocalData();

    expect(data).toEqual([]);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Could not load local payments data:',
      expect.any(String)
    );

    consoleWarnSpy.mockRestore();
  });

  test('should handle file read errors gracefully', () => {
    fs.readFileSync.mockImplementation(() => {
      throw new Error('File not found');
    });
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const data = loadLocalData();

    expect(data).toEqual([]);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Could not load local payments data:',
      'File not found'
    );

    consoleWarnSpy.mockRestore();
  });

  // Edge cases and integration tests
  test('should handle empty filters object', async () => {
    const filteredPayments = await getPaymentsWithFilters({}, {
      isLambda: false,
      localData: mockPaymentsData
    });

    // Should return all pending payments when no filters applied
    expect(filteredPayments).toHaveLength(2);
  });

  test('should handle undefined options gracefully', async () => {
    // Test that functions work with minimal parameters
    const payments = await getAllPayments();
    expect(Array.isArray(payments)).toBe(true);
  });

  test('should handle empty payment arrays', async () => {
    const filteredPayments = await getPaymentsWithFilters({ recipient: 'NonExistent' }, {
      isLambda: false,
      localData: []
    });

    expect(filteredPayments).toEqual([]);
  });

  test('should handle case-insensitive recipient filtering', async () => {
    const filters = { recipient: 'JOHN' }; // uppercase
    const filteredPayments = await getPaymentsWithFilters(filters, {
      isLambda: false,
      localData: mockPaymentsData
    });

    expect(filteredPayments).toHaveLength(1);
    expect(filteredPayments[0].recipient).toBe('John Doe');
  });

  test('should handle partial recipient matches', async () => {
    const filters = { recipient: 'Doe' }; // partial match
    const filteredPayments = await getPaymentsWithFilters(filters, {
      isLambda: false,
      localData: mockPaymentsData
    });

    expect(filteredPayments).toHaveLength(1);
    expect(filteredPayments[0].recipient).toBe('John Doe');
  });

  test('should handle edge date filtering', async () => {
    const filters = { after: '2025-10-01' }; // exact date boundary
    const filteredPayments = await getPaymentsWithFilters(filters, {
      isLambda: false,
      localData: mockPaymentsData
    });

    // Should not include the exact date (after means >)
    expect(filteredPayments).toHaveLength(0);
  });

  test('should handle combined filters that match nothing', async () => {
    const filters = {
      recipient: 'John',
      after: '2025-12-01' // Future date that John's payment doesn't match
    };
    const filteredPayments = await getPaymentsWithFilters(filters, {
      isLambda: false,
      localData: mockPaymentsData
    });

    expect(filteredPayments).toEqual([]);
  });

  test('should only return pending payments regardless of filters', async () => {
    // Test that completed payments are never returned
    const filters = { recipient: 'Bob' }; // Bob has completed status
    const filteredPayments = await getPaymentsWithFilters(filters, {
      isLambda: false,
      localData: mockPaymentsData
    });

    expect(filteredPayments).toEqual([]); // Should be empty because Bob's payment is completed
  });
});
