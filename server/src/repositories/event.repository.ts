import { Injectable } from '@nestjs/common';
import { SystemConfig } from 'src/config';
import { ModuleRef, Reflector } from '@nestjs/core';
import { ConfigRepository } from './config.repository';
import { LoggingRepository } from './logging.repository';
import { ClassConstructor } from 'class-transformer';
import _ from 'lodash';
import { AppWorker, MetadataKey } from 'src/enum';
import { EventConfig } from 'src/decorators';

export type EventItem<T extends EmitEvent> = {
  event: T;
  handler: EmitHandler;
};

type EmitHandlers = Partial<{ [T in EmitEvent]: Array<EventItem<T>> }>;

type Item<T extends EmitEvent> = {
  event: T;
  handler: EmitHandler;
  priority: number;
  label: string;
};

type EventMap = {
  'app.bootstrap': [];
  'app.shutdown': [];

  'config.init': [{ newConfig: SystemConfig }];
  'config.update': [
    {
      newConfig: SystemConfig;
      oldConfig: SystemConfig;
    },
  ];
  'config.validate': [{ newConfig: SystemConfig; oldConfig: SystemConfig }];
};

export type ArgsOf<T extends EmitEvent> = EventMap[T];
export type EmitEvent = keyof EventMap;
export type EmitHandler = () => Promise<void> | void;

@Injectable()
export class EventRepository {
  private emitHandlers: EmitHandlers = {};
  constructor(
    private moduleRef: ModuleRef,
    private configRepository: ConfigRepository,
    private logger: LoggingRepository,
  ) {
    this.logger.setContext(EventRepository.name);
  }

  setup({ services }: { services: ClassConstructor<unknown>[] }) {
    const reflector = this.moduleRef.get(Reflector, { strict: false });
    const items: Item<EmitEvent>[] = [];
    const worker = this.configRepository.getWorker();
    if (!worker) {
      throw new Error('Unable to determine worker type');
    }

    // discovery
    for (const Service of services) {
      const instance = this.moduleRef.get<any>(Service);
      const ctx = Object.getPrototypeOf(instance);
      for (const property of Object.getOwnPropertyNames(ctx)) {
        const descriptor = Object.getOwnPropertyDescriptor(ctx, property);
        if (!descriptor || descriptor.get || descriptor.set) {
          continue;
        }

        const handler = instance[property];
        if (typeof handler !== 'function') {
          continue;
        }

        const event = reflector.get<EventConfig>(
          MetadataKey.EVENT_CONFIG,
          handler,
        );
        if (!event) {
          continue;
        }

        const workers = event.workers ?? Object.values(AppWorker);
        if (!workers.includes(worker)) {
          continue;
        }

        items.push({
          event: event.name,
          priority: event.priority || 0,
          handler: handler.bind(instance),
          label: `${Service.name}.${handler.name}`,
        });
      }
    }

    const handlers = _.orderBy(items, ['priority'], ['asc']);

    // register by priority
    for (const handler of handlers) {
      this.addHandler(handler);
    }
  }

  private addHandler<T extends EmitEvent>(item: Item<T>): void {
    const event = item.event;

    if (!this.emitHandlers[event]) {
      this.emitHandlers[event] = [];
    }

    this.emitHandlers[event].push(item);
  }

  private async onEvent<T extends EmitEvent>(event: {
    name: T;
  }): Promise<void> {
    const handlers = this.emitHandlers[event.name] || [];
    for (const { handler } of handlers) {
      // exclude handlers that ignore server events

      await handler();
    }
  }

  emit<T extends EmitEvent>(event: T): Promise<void> {
    return this.onEvent({ name: event });
  }
}
