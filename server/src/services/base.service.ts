import { Injectable } from '@nestjs/common';
import { ConfigRepository } from 'src/repositories/config.repository';
import { DatabaseRepository } from 'src/repositories/database.repository';
import { EventRepository } from 'src/repositories/event.repository';
import { LoggingRepository } from 'src/repositories/logging.repository';
import { TelemetryRepository } from 'src/repositories/telemetry.repository';

@Injectable()
export class BaseService {
  constructor(
    protected logger: LoggingRepository,
    protected configRepository: ConfigRepository,
    protected eventRepository: EventRepository,
    protected databaseRepository: DatabaseRepository,
    protected telemetryRepository: TelemetryRepository,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  get worker() {
    return this.configRepository.getWorker();
  }
}
