"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartServiceStack = void 0;
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const apigateway = require("aws-cdk-lib/aws-apigateway");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FydC1zZXJ2aWNlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NhcnQtc2VydmljZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFFbkMsaURBQWlEO0FBQ2pELHlEQUF5RDtBQUN6RCw2QkFBNkI7QUFDN0IsaUNBQWlDO0FBQ2pDLHVEQUFpRDtBQUVqRCw2QkFBNkI7QUFDN0IsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRWhCLE1BQWEsZ0JBQWlCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDN0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4Qiw4Q0FBOEM7UUFDOUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQ3ZFLE9BQU8sRUFBRSxvQkFBTyxDQUFDLFdBQVc7WUFDNUIsT0FBTyxFQUFFLHlCQUF5QjtZQUNsQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLEVBQUU7Z0JBQzdELE9BQU8sRUFBRTtvQkFDUCxTQUFTO29CQUNULGtCQUFrQjtvQkFDbEIsc0JBQXNCO29CQUN0QixxQkFBcUI7b0JBQ3JCLHlCQUF5QjtvQkFDekIsbUJBQW1CO29CQUNuQixtQkFBbUI7b0JBQ25CLE1BQU07b0JBQ04sTUFBTTtvQkFDTixVQUFVO29CQUNWLFVBQVU7b0JBQ1YsU0FBUztpQkFDVjthQUNGLENBQUM7WUFDRixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsb0JBQW9CO1lBQ3ZELFVBQVUsRUFBRSxHQUFHO1lBQ2Ysc0VBQXNFO1lBRXRFLFdBQVcsRUFBRTtnQkFDWCxRQUFRLEVBQUUsWUFBWTtnQkFDdEIsT0FBTyxFQUFFLDZEQUE2RDtnQkFDdEUsT0FBTyxFQUFFLE1BQU07Z0JBQ2YsV0FBVyxFQUFFLFVBQVU7Z0JBQ3ZCLFdBQVcsRUFBRSxzQkFBc0I7Z0JBQ25DLE9BQU8sRUFBRSxRQUFRO2dCQUNqQixNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksTUFBTTtnQkFDcEMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLE9BQU87Z0JBQ3ZDLFVBQVUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxNQUFNLEVBQUUscUNBQXFDO2FBQ3BGO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsOEJBQThCO1FBQzlCLE1BQU0sR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDekQsV0FBVyxFQUFFLGtCQUFrQjtZQUMvQixXQUFXLEVBQUUsc0JBQXNCO1lBQ25DLDJCQUEyQixFQUFFO2dCQUMzQixZQUFZLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXO2dCQUN6QyxZQUFZLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXO2dCQUN6QyxZQUFZLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxlQUFlO2FBQzlDO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsb0NBQW9DO1FBQ3BDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQ3hELGlCQUFpQixDQUNsQixDQUFDO1FBRUYseUNBQXlDO1FBQ3pDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ2hCLGtCQUFrQixFQUFFLGlCQUFpQjtZQUNyQyxTQUFTLEVBQUUsSUFBSTtTQUNoQixDQUFDLENBQUM7UUFFSCxxQkFBcUI7UUFDckIsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDaEMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHO1lBQ2QsV0FBVyxFQUFFLGlDQUFpQztTQUMvQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFyRUQsNENBcUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZG90ZW52IGZyb20gJ2RvdGVudic7XG5pbXBvcnQgeyBSdW50aW1lIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5cbi8vIExvYWQgZW52aXJvbm1lbnQgdmFyaWFibGVzXG5kb3RlbnYuY29uZmlnKCk7XG5cbmV4cG9ydCBjbGFzcyBDYXJ0U2VydmljZVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gQ3JlYXRlIExhbWJkYSBmdW5jdGlvbiBmb3IgdGhlIENhcnQgU2VydmljZVxuICAgIGNvbnN0IGNhcnRTZXJ2aWNlTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQ2FydFNlcnZpY2VMYW1iZGEnLCB7XG4gICAgICBydW50aW1lOiBSdW50aW1lLk5PREVKU18yMl9YLFxuICAgICAgaGFuZGxlcjogJ2Rpc3Qvc3JjL2xhbWJkYS5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vJyksIHtcbiAgICAgICAgZXhjbHVkZTogW1xuICAgICAgICAgICdjZGsub3V0JyxcbiAgICAgICAgICAnY2RrL25vZGVfbW9kdWxlcycsXG4gICAgICAgICAgJ25vZGVfbW9kdWxlcy9hd3MtY2RrJyxcbiAgICAgICAgICAnbm9kZV9tb2R1bGVzL0B0eXBlcycsXG4gICAgICAgICAgJ25vZGVfbW9kdWxlcy90eXBlc2NyaXB0JyxcbiAgICAgICAgICAnbm9kZV9tb2R1bGVzL2plc3QnLFxuICAgICAgICAgICdub2RlX21vZHVsZXMvLmJpbicsXG4gICAgICAgICAgJy5naXQnLFxuICAgICAgICAgICd0ZXN0JyxcbiAgICAgICAgICAnY292ZXJhZ2UnLFxuICAgICAgICAgICcqKi8qLm1hcCcsXG4gICAgICAgICAgJyoqLyoudHMnLFxuICAgICAgICBdLFxuICAgICAgfSksXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcyg2MCksIC8vIEluY3JlYXNlZCB0aW1lb3V0XG4gICAgICBtZW1vcnlTaXplOiA1MTIsXG4gICAgICAvLyBSZW1vdmUgVlBDIGNvbmZpZ3VyYXRpb24gZW50aXJlbHkgLSBubyB2cGMgb3IgdnBjU3VibmV0cyBwcm9wZXJ0aWVzXG5cbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIE5PREVfRU5WOiAncHJvZHVjdGlvbicsXG4gICAgICAgIERCX0hPU1Q6ICdjYXJ0LXNlcnZpY2UtZGIuY2Q2NnU0MGVhZnlmLmV1LWNlbnRyYWwtMS5yZHMuYW1hem9uYXdzLmNvbScsXG4gICAgICAgIERCX1BPUlQ6ICc1NDMyJyxcbiAgICAgICAgREJfVVNFUk5BTUU6ICdwb3N0Z3JlcycsXG4gICAgICAgIERCX1BBU1NXT1JEOiAnMXRDZXo3ZzFlcmU2RE5nVHdRUzcnLFxuICAgICAgICBEQl9OQU1FOiAnY2FydGRiJyxcbiAgICAgICAgREJfU1NMOiBwcm9jZXNzLmVudi5EQl9TU0wgfHwgJ3RydWUnLFxuICAgICAgICBEQl9TWU5DOiBwcm9jZXNzLmVudi5EQl9TWU5DIHx8ICdmYWxzZScsXG4gICAgICAgIERCX0xPR0dJTkc6IHByb2Nlc3MuZW52LkRCX0xPR0dJTkcgfHwgJ3RydWUnLCAvLyBFbmFibGUgbG9nZ2luZyBmb3IgdHJvdWJsZXNob290aW5nXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIEFQSSBHYXRld2F5IFJFU1QgQVBJXG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnQ2FydFNlcnZpY2VBcGknLCB7XG4gICAgICByZXN0QXBpTmFtZTogJ0NhcnQgU2VydmljZSBBUEknLFxuICAgICAgZGVzY3JpcHRpb246ICdBUEkgZm9yIENhcnQgU2VydmljZScsXG4gICAgICBkZWZhdWx0Q29yc1ByZWZsaWdodE9wdGlvbnM6IHtcbiAgICAgICAgYWxsb3dPcmlnaW5zOiBhcGlnYXRld2F5LkNvcnMuQUxMX09SSUdJTlMsXG4gICAgICAgIGFsbG93TWV0aG9kczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9NRVRIT0RTLFxuICAgICAgICBhbGxvd0hlYWRlcnM6IGFwaWdhdGV3YXkuQ29ycy5ERUZBVUxUX0hFQURFUlMsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gSW50ZWdyYXRlIEFQSSBHYXRld2F5IHdpdGggTGFtYmRhXG4gICAgY29uc3QgbGFtYmRhSW50ZWdyYXRpb24gPSBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihcbiAgICAgIGNhcnRTZXJ2aWNlTGFtYmRhLFxuICAgICk7XG5cbiAgICAvLyBBZGQgcHJveHkgcmVzb3VyY2UgdG8gaGFuZGxlIGFsbCBwYXRoc1xuICAgIGFwaS5yb290LmFkZFByb3h5KHtcbiAgICAgIGRlZmF1bHRJbnRlZ3JhdGlvbjogbGFtYmRhSW50ZWdyYXRpb24sXG4gICAgICBhbnlNZXRob2Q6IHRydWUsXG4gICAgfSk7XG5cbiAgICAvLyBPdXRwdXQgdGhlIEFQSSBVUkxcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQXBpVXJsJywge1xuICAgICAgdmFsdWU6IGFwaS51cmwsXG4gICAgICBkZXNjcmlwdGlvbjogJ1VSTCBvZiB0aGUgQVBJIEdhdGV3YXkgZW5kcG9pbnQnLFxuICAgIH0pO1xuICB9XG59XG4iXX0=