import { AppWorker, LogLevel } from 'src/enum';
import { ConfigRepository, EnvData } from 'src/repositories/config.repository';
import { RepositoryInterface } from 'src/types';
import { Mocked, vitest } from 'vitest';

const envData: EnvData = {
  port: 4040,

  bull: {
    config: {
      connection: {},
      prefix: 'bull',
    },
    queues: [{ name: 'queue-1' }],
  },

  cls: {
    config: {},
  },

  redis: {
    host: 'redis',
    port: 6379,
    db: 0,
  },

  workers: [AppWorker.API, AppWorker.MICROSERVICES],
  logLevel: LogLevel.VERBOSE,
  privateKeyPath: '../docker/secrets/private_key.pem',
};

export const mockEnvData = (config: Partial<EnvData>) => ({ ...envData, ...config });
export const newConfigRepositoryMock = (): Mocked<RepositoryInterface<ConfigRepository>> => {
  return {
    getEnv: vitest.fn().mockReturnValue(mockEnvData({})),
    getWorker: vitest.fn().mockReturnValue(AppWorker.API),
  };
};
