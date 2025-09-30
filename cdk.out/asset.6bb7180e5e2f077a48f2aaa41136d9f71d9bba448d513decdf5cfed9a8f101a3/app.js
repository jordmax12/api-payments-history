const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint - only endpoint we need for now
app.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Hello World',
    statusCode: 200
  });
});

module.exports = app;
