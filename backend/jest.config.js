module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/cdk.out/'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!**/node_modules/**',
    '!**/cdk.out/**',
    '!infrastructure/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 70,
      lines: 60,
      statements: 65
    }
  },
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  modulePathIgnorePatterns: [
    '<rootDir>/cdk.out/'
  ]
};
