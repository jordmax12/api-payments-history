const { Stack, Duration, CfnOutput } = require('aws-cdk-lib');
const { Function, Runtime, Code } = require('aws-cdk-lib/aws-lambda');
const { RestApi, LambdaIntegration } = require('aws-cdk-lib/aws-apigateway');
const path = require('path');

class PaymentsApiStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Lambda function
    const paymentsLambda = new Function(this, 'PaymentsApiFunction', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'lambda.handler',
      code: Code.fromAsset(path.join(__dirname, '..'), {
        exclude: ['cdk.out', '.git', 'infrastructure', 'README.md', '*.md', '.env*', '__tests__', 'eslint.config.js']
      }),
      timeout: Duration.seconds(29)
    });

    // API Gateway
    const api = new RestApi(this, 'PaymentsApi', {
      restApiName: 'Payments API'
    });

    // Add proxy resource to handle all routes
    api.root.addProxy({
      defaultIntegration: new LambdaIntegration(paymentsLambda),
      anyMethod: true
    });

    // Output the API URL
    new CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL'
    });
  }
}

module.exports = { PaymentsApiStack };
