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
                DB_NAME: process.env.DB_NAME || '',
                DB_SSL: process.env.DB_SS || 'true',
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
            // binaryMediaTypes: ['*/*'], // Allow all binary media types
            defaultCorsPreflightOptions: {
                allowOrigins: ['*'],
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FydC1zZXJ2aWNlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NhcnQtc2VydmljZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFFbkMsaURBQWlEO0FBQ2pELHlEQUF5RDtBQUN6RCw2Q0FBNkMsQ0FBQyxrQkFBa0I7QUFDaEUsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUNqQyx1REFBaUQ7QUFFakQsNkJBQTZCO0FBQzdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRS9ELE1BQWEsZ0JBQWlCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDN0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4Qiw4Q0FBOEM7UUFDOUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQ3ZFLE9BQU8sRUFBRSxvQkFBTyxDQUFDLFdBQVc7WUFDNUIsT0FBTyxFQUFFLHlCQUF5QjtZQUNsQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLEVBQUU7Z0JBQzdELE9BQU8sRUFBRTtvQkFDUCxTQUFTO29CQUNULGtCQUFrQjtvQkFDbEIsc0JBQXNCO29CQUN0QixxQkFBcUI7b0JBQ3JCLHlCQUF5QjtvQkFDekIsbUJBQW1CO29CQUNuQixtQkFBbUI7b0JBQ25CLE1BQU07b0JBQ04sTUFBTTtvQkFDTixVQUFVO29CQUNWLFVBQVU7b0JBQ1YsU0FBUztpQkFDVjthQUNGLENBQUM7WUFDRixPQUFPLEVBQUUsR0FB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QUFtQixDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUV4RCxlQUFlO1FBQ2YsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFFN0MsNkJBQTZCO1FBQzdCLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ2hCLGtCQUFrQixFQUFFLGlCQUFpQjtZQUNyQyxTQUFTLEVBQUUsSUFBSTtTQUNoQixDQUFDLENBQUM7UUFFSCxxQkFBcUI7UUFDckIsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDaEMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHO1lBQ2QsV0FBVyxFQUFFLGlDQUFpQztTQUMvQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFoSUQsNENBZ0lDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgKiBhcyBsb2dzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sb2dzJzsgLy8gQWRkIGxvZ3MgaW1wb3J0XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZG90ZW52IGZyb20gJ2RvdGVudic7XG5pbXBvcnQgeyBSdW50aW1lIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5cbi8vIExvYWQgZW52aXJvbm1lbnQgdmFyaWFibGVzXG5kb3RlbnYuY29uZmlnKHsgcGF0aDogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uLy5lbnYnKSB9KTtcblxuZXhwb3J0IGNsYXNzIENhcnRTZXJ2aWNlU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLyBDcmVhdGUgTGFtYmRhIGZ1bmN0aW9uIGZvciB0aGUgQ2FydCBTZXJ2aWNlXG4gICAgY29uc3QgY2FydFNlcnZpY2VMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdDYXJ0U2VydmljZUxhbWJkYScsIHtcbiAgICAgIHJ1bnRpbWU6IFJ1bnRpbWUuTk9ERUpTXzIyX1gsXG4gICAgICBoYW5kbGVyOiAnZGlzdC9zcmMvbGFtYmRhLmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi8nKSwge1xuICAgICAgICBleGNsdWRlOiBbXG4gICAgICAgICAgJ2Nkay5vdXQnLFxuICAgICAgICAgICdjZGsvbm9kZV9tb2R1bGVzJyxcbiAgICAgICAgICAnbm9kZV9tb2R1bGVzL2F3cy1jZGsnLFxuICAgICAgICAgICdub2RlX21vZHVsZXMvQHR5cGVzJyxcbiAgICAgICAgICAnbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQnLFxuICAgICAgICAgICdub2RlX21vZHVsZXMvamVzdCcsXG4gICAgICAgICAgJ25vZGVfbW9kdWxlcy8uYmluJyxcbiAgICAgICAgICAnLmdpdCcsXG4gICAgICAgICAgJ3Rlc3QnLFxuICAgICAgICAgICdjb3ZlcmFnZScsXG4gICAgICAgICAgJyoqLyoubWFwJyxcbiAgICAgICAgICAnKiovKi50cycsXG4gICAgICAgIF0sXG4gICAgICB9KSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDYwKSxcbiAgICAgIG1lbW9yeVNpemU6IDUxMixcblxuICAgICAgLy8gRW5oYW5jZWQgbG9nZ2luZ1xuICAgICAgbG9nUmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX1dFRUssXG4gICAgICB0cmFjaW5nOiBsYW1iZGEuVHJhY2luZy5BQ1RJVkUsIC8vIEVuYWJsZSBYLVJheSB0cmFjaW5nXG5cbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIE5PREVfRU5WOiAncHJvZHVjdGlvbicsXG4gICAgICAgIERCX0hPU1Q6IHByb2Nlc3MuZW52LkRCX0hPU1QgfHwgJycsXG4gICAgICAgIERCX1BPUlQ6IHByb2Nlc3MuZW52LkRCX1BPUlQgfHwgJzU0MzInLFxuICAgICAgICBEQl9VU0VSTkFNRTogcHJvY2Vzcy5lbnYuREJfVVNFUk5BTUUgfHwgJycsXG4gICAgICAgIERCX1BBU1NXT1JEOiBwcm9jZXNzLmVudi5EQl9QQVNTV09SRCB8fCAnJyxcbiAgICAgICAgREJfTkFNRTogcHJvY2Vzcy5lbnYuREJfTkFNRSB8fCAnJyxcbiAgICAgICAgREJfU1NMOiBwcm9jZXNzLmVudi5EQl9TUyB8fCAndHJ1ZScsXG4gICAgICAgIERCX1NZTkM6ICd0cnVlJywgLy8gRW5hYmxlIHN5bmMgc28gdGFibGVzIGFyZSBjcmVhdGVkIGlmIHRoZXkgZG9uJ3QgZXhpc3RcbiAgICAgICAgREJfTE9HR0lORzogJ3RydWUnLFxuICAgICAgICBBVVRIX0RJU0FCTEVEOiAnZmFsc2UnLCAvLyBBZGQgdGhpcyB0byBjb250cm9sIGF1dGhlbnRpY2F0aW9uIGluIGNvZGVcbiAgICAgICAgREVCVUc6ICcqJywgLy8gRW5hYmxlIGFsbCBkZWJ1ZyBsb2dzXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIEFQSSBHYXRld2F5IFJFU1QgQVBJIHdpdGggYmluYXJ5IHN1cHBvcnQgYW5kIGJldHRlciBDT1JTXG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnQ2FydFNlcnZpY2VBcGknLCB7XG4gICAgICByZXN0QXBpTmFtZTogJ0NhcnQgU2VydmljZSBBUEknLFxuICAgICAgZGVzY3JpcHRpb246ICdBUEkgZm9yIENhcnQgU2VydmljZScsXG4gICAgICAvLyBiaW5hcnlNZWRpYVR5cGVzOiBbJyovKiddLCAvLyBBbGxvdyBhbGwgYmluYXJ5IG1lZGlhIHR5cGVzXG4gICAgICBkZWZhdWx0Q29yc1ByZWZsaWdodE9wdGlvbnM6IHtcbiAgICAgICAgYWxsb3dPcmlnaW5zOiBbJyonXSxcbiAgICAgICAgYWxsb3dNZXRob2RzOiBhcGlnYXRld2F5LkNvcnMuQUxMX01FVEhPRFMsXG4gICAgICAgIGFsbG93SGVhZGVyczogWydDb250ZW50LVR5cGUnLCAnQXV0aG9yaXphdGlvbicsICdBY2NlcHQnXSxcbiAgICAgICAgYWxsb3dDcmVkZW50aWFsczogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBkZXBsb3lPcHRpb25zOiB7XG4gICAgICAgIHN0YWdlTmFtZTogJ3Byb2QnLFxuICAgICAgICB0cmFjaW5nRW5hYmxlZDogdHJ1ZSwgLy8gRW5hYmxlIEFQSSBHYXRld2F5IHRyYWNpbmdcbiAgICAgICAgbG9nZ2luZ0xldmVsOiBhcGlnYXRld2F5Lk1ldGhvZExvZ2dpbmdMZXZlbC5JTkZPLFxuICAgICAgICBkYXRhVHJhY2VFbmFibGVkOiB0cnVlLCAvLyBMb2cgcmVxdWVzdC9yZXNwb25zZSBib2RpZXNcbiAgICAgICAgbWV0cmljc0VuYWJsZWQ6IHRydWUsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gRW5oYW5jZWQgTGFtYmRhIGludGVncmF0aW9uXG4gICAgY29uc3QgbGFtYmRhSW50ZWdyYXRpb24gPSBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihcbiAgICAgIGNhcnRTZXJ2aWNlTGFtYmRhLFxuICAgICAge1xuICAgICAgICBwcm94eTogdHJ1ZSwgLy8gVXNlIExhbWJkYSBQcm94eSBpbnRlZ3JhdGlvblxuICAgICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygyOSksIC8vIEFQSSBHYXRld2F5IHRpbWVvdXQgKG11c3QgYmUgbGVzcyB0aGFuIExhbWJkYSB0aW1lb3V0KVxuICAgICAgICBhbGxvd1Rlc3RJbnZva2U6IHRydWUsIC8vIEFsbG93IHRlc3QgaW52b2NhdGlvbnMgZnJvbSBBUEkgR2F0ZXdheSBjb25zb2xlXG4gICAgICB9LFxuICAgICk7XG5cbiAgICAvLyBBZGQgZXhwbGljaXQgcm91dGVzIGZvciBoZWFsdGggY2hlY2ssIGF1dGgsIGFuZCBjYXJ0XG4gICAgY29uc3QgYXBpUmVzb3VyY2UgPSBhcGkucm9vdC5hZGRSZXNvdXJjZSgnYXBpJyk7XG5cbiAgICAvLyBBdXRoIHJvdXRlc1xuICAgIGNvbnN0IGF1dGhSZXNvdXJjZSA9IGFwaVJlc291cmNlLmFkZFJlc291cmNlKCdhdXRoJyk7XG4gICAgY29uc3QgbG9naW5SZXNvdXJjZSA9IGF1dGhSZXNvdXJjZS5hZGRSZXNvdXJjZSgnbG9naW4nKTtcbiAgICBsb2dpblJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIGxhbWJkYUludGVncmF0aW9uKTtcblxuICAgIGNvbnN0IHJlZ2lzdGVyUmVzb3VyY2UgPSBhdXRoUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3JlZ2lzdGVyJyk7XG4gICAgcmVnaXN0ZXJSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBsYW1iZGFJbnRlZ3JhdGlvbik7XG5cbiAgICAvLyBQcm9maWxlIGFuZCBjYXJ0IHJvdXRlc1xuICAgIGNvbnN0IHByb2ZpbGVSZXNvdXJjZSA9IGFwaVJlc291cmNlLmFkZFJlc291cmNlKCdwcm9maWxlJyk7XG4gICAgcHJvZmlsZVJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuXG4gICAgY29uc3QgY2FydFJlc291cmNlID0gcHJvZmlsZVJlc291cmNlLmFkZFJlc291cmNlKCdjYXJ0Jyk7XG4gICAgY2FydFJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuICAgIGNhcnRSZXNvdXJjZS5hZGRNZXRob2QoJ1BVVCcsIGxhbWJkYUludGVncmF0aW9uKTtcbiAgICBjYXJ0UmVzb3VyY2UuYWRkTWV0aG9kKCdERUxFVEUnLCBsYW1iZGFJbnRlZ3JhdGlvbik7XG5cbiAgICBjb25zdCBvcmRlclJlc291cmNlID0gY2FydFJlc291cmNlLmFkZFJlc291cmNlKCdvcmRlcicpO1xuICAgIG9yZGVyUmVzb3VyY2UuYWRkTWV0aG9kKCdQVVQnLCBsYW1iZGFJbnRlZ3JhdGlvbik7XG4gICAgb3JkZXJSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIGxhbWJkYUludGVncmF0aW9uKTtcblxuICAgIGNvbnN0IG9yZGVyc1Jlc291cmNlID0gYXBpUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ29yZGVycycpO1xuICAgIG9yZGVyc1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuICAgIG9yZGVyc1Jlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIGxhbWJkYUludGVncmF0aW9uKTtcblxuICAgIGNvbnN0IG9yZGVySWRSZXNvdXJjZSA9IG9yZGVyc1Jlc291cmNlLmFkZFJlc291cmNlKCd7aWR9Jyk7XG4gICAgb3JkZXJJZFJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuXG4gICAgY29uc3QgaGlzdG9yeVJlc291cmNlID0gb3JkZXJJZFJlc291cmNlLmFkZFJlc291cmNlKCdoaXN0b3J5Jyk7XG4gICAgaGlzdG9yeVJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuXG4gICAgY29uc3Qgb3JkZXJTdGF0dXNSZXNvdXJjZSA9IG9yZGVySWRSZXNvdXJjZS5hZGRSZXNvdXJjZSgnc3RhdHVzJyk7XG4gICAgb3JkZXJTdGF0dXNSZXNvdXJjZS5hZGRNZXRob2QoJ1BVVCcsIGxhbWJkYUludGVncmF0aW9uKTtcblxuICAgIC8vIEhlYWx0aCBjaGVja1xuICAgIGFwaS5yb290LmFkZE1ldGhvZCgnR0VUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuXG4gICAgLy8gQ2F0Y2gtYWxsIHJvdXRlIGF0IHRoZSBlbmRcbiAgICBhcGkucm9vdC5hZGRQcm94eSh7XG4gICAgICBkZWZhdWx0SW50ZWdyYXRpb246IGxhbWJkYUludGVncmF0aW9uLFxuICAgICAgYW55TWV0aG9kOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgLy8gT3V0cHV0IHRoZSBBUEkgVVJMXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FwaVVybCcsIHtcbiAgICAgIHZhbHVlOiBhcGkudXJsLFxuICAgICAgZGVzY3JpcHRpb246ICdVUkwgb2YgdGhlIEFQSSBHYXRld2F5IGVuZHBvaW50JyxcbiAgICB9KTtcbiAgfVxufVxuIl19