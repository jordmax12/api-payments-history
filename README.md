# API Payments History

For an interview process, a payments history API built with Node.js and Express. This application can run both locally and as an AWS Lambda function.

## Architecture

- **Local Development**: Express server running on localhost
- **Production**: AWS Lambda function behind API Gateway (deployed via CDK)
- **Hybrid Approach**: Same codebase works in both environments using `serverless-http`

## Setup

1. **Use Node.js v22** (managed with nvm):
   ```bash
   nvm use
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Local Development

**Start the server locally**:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server runs on http://localhost:3000

## AWS Deployment

**Deploy to AWS using CDK**:
```bash
# First time setup (if you haven't used CDK before)
npx cdk bootstrap

# Deploy the stack
npm run deploy

# View the CloudFormation template
npm run synth
```

## API Endpoints

### Test Endpoint
- **GET** `/test` - Returns "Hello World" with status 200

### Payments API
- **GET** `/payments` - List all pending payments with optional filtering
  - Query parameters:
    - `recipient` - Filter by recipient name (partial match)
    - `after` - Filter payments scheduled after this date (YYYY-MM-DD)
    - `before` - Filter payments scheduled before this date (YYYY-MM-DD)
    - `date` - Filter payments scheduled on exact date (YYYY-MM-DD)
  
  Examples:
  ```bash
  GET /payments
  GET /payments?recipient=John
  GET /payments?after=2025-07-25
  GET /payments?recipient=Jane&after=2025-10-01
  ```

- **GET** `/payments/:id` - Get specific payment by ID

### Health Check
- **GET** `/health` - Server health status (shows if running locally or in Lambda)

## Sample Data

The app loads sample payment data from `data/payments.json`. Each payment has:
```json
{
  "id": "txn_001",
  "amount": 5000,
  "currency": "USD",
  "scheduled_date": "2025-07-26",
  "recipient": "John Doe"
}
```

## Response Format

The `/payments` endpoint returns:
```json
{
  "payments": [...],
  "count": 5,
  "totalAmount": 12500,
  "currency": "USD"
}
```

## Features

- ✅ **24-Hour Highlighting**: Payments scheduled within 24 hours have `isWithin24Hours: true`
- ✅ **Total Amount Calculation**: Shows sum of filtered results
- ✅ **Flexible Filtering**: By recipient, date ranges, or exact dates
- ✅ **Hybrid Deployment**: Same code runs locally and in Lambda
- ✅ **CDK Infrastructure**: One-command deployment to AWS

## Project Structure

```
├── app.js              # Express application (shared)
├── server.js           # Local server entry point
├── lambda.js           # Lambda handler entry point
├── infrastructure/     # CDK deployment code
│   ├── app.js         # CDK app
│   └── payments-api-stack.js  # Stack definition
├── package.json        # Dependencies and scripts
└── cdk.json           # CDK configuration
```

## Development vs Production

- **Local**: Express server with hot reload
- **Lambda**: Serverless function with API Gateway
- **Detection**: Uses `AWS_LAMBDA_FUNCTION_NAME` environment variable
- **Same Code**: No changes needed between environments