// In cart-service-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class CartServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Lambda function for the Cart Service
    const cartServiceLambda = new lambda.Function(this, 'CartServiceLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'lambda.handler', // This points to the compiled lambda handler in dist/src
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../dist/src'), {
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
          '**/*.map', // Source maps not needed in production
          '**/*.ts', // TypeScript source files not needed in production
        ],
      }),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,

      environment: {
        NODE_ENV: 'production',
        // Database configuration
        DB_HOST: process.env.DB_HOST || '',
        DB_PORT: process.env.DB_PORT || '5432',
        DB_USERNAME: process.env.DB_USERNAME || '',
        DB_PASSWORD: process.env.DB_PASSWORD || '',
        DB_NAME: process.env.DB_NAME || '',
        DB_SSL: process.env.DB_SSL || 'true',
        DB_SYNC: process.env.DB_SYNC || 'false',
        DB_LOGGING: process.env.DB_LOGGING || 'false',
      },
    });

    // Create API Gateway REST API
    const api = new apigateway.RestApi(this, 'CartServiceApi', {
      restApiName: 'Cart Service API',
      description: 'API for Cart Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });

    // Integrate API Gateway with Lambda
    const lambdaIntegration = new apigateway.LambdaIntegration(
      cartServiceLambda,
    );

    // Add proxy resource to handle all paths
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
