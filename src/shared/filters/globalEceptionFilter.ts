import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Log the error for debugging
    console.error('Exception caught by filter:', exception);

    if (exception instanceof HttpException) {
      // Handle NestJS HTTP exceptions
      const status = exception.getStatus();
      return response.status(status).json({
        statusCode: status,
        message: exception.message,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    if (exception instanceof EntityNotFoundError) {
      // Handle TypeORM not found errors
      return response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Resource not found',
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    if (exception instanceof QueryFailedError) {
      // For database query errors
      const status = exception.message.includes('not found')
        ? HttpStatus.NOT_FOUND
        : HttpStatus.BAD_REQUEST;

      return response.status(status).json({
        statusCode: status,
        message: 'Database query failed',
        error: exception.message,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    // Generic server error for all other cases
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
