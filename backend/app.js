const express = require('express');
const cors = require('cors');
const DataLayer = require('./src/data-layer');
const { isWithin24Hours, validateFilters } = require('./src/requests-helper');

const app = express();
const dataLayer = new DataLayer();

app.use(cors());
app.use(express.json());

app.get('/payments', async (req, res) => {
  try {
    const filters = {
      recipient: req.query.recipient,
      after: req.query.after,
      before: req.query.before,
      date: req.query.date
    };

    const validFilters = validateFilters(filters);

    const { isValid: isValidRequest, error: errorRequest } = validFilters;

    if (!isValidRequest) {
      return res.status(errorRequest?.status || 400).json(errorRequest?.message || 'Invalid request most likely bad filters.');
    }

    const filteredPayments = await dataLayer.getPaymentsWithFilters(filters);

    // Add 24-hour highlight flag to each payment
    const paymentsWithHighlight = filteredPayments.map(payment => ({
      ...payment,
      isWithin24Hours: isWithin24Hours(payment.scheduled_date)
    }));

    // Calculate total amount for filtered results
    const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);

    res.json({
      payments: paymentsWithHighlight,
      count: filteredPayments.length,
      totalAmount: totalAmount,
      currency: filteredPayments.length > 0 ? filteredPayments[0].currency : 'USD',
      dataSource: dataLayer.isLambda ? 'DynamoDB' : 'Local JSON'
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/payments/:id', async (req, res) => {
  try {
    const payment = await dataLayer.getPaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      ...payment,
      isWithin24Hours: isWithin24Hours(payment.scheduled_date),
      dataSource: dataLayer.isLambda ? 'DynamoDB' : 'Local'
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.AWS_LAMBDA_FUNCTION_NAME ? 'lambda' : 'local',
    dataSource: dataLayer.isLambda ? 'DynamoDB' : 'Local JSON'
  });
});

module.exports = app;
