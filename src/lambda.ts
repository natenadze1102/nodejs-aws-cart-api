import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Handler } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';

// Change this line: cachedServer should be Handler type, not Server
let cachedServer: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event, context, callback) => {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }

  return cachedServer(event, context, callback);
};
