import { ApiService } from 'src/services/api.service';
import { JwksService } from 'src/services/jwks.service';
import { SystemConfigService } from 'src/services/system-config.service';

export const services = [ApiService, JwksService, SystemConfigService];
