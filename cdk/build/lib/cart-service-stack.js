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
                    'coverage'
                ],
                bundling: {
                    image: lambda.Runtime.NODEJS_18_X.bundlingImage,
                    user: 'root',
                    command: [
                        'bash', '-c', [
                            'cp -r . /asset-output',
                            'cd /asset-output',
                            'npm ci --production'
                        ].join(' && ')
                    ]
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FydC1zZXJ2aWNlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NhcnQtc2VydmljZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQkFBMkI7QUFDM0IsbUNBQW1DO0FBRW5DLGlEQUFpRDtBQUNqRCx5REFBeUQ7QUFDekQsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUVqQyw2QkFBNkI7QUFDN0IsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRWhCLE1BQWEsZ0JBQWlCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDN0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4Qiw4Q0FBOEM7UUFDOUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQ3ZFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLHlCQUF5QjtZQUNsQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQUU7Z0JBQzFELE9BQU8sRUFBRTtvQkFDUCxTQUFTO29CQUNULGtCQUFrQjtvQkFDbEIsc0JBQXNCO29CQUN0QixxQkFBcUI7b0JBQ3JCLHlCQUF5QjtvQkFDekIsbUJBQW1CO29CQUNuQixtQkFBbUI7b0JBQ25CLE1BQU07b0JBQ04sTUFBTTtvQkFDTixVQUFVO2lCQUNYO2dCQUNELFFBQVEsRUFBRTtvQkFDUixLQUFLLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsYUFBYTtvQkFDL0MsSUFBSSxFQUFFLE1BQU07b0JBQ1osT0FBTyxFQUFFO3dCQUNQLE1BQU0sRUFBRSxJQUFJLEVBQUU7NEJBQ1osdUJBQXVCOzRCQUN2QixrQkFBa0I7NEJBQ2xCLHFCQUFxQjt5QkFDdEIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO3FCQUNmO2lCQUNGO2FBQ0YsQ0FBQztZQUNGLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDakMsVUFBVSxFQUFFLEdBQUc7WUFFZixXQUFXLEVBQUU7Z0JBQ1gsUUFBUSxFQUFFLFlBQVk7Z0JBQ3RCLHlCQUF5QjtnQkFDekIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLEVBQUU7Z0JBQ2xDLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxNQUFNO2dCQUN0QyxXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksRUFBRTtnQkFDMUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLEVBQUU7Z0JBQzFDLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxFQUFFO2dCQUNsQyxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksTUFBTTtnQkFDcEMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLE9BQU87Z0JBQ3ZDLFVBQVUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxPQUFPO2FBQzlDO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsOEJBQThCO1FBQzlCLE1BQU0sR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDekQsV0FBVyxFQUFFLGtCQUFrQjtZQUMvQixXQUFXLEVBQUUsc0JBQXNCO1lBQ25DLDJCQUEyQixFQUFFO2dCQUMzQixZQUFZLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXO2dCQUN6QyxZQUFZLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXO2dCQUN6QyxZQUFZLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxlQUFlO2FBQzlDO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsb0NBQW9DO1FBQ3BDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQ3hELGlCQUFpQixDQUNsQixDQUFDO1FBRUYseUNBQXlDO1FBQ3pDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ2hCLGtCQUFrQixFQUFFLGlCQUFpQjtZQUNyQyxTQUFTLEVBQUUsSUFBSTtTQUNoQixDQUFDLENBQUM7UUFFSCxxQkFBcUI7UUFDckIsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDaEMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHO1lBQ2QsV0FBVyxFQUFFLGlDQUFpQztTQUMvQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUE5RUQsNENBOEVDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gSW4gY2FydC1zZXJ2aWNlLXN0YWNrLnRzXG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBkb3RlbnYgZnJvbSAnZG90ZW52JztcblxuLy8gTG9hZCBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbmRvdGVudi5jb25maWcoKTtcblxuZXhwb3J0IGNsYXNzIENhcnRTZXJ2aWNlU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLyBDcmVhdGUgTGFtYmRhIGZ1bmN0aW9uIGZvciB0aGUgQ2FydCBTZXJ2aWNlXG4gICAgY29uc3QgY2FydFNlcnZpY2VMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdDYXJ0U2VydmljZUxhbWJkYScsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgaGFuZGxlcjogJ2Rpc3Qvc3JjL2xhbWJkYS5oYW5kbGVyJywgLy8gVGhpcyBwb2ludHMgdG8gdGhlIGNvbXBpbGVkIGxhbWJkYSBoYW5kbGVyIGluIGRpc3Qvc3JjXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uLycpLCB7XG4gICAgICAgIGV4Y2x1ZGU6IFtcbiAgICAgICAgICAnY2RrLm91dCcsXG4gICAgICAgICAgJ2Nkay9ub2RlX21vZHVsZXMnLFxuICAgICAgICAgICdub2RlX21vZHVsZXMvYXdzLWNkaycsXG4gICAgICAgICAgJ25vZGVfbW9kdWxlcy9AdHlwZXMnLFxuICAgICAgICAgICdub2RlX21vZHVsZXMvdHlwZXNjcmlwdCcsXG4gICAgICAgICAgJ25vZGVfbW9kdWxlcy9qZXN0JyxcbiAgICAgICAgICAnbm9kZV9tb2R1bGVzLy5iaW4nLFxuICAgICAgICAgICcuZ2l0JyxcbiAgICAgICAgICAndGVzdCcsXG4gICAgICAgICAgJ2NvdmVyYWdlJ1xuICAgICAgICBdLFxuICAgICAgICBidW5kbGluZzoge1xuICAgICAgICAgIGltYWdlOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWC5idW5kbGluZ0ltYWdlLFxuICAgICAgICAgIHVzZXI6ICdyb290JyxcbiAgICAgICAgICBjb21tYW5kOiBbXG4gICAgICAgICAgICAnYmFzaCcsICctYycsIFtcbiAgICAgICAgICAgICAgJ2NwIC1yIC4gL2Fzc2V0LW91dHB1dCcsXG4gICAgICAgICAgICAgICdjZCAvYXNzZXQtb3V0cHV0JyxcbiAgICAgICAgICAgICAgJ25wbSBjaSAtLXByb2R1Y3Rpb24nXG4gICAgICAgICAgICBdLmpvaW4oJyAmJiAnKVxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiA1MTIsXG4gICAgICBcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIE5PREVfRU5WOiAncHJvZHVjdGlvbicsXG4gICAgICAgIC8vIERhdGFiYXNlIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgREJfSE9TVDogcHJvY2Vzcy5lbnYuREJfSE9TVCB8fCAnJyxcbiAgICAgICAgREJfUE9SVDogcHJvY2Vzcy5lbnYuREJfUE9SVCB8fCAnNTQzMicsXG4gICAgICAgIERCX1VTRVJOQU1FOiBwcm9jZXNzLmVudi5EQl9VU0VSTkFNRSB8fCAnJyxcbiAgICAgICAgREJfUEFTU1dPUkQ6IHByb2Nlc3MuZW52LkRCX1BBU1NXT1JEIHx8ICcnLFxuICAgICAgICBEQl9OQU1FOiBwcm9jZXNzLmVudi5EQl9OQU1FIHx8ICcnLFxuICAgICAgICBEQl9TU0w6IHByb2Nlc3MuZW52LkRCX1NTTCB8fCAndHJ1ZScsXG4gICAgICAgIERCX1NZTkM6IHByb2Nlc3MuZW52LkRCX1NZTkMgfHwgJ2ZhbHNlJyxcbiAgICAgICAgREJfTE9HR0lORzogcHJvY2Vzcy5lbnYuREJfTE9HR0lORyB8fCAnZmFsc2UnLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBBUEkgR2F0ZXdheSBSRVNUIEFQSVxuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ0NhcnRTZXJ2aWNlQXBpJywge1xuICAgICAgcmVzdEFwaU5hbWU6ICdDYXJ0IFNlcnZpY2UgQVBJJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQVBJIGZvciBDYXJ0IFNlcnZpY2UnLFxuICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XG4gICAgICAgIGFsbG93T3JpZ2luczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9PUklHSU5TLFxuICAgICAgICBhbGxvd01ldGhvZHM6IGFwaWdhdGV3YXkuQ29ycy5BTExfTUVUSE9EUyxcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBhcGlnYXRld2F5LkNvcnMuREVGQVVMVF9IRUFERVJTLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIEludGVncmF0ZSBBUEkgR2F0ZXdheSB3aXRoIExhbWJkYVxuICAgIGNvbnN0IGxhbWJkYUludGVncmF0aW9uID0gbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oXG4gICAgICBjYXJ0U2VydmljZUxhbWJkYSxcbiAgICApO1xuXG4gICAgLy8gQWRkIHByb3h5IHJlc291cmNlIHRvIGhhbmRsZSBhbGwgcGF0aHNcbiAgICBhcGkucm9vdC5hZGRQcm94eSh7XG4gICAgICBkZWZhdWx0SW50ZWdyYXRpb246IGxhbWJkYUludGVncmF0aW9uLFxuICAgICAgYW55TWV0aG9kOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgLy8gT3V0cHV0IHRoZSBBUEkgVVJMXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FwaVVybCcsIHtcbiAgICAgIHZhbHVlOiBhcGkudXJsLFxuICAgICAgZGVzY3JpcHRpb246ICdVUkwgb2YgdGhlIEFQSSBHYXRld2F5IGVuZHBvaW50JyxcbiAgICB9KTtcbiAgfVxufSJdfQ==