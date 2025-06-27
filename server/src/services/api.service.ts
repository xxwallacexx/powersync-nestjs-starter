import { Injectable } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LoggingRepository } from 'src/repositories/logging.repository';

@Injectable()
export class ApiService {
  constructor(private logger: LoggingRepository) {
    this.logger.setContext(ApiService.name);
  }

  ssr(excludePaths: string[]) {
    return (request: Request, res: Response, next: NextFunction) => {
      if (
        request.url.startsWith('/api') ||
        request.method.toLowerCase() !== 'get' ||
        excludePaths.some((item) => request.url.startsWith(item))
      ) {
        return next();
      }

      res.status(500).json({ body: 'error', statusCode: 500 });
    };
  }
}
