import { DatabaseRepository } from 'src/repositories/database.repository';
import { RepositoryInterface } from 'src/types';
import { Mocked, vitest } from 'vitest';

export const newDatabaseRepositoryMock = (): Mocked<RepositoryInterface<DatabaseRepository>> => {
  return {
    getDBVersion: vitest.fn(),
  };
};
