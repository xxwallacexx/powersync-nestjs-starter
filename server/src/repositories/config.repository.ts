import { RegisterQueueOptions } from '@nestjs/bullmq';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { QueueOptions } from 'bullmq';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Request, Response } from 'express';
import { RedisOptions } from 'ioredis';
import { CLS_ID, ClsModuleOptions, ClsService } from 'nestjs-cls';
import { IWorker } from 'src/constants';
import { EnvDto } from 'src/dtos/env.dto';
import { AppEnvironment, AppHeader, AppWorker, LogLevel, QueueName } from 'src/enum';
import { asSet, setDifference } from 'src/utils/set';

export interface EnvData {
  host?: string;
  port: number;
  environment?: AppEnvironment;
  configFile?: string;
  workers: AppWorker[];
  redis: RedisOptions;
  bull: {
    config: QueueOptions;
    queues: RegisterQueueOptions[];
  };

  cls: {
    config: ClsModuleOptions;
  };
  logLevel: LogLevel;
  privateKeyPath?: string;
}

const WORKER_TYPES = new Set(Object.values(AppWorker));

const getEnv = (): EnvData => {
  const dto = plainToInstance(EnvDto, process.env);
  const errors = validateSync(dto);
  if (errors.length > 0) {
    throw new Error(
      `Invalid environment variables: ${errors.map((error) => `${error.property}=${error.value}`).join(', ')}`,
    );
  }

  const includedWorkers = asSet(dto.WORKERS_INCLUDE, [AppWorker.API, AppWorker.MICROSERVICES]);
  const excludedWorkers = asSet(dto.WORKERS_EXCLUDE, []);
  const workers = [...setDifference(includedWorkers, excludedWorkers)];
  for (const worker of workers) {
    if (!WORKER_TYPES.has(worker)) {
      throw new Error(`Invalid worker(s) found: ${workers.join(',')}`);
    }
  }

  const {
    HOST,
    PORT,
    ENV,
    CONFIG_FILE,
    REDIS_HOSTNAME,
    REDIS_PORT,
    REDIS_DBINDEX,
    REDIS_USERNAME,
    REDIS_PASSWORD,
    REDIS_SOCKET,
    LOG_LEVEL,
    PRIVATE_KEY_PATH,
  } = dto;

  let redisConfig = {
    host: REDIS_HOSTNAME || 'redis',
    port: REDIS_PORT || 6379,
    db: REDIS_DBINDEX || 0,
    username: REDIS_USERNAME || undefined,
    password: REDIS_PASSWORD || undefined,
    path: REDIS_SOCKET || undefined,
  };

  const bull = {
    config: {
      prefix: 'bull',
      connection: { ...redisConfig },
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: false,
      },
    },
    queues: Object.values(QueueName).map((name) => ({ name })),
  };

  const cls = {
    config: {
      middleware: {
        mount: true,
        generateId: true,
        setup: (cls: ClsService, req: Request, res: Response) => {
          const headerValues = req.headers[AppHeader.CID];
          const headerValue = Array.isArray(headerValues) ? headerValues[0] : headerValues;
          const cid = headerValue || cls.get(CLS_ID);
          cls.set(CLS_ID, cid);
          res.header(AppHeader.CID, cid);
        },
      },
    },
  };

  return {
    host: HOST,
    port: PORT || 4040,
    environment: ENV,
    configFile: CONFIG_FILE,
    workers,
    redis: redisConfig,
    bull,
    cls,
    logLevel: LOG_LEVEL ?? LogLevel.VERBOSE,
    privateKeyPath: PRIVATE_KEY_PATH,
  };
};

let cached: EnvData | undefined;

@Injectable()
export class ConfigRepository {
  constructor(@Inject(IWorker) @Optional() private worker?: AppWorker) {}

  getEnv() {
    if (!cached) {
      cached = getEnv();
    }
    return cached;
  }

  getWorker() {
    return this.worker;
  }
}

export const clearEnvCache = () => {
  cached = undefined;
};
