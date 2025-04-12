import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Handler } from 'aws-lambda';
import { configure as serverlessExpress } from '@codegenie/serverless-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { GlobalExceptionFilter } from './shared/filters/globalEceptionFilter';

let cachedServer: Handler;

async function bootstrap(): Promise<Handler> {
  if (cachedServer) {
    console.log('Using cached server');
    return cachedServer;
  }

  console.log('Creating new server instance');
  const expressApp = express();

  // Use a simple logging middleware only (do not set CORS here)
  expressApp.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.path}`);
    next();
  });

  // Create NestJS app using the Express adapter
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger: ['log', 'error', 'warn', 'debug', 'verbose'] },
  );

  nestApp.useGlobalFilters(new GlobalExceptionFilter());

  // Enable CORS with Nest's built-in method.
  // Note: when credentials is true, the origin must be explicit and without a trailing slash.
  nestApp.enableCors({
    origin: ['http://localhost:3000', 'https://dzeadadyb2u8g.cloudfront.net'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization',
    credentials: true,
  });

  // Optionally, if your API Gateway stage adds a prefix (like '/prod'), uncomment:
  // nestApp.setGlobalPrefix('prod');

  await nestApp.init();

  // Configure serverless-express to use the Nest-powered Express app.
  cachedServer = serverlessExpress({ app: expressApp });
  return cachedServer;
}

export const handler: Handler = async (event, context, callback) => {
  console.log(
    'Lambda handler invoked with event:',
    JSON.stringify(event, null, 2),
  );

  // Remove stage prefix if applicable.
  if (event.path && event.path.startsWith('/prod/')) {
    console.log('Removing /prod prefix from path');
    event.path = event.path.substring(5);
  }

  // Normalize auth header case.
  if (event.headers) {
    if (event.headers.authorization && !event.headers.Authorization) {
      event.headers.Authorization = event.headers.authorization;
      delete event.headers.authorization;
    }
  }

  console.log('Processed path:', event.path);
  console.log('Method:', event.httpMethod);

  if (event.body && event.isBase64Encoded) {
    try {
      const decodedBody = Buffer.from(event.body, 'base64').toString();
      console.log('Decoded body:', decodedBody);
    } catch (error) {
      console.error('Error decoding body:', error);
    }
  } else if (event.body) {
    console.log('Body (not base64):', event.body);
  }

  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const server = cachedServer || (await bootstrap());
    return server(event, context, callback);
  } catch (error) {
    console.error('Error in handler:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};
