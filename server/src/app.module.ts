import { BullModule } from '@nestjs/bullmq';
import { Inject, Module, OnModuleDestroy, OnModuleInit, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { ClsModule } from 'nestjs-cls';
import { OpenTelemetryModule } from 'nestjs-otel';
import { IWorker } from 'src/constants';
import { controllers } from 'src/controllers';
import { AppWorker } from 'src/enum';
import { ErrorInterceptor } from 'src/middlewares/error.interceptor';
import { GlobalExceptionFilter } from 'src/middlewares/global-exception.filter';
import { LoggingInterceptor } from 'src/middlewares/logging.interceptor';
import { repositories } from 'src/repositories';
import { ConfigRepository } from 'src/repositories/config.repository';
import { EventRepository } from 'src/repositories/event.repository';
import { LoggingRepository } from 'src/repositories/logging.repository';
import { TelemetryRepository } from 'src/repositories/telemetry.repository';
import { services } from 'src/services';

const common = [...repositories, ...services, GlobalExceptionFilter];

const middleware = [
  { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  {
    provide: APP_PIPE,
    useValue: new ValidationPipe({ transform: true, whitelist: true }),
  },
  { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  { provide: APP_INTERCEPTOR, useClass: ErrorInterceptor },
];

const configRepository = new ConfigRepository();
const { bull, cls, otel } = configRepository.getEnv();

const imports = [
  BullModule.forRoot(bull.config),
  BullModule.registerQueue(...bull.queues),
  ClsModule.forRoot(cls.config),
  OpenTelemetryModule.forRoot(otel),
];

class BaseModule implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(IWorker) private worker: AppWorker,
    logger: LoggingRepository,
    private telemetryRepository: TelemetryRepository,
    private eventRepository: EventRepository,
  ) {
    logger.setAppName(this.worker);
  }

  async onModuleInit() {
    this.telemetryRepository.setup({ repositories });

    this.eventRepository.setup({ services });
    await this.eventRepository.emit('app.bootstrap');
  }
  async onModuleDestroy() {
    await this.eventRepository.emit('app.shutdown');
  }
}

@Module({
  imports: [...imports, ScheduleModule.forRoot()],
  controllers: [...controllers],
  providers: [...common, ...middleware, { provide: IWorker, useValue: AppWorker.API }],
})
export class ApiModule extends BaseModule {}

@Module({
  imports: [...imports],
  providers: [...common, { provide: IWorker, useValue: AppWorker.MICROSERVICES }, SchedulerRegistry],
})
export class MicroservicesModule extends BaseModule {}
