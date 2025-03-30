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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FydC1zZXJ2aWNlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NhcnQtc2VydmljZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFFbkMsaURBQWlEO0FBQ2pELHlEQUF5RDtBQUN6RCw2Q0FBNkMsQ0FBQyxrQkFBa0I7QUFDaEUsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUNqQyx1REFBaUQ7QUFFakQsNkJBQTZCO0FBQzdCLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUVoQixNQUFhLGdCQUFpQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzdDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsOENBQThDO1FBQzlDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUN2RSxPQUFPLEVBQUUsb0JBQU8sQ0FBQyxXQUFXO1lBQzVCLE9BQU8sRUFBRSx5QkFBeUI7WUFDbEMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxFQUFFO2dCQUM3RCxPQUFPLEVBQUU7b0JBQ1AsU0FBUztvQkFDVCxrQkFBa0I7b0JBQ2xCLHNCQUFzQjtvQkFDdEIscUJBQXFCO29CQUNyQix5QkFBeUI7b0JBQ3pCLG1CQUFtQjtvQkFDbkIsbUJBQW1CO29CQUNuQixNQUFNO29CQUNOLE1BQU07b0JBQ04sVUFBVTtvQkFDVixVQUFVO29CQUNWLFNBQVM7aUJBQ1Y7YUFDRixDQUFDO1lBQ0YsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNqQyxVQUFVLEVBQUUsR0FBRztZQUVmLG1C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QUssRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBRTdDLDZCQUE2QjtRQUM3QixHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUNoQixrQkFBa0IsRUFBRSxpQkFBaUI7WUFDckMsU0FBUyxFQUFFLElBQUk7U0FDaEIsQ0FBQyxDQUFDO1FBRUgscUJBQXFCO1FBQ3JCLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO1lBQ2hDLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRztZQUNkLFdBQVcsRUFBRSxpQ0FBaUM7U0FDL0MsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBNUlELDRDQTRJQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xuaW1wb3J0ICogYXMgbG9ncyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbG9ncyc7IC8vIEFkZCBsb2dzIGltcG9ydFxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGRvdGVudiBmcm9tICdkb3RlbnYnO1xuaW1wb3J0IHsgUnVudGltZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuXG4vLyBMb2FkIGVudmlyb25tZW50IHZhcmlhYmxlc1xuZG90ZW52LmNvbmZpZygpO1xuXG5leHBvcnQgY2xhc3MgQ2FydFNlcnZpY2VTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIENyZWF0ZSBMYW1iZGEgZnVuY3Rpb24gZm9yIHRoZSBDYXJ0IFNlcnZpY2VcbiAgICBjb25zdCBjYXJ0U2VydmljZUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0NhcnRTZXJ2aWNlTGFtYmRhJywge1xuICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMjJfWCxcbiAgICAgIGhhbmRsZXI6ICdkaXN0L3NyYy9sYW1iZGEuaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uLycpLCB7XG4gICAgICAgIGV4Y2x1ZGU6IFtcbiAgICAgICAgICAnY2RrLm91dCcsXG4gICAgICAgICAgJ2Nkay9ub2RlX21vZHVsZXMnLFxuICAgICAgICAgICdub2RlX21vZHVsZXMvYXdzLWNkaycsXG4gICAgICAgICAgJ25vZGVfbW9kdWxlcy9AdHlwZXMnLFxuICAgICAgICAgICdub2RlX21vZHVsZXMvdHlwZXNjcmlwdCcsXG4gICAgICAgICAgJ25vZGVfbW9kdWxlcy9qZXN0JyxcbiAgICAgICAgICAnbm9kZV9tb2R1bGVzLy5iaW4nLFxuICAgICAgICAgICcuZ2l0JyxcbiAgICAgICAgICAndGVzdCcsXG4gICAgICAgICAgJ2NvdmVyYWdlJyxcbiAgICAgICAgICAnKiovKi5tYXAnLFxuICAgICAgICAgICcqKi8qLnRzJyxcbiAgICAgICAgXSxcbiAgICAgIH0pLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoNjApLFxuICAgICAgbWVtb3J5U2l6ZTogNTEyLFxuXG4gICAgICAvLyBFbmhhbmNlZCBsb2dnaW5nXG4gICAgICBsb2dSZXRlbnRpb246IGxvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfV0VFSyxcbiAgICAgIHRyYWNpbmc6IGxhbWJkYS5UcmFjaW5nLkFDVElWRSwgLy8gRW5hYmxlIFgtUmF5IHRyYWNpbmdcblxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgTk9ERV9FTlY6ICdwcm9kdWN0aW9uJyxcbiAgICAgICAgREJfSE9TVDogJ2NhcnQtc2VydmljZS1kYi5jZDY2dTQwZWFmeWYuZXUtY2VudHJhbC0xLnJkcy5hbWF6b25hd3MuY29tJyxcbiAgICAgICAgREJfUE9SVDogJzU0MzInLFxuICAgICAgICBEQl9VU0VSTkFNRTogJ3Bvc3RncmVzJyxcbiAgICAgICAgREJfUEFTU1dPUkQ6ICcxdENlejdnMWVyZTZETmdUd1FTNycsXG4gICAgICAgIERCX05BTUU6ICdjYXJ0ZGInLFxuICAgICAgICBEQl9TU0w6ICd0cnVlJyxcbiAgICAgICAgREJfU1lOQzogJ3RydWUnLCAvLyBFbmFibGUgc3luYyBzbyB0YWJsZXMgYXJlIGNyZWF0ZWQgaWYgdGhleSBkb24ndCBleGlzdFxuICAgICAgICBEQl9MT0dHSU5HOiAndHJ1ZScsXG4gICAgICAgIEFVVEhfRElTQUJMRUQ6ICdmYWxzZScsIC8vIEFkZCB0aGlzIHRvIGNvbnRyb2wgYXV0aGVudGljYXRpb24gaW4gY29kZVxuICAgICAgICBERUJVRzogJyonLCAvLyBFbmFibGUgYWxsIGRlYnVnIGxvZ3NcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgQVBJIEdhdGV3YXkgUkVTVCBBUEkgd2l0aCBiaW5hcnkgc3VwcG9ydCBhbmQgYmV0dGVyIENPUlNcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsICdDYXJ0U2VydmljZUFwaScsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiAnQ2FydCBTZXJ2aWNlIEFQSScsXG4gICAgICBkZXNjcmlwdGlvbjogJ0FQSSBmb3IgQ2FydCBTZXJ2aWNlJyxcbiAgICAgIGJpbmFyeU1lZGlhVHlwZXM6IFsnKi8qJ10sIC8vIEFsbG93IGFsbCBiaW5hcnkgbWVkaWEgdHlwZXNcbiAgICAgIGRlZmF1bHRDb3JzUHJlZmxpZ2h0T3B0aW9uczoge1xuICAgICAgICBhbGxvd09yaWdpbnM6IGFwaWdhdGV3YXkuQ29ycy5BTExfT1JJR0lOUyxcbiAgICAgICAgYWxsb3dNZXRob2RzOiBhcGlnYXRld2F5LkNvcnMuQUxMX01FVEhPRFMsXG4gICAgICAgIGFsbG93SGVhZGVyczogW1xuICAgICAgICAgICdDb250ZW50LVR5cGUnLFxuICAgICAgICAgICdYLUFtei1EYXRlJyxcbiAgICAgICAgICAnQXV0aG9yaXphdGlvbicsXG4gICAgICAgICAgJ1gtQXBpLUtleScsXG4gICAgICAgICAgJ1gtQW16LVNlY3VyaXR5LVRva2VuJyxcbiAgICAgICAgICAnWC1SZXF1ZXN0ZWQtV2l0aCcsXG4gICAgICAgICAgJ0FjY2VwdCcsXG4gICAgICAgICAgJ09yaWdpbicsXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLFxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJyxcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJyxcbiAgICAgICAgXSxcbiAgICAgICAgYWxsb3dDcmVkZW50aWFsczogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBkZXBsb3lPcHRpb25zOiB7XG4gICAgICAgIHN0YWdlTmFtZTogJ3Byb2QnLFxuICAgICAgICB0cmFjaW5nRW5hYmxlZDogdHJ1ZSwgLy8gRW5hYmxlIEFQSSBHYXRld2F5IHRyYWNpbmdcbiAgICAgICAgbG9nZ2luZ0xldmVsOiBhcGlnYXRld2F5Lk1ldGhvZExvZ2dpbmdMZXZlbC5JTkZPLFxuICAgICAgICBkYXRhVHJhY2VFbmFibGVkOiB0cnVlLCAvLyBMb2cgcmVxdWVzdC9yZXNwb25zZSBib2RpZXNcbiAgICAgICAgbWV0cmljc0VuYWJsZWQ6IHRydWUsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gRW5oYW5jZWQgTGFtYmRhIGludGVncmF0aW9uXG4gICAgY29uc3QgbGFtYmRhSW50ZWdyYXRpb24gPSBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihcbiAgICAgIGNhcnRTZXJ2aWNlTGFtYmRhLFxuICAgICAge1xuICAgICAgICBwcm94eTogdHJ1ZSwgLy8gVXNlIExhbWJkYSBQcm94eSBpbnRlZ3JhdGlvblxuICAgICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygyOSksIC8vIEFQSSBHYXRld2F5IHRpbWVvdXQgKG11c3QgYmUgbGVzcyB0aGFuIExhbWJkYSB0aW1lb3V0KVxuICAgICAgICBhbGxvd1Rlc3RJbnZva2U6IHRydWUsIC8vIEFsbG93IHRlc3QgaW52b2NhdGlvbnMgZnJvbSBBUEkgR2F0ZXdheSBjb25zb2xlXG4gICAgICB9LFxuICAgICk7XG5cbiAgICAvLyBBZGQgZXhwbGljaXQgcm91dGVzIGZvciBoZWFsdGggY2hlY2ssIGF1dGgsIGFuZCBjYXJ0XG4gICAgY29uc3QgYXBpUmVzb3VyY2UgPSBhcGkucm9vdC5hZGRSZXNvdXJjZSgnYXBpJyk7XG5cbiAgICAvLyBBdXRoIHJvdXRlc1xuICAgIGNvbnN0IGF1dGhSZXNvdXJjZSA9IGFwaVJlc291cmNlLmFkZFJlc291cmNlKCdhdXRoJyk7XG4gICAgY29uc3QgbG9naW5SZXNvdXJjZSA9IGF1dGhSZXNvdXJjZS5hZGRSZXNvdXJjZSgnbG9naW4nKTtcbiAgICBsb2dpblJlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIGxhbWJkYUludGVncmF0aW9uKTtcblxuICAgIGNvbnN0IHJlZ2lzdGVyUmVzb3VyY2UgPSBhdXRoUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3JlZ2lzdGVyJyk7XG4gICAgcmVnaXN0ZXJSZXNvdXJjZS5hZGRNZXRob2QoJ1BPU1QnLCBsYW1iZGFJbnRlZ3JhdGlvbik7XG5cbiAgICAvLyBQcm9maWxlIGFuZCBjYXJ0IHJvdXRlc1xuICAgIGNvbnN0IHByb2ZpbGVSZXNvdXJjZSA9IGFwaVJlc291cmNlLmFkZFJlc291cmNlKCdwcm9maWxlJyk7XG4gICAgcHJvZmlsZVJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuXG4gICAgY29uc3QgY2FydFJlc291cmNlID0gcHJvZmlsZVJlc291cmNlLmFkZFJlc291cmNlKCdjYXJ0Jyk7XG4gICAgY2FydFJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuICAgIGNhcnRSZXNvdXJjZS5hZGRNZXRob2QoJ1BVVCcsIGxhbWJkYUludGVncmF0aW9uKTtcbiAgICBjYXJ0UmVzb3VyY2UuYWRkTWV0aG9kKCdERUxFVEUnLCBsYW1iZGFJbnRlZ3JhdGlvbik7XG5cbiAgICBjb25zdCBvcmRlclJlc291cmNlID0gY2FydFJlc291cmNlLmFkZFJlc291cmNlKCdvcmRlcicpO1xuICAgIG9yZGVyUmVzb3VyY2UuYWRkTWV0aG9kKCdQVVQnLCBsYW1iZGFJbnRlZ3JhdGlvbik7XG4gICAgb3JkZXJSZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcsIGxhbWJkYUludGVncmF0aW9uKTtcblxuICAgIGNvbnN0IG9yZGVyc1Jlc291cmNlID0gYXBpUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ29yZGVycycpO1xuICAgIG9yZGVyc1Jlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuICAgIG9yZGVyc1Jlc291cmNlLmFkZE1ldGhvZCgnUE9TVCcsIGxhbWJkYUludGVncmF0aW9uKTtcblxuICAgIGNvbnN0IG9yZGVySWRSZXNvdXJjZSA9IG9yZGVyc1Jlc291cmNlLmFkZFJlc291cmNlKCd7aWR9Jyk7XG4gICAgb3JkZXJJZFJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuXG4gICAgY29uc3QgaGlzdG9yeVJlc291cmNlID0gb3JkZXJJZFJlc291cmNlLmFkZFJlc291cmNlKCdoaXN0b3J5Jyk7XG4gICAgaGlzdG9yeVJlc291cmNlLmFkZE1ldGhvZCgnR0VUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuXG4gICAgY29uc3Qgb3JkZXJTdGF0dXNSZXNvdXJjZSA9IG9yZGVySWRSZXNvdXJjZS5hZGRSZXNvdXJjZSgnc3RhdHVzJyk7XG4gICAgb3JkZXJTdGF0dXNSZXNvdXJjZS5hZGRNZXRob2QoJ1BVVCcsIGxhbWJkYUludGVncmF0aW9uKTtcblxuICAgIC8vIEhlYWx0aCBjaGVja1xuICAgIGFwaS5yb290LmFkZE1ldGhvZCgnR0VUJywgbGFtYmRhSW50ZWdyYXRpb24pO1xuXG4gICAgLy8gQ2F0Y2gtYWxsIHJvdXRlIGF0IHRoZSBlbmRcbiAgICBhcGkucm9vdC5hZGRQcm94eSh7XG4gICAgICBkZWZhdWx0SW50ZWdyYXRpb246IGxhbWJkYUludGVncmF0aW9uLFxuICAgICAgYW55TWV0aG9kOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgLy8gT3V0cHV0IHRoZSBBUEkgVVJMXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FwaVVybCcsIHtcbiAgICAgIHZhbHVlOiBhcGkudXJsLFxuICAgICAgZGVzY3JpcHRpb246ICdVUkwgb2YgdGhlIEFQSSBHYXRld2F5IGVuZHBvaW50JyxcbiAgICB9KTtcbiAgfVxufVxuIl19