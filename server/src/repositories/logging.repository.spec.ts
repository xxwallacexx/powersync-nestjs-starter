import { ClsService } from 'nestjs-cls';
import { AppWorker } from 'src/enum';
import { LoggingRepository, MyConsoleLogger } from 'src/repositories/logging.repository';

import { Mocked, vitest } from 'vitest';

describe(LoggingRepository.name, () => {
  let sut: LoggingRepository;

  let clsMock: Mocked<ClsService>;

  beforeEach(() => {
    clsMock = {
      getId: vitest.fn(),
    } as unknown as Mocked<ClsService>;
  });

  describe(MyConsoleLogger.name, () => {
    describe('formatContext', () => {
      it('should use colors', () => {
        sut = new LoggingRepository(clsMock);
        sut.setAppName(AppWorker.API);

        const logger = new MyConsoleLogger(clsMock, { color: true });

        expect(logger.formatContext('context')).toBe('\u001B[33m[Api:context]\u001B[39m ');
      });

      it('should not use colors when color is false', () => {
        sut = new LoggingRepository(clsMock);
        sut.setAppName(AppWorker.API);

        const logger = new MyConsoleLogger(clsMock, { color: false });

        expect(logger.formatContext('context')).toBe('[Api:context] ');
      });
    });
  });
});
