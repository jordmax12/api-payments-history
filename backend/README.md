# API Payments History

For an interview process, a payments history API built with Node.js and Express. This application can run both locally and as an AWS Lambda function.

## Architecture

- **Local Development**: Express server running on localhost
- **Production**: AWS Lambda function behind API Gateway (deployed via CDK)
- **Hybrid Approach**: Same codebase works in both environments using `serverless-http`

## Prerequisites

- **Node.js v22** (use nvm for version management)
- **AWS CLI** configured with credentials (for deployment)
- **Git** (for cloning)

## Quick Start

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd api-payments-history
   nvm use                    # Uses Node.js v22
   npm install
   ```

2. **Configure AWS credentials** (for deployment):
   ```bash
   cp .env-sample .env
   # Edit .env with your AWS credentials:
   # AWS_ACCESS_KEY_ID=your-access-key
   # AWS_SECRET_ACCESS_KEY=your-secret-key
   # AWS_DEFAULT_REGION=us-east-1
   ```

3. **Test locally**:
   ```bash
   npm run dev              # Start development server
   curl http://localhost:3000/test  # Should return "Hello World"
   ```

4. **Deploy to AWS** (optional):
   ```bash
   npm run bootstrap        # One-time AWS setup
   npm run deploy          # Deploy to Lambda + API Gateway
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

### Environment Variables Required

Create a `.env` file with your AWS credentials:
```bash
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_DEFAULT_REGION=us-east-1
```

### CDK Commands

```bash
# One-time setup per AWS account/region
npm run bootstrap

# Deploy your application
npm run deploy

# Preview CloudFormation template (without deploying)
npm run synth
```

### What Gets Deployed

- **Lambda Function**: Your Express app wrapped for serverless
- **API Gateway**: RESTful API endpoint
- **IAM Roles**: Necessary permissions for Lambda execution

After deployment, you'll get an API Gateway URL like:
```
https://abc123.execute-api.us-east-1.amazonaws.com/prod/test
```


## Sample Data

Sample payment data is available in `data/payments-test.json` for development. Each payment follows this structure:
```json
{
  "id": "txn_001",
  "amount": 5000,
  "currency": "USD",
  "scheduled_date": "2025-07-26",
  "recipient": "John Doe"
}
```

## Features

- ✅ **Hybrid Deployment**: Same code runs locally and in Lambda
- ✅ **CDK Infrastructure**: One-command deployment to AWS
- ✅ **Environment Detection**: Automatically detects local vs Lambda environment
- ✅ **Single npm install**: No duplicate dependency management
- ✅ **Hot Reload**: Development server with auto-restart

## Project Structure

```
├── app.js                    # Express application (shared)
├── server.js                 # Local server entry point
├── lambda.js                 # Lambda handler entry point
├── data/
│   └── payments-test.json    # Sample payment data
├── infrastructure/           # CDK deployment code
│   ├── app.js               # CDK app
│   └── payments-api-stack.js # Stack definition
├── .env-sample              # Environment variables template
├── .nvmrc                   # Node.js version (22)
├── package.json             # Dependencies and scripts
└── cdk.json                # CDK configuration
```

## Troubleshooting

### Common Issues

1. **AWS credentials not found**:
   - Ensure `.env` file exists with correct variable names
   - Check `AWS_ACCESS_KEY_ID` (not `AWS_ACCESS_KEY`)

2. **CDK bootstrap fails**:
   - Verify AWS credentials are valid
   - Ensure you have permissions to create CloudFormation stacks

3. **Lambda deployment fails**:
   - Run `npm install` to ensure dependencies are present
   - Check CloudWatch logs for detailed error messages

## Development vs Production

- **Local**: Express server with hot reload on port 3000
- **Lambda**: Serverless function with API Gateway
- **Detection**: Uses `AWS_LAMBDA_FUNCTION_NAME` environment variable
- **Same Code**: No changes needed between environments
