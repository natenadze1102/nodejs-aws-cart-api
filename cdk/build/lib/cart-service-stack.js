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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FydC1zZXJ2aWNlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NhcnQtc2VydmljZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFFbkMsaURBQWlEO0FBQ2pELHlEQUF5RDtBQUN6RCw2Q0FBNkMsQ0FBQyxrQkFBa0I7QUFDaEUsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUNqQyx1REFBaUQ7QUFFakQsNkJBQTZCO0FBQzdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRS9ELE1BQWEsZ0JBQWlCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDN0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4Qiw4Q0FBOEM7UUFDOUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQ3ZFLE9BQU8sRUFBRSxvQkFBTyxDQUFDLFdBQVc7WUFDNUIsT0FBTyxFQUFFLHlCQUF5QjtZQUNsQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLEVBQUU7Z0JBQzdELE9BQU8sRUFBRTtvQkFDUCxTQUFTO29CQUNULGtCQUFrQjtvQkFDbEIsc0JBQXNCO29CQUN0QixxQkFBcUI7b0JBQ3JCLHlCQUF5QjtvQkFDekIsbUJBQW1CO29CQUNuQixtQkFBbUI7b0JBQ25CLE1BQU07b0JBQ04sTUFBTTtvQkFDTixVQUFVO29CQUNWLFVBQVU7b0JBQ1YsU0FBUztpQkFDVjthQUNGLENBQUM7WUFDRixPQUFPLEVBQUUsR0FB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QUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMvRCxlQUFlLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBRXBELE1BQU0sbUJBQW1CLEdBQUcsZUFBZSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRSxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFFeEQsZUFBZTtRQUNmLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBRTdDLDZCQUE2QjtRQUM3QixHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUNoQixrQkFBa0IsRUFBRSxpQkFBaUI7WUFDckMsU0FBUyxFQUFFLElBQUk7U0FDaEIsQ0FBQyxDQUFDO1FBRUgscUJBQXFCO1FBQ3JCLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO1lBQ2hDLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRztZQUNkLFdBQVcsRUFBRSxpQ0FBaUM7U0FDL0MsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBNUlELDRDQTRJQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xuaW1wb3J0ICogYXMgbG9ncyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbG9ncyc7IC8vIEFkZCBsb2dzIGltcG9ydFxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGRvdGVudiBmcm9tICdkb3RlbnYnO1xuaW1wb3J0IHsgUnVudGltZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuXG4vLyBMb2FkIGVudmlyb25tZW50IHZhcmlhYmxlc1xuZG90ZW52LmNvbmZpZyh7IHBhdGg6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi8uZW52JykgfSk7XG5cbmV4cG9ydCBjbGFzcyBDYXJ0U2VydmljZVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gQ3JlYXRlIExhbWJkYSBmdW5jdGlvbiBmb3IgdGhlIENhcnQgU2VydmljZVxuICAgIGNvbnN0IGNhcnRTZXJ2aWNlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ2FydFNlcnZpY2VMYW1iZGEnLCB7XG4gICAgICBydW50aW1lOiBSdW50aW1lLk5PREVKU18yMl9YLFxuICAgICAgaGFuZGxlcjogJ2Rpc3Qvc3JjL2xhbWJkYS5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vJyksIHtcbiAgICAgICAgZXhjbHVkZTogW1xuICAgICAgICAgICdjZGsub3V0JyxcbiAgICAgICAgICAnY2RrL25vZGVfbW9kdWxlcycsXG4gICAgICAgICAgJ25vZGVfbW9kdWxlcy9hd3MtY2RrJyxcbiAgICAgICAgICAnbm9kZV9tb2R1bGVzL0B0eXBlcycsXG4gICAgICAgICAgJ25vZGVfbW9kdWxlcy90eXBlc2NyaXB0JyxcbiAgICAgICAgICAnbm9kZV9tb2R1bGVzL2plc3QnLFxuICAgICAgICAgICdub2RlX21vZHVsZXMvLmJpbicsXG4gICAgICAgICAgJy5naXQnLFxuICAgICAgICAgICd0ZXN0JyxcbiAgICAgICAgICAnY292ZXJhZ2UnLFxuICAgICAgICAgICcqKi8qLm1hcCcsXG4gICAgICAgICAgJyoqLyoudHMnLFxuICAgICAgICBdLFxuICAgICAgfSksXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcyg2MCksXG4gICAgICBtZW1vcnlTaXplOiA1MTIsXG5cbiAgICAgIC8vIEVuaGFuY2VkIGxvZ2dpbmdcbiAgICAgIGxvZ1JldGVudGlvbjogbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9XRUVLLFxuICAgICAgdHJhY2luZzogbGFtYmRhLlRyYWNpbmcuQUNUSVZFLCAvLyBFbmFibGUgWC1SYXkgdHJhY2luZ1xuXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nLFxuICAgICAgICBEQl9IT1NUOiBwcm9jZXNzLmVudi5EQl9IT1NUIHx8ICcnLFxuICAgICAgICBEQl9QT1JUOiBwcm9jZXNzLmVudi5EQl9QT1JUIHx8ICc1NDMyJyxcbiAgICAgICAgREJfVVNFUk5BTUU6IHByb2Nlc3MuZW52LkRCX1VTRVJOQU1FIHx8ICcnLFxuICAgICAgICBEQl9QQVNTV09SRDogcHJvY2Vzcy5lbnYuREJfUEFTU1dPUkQgfHwgJycsXG4gICAgICAgIERCX05BTUU6IHByb2Nlc3MuZW52LkRCX05BTUUgfHwgJycsXG4gICAgICAgIERCX1NTTDogcHJvY2Vzcy5lbnYuREJfU1MgfHwgJ3RydWUnLFxuICAgICAgICBEQl9TWU5DOiAndHJ1ZScsIC8vIEVuYWJsZSBzeW5jIHNvIHRhYmxlcyBhcmUgY3JlYXRlZCBpZiB0aGV5IGRvbid0IGV4aXN0XG4gICAgICAgIERCX0xPR0dJTkc6ICd0cnVlJyxcbiAgICAgICAgQVVUSF9ESVNBQkxFRDogJ2ZhbHNlJywgLy8gQWRkIHRoaXMgdG8gY29udHJvbCBhdXRoZW50aWNhdGlvbiBpbiBjb2RlXG4gICAgICAgIERFQlVHOiAnKicsIC8vIEVuYWJsZSBhbGwgZGVidWcgbG9nc1xuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBBUEkgR2F0ZXdheSBSRVNUIEFQSSB3aXRoIGJpbmFyeSBzdXBwb3J0IGFuZCBiZXR0ZXIgQ09SU1xuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ0NhcnRTZXJ2aWNlQXBpJywge1xuICAgICAgcmVzdEFwaU5hbWU6ICdDYXJ0IFNlcnZpY2UgQVBJJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQVBJIGZvciBDYXJ0IFNlcnZpY2UnLFxuICAgICAgYmluYXJ5TWVkaWFUeXBlczogWycqLyonXSwgLy8gQWxsb3cgYWxsIGJpbmFyeSBtZWRpYSB0eXBlc1xuICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XG4gICAgICAgIGFsbG93T3JpZ2luczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9PUklHSU5TLFxuICAgICAgICBhbGxvd01ldGhvZHM6IGFwaWdhdGV3YXkuQ29ycy5BTExfTUVUSE9EUyxcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBbXG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZScsXG4gICAgICAgICAgJ1gtQW16LURhdGUnLFxuICAgICAgICAgICdBdXRob3JpemF0aW9uJyxcbiAgICAgICAgICAnWC1BcGktS2V5JyxcbiAgICAgICAgICAnWC1BbXotU2VjdXJpdHktVG9rZW4nLFxuICAgICAgICAgICdYLVJlcXVlc3RlZC1XaXRoJyxcbiAgICAgICAgICAnQWNjZXB0JyxcbiAgICAgICAgICAnT3JpZ2luJyxcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLFxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLFxuICAgICAgICBdLFxuICAgICAgICBhbGxvd0NyZWRlbnRpYWxzOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIGRlcGxveU9wdGlvbnM6IHtcbiAgICAgICAgc3RhZ2VOYW1lOiAncHJvZCcsXG4gICAgICAgIHRyYWNpbmdFbmFibGVkOiB0cnVlLCAvLyBFbmFibGUgQVBJIEdhdGV3YXkgdHJhY2luZ1xuICAgICAgICBsb2dnaW5nTGV2ZWw6IGFwaWdhdGV3YXkuTWV0aG9kTG9nZ2luZ0xldmVsLklORk8sXG4gICAgICAgIGRhdGFUcmFjZUVuYWJsZWQ6IHRydWUsIC8vIExvZyByZXF1ZXN0L3Jlc3BvbnNlIGJvZGllc1xuICAgICAgICBtZXRyaWNzRW5hYmxlZDogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBFbmhhbmNlZCBMYW1iZGEgaW50ZWdyYXRpb25cbiAgICBjb25zdCBsYW1iZGFJbnRlZ3JhdGlvbiA9IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKFxuICAgICAgY2FydFNlcnZpY2VMYW1iZGEsXG4gICAgICB7XG4gICAgICAgIHByb3h5OiB0cnVlLCAvLyBVc2UgTGFtYmRhIFByb3h5IGludGVncmF0aW9uXG4gICAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDI5KSwgLy8gQVBJIEdhdGV3YXkgdGltZW91dCAobXVzdCBiZSBsZXNzIHRoYW4gTGFtYmRhIHRpbWVvdXQpXG4gICAgICAgIGFsbG93VGVzdEludm9rZTogdHJ1ZSwgLy8gQWxsb3cgdGVzdCBpbnZvY2F0aW9ucyBmcm9tIEFQSSBHYXRld2F5IGNvbnNvbGVcbiAgICAgIH0sXG4gICAgKTtcblxuICAgIC8vIEFkZCBleHBsaWNpdCByb3V0ZXMgZm9yIGhlYWx0aCBjaGVjaywgYXV0aCwgYW5kIGNhcnRcbiAgICBjb25zdCBhcGlSZXNvdXJjZSA9IGFwaS5yb290LmFkZFJlc291cmNlKCdhcGknKTtcblxuICAgIC8vIEF1dGggcm91dGVzXG4gICAgY29uc3QgYXV0aFJlc291cmNlID0gYXBpUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2F1dGgnKTtcbiAgICBjb25zdCBsb2dpblJlc291cmNlID0gYXV0aFJlc291cmNlLmFkZFJlc291cmNlKCdsb2dpbicpO1xuICAgIGxvZ2luUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuXG4gICAgY29uc3QgcmVnaXN0ZXJSZXNvdXJjZSA9IGF1dGhSZXNvdXJjZS5hZGRSZXNvdXJjZSgncmVnaXN0ZXInKTtcbiAgICByZWdpc3RlclJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIGxhbWJkYUludGVncmF0aW9uKTtcblxuICAgIC8vIFByb2ZpbGUgYW5kIGNhcnQgcm91dGVzXG4gICAgY29uc3QgcHJvZmlsZVJlc291cmNlID0gYXBpUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3Byb2ZpbGUnKTtcbiAgICBwcm9maWxlUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBsYW1iZGFJbnRlZ3JhdGlvbik7XG5cbiAgICBjb25zdCBjYXJ0UmVzb3VyY2UgPSBwcm9maWxlUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2NhcnQnKTtcbiAgICBjYXJ0UmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBsYW1iZGFJbnRlZ3JhdGlvbik7XG4gICAgY2FydFJlc291cmNlLmFkZE1ldGhvZCgnUFVUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuICAgIGNhcnRSZXNvdXJjZS5hZGRNZXRob2QoJ0RFTEVURScsIGxhbWJkYUludGVncmF0aW9uKTtcblxuICAgIGNvbnN0IG9yZGVyUmVzb3VyY2UgPSBjYXJ0UmVzb3VyY2UuYWRkUmVzb3VyY2UoJ29yZGVyJyk7XG4gICAgb3JkZXJSZXNvdXJjZS5hZGRNZXRob2QoJ1BVVCcsIGxhbWJkYUludGVncmF0aW9uKTtcbiAgICBvcmRlclJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuXG4gICAgY29uc3Qgb3JkZXJzUmVzb3VyY2UgPSBhcGlSZXNvdXJjZS5hZGRSZXNvdXJjZSgnb3JkZXJzJyk7XG4gICAgb3JkZXJzUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBsYW1iZGFJbnRlZ3JhdGlvbik7XG4gICAgb3JkZXJzUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuXG4gICAgY29uc3Qgb3JkZXJJZFJlc291cmNlID0gb3JkZXJzUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3tpZH0nKTtcbiAgICBvcmRlcklkUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBsYW1iZGFJbnRlZ3JhdGlvbik7XG5cbiAgICBjb25zdCBoaXN0b3J5UmVzb3VyY2UgPSBvcmRlcklkUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2hpc3RvcnknKTtcbiAgICBoaXN0b3J5UmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBsYW1iZGFJbnRlZ3JhdGlvbik7XG5cbiAgICBjb25zdCBvcmRlclN0YXR1c1Jlc291cmNlID0gb3JkZXJJZFJlc291cmNlLmFkZFJlc291cmNlKCdzdGF0dXMnKTtcbiAgICBvcmRlclN0YXR1c1Jlc291cmNlLmFkZE1ldGhvZCgnUFVUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuXG4gICAgLy8gSGVhbHRoIGNoZWNrXG4gICAgYXBpLnJvb3QuYWRkTWV0aG9kKCdHRVQnLCBsYW1iZGFJbnRlZ3JhdGlvbik7XG5cbiAgICAvLyBDYXRjaC1hbGwgcm91dGUgYXQgdGhlIGVuZFxuICAgIGFwaS5yb290LmFkZFByb3h5KHtcbiAgICAgIGRlZmF1bHRJbnRlZ3JhdGlvbjogbGFtYmRhSW50ZWdyYXRpb24sXG4gICAgICBhbnlNZXRob2Q6IHRydWUsXG4gICAgfSk7XG5cbiAgICAvLyBPdXRwdXQgdGhlIEFQSSBVUkxcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQXBpVXJsJywge1xuICAgICAgdmFsdWU6IGFwaS51cmwsXG4gICAgICBkZXNjcmlwdGlvbjogJ1VSTCBvZiB0aGUgQVBJIEdhdGV3YXkgZW5kcG9pbnQnLFxuICAgIH0pO1xuICB9XG59XG4iXX0=