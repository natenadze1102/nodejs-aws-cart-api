"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartServiceStack = void 0;
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const logs = require("aws-cdk-lib/aws-logs"); // Add logs import
const path = require("path");
const dotenv = require("dotenv");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });
class CartServiceStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Create Lambda function for the Cart Service
        const cartServiceLambda = new lambda.Function(this, 'CartServiceLambda', {
            runtime: aws_lambda_1.Runtime.NODEJS_22_X,
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
                DB_NAME: 'cartdb',
                DB_SSL: 'true',
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
        const lambdaIntegration = new apigateway.LambdaIntegration(cartServiceLambda, {
            proxy: true, // Use Lambda Proxy integration
            timeout: cdk.Duration.seconds(29), // API Gateway timeout (must be less than Lambda timeout)
            allowTestInvoke: true, // Allow test invocations from API Gateway console
        });
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
exports.CartServiceStack = CartServiceStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FydC1zZXJ2aWNlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NhcnQtc2VydmljZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFFbkMsaURBQWlEO0FBQ2pELHlEQUF5RDtBQUN6RCw2Q0FBNkMsQ0FBQyxrQkFBa0I7QUFDaEUsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUNqQyx1REFBaUQ7QUFFakQsNkJBQTZCO0FBQzdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRS9ELE1BQWEsZ0JBQWlCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDN0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4Qiw4Q0FBOEM7UUFDOUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQ3ZFLE9BQU8sRUFBRSxvQkFBTyxDQUFDLFdBQVc7WUFDNUIsT0FBTyxFQUFFLHlCQUF5QjtZQUNsQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLEVBQUU7Z0JBQzdELE9BQU8sRUFBRTtvQkFDUCxTQUFTO29CQUNULGtCQUFrQjtvQkFDbEIsc0JBQXNCO29CQUN0QixxQkFBcUI7b0JBQ3JCLHlCQUF5QjtvQkFDekIsbUJBQW1CO29CQUNuQixtQkFBbUI7b0JBQ25CLE1BQU07b0JBQ04sTUFBTTtvQkFDTixVQUFVO29CQUNWLFVBQVU7b0JBQ1YsU0FBUztpQkFDVjthQUNGLENBQUM7WUFDRixPQUFPLEVBQUUsR0FB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QUFFLGlCQUFpQixDQUFDLENBQUM7UUFFcEQsTUFBTSxtQkFBbUIsR0FBRyxlQUFlLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xFLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUV4RCxlQUFlO1FBQ2YsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFFN0MsNkJBQTZCO1FBQzdCLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ2hCLGtCQUFrQixFQUFFLGlCQUFpQjtZQUNyQyxTQUFTLEVBQUUsSUFBSTtTQUNoQixDQUFDLENBQUM7UUFFSCxxQkFBcUI7UUFDckIsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDaEMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHO1lBQ2QsV0FBVyxFQUFFLGlDQUFpQztTQUMvQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUE1SUQsNENBNElDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgKiBhcyBsb2dzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sb2dzJzsgLy8gQWRkIGxvZ3MgaW1wb3J0XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZG90ZW52IGZyb20gJ2RvdGVudic7XG5pbXBvcnQgeyBSdW50aW1lIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5cbi8vIExvYWQgZW52aXJvbm1lbnQgdmFyaWFibGVzXG5kb3RlbnYuY29uZmlnKHsgcGF0aDogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uLy5lbnYnKSB9KTtcblxuZXhwb3J0IGNsYXNzIENhcnRTZXJ2aWNlU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLyBDcmVhdGUgTGFtYmRhIGZ1bmN0aW9uIGZvciB0aGUgQ2FydCBTZXJ2aWNlXG4gICAgY29uc3QgY2FydFNlcnZpY2VMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdDYXJ0U2VydmljZUxhbWJkYScsIHtcbiAgICAgIHJ1bnRpbWU6IFJ1bnRpbWUuTk9ERUpTXzIyX1gsXG4gICAgICBoYW5kbGVyOiAnZGlzdC9zcmMvbGFtYmRhLmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi8nKSwge1xuICAgICAgICBleGNsdWRlOiBbXG4gICAgICAgICAgJ2Nkay5vdXQnLFxuICAgICAgICAgICdjZGsvbm9kZV9tb2R1bGVzJyxcbiAgICAgICAgICAnbm9kZV9tb2R1bGVzL2F3cy1jZGsnLFxuICAgICAgICAgICdub2RlX21vZHVsZXMvQHR5cGVzJyxcbiAgICAgICAgICAnbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQnLFxuICAgICAgICAgICdub2RlX21vZHVsZXMvamVzdCcsXG4gICAgICAgICAgJ25vZGVfbW9kdWxlcy8uYmluJyxcbiAgICAgICAgICAnLmdpdCcsXG4gICAgICAgICAgJ3Rlc3QnLFxuICAgICAgICAgICdjb3ZlcmFnZScsXG4gICAgICAgICAgJyoqLyoubWFwJyxcbiAgICAgICAgICAnKiovKi50cycsXG4gICAgICAgIF0sXG4gICAgICB9KSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgIG1lbW9yeVNpemU6IDUxMixcblxuICAgICAgLy8gRW5oYW5jZWQgbG9nZ2luZ1xuICAgICAgbG9nUmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX1dFRUssXG4gICAgICB0cmFjaW5nOiBsYW1iZGEuVHJhY2luZy5BQ1RJVkUsIC8vIEVuYWJsZSBYLVJheSB0cmFjaW5nXG5cbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIE5PREVfRU5WOiAncHJvZHVjdGlvbicsXG4gICAgICAgIERCX0hPU1Q6IHByb2Nlc3MuZW52LkRCX0hPU1QgfHwgJycsXG4gICAgICAgIERCX1BPUlQ6IHByb2Nlc3MuZW52LkRCX1BPUlQgfHwgJzU0MzInLFxuICAgICAgICBEQl9VU0VSTkFNRTogcHJvY2Vzcy5lbnYuREJfVVNFUk5BTUUgfHwgJycsXG4gICAgICAgIERCX1BBU1NXT1JEOiBwcm9jZXNzLmVudi5EQl9QQVNTV09SRCB8fCAnJyxcbiAgICAgICAgREJfTkFNRTogJ2NhcnRkYicsXG4gICAgICAgIERCX1NTTDogJ3RydWUnLFxuICAgICAgICBEQl9TWU5DOiAndHJ1ZScsIC8vIEVuYWJsZSBzeW5jIHNvIHRhYmxlcyBhcmUgY3JlYXRlZCBpZiB0aGV5IGRvbid0IGV4aXN0XG4gICAgICAgIERCX0xPR0dJTkc6ICd0cnVlJyxcbiAgICAgICAgQVVUSF9ESVNBQkxFRDogJ2ZhbHNlJywgLy8gQWRkIHRoaXMgdG8gY29udHJvbCBhdXRoZW50aWNhdGlvbiBpbiBjb2RlXG4gICAgICAgIERFQlVHOiAnKicsIC8vIEVuYWJsZSBhbGwgZGVidWcgbG9nc1xuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBBUEkgR2F0ZXdheSBSRVNUIEFQSSB3aXRoIGJpbmFyeSBzdXBwb3J0IGFuZCBiZXR0ZXIgQ09SU1xuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ0NhcnRTZXJ2aWNlQXBpJywge1xuICAgICAgcmVzdEFwaU5hbWU6ICdDYXJ0IFNlcnZpY2UgQVBJJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQVBJIGZvciBDYXJ0IFNlcnZpY2UnLFxuICAgICAgYmluYXJ5TWVkaWFUeXBlczogWycqLyonXSwgLy8gQWxsb3cgYWxsIGJpbmFyeSBtZWRpYSB0eXBlc1xuICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XG4gICAgICAgIGFsbG93T3JpZ2luczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9PUklHSU5TLFxuICAgICAgICBhbGxvd01ldGhvZHM6IGFwaWdhdGV3YXkuQ29ycy5BTExfTUVUSE9EUyxcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBbXG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZScsXG4gICAgICAgICAgJ1gtQW16LURhdGUnLFxuICAgICAgICAgICdBdXRob3JpemF0aW9uJyxcbiAgICAgICAgICAnWC1BcGktS2V5JyxcbiAgICAgICAgICAnWC1BbXotU2VjdXJpdHktVG9rZW4nLFxuICAgICAgICAgICdYLVJlcXVlc3RlZC1XaXRoJyxcbiAgICAgICAgICAnQWNjZXB0JyxcbiAgICAgICAgICAnT3JpZ2luJyxcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLFxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLFxuICAgICAgICBdLFxuICAgICAgICBhbGxvd0NyZWRlbnRpYWxzOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIGRlcGxveU9wdGlvbnM6IHtcbiAgICAgICAgc3RhZ2VOYW1lOiAncHJvZCcsXG4gICAgICAgIHRyYWNpbmdFbmFibGVkOiB0cnVlLCAvLyBFbmFibGUgQVBJIEdhdGV3YXkgdHJhY2luZ1xuICAgICAgICBsb2dnaW5nTGV2ZWw6IGFwaWdhdGV3YXkuTWV0aG9kTG9nZ2luZ0xldmVsLklORk8sXG4gICAgICAgIGRhdGFUcmFjZUVuYWJsZWQ6IHRydWUsIC8vIExvZyByZXF1ZXN0L3Jlc3BvbnNlIGJvZGllc1xuICAgICAgICBtZXRyaWNzRW5hYmxlZDogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBFbmhhbmNlZCBMYW1iZGEgaW50ZWdyYXRpb25cbiAgICBjb25zdCBsYW1iZGFJbnRlZ3JhdGlvbiA9IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKFxuICAgICAgY2FydFNlcnZpY2VMYW1iZGEsXG4gICAgICB7XG4gICAgICAgIHByb3h5OiB0cnVlLCAvLyBVc2UgTGFtYmRhIFByb3h5IGludGVncmF0aW9uXG4gICAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDI5KSwgLy8gQVBJIEdhdGV3YXkgdGltZW91dCAobXVzdCBiZSBsZXNzIHRoYW4gTGFtYmRhIHRpbWVvdXQpXG4gICAgICAgIGFsbG93VGVzdEludm9rZTogdHJ1ZSwgLy8gQWxsb3cgdGVzdCBpbnZvY2F0aW9ucyBmcm9tIEFQSSBHYXRld2F5IGNvbnNvbGVcbiAgICAgIH0sXG4gICAgKTtcblxuICAgIC8vIEFkZCBleHBsaWNpdCByb3V0ZXMgZm9yIGhlYWx0aCBjaGVjaywgYXV0aCwgYW5kIGNhcnRcbiAgICBjb25zdCBhcGlSZXNvdXJjZSA9IGFwaS5yb290LmFkZFJlc291cmNlKCdhcGknKTtcblxuICAgIC8vIEF1dGggcm91dGVzXG4gICAgY29uc3QgYXV0aFJlc291cmNlID0gYXBpUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2F1dGgnKTtcbiAgICBjb25zdCBsb2dpblJlc291cmNlID0gYXV0aFJlc291cmNlLmFkZFJlc291cmNlKCdsb2dpbicpO1xuICAgIGxvZ2luUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuXG4gICAgY29uc3QgcmVnaXN0ZXJSZXNvdXJjZSA9IGF1dGhSZXNvdXJjZS5hZGRSZXNvdXJjZSgncmVnaXN0ZXInKTtcbiAgICByZWdpc3RlclJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIGxhbWJkYUludGVncmF0aW9uKTtcblxuICAgIC8vIFByb2ZpbGUgYW5kIGNhcnQgcm91dGVzXG4gICAgY29uc3QgcHJvZmlsZVJlc291cmNlID0gYXBpUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3Byb2ZpbGUnKTtcbiAgICBwcm9maWxlUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBsYW1iZGFJbnRlZ3JhdGlvbik7XG5cbiAgICBjb25zdCBjYXJ0UmVzb3VyY2UgPSBwcm9maWxlUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2NhcnQnKTtcbiAgICBjYXJ0UmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBsYW1iZGFJbnRlZ3JhdGlvbik7XG4gICAgY2FydFJlc291cmNlLmFkZE1ldGhvZCgnUFVUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuICAgIGNhcnRSZXNvdXJjZS5hZGRNZXRob2QoJ0RFTEVURScsIGxhbWJkYUludGVncmF0aW9uKTtcblxuICAgIGNvbnN0IG9yZGVyUmVzb3VyY2UgPSBjYXJ0UmVzb3VyY2UuYWRkUmVzb3VyY2UoJ29yZGVyJyk7XG4gICAgb3JkZXJSZXNvdXJjZS5hZGRNZXRob2QoJ1BVVCcsIGxhbWJkYUludGVncmF0aW9uKTtcbiAgICBvcmRlclJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuXG4gICAgY29uc3Qgb3JkZXJzUmVzb3VyY2UgPSBhcGlSZXNvdXJjZS5hZGRSZXNvdXJjZSgnb3JkZXJzJyk7XG4gICAgb3JkZXJzUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBsYW1iZGFJbnRlZ3JhdGlvbik7XG4gICAgb3JkZXJzUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuXG4gICAgY29uc3Qgb3JkZXJJZFJlc291cmNlID0gb3JkZXJzUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3tpZH0nKTtcbiAgICBvcmRlcklkUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBsYW1iZGFJbnRlZ3JhdGlvbik7XG5cbiAgICBjb25zdCBoaXN0b3J5UmVzb3VyY2UgPSBvcmRlcklkUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2hpc3RvcnknKTtcbiAgICBoaXN0b3J5UmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBsYW1iZGFJbnRlZ3JhdGlvbik7XG5cbiAgICBjb25zdCBvcmRlclN0YXR1c1Jlc291cmNlID0gb3JkZXJJZFJlc291cmNlLmFkZFJlc291cmNlKCdzdGF0dXMnKTtcbiAgICBvcmRlclN0YXR1c1Jlc291cmNlLmFkZE1ldGhvZCgnUFVUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuXG4gICAgLy8gSGVhbHRoIGNoZWNrXG4gICAgYXBpLnJvb3QuYWRkTWV0aG9kKCdHRVQnLCBsYW1iZGFJbnRlZ3JhdGlvbik7XG5cbiAgICAvLyBDYXRjaC1hbGwgcm91dGUgYXQgdGhlIGVuZFxuICAgIGFwaS5yb290LmFkZFByb3h5KHtcbiAgICAgIGRlZmF1bHRJbnRlZ3JhdGlvbjogbGFtYmRhSW50ZWdyYXRpb24sXG4gICAgICBhbnlNZXRob2Q6IHRydWUsXG4gICAgfSk7XG5cbiAgICAvLyBPdXRwdXQgdGhlIEFQSSBVUkxcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQXBpVXJsJywge1xuICAgICAgdmFsdWU6IGFwaS51cmwsXG4gICAgICBkZXNjcmlwdGlvbjogJ1VSTCBvZiB0aGUgQVBJIEdhdGV3YXkgZW5kcG9pbnQnLFxuICAgIH0pO1xuICB9XG59XG4iXX0=