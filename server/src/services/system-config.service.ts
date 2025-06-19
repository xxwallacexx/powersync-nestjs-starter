import { Injectable } from '@nestjs/common';
import { defaults } from 'src/config';
import { OnEvent } from 'src/decorators';
import { mapConfig, SystemConfigDto } from 'src/dtos/system-config.dto';
import { BootstrapEventPriority } from 'src/enum';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class SystemConfigService extends BaseService {
  @OnEvent({
    name: 'app.bootstrap',
    priority: BootstrapEventPriority.SystemConfig,
  })
  async onBootstrap() {
    await this.eventRepository.emit('config.init');
  }

  getDefaults(): SystemConfigDto {
    return mapConfig(defaults);
  }

  @OnEvent({ name: 'config.init' })
  onConfigInit() {
    const { logLevel: envLevel } = this.configRepository.getEnv();
    this.logger.setLogLevel(envLevel);
    this.logger.log(`LogLevel=${envLevel}  (set via system config)`);
  }
}
