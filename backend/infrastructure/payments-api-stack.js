const { Stack, Duration, CfnOutput, RemovalPolicy } = require('aws-cdk-lib');
const { Function, Runtime, Code } = require('aws-cdk-lib/aws-lambda');
const { RestApi, LambdaIntegration, Cors } = require('aws-cdk-lib/aws-apigateway');
const { Table, AttributeType, BillingMode } = require('aws-cdk-lib/aws-dynamodb');
const { Bucket } = require('aws-cdk-lib/aws-s3');
const { BucketDeployment, Source } = require('aws-cdk-lib/aws-s3-deployment');
const { Distribution, OriginAccessIdentity } = require('aws-cdk-lib/aws-cloudfront');
const { S3Origin } = require('aws-cdk-lib/aws-cloudfront-origins');
const path = require('path');

class PaymentsApiStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // DynamoDB table for payments
    const paymentsTable = new Table(this, 'PaymentsTable', {
      tableName: 'PaymentsTable',
      partitionKey: { name: 'id', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: require('aws-cdk-lib').RemovalPolicy.DESTROY
    });

    // Lambda function
    const paymentsLambda = new Function(this, 'PaymentsApiFunction', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'lambda.handler',
      code: Code.fromAsset(path.join(__dirname, '..'), {
        exclude: [
          'cdk.out/**',
          'infrastructure/**',
          '.git/**',
          '__tests__/**',
          'coverage/**',
          'node_modules/@aws-sdk/**',
          'node_modules/@smithy/**',
          'node_modules/aws-cdk-lib/**',
          'node_modules/constructs/**',
          'node_modules/@eslint/**',
          'node_modules/eslint/**',
          'node_modules/jest/**',
          'node_modules/supertest/**',
          'node_modules/nodemon/**',
          'node_modules/dotenv-cli/**',
          'node_modules/.bin/**',
          '*.md',
          '.env*',
          'eslint.config.js',
          'jest.config.js'
        ]
      }),
      timeout: Duration.seconds(29),
      environment: {
        PAYMENTS_TABLE_NAME: paymentsTable.tableName
      }
    });

    // Grant Lambda permissions to read from DynamoDB
    paymentsTable.grantReadData(paymentsLambda);

    // API Gateway with CORS
    const api = new RestApi(this, 'PaymentsApi', {
      restApiName: 'Payments API',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization']
      }
    });

    // Add proxy resource to handle all routes
    api.root.addProxy({
      defaultIntegration: new LambdaIntegration(paymentsLambda),
      anyMethod: true
    });

    // S3 bucket for frontend hosting
    const frontendBucket = new Bucket(this, 'FrontendBucket', {
      bucketName: `payments-frontend-${this.account}-${this.region}`,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    // CloudFront Origin Access Identity
    const originAccessIdentity = new OriginAccessIdentity(this, 'OAI', {
      comment: 'OAI for payments frontend'
    });

    // Grant CloudFront access to S3 bucket
    frontendBucket.grantRead(originAccessIdentity);

    // CloudFront distribution
    const distribution = new Distribution(this, 'FrontendDistribution', {
      defaultBehavior: {
        origin: new S3Origin(frontendBucket, {
          originAccessIdentity: originAccessIdentity
        })
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html'
        }
      ]
    });

    // Deploy frontend build to S3
    new BucketDeployment(this, 'FrontendDeployment', {
      sources: [Source.asset(path.join(__dirname, '..', '..', 'frontend', 'build'))],
      destinationBucket: frontendBucket,
      distribution: distribution,
      distributionPaths: ['/*']
    });

    // Output URLs
    new CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL'
    });

    new CfnOutput(this, 'FrontendUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'Frontend CloudFront URL'
    });

    new CfnOutput(this, 'FrontendBucketName', {
      value: frontendBucket.bucketName,
      description: 'S3 Bucket for frontend'
    });
  }
}

module.exports = { PaymentsApiStack };
