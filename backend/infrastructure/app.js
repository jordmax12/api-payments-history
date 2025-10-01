#!/usr/bin/env node

const { App } = require('aws-cdk-lib');
const { PaymentsApiStack } = require('./payments-api-stack');

const app = new App();

new PaymentsApiStack(app, 'PaymentsApiStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});

app.synth();
