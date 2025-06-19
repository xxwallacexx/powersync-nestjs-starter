import { Provider, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ClassConstructor } from 'class-transformer';
import { ConfigRepository } from 'src/repositories/config.repository';
import { EventRepository } from 'src/repositories/event.repository';

import { LoggingRepository } from 'src/repositories/logging.repository';
import { BaseService } from 'src/services/base.service';
import { RepositoryInterface } from 'src/types';
import { assert, Mock, Mocked, vitest } from 'vitest';
import { newConfigRepositoryMock } from './repositories/config.repository.mock';

export type ControllerContext = {
  getHttpServer: () => any;
  close: () => Promise<void>;
};

type As<T> = T extends RepositoryInterface<infer U> ? U : never;

export const controllerSetup = async (controller: ClassConstructor<unknown>, providers: Provider[]) => {
  const moduleRef = await Test.createTestingModule({
    controllers: [controller],
    providers: [
      { provide: APP_PIPE, useValue: new ValidationPipe({ transform: true, whitelist: true }) },
      { provide: LoggingRepository, useValue: LoggingRepository.create() },
      ...providers,
    ],
  }).compile();
  const app = moduleRef.createNestApplication();
  await app.init();

  return {
    getHttpServer: () => app.getHttpServer(),
    close: async () => {
      await app.close();
    },
  };
};

export type AutoMocked<T> = Mocked<T> & { resetAllMocks: () => void };

const mockFn = (label: string, { strict }: { strict: boolean }) => {
  const message = `Called a mock function without a mock implementation (${label})`;
  return vitest.fn(() => {
    {
      if (strict) {
        assert.fail(message);
      } else {
        // console.warn(message);
      }
    }
  });
};

export const mockBaseService = <T extends BaseService>(service: ClassConstructor<T>) => {
  return automock(service, { args: [{ setContext: () => {} }], strict: false });
};

export const automock = <T>(
  Dependency: ClassConstructor<T>,
  options?: {
    args?: ConstructorParameters<ClassConstructor<T>>;
    strict?: boolean;
  },
): AutoMocked<T> => {
  const mock: Record<string, unknown> = {};
  const strict = options?.strict ?? true;
  const args = options?.args ?? [];

  const mocks: Mock[] = [];

  const instance = new Dependency(...args);
  for (const property of Object.getOwnPropertyNames(Dependency.prototype)) {
    if (property === 'constructor') {
      continue;
    }

    try {
      const label = `${Dependency.name}.${property}`;

      const target = instance[property as keyof T];
      if (typeof target === 'function') {
        const mockImplementation = mockFn(label, { strict });
        mock[property] = mockImplementation;
        mocks.push(mockImplementation);
        continue;
      }
    } catch {
      // noop
    }
  }

  const result = mock as AutoMocked<T>;
  result.resetAllMocks = () => {
    for (const mock of mocks) {
      mock.mockReset();
    }
  };

  return result;
};

export type ServiceMocks = {
  [K in keyof ServiceOverrides]: Mocked<RepositoryInterface<ServiceOverrides[K]>>;
};
type BaseServiceArgs = ConstructorParameters<typeof BaseService>;
type Constructor<Type, Args extends Array<any>> = {
  new (...deps: Args): Type;
};

export const newTestService = <T extends BaseService>(
  Service: Constructor<T, BaseServiceArgs>,
  overrides: Partial<ServiceOverrides> = {},
) => {
  const loggerMock = { setContext: () => {} };
  const configMock = { getEnv: () => ({}) };

  const mocks: ServiceMocks = {
    // eslint-disable-next-line no-sparse-arrays
    logger: automock(LoggingRepository, { args: [, configMock], strict: false }),
    event: automock(EventRepository, { args: [, , loggerMock], strict: false }),
    config: newConfigRepositoryMock(),
  };
  const sut = new Service(
    overrides.logger || (mocks.logger as As<LoggingRepository>),
    overrides.config || (mocks.config as As<ConfigRepository>),
    overrides.event || (mocks.event as As<EventRepository>),
  );
  return { sut, mocks };
};

export type ServiceOverrides = {
  config: ConfigRepository;
  event: EventRepository;
  logger: LoggingRepository;
};
