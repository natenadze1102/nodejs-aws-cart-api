import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs'; // Add logs import
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

export class CartServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Lambda function for the Cart Service
    const cartServiceLambda = new lambda.Function(this, 'CartServiceLambda', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'dist/src/lambda.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../'), {
        exclude: [
          'cdk.out',
          'cdk/node_modules',
          'node_modules/aws-cdk',
          'node_modules/@types',
          'node_modules/typescript',
          'node_modules/jest',
          'node_modules/.bin',
          '.git',
          'test',
          'coverage',
          '**/*.map',
          '**/*.ts',
        ],
      }),
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,

      // Enhanced logging
      logRetention: logs.RetentionDays.ONE_WEEK,
      tracing: lambda.Tracing.ACTIVE, // Enable X-Ray tracing

      environment: {
        NODE_ENV: 'production',
        DB_HOST: process.env.DB_HOST || '',
        DB_PORT: process.env.DB_PORT || '5432',
        DB_USERNAME: process.env.DB_USERNAME || '',
        DB_PASSWORD: process.env.DB_PASSWORD || '',
        DB_NAME: process.env.DB_NAME || '',
        DB_SSL: process.env.DB_SS || true,
        DB_SYNC: 'true', // Enable sync so tables are created if they don't exist
        DB_LOGGING: 'true',
        AUTH_DISABLED: 'false', // Add this to control authentication in code
        DEBUG: '*', // Enable all debug logs
      },
    });

    // Create API Gateway REST API with binary support and better CORS
    const api = new apigateway.RestApi(this, 'CartServiceApi', {
      restApiName: 'Cart Service API',
      description: 'API for Cart Service',
      binaryMediaTypes: ['*/*'], // Allow all binary media types
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Requested-With',
          'Accept',
          'Origin',
          'Access-Control-Allow-Headers',
          'Access-Control-Allow-Methods',
          'Access-Control-Allow-Origin',
        ],
        allowCredentials: true,
      },
      deployOptions: {
        stageName: 'prod',
        tracingEnabled: true, // Enable API Gateway tracing
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true, // Log request/response bodies
        metricsEnabled: true,
      },
    });

    // Enhanced Lambda integration
    const lambdaIntegration = new apigateway.LambdaIntegration(
      cartServiceLambda,
      {
        proxy: true, // Use Lambda Proxy integration
        timeout: cdk.Duration.seconds(29), // API Gateway timeout (must be less than Lambda timeout)
        allowTestInvoke: true, // Allow test invocations from API Gateway console
      },
    );

    // Add explicit routes for health check, auth, and cart
    const apiResource = api.root.addResource('api');

    // Auth routes
    const authResource = apiResource.addResource('auth');
    const loginResource = authResource.addResource('login');
    loginResource.addMethod('POST', lambdaIntegration);

    const registerResource = authResource.addResource('register');
    registerResource.addMethod('POST', lambdaIntegration);

    // Profile and cart routes
    const profileResource = apiResource.addResource('profile');
    profileResource.addMethod('GET', lambdaIntegration);

    const cartResource = profileResource.addResource('cart');
    cartResource.addMethod('GET', lambdaIntegration);
    cartResource.addMethod('PUT', lambdaIntegration);
    cartResource.addMethod('DELETE', lambdaIntegration);

    const orderResource = cartResource.addResource('order');
    orderResource.addMethod('PUT', lambdaIntegration);
    orderResource.addMethod('GET', lambdaIntegration);

    const ordersResource = apiResource.addResource('orders');
    ordersResource.addMethod('GET', lambdaIntegration);
    ordersResource.addMethod('POST', lambdaIntegration);

    const orderIdResource = ordersResource.addResource('{id}');
    orderIdResource.addMethod('GET', lambdaIntegration);

    const historyResource = orderIdResource.addResource('history');
    historyResource.addMethod('GET', lambdaIntegration);

    const orderStatusResource = orderIdResource.addResource('status');
    orderStatusResource.addMethod('PUT', lambdaIntegration);

    // Health check
    api.root.addMethod('GET', lambdaIntegration);

    // Catch-all route at the end
    api.root.addProxy({
      defaultIntegration: lambdaIntegration,
      anyMethod: true,
    });

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'URL of the API Gateway endpoint',
    });
  }
}
