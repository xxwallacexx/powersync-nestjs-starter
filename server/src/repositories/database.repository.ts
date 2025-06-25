import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { LoggingRepository } from 'src/repositories/logging.repository';

@Injectable()
export class DatabaseRepository {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private logger: LoggingRepository,
  ) {
    this.logger.setContext(DatabaseRepository.name);
  }

  async getDBVersion(): Promise<string> {
    const admin = this.connection.db?.admin();
    const info = await admin?.command({ buildInfo: 1 });
    return info?.version;
  }
}
