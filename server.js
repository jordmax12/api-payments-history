const app = require('./app');

const PORT = process.env.PORT || 3000;

// Start server (only when running locally, not in Lambda)
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
