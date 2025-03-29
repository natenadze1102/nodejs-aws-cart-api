"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartServiceStack = void 0;
// In cart-service-stack.ts
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const path = require("path");
const dotenv = require("dotenv");
// Load environment variables
dotenv.config();
class CartServiceStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Create Lambda function for the Cart Service
        const cartServiceLambda = new lambda.Function(this, 'CartServiceLambda', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'lambda.handler',
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
                    '**/*.map',
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
        const lambdaIntegration = new apigateway.LambdaIntegration(cartServiceLambda);
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
exports.CartServiceStack = CartServiceStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FydC1zZXJ2aWNlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NhcnQtc2VydmljZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQkFBMkI7QUFDM0IsbUNBQW1DO0FBRW5DLGlEQUFpRDtBQUNqRCx5REFBeUQ7QUFDekQsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUVqQyw2QkFBNkI7QUFDN0IsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRWhCLE1BQWEsZ0JBQWlCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDN0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4Qiw4Q0FBOEM7UUFDOUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQ3ZFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLGdCQUFnQjtZQUN6QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsbUJBQW1CLENBQUMsRUFBRTtnQkFDckUsT0FBTyxFQUFFO29CQUNQLFNBQVM7b0JBQ1Qsa0JBQWtCO29CQUNsQixzQkFBc0I7b0JBQ3RCLHFCQUFxQjtvQkFDckIseUJBQXlCO29CQUN6QixtQkFBbUI7b0JBQ25CLG1CQUFtQjtvQkFDbkIsTUFBTTtvQkFDTixNQUFNO29CQUNOLFVBQVU7b0JBQ1YsVUFBVTtvQkFDVixTQUFTLEVBQUUsbURBQW1EO2lCQUMvRDthQUNGLENBQUM7WUFDRixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ2pDLFVBQVUsRUFBRSxHQUFHO1lBRWYsV0FBVyxFQUFFO2dCQUNYLFFBQVEsRUFBRSxZQUFZO2dCQUN0Qix5QkFBeUI7Z0JBQ3pCLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxFQUFFO2dCQUNsQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksTUFBTTtnQkFDdEMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLEVBQUU7Z0JBQzFDLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxFQUFFO2dCQUMxQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksRUFBRTtnQkFDbEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLE1BQU07Z0JBQ3BDLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxPQUFPO2dCQUN2QyxVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksT0FBTzthQUM5QztTQUNGLENBQUMsQ0FBQztRQUVILDhCQUE4QjtRQUM5QixNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ3pELFdBQVcsRUFBRSxrQkFBa0I7WUFDL0IsV0FBVyxFQUFFLHNCQUFzQjtZQUNuQywyQkFBMkIsRUFBRTtnQkFDM0IsWUFBWSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVztnQkFDekMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVztnQkFDekMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsZUFBZTthQUM5QztTQUNGLENBQUMsQ0FBQztRQUVILG9DQUFvQztRQUNwQyxNQUFNLGlCQUFpQixHQUFHLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUN4RCxpQkFBaUIsQ0FDbEIsQ0FBQztRQUVGLHlDQUF5QztRQUN6QyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUNoQixrQkFBa0IsRUFBRSxpQkFBaUI7WUFDckMsU0FBUyxFQUFFLElBQUk7U0FDaEIsQ0FBQyxDQUFDO1FBRUgscUJBQXFCO1FBQ3JCLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO1lBQ2hDLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRztZQUNkLFdBQVcsRUFBRSxpQ0FBaUM7U0FDL0MsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBckVELDRDQXFFQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEluIGNhcnQtc2VydmljZS1zdGFjay50c1xuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZG90ZW52IGZyb20gJ2RvdGVudic7XG5cbi8vIExvYWQgZW52aXJvbm1lbnQgdmFyaWFibGVzXG5kb3RlbnYuY29uZmlnKCk7XG5cbmV4cG9ydCBjbGFzcyBDYXJ0U2VydmljZVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gQ3JlYXRlIExhbWJkYSBmdW5jdGlvbiBmb3IgdGhlIENhcnQgU2VydmljZVxuICAgIGNvbnN0IGNhcnRTZXJ2aWNlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ2FydFNlcnZpY2VMYW1iZGEnLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdsYW1iZGEuaGFuZGxlcicsIC8vIFRoaXMgcG9pbnRzIHRvIHRoZSBjb21waWxlZCBsYW1iZGEgaGFuZGxlciBpbiBkaXN0L3NyY1xuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi9kaXN0L3NyYycpLCB7XG4gICAgICAgIGV4Y2x1ZGU6IFtcbiAgICAgICAgICAnY2RrLm91dCcsXG4gICAgICAgICAgJ2Nkay9ub2RlX21vZHVsZXMnLFxuICAgICAgICAgICdub2RlX21vZHVsZXMvYXdzLWNkaycsXG4gICAgICAgICAgJ25vZGVfbW9kdWxlcy9AdHlwZXMnLFxuICAgICAgICAgICdub2RlX21vZHVsZXMvdHlwZXNjcmlwdCcsXG4gICAgICAgICAgJ25vZGVfbW9kdWxlcy9qZXN0JyxcbiAgICAgICAgICAnbm9kZV9tb2R1bGVzLy5iaW4nLFxuICAgICAgICAgICcuZ2l0JyxcbiAgICAgICAgICAndGVzdCcsXG4gICAgICAgICAgJ2NvdmVyYWdlJyxcbiAgICAgICAgICAnKiovKi5tYXAnLCAvLyBTb3VyY2UgbWFwcyBub3QgbmVlZGVkIGluIHByb2R1Y3Rpb25cbiAgICAgICAgICAnKiovKi50cycsIC8vIFR5cGVTY3JpcHQgc291cmNlIGZpbGVzIG5vdCBuZWVkZWQgaW4gcHJvZHVjdGlvblxuICAgICAgICBdLFxuICAgICAgfSksXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiA1MTIsXG5cbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIE5PREVfRU5WOiAncHJvZHVjdGlvbicsXG4gICAgICAgIC8vIERhdGFiYXNlIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgREJfSE9TVDogcHJvY2Vzcy5lbnYuREJfSE9TVCB8fCAnJyxcbiAgICAgICAgREJfUE9SVDogcHJvY2Vzcy5lbnYuREJfUE9SVCB8fCAnNTQzMicsXG4gICAgICAgIERCX1VTRVJOQU1FOiBwcm9jZXNzLmVudi5EQl9VU0VSTkFNRSB8fCAnJyxcbiAgICAgICAgREJfUEFTU1dPUkQ6IHByb2Nlc3MuZW52LkRCX1BBU1NXT1JEIHx8ICcnLFxuICAgICAgICBEQl9OQU1FOiBwcm9jZXNzLmVudi5EQl9OQU1FIHx8ICcnLFxuICAgICAgICBEQl9TU0w6IHByb2Nlc3MuZW52LkRCX1NTTCB8fCAndHJ1ZScsXG4gICAgICAgIERCX1NZTkM6IHByb2Nlc3MuZW52LkRCX1NZTkMgfHwgJ2ZhbHNlJyxcbiAgICAgICAgREJfTE9HR0lORzogcHJvY2Vzcy5lbnYuREJfTE9HR0lORyB8fCAnZmFsc2UnLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBBUEkgR2F0ZXdheSBSRVNUIEFQSVxuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ0NhcnRTZXJ2aWNlQXBpJywge1xuICAgICAgcmVzdEFwaU5hbWU6ICdDYXJ0IFNlcnZpY2UgQVBJJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQVBJIGZvciBDYXJ0IFNlcnZpY2UnLFxuICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XG4gICAgICAgIGFsbG93T3JpZ2luczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9PUklHSU5TLFxuICAgICAgICBhbGxvd01ldGhvZHM6IGFwaWdhdGV3YXkuQ29ycy5BTExfTUVUSE9EUyxcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBhcGlnYXRld2F5LkNvcnMuREVGQVVMVF9IRUFERVJTLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIEludGVncmF0ZSBBUEkgR2F0ZXdheSB3aXRoIExhbWJkYVxuICAgIGNvbnN0IGxhbWJkYUludGVncmF0aW9uID0gbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oXG4gICAgICBjYXJ0U2VydmljZUxhbWJkYSxcbiAgICApO1xuXG4gICAgLy8gQWRkIHByb3h5IHJlc291cmNlIHRvIGhhbmRsZSBhbGwgcGF0aHNcbiAgICBhcGkucm9vdC5hZGRQcm94eSh7XG4gICAgICBkZWZhdWx0SW50ZWdyYXRpb246IGxhbWJkYUludGVncmF0aW9uLFxuICAgICAgYW55TWV0aG9kOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgLy8gT3V0cHV0IHRoZSBBUEkgVVJMXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FwaVVybCcsIHtcbiAgICAgIHZhbHVlOiBhcGkudXJsLFxuICAgICAgZGVzY3JpcHRpb246ICdVUkwgb2YgdGhlIEFQSSBHYXRld2F5IGVuZHBvaW50JyxcbiAgICB9KTtcbiAgfVxufVxuIl19