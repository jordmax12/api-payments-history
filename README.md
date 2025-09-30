# API Payments History

For an interview process, a payments history API built with Node.js and Express.

## Setup

1. **Use Node.js v22** (managed with nvm):
   ```bash
   nvm use
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
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
- **GET** `/health` - Server health status

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

## Development

- Server runs on port 3000 by default
- Use `npm run dev` for development with auto-reload
