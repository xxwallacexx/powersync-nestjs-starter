import { BullModule } from '@nestjs/bullmq';
import {
  Inject,
  Module,
  OnModuleDestroy,
  OnModuleInit,
  ValidationPipe,
} from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { ClsModule } from 'nestjs-cls';
import { IWorker } from 'src/constants';
import { controllers } from 'src/controllers';
import { AppWorker } from 'src/enum';
import { ErrorInterceptor } from 'src/middlewares/error.interceptor';
import { GlobalExceptionFilter } from 'src/middlewares/global-exception.filter';
import { LoggingInterceptor } from 'src/middlewares/logging.interceptor';
import { repositories } from 'src/repositories';
import { ConfigRepository } from 'src/repositories/config.repository';
import { LoggingRepository } from 'src/repositories/logging.repository';
import { services } from 'src/services';
import { EventRepository } from './repositories/event.repository';

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
const { bull, cls } = configRepository.getEnv();

const imports = [
  BullModule.forRoot(bull.config),
  BullModule.registerQueue(...bull.queues),
  ClsModule.forRoot(cls.config),
];

class BaseModule implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(IWorker) private worker: AppWorker,
    logger: LoggingRepository,
    private eventRepository: EventRepository,
  ) {
    logger.setAppName(this.worker);
  }

  async onModuleInit() {
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
  providers: [
    ...common,
    ...middleware,
    { provide: IWorker, useValue: AppWorker.API },
  ],
})
export class ApiModule extends BaseModule {}

@Module({
  imports: [...imports],
  providers: [
    ...common,
    { provide: IWorker, useValue: AppWorker.MICROSERVICES },
    SchedulerRegistry,
  ],
})
export class MicroservicesModule extends BaseModule {}
