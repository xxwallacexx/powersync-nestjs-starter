import { ConfigRepository } from 'src/repositories/config.repository';
import { LoggingRepository } from 'src/repositories/logging.repository';
import { EventRepository } from './event.repository';

export const repositories = [
  ConfigRepository,
  EventRepository,
  LoggingRepository,
];
