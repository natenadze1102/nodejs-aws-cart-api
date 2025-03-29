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
            handler: 'dist/src/lambda.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../'), {
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
                ],
                // Remove bundling section to avoid Docker requirement
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FydC1zZXJ2aWNlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NhcnQtc2VydmljZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQkFBMkI7QUFDM0IsbUNBQW1DO0FBRW5DLGlEQUFpRDtBQUNqRCx5REFBeUQ7QUFDekQsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUVqQyw2QkFBNkI7QUFDN0IsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRWhCLE1BQWEsZ0JBQWlCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDN0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4Qiw4Q0FBOEM7UUFDOUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQ3ZFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLHlCQUF5QjtZQUNsQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQUU7Z0JBQzFELE9BQU8sRUFBRTtvQkFDUCxTQUFTO29CQUNULGtCQUFrQjtvQkFDbEIsc0JBQXNCO29CQUN0QixxQkFBcUI7b0JBQ3JCLHlCQUF5QjtvQkFDekIsbUJBQW1CO29CQUNuQixtQkFBbUI7b0JBQ25CLE1BQU07b0JBQ04sTUFBTTtvQkFDTixVQUFVO2lCQUNYO2dCQUNELHNEQUFzRDthQUN2RCxDQUFDO1lBQ0YsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNqQyxVQUFVLEVBQUUsR0FBRztZQUVmLFdBQVcsRUFBRTtnQkFDWCxRQUFRLEVBQUUsWUFBWTtnQkFDdEIseUJBQXlCO2dCQUN6QixPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksRUFBRTtnQkFDbEMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLE1BQU07Z0JBQ3RDLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxFQUFFO2dCQUMxQyxXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksRUFBRTtnQkFDMUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLEVBQUU7Z0JBQ2xDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBSSxNQUFNO2dCQUNwQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksT0FBTztnQkFDdkMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLE9BQU87YUFDOUM7U0FDRixDQUFDLENBQUM7UUFFSCw4QkFBOEI7UUFDOUIsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUN6RCxXQUFXLEVBQUUsa0JBQWtCO1lBQy9CLFdBQVcsRUFBRSxzQkFBc0I7WUFDbkMsMkJBQTJCLEVBQUU7Z0JBQzNCLFlBQVksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVc7Z0JBQ3pDLFlBQVksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVc7Z0JBQ3pDLFlBQVksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLGVBQWU7YUFDOUM7U0FDRixDQUFDLENBQUM7UUFFSCxvQ0FBb0M7UUFDcEMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FDeEQsaUJBQWlCLENBQ2xCLENBQUM7UUFFRix5Q0FBeUM7UUFDekMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDaEIsa0JBQWtCLEVBQUUsaUJBQWlCO1lBQ3JDLFNBQVMsRUFBRSxJQUFJO1NBQ2hCLENBQUMsQ0FBQztRQUVILHFCQUFxQjtRQUNyQixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUNoQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUc7WUFDZCxXQUFXLEVBQUUsaUNBQWlDO1NBQy9DLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXBFRCw0Q0FvRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBJbiBjYXJ0LXNlcnZpY2Utc3RhY2sudHNcbmltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGRvdGVudiBmcm9tICdkb3RlbnYnO1xuXG4vLyBMb2FkIGVudmlyb25tZW50IHZhcmlhYmxlc1xuZG90ZW52LmNvbmZpZygpO1xuXG5leHBvcnQgY2xhc3MgQ2FydFNlcnZpY2VTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIENyZWF0ZSBMYW1iZGEgZnVuY3Rpb24gZm9yIHRoZSBDYXJ0IFNlcnZpY2VcbiAgICBjb25zdCBjYXJ0U2VydmljZUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0NhcnRTZXJ2aWNlTGFtYmRhJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnZGlzdC9zcmMvbGFtYmRhLmhhbmRsZXInLCAvLyBUaGlzIHBvaW50cyB0byB0aGUgY29tcGlsZWQgbGFtYmRhIGhhbmRsZXIgaW4gZGlzdC9zcmNcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vJyksIHtcbiAgICAgICAgZXhjbHVkZTogW1xuICAgICAgICAgICdjZGsub3V0JyxcbiAgICAgICAgICAnY2RrL25vZGVfbW9kdWxlcycsXG4gICAgICAgICAgJ25vZGVfbW9kdWxlcy9hd3MtY2RrJyxcbiAgICAgICAgICAnbm9kZV9tb2R1bGVzL0B0eXBlcycsXG4gICAgICAgICAgJ25vZGVfbW9kdWxlcy90eXBlc2NyaXB0JyxcbiAgICAgICAgICAnbm9kZV9tb2R1bGVzL2plc3QnLFxuICAgICAgICAgICdub2RlX21vZHVsZXMvLmJpbicsXG4gICAgICAgICAgJy5naXQnLFxuICAgICAgICAgICd0ZXN0JyxcbiAgICAgICAgICAnY292ZXJhZ2UnLFxuICAgICAgICBdLFxuICAgICAgICAvLyBSZW1vdmUgYnVuZGxpbmcgc2VjdGlvbiB0byBhdm9pZCBEb2NrZXIgcmVxdWlyZW1lbnRcbiAgICAgIH0pLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogNTEyLFxuXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nLFxuICAgICAgICAvLyBEYXRhYmFzZSBjb25maWd1cmF0aW9uXG4gICAgICAgIERCX0hPU1Q6IHByb2Nlc3MuZW52LkRCX0hPU1QgfHwgJycsXG4gICAgICAgIERCX1BPUlQ6IHByb2Nlc3MuZW52LkRCX1BPUlQgfHwgJzU0MzInLFxuICAgICAgICBEQl9VU0VSTkFNRTogcHJvY2Vzcy5lbnYuREJfVVNFUk5BTUUgfHwgJycsXG4gICAgICAgIERCX1BBU1NXT1JEOiBwcm9jZXNzLmVudi5EQl9QQVNTV09SRCB8fCAnJyxcbiAgICAgICAgREJfTkFNRTogcHJvY2Vzcy5lbnYuREJfTkFNRSB8fCAnJyxcbiAgICAgICAgREJfU1NMOiBwcm9jZXNzLmVudi5EQl9TU0wgfHwgJ3RydWUnLFxuICAgICAgICBEQl9TWU5DOiBwcm9jZXNzLmVudi5EQl9TWU5DIHx8ICdmYWxzZScsXG4gICAgICAgIERCX0xPR0dJTkc6IHByb2Nlc3MuZW52LkRCX0xPR0dJTkcgfHwgJ2ZhbHNlJyxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgQVBJIEdhdGV3YXkgUkVTVCBBUElcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsICdDYXJ0U2VydmljZUFwaScsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiAnQ2FydCBTZXJ2aWNlIEFQSScsXG4gICAgICBkZXNjcmlwdGlvbjogJ0FQSSBmb3IgQ2FydCBTZXJ2aWNlJyxcbiAgICAgIGRlZmF1bHRDb3JzUHJlZmxpZ2h0T3B0aW9uczoge1xuICAgICAgICBhbGxvd09yaWdpbnM6IGFwaWdhdGV3YXkuQ29ycy5BTExfT1JJR0lOUyxcbiAgICAgICAgYWxsb3dNZXRob2RzOiBhcGlnYXRld2F5LkNvcnMuQUxMX01FVEhPRFMsXG4gICAgICAgIGFsbG93SGVhZGVyczogYXBpZ2F0ZXdheS5Db3JzLkRFRkFVTFRfSEVBREVSUyxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBJbnRlZ3JhdGUgQVBJIEdhdGV3YXkgd2l0aCBMYW1iZGFcbiAgICBjb25zdCBsYW1iZGFJbnRlZ3JhdGlvbiA9IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKFxuICAgICAgY2FydFNlcnZpY2VMYW1iZGEsXG4gICAgKTtcblxuICAgIC8vIEFkZCBwcm94eSByZXNvdXJjZSB0byBoYW5kbGUgYWxsIHBhdGhzXG4gICAgYXBpLnJvb3QuYWRkUHJveHkoe1xuICAgICAgZGVmYXVsdEludGVncmF0aW9uOiBsYW1iZGFJbnRlZ3JhdGlvbixcbiAgICAgIGFueU1ldGhvZDogdHJ1ZSxcbiAgICB9KTtcblxuICAgIC8vIE91dHB1dCB0aGUgQVBJIFVSTFxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdBcGlVcmwnLCB7XG4gICAgICB2YWx1ZTogYXBpLnVybCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVVJMIG9mIHRoZSBBUEkgR2F0ZXdheSBlbmRwb2ludCcsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==