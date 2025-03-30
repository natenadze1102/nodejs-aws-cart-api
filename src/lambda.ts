import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Handler } from 'aws-lambda';
import { configure as serverlessExpress } from '@codegenie/serverless-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

let cachedServer: Handler;

async function bootstrap(): Promise<Handler> {
  if (cachedServer) {
    console.log('Using cached server');
    return cachedServer;
  }

  console.log('Creating new server instance');
  const expressApp = express();

  // Add request logger middleware
  expressApp.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.path}`);
    console.log('Headers:', JSON.stringify(req.headers));
    next();
  });

  // Create NestJS app
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    },
  );

  // Enable CORS
  nestApp.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization',
    credentials: true,
  });

  // Add global prefix if needed
  // nestApp.setGlobalPrefix('prod'); // Remove or adjust based on your API Gateway stage name

  // Initialize the app
  await nestApp.init();

  // Configure serverless-express
  cachedServer = serverlessExpress({ app: expressApp });
  return cachedServer;
}

export const handler: Handler = async (event, context, callback) => {
  console.log(
    'Lambda handler invoked with event:',
    JSON.stringify(event, null, 2),
  );

  // Important: API Gateway stage mappings and base paths
  // Check if path includes the stage name (like /prod/api/auth/register)
  if (event.path && event.path.startsWith('/prod/')) {
    console.log('Removing /prod prefix from path');
    event.path = event.path.substring(5); // Remove '/prod' prefix
  }

  // Normalize auth header case (API Gateway sometimes lowercases headers)
  if (event.headers) {
    if (event.headers.authorization && !event.headers.Authorization) {
      event.headers.Authorization = event.headers.authorization;
      delete event.headers.authorization;
    }
  }

  // For debugging
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
      },
      body: JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};
