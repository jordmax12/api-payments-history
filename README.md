# API Payments History

Full-stack payments history application with Express API backend and React frontend.

## Architecture

- **Backend**: Express API + DynamoDB (Lambda) / JSON (Local)
- **Frontend**: React TypeScript with payments table and filtering
- **Deployment**: AWS Lambda + API Gateway + S3 (Static Site)

## Quick Start

```bash
# Install dependencies (backend and frontend separately)
cd backend && npm install
cd ../frontend && npm install

# Run both backend (port 3000) and frontend (port 3001)
npm run dev

# Or run individually
npm run dev:backend    # API server only
npm run dev:frontend   # React app only
```

## Project Structure

```
├── backend/           # Express API + CDK deployment
│   ├── src/          # Data layer & request helpers
│   ├── __tests__/    # Unit & integration tests
│   ├── infrastructure/ # CDK deployment config
│   └── data/         # Local JSON test data
├── frontend/          # React TypeScript app
│   └── src/          # React components & styles
└── package.json      # Root orchestration scripts
```

**Note**: This is a simple monorepo without npm workspaces to avoid Lambda deployment complexity.

## Features

✅ **Backend API**
- `/payments` - List pending payments with filtering (recipient, date)
- `/payments/:id` - Get payment by ID
- `/health` - Health check endpoint
- DynamoDB (production) / JSON file (local development)

✅ **Frontend UI**
- Payments table with real-time filtering
- Filter by recipient and date
- 24-hour payment highlighting
- Total amount calculations
- Responsive design

## Development

**Prerequisites**: Node.js v22 (use `nvm use`)

**Environment Setup**:
```bash
# Backend needs AWS credentials for deployment
cp backend/.env-sample backend/.env
# Edit backend/.env with your AWS credentials
```

**Available Scripts**:
```bash
npm run dev          # Run both backend + frontend
npm run build        # Build both for production
npm run deploy       # Deploy backend to AWS
npm run test         # Run all tests (backend + frontend)
npm run test:backend # Run backend tests only
npm run test:frontend # Run frontend tests only
```

## Deployment

**Full-Stack Deployment to AWS**:
```bash
# First deployment (builds frontend + deploys everything)
npm run deploy

# After first deployment, update frontend/.env.production with the API URL
# Then redeploy to update frontend with correct API endpoint
npm run deploy
```

**What gets deployed**:
- **Backend**: Lambda + API Gateway + DynamoDB
- **Frontend**: S3 + CloudFront (global CDN)
- **CORS**: Automatically configured for cross-origin requests

See individual `backend/` and `frontend/` directories for detailed documentation.
