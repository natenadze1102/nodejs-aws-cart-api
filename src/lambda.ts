import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Handler } from 'aws-lambda';
import * as serverlessExpress from '@vendia/serverless-express';
import { Client } from 'pg';

let cachedServer: Handler;

async function testDatabaseConnection() {
  console.log('Testing database connection...');

  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log(`Connecting to ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    await client.connect();
    console.log('Database connection successful!');
    const result = await client.query('SELECT NOW() as now');
    console.log('Database query result:', result.rows[0]);
    await client.end();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

async function bootstrap(): Promise<Handler> {
  // Test database connection first
  await testDatabaseConnection();

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress.configure({ app: expressApp });
}

export const handler: Handler = async (event, context, callback) => {
  console.log('Lambda handler invoked with event:', JSON.stringify(event));

  // Prevent Lambda from waiting for event loop to empty
  context.callbackWaitsForEmptyEventLoop = false;

  if (!cachedServer) {
    cachedServer = await bootstrap();
  }

  return cachedServer(event, context, callback);
};
