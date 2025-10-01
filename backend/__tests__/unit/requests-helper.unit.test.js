const { isWithin24Hours, validateFilters } = require('../../src/requests-helper');

describe('Requests Helper Unit Tests', () => {

  test('isWithin24Hours should return true for dates within 24 hours', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    expect(isWithin24Hours(tomorrowStr)).toBe(true);
  });

  test('isWithin24Hours should return false for dates beyond 24 hours', () => {
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0];

    expect(isWithin24Hours(dayAfterTomorrowStr)).toBe(false);
  });

  test('isWithin24Hours should return false for past dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    expect(isWithin24Hours(yesterdayStr)).toBe(false);
  });

  test('validateFilters should return valid for empty filters', () => {
    const result = validateFilters({});
    expect(result.isValid).toBe(true);
  });

  test('validateFilters should return valid for single date filter', () => {
    const filters = {
      after: '2025-01-01'
    };

    const result = validateFilters(filters);
    expect(result.isValid).toBe(true);
  });

  test('validateFilters should return invalid for before and after together', () => {
    const filters = {
      after: '2025-01-01',
      before: '2025-12-31'  // Can't have both before and after
    };

    const result = validateFilters(filters);
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('validateFilters should return invalid for conflicting date filters', () => {
    const filters = {
      after: '2025-01-01',
      date: '2025-06-15'  // Can't have both after and date
    };

    const result = validateFilters(filters);
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('validateFilters should return invalid for bad date formats', () => {
    const filters = {
      date: 'invalid-date'
    };

    const result = validateFilters(filters);
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('validateFilters should return valid for valid recipient', () => {
    const filters = {
      recipient: 'John Doe'
    };

    const result = validateFilters(filters);
    expect(result.isValid).toBe(true);
  });

  test('validateFilters should return invalid for empty recipient', () => {
    const filters = {
      recipient: '   '  // Only whitespace should be invalid
    };

    const result = validateFilters(filters);
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
