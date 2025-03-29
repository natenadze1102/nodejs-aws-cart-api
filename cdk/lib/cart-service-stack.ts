import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

// Load environment variables
dotenv.config();

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
      timeout: cdk.Duration.seconds(60), // Increased timeout
      memorySize: 512,
      // Remove VPC configuration entirely - no vpc or vpcSubnets properties

      environment: {
        NODE_ENV: 'production',
        DB_HOST: 'cart-service-db.cd66u40eafyf.eu-central-1.rds.amazonaws.com',
        DB_PORT: '5432',
        DB_USERNAME: 'postgres',
        DB_PASSWORD: '1tCez7g1ere6DNgTwQS7',
        DB_NAME: 'cartdb',
        DB_SSL: process.env.DB_SSL || 'true',
        DB_SYNC: process.env.DB_SYNC || 'false',
        DB_LOGGING: process.env.DB_LOGGING || 'true', // Enable logging for troubleshooting
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
