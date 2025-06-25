import { Injectable } from '@nestjs/common';
import { OnEvent } from 'src/decorators';
import { BootstrapEventPriority } from 'src/enum';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class DatabaseService extends BaseService {
  @OnEvent({ name: 'app.bootstrap', priority: BootstrapEventPriority.DatabaseService })
  async onBootstrap() {
    const version = await this.databaseRepository.getDBVersion();
    this.logger.log(`Mongodb version: ${version}`);
  }
}
