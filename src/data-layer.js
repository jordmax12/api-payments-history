const fs = require('fs');
const path = require('path');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const { AWS_LAMBDA_FUNCTION_NAME, PAYMENTS_TABLE_NAME, AWS_REGION } = process.env;

class DataLayer {
  constructor() {
    this.isLambda = !!AWS_LAMBDA_FUNCTION_NAME;
    this.tableName = PAYMENTS_TABLE_NAME || 'PaymentsTable';
    this._docClient = null; // Cache for DynamoDB client

    if (!this.isLambda) {
      // Load JSON data for local development
      this.loadLocalData();
    }
  }

  // Lazy initialization of DynamoDB client
  getDynamoClient() {
    if (!this._docClient && this.isLambda) {
      const dynamoClient = new DynamoDBClient({ region: AWS_REGION || 'us-east-1' });
      this._docClient = DynamoDBDocumentClient.from(dynamoClient);
    }
    return this._docClient;
  }

  loadLocalData() {
    try {
      const dataPath = path.join(__dirname, '..', 'data', 'payments-test.json');
      const rawData = fs.readFileSync(dataPath, 'utf8');
      this.localData = JSON.parse(rawData);
    } catch (error) {
      console.warn('Could not load local payments data:', error.message);
      this.localData = [];
    }
  }

  async getAllPayments() {
    if (this.isLambda) {
      // DynamoDB scan
      const docClient = this.getDynamoClient();
      const command = new ScanCommand({
        TableName: this.tableName
      });
      const result = await docClient.send(command);
      return result.Items || [];
    } else {
      // Return local JSON data
      return this.localData;
    }
  }

  async getPendingPayments() {
    const allPayments = await this.getAllPayments();
    return allPayments.filter(payment => payment.status === 'pending');
  }

  async getPaymentById(id) {
    if (this.isLambda) {
      // DynamoDB get item
      const docClient = this.getDynamoClient();
      const command = new GetCommand({
        TableName: this.tableName,
        Key: { id }
      });
      const result = await docClient.send(command);
      return result.Item || null;
    } else {
      // Find in local JSON data
      return this.localData.find(payment => payment.id === id) || null;
    }
  }

  async getPaymentsWithFilters(filters = {}) {
    const pendingPayments = await this.getPendingPayments();
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
  }
}

module.exports = DataLayer;
