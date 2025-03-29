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
dotenv.config();
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
                DB_HOST: 'cart-service-db.cd66u40eafyf.eu-central-1.rds.amazonaws.com',
                DB_PORT: '5432',
                DB_USERNAME: 'postgres',
                DB_PASSWORD: '1tCez7g1ere6DNgTwQS7',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FydC1zZXJ2aWNlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NhcnQtc2VydmljZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFFbkMsaURBQWlEO0FBQ2pELHlEQUF5RDtBQUN6RCw2Q0FBNkMsQ0FBQyxrQkFBa0I7QUFDaEUsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUNqQyx1REFBaUQ7QUFFakQsNkJBQTZCO0FBQzdCLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUVoQixNQUFhLGdCQUFpQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzdDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsOENBQThDO1FBQzlDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUN2RSxPQUFPLEVBQUUsb0JBQU8sQ0FBQyxXQUFXO1lBQzVCLE9BQU8sRUFBRSx5QkFBeUI7WUFDbEMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxFQUFFO2dCQUM3RCxPQUFPLEVBQUU7b0JBQ1AsU0FBUztvQkFDVCxrQkFBa0I7b0JBQ2xCLHNCQUFzQjtvQkFDdEIscUJBQXFCO29CQUNyQix5QkFBeUI7b0JBQ3pCLG1CQUFtQjtvQkFDbkIsbUJBQW1CO29CQUNuQixNQUFNO29CQUNOLE1BQU07b0JBQ04sVUFBVTtvQkFDVixVQUFVO29CQUNWLFNBQVM7aUJBQ1Y7YUFDRixDQUFDO1lBQ0YsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNqQyxVQUFVLEVBQUUsR0FBRztZQUVmLG1C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QUcsZUFBZSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6RCxZQUFZLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ2pELFlBQVksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDakQsWUFBWSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUVwRCxlQUFlO1FBQ2YsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFFN0MsNkJBQTZCO1FBQzdCLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ2hCLGtCQUFrQixFQUFFLGlCQUFpQjtZQUNyQyxTQUFTLEVBQUUsSUFBSTtTQUNoQixDQUFDLENBQUM7UUFFSCxxQkFBcUI7UUFDckIsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDaEMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHO1lBQ2QsV0FBVyxFQUFFLGlDQUFpQztTQUMvQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUEzSEQsNENBMkhDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgKiBhcyBsb2dzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sb2dzJzsgLy8gQWRkIGxvZ3MgaW1wb3J0XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZG90ZW52IGZyb20gJ2RvdGVudic7XG5pbXBvcnQgeyBSdW50aW1lIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5cbi8vIExvYWQgZW52aXJvbm1lbnQgdmFyaWFibGVzXG5kb3RlbnYuY29uZmlnKCk7XG5cbmV4cG9ydCBjbGFzcyBDYXJ0U2VydmljZVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gQ3JlYXRlIExhbWJkYSBmdW5jdGlvbiBmb3IgdGhlIENhcnQgU2VydmljZVxuICAgIGNvbnN0IGNhcnRTZXJ2aWNlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ2FydFNlcnZpY2VMYW1iZGEnLCB7XG4gICAgICBydW50aW1lOiBSdW50aW1lLk5PREVKU18yMl9YLFxuICAgICAgaGFuZGxlcjogJ2Rpc3Qvc3JjL2xhbWJkYS5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vJyksIHtcbiAgICAgICAgZXhjbHVkZTogW1xuICAgICAgICAgICdjZGsub3V0JyxcbiAgICAgICAgICAnY2RrL25vZGVfbW9kdWxlcycsXG4gICAgICAgICAgJ25vZGVfbW9kdWxlcy9hd3MtY2RrJyxcbiAgICAgICAgICAnbm9kZV9tb2R1bGVzL0B0eXBlcycsXG4gICAgICAgICAgJ25vZGVfbW9kdWxlcy90eXBlc2NyaXB0JyxcbiAgICAgICAgICAnbm9kZV9tb2R1bGVzL2plc3QnLFxuICAgICAgICAgICdub2RlX21vZHVsZXMvLmJpbicsXG4gICAgICAgICAgJy5naXQnLFxuICAgICAgICAgICd0ZXN0JyxcbiAgICAgICAgICAnY292ZXJhZ2UnLFxuICAgICAgICAgICcqKi8qLm1hcCcsXG4gICAgICAgICAgJyoqLyoudHMnLFxuICAgICAgICBdLFxuICAgICAgfSksXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcyg2MCksXG4gICAgICBtZW1vcnlTaXplOiA1MTIsXG5cbiAgICAgIC8vIEVuaGFuY2VkIGxvZ2dpbmdcbiAgICAgIGxvZ1JldGVudGlvbjogbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9XRUVLLFxuICAgICAgdHJhY2luZzogbGFtYmRhLlRyYWNpbmcuQUNUSVZFLCAvLyBFbmFibGUgWC1SYXkgdHJhY2luZ1xuXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nLFxuICAgICAgICBEQl9IT1NUOiAnY2FydC1zZXJ2aWNlLWRiLmNkNjZ1NDBlYWZ5Zi5ldS1jZW50cmFsLTEucmRzLmFtYXpvbmF3cy5jb20nLFxuICAgICAgICBEQl9QT1JUOiAnNTQzMicsXG4gICAgICAgIERCX1VTRVJOQU1FOiAncG9zdGdyZXMnLFxuICAgICAgICBEQl9QQVNTV09SRDogJzF0Q2V6N2cxZXJlNkROZ1R3UVM3JyxcbiAgICAgICAgREJfTkFNRTogJ2NhcnRkYicsXG4gICAgICAgIERCX1NTTDogJ3RydWUnLFxuICAgICAgICBEQl9TWU5DOiAndHJ1ZScsIC8vIEVuYWJsZSBzeW5jIHNvIHRhYmxlcyBhcmUgY3JlYXRlZCBpZiB0aGV5IGRvbid0IGV4aXN0XG4gICAgICAgIERCX0xPR0dJTkc6ICd0cnVlJyxcbiAgICAgICAgQVVUSF9ESVNBQkxFRDogJ2ZhbHNlJywgLy8gQWRkIHRoaXMgdG8gY29udHJvbCBhdXRoZW50aWNhdGlvbiBpbiBjb2RlXG4gICAgICAgIERFQlVHOiAnKicsIC8vIEVuYWJsZSBhbGwgZGVidWcgbG9nc1xuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBBUEkgR2F0ZXdheSBSRVNUIEFQSSB3aXRoIGJpbmFyeSBzdXBwb3J0IGFuZCBiZXR0ZXIgQ09SU1xuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ0NhcnRTZXJ2aWNlQXBpJywge1xuICAgICAgcmVzdEFwaU5hbWU6ICdDYXJ0IFNlcnZpY2UgQVBJJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQVBJIGZvciBDYXJ0IFNlcnZpY2UnLFxuICAgICAgYmluYXJ5TWVkaWFUeXBlczogWycqLyonXSwgLy8gQWxsb3cgYWxsIGJpbmFyeSBtZWRpYSB0eXBlc1xuICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XG4gICAgICAgIGFsbG93T3JpZ2luczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9PUklHSU5TLFxuICAgICAgICBhbGxvd01ldGhvZHM6IGFwaWdhdGV3YXkuQ29ycy5BTExfTUVUSE9EUyxcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBbXG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZScsXG4gICAgICAgICAgJ1gtQW16LURhdGUnLFxuICAgICAgICAgICdBdXRob3JpemF0aW9uJyxcbiAgICAgICAgICAnWC1BcGktS2V5JyxcbiAgICAgICAgICAnWC1BbXotU2VjdXJpdHktVG9rZW4nLFxuICAgICAgICAgICdYLVJlcXVlc3RlZC1XaXRoJyxcbiAgICAgICAgICAnQWNjZXB0JyxcbiAgICAgICAgICAnT3JpZ2luJyxcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLFxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLFxuICAgICAgICBdLFxuICAgICAgICBhbGxvd0NyZWRlbnRpYWxzOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIGRlcGxveU9wdGlvbnM6IHtcbiAgICAgICAgc3RhZ2VOYW1lOiAncHJvZCcsXG4gICAgICAgIHRyYWNpbmdFbmFibGVkOiB0cnVlLCAvLyBFbmFibGUgQVBJIEdhdGV3YXkgdHJhY2luZ1xuICAgICAgICBsb2dnaW5nTGV2ZWw6IGFwaWdhdGV3YXkuTWV0aG9kTG9nZ2luZ0xldmVsLklORk8sXG4gICAgICAgIGRhdGFUcmFjZUVuYWJsZWQ6IHRydWUsIC8vIExvZyByZXF1ZXN0L3Jlc3BvbnNlIGJvZGllc1xuICAgICAgICBtZXRyaWNzRW5hYmxlZDogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBFbmhhbmNlZCBMYW1iZGEgaW50ZWdyYXRpb25cbiAgICBjb25zdCBsYW1iZGFJbnRlZ3JhdGlvbiA9IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKFxuICAgICAgY2FydFNlcnZpY2VMYW1iZGEsXG4gICAgICB7XG4gICAgICAgIHByb3h5OiB0cnVlLCAvLyBVc2UgTGFtYmRhIFByb3h5IGludGVncmF0aW9uXG4gICAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDI5KSwgLy8gQVBJIEdhdGV3YXkgdGltZW91dCAobXVzdCBiZSBsZXNzIHRoYW4gTGFtYmRhIHRpbWVvdXQpXG4gICAgICAgIGFsbG93VGVzdEludm9rZTogdHJ1ZSwgLy8gQWxsb3cgdGVzdCBpbnZvY2F0aW9ucyBmcm9tIEFQSSBHYXRld2F5IGNvbnNvbGVcbiAgICAgIH0sXG4gICAgKTtcblxuICAgIC8vIEFkZCBleHBsaWNpdCByb3V0ZXMgZm9yIGhlYWx0aCBjaGVjaywgYXV0aCwgYW5kIGNhcnRcbiAgICBjb25zdCBhcGlSZXNvdXJjZSA9IGFwaS5yb290LmFkZFJlc291cmNlKCdhcGknKTtcblxuICAgIC8vIEF1dGggcm91dGVzXG4gICAgY29uc3QgYXV0aFJlc291cmNlID0gYXBpUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2F1dGgnKTtcbiAgICBjb25zdCBsb2dpblJlc291cmNlID0gYXV0aFJlc291cmNlLmFkZFJlc291cmNlKCdsb2dpbicpO1xuICAgIGxvZ2luUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuXG4gICAgY29uc3QgcmVnaXN0ZXJSZXNvdXJjZSA9IGF1dGhSZXNvdXJjZS5hZGRSZXNvdXJjZSgncmVnaXN0ZXInKTtcbiAgICByZWdpc3RlclJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIGxhbWJkYUludGVncmF0aW9uKTtcblxuICAgIC8vIFByb2ZpbGUgYW5kIGNhcnQgcm91dGVzXG4gICAgY29uc3QgcHJvZmlsZVJlc291cmNlID0gYXBpUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3Byb2ZpbGUnKTtcbiAgICBwcm9maWxlUmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBsYW1iZGFJbnRlZ3JhdGlvbik7XG5cbiAgICBjb25zdCBjYXJ0UmVzb3VyY2UgPSBwcm9maWxlUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2NhcnQnKTtcbiAgICBjYXJ0UmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBsYW1iZGFJbnRlZ3JhdGlvbik7XG4gICAgY2FydFJlc291cmNlLmFkZE1ldGhvZCgnUFVUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuICAgIGNhcnRSZXNvdXJjZS5hZGRNZXRob2QoJ0RFTEVURScsIGxhbWJkYUludGVncmF0aW9uKTtcblxuICAgIC8vIEhlYWx0aCBjaGVja1xuICAgIGFwaS5yb290LmFkZE1ldGhvZCgnR0VUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuXG4gICAgLy8gQ2F0Y2gtYWxsIHJvdXRlIGF0IHRoZSBlbmRcbiAgICBhcGkucm9vdC5hZGRQcm94eSh7XG4gICAgICBkZWZhdWx0SW50ZWdyYXRpb246IGxhbWJkYUludGVncmF0aW9uLFxuICAgICAgYW55TWV0aG9kOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgLy8gT3V0cHV0IHRoZSBBUEkgVVJMXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FwaVVybCcsIHtcbiAgICAgIHZhbHVlOiBhcGkudXJsLFxuICAgICAgZGVzY3JpcHRpb246ICdVUkwgb2YgdGhlIEFQSSBHYXRld2F5IGVuZHBvaW50JyxcbiAgICB9KTtcbiAgfVxufVxuIl19