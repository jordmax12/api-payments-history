const fs = require('fs');
const path = require('path');

// Lazy-load AWS SDK modules to prevent initialization issues in tests
let DynamoDBClient, DynamoDBDocumentClient, ScanCommand, GetCommand;

const loadAwsSdk = () => {
  if (!DynamoDBClient) {
    const clientModule = require('@aws-sdk/client-dynamodb');
    const libModule = require('@aws-sdk/lib-dynamodb');

    DynamoDBClient = clientModule.DynamoDBClient;
    DynamoDBDocumentClient = libModule.DynamoDBDocumentClient;
    ScanCommand = libModule.ScanCommand;
    GetCommand = libModule.GetCommand;
  }
};

// Environment detection
const isLambdaEnvironment = () => !!process.env.AWS_LAMBDA_FUNCTION_NAME;

// Data loading functions
const loadLocalData = () => {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'payments-test.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.warn('Could not load local payments data:', error.message);
    return [];
  }
};

// DynamoDB client creation
const createDynamoClient = () => {
  loadAwsSdk(); // Ensure AWS SDK is loaded
  const region = process.env.AWS_REGION || 'us-east-1';
  const dynamoClient = new DynamoDBClient({ region });
  return DynamoDBDocumentClient.from(dynamoClient);
};

// Core data access functions
const getAllPayments = async (options = {}) => {
  const { isLambda = isLambdaEnvironment(), docClient, localData } = options;

  if (isLambda) {
    // DynamoDB scan
    loadAwsSdk(); // Ensure AWS SDK is loaded
    const client = docClient || createDynamoClient();
    const tableName = process.env.PAYMENTS_TABLE_NAME || 'PaymentsTable';
    const command = new ScanCommand({ TableName: tableName });
    const result = await client.send(command);
    return result.Items || [];
  } else {
    // Return local JSON data
    return localData || loadLocalData();
  }
};

const getPendingPayments = async (options = {}) => {
  const allPayments = await getAllPayments(options);
  return allPayments.filter(payment => payment.status === 'pending');
};

const getPaymentById = async (id, options = {}) => {
  const { isLambda = isLambdaEnvironment(), docClient, localData } = options;

  if (isLambda) {
    // DynamoDB get item
    loadAwsSdk(); // Ensure AWS SDK is loaded
    const client = docClient || createDynamoClient();
    const tableName = process.env.PAYMENTS_TABLE_NAME || 'PaymentsTable';
    const command = new GetCommand({
      TableName: tableName,
      Key: { id }
    });
    const result = await client.send(command);
    return result.Item || null;
  } else {
    // Find in local JSON data
    const data = localData || loadLocalData();
    return data.find(payment => payment.id === id) || null;
  }
};

const getPaymentsWithFilters = async (filters = {}, options = {}) => {
  const pendingPayments = await getPendingPayments(options);
  let filteredPayments = [...pendingPayments];

  // Filter by recipient
  if (filters.recipient) {
    const recipient = filters.recipient.toLowerCase();
    filteredPayments = filteredPayments.filter(payment =>
      payment.recipient.toLowerCase().includes(recipient)
    );
  }

  // Filter by date (after)
  if (filters.after) {
    const afterDate = new Date(filters.after);
    filteredPayments = filteredPayments.filter(payment =>
      new Date(payment.scheduled_date) > afterDate
    );
  }

  // Filter by date (before)
  if (filters.before) {
    const beforeDate = new Date(filters.before);
    filteredPayments = filteredPayments.filter(payment =>
      new Date(payment.scheduled_date) < beforeDate
    );
  }

  // Filter by exact date
  if (filters.date) {
    filteredPayments = filteredPayments.filter(payment =>
      payment.scheduled_date === filters.date
    );
  }

  return filteredPayments;
};

// Export functional API only
module.exports = {
  getAllPayments,
  getPendingPayments,
  getPaymentById,
  getPaymentsWithFilters,
  loadLocalData,
  createDynamoClient,
  isLambdaEnvironment
};
