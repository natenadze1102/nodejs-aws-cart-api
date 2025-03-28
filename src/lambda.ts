import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';
import { Handler } from 'aws-lambda';

let cachedServer: Handler;

async function bootstrap(): Promise<Handler> {
  const expressApp = express();
  const nestApp = await NestFactory.create(AppModule);
  nestApp.enableCors();
  await nestApp.init();

  const expressAdapter = nestApp.getHttpAdapter();
  expressApp.use(expressAdapter.getInstance());

  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event, context, callback) => {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }

  return cachedServer(event, context, callback);
};
