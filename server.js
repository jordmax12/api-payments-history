const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoints
app.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Hello World',
    statusCode: 200
  });
});


// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
