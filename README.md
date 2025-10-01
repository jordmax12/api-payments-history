# API Payments History

Full-stack payments history application with Express API backend and React frontend.

## Architecture

- **Backend**: Express API + DynamoDB (Lambda) / JSON (Local)
- **Frontend**: React TypeScript with payments table and filtering
- **Deployment**: AWS Lambda + API Gateway + S3 (Static Site)

## Quick Start

```bash
# Install all dependencies
npm install

# Run both backend (port 3000) and frontend (port 3001)
npm run dev

# Or run individually
npm run dev:backend    # API server only
npm run dev:frontend   # React app only
```

## Project Structure

```
├── backend/           # Express API + CDK deployment
├── frontend/          # React TypeScript app
└── package.json      # Workspace root with scripts
```

## Features

✅ **Backend API**
- `/payments` - List pending payments with filtering
- `/payments/:id` - Get payment by ID
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
npm run test         # Run all tests
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
