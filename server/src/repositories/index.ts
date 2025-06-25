import { ConfigRepository } from 'src/repositories/config.repository';
import { DatabaseRepository } from 'src/repositories/database.repository';
import { EventRepository } from 'src/repositories/event.repository';
import { LoggingRepository } from 'src/repositories/logging.repository';
import { TelemetryRepository } from 'src/repositories/telemetry.repository';

export const repositories = [
  ConfigRepository,
  DatabaseRepository,
  EventRepository,
  LoggingRepository,
  TelemetryRepository,
];
