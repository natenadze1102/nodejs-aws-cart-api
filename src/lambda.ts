import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Handler, Context, Callback } from 'aws-lambda';
import { configure as serverlessExpress } from '@codegenie/serverless-express';
import { Client } from 'pg';

let cachedServer: Handler;

async function testDatabaseConnection() {
  console.log('Testing database connection...');

  const client = new Client({
    host: 'cart-service-db.cd66u40eafyf.eu-central-1.rds.amazonaws.com',
    port: '5432',
    user: 'postgres',
    password: '1tCez7g1ere6DNgTwQS7',
    database: 'cartdb',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000, // Increased timeout
  });

  try {
    console.log(`Connecting to ${client.host}:${client.port}`);
    await client.connect();
    console.log('Database connection successful!');
    const result = await client.query('SELECT NOW() as now');
    console.log('Database query result:', result.rows[0]);
    await client.end();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    // Don't fail if we can't connect to the database
    return false;
  }
}

async function bootstrap(): Promise<Handler> {
  // Try to connect to DB but continue even if it fails
  try {
    await testDatabaseConnection();
  } catch (error) {
    console.error('Failed to test database connection:', error);
    // Continue anyway
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  try {
    await app.init();
    console.log('NestJS app initialized successfully');
  } catch (error) {
    console.error('Failed to initialize NestJS app:', error);
    throw error; // Rethrow to fail the bootstrap
  }

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  console.log('Lambda handler invoked with event:', JSON.stringify(event));

  // Important: Set this to false to prevent waiting for event loop to empty
  context.callbackWaitsForEmptyEventLoop = false;

  if (!cachedServer) {
    try {
      cachedServer = await bootstrap();
    } catch (error) {
      console.error('Bootstrap failed:', error);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Internal server error during bootstrap',
        }),
      };
    }
  }

  return cachedServer(event, context, callback);
};
