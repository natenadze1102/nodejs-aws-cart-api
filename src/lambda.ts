import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Handler, Context, Callback } from 'aws-lambda';
import { configure as serverlessExpress } from '@codegenie/serverless-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

let cachedServer: Handler;

async function bootstrap(): Promise<Handler> {
  if (cachedServer) {
    return cachedServer;
  }

  const expressApp = express();

  // Add request logger middleware
  expressApp.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.path}`);
    console.log('Headers:', JSON.stringify(req.headers));
    next();
  });

  // Create NestJS app with enhanced logging
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    },
  );

  nestApp.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization',
    credentials: true,
  });

  await nestApp.init();

  // Add error handling middleware
  expressApp.use((err, req, res, next) => {
    console.error('Express error handler:', err);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      error: err.message,
    });
  });

  cachedServer = serverlessExpress({ app: expressApp });
  return cachedServer;
}

export const handler: Handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    console.log('Lambda event:', JSON.stringify(event, null, 2));

    // Log if authorization header is present
    if (event.headers && event.headers.Authorization) {
      console.log('Authorization header is present');
    } else if (event.headers && event.headers.authorization) {
      console.log('authorization header is present (lowercase)');
      // Normalize header names (API Gateway can send lowercase headers)
      event.headers.Authorization = event.headers.authorization;
      delete event.headers.authorization;
    } else {
      console.log('No authorization header present in request');
    }

    // Initialize server if not already cached
    if (!cachedServer) {
      console.log('Initializing server...');
      cachedServer = await bootstrap();
      console.log('Server initialized');
    }

    // Handle the request with callback parameter
    return cachedServer(event, context, callback);
  } catch (error) {
    console.error('Unhandled error in Lambda handler:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        statusCode: 500,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }),
    };
  }
};
