import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, finalize } from 'rxjs';
import { LoggingRepository } from 'src/repositories/logging.repository';
import { TelemetryRepository } from 'src/repositories/telemetry.repository';

const maxArrayLength = 100;
const replacer = (key: string, value: unknown) => {
  if (key.toLowerCase().includes('password')) {
    return '********';
  }

  if (Array.isArray(value) && value.length > maxArrayLength) {
    return [...value.slice(0, maxArrayLength), `...and ${value.length - maxArrayLength} more`];
  }

  return value;
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private logger: LoggingRepository,
    private telemetryRepository: TelemetryRepository,
  ) {
    this.logger.setContext(LoggingInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const traceId = this.telemetryRepository.getTraceId();
    const handler = context.switchToHttp();
    const req = handler.getRequest<Request>();
    const res = handler.getResponse<Response>();

    const { method, ip, url } = req;

    const start = performance.now();

    return next.handle().pipe(
      finalize(() => {
        const finish = performance.now();
        const duration = (finish - start).toFixed(2);
        const { statusCode } = res;

        this.logger.log(`Request: ${traceId} ${method} ${url} ${statusCode} ${duration}ms ${ip}`);

        if (req.body && Object.keys(req.body).length > 0) {
          this.logger.log(`Body: ${traceId} ${JSON.stringify(req.body, replacer)}`);
        }
      }),
    );
  }
}
