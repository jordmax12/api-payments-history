const js = require('@eslint/js');

module.exports = [
  {
    // Apply to all JavaScript files
    files: ['**/*.js'],
    // Enable recommended ESLint rules
    ...js.configs.recommended,
    // Define the environment for Node.js
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        // Allow Node.js globals
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        // Jest globals
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        it: 'readonly',
        jest: 'readonly'
      }
    },
    // Custom rules for your Express application
    rules: {
      // Enforce strict equality (===)
      'eqeqeq': 'error',
      // Prevent unused variables
      'no-unused-vars': ['warn', { argsIgnorePattern: 'next' }],

      // Formatting rules
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'never'],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],
      'space-before-blocks': 'error',
      'space-infix-ops': 'error',
      'keyword-spacing': 'error',
      'comma-spacing': ['error', { 'before': false, 'after': true }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'no-multiple-empty-lines': ['error', { 'max': 2, 'maxEOF': 1 }]
    }
  },
  // Ignore specific files or directories
  {
    ignores: ['node_modules/', 'dist/', 'coverage/']
  }
];
