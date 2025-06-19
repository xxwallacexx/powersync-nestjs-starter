import { Injectable } from '@nestjs/common';
import { ConfigRepository } from 'src/repositories/config.repository';
import { EventRepository } from 'src/repositories/event.repository';
import { LoggingRepository } from 'src/repositories/logging.repository';

@Injectable()
export class BaseService {
  constructor(
    protected logger: LoggingRepository,
    protected configRepository: ConfigRepository,
    protected eventRepository: EventRepository,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  get worker() {
    return this.configRepository.getWorker();
  }
}
