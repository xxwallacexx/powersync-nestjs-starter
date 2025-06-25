import { HttpException } from '@nestjs/common';
import { LoggingRepository } from 'src/repositories/logging.repository';
import { TelemetryRepository } from 'src/repositories/telemetry.repository';

export const logGlobalError = (logger: LoggingRepository, telemetryRepository: TelemetryRepository, error: Error) => {
  const traceId = telemetryRepository.getTraceId();

  if (error instanceof HttpException) {
    const status = error.getStatus();
    const response = error.getResponse();
    logger.debug(`HttpException: ${traceId} HttpException(${status}): ${JSON.stringify(response)}`);
    return;
  }

  if (error instanceof Error) {
    logger.error(`Error: ${traceId} Unknown error: ${error}`, error?.stack);
    return;
  }
};
